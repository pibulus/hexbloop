/**
 * @fileoverview Secure IPC bridge for Hexbloop
 * @author Hexbloop Audio Labs
 * @description Preload script providing secure IPC communication
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    processAudio: (filePaths) => ipcRenderer.invoke('process-audio', filePaths),
    selectFiles: () => ipcRenderer.invoke('select-files'),
    getFilePathsFromDrop: (files) => ipcRenderer.invoke('get-file-paths-from-drop', files),
    
    // Event listeners for progress updates
    onProcessingUpdate: (callback) => ipcRenderer.on('processing-update', callback),
    onProcessingProgress: (callback) => ipcRenderer.on('processing-progress', callback),
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

console.log('⚡ Preload script loaded - IPC bridge ready!');