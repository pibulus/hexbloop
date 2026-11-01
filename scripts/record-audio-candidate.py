#!/usr/bin/env python3
"""Record exact local candidate bytes, not legal approval or release readiness."""
import hashlib
import importlib.util
import json
from pathlib import Path
import re
import subprocess
import sys

root = Path(sys.argv[1]).resolve()
spec = importlib.util.spec_from_file_location('release_gate', Path(__file__).with_name('release-binaries.py'))
gate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gate)


def sha(file):
    return hashlib.sha256(file.read_bytes()).hexdigest()


def command(*args):
    result = subprocess.run(args, text=True, capture_output=True, check=True)
    return result.stdout + result.stderr


sources = [
    {'project': 'FFmpeg', 'version': '6.1.6', 'url': 'https://ffmpeg.org/releases/ffmpeg-6.1.6.tar.xz',
     'sha256': sha(root / 'ffmpeg-6.1.6.tar.xz'),
     'signatureFingerprint': 'FCF986EA15E6E293A5644F10B4322F04D67658D8', 'license': 'LGPL-2.1-or-later'},
    {'project': 'LAME', 'version': '3.100',
     'url': 'https://sourceforge.net/projects/lame/files/lame/3.100/lame-3.100.tar.gz/download',
     'sha256': sha(root / 'lame-3.100.tar.gz'), 'license': 'LGPL-2.0-or-later',
     'verification': 'HTTPS source download + pinned SHA-256; no upstream signature verified'}
]
manifest = {}
for name in ('ffmpeg', 'ffprobe'):
    file = root / 'audio-prefix' / 'bin' / name
    gate.inspect_macho(file)
    version = command(str(file), '-version')
    license_text = command(str(file), '-L')
    if gate.reports_nonfree(license_text, version):
        raise SystemExit('Nonfree candidate refused')
    flags = re.search(r'^\s*configuration: (.+)$', version, re.M).group(1)
    load = command('otool', '-l', str(file))
    linked = command('otool', '-L', str(file))
    manifest[name] = {
        'sha256': sha(file), 'source': sources, 'version': '6.1.6', 'buildFlags': flags,
        'architecture': command('lipo', '-archs', str(file)).strip(),
        'macosMinimums': re.findall(r'^\s*minos (\S+)', load, re.M),
        'dependencies': [line.strip().split(' (')[0] for line in linked.splitlines()[1:]],
        'license': 'FFmpeg reports LGPL v2.1-or-later; LAME static linkage requires review',
        'notices': ['FFmpeg LICENSE.md', 'FFmpeg COPYING.LGPLv2.1', 'LAME COPYING',
                    'LAME source-file copyright notices', 'System zlib supplied by macOS'],
        'obligations': ['Human review of LGPL static-link/relink obligations and patent considerations',
                        'Retain exact source archives, flags, toolchain versions and relink/build inputs',
                        'Ship required notices and corresponding source/relink materials with paid distribution',
                        'Do not impose license terms incompatible with LGPL; review app/site notices'],
        'redistributionReview': 'pending-human-review', 'reviewer': '', 'reviewDate': '',
        'cleanMontereyTest': 'BLOCKED: no clean macOS 12 machine tested',
        'binaryLicenseOutput': license_text
    }
if gate.failures:
    raise SystemExit(f'Native candidate rejected: {len(gate.failures)} failures')
target = root / 'audio-prefix' / 'bin' / 'provenance.json'
target.write_text(json.dumps(manifest, indent=2) + '\n')
(root / 'candidate-provenance.json').write_text(target.read_text())
print(target)
print('Technical native inspection passed; redistributionReview remains pending-human-review')
