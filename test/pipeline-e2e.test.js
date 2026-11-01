/**
 * @fileoverview End-to-end audio pipeline test
 * @description Runs the REAL AudioProcessor against the fixture across the
 * format/stage matrix and validates outputs with ffprobe. Catches the class
 * of bug where a stage silently produces the wrong container, mangled tags,
 * or falls back without anyone noticing.
 *
 * Runs under plain node (no Electron) via a minimal electron stub. Fails
 * if ffprobe is missing; an untested pipeline is not a green test.
 */

const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync } = require('child_process');
const Module = require('module');

const REPO = path.join(__dirname, '..');
const FIXTURE = path.join(__dirname, 'fixtures', 'test.wav');
// Never touch test/output or a shared /tmp settings file; both may contain
// work from a previous session. Only our own mkdtemp tree is disposable.
const TEST_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'hexbloop-e2e-'));
const OUT = path.join(TEST_ROOT, 'output');
process.on('exit', () => fs.rmSync(TEST_ROOT, { recursive: true, force: true }));

// --- Minimal electron stub so the pipeline can run headless ---
const stubUserData = path.join(TEST_ROOT, 'userdata');
fs.mkdirSync(stubUserData, { recursive: true });
const electronStub = {
    app: {
        getPath: (key) => {
            if (key === 'userData') return stubUserData;
            if (key === 'documents') return path.join(os.homedir(), 'Documents');
            return os.tmpdir();
        },
        getName: () => 'HexbloopTest',
        getVersion: () => '0.0.0-test',
        setName: () => {},
    },
};
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
    if (request === 'electron') {
        const stubPath = path.join(TEST_ROOT, 'hexbloop-electron-stub.js');
        // Cache the object directly instead of round-tripping through a file
        require.cache[stubPath] = { id: stubPath, filename: stubPath, loaded: true, exports: electronStub };
        return stubPath;
    }
    return origResolve.call(this, request, ...args);
};

const AudioProcessor = require(path.join(REPO, 'src/audio-processor'));
const { getPreferencesManager } = require(path.join(REPO, 'src/menu/preferences'));

const results = { passed: 0, failed: 0, skipped: 0 };

function haveFfprobe() {
    try { execFileSync('ffprobe', ['-version'], { stdio: 'ignore' }); return true; }
    catch { return false; }
}

function probe(file) {
    const json = execFileSync('ffprobe', [
        '-v', 'error', '-show_format', '-show_streams', '-of', 'json', file
    ], { encoding: 'utf8' });
    return JSON.parse(json);
}

async function runCase(name, settingsPatch, expect) {
    const pm = getPreferencesManager();
    await pm.whenReady();
    await pm.resetToDefaults();
    await pm.updateSettings(settingsPatch);

    const format = AudioProcessor.resolveOutputFormat(pm.getSettings());
    const outputPath = path.join(OUT, `${name}.${format}`);
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

    await AudioProcessor.processFile(FIXTURE, outputPath);

    const problems = [];
    if (!fs.existsSync(outputPath)) {
        problems.push('output file missing');
    } else {
        const info = probe(outputPath);
        const container = info.format.format_name;
        const tags = info.format.tags || info.streams?.[0]?.tags || {};
        const audioStreams = info.streams.filter(s => s.codec_type === 'audio');
        const videoStreams = info.streams.filter(s => s.codec_type === 'video');

        if (!container.includes(expect.container)) {
            problems.push(`container '${container}' != '${expect.container}'`);
        }
        if (expect.albumHasSpace) {
            const album = tags.album || tags.ALBUM || '';
            if (!album) problems.push('no album tag');
            else if (album.includes('"')) problems.push(`album has literal quotes: ${album}`);
            else if (!/ /.test(album)) problems.push(`album lost spaces: ${album}`);
        }
        if (expect.artwork !== undefined && (videoStreams.length > 0) !== expect.artwork) {
            problems.push(`artwork=${videoStreams.length > 0}, expected ${expect.artwork}`);
        }
        if (audioStreams.length !== 1) problems.push(`${audioStreams.length} audio streams`);
    }

    if (problems.length === 0) {
        console.log(`  ✅ ${name}`);
        results.passed++;
    } else {
        console.log(`  ❌ ${name}`);
        problems.forEach(p => console.log(`       ⚠️  ${p}`));
        results.failed++;
    }
}

