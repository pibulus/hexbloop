#!/usr/bin/env node
// No downloads or npm mutations during packaging. A binary enters the release
// only after its exact bytes and redistribution review are recorded locally.
const { spawnSync } = require('child_process');
const path = require('path');

if (process.platform !== 'darwin' || process.arch !== 'arm64') {
    console.error('Commercial macOS packaging requires an Apple Silicon build host.');
    process.exit(1);
}
const check = spawnSync('python3', [path.join(__dirname, 'release-binaries.py'),
    path.join(__dirname, '..', 'vendor', 'mac'),
    path.join(__dirname, '..', 'node_modules', 'canvas', 'build', 'Release')],
{ stdio: 'inherit' });
process.exit(check.status === null ? 1 : check.status);
