/**
 * @fileoverview Menu builder for Hexbloop
 * @author Hexbloop Audio Labs
 * @description Creates native macOS menus with clear functionality
 */

const { Menu, shell, dialog, app } = require('electron');
const path = require('path');
const fs = require('fs');
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
                        label: 'Settings…',
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
                        label: 'Choose Audio Folder...',
                        accelerator: 'CmdOrCtrl+Shift+O',
                        click: () => this.selectAudioFolder()
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: 'Audio Processing',
                        submenu: [
                            {
                                label: 'Master · EQ and loudness',
                                type: 'checkbox',
                                checked: this.preferencesManager.getSetting('processing.mastering'),
                                click: (menuItem) => this.toggleProcessingOption('processing.mastering', menuItem.checked)
                            },
                            {
                                label: 'Compress · Lunar tape color',
                                type: 'checkbox',
                                checked: this.preferencesManager.getSetting('processing.compressing'),
                                click: (menuItem) => this.toggleProcessingOption('processing.compressing', menuItem.checked)
                            },
                            {
                                label: 'Artwork · image or sidecar',
                                type: 'checkbox',
                                checked: this.preferencesManager.getSetting('processing.coverArt'),
                                click: (menuItem) => this.toggleProcessingOption('processing.coverArt', menuItem.checked)
                            },
                            {
                                label: 'Metadata', type: 'checkbox',
                                checked: this.preferencesManager.getSetting('processing.metadata'),
                                click: item => this.toggleProcessingOption('processing.metadata', item.checked)
                            },
                            {
                                label: 'Rename', type: 'checkbox',
                                checked: this.preferencesManager.getSetting('processing.renaming'),
                                click: item => this.toggleProcessingOption('processing.renaming', item.checked)
                            },
                            {
                                type: 'separator'
                            },
                            {
                                label: 'Generated metadata',
                                type: 'radio',
                                checked: this.preferencesManager.getSetting('metadata.mode') === 'generated',
                                click: () => this.setMetadataMode('generated')
                            },
                            {
                                label: 'Custom metadata',
                                type: 'radio',
                                checked: this.preferencesManager.getSetting('metadata.mode') === 'custom',
                                click: () => this.setMetadataMode('custom')
                            },
                            {
                                type: 'separator'
                            },
                            {
                                label: 'Output Format',
                                submenu: [
                                    ...['source', 'mp3', 'wav', 'flac'].map(format => ({
                                        label: format === 'source' ? 'Source' : format.toUpperCase(),
                                        type: 'radio',
                                        checked: this.preferencesManager.getSetting('output.format') === format,
                                        click: () => this.setOutputFormat(format)
                                    }))
                                ]
                            }
                        ]
                    },
                ]
            },
            
            // View Menu
            {
                label: 'View',
                submenu: [
                    {
                        label: 'Show Output Folder',
                        accelerator: 'CmdOrCtrl+Alt+O',
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
                        visible: !app.isPackaged,
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
                        label: 'Quick Start',
                        click: () => this.showHelp()
                    },
                    {
                        label: 'Report an Issue',
                        click: () => shell.openExternal(`${GITHUB_REPO_URL}/issues`)
                    },
                ]
            }
        ];
        
        const menu = Menu.buildFromTemplate(template);
        return menu;
    }
    
    /**
     * Show mystical about dialog
     */
    async showAbout() {
        const options = {
            type: 'info',
            title: 'About Hexbloop',
            message: 'Hexbloop',
            detail: `Lunar tape color. Fresh artwork.\n\nVersion ${app.getVersion()}\nMade by Pablo`,
            buttons: ['Website', 'Licenses', 'Close'],
            defaultId: 2,
            cancelId: 2
        };
        const window = this.getWindow();
        const { response } = await (window ? dialog.showMessageBox(window, options) : dialog.showMessageBox(options));
        if (response === 0) await shell.openExternal('https://hexbloop.app');
        if (response === 1) await this.showLicenses();
    }

    async showLicenses() {
        const roots = [path.join(process.resourcesPath || '', 'local-notices'),
            path.join(process.resourcesPath || '', 'vendor/mac/notices'), path.join(__dirname, '../../vendor/mac/notices')];
        const notices = roots.find(root => fs.existsSync(root));
        const options = {
            type: 'info', title: 'Third-party notices', message: 'Open-source foundations',
            detail: 'FFmpeg 6.1.6 (LGPL) · LAME 3.100 (LGPL) · node-canvas with Cairo/Pango (LGPL/MPL) · Electron/Chromium (MIT/BSD)\n\n' +
                'The exact FFmpeg/LAME source, build recipe and binary hashes are published at hexbloop.app/licenses.',
            buttons: notices ? ['Open Audio Notices', 'Licences Page', 'Close'] : ['Licences Page', 'Close'],
            defaultId: notices ? 2 : 1, cancelId: notices ? 2 : 1
        };
        const window = this.getWindow();
        const { response } = await (window ? dialog.showMessageBox(window, options) : dialog.showMessageBox(options));
        if (notices && response === 0) {
            await shell.openPath(notices);
        } else if (response === (notices ? 1 : 0)) {
            await shell.openExternal('https://hexbloop.app/licenses');
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

    async selectAudioFolder() {
        const window = this.getWindow();
        if (!window) return;
        const result = await dialog.showOpenDialog(window, {
            properties: ['openDirectory', 'multiSelections'], title: 'Choose Audio Folder'
        });
        if (!result.canceled && result.filePaths.length) {
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
            
        } catch (error) {
            console.error('❌ Failed to update processing option:', error);
            this.updateMenu();
        }
    }
    
    /**
     * Select metadata style without changing any processing switch.
     */
    async setMetadataMode(mode) {
        try {
            await this.preferencesManager.updateSetting('metadata.mode', mode);
        } catch (error) {
            console.error('❌ Failed to update metadata mode:', error);
            this.updateMenu();
        }
    }
    
    /**
     * Set the output format; the HUD reads the same setting.
     */
    async setOutputFormat(format) {
        try {
            await this.preferencesManager.updateSetting('output.format', format);
        } catch (error) {
            console.error('❌ Failed to set output format:', error);
            this.updateMenu();
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
        } catch (error) {
            console.error('❌ Failed to toggle ambient audio:', error);
            this.updateMenu();
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
     * Show help documentation
     */
    showHelp() {
        const options = {
            type: 'info', title: 'Quick Start', message: 'A little Hexbloop',
            detail: 'Drop audio or a folder · click the Hex to browse.\nTop ribbon shapes the result; A/B compares the sound.\nOutput opens finished files. Originals stay untouched.',
            buttons: ['Close']
        };
        const window = this.getWindow();
        return window ? dialog.showMessageBox(window, options) : dialog.showMessageBox(options);
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
