import importlib.util
from pathlib import Path
import hashlib
import json
import shutil
import subprocess
import tempfile
import contextlib
import io
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('release_gate', Path(__file__).resolve().parents[1] / 'scripts/release-binaries.py')
gate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gate)
assert gate.reports_nonfree('This version is not legally redistributable.', 'configuration: --disable-nonfree')
assert gate.reports_nonfree('nonfree parts compiled in', 'configuration: --enable-gpl --enable-nonfree')
assert not gate.reports_nonfree('GNU Lesser General Public License', 'configuration: --disable-gpl --disable-nonfree')
print('Redistributability flag parser: enable rejected, disable not misclassified; human review still mandatory')

root = Path(__file__).resolve().parents[1]
original = root / 'vendor/mac/ffmpeg'
packaged = root / 'dist/mac-arm64/Hexbloop.app/Contents/Resources/vendor/mac/ffmpeg'
if original.exists() and packaged.exists():
    before = [hashlib.sha256(p.read_bytes()).hexdigest() for p in (original, packaged)]
    gate.verify_signed_binary(packaged, original)
    assert before[0] != before[1], 'fixture must exercise different signed bytes'
    assert gate.signing_payload(original) == gate.signing_payload(packaged)
    with tempfile.TemporaryDirectory(prefix='hex-payload-test-') as temp:
        changed = Path(temp) / 'changed'
        shutil.copyfile(original, changed)
        data = bytearray(changed.read_bytes())
        data[16384] ^= 1
        changed.write_bytes(data)
        assert gate.signing_payload(changed) != gate.signing_payload(original), 'code tampering must fail'
    assert before == [hashlib.sha256(p.read_bytes()).hexdigest() for p in (original, packaged)]
    for signature in ('Authority=Developer ID Application: Example\nTeamIdentifier=OTHER\nflags=0x10000(runtime)\n',
                      'Signature=adhoc\nTeamIdentifier=V433H655PN\nflags=0x10000(runtime)\n'):
        with patch.object(gate, 'run', return_value=''), patch.object(gate.subprocess, 'run',
                return_value=subprocess.CompletedProcess([], 0, '', signature)):
            try:
                gate.verify_signed_binary(packaged, original)
            except ValueError:
                pass
            else:
                raise AssertionError('wrong-team / ad-hoc signatures must fail')
    print('Existing signed/unsigned pair matches payload; code tampering, wrong team and ad-hoc signatures rejected; originals unchanged')
else:
    print('SKIP: existing signed-pair integration fixture absent')

# A matching binary hash cannot authorize redistribution. A changed raw source
# must fail even if a signed payload comparison would otherwise succeed.
with tempfile.TemporaryDirectory(prefix='hex-source-test-') as temp:
    vendor = Path(temp)
    record = dict(source='test', version='6.1.6', buildFlags='--disable-nonfree',
                  dependencies=['system'], license='LGPL', notices=['test'], obligations=['test'],
                  reviewer='', reviewDate='', redistributionReview='pending-human-review')
    for name in ('ffmpeg', 'ffprobe'):
        binary = vendor / name
        binary.write_bytes(b'test source')
        binary.chmod(0o755)
    record['sha256'] = hashlib.sha256(b'test source').hexdigest()
    (vendor / 'provenance.json').write_text(json.dumps(dict(ffmpeg=record, ffprobe=record)))
    with contextlib.redirect_stdout(io.StringIO()), patch.object(gate, 'inspect_macho', return_value=True), patch.object(gate, 'run',
            return_value='6.1.6 LGPL --disable-nonfree'):
        gate.failures.clear()
        gate.vendor_gate(vendor)
        assert any('no recorded human' in failure for failure in gate.failures)
        (vendor / 'ffmpeg').write_bytes(b'changed source')
        gate.failures.clear()
        gate.vendor_gate(vendor)
        assert any('SHA-256 does not match' in failure for failure in gate.failures)
gate.failures.clear()
print('Pre-sign raw pins and pending human approval remain fail-closed')
