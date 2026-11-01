const assert = require('assert');
const path = require('path');
const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    try {
        const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.addInitScript(() => {
            const settings = { processing: { mastering: true, compressing: true, coverArt: true, metadata: true, renaming: false },
                output: { format: 'source', sampleRate: 0 }, ui: { outputFolder: '/Music/Bloops', ambientAudio: false } };
            window.__selected = 0;
            window.electronAPI = {
                getSettings: async () => settings,
                setOutputFormat: async format => { settings.output.format = format; return settings; },
                setMainSwitch: async (name, value) => { settings.processing[name] = value; return settings; },
                onSettingsChanged() {}, onProcessingProgress() {}, onFileDropped() {}, onAmbientToggle() {},
                processAudio: () => new Promise(resolve => { window.__finishBatch = resolve; }),
                selectFiles: async () => { window.__selected++; return []; }, selectFolders: async () => [],
                selectPreviewPair: async () => true,
                readAudioFile: async () => ({ success: false, error: 'Preview unavailable above 24 MB' }),
                openOutput: async () => true, openPreferences() {}
            };
        });
        await page.goto('file://' + path.resolve('src/renderer/index.html'));
        await page.waitForFunction(() => Boolean(window.hexbloopMystic?.currentSettings));
        assert(await page.locator('#firstRunHint').isVisible());
        await page.mouse.move(20, 300);
        await page.waitForFunction(() => getComputedStyle(document.getElementById('topHUD')).opacity === '0.55');
        assert.strictEqual(await page.locator('.top-hud').count(), 1);
        assert.strictEqual(await page.locator('.quick-output, #newFiles').count(), 0);
        await page.locator('#formatMenu summary').click();
        assert(await page.locator('.format-options').isVisible());
        await page.locator('.format-options label').filter({ hasText: 'FLAC' }).click();
        assert.strictEqual(await page.locator('#currentFormat').textContent(), 'FLAC');
        assert.strictEqual(await page.locator('#formatMenu').getAttribute('open'), null);
        await page.locator('#formatMenu summary').click();
        await page.keyboard.press('Escape');
        assert.strictEqual(await page.locator('#formatMenu').getAttribute('open'), null);
        await page.evaluate(() => { window.__pendingBatch = window.hexbloopMystic.processFiles(['/fixtures']); });
        await page.evaluate(() => window.hexbloopMystic.updateProgress({ current: 2, total: 3, fileName: 'track.wav', status: 'processing' }));
        assert.strictEqual(await page.locator('#progressText').textContent(), 'Blooping 2 of 3 · track.wav');
        assert(await page.locator('#batchReceipt').isHidden());
        assert(await page.locator('#idleRail').isHidden());
        await page.evaluate(() => window.__finishBatch([
            ...['one', 'two', 'three'].map(name => ({ success: true, originalFile: '/input/' + name + '.wav', outputFile: '/output/' + name + '.wav' })),
            { success: false, fileName: 'shortcut.wav', reason: 'Symlink not followed' },
            { success: false, fileName: 'notes.txt', reason: 'Unsupported format' }
        ]));
        await page.evaluate(() => window.__pendingBatch);
        assert.strictEqual(await page.evaluate(() => localStorage.getItem('hexbloop-first-output')), 'done');
        assert(await page.locator('#firstRunHint').isHidden());
        assert(await page.locator('#batchReceipt').isVisible());
        assert.strictEqual(await page.locator('#progressIndicator').evaluate(element => getComputedStyle(element).display), 'none');
        assert.strictEqual(await page.locator('#batchReceipt').evaluate(element => element.getBoundingClientRect().height), 40);
        assert(await page.locator('#ambientToggle').isHidden());
        assert.strictEqual(await page.locator('#previewStatus').evaluate(element => element.getBoundingClientRect().height), 1);
        await page.locator('#hexStack').click();
        assert.strictEqual(await page.evaluate(() => window.__selected), 1);
        assert(await page.locator('#batchReceipt').isVisible());
        await page.locator('#skippedToggle').click();
        await page.mouse.move(20, 300);
        await page.waitForFunction(() => getComputedStyle(document.getElementById('batchReceipt')).opacity === '1');
        assert(await page.locator('#skippedPopover').isVisible());
        await page.keyboard.press('Escape');
        assert(await page.locator('#skippedPopover').isHidden());
        await page.evaluate(() => document.activeElement.blur());
        await page.mouse.move(20, 300);
        await page.waitForFunction(() => getComputedStyle(document.getElementById('batchReceipt')).opacity === '0.55');
        const chrome = await page.locator('.hud button:not([hidden]), .processing-switch span').evaluateAll(elements => elements
            .filter(element => element.getBoundingClientRect().width > 0).map(element => {
                const style = getComputedStyle(element);
                return { id: element.id || element.textContent, border: style.borderTopWidth, background: style.backgroundColor, shadow: style.boxShadow };
            }));
        for (const item of chrome) {
            assert.strictEqual(item.border, '0px', JSON.stringify(item));
            assert.strictEqual(item.background, 'rgba(0, 0, 0, 0)', JSON.stringify(item));
            assert.strictEqual(item.shadow, 'none', JSON.stringify(item));
        }
        await page.setViewportSize({ width: 800, height: 600 });
        assert(await page.locator('#batchReceipt').evaluate(element => element.scrollWidth <= element.clientWidth));
        assert.deepStrictEqual(errors, []);
        await page.reload();
        await page.waitForFunction(() => Boolean(window.hexbloopMystic?.currentSettings));
        assert(await page.locator('#firstRunHint').isHidden(), 'First success dismisses onboarding across launches');
        console.log('HUD: one ribbon; format popover/keyboard; exclusive progress/player; 40px transport; no inner boxes; hover dimming; minimum-window fit pass');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
