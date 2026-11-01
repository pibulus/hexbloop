/** Phase C: deterministic parameters, analyzer, seeded artwork, and measurements. */
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { execFileSync, spawnSync } = require('child_process');
const Module = require('module');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hexbloop-phase-c-'));
process.on('exit', () => fs.rmSync(root, { recursive: true, force: true }));
const stub = path.join(root, 'electron-stub.js');
const oldResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
    if (request === 'electron') {
        require.cache[stub] = { id: stub, filename: stub, loaded: true,
            exports: { app: { getPath: () => root } } };
        return stub;
    }
    return oldResolve.call(this, request, ...args);
};
const LunarProcessor = require('../src/lunar-processor');
const AudioProcessor = require('../src/audio-processor');
const AudioAnalyzer = require('../src/audio-analyzer');
const Art = require('../src/artwork-generator-vibrant-refined');
const MetadataEmbedder = require('../src/metadata-embedder');
const BatchNamingEngine = require('../src/batch/batch-naming-engine');
const { resolveUniqueOutputPath } = require('../src/shared/output-path');
const { DEFAULT_SETTINGS, migrateLegacySettings } = require('../src/shared/settings-schema');
const ffmpeg = require('../src/binary-resolver').ffmpeg.path;
const run = (args, options = {}) => execFileSync(ffmpeg, args, { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, ...options });
const hash = buffer => crypto.createHash('sha256').update(buffer).digest('hex');

function parameters() {
    const phaseNames = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous',
        'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
    const expectedLight = [0, 0.146447, 0.5, 0.853553, 1, 0.853553, 0.5, 0.146447];
    for (let index = 0; index < 8; index++) {
        const phase = index / 8;
        assert.strictEqual(LunarProcessor.getPhaseName(phase), phaseNames[index]);
        assert(Math.abs(LunarProcessor.illuminationForPhase(phase) - expectedLight[index]) < 0.00001);
        for (const hour of [2, 9, 15, 21]) {
            const base = LunarProcessor.getPhaseInfluence(phase);
            const time = LunarProcessor.getTimeInfluence(new Date(2026, 10, 1, hour));
            const influence = {
                overdrive: Math.max(1, base.overdrive * time.modifier),
                bass: base.bass + (time.bassBoost || 0),
                treble: base.treble + (time.trebleBoost || 0),
                echo: { delay: base.echo.delay * time.echoMultiplier, decay: base.echo.decay * time.echoMultiplier },
                compand: base.compand
            };
            assert(influence.overdrive >= 1 && influence.overdrive <= 3.64 + 1e-9);
            assert(influence.bass >= 0.2 && influence.bass <= 2.7 + 1e-9);
            assert(influence.treble >= -1 && influence.treble <= 2);
            assert(influence.compand.ratio >= 2 && influence.compand.ratio <= 3.5);
            const args = AudioProcessor.buildSoxArgs('in.wav', 'out.aif', influence);
            const echo = args.indexOf('echo');
            assert.deepStrictEqual(args.slice(echo + 1, echo + 5), ['0.8', '0.85',
                String(Math.round(influence.echo.delay * 1000)), String(influence.echo.decay)]);
            assert(!args.includes('6'), 'hardcoded 6 ms echo survived');
        }
    }
    const engine = new BatchNamingEngine({ namingScheme: 'timestamp', numberingStyle: 'none' });
    const names = [0, 1, 2].map(index => engine.generateName('input.wav', index, 3));
    assert.strictEqual(new Set(names).size, 3);
    const taken = new Set();
    const occupied = path.join(root, `${names[0]}.wav`);
    fs.writeFileSync(occupied, 'existing');
    const preview = engine.previewBatch(['a.wav', 'b.wav', 'c.wav'], 'wav', root);
    const actual = names.map(name => path.basename(resolveUniqueOutputPath(root, name, 'wav', taken)));
    assert.deepStrictEqual(preview.map(item => item.generated), actual);
    console.log('Eight lunar boundaries × four time bands; Sox echo positions; timestamp preview: pass');
}

