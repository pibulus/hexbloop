/**
 * @fileoverview End-to-end audio pipeline test
 * @description Runs the REAL AudioProcessor against the fixture across the
 * format/stage matrix and validates outputs with ffprobe. Catches the class
 * of bug where a stage silently produces the wrong container, mangled tags,
 * or falls back without anyone noticing.
 *
 * Runs under plain node (no Electron) via a minimal electron stub. Skips
 * cleanly if ffprobe isn't installed.
 */

const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync } = require('child_process');
const Module = require('module');

const REPO = path.join(__dirname, '..');
const FIXTURE = path.join(__dirname, 'fixtures', 'test.wav');
const OUT = path.join(__dirname, 'output', 'e2e');

// --- Minimal electron stub so the pipeline can run headless ---
const stubUserData = path.join(os.tmpdir(), 'hexbloop-e2e-userdata');
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
        const stubPath = path.join(os.tmpdir(), 'hexbloop-electron-stub.js');
        fs.writeFileSync(stubPath, `module.exports = ${JSON.stringify(null)};`);
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

    if (!haveFfprobe()) {
        console.log('  ⏭️  ffprobe not available — skipping E2E (install: brew install ffmpeg)');
        console.log('\n🎉 E2E skipped (no ffprobe).\n');
        process.exit(0);
    }
    if (!fs.existsSync(FIXTURE)) {
        console.log('  ⏭️  fixture missing — run the audio-processing test first to generate it');
        process.exit(0);
    }

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

    // All stages off → still a valid tagged file
    await runCase('mp3 all-stages-off',
        { processing: { compressing: false, mastering: false, coverArt: false }, output: { format: 'mp3' } },
        { container: 'mp3', albumHasSpace: true, artwork: false });

    // Legacy/unknown format that slipped past validation → resolveOutputFormat
    // guards it back to mp3 at processing time. (updateSettings would reject
    // 'ogg' now, so poke the in-memory settings directly to simulate a
    // legacy on-disk value that coerceSettings hasn't yet cleaned.)
    {
        const pm = getPreferencesManager();
        await pm.whenReady();
        await pm.resetToDefaults();
        pm.getSettings().output.format = 'ogg';
        const outputPath = path.join(OUT, 'unknown-format-fallback.mp3');
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        await AudioProcessor.processFile(FIXTURE, outputPath);
        const info = probe(outputPath);
        if (info.format.format_name.includes('mp3')) {
            console.log('  ✅ unknown-format fallback');
            results.passed++;
        } else {
            console.log(`  ❌ unknown-format fallback: got ${info.format.format_name}`);
            results.failed++;
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n📊 E2E: ${results.passed} passed, ${results.failed} failed, ${results.skipped} skipped\n`);
    process.exit(results.failed === 0 ? 0 : 1);
}

main().catch(err => { console.error('💥 E2E harness error:', err); process.exit(1); });
