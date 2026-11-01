const assert = require('assert');
const path = require('path');
const { chromium } = require('playwright');
const { summarizeBatch } = require('../src/renderer/batch-receipt');

(async () => {
    const results = Array.from({ length: 28 }, (_, index) => ({ success: true,
        originalFile: `/fixtures/song-${index}.wav`, outputFile: `/output/song-${index}.wav` }));
    results[0].originalFile = '/fixtures/slow-0.wav';
    results[2].outputFile = '/output/oversize.wav';
    results.push({ success: false, originalFile: '/fixtures/broken.wav', error: 'Decoder unavailable' });
    results.push({ success: false, skipped: true, fileName: 'shortcut.wav', reason: 'Symlink not followed' });
    const receipt = summarizeBatch(results);
    assert.strictEqual(receipt.summary, '28 ready · 2 skipped');
    assert.deepStrictEqual(receipt.issues.map(issue => issue.fileName), ['broken.wav', 'shortcut.wav']);

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
        const settings = { processing: { mastering: true, compressing: false, coverArt: false,
            metadata: false, renaming: false }, output: { format: 'source', sampleRate: 0 },
        ui: { outputFolder: '/output', ambientAudio: false } };
        window.__activeUrls = new Set();
        window.__reads = [];
        window.__opened = 0;
        const create = URL.createObjectURL.bind(URL), revoke = URL.revokeObjectURL.bind(URL);
        URL.createObjectURL = blob => { const url = create(blob); window.__activeUrls.add(url); return url; };
        URL.revokeObjectURL = url => { window.__activeUrls.delete(url); return revoke(url); };
        window.electronAPI = {
            getSettings: async () => settings,
            onSettingsChanged: () => {}, onProcessingProgress: () => {}, onFileDropped: () => {}, onAmbientToggle: () => {},
            processAudio: async () => window.__results,
            selectPreviewPair: async () => true,
            readAudioFile: async file => {
                window.__reads.push(file);
                if (file.includes('slow')) await new Promise(resolve => setTimeout(resolve, 90));
                if (file.includes('oversize')) return { success: false, error: 'Preview unavailable above 24 MB' };
                return { success: true, mime: 'audio/wav', data: new Uint8Array([82,73,70,70]) };
            },
            selectFiles: async () => [], selectFolders: async () => [], openOutput: async () => { window.__opened++; return true; },
            getFilePathsFromFiles: entries => entries.map(entry => entry.name), openPreferences: async () => {}
        };
    });
    await page.goto('file://' + path.resolve('src/renderer/index.html'));
    await page.evaluate(async batch => {
        window.__results = batch;
        await window.hexbloopMystic.processFiles(['/fixtures']);
    }, results);
    assert.strictEqual(await page.locator('#receiptSummary').textContent(), '28 ready');
    assert((await page.locator('#skippedToggle').textContent()).includes('2 skipped'));
    assert(await page.locator('#skippedPopover').isHidden());
    await page.locator('#skippedToggle').click();
    assert((await page.locator('#receiptIssues').textContent()).includes('Decoder unavailable'));
    assert((await page.locator('#receiptIssues').textContent()).includes('Symlink not followed'));
    assert.strictEqual(await page.locator('#receiptPosition').textContent(), '1/28 · song-0.wav');
    await page.locator('#skippedToggle').click();
    assert(await page.locator('#previousFile').isDisabled());
    assert(await page.locator('#nextFile').isEnabled());
    assert(await page.locator('#batchReceipt').isVisible());

    // Renderer audio is stubbed only for interaction timing; no synthetic
    // decode is passed off as a listening test.
    await page.evaluate(() => {
        const app = window.hexbloopMystic;
        app.abAudio.play = async () => {};
        app.abAudio.pause = () => {};
        app.isAudioPlaying = true;
        app.currentSettings.ui.ambientAudio = true;
        app.ambientAudio.pause = () => { window.__ambientPaused = true; };
        app.startAmbientAudio = () => { window.__ambientRestored = true; app.isAudioPlaying = true; };
        app.abAudio.dispatchEvent(new Event('loadedmetadata'));
    });
    await page.waitForFunction(() => window.__ambientPaused === true);
    await page.locator('#flipAB').click();
    await page.waitForFunction(() => window.__reads.some(item => item.includes('slow-0')));
    await page.evaluate(() => window.hexbloopMystic.abAudio.dispatchEvent(new Event('loadedmetadata')));
    await page.evaluate(() => document.activeElement.blur());
    await page.keyboard.press('a');
    await page.evaluate(() => window.hexbloopMystic.abAudio.dispatchEvent(new Event('loadedmetadata')));
    await page.locator('#nextFile').click();
    await page.waitForFunction(() => document.getElementById('receiptPosition').textContent.startsWith('2/28'));
    await page.locator('#nextFile').click();
    await page.waitForFunction(() => document.getElementById('previewStatus').title.includes('above 24 MB'));
    assert(await page.locator('#batchReceipt').isVisible());
    await page.locator('#openOutput').click();
    assert.strictEqual(await page.evaluate(() => window.__opened), 1);

    // A late read from pair zero cannot take over pair one or leak a Blob URL.
    await page.evaluate(async () => {
        const app = window.hexbloopMystic;
        const slow = app.loadABResult(0);
        const fast = app.loadABResult(1);
        await Promise.all([slow, fast]);
    });
    assert.strictEqual(await page.evaluate(() => window.hexbloopMystic.selectedPairIndex), 1);
    assert((await page.evaluate(() => window.__activeUrls.size)) <= 1);
    await page.evaluate(() => window.hexbloopMystic.stopAB());
    assert.strictEqual(await page.evaluate(() => window.__activeUrls.size), 0);
    assert(await page.locator('#batchReceipt').isVisible());
    assert.strictEqual(await page.evaluate(() => window.__ambientRestored), true);
    await page.locator('#hexStack').click(); // Cancelled picker retains receipt.
    assert(await page.locator('#batchReceipt').isVisible());
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.strictEqual(await page.locator('#hexOuter').evaluate(element => getComputedStyle(element).animationName), 'none');
    assert.strictEqual(await page.locator('[data-parallax-depth="0.8"]').evaluate(element => getComputedStyle(element).transform), 'none');
    assert.deepStrictEqual(errors, []);
    console.log('UI: 28/2 persistent receipt; mouse/keyboard A/B, oversized fallback, rapid switches, ambient restore, navigation, Open Output pass');
    await browser.close();
})().catch(error => { console.error(error); process.exitCode = 1; });
