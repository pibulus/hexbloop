const { execFileSync } = require('child_process');
const path = require('path');

module.exports = async function stapleRelease(context) {
    const dmgs = context.artifactPaths.filter(file => file.endsWith('.dmg'));
    if (dmgs.length !== 1 || path.basename(dmgs[0]) !== `Hexbloop-${require('../package.json').version}-arm64.dmg`) {
        throw new Error('Expected exactly the pinned arm64 Hexbloop DMG');
    }
    const dmg = dmgs[0];
    execFileSync('xcrun', ['notarytool', 'submit', dmg, '--keychain-profile', 'AC_PASSWORD', '--wait'], { stdio: 'inherit' });
    execFileSync('xcrun', ['stapler', 'staple', dmg], { stdio: 'inherit' });
    execFileSync('xcrun', ['stapler', 'validate', dmg], { stdio: 'inherit' });
};