async function main() {
    console.log('\n🔮 HEXBLOOP E2E PIPELINE TEST\n' + '='.repeat(60));

    if (!haveFfprobe()) throw new Error('ffprobe missing; E2E cannot verify output');
    if (!fs.existsSync(FIXTURE)) throw new Error('fixture missing; E2E cannot verify output');

    fs.mkdirSync(OUT, { recursive: true });

    // mp3, full chain — default happy path
    await runCase('mp3 full chain', { output: { format: 'mp3' } },
        { container: 'mp3', albumHasSpace: true, artwork: true });

    // WAV full chain (regression: -metadata args used to mangle → hard fail)
    await runCase('wav full chain', { output: { format: 'wav' } },
        { container: 'wav', artwork: false });

    // FLAC full chain (regression: stream-metadata args mangled)
    await runCase('flac full chain', { output: { format: 'flac' } },
        { container: 'flac', albumHasSpace: true, artwork: true });

    // FLAC, mastering off (regression: forced mp3 bytes into .flac)
    await runCase('flac no-master', { processing: { mastering: false }, output: { format: 'flac' } },
        { container: 'flac', albumHasSpace: true });

    // DSP/art off with metadata still on → valid tagged file
    await runCase('mp3 all-stages-off',
        { processing: { compressing: false, mastering: false, coverArt: false }, output: { format: 'mp3' } },
        { container: 'mp3', albumHasSpace: true, artwork: false });

    // Clean Mac: no sox, no Homebrew path. The FFmpeg compression fallback
    // must actually produce audio, not merely catch a missing spawn.
    const { sox } = require(path.join(REPO, 'src/binary-resolver'));
    const originalSox = sox.path;
    sox.path = null;
    try {
        await runCase('no-sox fallback',
            { processing: { coverArt: false, metadata: false }, output: { format: 'mp3' } },
            { container: 'mp3', artwork: false });
    } finally {
        sox.path = originalSox;
    }

    // Rename only, source format: byte-identical WAV.
    const hiResInput = path.join(TEST_ROOT, '48k-24bit.wav');
    execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-f', 'lavfi',
        '-i', 'sine=frequency=440:duration=1', '-ar', '48000', '-c:a', 'pcm_s24le', hiResInput]);
    const pm = getPreferencesManager();
    await pm.whenReady();
    await pm.resetToDefaults();
    await pm.updateSettings({ processing: { compressing: false, mastering: false,
        coverArt: false, metadata: false, renaming: true },
    output: { format: 'source', sampleRate: 0 } });
    const passthrough = path.join(OUT, '48k-24bit.wav');
    await AudioProcessor.processFile(hiResInput, passthrough);
    const info = probe(passthrough);
    if (fs.readFileSync(hiResInput).equals(fs.readFileSync(passthrough)) &&
        info.streams[0].sample_rate === '48000' && info.streams[0].bits_per_sample === 24 &&
        !(info.format.tags?.artist || info.format.tags?.ARTIST)) {
        console.log('  ✅ 48k/24-bit rename-only WAV pass-through'); results.passed++;
    } else {
        console.log('  ❌ 48k/24-bit pass-through changed audio or tags'); results.failed++;
    }

    // Invalid direct in-memory mutation fails closed instead of encoding under
    // a misleading extension. Saved settings are coerced before use.
    {
        const pm = getPreferencesManager();
        await pm.whenReady();
        await pm.resetToDefaults();
        pm.getSettings().output.format = 'ogg';
        const outputPath = path.join(OUT, 'invalid-format.mp3');
        try {
            await AudioProcessor.processFile(FIXTURE, outputPath);
            results.failed++;
        } catch {
            if (!fs.existsSync(outputPath)) results.passed++;
            else results.failed++;
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n📊 E2E: ${results.passed} passed, ${results.failed} failed, ${results.skipped} skipped\n`);
    process.exit(results.failed === 0 ? 0 : 1);
}

main().catch(err => { console.error('💥 E2E harness error:', err); process.exit(1); });
