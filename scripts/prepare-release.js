// Only edit the disposable packaged copy, before electron-builder signs it.
const { execFileSync } = require('child_process');
const path = require('path');

module.exports = async function prepareRelease(context) {
    if (context.electronPlatformName !== 'darwin' || context.arch !== 3) {
        throw new Error('Only Apple Silicon releases are supported');
    }
    const resources = path.join(context.appOutDir, 'Hexbloop.app/Contents/Resources');
    const canvas = path.join(resources, 'app.asar.unpacked/node_modules/canvas/build/Release');
    const jpeg = path.join(canvas, 'libjpeg.8.3.2.dylib');
    const load = execFileSync('otool', ['-l', jpeg], { encoding: 'utf8' });
    const developmentPath = '/opt/homebrew/Cellar/jpeg-turbo/3.1.3/lib';
    const rpaths = [...load.matchAll(/cmd LC_RPATH\s+cmdsize \d+\s+path ([^ ]+)/g)].map(match => match[1]);
    if (rpaths.includes(developmentPath)) {
        execFileSync('install_name_tool', ['-delete_rpath', developmentPath, jpeg], { stdio: 'inherit' });
    }
    // Unknown external paths, wrong architectures and pending legal review all
    // remain errors. This is not a general-purpose native dependency repair.
    execFileSync('python3', [path.join(__dirname, 'release-binaries.py'),
        path.join(resources, 'vendor/mac'), canvas], { stdio: 'inherit' });
};
