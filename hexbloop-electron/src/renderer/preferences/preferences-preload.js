/**
 * @fileoverview Preload script for preferences window
 * @author Hexbloop Audio Labs
 * @description Secure IPC bridge for mystical preferences communication
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose secure API to renderer process
contextBridge.exposeInMainWorld('preferencesAPI', {
    // Settings management
    getSettings: () => ipcRenderer.invoke('preferences-get-settings'),
    updateSetting: (settingPath, value) => ipcRenderer.invoke('preferences-update-setting', settingPath, value),
    updateSettings: (newSettings) => ipcRenderer.invoke('preferences-update-settings', newSettings),
    resetToDefaults: () => ipcRenderer.invoke('preferences-reset-defaults'),
    
    // Import/Export
    exportSettings: () => ipcRenderer.invoke('preferences-export'),
    importSettings: (data) => ipcRenderer.invoke('preferences-import', data),
    
    // UI interactions
    chooseOutputFolder: () => ipcRenderer.invoke('preferences-choose-output-folder'),
    closeWindow: () => ipcRenderer.invoke('preferences-close'),
    
    // Window events
    onWindowBlur: (callback) => ipcRenderer.on('window-blur', callback),
    onWindowFocus: (callback) => ipcRenderer.on('window-focus', callback),
    
    // Remove listeners
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});