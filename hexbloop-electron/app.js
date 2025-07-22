/**
 * @fileoverview Hexbloop mystical interface controller
 * @author Hexbloop Audio Labs
 * @description Ultra-lightweight mystical interface with hexagonal design
 */
class HexbloopMystic {
    constructor() {
        this.isProcessing = false;
        
        // UI elements
        this.hexStack = document.getElementById('hexStack');
        this.pentagram = document.getElementById('pentagram');
        this.processingGlow = document.getElementById('processingGlow');
        this.progressIndicator = document.getElementById('progressIndicator');
        this.progressText = document.getElementById('progressText');
        
        // Progress tracking
        this.currentFileIndex = 0;
        this.totalFiles = 0;
        
        this.initEvents();
        this.initProgressListeners();
        console.log('🔥 Mystical hexagon awakened - ready for sacrifices 🤘');
    }
    
    initEvents() {
        // Set up drag/drop and click handlers
        this.hexStack.addEventListener('dragover', this.onDragOver.bind(this));
        this.hexStack.addEventListener('dragleave', this.onDragLeave.bind(this));
        this.hexStack.addEventListener('drop', this.onDrop.bind(this));
        this.hexStack.addEventListener('click', this.onClick.bind(this));
        
        // Prevent browser default file handling
        document.addEventListener('dragover', e => e.preventDefault());
        document.addEventListener('drop', e => e.preventDefault());
    }
    
    initProgressListeners() {
        // IPC event listeners
        window.electronAPI.onProcessingProgress((event, data) => {
            this.updateProgress(data);
        });
        
        window.electronAPI.onFileDropped((event, filePaths) => {
            console.log('📁 Received file drop from main process:', filePaths);
            if (filePaths && filePaths.length > 0) {
                this.processFiles(filePaths);
            }
        });
    }
    
    updateProgress(data) {
        const { current, total, fileName, status } = data;
        this.currentFileIndex = current;
        this.totalFiles = total;
        
        if (status === 'processing') {
            console.log(`🎵 Processing ${current}/${total}: ${fileName}`);
            
            this.progressIndicator.classList.add('active');
            this.progressText.textContent = `Transmuting ${current} of ${total} • ${fileName}`;
            
            // Pentagram spins faster as we progress through files
            const progress = current / total;
            const speed = 6 - (progress * 3);
            this.pentagram.style.animationDuration = `${speed}s`;
        }
    }
    
    // === Drag & Drop Handlers ===
    onDragOver(e) {
        e.preventDefault();
        this.hexStack.classList.add('feeding');
    }
    
    onDragLeave(e) {
        e.preventDefault();
        this.hexStack.classList.remove('feeding');
    }
    
    async onDrop(e) {
        e.preventDefault();
        this.hexStack.classList.remove('feeding');
        
        if (this.isProcessing) return;
        
        const files = Array.from(e.dataTransfer.files);
        const audioFiles = files.filter(f => this.isAudio(f));
        
        if (audioFiles.length > 0) {
            console.log('🎵 Processing dropped files:', audioFiles.map(f => f.name));
            console.log('🔍 File objects debug:', audioFiles.map(f => ({ 
                name: f.name, 
                path: f.path, 
                size: f.size, 
                type: f.type,
                webkitRelativePath: f.webkitRelativePath
            })));
            
            try {
                // Extract file paths using webUtils (Electron v32+)
                console.log('🔍 Using webUtils.getPathForFile() to extract file paths...');
                const filePaths = window.electronAPI.getFilePathsFromFiles(audioFiles);
                
                if (filePaths && filePaths.length > 0) {
                    console.log('✅ Extracted file paths using webUtils:', filePaths);
                    await this.processFiles(filePaths);
                } else {
                    // Fallback to file dialog
                    console.log('❌ webUtils path extraction failed, falling back to file dialog...');
                    this.progressText.textContent = 'Opening file selector...';
                    this.progressIndicator.classList.add('active');
                    
                    setTimeout(async () => {
                        const paths = await window.electronAPI.selectFiles();
                        this.progressIndicator.classList.remove('active');
                        
                        if (paths && paths.length > 0) {
                            await this.processFiles(paths);
                        } else {
                            this.showError('File selection cancelled.');
                        }
                    }, 500);
                }
                
            } catch (error) {
                console.error('❌ Error processing dropped files:', error);
                this.showError('Failed to process files. Please try again.');
            }
        }
    }
    
    async onClick() {
        if (this.isProcessing) return;
        
        try {
            const paths = await window.electronAPI.selectFiles();
            if (paths && paths.length > 0) {
                await this.processFiles(paths);
            }
        } catch (error) {
            console.error('File selection failed:', error);
        }
    }
    
    isAudio(file) {
        return /\.(mp3|wav|m4a|aiff|aif|flac|ogg)$/i.test(file.name);
    }
    
    // === Audio Processing ===
    async processFiles(paths) {
        this.isProcessing = true;
        this.startProcessing();
        
        try {
            console.log('🎵 Processing mystical audio:', paths);
            
            const results = await window.electronAPI.processAudio(paths);
            console.log('✅ Mystical transformation complete:', results);
            
            const successfulFiles = results.filter(r => r.success);
            if (successfulFiles.length > 0) {
                this.showSuccess();
                console.log(`🎉 Successfully processed ${successfulFiles.length} files!`);
            } else {
                console.error('❌ No files were successfully processed');
            }
            
        } catch (error) {
            console.error('❌ Mystical transformation failed:', error);
            this.showError('Audio processing failed. Check console for details.');
        } finally {
            this.isProcessing = false;
            this.stopProcessing();
        }
    }
    
    // === UI State Management ===
    startProcessing() {
        this.pentagram.classList.add('spinning');
        this.processingGlow.classList.add('active');
        this.progressIndicator.classList.add('active');
    }
    
    stopProcessing() {
        this.pentagram.classList.remove('spinning');
        this.processingGlow.classList.remove('active');
        this.progressIndicator.classList.remove('active');
        this.progressText.textContent = '';
        this.pentagram.style.animationDuration = ''; // Reset speed
    }
    
    showSuccess() {
        // Flash hexagon bright
        this.hexStack.style.filter = 'brightness(1.5)';
        setTimeout(() => {
            this.hexStack.style.filter = '';
        }, 1000);
    }
    
    showError(message) {
        // Flash hexagon red
        this.hexStack.style.filter = 'hue-rotate(120deg) brightness(1.2)';
        console.log('🚨 USER ERROR:', message);
        setTimeout(() => {
            this.hexStack.style.filter = '';
        }, 1500);
    }
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    window.hexbloopMystic = new HexbloopMystic();
});