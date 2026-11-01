const { contextBridge } = require('electron');
const settings = {
    processing: { mastering: true, compressing: false, coverArt: false, metadata: false, renaming: false },
    output: { format: 'source', sampleRate: 0 },
    ui: { outputFolder: '/Documents/HexbloopOutput', ambientAudio: false }
};
contextBridge.exposeInMainWorld('electronAPI', {
    getSettings: async () => settings,
    onSettingsChanged() {}, onProcessingProgress() {}, onFileDropped() {}, onAmbientToggle() {},
    setMainSwitch: async (name, enabled) => { settings.processing[name] = enabled; return settings; },
    setOutputFormat: async format => { settings.output.format = format; return settings; },
    processAudio: async () => [
        ...Array.from({ length: 28 }, (_, index) => ({ success: true,
            originalFile: `/test/track-${index}.wav`, outputFile: `/output/track-${index}.wav` })),
        { success: false, originalFile: '/test/broken.wav', error: 'Decoder unavailable' },
        { success: false, skipped: true, fileName: 'shortcut.wav', reason: 'Symlink not followed' }
    ],
    selectPreviewPair: async () => true,
    readAudioFile: async () => ({ success: false, error: 'Preview unavailable · Open Output' }),
    selectFiles: async () => [], selectFolders: async () => [], openOutput: async () => true,
    getFilePathsFromFiles: () => [], openPreferences: async () => {}
});
