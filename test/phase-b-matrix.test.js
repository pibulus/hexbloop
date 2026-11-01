/** Real audio across 32 stage masks × MP3/WAV/FLAC, in one owned temp tree. */
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const Module = require('module');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hexbloop-phase-b-'));
process.on('exit', () => fs.rmSync(root, { recursive: true, force: true }));
const repo = path.join(__dirname, '..');
const stubPath = path.join(root, 'electron-stub.js');
const electron = { app: { getPath: () => root } };
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
    if (request === 'electron') {
        require.cache[stubPath] = { id: stubPath, filename: stubPath, loaded: true, exports: electron };
        return stubPath;
    }
    return originalResolve.call(this, request, ...args);
};
const AudioProcessor = require('../src/audio-processor');
const { createCanvas } = require('canvas');
const { DEFAULT_SETTINGS, migrateLegacySettings, SETTINGS_VERSION } = require('../src/shared/settings-schema');
const { planProcessing, SWITCHES } = require('../src/shared/processing-plan');
const { PreferencesManager } = require('../src/menu/preferences');
const ffmpegBin = require('../src/binary-resolver').ffmpeg.path;
const ffprobeBin = 'ffprobe'; // Local test tool only; release gate still requires bundled arm64 ffprobe.

function run(binary, args) { return execFileSync(binary, args, { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 }); }
function probe(file) { return JSON.parse(run(ffprobeBin, ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', file])); }
function tags(info) {
    const merged = { ...(info.streams.find(s => s.codec_type === 'audio')?.tags || {}), ...(info.format.tags || {}) };
    return Object.fromEntries(Object.entries(merged).map(([key, value]) => [key.toLowerCase(), String(value)]));
}
function audio(info) { return info.streams.find(s => s.codec_type === 'audio'); }
function payload(file) { return run(ffmpegBin, ['-v', 'error', '-i', file, '-map', '0:a:0', '-c:a', 'copy', '-f', 'streamhash', '-hash', 'SHA256', '-']); }
function coverPixels(file) {
    return execFileSync(ffmpegBin, ['-v', 'error', '-i', file, '-map', '0:v:0',
        '-frames:v', '1', '-vcodec', 'rawvideo', '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-']);
}
function makeFixture() {
    const raw = path.join(root, 'input-48k-24bit.wav');
    if (fs.existsSync(raw)) return {
        wav: raw,
        mp3: path.join(root, 'input-48k-24bit.mp3'),
        flac: path.join(root, 'input-48k-24bit.flac')
    };
    run(ffmpegBin, ['-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=0.45',
        '-ar', '48000', '-c:a', 'pcm_s24le', '-metadata', 'artist=Orig Artist', '-metadata', 'album=Orig Album',
        '-metadata', 'title=Orig Title', '-metadata', 'track=7', '-metadata', 'genre=Original Genre',
        '-metadata', 'composer=Orig Composer', '-metadata', 'comment=Orig Comment', raw]);
    const files = { wav: raw };
    for (const [ext, codec] of [['mp3', 'libmp3lame'], ['flac', 'flac']]) {
        files[ext] = path.join(root, `input-48k-24bit.${ext}`);
        run(ffmpegBin, ['-hide_banner', '-loglevel', 'error', '-i', raw, '-c:a', codec,
            '-metadata', 'artist=Orig Artist', '-metadata', 'album=Orig Album',
            '-metadata', 'title=Orig Title', '-metadata', 'track=7',
            '-metadata', 'composer=Orig Composer', '-metadata', 'comment=Orig Comment', files[ext]]);
    }
    return files;
}

async function migrations() {
    const mapping = { mystical: [true, true, 'generated'], custom: [false, true, 'custom'],
        original: [false, false, 'generated'] };
    for (const [name, expected] of Object.entries(mapping)) {
        const dir = path.join(root, `settings-${name}`);
        fs.mkdirSync(dir);
        electron.app.getPath = () => dir;
        const file = path.join(dir, 'hexbloop-settings.json');
        fs.writeFileSync(file, JSON.stringify({ processing: { naming: name }, metadata: { artist: 'Keep Me' },
            batch: { prefix: 'untouched' }, output: { format: 'mp3' } }));
        const pm = new PreferencesManager(); await pm.whenReady();
        assert.deepStrictEqual([pm.getSetting('processing.renaming'), pm.getSetting('processing.metadata'),
            pm.getSetting('metadata.mode')], expected);
        assert.strictEqual(pm.getSetting('batch.prefix'), 'untouched');
        assert.strictEqual(pm.getSetting('metadata.artist'), 'Keep Me');
        assert.strictEqual(pm.getSetting('output.format'), 'source');
        assert.strictEqual(JSON.parse(fs.readFileSync(file)).settingsVersion, SETTINGS_VERSION);
        let notices = 0;
        pm.onChange(() => notices++);
        await pm.updateSetting('processing.metadata', !expected[1]);
        assert.strictEqual(notices, 1);
        await assert.rejects(pm.updateSetting('processing.metadata', 'bad'));
        assert.strictEqual(pm.getSetting('processing.metadata'), !expected[1]);
        assert.strictEqual(notices, 1, 'failed writes must not broadcast');
        const imported = { processing: { naming: 'custom', renaming: true }, metadata: { artist: 'Imported' } };
        await pm.importSettings({ settings: imported });
        assert.strictEqual(pm.getSetting('processing.renaming'), true, 'valid new key wins over legacy name');
        assert.strictEqual(pm.getSetting('metadata.mode'), 'custom');
        assert.strictEqual(pm.getSetting('metadata.artist'), 'Imported');
        assert.strictEqual(notices, 2);
        const backupDir = path.join(root, `backup-${name}`); fs.mkdirSync(backupDir);
        electron.app.getPath = () => backupDir;
        fs.writeFileSync(path.join(backupDir, 'hexbloop-settings.json'), '{broken');
        fs.writeFileSync(path.join(backupDir, 'hexbloop-settings.backup.json'),
            JSON.stringify({ processing: { naming: name }, batch: { prefix: 'from-backup' } }));
        const restored = new PreferencesManager(); await restored.whenReady();
        assert.strictEqual(restored.getSetting('batch.prefix'), 'from-backup');
        assert.deepStrictEqual([restored.getSetting('processing.renaming'), restored.getSetting('processing.metadata'),
            restored.getSetting('metadata.mode')], expected);
    }
    const alreadyNew = migrateLegacySettings({ settingsVersion: 2,
        processing: { renaming: false, metadata: true }, metadata: { mode: 'custom' }, output: { format: 'mp3' } });
    assert.strictEqual(alreadyNew.output.format, 'mp3');
    assert.strictEqual(alreadyNew.processing.renaming, false);
}

async function matrix() {
    electron.app.getPath = () => path.join(root, 'matrix-settings');
    const pm = new PreferencesManager(); await pm.whenReady();
    const files = makeFixture();
    let cases = 0;
    for (const ext of ['mp3', 'wav', 'flac']) {
        const input = files[ext]; const original = probe(input); const originalTags = tags(original);
        for (let mask = 0; mask < 32; mask++) {
            const settings = structuredClone(DEFAULT_SETTINGS);
            SWITCHES.forEach((key, index) => { settings.processing[key] = Boolean(mask & (1 << index)); });
            settings.artwork.resolution = 256;
            settings.artwork.useAudioFeatures = false;
            settings.output.format = 'source';
            const plan = planProcessing(settings, input);
            const dir = path.join(root, `mask-${ext}-${mask}`);
            const output = path.join(dir, `output-${mask}.${ext}`);
            assert.strictEqual(plan.noOp, mask === 0);
            if (mask !== 0) fs.mkdirSync(dir);
            const result = await AudioProcessor.processFile(input, output,
                { settings, trackNumber: settings.processing.metadata ? 2 : null });
            if (mask === 0) {
                assert(result.skipped && !fs.existsSync(dir) && !fs.existsSync(output), `mask ${mask} ${ext} no-op`);
                cases++; continue;
            }
            assert(fs.existsSync(output), `mask ${mask} ${ext}: output missing`);
            const info = probe(output); const stream = audio(info); const outTags = tags(info);
            assert.strictEqual(Number(stream.sample_rate), 48000, `mask ${mask} ${ext}: sample rate`);
            assert.strictEqual(stream.codec_name, ({ mp3: 'mp3', flac: 'flac', wav: 'pcm_s24le' })[ext],
                `mask ${mask} ${ext}: codec`);
            if (ext === 'wav') assert.strictEqual(stream.bits_per_sample, 24, `mask ${mask} WAV: bit depth`);
            if (!settings.processing.mastering && !settings.processing.compressing) {
                assert.strictEqual(payload(output), payload(input), `mask ${mask} ${ext}: audio payload changed`);
                if (ext === 'wav' && !settings.processing.metadata) {
                    assert(fs.readFileSync(output).equals(fs.readFileSync(input)),
                        `mask ${mask} WAV: copy-only audio bytes changed`);
                }
            }
            if (mask === 16) assert(fs.readFileSync(output).equals(fs.readFileSync(input)), `rename-only ${ext}: not byte identical`);
            if (!settings.processing.metadata) {
                for (const key of ['artist', 'album', 'title', 'track', 'genre', 'composer', 'comment']) {
                    if (originalTags[key]) assert.strictEqual(outTags[key], originalTags[key], `mask ${mask} ${ext}: ${key} changed`);
                }
            } else {
                assert.strictEqual(outTags.artist, 'Hexbloop', `mask ${mask} ${ext}: generated artist`);
                assert.strictEqual(outTags.track, '2', `mask ${mask} ${ext}: ordered batch track`);
            }
            const cover = info.streams.some(s => s.codec_type === 'video' && s.disposition?.attached_pic);
            const sidecar = path.join(dir, `output-${mask}_cover.png`);
            if (settings.processing.coverArt && ext === 'wav') {
                assert(fs.existsSync(sidecar) && fs.statSync(sidecar).size > 0, `mask ${mask} WAV: missing cover sidecar`);
                assert.strictEqual(result.artwork.path, sidecar, `mask ${mask} WAV: sidecar path not returned`);
            } else if (settings.processing.coverArt) assert(cover, `mask ${mask} ${ext}: missing embedded art`);
            else assert(!cover && !fs.existsSync(sidecar), `mask ${mask} ${ext}: unexpected art`);
            cases++;
        }
    }
    // Explicit codec choice is separate from the five switches.
    const settings = structuredClone(DEFAULT_SETTINGS);
    SWITCHES.forEach(key => { settings.processing[key] = false; });
    for (const format of ['mp3', 'wav', 'flac']) {
        settings.output.format = format;
        const explicit = path.join(root, `explicit.${format}`);
        await AudioProcessor.processFile(files.wav, explicit, { settings });
        assert.strictEqual(audio(probe(explicit)).codec_name,
            { mp3: 'mp3', wav: 'pcm_s24le', flac: 'flac' }[format]);
        assert.strictEqual(Number(audio(probe(explicit)).sample_rate), 48000);
        assert.strictEqual(tags(probe(explicit)).artist, 'Orig Artist');
        if (format === 'wav') assert(fs.readFileSync(explicit).equals(fs.readFileSync(files.wav)));
    }
    // Custom metadata does not rename, transcode or invent a new title.
    settings.output.format = 'source';
    settings.processing.metadata = true;
    settings.metadata.mode = 'custom';
    settings.metadata.artist = 'Chosen Artist';
    settings.metadata.album = 'Chosen Album';
    const custom = path.join(root, 'custom-tags.wav');
    await AudioProcessor.processFile(files.wav, custom, { settings });
    assert.strictEqual(tags(probe(custom)).artist, 'Chosen Artist');
    assert.strictEqual(tags(probe(custom)).album, 'Chosen Album');
    assert.strictEqual(tags(probe(custom)).title, 'Orig Title');
    assert.strictEqual(tags(probe(custom)).track, '7');
    assert.strictEqual(payload(custom), payload(files.wav));
    console.log(`Phase B matrix: ${cases} mask/format cases + 3 codec choices + custom metadata passed`);
    return files;
}

async function mainProcessPaths(files) {
    const handlers = new Map();
    electron.app.setName = () => {};
    electron.app.getName = () => 'HexbloopTest';
    electron.app.whenReady = () => new Promise(() => {}); // Never open a real window.
    electron.app.on = () => {};
    electron.ipcMain = { handle: (name, callback) => handlers.set(name, callback), on: () => {} };
    electron.shell = { showItemInFolder: () => {} };
    electron.BrowserWindow = { getAllWindows: () => [] };
    electron.Menu = { buildFromTemplate: template => ({ template }), setApplicationMenu: () => {} };
    require('../main.js');
    const { getPreferencesManager } = require('../src/menu/preferences');
    const pm = getPreferencesManager(); await pm.whenReady();
    const { MenuBuilder } = require('../src/menu/menu-builder');
    const menu = new MenuBuilder(null);
    const nativeChecks = () => menu.buildMenu().template.find(item => item.label === 'File')
        .submenu.find(item => item.label === 'Audio Processing').submenu
        .filter(item => item.type === 'checkbox').map(item => item.checked);
    const processAudio = handlers.get('process-audio');
    assert.strictEqual(typeof processAudio, 'function');
    const sender = { sender: { send() {} } };
    const noOpFolder = path.join(root, 'no-op-should-not-exist');
    const off = Object.fromEntries(SWITCHES.map(key => [key, false]));
    await pm.updateSettings({ processing: off, output: { format: 'source', sampleRate: 0 },
        ui: { outputFolder: noOpFolder }, batch: { sessionFolders: true } });
    assert.deepStrictEqual(nativeChecks(), [false, false, false, false, false]);
    const skipped = await processAudio(sender, [files.wav]);
    assert(skipped[0].skipped && !fs.existsSync(noOpFolder), 'IPC no-op created output/session folder');
    const renameFolder = path.join(root, 'rename-only-output');
    await pm.updateSettings({ processing: { ...off, renaming: true },
        ui: { outputFolder: renameFolder }, batch: { sessionFolders: false, namingScheme: 'sequential' } });
    assert.deepStrictEqual(nativeChecks(), [false, false, false, false, true]);
    const renamed = await processAudio(sender, [files.wav]);
    assert(renamed[0].success && path.basename(renamed[0].outputFile) === 'track_001.wav');
    assert(fs.readFileSync(renamed[0].outputFile).equals(fs.readFileSync(files.wav)));
    const batchFolder = path.join(root, 'numbered-batch-output');
    await pm.updateSettings({ processing: { ...off, metadata: true, renaming: true },
        ui: { outputFolder: batchFolder } });
    assert.deepStrictEqual(nativeChecks(), [false, false, false, true, true]);
    const secondFile = path.join(root, 'second-track.wav');
    fs.copyFileSync(files.wav, secondFile);
    const batch = await processAudio(sender, [files.wav, secondFile]);
    assert.deepStrictEqual(batch.map(item => path.basename(item.outputFile)), ['track_001.wav', 'track_002.wav']);
    assert.deepStrictEqual(batch.map(item => tags(probe(item.outputFile)).track), ['1', '2']);
    console.log('Main IPC/menu: no-op folder absent; rename-only bytes; batch filenames/track numbers; native checks pass');
}

async function coveredRegression() {
    electron.app.getPath = () => path.join(root, 'covered-settings');
    const files = makeFixture();
    const cover = path.join(root, 'original-cover.png');
    const canvas = createCanvas(48, 48);
    canvas.getContext('2d').fillStyle = '#703a92';
    canvas.getContext('2d').fillRect(0, 0, 48, 48);
    fs.writeFileSync(cover, canvas.toBuffer('image/png'));
    const originals = {};
    for (const format of ['mp3', 'flac']) {
        const covered = path.join(root, `covered.${format}`);
        run(ffmpegBin, ['-hide_banner', '-loglevel', 'error', '-i', files[format], '-i', cover,
            '-map', '0:a:0', '-map', '1:v:0', '-c:a', 'copy', '-c:v', 'png',
            '-disposition:v:0', 'attached_pic', covered]);
        const source = probe(covered);
        assert.strictEqual(source.streams.filter(s => s.disposition?.attached_pic).length, 1);
        originals[format] = covered;
    }
    let cases = 0;
    for (const sourceFormat of ['mp3', 'flac']) {
        for (const [target, mastering, metadata] of [
            ['source', true, false], ['source', false, true],
            [sourceFormat === 'mp3' ? 'flac' : 'mp3', false, false],
            ['wav', false, false]
        ]) {
            const settings = structuredClone(DEFAULT_SETTINGS);
            for (const key of SWITCHES) settings.processing[key] = false;
            settings.processing.mastering = mastering;
            settings.processing.metadata = metadata;
            settings.output.format = target;
            const format = target === 'source' ? sourceFormat : target;
            const output = path.join(root, `retained-${sourceFormat}-${target}-${mastering}-${metadata}.${format}`);
            await AudioProcessor.processFile(originals[sourceFormat], output, { settings });
            const info = probe(output), sourceTags = tags(probe(originals[sourceFormat])), resultTags = tags(info);
            const retainedTagsPath = path.join(root, `${path.parse(output).name}_metadata.json`);
            const retainedTags = fs.existsSync(retainedTagsPath) ? JSON.parse(fs.readFileSync(retainedTagsPath)) : {};
            for (const key of ['artist', 'album', 'title', 'track', 'composer', 'comment']) {
                if (!metadata && sourceTags[key]) assert.strictEqual(resultTags[key] || retainedTags[key], sourceTags[key],
                    `${sourceFormat} → ${target}: lost ${key}`);
            }
            const attached = info.streams.filter(s => s.disposition?.attached_pic).length;
            if (format === 'wav') {
                assert.strictEqual(attached, 0);
                const sidecar = path.join(root, `${path.parse(output).name}_cover.png`);
                assert(fs.existsSync(sidecar) && fs.statSync(sidecar).size > 0,
                    `${sourceFormat} → WAV: missing retained artwork sidecar`);
                const sidecarPixels = execFileSync(ffmpegBin, ['-v', 'error', '-i', sidecar,
                    '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']);
                assert(sidecarPixels.equals(coverPixels(originals[sourceFormat])), 'WAV sidecar image changed');
            } else {
                assert.strictEqual(attached, 1, `${sourceFormat} → ${target}: cover lost`);
                assert(coverPixels(output).equals(coverPixels(originals[sourceFormat])),
                    `${sourceFormat} → ${target}: existing artwork was replaced`);
            }
            cases++;
        }
        const settings = structuredClone(DEFAULT_SETTINGS);
        for (const key of SWITCHES) settings.processing[key] = false;
        settings.processing.coverArt = true;
        settings.artwork.useAudioFeatures = false;
        settings.artwork.resolution = 256;
        const replaced = path.join(root, `new-cover.${sourceFormat}`);
        await AudioProcessor.processFile(originals[sourceFormat], replaced, { settings });
        assert.strictEqual(probe(replaced).streams.filter(s => s.disposition?.attached_pic).length, 1);
        assert(!coverPixels(replaced).equals(coverPixels(originals[sourceFormat])),
            'Cover Art ON did not replace the old cover');
    }
    console.log(`Covered source regression: ${cases} MP3/FLAC DSP, tag and conversion paths passed`);
}

(async () => {
    if (process.env.HEXBLOOP_COVER_ONLY === '1') return coveredRegression();
    await migrations(); const files = await matrix(); await coveredRegression(); await mainProcessPaths(files);
})()
    .catch(error => { console.error(error); process.exitCode = 1; });
