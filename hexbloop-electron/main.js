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

let mainWindow;

// === Window Management ===
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
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

    mainWindow.loadFile('index.html');

    // Show window when ready to prevent visual flash
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
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
    mainWindow.webContents.on('did-finish-load', () => {
        const memoryInfo = process.getProcessMemoryInfo();
        console.log(`📊 Memory usage: ${Math.round(memoryInfo.residentSet / 1024 / 1024)}MB resident, ${Math.round(memoryInfo.private / 1024 / 1024)}MB private`);
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
    
    // Show processed files in Finder/Explorer
    if (firstSuccessfulOutput) {
        console.log(`📁 Opening output folder for ${results.filter(r => r.success).length} processed files`);
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

// === Startup & Dependencies ===
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