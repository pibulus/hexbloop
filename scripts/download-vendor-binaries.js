#!/usr/bin/env node
// No downloads or npm mutations during packaging. A binary enters the release
// only after its exact bytes and redistribution review are recorded locally.
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// electron-builder's native rebuild can leave a Homebrew LC_RPATH inside the
// bundled canvas dylibs. It is vestigial (they load via @loader_path) but it
// fails the clean-Mac gate, so strip absolute rpaths before checking.
function normalizeNativePaths(directory) {
    if (!fs.existsSync(directory)) return;
    for (const name of fs.readdirSync(directory)) {
        const file = path.join(directory, name);
        if (!fs.statSync(file).isFile()) continue;
        const load = spawnSync('otool', ['-l', file], { encoding: 'utf8' });
        if (load.status !== 0) continue;
        const rpaths = [...load.stdout.matchAll(/LC_RPATH[\s\S]*?path (.+?) \(offset/g)]
            .map(match => match[1]);
        for (const rpath of rpaths) {
            if (rpath.startsWith('@')) continue;
            console.log(`Stripping absolute rpath ${rpath} from ${name}`);
            spawnSync('install_name_tool', ['-delete_rpath', rpath, file]);
        }
    }
}

normalizeNativePaths(path.join(__dirname, '..', 'node_modules', 'canvas', 'build', 'Release'));

if (process.platform !== 'darwin' || process.arch !== 'arm64') {
    console.error('Commercial macOS packaging requires an Apple Silicon build host.');
    process.exit(1);
}
const check = spawnSync('python3', [path.join(__dirname, 'release-binaries.py'),
    path.join(__dirname, '..', 'vendor', 'mac'),
    path.join(__dirname, '..', 'node_modules', 'canvas', 'build', 'Release')],
{ stdio: 'inherit' });
process.exit(check.status === null ? 1 : check.status);
