// electron-builder calls this after signing the app, before creating the DMG.
// Fail rather than shipping an unstapled build if Apple services are unavailable.
const { execFileSync, spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

module.exports = async function notarizeRelease(context) {
    if (context.electronPlatformName !== 'darwin' || context.arch !== 3) {
        throw new Error('Only signed Apple Silicon releases are supported');
    }
    const app = path.join(context.appOutDir, 'Hexbloop.app');
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hexbloop-notary-'));
    try {
        const zip = path.join(tmp, 'Hexbloop.zip');
        execFileSync('python3', [path.join(__dirname, 'release-binaries.py'),
            path.join(app, 'Contents/Resources/vendor/mac'),
            path.join(app, 'Contents/Resources/app.asar.unpacked/node_modules/canvas/build/Release'), app], { stdio: 'inherit' });
        execFileSync('codesign', ['--verify', '--deep', '--strict', app], { stdio: 'inherit' });
        const details = spawnSync('codesign', ['-dvv', app], { encoding: 'utf8' });
        if (details.status !== 0) throw new Error('Unable to inspect app signature');
        const signature = details.stdout + details.stderr;
        if (!signature.includes('Authority=Developer ID Application') || !/flags=.*runtime/.test(signature)) {
            throw new Error('Developer ID and hardened runtime are required before notarization');
        }
        execFileSync('ditto', ['-c', '-k', '--keepParent', app, zip]);
        execFileSync('xcrun', ['notarytool', 'submit', zip, '--keychain-profile', 'AC_PASSWORD', '--wait'], { stdio: 'inherit' });
        execFileSync('xcrun', ['stapler', 'staple', app], { stdio: 'inherit' });
        execFileSync('xcrun', ['stapler', 'validate', app], { stdio: 'inherit' });
    } finally {
        fs.rmSync(tmp, { recursive: true, force: true });
    }
};
