const assert = require('assert');
const path = require('path');
const Module = require('module');
const { chromium } = require('playwright');
const { DEFAULT_SETTINGS } = require('../src/shared/settings-schema');

(async () => {
    // Native menus/dialogs: exercise the real builder with bounded Electron stubs.
    const dialogs = [], links = [], updates = [];
    let response = 2;
    const electron = { app: { getName: () => 'Hexbloop', getVersion: () => 'test', isPackaged: true },
        Menu: { buildFromTemplate: template => template },
        dialog: { showMessageBox: async (...args) => { dialogs.push(args.at(-1)); return { response }; } },
        shell: { openExternal: async url => links.push(url) } };
    const load = Module._load;
    Module._load = function (request, parent, ...rest) {
        if (request === 'electron') return electron;
        if (request === './preferences' && parent?.filename.endsWith('menu-builder.js')) return {
            getPreferencesManager: () => ({
                getSetting: path => ({ 'output.format': 'source', 'metadata.mode': 'generated' })[path] ?? true,
                updateSetting: async (path, value) => { updates.push([path, value]); }
            })
        };
        return load.call(this, request, parent, ...rest);
    };
    let MenuBuilder;
    try { ({ MenuBuilder } = require('../src/menu/menu-builder')); }
    catch (error) { Module._load = load; throw error; }
    const builder = new MenuBuilder(null);
    const menu = builder.buildMenu();
    const flatten = items => items.flatMap(item => [item, ...flatten(item.submenu || [])]);
    const items = flatten(menu);
    assert.strictEqual(items.find(item => item.label === 'Developer').visible, false);
    assert(!items.some(item => ['Clear Cache', 'User Guide', 'Reset Preferences'].includes(item.label)));
    const format = items.find(item => item.label === 'Output Format');
    assert.deepStrictEqual(format.submenu.map(item => item.label), ['Source', 'MP3', 'WAV', 'FLAC']);
    assert.strictEqual(format.submenu[0].checked, true);
    format.submenu[3].click();
    await new Promise(resolve => setImmediate(resolve));
    assert.deepStrictEqual(updates, [['output.format', 'flac']]);
    const audio = items.find(item => item.label === 'Audio Processing');
    assert.deepStrictEqual(audio.submenu.filter(item => item.type === 'checkbox').map(item => item.label),
        ['Master · EQ and loudness', 'Compress · Lunar tape color', 'Artwork · image or sidecar', 'Metadata', 'Rename']);
    await builder.showAbout();
    assert.deepStrictEqual(dialogs.at(-1).buttons, ['Website', 'Licenses', 'Close']);
    assert(!/Sox|pipeline|technical excellence/.test(dialogs.at(-1).detail));
    response = 0;
    await builder.showAbout();
    assert.deepStrictEqual(links, ['https://hexbloop.app']);
    await builder.showHelp();
    assert.strictEqual(dialogs.at(-1).title, 'Quick Start');
    assert.strictEqual(dialogs.at(-1).detail.split('\n').length, 3);
    assert.strictEqual(links.length, 1, 'Quick Start must stay in app');
    response = 1;
    await builder.showAbout();
    assert.strictEqual(dialogs.at(-1).title, 'Third-party notices');
    assert(!/approved|cleared for distribution/i.test(dialogs.at(-1).detail));
    Module._load = load;

    const browser = await chromium.launch({ headless: true });
    try {
        const page = await browser.newPage({ viewport: { width: 600, height: 500 } });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.addInitScript(defaults => {
            let settings = structuredClone(defaults), changed = () => {};
            window.__rejectSave = false;
            window.preferencesAPI = {
                getSettings: async () => structuredClone(settings), onSettingsChanged: callback => { changed = callback; },
                updateSetting: async (setting, value) => {
                    if (window.__rejectSave) return { success: false, error: 'Read only' };
                    const keys = setting.split('.'); settings[keys[0]][keys[1]] = value;
                    changed(structuredClone(settings)); return { success: true };
                },
                onWindowBlur() {}, onWindowFocus() {}, removeAllListeners() {},
                chooseOutputFolder: async () => ({ success: true, path: '/Music/Bloops' }),
                confirmReset: async () => window.__confirmReset !== false,
                resetToDefaults: async () => {
                    if (window.__confirmReset === false) return { success: false };
                    settings = structuredClone(defaults);
                    changed(structuredClone(settings));
                    return { success: true };
                }
            };
        }, DEFAULT_SETTINGS);
        await page.goto('file://' + path.resolve('src/renderer/preferences/preferences.html'));
        await page.waitForFunction(() => document.getElementById('output-format').value === 'source');
        assert.deepStrictEqual(await page.locator('[role="tab"]').allTextContents(), ['Output', 'Character']);
        assert.strictEqual(await page.locator('[data-setting^="processing."]').count(), 0);
        assert.strictEqual(await page.locator('.setting-card, .hex-particle, #close-btn').count(), 0);
        await page.locator('#choose-folder-btn').click();
        assert.strictEqual(await page.locator('#output-folder').inputValue(), '/Music/Bloops');
        await page.locator('#batch-session-folders').check();
        assert(await page.locator('#batch-folder-scheme-wrapper').isVisible());
        await page.locator('#batch-folder-scheme').selectOption('lunar');
        await page.locator('#output-format').selectOption('flac');
        await page.locator('#character-label').click();
        assert(await page.locator('#custom-metadata-section').isHidden());
        await page.locator('#metadata-custom').check();
        assert(await page.locator('#custom-metadata-section').isVisible());
        await page.locator('#custom-artist').fill('Local Artist');
        await page.locator('#custom-album').focus();
        await page.waitForFunction(async () => (await window.preferencesAPI.getSettings()).metadata.artist === 'Local Artist');
        await page.locator('#metadata-generated').check();
        assert(await page.locator('#custom-metadata-section').isHidden());
        await page.locator('#artwork-style').selectOption('ocean-aurora');
        await page.evaluate(() => { window.__rejectSave = true; });
        const initial = await page.locator('#ambientAudio').isChecked();
        await page.locator('#ambientAudio').click();
        await page.waitForFunction(value => document.getElementById('ambientAudio').checked === value, initial);
        assert((await page.locator('#settings-status').textContent()).includes('Read only'));
        await page.locator('#settingsMenu summary').click();
        assert(await page.locator('#reset-btn').isVisible());
        await page.keyboard.press('Escape');
        assert(await page.locator('#reset-btn').isHidden());
        await page.evaluate(() => { window.__confirmReset = false; });
        await page.locator('#settingsMenu summary').click();
        await page.locator('#reset-btn').click();
        await page.waitForFunction(() => document.getElementById('output-format').value === 'flac');
        await page.evaluate(() => { window.__confirmReset = true; });
        await page.locator('#settingsMenu summary').click();
        await page.locator('#reset-btn').click();
        await page.waitForFunction(() => document.getElementById('output-format').value === 'source');
        await page.locator('#character-label').focus();
        await page.keyboard.press('ArrowLeft');
        assert.strictEqual(await page.locator('#output-label').getAttribute('aria-selected'), 'true');
        assert.deepStrictEqual(errors, []);
        console.log('Settings: two quiet tabs, conditional fields, saves/rollback, actions menu, keyboard; native About/Quick Start and public menus pass');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
