/**
 * @fileoverview Menu builder for Hexbloop
 * @author Hexbloop Audio Labs
 * @description Creates native macOS menus with clear functionality
 */

const { Menu, shell, dialog, app } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { getPreferencesManager } = require('./preferences');

const GITHUB_REPO_URL = 'https://github.com/pibulus/hexbloop';

class MenuBuilder {
    constructor(mainWindow) {
        this.mainWindow = mainWindow;
        this.preferencesManager = getPreferencesManager();
        this.preferencesWindow = null;
    }

    /**
     * The main window if it's still alive, else null.
     * On macOS the app (and menu) outlive the window — every menu action
     * that touches the window must go through this.
     */
    getWindow() {
        return this.mainWindow && !this.mainWindow.isDestroyed() ? this.mainWindow : null;
    }
    
    /**
     * Build and set the complete mystical menu structure
     */
    buildMenu() {
        const template = [
            // Application Menu (macOS)
            {
                label: process.platform === 'darwin' ? require('electron').app.getName() : 'Hexbloop',
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
                                label: 'Generated Output Names',
                                type: 'radio',
                                checked: this.preferencesManager.getSetting('processing.naming') === 'mystical',
                                click: () => this.setNamingMode('mystical')
                            },
                            {
                                label: 'Custom Metadata Tags',
                                type: 'radio',
                                checked: this.preferencesManager.getSetting('processing.naming') === 'custom',
                                click: () => this.setNamingMode('custom')
                            },
                            {
                                label: 'Keep Original Filenames',
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
                            const window = this.getWindow();
                            if (window) {
                                window.setFullScreen(!window.isFullScreen());
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
                                click: () => this.getWindow()?.webContents.reload()
                            },
                            {
                                label: 'Toggle Developer Tools',
                                accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
                                click: () => this.getWindow()?.webContents.toggleDevTools()
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
                        click: () => shell.openExternal(`${GITHUB_REPO_URL}/issues`)
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
        
        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);
        return menu;
    }
    
    /**
     * Show mystical about dialog
     */
    showAbout() {
        const detail = `Version ${app.getVersion()}

Transform your audio files with lunar-influenced processing algorithms. Features include audio effects, mastering, artwork generation, and mystical naming.

🌙 Real-time moon phase calculations affect audio processing
🎵 Professional Sox + FFmpeg audio pipeline
🎨 Procedural artwork generation for each track
⬟ Geometric naming system based on hexagonal principles

Drag audio files onto the hexagonal interface or use File > Open Audio Files.
Output files appear in ~/Documents/HexbloopOutput/

Built with mystical precision and technical excellence.
Hexbloop Audio Labs © ${new Date().getFullYear()}`;

        const options = {
            type: 'info',
            title: 'About Hexbloop',
            message: '🔮 Hexbloop - Chaos Magic Audio Engine',
            detail,
            buttons: ['✨ Close'],
            defaultId: 0
        };

        const window = this.getWindow();
        if (window) {
            dialog.showMessageBox(window, options);
        } else {
            dialog.showMessageBox(options);
        }
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
        const window = this.getWindow();
        if (!window) {
            console.log('⚠️ No main window to receive files');
            return;
        }

        const result = await dialog.showOpenDialog(window, {
            properties: ['openFile', 'multiSelections'],
            filters: [
                { name: 'Audio Files', extensions: ['mp3', 'wav', 'm4a', 'aiff', 'flac', 'ogg'] },
                { name: 'All Files', extensions: ['*'] }
            ],
            title: 'Select Audio Files to Process'
        });

        if (!result.canceled && result.filePaths.length > 0) {
            // Send to main window for processing
            window.webContents.send('file-dropped', result.filePaths);
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
            this.getWindow()?.webContents.send('toggle-ambient-audio', enabled);

            console.log(`🔮 Ambient audio ${enabled ? 'enabled' : 'disabled'}`);
            this.updateMenu();
        } catch (error) {
            console.error('❌ Failed to toggle ambient audio:', error);
        }
    }

    /**
     * Show output folder (create it first so Finder has something to show)
     */
    showOutputFolder() {
        const outputFolder = this.preferencesManager.getSetting('ui.outputFolder');
        if (!outputFolder) return;
        try {
            fs.mkdirSync(outputFolder, { recursive: true });
            shell.openPath(outputFolder);
        } catch (error) {
            console.error('❌ Could not open output folder:', error);
        }
    }

    /**
     * Clear mystical cache — removes leftover hexbloop-* temp directories
     * (normally cleaned per-run; this catches ones orphaned by crashes)
     */
    async clearCache() {
        const window = this.getWindow();
        const options = {
            type: 'question',
            title: 'Clear Cache',
            message: 'Clear all temporary files?',
            detail: 'This removes leftover Hexbloop processing files from the system temp folder.',
            buttons: ['Clear Cache', 'Cancel'],
            defaultId: 1,
            cancelId: 1
        };
        const response = window
            ? await dialog.showMessageBox(window, options)
            : await dialog.showMessageBox(options);

        if (response.response !== 0) return;

        let removed = 0;
        try {
            const tmpDir = os.tmpdir();
            const entries = fs.readdirSync(tmpDir);
            for (const entry of entries) {
                if (!entry.startsWith('hexbloop-')) continue;
                const fullPath = path.join(tmpDir, entry);
                try {
                    if (fs.statSync(fullPath).isDirectory()) {
                        fs.rmSync(fullPath, { recursive: true, force: true });
                        removed++;
                    }
                } catch (entryError) {
                    console.log(`⚠️ Could not remove ${entry}: ${entryError.message}`);
                }
            }
            console.log(`🧹 Mystical cache cleared (${removed} temp director${removed === 1 ? 'y' : 'ies'})`);
        } catch (error) {
            console.error('❌ Cache clear failed:', error);
        }
    }

    /**
     * Show help documentation
     */
    showHelp() {
        shell.openExternal(`${GITHUB_REPO_URL}#readme`);
    }
    
    /**
     * Reset preferences with confirmation
     */
    async resetPreferences() {
        const window = this.getWindow();
        const confirmOptions = {
            type: 'warning',
            title: 'Reset Preferences',
            message: 'Reset all preferences to defaults?',
            detail: 'This will restore all settings to their original state. This action cannot be undone.',
            buttons: ['Reset to Defaults', 'Cancel'],
            defaultId: 1,
            cancelId: 1
        };
        const response = window
            ? await dialog.showMessageBox(window, confirmOptions)
            : await dialog.showMessageBox(confirmOptions);

        if (response.response === 0) {
            try {
                await this.preferencesManager.resetToDefaults();
                this.updateMenu();

                const doneOptions = {
                    type: 'info',
                    title: 'Preferences Reset',
                    message: 'All preferences have been reset to defaults.',
                    buttons: ['OK']
                };
                if (window) {
                    dialog.showMessageBox(window, doneOptions);
                } else {
                    dialog.showMessageBox(doneOptions);
                }
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
