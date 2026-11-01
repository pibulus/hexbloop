/** Serial batch: one bundled real-audio excerpt + two varied generated sources.
 * Memory samples include the Node process and its FFmpeg/Sox descendants.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');
const Module = require('module');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hexbloop-phase-d-bench-'));
process.on('exit', () => fs.rmSync(root, { recursive: true, force: true }));
const electronStub = path.join(root, 'electron-stub.js');
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
    if (request === 'electron') {
        require.cache[electronStub] = { id: electronStub, filename: electronStub,
            loaded: true, exports: { app: { getPath: () => root } } };
        return electronStub;
    }
    return originalResolve.call(this, request, ...args);
};
const AudioProcessor = require('../src/audio-processor');
const { DEFAULT_SETTINGS } = require('../src/shared/settings-schema');
const ffmpeg = require('../src/binary-resolver').ffmpeg.path;
const run = args => execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', ...args], { stdio: 'ignore' });
function duration(file) {
    return Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1', file], { encoding: 'utf8' }));
}

function memory() {
    const output = execFileSync('ps', ['-axo', 'pid=,ppid=,rss=,comm='], { encoding: 'utf8' });
    const processes = new Map();
    for (const line of output.trim().split('\n')) {
        const match = line.trim().match(/^(\d+)\s+(\d+)\s+(\d+)\s+(.+)$/);
        if (match) processes.set(Number(match[1]), { parent: Number(match[2]), rssKb: Number(match[3]),
            command: path.basename(match[4]) });
    }
    const descendants = new Set([process.pid]);
    let changed = true;
    while (changed) {
        changed = false;
        for (const [pid, entry] of processes) {
            if (!descendants.has(pid) && descendants.has(entry.parent)) { descendants.add(pid); changed = true; }
        }
    }
    const nodeMb = process.memoryUsage().rss / 1048576;
    const childrenMb = [...descendants].filter(pid => pid !== process.pid && processes.get(pid)?.command !== 'ps')
        .reduce((sum, pid) => sum + (processes.get(pid)?.rssKb || 0) / 1024, 0);
    return { nodeMb, childrenMb, combinedMb: nodeMb + childrenMb };
}

(async () => {
    const bundled = path.join(__dirname, '../assets/ambient_loop.mp3');
    if (!fs.existsSync(bundled)) throw new Error('Bundled real-audio excerpt unavailable');
    const ambient = path.join(root, 'ambient-excerpt.mp3');
    run(['-ss', '45', '-i', bundled, '-t', '35', '-c:a', 'copy', ambient]);
    const wav = path.join(root, 'layered-stereo-24bit.wav');
    run(['-f', 'lavfi', '-i', 'sine=frequency=220:sample_rate=48000:duration=30',
        '-f', 'lavfi', '-i', 'anoisesrc=color=pink:amplitude=0.02:sample_rate=48000:duration=30',
        '-filter_complex', '[0:a]volume=0.3[a];[a][1:a]amix=inputs=2:normalize=0,pan=stereo|c0=c0|c1=c0[out]',
        '-map', '[out]', '-c:a', 'pcm_s24le', wav]);
    const flac = path.join(root, 'tonal-noise-mono.flac');
    run(['-f', 'lavfi', '-i', 'sine=frequency=110:sample_rate=48000:duration=18',
        '-f', 'lavfi', '-i', 'anoisesrc=color=white:amplitude=0.04:sample_rate=48000:duration=18',
        '-filter_complex', '[0:a][1:a]amix=inputs=2:normalize=0[out]', '-map', '[out]', '-c:a', 'flac', flac]);
    const sources = [
        ['bundled ambient MP3 excerpt', ambient],
        ['generated layered stereo 48k/24-bit WAV', wav],
        ['generated tonal/noise mono FLAC', flac]
    ];
    const settings = structuredClone(DEFAULT_SETTINGS);
    settings.output.format = 'source';
    settings.processing.renaming = false;
    settings.artwork.resolution = 1000;
    const batchStart = performance.now(), rows = [];
    for (const [description, source] of sources) {
        const output = path.join(root, `output-${path.basename(source)}`);
        const seconds = duration(source);
        const peak = { nodeMb: 0, childrenMb: 0, combinedMb: 0 };
        let samples = 0;
        const take = () => {
            const sample = memory(); samples++;
            for (const key of Object.keys(peak)) peak[key] = Math.max(peak[key], sample[key]);
        };
        take();
        const start = performance.now();
        const interval = setInterval(take, 50);
        try { await AudioProcessor.processFile(source, output, { settings }); }
        finally { clearInterval(interval); take(); }
        const wall = (performance.now() - start) / 1000;
        if (!fs.existsSync(output)) throw new Error(`Missing benchmark output: ${description}`);
        rows.push({ description, inputSeconds: Number(seconds.toFixed(2)), wallSeconds: Number(wall.toFixed(2)),
            realtimeMultiple: Number((seconds / wall).toFixed(2)), sourceMb: Number((fs.statSync(source).size / 1048576).toFixed(2)),
            outputMb: Number((fs.statSync(output).size / 1048576).toFixed(2)),
            peakNodeMb: Math.round(peak.nodeMb), peakChildMb: Math.round(peak.childrenMb),
            peakCombinedMb: Math.round(peak.combinedMb), samples });
    }
    console.log('PHASE_D_BENCHMARK=' + JSON.stringify({
        methodology: 'Serial full chain, 1000px artwork, 50ms RSS samples via ps; warm Node and its observed FFmpeg/Sox children',
        batchWallSeconds: Number(((performance.now() - batchStart) / 1000).toFixed(2)),
        files: rows
    }));
})().catch(error => { console.error(error); process.exitCode = 1; });
