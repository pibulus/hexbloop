#!/usr/bin/env python3
"""Fail-closed binary provenance, architecture, deployment target and linkage gate.

Usage: release-binaries.py <vendor/mac> <canvas/Release> [app bundle]
The manifest records human-reviewed provenance; this script cannot give legal advice.
"""
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import shutil
import struct

failures = []
MIN_MACOS = (15, 0)
TEAM_ID = 'V433H655PN'
SOURCE_VENDOR = Path(__file__).resolve().parents[1] / 'vendor' / 'mac'


def signing_payload(file):
    """Compare copies, never mutate release inputs or sign anything.

    Apple's signature removal leaves __LINKEDIT vmsize dependent on signature
    allocation. Ignore ONLY that segment's virtual allocation after removal;
    all other remaining bytes (including code/load commands) must match.
    Raw source SHA-256 and strict Developer ID verification remain separate gates.
    """
    with tempfile.TemporaryDirectory(prefix='hexpayload') as temp:
        probe = Path(temp) / 'binary'
        shutil.copyfile(file, probe)
        run('codesign', '--remove-signature', str(probe))
        data = bytearray(probe.read_bytes())
    if len(data) < 32 or data[:4] != b'\xcf\xfa\xed\xfe':
        raise ValueError('expected thin little-endian 64-bit Mach-O')
    count, size = struct.unpack_from('<II', data, 16)
    end = 32 + size
    if end > len(data):
        raise ValueError('truncated load commands')
    offset = 32
    linkedit = 0
    for _ in range(count):
        if offset + 8 > end:
            raise ValueError('truncated load command')
        command, length = struct.unpack_from('<II', data, offset)
        if length < 8 or offset + length > end:
            raise ValueError('invalid load command size')
        if command == 0x1d:
            raise ValueError('signature load command remains after removal')
        if command == 0x19 and length >= 72 and data[offset+8:offset+24].rstrip(b'\0') == b'__LINKEDIT':
            _, vmsize, fileoff, filesize = struct.unpack_from('<QQQQ', data, offset+24)
            if fileoff + filesize != len(data) or vmsize < filesize:
                raise ValueError('invalid stripped __LINKEDIT extent')
            struct.pack_into('<Q', data, offset+32, 0)
            linkedit += 1
        offset += length
    if offset != end or linkedit != 1:
        raise ValueError('invalid Mach-O command table / __LINKEDIT count')
    return hashlib.sha256(data).hexdigest()


def verify_signed_binary(file, source):
    run('codesign', '--verify', '--strict', str(file))
    details = subprocess.run(['codesign', '-dvv', str(file)], text=True, capture_output=True)
    signature = details.stdout + details.stderr
    if (details.returncode or 'Authority=Developer ID Application:' not in signature or
            f'TeamIdentifier={TEAM_ID}\n' not in signature or
            not re.search(r'flags=.*\bruntime\b', signature)):
        raise ValueError('expected-team Developer ID hardened signature required')
    if signing_payload(file) != signing_payload(source):
        raise ValueError('signed payload differs from pinned pre-sign source')


def reports_nonfree(license_text, version_text):
    # --disable-nonfree is a safe configure choice, not evidence of nonfree code.
    return ('not legally redistributable' in license_text.lower() or
            re.search(r'(?<![\w-])--enable-nonfree(?:\s|$)', version_text.lower()) is not None)


def fail(message):
    failures.append(message)
    print('FAIL:', message)


def run(*args):
    result = subprocess.run(args, text=True, capture_output=True)
    if result.returncode:
        raise RuntimeError(f"{args[0]} failed on {args[-1]}: {result.stderr.strip()}")
    return result.stdout


def inspect_macho(file):
    try:
        kind = run('file', '-b', str(file))
        if 'Mach-O' not in kind:
            return False
        if 'arm64' not in kind:
            fail(f'{file}: arm64 slice missing or x86-only: {kind.strip()}')
        architectures = run('lipo', '-archs', str(file)).split()
        if 'arm64' not in architectures or any(arch != 'arm64' for arch in architectures):
            fail(f'{file}: expected native arm64 only, got {architectures}')
        # Apple's otool-classic can split paths containing " (Renderer)" at a
        # parenthesis, even when subprocess receives a single argv element.
        # Inspect an exact temporary copy instead (the original is read-only in a DMG).
        with tempfile.TemporaryDirectory(prefix='hexmacho') as temp:
            probe = Path(temp) / 'binary'
            shutil.copyfile(file, probe)
            load = run('otool', '-l', str(probe))
            dependencies = run('otool', '-L', str(probe))
        # otool -l lists both LC_BUILD_VERSION and older LC_VERSION_MIN_MACOSX.
        versions = re.findall(
            r'cmd LC_BUILD_VERSION\s+cmdsize \d+\s+platform (?:MACOS|1)\s+minos (\d+\.\d+(?:\.\d+)?)',
            load,
        )
        versions += re.findall(
            r'cmd LC_VERSION_MIN_MACOSX\s+cmdsize \d+\s+version (\d+\.\d+(?:\.\d+)?)',
            load,
        )
        if not versions:
            fail(f'{file}: no verifiable macOS minimum load command')
        for version in versions:
            if tuple(map(int, version.split('.')[:2])) > MIN_MACOS:
                fail(f'{file}: requires macOS {version}, target is 15.0')
        for line in dependencies.splitlines()[1:]:
            dep = line.strip().split(' (', 1)[0]
            if dep.startswith('./') and (file.parent / dep).exists():
                continue
            if dep.startswith(('/System/Library/', '/usr/lib/', '@rpath/', '@loader_path/', '@executable_path/')):
                continue
            fail(f'{file}: external/absolute dependency {dep}')
        for rpath in re.findall(r'cmd LC_RPATH\s+cmdsize \d+\s+path ([^ ]+)', load):
            if not rpath.startswith(('@loader_path/', '@executable_path/', '@rpath/')):
                fail(f'{file}: external runtime search path {rpath}')
        return True
    except (RuntimeError, OSError) as error:
        fail(str(error))
        return False