async function artwork() {
    const generator = new Art({ width: 256, height: 256 });
    const globalRandom = Math.random;
    for (const style of generator.styles) {
        const options = { style, seed: 428, audioEnergy: 0.6, tempo: 120, title: 'Same Seed' };
        await generator.generate(options);
        const first = hash(generator.canvas.toBuffer('image/png'));
        const surface = generator.offscreenA;
        await generator.generate({ style: 'ocean-aurora', seed: 888 });
        await generator.generate(options);
        assert.strictEqual(hash(generator.canvas.toBuffer('image/png')), first, `${style} is not seeded on reuse`);
        if (surface) assert.strictEqual(generator.offscreenA, surface, 'offscreen surface regenerated');
        assert.strictEqual(Math.random, globalRandom);
    }
    const originalRender = generator.renderNeonPlasma;
    generator.renderNeonPlasma = () => { throw new Error('forced render fault'); };
    await assert.rejects(generator.generate({ style: 'neon-plasma', seed: 7 }), /forced render fault/);
    generator.renderNeonPlasma = originalRender;
    assert.strictEqual(Math.random, globalRandom, 'global RNG changed after render error');
    const thousand = new Art({ width: 1000, height: 1000 });
    await thousand.generate({ style: 'neon-plasma', seed: 42 });
    const file = path.join(root, '1000.png');
    await thousand.saveToFile(file, 'png', { resolution: 1000 });
    const png = fs.readFileSync(file);
    assert.strictEqual(png.readUInt32BE(16), 1000);
    assert.strictEqual(png.readUInt32BE(20), 1000);
    const firstWorker = AudioProcessor.acquireArtworkWorker(1000);
    firstWorker.busy = false;
    assert.strictEqual(AudioProcessor.acquireArtworkWorker(1000), firstWorker);
    firstWorker.busy = false;
    console.log('Eight seeded styles, forced failure, reused Cairo surfaces, real 1000×1000 PNG: pass');
}

async function analyzer() {
    const low = path.join(root, 'low.wav'), high = path.join(root, 'high.wav');
    for (const [frequency, file] of [[440, low], [4400, high]]) {
        run(['-v', 'error', '-f', 'lavfi', '-i', `sine=frequency=${frequency}:sample_rate=48000:duration=1`, file]);
    }
    const lo = await AudioAnalyzer.analyzeAudio(low);
    const hi = await AudioAnalyzer.analyzeAudio(high);
    assert.strictEqual(lo.tempo, null, '440 Hz tone reported a beat');
    assert(hi.brightness > lo.brightness + 0.25, `frequency brightness inverted: ${lo.brightness}, ${hi.brightness}`);
    const rate = 22050, pulse = new Float32Array(rate * 10);
    for (let beat = 0; beat < 20; beat++) {
        const start = beat * rate / 2;
        for (let i = 0; i < 200; i++) pulse[start + i] = 0.75 * (1 - i / 200);
    }
    const tempo = AudioAnalyzer.estimateTempo(Buffer.from(pulse.buffer), rate);
    assert(tempo != null && Math.abs(tempo - 120) < 6, `120 BPM pulse estimated as ${tempo}`);
    console.log(`Analyzer: 440 Hz has no BPM; 440→4400 Hz brightness ${lo.brightness.toFixed(3)}→${hi.brightness.toFixed(3)}; pulse ${tempo} BPM`);
}

