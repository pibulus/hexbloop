/**
 * @fileoverview Secure IPC bridge for Hexbloop
 * @author Hexbloop Audio Labs
 * @description Preload script providing secure IPC communication
 */

const { contextBridge, ipcRenderer, webUtils } = require('electron');

// Expose protected methods that allow the renderer process to use the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    processAudio: (filePaths) => ipcRenderer.invoke('process-audio', filePaths),
    selectFiles: () => ipcRenderer.invoke('select-files'),
    openPreferences: () => ipcRenderer.invoke('open-preferences'),
    getSettings: () => ipcRenderer.invoke('get-settings'),

    // Read an audio file's bytes so the renderer can A/B play it via a Blob URL
    // (webSecurity + CSP block <audio> from loading file:// paths directly)
    readAudioFile: (filePath) => ipcRenderer.invoke('read-audio-file', filePath),

    // New method for getting file paths from dropped files (Electron v32+ compatible)
    getFilePathsFromFiles: (files) => {
        return files.map(file => webUtils.getPathForFile(file));
    },

    // Event listeners for progress updates
    onProcessingProgress: (callback) => ipcRenderer.on('processing-progress', callback),
    onFileDropped: (callback) => ipcRenderer.on('file-dropped', callback),
    onAmbientToggle: (callback) => ipcRenderer.on('toggle-ambient-audio', callback),
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

console.log('⚡ Preload script loaded - IPC bridge ready!');