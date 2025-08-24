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
        console.log('🔨 PreferencesWindow.create() called');
        
        if (this.window && !this.window.isDestroyed()) {
            console.log('🔄 Window already exists, focusing it');
            this.window.show();
            this.window.focus();
            return this.window;
        }
        
        console.log('🏗️ Creating new BrowserWindow for preferences');
        
        // Check if constants are defined
        if (!WINDOW_CONFIG || !WINDOW_CONFIG.PREFERENCES) {
            console.error('❌ WINDOW_CONFIG.PREFERENCES is not defined, using defaults');
            // Use fallback values
            const windowConfig = {
                width: 600,
                height: 400,
                minWidth: 500,
                minHeight: 350,
                title: 'Hexbloop Preferences',
                backgroundColor: '#1a1a2e',
                titleBarStyle: 'default',
                parent: this.parentWindow,
                modal: false,
                show: true, // Show immediately for debugging
                resizable: false,
                center: true,
                webPreferences: {
                    nodeIntegration: false,
                    contextIsolation: true,
                    webSecurity: true,
                    sandbox: false,
                    preload: path.join(__dirname, '../renderer/preferences/preferences-preload.js')
                }
            };
            
            this.window = new BrowserWindow(windowConfig);
        } else {
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
                modal: false,
                show: true, // Show immediately for debugging
                resizable: false,
                center: true,
                webPreferences: {
                    nodeIntegration: false,
                    contextIsolation: true,
                    webSecurity: true,
                    sandbox: false,
                    preload: path.join(__dirname, '../renderer/preferences/preferences-preload.js')
                }
            });
        }
        
        console.log('🔧 Window created, loading HTML file');
        
        try {
            // loadFile expects path relative to app root
            const htmlPath = 'src/renderer/preferences/preferences.html';
            console.log('📄 Loading HTML from:', htmlPath);
            
            await this.window.loadFile(htmlPath);
            console.log('✅ HTML file loaded successfully');
        } catch (error) {
            console.error('❌ Error loading preferences HTML:', error);
            // Load error page
            this.window.loadURL(`data:text/html,
                <html>
                    <body style="background: #1a1a2e; color: white; font-family: sans-serif; padding: 20px;">
                        <h1>Error Loading Preferences</h1>
                        <p>${error.message}</p>
                    </body>
                </html>
            `);
        }
        
        // Show immediately since we set show: true
        this.window.show();
        this.window.focus();
        
        // Clean up when closed
        this.window.on('closed', () => {
            console.log('🔒 Preferences window closed');
            this.window = null;
        });
        
        // Handle window blur/focus for visual effects
        this.window.on('blur', () => {
            if (this.window && !this.window.isDestroyed()) {
                this.window.webContents.send('window-blur');
            }
        });
        
        this.window.on('focus', () => {
            if (this.window && !this.window.isDestroyed()) {
                this.window.webContents.send('window-focus');
            }
        });
        
        console.log('🎉 Preferences window created and shown');
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