async function shortMasteringGuard() {
    const source = path.join(root, 'short.mp3');
    const output = path.join(root, 'short-master.mp3');
    run(['-v', 'error', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=0.45:sample_rate=48000', source]);
    const settings = structuredClone(DEFAULT_SETTINGS);
    settings.output.format = 'source';
    settings.processing = { mastering: true, compressing: false, coverArt: false,
        metadata: false, renaming: false };
    await AudioProcessor.processFile(source, output, { settings });
    assert(fs.statSync(output).size > 0, 'short MP3 mastering failed');
    console.log('Short MP3 mastering: valid unity compressor makeup, no crash');
}

async function fallbackSaturation() {
    const source = path.join(root, 'saturation-source.wav');
    const output = path.join(root, 'saturation-processed.aif');
    run(['-v', 'error', '-f', 'lavfi', '-i', 'sine=frequency=220:duration=2:sample_rate=48000',
        '-af', 'volume=6dB', '-c:a', 'pcm_s24le', source]);
    const phase = LunarProcessor.getPhaseInfluence(0);
    await AudioProcessor.processWithFFmpegOnly(source, output, phase);
    const decode = file => {
        const bytes = execFileSync(ffmpeg, ['-v', 'error', '-i', file, '-ar', '22050',
            '-ac', '1', '-c:a', 'pcm_f32le', '-f', 'f32le', '-']);
        return new Float32Array(bytes.buffer, bytes.byteOffset, bytes.length / 4);
    };
    const power = (samples, frequency) => {
        const size = 4096, coefficient = 2 * Math.cos(2 * Math.PI * frequency / 22050);
        let previous = 0, older = 0;
        for (let index = 0; index < size; index++) {
            const value = samples[index] * (0.5 - 0.5 * Math.cos(2 * Math.PI * index / (size - 1)))
                + coefficient * previous - older;
            older = previous; previous = value;
        }
        return previous ** 2 + older ** 2 - coefficient * previous * older;
    };
    const input = decode(source), result = decode(output);
    const before = power(input, 660) / power(input, 220);
    const after = power(result, 660) / power(result, 220);
    assert(after > before * 5 && after > 1e-5,
        `soft saturation lacks third-harmonic evidence: ${before} → ${after}`);
    console.log(`FFmpeg fallback soft saturation: third-harmonic power ratio ${before.toExponential(2)} → ${after.toExponential(2)}`);

    // Measure the actual low-shelf filter used in the fallback, at equal
    // input level; a head bump must lift 80 Hz more than 1 kHz.
    const rms = bytes => {
        const samples = new Float32Array(bytes.buffer, bytes.byteOffset, bytes.length / 4);
        let sum = 0;
        for (const sample of samples) sum += sample * sample;
        return Math.sqrt(sum / samples.length);
    };
    const measuredGain = frequency => {
        const tone = ['-v', 'error', '-f', 'lavfi', '-i',
            `sine=frequency=${frequency}:sample_rate=48000:duration=2`];
        const decode = filter => execFileSync(ffmpeg, [ ...tone,
            ...(filter ? ['-af', filter] : []), '-ac', '1', '-ar', '22050',
            '-c:a', 'pcm_f32le', '-f', 'f32le', '-']);
        return 20 * Math.log10(rms(decode(`bass=g=${phase.bass}:f=90`)) / rms(decode(null)));
    };
    const lowGain = measuredGain(80), highGain = measuredGain(1000);
    assert(lowGain > highGain + 0.5, `no measured head bump: ${lowGain}, ${highGain}`);
    console.log(`FFmpeg fallback head-bump EQ: 80 Hz ${lowGain.toFixed(2)} dB, 1 kHz ${highGain.toFixed(2)} dB`);
}

async function coverMuxFallback() {
    const source = path.join(root, 'fallback-source.flac');
    run(['-v', 'error', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=1', '-c:a', 'flac', source]);
    const badCover = path.join(root, 'invalid.png');
    fs.writeFileSync(badCover, 'not a PNG');
    const tagsOnly = path.join(root, 'tags-only.flac');
    const embedder = new MetadataEmbedder();
    const outcome = await embedder.embedMetadataFFmpeg(source, tagsOnly, null, badCover);
    assert.strictEqual(outcome.artworkEmbedded, false);
    assert(fs.existsSync(tagsOnly));
    const originalEmbed = MetadataEmbedder.prototype.embedMetadataFFmpeg;
    MetadataEmbedder.prototype.embedMetadataFFmpeg = function (input, output, metadata) {
        return originalEmbed.call(this, input, output, metadata, badCover);
    };
    const settings = structuredClone(DEFAULT_SETTINGS);
    settings.processing = { mastering: false, compressing: false, coverArt: true,
        metadata: false, renaming: false };
    settings.artwork.useAudioFeatures = false;
    settings.artwork.resolution = 256;
    settings.output.format = 'source';
    const output = path.join(root, 'fallback-cover.flac');
    try {
        const result = await AudioProcessor.processFile(source, output, { settings });
        assert.strictEqual(result.artwork.embedded, false);
        assert.strictEqual(result.artwork.path, path.join(root, 'fallback-cover_cover.png'));
        assert(fs.statSync(result.artwork.path).size > 0);
    } finally {
        MetadataEmbedder.prototype.embedMetadataFFmpeg = originalEmbed;
    }
    console.log('Failed FLAC cover mux: tags-only retry plus durable generated-art sidecar');
}

function measure(file) {
    const result = spawnSync(ffmpeg, ['-hide_banner', '-i', file, '-af',
        'loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'],
    { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
    if (result.status !== 0) throw new Error(result.stderr);
    const match = result.stderr.match(/\{\s*"input_i"[\s\S]*?\}/);
    if (!match) throw new Error('No loudnorm measurement');
    const stats = JSON.parse(match[0]);
    return { lufs: Number(stats.input_i), truePeakDbtp: Number(stats.input_tp) };
}

async function benchmark() {
    const source = path.join(root, 'benchmark-30s.wav');
    run(['-v', 'error', '-f', 'lavfi', '-i', 'sine=frequency=220:sample_rate=48000:duration=30',
        '-f', 'lavfi', '-i', 'sine=frequency=880:sample_rate=48000:duration=30',
        '-filter_complex', '[0:a]volume=0.25[a];[1:a]volume=0.13[b];[a][b]amix=inputs=2:normalize=0,volume=0.7,pan=stereo|c0=c0|c1=c0[out]',
        '-map', '[out]', '-c:a', 'pcm_s24le', source]);
    const settings = structuredClone(DEFAULT_SETTINGS);
    settings.artwork.resolution = 1000;
    settings.artwork.useAudioFeatures = true;
    settings.processing.renaming = false;
    const rssBefore = process.memoryUsage().rss;
    const runs = [];
    for (const format of ['mp3', 'wav', 'flac']) {
        settings.output.format = format;
        const output = path.join(root, `measured.${format}`);
        const rssStart = process.memoryUsage().rss;
        let rssPeak = rssStart;
        const sampleMemory = setInterval(() => { rssPeak = Math.max(rssPeak, process.memoryUsage().rss); }, 25);
        const start = performance.now();
        try { await AudioProcessor.processFile(source, output, { settings }); }
        finally { clearInterval(sampleMemory); rssPeak = Math.max(rssPeak, process.memoryUsage().rss); }
        const seconds = (performance.now() - start) / 1000;
        runs.push({ format, seconds: Number(seconds.toFixed(2)), audioSecondsPerSecond: Number((30 / seconds).toFixed(2)),
            bytes: fs.statSync(output).size, rssStartMb: Math.round(rssStart / 1048576),
            rssPeakMb: Math.round(rssPeak / 1048576), rssEndMb: Math.round(process.memoryUsage().rss / 1048576),
            ...measure(output) });
    }
    const sox = require('../src/binary-resolver').sox;
    const originalSox = sox.path;
    sox.path = null;
    settings.output.format = 'mp3';
    settings.processing.coverArt = false;
    const fallbackOutput = path.join(root, 'fallback-measured.mp3');
    const fallbackStart = performance.now();
    try { await AudioProcessor.processFile(source, fallbackOutput, { settings }); }
    finally { sox.path = originalSox; }
    const fallback = { seconds: Number(((performance.now() - fallbackStart) / 1000).toFixed(2)),
        ...measure(fallbackOutput) };
    console.log('Synthetic 30s two-tone stereo 48k/24-bit full chain, post-encode measurements:');
    console.log(JSON.stringify({ rssBeforeMb: Math.round(rssBefore / 1048576), runs, ffmpegOnlyFallback: fallback }, null, 2));
}

(async () => {
    parameters(); await artwork(); await analyzer(); await shortMasteringGuard();
    await fallbackSaturation(); await coverMuxFallback();
    if (process.env.HEXBLOOP_MEASURE === '1') await benchmark();
})().catch(error => { console.error(error); process.exitCode = 1; });
