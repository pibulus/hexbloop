/**
 * @fileoverview Hexbloop Electron main process
 * @author Hexbloop Audio Labs
 * @description Main process for the chaos magic audio engine
 */

const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn } = require('child_process');

// Audio processing modules
const AudioProcessor = require('./src/audio-processor');
const NameGenerator = require('./src/name-generator');

// Menu system
const { MenuBuilder } = require('./src/menu/menu-builder');
const { getPreferencesManager } = require('./src/menu/preferences');

let mainWindow;

// === Window Management ===
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        title: 'Hexbloop',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true,  // Drag-drop works with webUtils now
            sandbox: false,     // Required for IPC functionality
            enableRemoteModule: false,
            allowRunningInsecureContent: false,
            experimentalFeatures: false,
            preload: path.join(__dirname, 'preload.js')
        },
        titleBarStyle: 'hiddenInset',
        backgroundColor: '#0D0D1A',
        show: false
    });

    mainWindow.loadFile('src/renderer/index.html');
    
    // Initialize menu system
    const menuBuilder = new MenuBuilder(mainWindow);
    const menu = menuBuilder.buildMenu();
    require('electron').Menu.setApplicationMenu(menu);

    // Show window when ready to prevent visual flash
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        mainWindow.setTitle('Hexbloop');
    });

    // Workaround: intercept file:// navigation to handle drag-drop
    mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        if (parsedUrl.protocol === 'file:') {
            event.preventDefault();
            
            const filePath = decodeURIComponent(parsedUrl.pathname);
            console.log('🔍 Detected file drag:', filePath);
            
            if (/\.(mp3|wav|m4a|aiff|aif|flac|ogg)$/i.test(filePath)) {
                mainWindow.webContents.send('file-dropped', [filePath]);
            }
        }
    });

    // Performance monitoring
    mainWindow.webContents.on('did-finish-load', async () => {
        try {
            const memoryInfo = await process.getProcessMemoryInfo();
            // Memory values are in KB, convert to MB  
            const privateMB = Math.round(memoryInfo.private / 1024);
            console.log(`📊 Memory usage: ${privateMB}MB`);
        } catch (err) {
            console.log('📊 Memory monitoring available');
        }
    });

    // Open DevTools in development
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }
}

// === App Lifecycle ===
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// === IPC Handlers ===
ipcMain.handle('process-audio', async (event, filePaths) => {
    const results = [];
    let firstSuccessfulOutput = null;
    
    // Ensure output directory exists
    const outputDirectory = path.join(os.homedir(), 'Documents', 'HexbloopOutput');
    if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory, { recursive: true });
        console.log(`✨ Created output directory: ${outputDirectory}`);
    }
    
    for (let i = 0; i < filePaths.length; i++) {
        const filePath = filePaths[i];
        try {
            // Send progress update
            event.sender.send('processing-progress', {
                current: i + 1,
                total: filePaths.length,
                fileName: path.basename(filePath),
                status: 'processing'
            });
            
            // Validate and sanitize input file path
            if (!filePath || typeof filePath !== 'string') {
                throw new Error('Invalid file path provided');
            }
            
            // Resolve to absolute path and check it exists
            const resolvedPath = path.resolve(filePath);
            if (!fs.existsSync(resolvedPath)) {
                throw new Error(`Input file not found: ${path.basename(filePath)}`);
            }
            
            // Ensure file is actually a file, not a directory
            const stats = fs.statSync(resolvedPath);
            if (!stats.isFile()) {
                throw new Error(`Path is not a file: ${path.basename(filePath)}`);
            }
            
            // Validate audio file extension
            const validExtensions = ['.mp3', '.wav', '.m4a', '.aiff', '.flac', '.ogg', '.aac'];
            const ext = path.extname(resolvedPath).toLowerCase();
            if (!validExtensions.includes(ext)) {
                throw new Error(`Unsupported audio format: ${ext}`);
            }
            
            const mysticalName = NameGenerator.generateMystical();
            const outputPath = path.join(outputDirectory, `${mysticalName}.mp3`);
            
            console.log(`🎵 Processing ${i + 1}/${filePaths.length}: ${path.basename(resolvedPath)} -> ${mysticalName}.mp3`);
            
            // Process the audio file
            await AudioProcessor.processFile(resolvedPath, outputPath);
            
            // Check if file was actually created
            if (!fs.existsSync(outputPath)) {
                throw new Error('Output file was not created');
            }
            
            results.push({
                success: true,
                originalFile: filePath,
                outputFile: outputPath,
                mysticalName: mysticalName
            });
            
            // Remember first successful output for folder opening
            if (!firstSuccessfulOutput) {
                firstSuccessfulOutput = outputPath;
            }
            
        } catch (error) {
            console.error('Audio processing error:', error);
            results.push({
                success: false,
                originalFile: filePath,
                error: error.message
            });
        }
    }
    
    // Show processed files in Finder/Explorer
    if (firstSuccessfulOutput) {
        const successCount = results.filter(r => r.success).length;
        console.log(`📁 Opening output folder for ${successCount} processed file${successCount !== 1 ? 's' : ''}`);
        shell.showItemInFolder(firstSuccessfulOutput);
    }
    
    return results;
});

