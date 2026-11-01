// Test-only preloader. Never changes app/vendor/node_modules or approves release.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const directory = process.env.HEXBLOOP_AUDIO_CANDIDATE;
if (!directory || !path.isAbsolute(directory)) throw new Error('Absolute HEXBLOOP_AUDIO_CANDIDATE required');
const binaries = require('../src/binary-resolver');
for (const name of ['ffmpeg', 'ffprobe']) {
    const file = path.join(directory, name);
    fs.accessSync(file, fs.constants.X_OK);
    const architectures = execFileSync('lipo', ['-archs', file], { encoding: 'utf8' }).trim();
    if (architectures !== 'arm64') throw new Error(`Candidate ${name} must be arm64 only`);
    binaries[name].path = file;
    binaries[name].bundled = false;
}
// Match the intended no-Homebrew runtime, not the developer machine's Sox.
binaries.sox.path = null;
binaries.sox.bundled = false;