def walk_macho(root):
    if not root.is_dir():
        fail(f'{root}: missing native dependency directory')
        return
    found = 0
    for base, dirs, files in os.walk(root, followlinks=False):
        dirs[:] = [d for d in dirs if not (Path(base) / d).is_symlink()]
        for name in files:
            candidate = Path(base) / name
            if candidate.is_symlink():
                continue
            if inspect_macho(candidate):
                found += 1
    if not found:
        fail(f'{root}: no Mach-O files inspected')
    else:
        print(f'Inspected {found} Mach-O files in {root}')


def vendor_gate(vendor, source=None):
    manifest_path = (source or vendor) / 'provenance.json'
    try:
        manifest = json.loads(manifest_path.read_text())
    except (OSError, ValueError) as error:
        fail(f'{manifest_path}: missing/invalid provenance manifest ({error})')
        manifest = {}
    if source:
        try:
            if (vendor / 'provenance.json').read_bytes() != manifest_path.read_bytes():
                fail(f'{vendor}: packaged provenance differs from pre-sign source')
        except OSError as error:
            fail(str(error))
    for name in ('ffmpeg', 'ffprobe'):
        file = vendor / name
        record = manifest.get(name, {})
        if not file.is_file() or not os.access(file, os.X_OK):
            fail(f'{file}: missing or not executable')
            continue
        if not inspect_macho(file):
            fail(f'{file}: not a Mach-O binary')
        digest = hashlib.sha256(file.read_bytes()).hexdigest()
        if source:
            try:
                verify_signed_binary(file, source / name)
                print(f'Signed SHA-256: {digest}  {file}')
            except (RuntimeError, OSError, ValueError) as error:
                fail(f'{file}: {error}')
        elif not re.fullmatch('[0-9a-f]{64}', record.get('sha256', '')) or digest != record['sha256']:
            fail(f'{file}: SHA-256 does not match pinned provenance')
        for key in ('source', 'version', 'buildFlags', 'dependencies', 'license', 'notices', 'obligations', 'reviewer', 'reviewDate'):
            if not record.get(key):
                fail(f'{file}: missing provenance field {key}')
        if record.get('redistributionReview') != 'approved':
            fail(f'{file}: no recorded human redistribution approval')
        try:
            license_text = run(str(file), '-L').lower()
            version_text = run(str(file), '-version').lower()
            if reports_nonfree(license_text, version_text):
                fail(f'{file}: FFmpeg reports nonfree/nonredistributable build')
            if '--enable-gpl' in version_text and 'gpl' not in str(record.get('license', '')).lower():
                fail(f'{file}: GPL build without matching license record')
            if record.get('version') and record['version'].lower() not in version_text:
                fail(f'{file}: binary version does not match manifest')
            if record.get('buildFlags') and record['buildFlags'].lower() not in version_text:
                fail(f'{file}: reported configure flags do not match manifest')
        except (OSError, RuntimeError) as error:
            fail(f'{file}: cannot verify version/license ({error})')
    if (vendor / 'sox').exists():
        fail(f'{vendor / "sox"}: optional Sox has no approved provenance; use tested FFmpeg fallback')


if __name__ == '__main__':
    if len(sys.argv) not in (3, 4):
        sys.exit('usage: release-binaries.py <vendor/mac> <canvas/Release> [app bundle]')
    if len(sys.argv) == 4:
        # Never substitute a signed-output hash for the pinned source hash.
        vendor_gate(SOURCE_VENDOR)
        vendor_gate(Path(sys.argv[1]), SOURCE_VENDOR)
    else:
        vendor_gate(Path(sys.argv[1]))
    walk_macho(Path(sys.argv[2]))
    if len(sys.argv) == 4:
        app = Path(sys.argv[3])
        plist = app / 'Contents' / 'Info.plist'
        try:
            minimum = run('/usr/libexec/PlistBuddy', '-c', 'Print LSMinimumSystemVersion', str(plist)).strip()
            if minimum != '15.0':
                fail(f'{plist}: LSMinimumSystemVersion is {minimum}, expected 15.0')
        except RuntimeError as error:
            fail(str(error))
        walk_macho(app / 'Contents')
    print(f'Binary release gate: {len(failures)} failure(s)')
    sys.exit(1 if failures else 0)
