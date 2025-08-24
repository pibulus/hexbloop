/**
 * @fileoverview Preferences window manager
 * @author Hexbloop Audio Labs
 * @description Manages the preferences window with proper lifecycle
 */

const { BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { getPreferencesManager } = require('./preferences');
const { WINDOW_CONFIG } = require('../shared/constants');

class PreferencesWindow {
    constructor(parentWindow) {
        this.parentWindow = parentWindow;
        this.preferencesManager = getPreferencesManager();
        this.window = null;
        
        // Singleton instance
        if (PreferencesWindow.instance) {
            return PreferencesWindow.instance;
        }
        PreferencesWindow.instance = this;
    }
    
    /**
     * Create the preferences window
     * @returns {Promise<BrowserWindow>} The preferences window
     */
    async create() {
        if (this.window && !this.window.isDestroyed()) {
            this.window.focus();
            return this.window;
        }
        
        this.window = new BrowserWindow({
            width: WINDOW_CONFIG.PREFERENCES.WIDTH,
            height: WINDOW_CONFIG.PREFERENCES.HEIGHT,
            minWidth: WINDOW_CONFIG.PREFERENCES.MIN_WIDTH,
            minHeight: WINDOW_CONFIG.PREFERENCES.MIN_HEIGHT,
            maxWidth: WINDOW_CONFIG.PREFERENCES.MAX_WIDTH,
            maxHeight: WINDOW_CONFIG.PREFERENCES.MAX_HEIGHT,
            title: 'Hexbloop Preferences',
            backgroundColor: WINDOW_CONFIG.PREFERENCES.BACKGROUND_COLOR,
            titleBarStyle: 'default',
            parent: this.parentWindow,
            modal: false, // Remove modal to fix reopening issue
            show: false,
            resizable: false, // Fixed size window per Apple guidelines
            center: true, // Center on screen
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                webSecurity: true,
                sandbox: false,
                preload: path.join(__dirname, '../renderer/preferences/preferences-preload.js')
            }
        });
        
        // Load the preferences UI
        await this.window.loadFile('src/renderer/preferences/preferences.html');
        
        // Show when ready
        this.window.once('ready-to-show', () => {
            this.window.show();
        });
        
        // Clean up when closed
        this.window.on('closed', () => {
            this.window = null;
        });
        
        // Handle window blur/focus for visual effects
        this.window.on('blur', () => {
            this.window.webContents.send('window-blur');
        });
        
        this.window.on('focus', () => {
            this.window.webContents.send('window-focus');
        });
        
        return this.window;
    }
    
    
    /**
     * Show the preferences window (create if needed)
     * @returns {Promise<BrowserWindow>} The preferences window
     */
    async show() {
        return this.create();
    }
    
    /**
     * Focus the preferences window if it exists
     */
    focus() {
        if (this.window && !this.window.isDestroyed()) {
            this.window.focus();
        }
    }
    
    /**
     * Close the preferences window
     */
    close() {
        if (this.window && !this.window.isDestroyed()) {
            this.window.close();
        }
    }
    
    /**
     * Check if preferences window is open
     * @returns {boolean} True if window exists and is not destroyed
     */
    isOpen() {
        return this.window && !this.window.isDestroyed();
    }
    
    /**
     * Get the current window instance
     * @returns {BrowserWindow|null} The window instance
     */
    getWindow() {
        return this.window;
    }
    
    /**
     * Reset the singleton instance (mainly for testing)
     */
    static reset() {
        PreferencesWindow.instance = null;
    }
}

module.exports = { PreferencesWindow };