ipcMain.handle('select-files', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile', 'multiSelections'],
        filters: [
            { name: 'Audio Files', extensions: ['mp3', 'wav', 'm4a', 'aiff', 'flac', 'ogg'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });
    
    return result.filePaths;
});

// Legacy drag-drop handler (kept for compatibility)
ipcMain.handle('get-file-paths-from-drop', async (event, fileData) => {
    console.log('🔍 Processing drag-drop file data:', fileData);
    
    const paths = [];
    for (const file of fileData) {
        if (file.path) {
            paths.push(file.path);
        } else if (file.name) {
            console.log(`⚠️ Cannot determine full path for: ${file.name}`);
        }
    }
    
    console.log('🔍 Extracted file paths from drop:', paths);
    
    if (paths.length === 0) {
        console.log('❌ Could not extract file paths from drag-drop');
        return [];
    }
    
    return paths;
});

// Handle ambient audio toggle from menu
ipcMain.on('toggle-ambient-audio', (event, enabled) => {
    // Forward to all renderer windows (in case we have multiple in the future)
    mainWindow.webContents.send('toggle-ambient-audio', enabled);
});

// === Preferences IPC Handlers ===

/**
 * Handle preferences operation errors consistently
 * @param {string} operation - Description of the operation that failed
 * @param {Error} error - The error that occurred
 * @returns {{success: false, error: string}} Standardized error response
 */
function handlePreferencesError(operation, error) {
    console.error(`❌ Failed to ${operation}:`, error);
    return { success: false, error: error.message };
}

/**
 * Get current preferences settings
 * @returns {Promise<Object>} Current settings object
 */
ipcMain.handle('preferences-get-settings', async () => {
    try {
        const preferencesManager = getPreferencesManager();
        return preferencesManager.getSettings();
    } catch (error) {
        console.error('❌ Failed to get settings:', error);
        throw error; // Let the renderer handle this critical error
    }
});

/**
 * Update a single preference setting
 * @param {Event} event - IPC event object
 * @param {string} settingPath - Dot-notation path to setting (e.g., 'processing.compressing')
 * @param {*} value - New value for the setting
 * @returns {Promise<{success: boolean, error?: string}>} Operation result
 */
ipcMain.handle('preferences-update-setting', async (event, settingPath, value) => {
    try {
        // Basic validation
        if (!settingPath || typeof settingPath !== 'string') {
            throw new Error('Invalid setting path');
        }
        
        const preferencesManager = getPreferencesManager();
        await preferencesManager.updateSetting(settingPath, value);
        return { success: true };
    } catch (error) {
        return handlePreferencesError('update setting', error);
    }
});

/**
 * Update multiple preference settings
 * @param {Event} event - IPC event object
 * @param {Object} newSettings - Object containing multiple settings to update
 * @returns {Promise<{success: boolean, error?: string}>} Operation result
 */
ipcMain.handle('preferences-update-settings', async (event, newSettings) => {
    try {
        if (!newSettings || typeof newSettings !== 'object') {
            throw new Error('Invalid settings object');
        }
        
        const preferencesManager = getPreferencesManager();
        await preferencesManager.updateSettings(newSettings);
        return { success: true };
    } catch (error) {
        return handlePreferencesError('update multiple settings', error);
    }
});

/**
 * Reset all preferences to default values
 * @returns {Promise<{success: boolean, error?: string}>} Operation result
 */
ipcMain.handle('preferences-reset-defaults', async () => {
    try {
        const preferencesManager = getPreferencesManager();
        await preferencesManager.resetToDefaults();
        console.log('🔄 Preferences reset to defaults');
        return { success: true };
    } catch (error) {
        return handlePreferencesError('reset settings to defaults', error);
    }
});

/**
 * Export current preferences to a JSON object
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>} Export result with data
 */
ipcMain.handle('preferences-export', async () => {
    try {
        const preferencesManager = getPreferencesManager();
        const exportData = await preferencesManager.exportSettings();
        return { success: true, data: exportData };
    } catch (error) {
        return handlePreferencesError('export settings', error);
    }
});

/**
 * Import preferences from a JSON object
 * @param {Event} event - IPC event object
 * @param {Object} importData - Settings data to import
 * @returns {Promise<{success: boolean, error?: string}>} Import result
 */
ipcMain.handle('preferences-import', async (event, importData) => {
    try {
        if (!importData || typeof importData !== 'object') {
            throw new Error('Invalid import data');
        }
        
        const preferencesManager = getPreferencesManager();
        await preferencesManager.importSettings(importData);
        console.log('📥 Settings imported successfully');
        return { success: true };
    } catch (error) {
        return handlePreferencesError('import settings', error);
    }
});

/**
 * Show native folder selection dialog for output directory
 * @returns {Promise<{success: boolean, path?: string, error?: string}>} Selected folder path
 */
