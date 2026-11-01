const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { discoverAudioPaths, MAX_FILES } = require('../src/shared/discover-audio');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hexbloop-discovery-'));
process.on('exit', () => fs.rmSync(root, { recursive: true, force: true }));

(async () => {
    const album = path.join(root, 'album'), nested = path.join(album, 'nested');
    const empty = path.join(root, 'empty');
    fs.mkdirSync(nested, { recursive: true }); fs.mkdirSync(empty);
    const a = path.join(root, 'a.WAV'), b = path.join(album, 'b.mp3');
    const c = path.join(nested, 'c.flac'), blocked = path.join(album, 'blocked.wav');
    for (const file of [a, b, c, blocked]) fs.writeFileSync(file, 'fixture');
    fs.writeFileSync(path.join(album, 'notes.txt'), 'unsupported');
    fs.symlinkSync(a, path.join(album, 'shortcut.wav'));

    const mixed = await discoverAudioPaths([a, album, b, empty]);
    assert.deepStrictEqual(mixed.files, [a, b, blocked, c].map(p => fs.realpathSync(p)));
    assert(mixed.skipped.some(item => item.reason === 'Duplicate path' && item.fileName === 'b.mp3'));
    assert(mixed.skipped.some(item => item.reason === 'Unsupported format'));
    assert(mixed.skipped.some(item => item.reason === 'Symlink not followed'));
    assert(mixed.skipped.some(item => item.reason === 'Empty folder'));

    const partial = await discoverAudioPaths([album], { io: {
        lstat: file => path.basename(file) === 'blocked.wav' ? Promise.reject(new Error('denied')) : fs.promises.lstat(file),
        realpath: file => fs.promises.realpath(file),
        opendir: file => fs.promises.opendir(file)
    } });
    assert.deepStrictEqual(partial.files, [b, c].map(p => fs.realpathSync(p)));
    assert(partial.skipped.some(item => item.fileName === 'blocked.wav' && item.reason === 'Unreadable entry'));

    const bounded = await discoverAudioPaths([album], { maxFiles: 1 });
    assert.strictEqual(bounded.files.length, 1);
    assert(bounded.skipped.some(item => item.reason.startsWith('Batch limit')));
    const shallow = await discoverAudioPaths([album], { maxDepth: 1 });
    assert(shallow.skipped.some(item => item.reason.startsWith('Folder depth limit')));
    const huge = await discoverAudioPaths([album], { maxEntries: 2 });
    assert.strictEqual(huge.files.length, 0);
    assert(huge.skipped.some(item => item.reason.startsWith('Discovery entry limit')));
    assert.strictEqual(MAX_FILES, 200);
    const outputDirectory = path.join(album, 'exports');
    const hiddenDirectory = path.join(album, '.cache');
    fs.mkdirSync(path.join(outputDirectory, 'prior-session'), { recursive: true });
    fs.mkdirSync(hiddenDirectory);
    const priorExport = path.join(outputDirectory, 'prior-session', 'prior.wav');
    const hiddenAudio = path.join(hiddenDirectory, 'hidden.wav');
    fs.writeFileSync(priorExport, 'old export');
    fs.writeFileSync(hiddenAudio, 'cached audio');
    const excluded = await discoverAudioPaths([album], { outputDirectory });
    assert.deepStrictEqual(excluded.files, [b, blocked, c].map(p => fs.realpathSync(p)));
    assert(excluded.skipped.some(item => item.fileName === 'exports' && item.reason === 'Output folder excluded'));
    assert(excluded.skipped.some(item => item.fileName === '.cache' && item.reason === 'Hidden folder excluded'));
    const explicit = await discoverAudioPaths([album, priorExport, hiddenAudio], { outputDirectory });
    assert(explicit.files.includes(fs.realpathSync(priorExport)), 'explicit export selection must remain usable');
    assert(explicit.files.includes(fs.realpathSync(hiddenAudio)), 'explicit hidden-folder file must remain usable');
    assert.strictEqual(explicit.files.length, 5);
    console.log('Discovery exclusions: nested output/hidden folders skipped; explicit files remain usable');
    console.log('Discovery: nested/mixed ordering, duplicate, unsupported, empty, symlink, partial failure, depth/file/entry bounds pass');
})().catch(error => { console.error(error); process.exitCode = 1; });
