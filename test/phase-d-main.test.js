const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const Module = require('module');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hexbloop-phase-d-main-'));
process.on('exit', () => fs.rmSync(root, { recursive: true, force: true }));
const handlers = new Map(), opened = [], progress = [];
const electron = {
    app: { getPath: () => path.join(root, 'userdata'), setName() {}, getName: () => 'Test',
        whenReady: () => new Promise(() => {}), on() {} },
    ipcMain: { handle: (name, callback) => handlers.set(name, callback), on() {} },
    BrowserWindow: { getAllWindows: () => [] },
    Menu: { buildFromTemplate: template => ({ template }), setApplicationMenu() {} },
    shell: { showItemInFolder: file => opened.push(file), openPath: async file => opened.push(file) }
};
const stub = path.join(root, 'electron-stub.js');
const original = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
    if (request === 'electron') {
        require.cache[stub] = { id: stub, filename: stub, loaded: true, exports: electron };
        return stub;
    }
    return original.call(this, request, ...args);
};
const AudioProcessor = require('../src/audio-processor');
AudioProcessor.processFile = async (input, output) => {
    if (input.endsWith('c.flac')) throw new Error('Decoder refused track');
    await fs.promises.copyFile(input, output, fs.constants.COPYFILE_EXCL);
    return { success: true };
};
const { getPreferencesManager } = require('../src/menu/preferences');
require('../main.js');

(async () => {
    const album = path.join(root, 'album'), empty = path.join(root, 'empty');
    fs.mkdirSync(album); fs.mkdirSync(empty);
    const a = path.join(root, 'a.wav'), b = path.join(album, 'b.mp3'), c = path.join(album, 'c.flac');
    for (const file of [a, b, c]) fs.writeFileSync(file, 'tiny audio');
    fs.writeFileSync(path.join(album, 'notes.txt'), 'not audio');
    fs.symlinkSync(a, path.join(album, 'symlink.wav'));
    const exports = path.join(album, 'exports');
    fs.mkdirSync(exports);
    fs.writeFileSync(path.join(exports, 'prior-export.wav'), 'previous output');
    fs.mkdirSync(path.join(album, '.hidden'));
    fs.writeFileSync(path.join(album, '.hidden', 'cache.wav'), 'hidden audio');
    const pm = getPreferencesManager(); await pm.whenReady();
    await pm.updateSettings({ processing: { mastering: false, compressing: false, coverArt: false,
        metadata: false, renaming: true }, ui: { outputFolder: exports },
    batch: { sessionFolders: true, namingScheme: 'sequential' }, output: { format: 'source' } });
    const results = await handlers.get('process-audio')({ sender: { send: (_channel, item) => progress.push(item) } },
        [album, a, b, empty]);
    assert.strictEqual(progress.length, 3);
    assert(progress.every(item => item.total === 3));
    assert.strictEqual(results.filter(item => item.success).length, 2);
    assert(results.some(item => item.fileName === 'notes.txt' && item.skipped));
    assert(results.some(item => item.fileName === 'b.mp3' && item.reason === 'Duplicate path'));
    assert(results.some(item => item.fileName === 'empty' && item.reason === 'Empty folder'));
    assert(results.some(item => item.fileName === 'exports' && item.reason === 'Output folder excluded'));
    assert(results.some(item => item.fileName === '.hidden' && item.reason === 'Hidden folder excluded'));
    assert(results.some(item => item.originalFile === fs.realpathSync(c) && item.error === 'Decoder refused track'));
    const output = path.dirname(results.find(item => item.success).outputFile);
    const manifest = JSON.parse(fs.readFileSync(path.join(output, 'manifest.json')));
    assert.strictEqual(manifest.fileCount, 3, 'manifest counted drop entries rather than discovered audio');
    assert.strictEqual(manifest.files.length, results.length);
    assert.strictEqual(opened.length, 0, 'batch opened Finder without an explicit action');
    assert.strictEqual(await handlers.get('open-output')(), true);
    assert.strictEqual(opened.length, 1);
    const pair = results.find(item => item.success);
    assert.throws(() => handlers.get('select-preview-pair')({}, a, path.join(root, 'not-a-result.wav')));
    assert.strictEqual(handlers.get('select-preview-pair')({}, pair.originalFile, pair.outputFile), true);
    const small = await handlers.get('read-audio-file')({}, pair.originalFile);
    assert(small.success && small.data.length > 0);
    fs.truncateSync(pair.outputFile, 24 * 1024 * 1024 + 1);
    const oversized = await handlers.get('read-audio-file')({}, pair.outputFile);
    assert(!oversized.success && oversized.error.includes('above 24 MB'));
    fs.unlinkSync(pair.originalFile);
    fs.symlinkSync(c, pair.originalFile);
    const swapped = await handlers.get('read-audio-file')({}, pair.originalFile);
    assert(!swapped.success && swapped.error.includes('path changed'), 'symlink swap escaped preview pair');
    const nextPair = results.filter(item => item.success)[1];
    handlers.get('select-preview-pair')({}, nextPair.originalFile, nextPair.outputFile);
    const previous = await handlers.get('read-audio-file')({}, pair.originalFile);
    assert(!previous.success, 'allowlist retained a previous batch pair');
    console.log('Main IPC: discovered totals/manifest, mixed drop, partial failure, explicit Finder, pair auth, 24 MB cap pass');
})().catch(error => { console.error(error); process.exitCode = 1; });
