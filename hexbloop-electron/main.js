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
            webSecurity: false,  // Allow file:// access for drag-drop
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
            const outputPath = path.join(outputDirectory, `${mysticalName}.m4a`);
            
            console.log(`🎵 Processing ${i + 1}/${filePaths.length}: ${path.basename(filePath)} -> ${mysticalName}.m4a`);
            
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
    const paths = [];
    
    for (const file of fileData) {
        if (file.path) {
            paths.push(file.path);
        }
    }
    
    console.log('🔍 Extracted file paths from drop:', paths);
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

console.log('🔥 HEXBLOOP ELECTRON - CHAOS MAGIC AUDIO ENGINE 🔥');
console.log('Checking audio processing dependencies...');
checkDependencies();
console.log('Ready to process some mystical audio! 🤘');