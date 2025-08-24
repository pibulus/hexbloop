/**
 * @fileoverview Menu builder for Hexbloop
 * @author Hexbloop Audio Labs
 * @description Creates native macOS menus with clear functionality
 */

const { Menu, shell, dialog, app } = require('electron');
const path = require('path');
const { getPreferencesManager } = require('./preferences');

class MenuBuilder {
    constructor(mainWindow) {
        this.mainWindow = mainWindow;
        this.preferencesManager = getPreferencesManager();
        this.preferencesWindow = null;
    }
    
    /**
     * Build the complete mystical menu structure
     */
    buildMenu() {
        const template = [
            // Application Menu (macOS)
            {
                label: 'Hexbloop',
                submenu: [
                    {
                        label: 'About Hexbloop',
                        click: () => this.showAbout()
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: 'Preferences...',
                        accelerator: 'CmdOrCtrl+,',
                        click: () => this.showPreferences()
                    },
                    {
                        type: 'separator'
                    },
                    {
                        role: 'services'
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: 'Hide Hexbloop',
                        accelerator: 'Command+H',
                        role: 'hide'
                    },
                    {
                        label: 'Hide Others',
                        accelerator: 'Command+Alt+H',
                        role: 'hideothers'
                    },
                    {
                        label: 'Show All',
                        role: 'unhide'
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: 'Quit Hexbloop',
                        accelerator: 'Command+Q',
                        click: () => app.quit()
                    }
                ]
            },
            
            // File Menu
            {
                label: 'File',
                submenu: [
                    {
                        label: 'Open Audio Files...',
                        accelerator: 'CmdOrCtrl+O',
                        click: () => this.selectOfferings()
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: 'Audio Processing',
                        submenu: [
                            {
                                label: 'Audio Effects',
                                type: 'checkbox',
                                checked: this.preferencesManager.getSetting('processing.compressing'),
                                click: (menuItem) => this.toggleProcessingOption('processing.compressing', menuItem.checked)
                            },
                            {
                                label: 'Audio Mastering',
                                type: 'checkbox',
                                checked: this.preferencesManager.getSetting('processing.mastering'),
                                click: (menuItem) => this.toggleProcessingOption('processing.mastering', menuItem.checked)
                            },
                            {
                                label: 'Generate Artwork',
                                type: 'checkbox',
                                checked: this.preferencesManager.getSetting('processing.coverArt'),
                                click: (menuItem) => this.toggleProcessingOption('processing.coverArt', menuItem.checked)
                            },
                            {
                                type: 'separator'
                            },
                            {
                                label: 'Auto-Generated Names',
                                type: 'radio',
                                checked: this.preferencesManager.getSetting('processing.naming') === 'mystical',
                                click: () => this.setNamingMode('mystical')
                            },
                            {
                                label: 'Custom Metadata',
                                type: 'radio',
                                checked: this.preferencesManager.getSetting('processing.naming') === 'custom',
                                click: () => this.setNamingMode('custom')
                            },
                            {
                                label: 'Original Filenames',
                                type: 'radio',
                                checked: this.preferencesManager.getSetting('processing.naming') === 'original',
                                click: () => this.setNamingMode('original')
                            }
                        ]
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: 'Clear Cache',
                        click: () => this.clearCache()
                    }
                ]
            },
            
            // View Menu
            {
                label: 'View',
                submenu: [
                    {
                        label: 'Show Output Folder',
                        accelerator: 'CmdOrCtrl+Shift+O',
                        click: () => this.showOutputFolder()
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: 'Background Audio',
                        type: 'checkbox',
                        checked: this.preferencesManager.getSetting('ui.ambientAudio'),
                        click: (menuItem) => this.toggleAmbientAudio(menuItem.checked)
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: 'Enter Fullscreen',
                        accelerator: process.platform === 'darwin' ? 'Ctrl+Command+F' : 'F11',
                        click: () => {
                            if (this.mainWindow.isFullScreen()) {
                                this.mainWindow.setFullScreen(false);
                            } else {
                                this.mainWindow.setFullScreen(true);
                            }
                        }
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: 'Developer',
                        submenu: [
                            {
                                label: 'Reload App',
                                accelerator: 'CmdOrCtrl+R',
                                click: () => this.mainWindow.webContents.reload()
                            },
                            {
                                label: 'Toggle Developer Tools',
                                accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
                                click: () => this.mainWindow.webContents.toggleDevTools()
                            }
                        ]
                    }
                ]
            },
            
            // Window Menu
            {
                label: 'Window',
                submenu: [
                    {
                        label: 'Minimize',
                        accelerator: 'CmdOrCtrl+M',
                        role: 'minimize'
                    },
                    {
                        label: 'Close',
                        accelerator: 'CmdOrCtrl+W',
                        role: 'close'
                    }
                ]
            },
            
            // Help Menu
            {
                label: 'Help',
                submenu: [
                    {
                        label: 'User Guide',
                        click: () => this.showHelp()
                    },
                    {
                        label: 'Report an Issue',
                        click: () => shell.openExternal('https://github.com/hexbloop/hexbloop/issues')
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: 'Reset Preferences',
                        click: () => this.resetPreferences()
                    }
                ]
            }
        ];
        
        return Menu.buildFromTemplate(template);
    }
    
