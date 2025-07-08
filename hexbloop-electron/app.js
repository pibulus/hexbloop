/**
 * @fileoverview Hexbloop mystical interface controller
 * @author Hexbloop Audio Labs
 * @description Ultra-lightweight mystical interface with hexagonal design
 */
class HexbloopMystic {
    constructor() {
        this.isProcessing = false;
        this.hexStack = document.getElementById('hexStack');
        this.pentagram = document.getElementById('pentagram');
        this.processingGlow = document.getElementById('processingGlow');
        this.progressIndicator = document.getElementById('progressIndicator');
        this.progressText = document.getElementById('progressText');
        this.currentFileIndex = 0;
        this.totalFiles = 0;
        
        this.initEvents();
        this.initProgressListeners();
        console.log('🔥 Mystical hexagon awakened - ready for sacrifices 🤘');
    }
    
    initEvents() {
        // Drag and drop - minimal overhead
        this.hexStack.addEventListener('dragover', this.onDragOver.bind(this));
        this.hexStack.addEventListener('dragleave', this.onDragLeave.bind(this));
        this.hexStack.addEventListener('drop', this.onDrop.bind(this));
        this.hexStack.addEventListener('click', this.onClick.bind(this));
        
        // Prevent defaults
        document.addEventListener('dragover', e => e.preventDefault());
        document.addEventListener('drop', e => e.preventDefault());
    }
    
    initProgressListeners() {
        // Listen for progress updates from main process
        window.electronAPI.onProcessingProgress((event, data) => {
            this.updateProgress(data);
        });
    }
    
    updateProgress(data) {
        const { current, total, fileName, status } = data;
        this.currentFileIndex = current;
        this.totalFiles = total;
        
        // Update progress display
        if (status === 'processing') {
            console.log(`🎵 Processing ${current}/${total}: ${fileName}`);
            
            // Show progress indicator
            this.progressIndicator.classList.add('active');
            this.progressText.textContent = `Transmuting ${current} of ${total} • ${fileName}`;
            
            // Adjust animation speed based on progress
            const progress = current / total;
            const speed = 6 - (progress * 3); // Slower as we progress
            this.pentagram.style.animationDuration = `${speed}s`;
        }
    }
    
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
            
            try {
                // With webSecurity: false, file.path should be available
                const filePaths = audioFiles.map(file => file.path).filter(path => path);
                
                if (filePaths.length > 0) {
                    console.log('✅ Extracted file paths directly:', filePaths);
                    await this.processFiles(filePaths);
                } else {
                    // Fallback: Try IPC method
                    console.log('⚠️ Direct path extraction failed, trying IPC fallback...');
                    const fileData = audioFiles.map(file => ({
                        name: file.name,
                        path: file.path,
                        size: file.size,
                        type: file.type
                    }));
                    
                    const fallbackPaths = await window.electronAPI.getFilePathsFromDrop(fileData);
                    
                    if (fallbackPaths && fallbackPaths.length > 0) {
                        console.log('✅ Got file paths via IPC fallback:', fallbackPaths);
                        await this.processFiles(fallbackPaths);
                    } else {
                        console.error('❌ Both direct and IPC path extraction failed');
                        console.log('File objects:', audioFiles.map(f => ({ name: f.name, path: f.path, size: f.size })));
                        this.showError('Could not access dropped files. Try using the file selector instead.');
                    }
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
    
    async processFiles(paths) {
        this.isProcessing = true;
        this.startProcessing();
        
        try {
            console.log('🎵 Processing mystical audio:', paths);
            
            // Process all files
            const results = await window.electronAPI.processAudio(paths);
            
            console.log('✅ Mystical transformation complete:', results);
            
            // Check if any files were successfully processed
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
        
        // Reset animation speed
        this.pentagram.style.animationDuration = '';
    }
    
    showSuccess() {
        // Brief success glow
        this.hexStack.style.filter = 'brightness(1.5)';
        setTimeout(() => {
            this.hexStack.style.filter = '';
        }, 1000);
    }
    
    showError(message) {
        // Brief error flash
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