ipcMain.handle('preferences-choose-output-folder', async () => {
    try {
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory'],
            title: 'Choose Output Folder for Processed Audio Files',
            defaultPath: path.join(require('os').homedir(), 'Documents', 'HexbloopOutput')
        });
        
        if (!result.canceled && result.filePaths.length > 0) {
            const selectedPath = result.filePaths[0];
            
            // Validate folder is writable
            try {
                await fs.promises.access(selectedPath, fs.constants.W_OK);
            } catch (accessError) {
                console.error('❌ Selected folder is not writable:', selectedPath);
                return { 
                    success: false, 
                    error: 'Selected folder is read-only. Please choose a folder where you have write permissions.' 
                };
            }
            
            // Check available disk space (basic check)
            try {
                const stats = await fs.promises.stat(selectedPath);
                // Note: Node.js doesn't provide disk space info directly
                // This is a basic existence check
                if (!stats.isDirectory()) {
                    return { 
                        success: false, 
                        error: 'Selected path is not a directory.' 
                    };
                }
            } catch (statError) {
                return { 
                    success: false, 
                    error: 'Unable to access the selected folder.' 
                };
            }
            
            console.log('📁 Output folder selected and validated:', selectedPath);
            return { success: true, path: selectedPath };
        }
        
        return { success: false, error: 'No folder selected' };
    } catch (error) {
        return handlePreferencesError('choose output folder', error);
    }
});

/**
 * Close the preferences window
 * @returns {{success: boolean, error?: string}} Close operation result
 */
ipcMain.handle('preferences-close', () => {
    try {
        const { PreferencesWindow } = require('./src/menu/preferences-window');
        const prefWindow = new PreferencesWindow(mainWindow);
        
        if (prefWindow.isOpen()) {
            prefWindow.close();
            console.log('Preferences window closed');
            return { success: true };
        }
        
        console.log('No preferences window found to close');
        return { success: false, error: 'No preferences window found' };
    } catch (error) {
        return handlePreferencesError('close preferences window', error);
    }
});

/**
 * Show the preferences window
 * @returns {Promise<void>}
 */
async function showPreferencesWindow() {
    try {
        const { PreferencesWindow } = require('./src/menu/preferences-window');
        const prefWindow = new PreferencesWindow(mainWindow);
        await prefWindow.show();
        
        console.log('Preferences window shown');
    } catch (error) {
        console.error('Failed to show preferences window:', error);
    }
}

// Export for menu builder
module.exports.showPreferencesWindow = showPreferencesWindow;

// === Startup & Dependencies ===
async function checkDependencies() {
    const dependencies = ['ffmpeg', 'sox'];
    const results = {};
    
    for (const dep of dependencies) {
        results[dep] = await checkDependency(dep);
    }
    
    // Store results globally for the audio processor to check
    global.availableDependencies = results;
    
    // Log summary
    if (!results.sox && !results.ffmpeg) {
        console.log('⚠️ WARNING: Neither sox nor ffmpeg found. Audio processing will fail.');
        console.log('Install with: brew install sox ffmpeg');
    } else if (!results.ffmpeg) {
        console.log('⚠️ FFmpeg not found. Using sox fallback (lower quality mastering)');
        console.log('For best results, install with: brew install ffmpeg');
    }
    
    return results;
}

function checkDependency(command) {
    return new Promise((resolve) => {
        // FFmpeg uses -version, sox uses --version
        const versionFlag = command === 'sox' ? '--version' : '-version';
        const process = spawn(command, [versionFlag], { 
            stdio: ['ignore', 'pipe', 'pipe'],
            shell: false 
        });
        
        let resolved = false;
        let stdout = '';
        let stderr = '';
        
        process.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        
        process.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        
        process.on('close', (code) => {
            if (!resolved) {
                resolved = true;
                // FFmpeg returns 0 and outputs to stderr, sox returns 0 and outputs to stdout
                const available = code === 0 || (command === 'ffmpeg' && stderr.includes('version'));
                console.log(available ? `✅ ${command} is available` : `⚠️ ${command} not found (code: ${code})`);
                resolve(available);
            }
        });
        
        process.on('error', (err) => {
            if (!resolved) {
                resolved = true;
                console.log(`⚠️ ${command} not found in PATH`);
                resolve(false);
            }
        });
        
        // Timeout after 2 seconds
        setTimeout(() => {
            if (!resolved) {
                resolved = true;
                process.kill();
                console.log(`⚠️ ${command} check timed out`);
                resolve(false);
            }
        }, 2000);
    });
}

// === Error Handling ===
process.on('uncaughtException', (error) => {
    console.error('🚨 Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
});
app.on('render-process-gone', (event, webContents, details) => {
    console.error('🚨 Renderer process gone:', details);
    if (details.reason === 'crashed') {
        console.log('🔄 Attempting to reload...');
        webContents.reload();
    }
});

// === Startup ===
console.log('🔥 HEXBLOOP ELECTRON - CHAOS MAGIC AUDIO ENGINE 🔥');
console.log('Checking audio processing dependencies...');
checkDependencies();
console.log('Ready to process some mystical audio! 🤘');