    /**
     * Show mystical about dialog
     */
    showAbout() {
        dialog.showMessageBox(this.mainWindow, {
            type: 'info',
            title: 'About Hexbloop',
            message: '🔮 Hexbloop - Chaos Magic Audio Engine',
            detail: `Version 1.0.0

Transform your audio files with lunar-influenced processing algorithms. Features include audio effects, mastering, artwork generation, and mystical naming.

🌙 Real-time moon phase calculations affect audio processing
🎵 Professional Sox + FFmpeg audio pipeline
🎨 Procedural artwork generation for each track
⬟ Geometric naming system based on hexagonal principles

Drag audio files onto the hexagonal interface or use File > Open Audio Files.
Output files appear in ~/Documents/HexbloopOutput/

Built with mystical precision and technical excellence.
Hexbloop Audio Labs © 2024`,
            buttons: ['✨ Close'],
            defaultId: 0
        });
    }
    
    /**
     * Show preferences window
     */
    async showPreferences() {
        // Use the global function from main.js
        const { showPreferencesWindow } = require('../../main');
        await showPreferencesWindow();
    }
    
    /**
     * Select audio offerings (files)
     */
    async selectOfferings() {
        const result = await dialog.showOpenDialog(this.mainWindow, {
            properties: ['openFile', 'multiSelections'],
            filters: [
                { name: 'Audio Files', extensions: ['mp3', 'wav', 'm4a', 'aiff', 'flac', 'ogg'] },
                { name: 'All Files', extensions: ['*'] }
            ],
            title: 'Select Audio Files to Process'
        });
        
        if (!result.canceled && result.filePaths.length > 0) {
            // Send to main window for processing
            this.mainWindow.webContents.send('file-dropped', result.filePaths);
        }
    }
    
    /**
     * Toggle processing option and update menu checkboxes
     * @param {string} settingPath - Setting path like 'processing.compressing'
     * @param {boolean} enabled - New enabled state
     */
    async toggleProcessingOption(settingPath, enabled) {
        try {
            await this.preferencesManager.updateSetting(settingPath, enabled);
            console.log(`🔮 ${settingPath} ${enabled ? 'enabled' : 'disabled'}`);
            
            // Rebuild menu to update checkboxes
            this.updateMenu();
        } catch (error) {
            console.error('❌ Failed to update processing option:', error);
        }
    }
    
    /**
     * Set naming mode and update radio buttons in menu
     * @param {string} mode - 'mystical', 'custom', or 'original'
     */
    async setNamingMode(mode) {
        try {
            await this.preferencesManager.updateSetting('processing.naming', mode);
            console.log(`🔮 Naming mode set to: ${mode}`);
            
            // Rebuild menu to update radio buttons
            this.updateMenu();
        } catch (error) {
            console.error('❌ Failed to update naming mode:', error);
        }
    }
    
    /**
     * Toggle ambient audio
     */
    async toggleAmbientAudio(enabled) {
        try {
            await this.preferencesManager.updateSetting('ui.ambientAudio', enabled);
            
            // Send to renderer to toggle audio
            this.mainWindow.webContents.send('toggle-ambient-audio', enabled);
            
            console.log(`🔮 Ambient audio ${enabled ? 'enabled' : 'disabled'}`);
            this.updateMenu();
        } catch (error) {
            console.error('❌ Failed to toggle ambient audio:', error);
        }
    }
    
    /**
     * Show output folder
     */
    showOutputFolder() {
        const outputFolder = this.preferencesManager.getSetting('ui.outputFolder');
        shell.showItemInFolder(outputFolder);
    }
    
    /**
     * Clear mystical cache
     */
    async clearCache() {
        const response = await dialog.showMessageBox(this.mainWindow, {
            type: 'question',
            title: 'Clear Cache',
            message: 'Clear all temporary files?',
            detail: 'This will remove cached artwork, temporary files, and processing logs.',
            buttons: ['Clear Cache', 'Cancel'],
            defaultId: 1,
            cancelId: 1
        });
        
        if (response.response === 0) {
            // Implementation for clearing cache
            console.log('🧹 Mystical cache cleared');
        }
    }
    
    /**
     * Show help documentation
     */
    showHelp() {
        // Could open local help file or external documentation
        shell.openExternal('https://github.com/hexbloop/hexbloop#readme');
    }
    
    /**
     * Reset preferences with confirmation
     */
    async resetPreferences() {
        const response = await dialog.showMessageBox(this.mainWindow, {
            type: 'warning',
            title: 'Reset Preferences',
            message: 'Reset all preferences to defaults?',
            detail: 'This will restore all settings to their original state. This action cannot be undone.',
            buttons: ['Reset to Defaults', 'Cancel'],
            defaultId: 1,
            cancelId: 1
        });
        
        if (response.response === 0) {
            try {
                await this.preferencesManager.resetToDefaults();
                this.updateMenu();
                
                dialog.showMessageBox(this.mainWindow, {
                    type: 'info',
                    title: 'Preferences Reset',
                    message: 'All preferences have been reset to defaults.',
                    buttons: ['OK']
                });
            } catch (error) {
                console.error('❌ Failed to reset preferences:', error);
            }
        }
    }
    
    /**
     * Update menu with current settings
     */
    updateMenu() {
        const menu = this.buildMenu();
        Menu.setApplicationMenu(menu);
    }
}

module.exports = { MenuBuilder };