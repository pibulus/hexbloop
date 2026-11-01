/** Isolated real Electron main+renderer+helpers+DSP serial benchmark. */
const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hexbloop-electron-bench-'));
app.setPath('userData', root);
// A real renderer runs, but this measurement never steals focus or opens Finder.
BrowserWindow.prototype.show = function () {};
app.on('before-quit', () => fs.rmSync(root, { recursive: true, force: true }));

const ffmpeg = require('../src/binary-resolver').ffmpeg.path;
const run = args => execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', ...args], { stdio: 'ignore' });
function sample() {
    const table = new Map();
    for (const line of execFileSync('ps', ['-axo', 'pid=,ppid=,rss=,comm='], { encoding: 'utf8' }).trim().split('\n')) {
        const match = line.trim().match(/^(\d+)\s+(\d+)\s+(\d+)\s+(.+)$/);
        if (match) table.set(Number(match[1]), { parent: Number(match[2]), rssKb: Number(match[3]), command: path.basename(match[4]) });
    }
    const children = new Set([process.pid]);
    let changed = true;
    while (changed) {
        changed = false;
        for (const [pid, entry] of table) if (!children.has(pid) && children.has(entry.parent)) {
            children.add(pid); changed = true;
        }
    }
    let appMb = 0, dspMb = 0;
    for (const pid of children) {
        const entry = table.get(pid);
        if (!entry || entry.command === 'ps') continue;
        if (/^(ffmpeg|ffprobe|sox)$/.test(entry.command)) dspMb += entry.rssKb / 1024;
        else appMb += entry.rssKb / 1024;
    }
    return { appMb, dspMb, combinedMb: appMb + dspMb, processCount: children.size - 1 };
}

app.whenReady().then(async () => {
    const ambient = path.join(root, 'ambient-35s.mp3');
    run(['-ss', '45', '-i', path.join(__dirname, '../assets/ambient_loop.mp3'), '-t', '35', '-c:a', 'copy', ambient]);
    const wav = path.join(root, 'layered-stereo-24bit.wav');
    run(['-f', 'lavfi', '-i', 'sine=frequency=220:sample_rate=48000:duration=30',
        '-f', 'lavfi', '-i', 'anoisesrc=color=pink:amplitude=0.02:sample_rate=48000:duration=30',
        '-filter_complex', '[0:a]volume=0.3[a];[a][1:a]amix=inputs=2:normalize=0,pan=stereo|c0=c0|c1=c0[out]',
        '-map', '[out]', '-c:a', 'pcm_s24le', wav]);
    const flac = path.join(root, 'tonal-noise-mono.flac');
    run(['-f', 'lavfi', '-i', 'sine=frequency=110:sample_rate=48000:duration=18',
        '-f', 'lavfi', '-i', 'anoisesrc=color=white:amplitude=0.04:sample_rate=48000:duration=18',
        '-filter_complex', '[0:a][1:a]amix=inputs=2:normalize=0[out]', '-map', '[out]', '-c:a', 'flac', flac]);
    const { getPreferencesManager } = require('../src/menu/preferences');
    const pm = getPreferencesManager(); await pm.whenReady();
    await pm.updateSettings({ ui: { outputFolder: path.join(root, 'output'), ambientAudio: false },
        output: { format: 'source' }, artwork: { resolution: 1000 },
        processing: { renaming: false } });
    const windowReady = new Promise(resolve => app.once('browser-window-created', (_event, win) => {
        win.webContents.once('did-finish-load', () => resolve(win));
    }));
    require('../main.js');
    const window = await windowReady;
    const rendererReady = await window.webContents.executeJavaScript('Boolean(window.hexbloopMystic)');
    if (!rendererReady || !window.webContents.getURL().endsWith('/src/renderer/index.html')) {
        throw new Error(`Actual Hexbloop renderer did not load: ${window.webContents.getURL()}`);
    }
    const input = [ambient, wav, flac];
    const peak = { appMb: 0, dspMb: 0, combinedMb: 0, processCount: 0 };
    let samples = 0;
    const take = () => {
        const current = sample(); samples++;
        for (const key of Object.keys(peak)) peak[key] = Math.max(peak[key], current[key]);
    };
    take();
    const start = performance.now();
    const interval = setInterval(take, 50);
    let results;
    try { results = await window.webContents.executeJavaScript(`window.electronAPI.processAudio(${JSON.stringify(input)})`); }
    finally { clearInterval(interval); take(); }
    if (results.filter(item => item.success).length !== 3) throw new Error(`Electron batch failed: ${JSON.stringify(results)}`);
    console.log('PHASE_D_ELECTRON_BENCHMARK=' + JSON.stringify({
        inputCount: input.length, inputSeconds: 83, wallSeconds: Number(((performance.now() - start) / 1000).toFixed(2)),
        peakAppMb: Math.round(peak.appMb), peakDspMb: Math.round(peak.dspMb),
        peakSummedRssMb: Math.round(peak.combinedMb), peakProcessCount: peak.processCount,
        samples, method: '50ms ps RSS samples of actual Electron main, renderer, helpers, FFmpeg/Sox/ffprobe; summed RSS counts shared pages per process'
    }));
    // Exercise real secure IPC + Blob creation without audibly playing a track.
    const playback = await window.webContents.executeJavaScript(`(async () => {
        const player = window.hexbloopMystic;
        player.abAudio.play = async () => {};
        player.showReceipt(${JSON.stringify(results)});
        await player.loadABResult(0);
        return { selected: player.selectedPairIndex, authorized: player.hasABResult,
            blob: Boolean(player.abBlob?.url), dataType: player.abBlob?.mime };
    })()`);
    if (!playback.authorized || !playback.blob) throw new Error(`Real Electron preview IPC failed: ${JSON.stringify(playback)}`);
    console.log('PHASE_D_ELECTRON_PREVIEW=' + JSON.stringify(playback));
    window.destroy();
    app.quit();
}).catch(error => { console.error(error); fs.rmSync(root, { recursive: true, force: true }); app.exit(1); });
