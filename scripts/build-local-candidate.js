#!/usr/bin/env node
// Isolated, ad-hoc-signed application directory ONLY. Never uses the public
// vendor tree, public hooks, Developer ID credentials, DMG target or publishing.
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const { build, Platform, Arch } = require('electron-builder');

const repo = path.resolve(__dirname, '..');
const evidence = require('../docs/PHASE-A-AUDIO-CANDIDATE.json');
const source = evidence.candidateDirectory;
const destination = path.resolve(process.argv[2] || path.join(os.homedir(), 'Library/Application Support/HexbloopLocalRC', new Date().toISOString().replace(/[:.]/g, '-')));
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const run = (command, args) => execFileSync(command, args, { stdio: 'inherit' });

(async () => {
    if (process.platform !== 'darwin' || process.arch !== 'arm64') throw new Error('Native Apple Silicon host required');
    if (fs.existsSync(destination) || destination.startsWith(repo + path.sep)) throw new Error('Fresh external destination required');
    for (const name of ['ffmpeg', 'ffprobe']) {
        if (hash(path.join(source, 'audio-prefix/bin', name)) !== evidence.artifacts[name].sha256) throw new Error(`${name}: candidate hash mismatch`);
    }
    for (const entry of evidence.artifacts.ffmpeg.source) {
        const file = entry.project === 'FFmpeg' ? 'ffmpeg-6.1.6.tar.xz' : 'lame-3.100.tar.gz';
        if (hash(path.join(source, file)) !== entry.sha256) throw new Error(`${file}: source hash mismatch`);
    }
    fs.mkdirSync(destination, { recursive: true });
    const materials = path.join(destination, 'source-relink');
    fs.mkdirSync(materials);
    // No GPG home or private material: only public signature/key evidence.
    for (const name of ['ffmpeg-6.1.6.tar.xz', 'ffmpeg-6.1.6.tar.xz.asc', 'ffmpeg-devel.asc',
        'lame-3.100.tar.gz', 'verified-source', 'ffmpeg-build', 'lame-build', 'audio-prefix',
        'build-recipe-executed.sh', 'ffmpeg-configure-flags.txt', 'signature-verification.txt', 'notices']) {
        fs.cpSync(path.join(source, name), path.join(materials, name), { recursive: true });
    }
    fs.copyFileSync(path.join(repo, 'docs/PHASE-A-AUDIO-CANDIDATE.json'), path.join(materials, 'candidate-provenance.json'));
    fs.copyFileSync(path.join(repo, 'scripts/build-audio-candidate.sh'), path.join(materials, 'build-audio-candidate.sh'));
    const notice = `LOCAL TEST ONLY - NOT FOR DISTRIBUTION\n\nFFmpeg 6.1.6 reports LGPL-2.1-or-later. LAME 3.100 is statically linked;\nits COPYING contains the GNU Library GPL v2 text. Exact source-file notices\nare retained in source-relink/verified-source. See copied notices and provenance.\n\nNo human redistribution approval has been recorded. This is NOT legal clearance.\nThis private local build must not be sold, uploaded, published or used for fulfillment.\n\nSource/relink preparation:\n- Exact source archives, detached FFmpeg signature/public key and verification\n  record, build recipe, flags, complete source trees, build objects/static\n  archives and installed development libraries are retained in source-relink.\n- SHA256SUMS.json pins retained files. No reproducible-build claim is made.\n- Saved makefiles/configuration contain original absolute workspace/SDK paths.\n  They are evidence, not a proven relocatable relink kit. To rebuild, place the\n  pinned source archives/signature in a fresh absolute workspace, verify the\n  published FFmpeg signing fingerprint, and run build-audio-candidate.sh there.\n  Preserve/adjust the documented SDK and toolchain deliberately.\n- Validate a modified-source rebuild/relink before claiming the delivery kit\n  satisfies LGPL obligations. Review notices, source/relink delivery, app/EULA\n  terms, patents as applicable, and LAME/FFmpeg obligations with a human reviewer.\n\nReferences: https://ffmpeg.org/legal.html\nhttps://lame.sourceforge.io/license.txt\n`;
    fs.writeFileSync(path.join(destination, 'LOCAL-TEST-NOTICES.txt'), notice);
    const sums = {};
    function index(directory) {
        for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
            const file = path.join(directory, item.name);
            if (item.isDirectory()) index(file);
            else if (item.isFile()) sums[path.relative(materials, file)] = hash(file);
        }
    }
    index(materials);
    fs.writeFileSync(path.join(materials, 'SHA256SUMS.json'), JSON.stringify(sums, null, 2) + '\n');
    const vendor = path.join(destination, 'local-vendor');
    fs.mkdirSync(vendor);
    for (const name of ['ffmpeg', 'ffprobe']) fs.copyFileSync(path.join(materials, 'audio-prefix/bin', name), path.join(vendor, name));
    fs.writeFileSync(path.join(vendor, 'provenance.json'), JSON.stringify(evidence.artifacts, null, 2));
    const marker = 'Hexbloop LOCAL TEST - NOT FOR DISTRIBUTION';
    // A separate entry point is injected ONLY into the local build. Normal
    // main/preload/renderer and their IPC boundaries are not rewritten.
    fs.writeFileSync(path.join(destination, 'local-test-main.js'), `
const { app } = require('electron');
const fs = require('fs');
const path = require('path');
const root = ${JSON.stringify(destination)};
fs.mkdirSync(path.join(root, 'user-data'), { recursive: true });
app.setPath('userData', path.join(root, 'user-data'));
app.on('browser-window-created', (_event, win) => {
    win.webContents.on('did-finish-load', () => {
        win.setTitle(${JSON.stringify(marker)});
        win.webContents.executeJavaScript(\
            "document.title = " + JSON.stringify(${JSON.stringify(marker)}) + ";" +
            "const label = document.createElement('div'); label.id='localTestMarker';" +
            "label.textContent='LOCAL TEST - NOT FOR DISTRIBUTION';" +
            "label.style.cssText='position:fixed;top:0;left:0;right:0;z-index:99999;text-align:center;background:#f4cf8e;color:#1e1714;font:700 12px monospace;pointer-events:none';document.body.append(label);"
        ).catch(console.error);
    });
});
const pm = require('./src/menu/preferences').getPreferencesManager();
pm.whenReady().then(async () => {
    await pm.updateSettings({ui:{outputFolder:path.join(root,'output'),ambientAudio:false},processing:{renaming:false}});
    require('./main.js');
    app.whenReady().then(() => app.setName(${JSON.stringify(marker)}));
}).catch(error => { console.error(error); app.exit(1); });
`);
    const base = require('../package.json').build;
    process.env.CSC_IDENTITY_AUTO_DISCOVERY = 'false';
    const config = {
        ...base, productName: 'Hexbloop LOCAL TEST', appId: 'com.hexbloop.audio.localtest',
        directories: { output: path.join(destination, 'app') },
        electronDist: path.join(repo, 'node_modules/electron/dist'),
        npmRebuild: false,
        extraMetadata: { main: 'local-test-main.js', name: 'hexbloop-local-test', version: '1.0.0-local-test' },
        files: [...base.files, { from: destination, to: '.', filter: ['local-test-main.js'] }],
        mac: { ...base.mac, target: [{ target: 'dir', arch: ['arm64'] }], identity: '-', notarize: false,
            extraResources: [{ from: vendor, to: 'vendor/mac' },
                { from: path.join(destination, 'LOCAL-TEST-NOTICES.txt'), to: 'LOCAL-TEST-NOTICES.txt' },
                { from: path.join(materials, 'notices'), to: 'local-notices' }] },
        afterSign: null, afterAllArtifactBuild: null,
        afterPack: async context => {
            const app = path.join(context.appOutDir, 'Hexbloop LOCAL TEST.app');
            const resources = path.join(app, 'Contents/Resources');
            for (const name of ['ffmpeg', 'ffprobe']) {
                if (hash(path.join(resources, 'vendor/mac', name)) !== evidence.artifacts[name].sha256) throw new Error(`Packaged pre-sign ${name} hash mismatch`);
            }
            const jpeg = path.join(resources, 'app.asar.unpacked/node_modules/canvas/build/Release/libjpeg.8.3.2.dylib');
            const developmentPath = '/opt/homebrew/Cellar/jpeg-turbo/3.1.3/lib';
            const load = execFileSync('otool', ['-l', jpeg], { encoding: 'utf8' });
            if (load.includes('path ' + developmentPath + ' (')) run('install_name_tool', ['-delete_rpath', developmentPath, jpeg]);
        }
    };
    // An explicit config FILE avoids electron-builder merging the production
    // extraResources array back in (which would copy the old vendor binaries).
    const localHook = path.join(destination, 'local-after-pack.js');
    fs.writeFileSync(localHook, `const fs=require('fs'); const path=require('path');
const crypto=require('crypto'); const {execFileSync}=require('child_process');
const evidence=${JSON.stringify(evidence)};
const hash=${hash.toString()}; const run=${run.toString()};
module.exports=${config.afterPack.toString()};\n`);
    config.afterPack = localHook;
    const configFile = path.join(destination, 'local-builder.json');
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
    await build({ targets: Platform.MAC.createTarget('dir', Arch.arm64), publish: 'never', config: configFile });
    fs.writeFileSync(path.join(destination, 'LOCAL-ONLY.json'), JSON.stringify({ status: marker,
        redistributionReview: 'pending-human-review', source, sourceHashes: evidence.artifacts.ffmpeg.source,
        preSignBinaryHashes: Object.fromEntries(Object.entries(evidence.artifacts).map(([name, item]) => [name, item.sha256])),
        signature: 'ad-hoc ONLY; no Developer ID or notarization', publicGate: 'unchanged; must fail for this app' }, null, 2));
    console.log('LOCAL_CANDIDATE=' + destination);
})().catch(error => { console.error(error); process.exitCode = 1; });
