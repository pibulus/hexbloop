// Runs the actual packaged LOCAL TEST app. No mocked DSP, canvas or playback.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { _electron } = require('playwright');
const root = path.resolve(process.argv[2]);
const appPath = path.join(root, 'app/mac-arm64/Hexbloop LOCAL TEST.app');
const binary = name => path.join(appPath, 'Contents/Resources/vendor/mac', name);
const report = { status: 'LOCAL TEST ONLY - NOT FOR DISTRIBUTION', checks: [], failures: [] };
let application;
const check = async (name, fn) => {
    try { const result = await fn(); report.checks.push({ name, result: result ?? true }); console.log('PASS:', name); return result; }
    catch (error) { report.failures.push({ name, error: error.message }); console.error('FAIL:', name, error.message); }
};
const probe = file => JSON.parse(execFileSync(binary('ffprobe'), ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', file], { encoding: 'utf8' }));

(async () => {
    assert(fs.existsSync(path.join(root, 'LOCAL-ONLY.json')), 'Completed, marked local build required');
    const inputs = path.join(root, 'fixtures');
    fs.mkdirSync(path.join(inputs, 'nested'), { recursive: true });
    for (const [format, codec] of [['mp3', 'libmp3lame'], ['wav', 'pcm_s24le'], ['flac', 'flac']]) {
        execFileSync(binary('ffmpeg'), ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'lavfi', '-i',
            'sine=frequency=330:sample_rate=48000:duration=12', '-c:a', codec,
            path.join(inputs, format === 'flac' ? 'nested' : '.', `input.${format}`)]);
    }
    fs.writeFileSync(path.join(inputs, 'ignored.txt'), 'Not audio');
    if (!fs.existsSync(path.join(inputs, 'shortcut.wav'))) fs.symlinkSync(path.join(inputs, 'input.wav'), path.join(inputs, 'shortcut.wav'));
    application = await _electron.launch({ executablePath: path.join(appPath, 'Contents/MacOS/Hexbloop LOCAL TEST'),
        env: { ...process.env, PATH: '/usr/bin:/bin:/usr/sbin:/sbin' }, timeout: 45000 });
    const processLog = fs.createWriteStream(path.join(root, 'app-test-process.log'));
    application.process().stdout?.pipe(processLog);
    application.process().stderr?.pipe(processLog);
    const page = await application.firstWindow();
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.waitForFunction(() => Boolean(window.hexbloopMystic && window.electronAPI));
    await check('Packaged launch, local marker and isolated settings', async () => {
        await page.locator('#localTestMarker').waitFor();
        const info = await application.evaluate(({ app, BrowserWindow }) => ({ packaged: app.isPackaged,
            appPath: app.getAppPath(), userData: app.getPath('userData'),
            security: BrowserWindow.getAllWindows()[0].webContents.getLastWebPreferences() }));
        assert(info.packaged && info.appPath.includes('.app/Contents/Resources/app.asar'));
        assert.strictEqual(info.userData, path.join(root, 'user-data'));
        assert.strictEqual(info.security.nodeIntegration, false);
        assert.strictEqual(info.security.contextIsolation, true);
        assert.strictEqual(info.security.webSecurity, true);
        return { ...info, security: { nodeIntegration: false, contextIsolation: true, webSecurity: true, sandbox: info.security.sandbox } };
    });
    await check('Bundled native DSP and genuine audio analysis; no Homebrew/Sox', async () => {
        const info = await application.evaluate(async ({ app }, input) => {
            const modules = app.getAppPath();
            const binaries = process.mainModule.require(modules + '/src/binary-resolver');
            const features = await process.mainModule.require(modules + '/src/audio-analyzer').analyzeAudio(input);
            return { binaries, analysisAvailable: features.analysisAvailable, duration: features.duration, energy: features.energy };
        }, path.join(inputs, 'input.wav'));
        assert.strictEqual(info.binaries.ffmpeg.path, binary('ffmpeg'));
        assert.strictEqual(info.binaries.ffprobe.path, binary('ffprobe'));
        assert.strictEqual(info.binaries.sox.path, null);
        assert(info.analysisAvailable && info.duration > 0);
        return info;
    });
    // Only the native picker result is substituted. The actual button, secure
    // IPC, recursive discovery, DSP and renderer receipt all run unchanged.
    await application.evaluate(({ dialog }, folder) => {
        dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [folder] });
    }, inputs);
    await check('Folder button processes nested MP3/WAV/FLAC and skips symlinks', async () => {
        await page.locator('#chooseFolder').click();
        await page.waitForFunction(() => document.getElementById('receiptSummary').textContent === '3 ready', undefined, { timeout: 90000 });
        const pairs = await page.evaluate(() => window.hexbloopMystic.successfulPairs);
        assert.strictEqual(pairs.length, 3);
        assert.deepStrictEqual(pairs.map(pair => path.extname(pair.outputFile)).sort(), ['.flac', '.mp3', '.wav']);
        assert((await page.locator('#skippedToggle').textContent()).includes('2 skipped'));
        assert((await page.locator('#receiptIssues').textContent()).includes('Symlink not followed'));
        return pairs;
    });
    const pairs = await page.evaluate(() => window.hexbloopMystic.successfulPairs);
    for (const pair of pairs) {
        await check(path.extname(pair.outputFile) + ' processed audio, metadata and 1000px art', async () => {
            const info = probe(pair.outputFile);
            const streams = info.streams;
            assert.strictEqual(streams.filter(stream => stream.codec_type === 'audio').length, 1);
            assert(Number(info.format.duration) > 0);
            if (path.extname(pair.outputFile) === '.wav') {
                const cover = pair.outputFile.replace(/\.wav$/, '_cover.png');
                const png = fs.readFileSync(cover);
                assert.strictEqual(png.readUInt32BE(16), 1000);
                assert.strictEqual(png.readUInt32BE(20), 1000);
            } else {
                const art = streams.find(stream => stream.codec_type === 'video');
                assert(art && art.width === 1000 && art.height === 1000);
                assert(Object.keys(info.format.tags || {}).length > 0);
            }
            assert.notDeepStrictEqual(fs.readFileSync(pair.originalFile), fs.readFileSync(pair.outputFile));
            return { file: pair.outputFile, container: info.format.format_name, duration: info.format.duration };
        });
    }
    for (let i = 0; i < pairs.length; i++) {
        await check(path.extname(pairs[i].outputFile) + ' real A/B decode, play, flip and pause', async () => {
            await page.evaluate(index => window.hexbloopMystic.loadABResult(index), i);
            await page.waitForFunction(() => {
                const player = window.hexbloopMystic;
                return player.abState === 'processed' && !player.abAudio.paused && player.abAudio.currentTime > 0 && !player.abAudio.error;
            }, undefined, { timeout: 20000 });
            await page.locator('#flipAB').click();
            await page.waitForFunction(() => {
                const player = window.hexbloopMystic;
                return player.abState === 'original' && !player.abAudio.paused && player.abAudio.currentTime > 0 && !player.abAudio.error;
            }, undefined, { timeout: 20000 });
            await page.locator('#pauseAB').click();
            assert(await page.evaluate(() => window.hexbloopMystic.abAudio.paused));
            return { nativeDecodeAndPlayback: true, humanListeningReview: 'not performed' };
        });
    }
    await check('All eight artwork styles in packaged native canvas', async () => {
        return application.evaluate(async ({ app }, output) => {
            const fs = process.mainModule.require('fs');
            const Generator = process.mainModule.require(app.getAppPath() + '/src/artwork-generator-vibrant-refined');
            const styles = ['neon-plasma', 'cosmic-flow', 'vapor-dream', 'cyber-matrix', 'sunset-liquid', 'electric-storm', 'crystal-prism', 'ocean-aurora'];
            fs.mkdirSync(output, { recursive: true });
            for (const style of styles) {
                const generator = new Generator({ width: 1000, height: 1000, seed: 42 });
                const canvas = await generator.generate({ style, seed: 42, audioEnergy: 0.5, tempo: 120, moonPhase: 0.5 });
                const buffer = canvas.toBuffer('image/png');
                if (buffer.readUInt32BE(16) !== 1000 || buffer.readUInt32BE(20) !== 1000) throw new Error(style + ': invalid dimensions');
                fs.writeFileSync(output + '/' + style + '.png', buffer);
            }
            return styles;
        }, path.join(root, 'artwork'));
    });
    await check('Open Output uses actual shell/Finder', async () => {
        assert.strictEqual(await page.evaluate(() => window.electronAPI.openOutput()), true);
    });
    await check('Session output folder and manifest', async () => {
        await application.evaluate(async ({ app }) => {
            const pm = process.mainModule.require(app.getAppPath() + '/src/menu/preferences').getPreferencesManager();
            await pm.updateSettings({ batch: { sessionFolders: true, folderScheme: 'date' } });
        });
        const results = await page.evaluate(input => window.electronAPI.processAudio([input]), path.join(inputs, 'input.wav'));
        assert.strictEqual(results.filter(result => result.success).length, 1);
        const folder = path.dirname(results[0].outputFile);
        assert.notStrictEqual(folder, path.join(root, 'output'));
        assert(JSON.parse(fs.readFileSync(path.join(folder, 'manifest.json'), 'utf8')).files.some(file => file.success));
        await application.evaluate(async ({ app }) => {
            const pm = process.mainModule.require(app.getAppPath() + '/src/menu/preferences').getPreferencesManager();
            await pm.updateSettings({ batch: { sessionFolders: false } });
        });
        return folder;
    });
    await page.screenshot({ path: path.join(root, 'local-app.png') });
    await check('No renderer errors', () => assert.deepStrictEqual(pageErrors, []));
})().catch(error => { report.failures.push({ name: 'Harness', error: error.stack }); console.error(error); }).finally(async () => {
    if (application) await application.close();
    fs.writeFileSync(path.join(root, 'packaged-test-results.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ passed: report.checks.length, failed: report.failures.length, evidence: root }));
    if (report.failures.length) process.exitCode = 1;
});
