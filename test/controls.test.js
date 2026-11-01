const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { DEFAULT_SETTINGS, migrateLegacySettings, mergeWithDefaults } = require('../src/shared/settings-schema');

for (const [legacy, renaming, metadata, mode] of [
    ['mystical', true, true, 'generated'],
    ['custom', false, true, 'custom'],
    ['original', false, false, 'generated']
]) {
    const migrated = mergeWithDefaults(migrateLegacySettings({ processing: { naming: legacy } }));
    assert.strictEqual(migrated.processing.renaming, renaming);
    assert.strictEqual(migrated.processing.metadata, metadata);
    assert.strictEqual(migrated.metadata.mode, mode);
    assert.strictEqual(migrated.output.format, 'source');
}
const mixed = migrateLegacySettings({ processing: { naming: 'original', renaming: true, metadata: true },
    metadata: { mode: 'custom' }, output: { format: 'flac' } });
assert.strictEqual(mixed.processing.renaming, true);
assert.strictEqual(mixed.processing.metadata, true);
assert.strictEqual(mixed.metadata.mode, 'custom');
assert.strictEqual(mixed.output.format, 'flac');

const radios = ['generated', 'custom'].map(value => ({
    id: `metadata-${value}`, dataset: { setting: 'metadata.mode' },
    type: 'radio', value, checked: false, listeners: {},
    addEventListener(name, callback) { (this.listeners[name] ||= []).push(callback); }
}));
const controls = ['mastering', 'compressing', 'coverArt', 'metadata', 'renaming'].map(value => ({
    id: value, dataset: { setting: `processing.${value}` },
    type: 'checkbox', checked: false, listeners: {},
    addEventListener(name, callback) { (this.listeners[name] ||= []).push(callback); }
}));
const noop = { addEventListener() {}, classList: { add() {}, remove() {} } };
const document = {
    addEventListener() {},
    querySelectorAll(selector) {
        if (selector === '[data-setting]') return [...radios, ...controls];
        if (selector === 'input[name="metadata-mode"]') return radios;
        return [];
    },
    getElementById(id) { return id.startsWith('batch-folder-scheme') ? null : noop; }
};
const context = vm.createContext({ document, window: { addEventListener() {} }, console });
const source = fs.readFileSync(path.join(__dirname, '../src/renderer/preferences/preferences.js'), 'utf8');
vm.runInContext(`${source}\nglobalThis.Controller = PreferencesController;`, context);
const controller = Object.create(context.Controller.prototype);
controller.settingElements = new Map();
controller.currentSettings = structuredClone(DEFAULT_SETTINGS);
controller.setupElements();
controller.setupTabSwitching = () => {};
const updates = [];
controller.updateSetting = (setting, value) => updates.push([setting, value]);
controller.bindEvents();
assert.strictEqual(controller.settingElements.size, 7);
for (const value of ['generated', 'custom']) {
    controller.currentSettings.metadata.mode = value;
    controller.updateUI();
    assert.strictEqual(radios.filter(radio => radio.checked).length, 1);
    const radio = radios.find(item => item.value === value);
    radio.listeners.change.forEach(callback => callback({ target: radio }));
}
for (const control of controls) {
    control.listeners.change.forEach(callback => callback({ target: { checked: false } }));
}
assert.strictEqual(updates.length, 7);
assert(updates.slice(-5).every(([key]) => key.startsWith('processing.')));
console.log('Two metadata radios and five independent switches: pass');

// A failed Preferences save must restore the persisted value, not leave the
// clicked checkbox or local settings cache optimistically changed.
context.window.preferencesAPI = {
    updateSetting: async () => ({ success: false, error: 'read only' }),
    getSettings: async () => structuredClone(DEFAULT_SETTINGS)
};
controller.showError = () => {};
controls[0].checked = false;
context.Controller.prototype.updateSetting.call(controller, 'processing.mastering', false)
    .then(() => {
        assert.strictEqual(controls[0].checked, true);
        assert.strictEqual(controller.currentSettings.processing.mastering, true);
        console.log('Failed Preferences save rolls back displayed switch: pass');
    })
    .catch(error => { console.error(error); process.exitCode = 1; });
