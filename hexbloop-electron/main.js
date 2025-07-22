/**
 * @fileoverview Hexbloop Electron main process
 * @author Hexbloop Audio Labs
 * @description Main process for the chaos magic audio engine
 */

const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Audio processing modules
const AudioProcessor = require('./src/audio-processor');
const NameGenerator = require('./src/name-generator');
const { spawn } = require('child_process');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true,  // Keep security enabled (drag-drop works with webUtils now)
            sandbox: false,  // Keep false for our IPC functionality
            enableRemoteModule: false,
            allowRunningInsecureContent: false,
            experimentalFeatures: false,
            preload: path.join(__dirname, 'preload.js')
        },
        titleBarStyle: 'hiddenInset',
        backgroundColor: '#0D0D1A',
        show: false
    });

    mainWindow.loadFile('index.html');

    // Show window when ready to prevent visual flash
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Enable drag-and-drop files at main process level
    mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        if (parsedUrl.protocol === 'file:') {
            event.preventDefault();
            
            // Extract file path from file:// URL
            const filePath = decodeURIComponent(parsedUrl.pathname);
            console.log('🔍 Detected file drag:', filePath);
            
            // Check if it's an audio file
            if (/\.(mp3|wav|m4a|aiff|aif|flac|ogg)$/i.test(filePath)) {
                // Send file path to renderer
                mainWindow.webContents.send('file-dropped', [filePath]);
            }
        }
    });

    // Performance monitoring
    mainWindow.webContents.on('did-finish-load', () => {
        const memoryInfo = process.getProcessMemoryInfo();
        console.log(`📊 Memory usage: ${Math.round(memoryInfo.residentSet / 1024 / 1024)}MB resident, ${Math.round(memoryInfo.private / 1024 / 1024)}MB private`);
    });

    // Open DevTools in development
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }
}

// App event handlers
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

// IPC handlers for audio processing
ipcMain.handle('process-audio', async (event, filePaths) => {
    const results = [];
    let firstSuccessfulOutput = null;
    
    // Create output directory like the original Swift app
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
            
            // Validate input file path
            if (!filePath || !fs.existsSync(filePath)) {
                throw new Error(`Input file not found: ${filePath}`);
            }
            
            const mysticalName = NameGenerator.generateMystical();
            const outputPath = path.join(outputDirectory, `${mysticalName}.mp3`);
            
            console.log(`🎵 Processing ${i + 1}/${filePaths.length}: ${path.basename(filePath)} -> ${mysticalName}.mp3`);
            
            // Process the audio file
            await AudioProcessor.processFile(filePath, outputPath);
            
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
    
    // Open output folder once after all processing is complete
    if (firstSuccessfulOutput) {
        console.log(`📁 Opening output folder for ${results.filter(r => r.success).length} processed files`);
        shell.showItemInFolder(firstSuccessfulOutput);
    }
    
    return results;
});

// File dialog for manual file selection
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

// Handle file paths from drag-drop (workaround for renderer security)
ipcMain.handle('get-file-paths-from-drop', async (event, fileData) => {
    // Extract paths from file data sent from renderer
    console.log('🔍 Processing drag-drop file data:', fileData);
    
    // With webSecurity: false, we should be able to access the file path
    // Try to reconstruct the full path from the file name
    const paths = [];
    
    for (const file of fileData) {
        if (file.path) {
            // If we have a direct path, use it
            paths.push(file.path);
        } else if (file.name) {
            // This is a fallback - in reality, we can't reliably get the full path
            // from just the filename in a secure way
            console.log(`⚠️ Cannot determine full path for: ${file.name}`);
        }
    }
    
    console.log('🔍 Extracted file paths from drop:', paths);
    
    // If we couldn't get proper paths, return empty array to trigger click handler
    if (paths.length === 0) {
        console.log('❌ Could not extract file paths from drag-drop');
        return [];
    }
    
    return paths;
});

// Check dependencies on startup
function checkDependencies() {
    const dependencies = ['ffmpeg', 'sox'];
    const results = {};
    
    for (const dep of dependencies) {
        try {
            const process = spawn(dep, ['--version'], { stdio: 'pipe' });
            process.on('close', (code) => {
                results[dep] = code === 0;
                if (code === 0) {
                    console.log(`✅ ${dep} is available`);
                } else {
                    console.log(`⚠️ ${dep} not found (code: ${code})`);
                }
            });
            process.on('error', () => {
                results[dep] = false;
                console.log(`❌ ${dep} not found in PATH`);
            });
        } catch (error) {
            results[dep] = false;
            console.log(`❌ ${dep} check failed:`, error.message);
        }
    }
    
    return results;
}

// App event handlers
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Enhanced error handling (2024 best practice)
process.on('uncaughtException', (error) => {
    console.error('🚨 Uncaught Exception:', error);
    // In production, you'd want to log this to a service like Sentry
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
    // In production, you'd want to log this to a service like Sentry
});

// Renderer process crash handling
app.on('render-process-gone', (event, webContents, details) => {
    console.error('🚨 Renderer process gone:', details);
    if (details.reason === 'crashed') {
        // Optionally restart the renderer process
        console.log('🔄 Attempting to reload...');
        webContents.reload();
    }
});

console.log('🔥 HEXBLOOP ELECTRON - CHAOS MAGIC AUDIO ENGINE 🔥');
console.log('Checking audio processing dependencies...');
checkDependencies();
console.log('Ready to process some mystical audio! 🤘');