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
        
        // Drag state management
        this.dragCounter = 0;
        this.isDragActive = false;
        this.dragLeaveTimeout = null;
        
        // Mouse parallax system
        this.mouseX = 0;
        this.mouseY = 0;
        this.centerX = 0;
        this.centerY = 0;
        
        // Ambient audio system
        this.ambientAudio = document.getElementById('ambientAudio');
        this.ambientToggle = document.getElementById('ambientToggle');
        this.toggleIcon = document.getElementById('toggleIcon');
        this.isAudioPlaying = false;
        
        this.initEvents();
        this.initProgressListeners();
        this.initParallax();
        this.initAmbientAudio();
        console.log('🔥 Mystical hexagon awakened - ready for sacrifices 🤘');
    }
    
    initEvents() {
        // Set up drag/drop and click handlers
        this.hexStack.addEventListener('dragenter', this.onDragEnter.bind(this));
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
    
    initParallax() {
        // Calculate center position
        this.updateCenter();
        
        // Mouse move tracking for parallax effect
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            this.updateParallax();
        });
        
        // Recalculate center on window resize
        window.addEventListener('resize', () => {
            this.updateCenter();
        });
    }
    
    updateCenter() {
        this.centerX = window.innerWidth / 2;
        this.centerY = window.innerHeight / 2;
    }
    
    updateParallax() {
        // Calculate mouse position relative to center (-1 to 1)
        const deltaX = (this.mouseX - this.centerX) / this.centerX;
        const deltaY = (this.mouseY - this.centerY) / this.centerY;
        
        // Subtle parallax intensity (max 5px movement)
        const intensity = 5;
        
        // Apply different parallax amounts to each layer for depth
        const outerX = deltaX * intensity * 0.8;
        const outerY = deltaY * intensity * 0.8;
        const middleX = deltaX * intensity * 0.5;
        const middleY = deltaY * intensity * 0.5;
        const innerX = deltaX * intensity * 0.3;
        const innerY = deltaY * intensity * 0.3;
        const pentagramX = deltaX * intensity * 0.2;
        const pentagramY = deltaY * intensity * 0.2;
        
        // Apply transforms (preserve existing transform)
        document.getElementById('hexOuter').style.transform = 
            `translate(-50%, -50%) translate3d(${outerX}px, ${outerY}px, 0)`;
        document.getElementById('hexMiddle').style.transform = 
            `translate(-50%, -50%) translate3d(${middleX}px, ${middleY}px, 0)`;
        document.getElementById('hexInner').style.transform = 
            `translate(-50%, -50%) translate3d(${innerX}px, ${innerY}px, 0)`;
        this.pentagram.style.transform = 
            `translate(-50%, -50%) translate3d(${pentagramX}px, ${pentagramY}px, 0)`;
    }
    
    initAmbientAudio() {
        // Set initial volume
        this.ambientAudio.volume = 0.3;
        
        // Add toggle click handler
        this.ambientToggle.addEventListener('click', () => {
            this.toggleAmbientAudio();
        });
        
        // Auto-start ambient audio (with user interaction fallback)
        this.startAmbientAudio();
    }
    
    async startAmbientAudio() {
        try {
            await this.ambientAudio.play();
            this.isAudioPlaying = true;
            this.updateToggleState();
            console.log('🎵 Ambient audio started');
        } catch (error) {
            // Browser requires user interaction first
            console.log('🎵 Ambient audio waiting for user interaction');
            this.isAudioPlaying = false;
            this.updateToggleState();
        }
    }
    
    toggleAmbientAudio() {
        if (this.isAudioPlaying) {
            this.ambientAudio.pause();
            this.isAudioPlaying = false;
            this.toggleIcon.textContent = '♪';
            console.log('🎵 Ambient audio paused');
        } else {
            this.ambientAudio.play().then(() => {
                this.isAudioPlaying = true;
                this.toggleIcon.textContent = '♫';
                console.log('🎵 Ambient audio playing');
            }).catch(error => {
                console.log('🎵 Could not play ambient audio:', error);
            });
        }
        this.updateToggleState();
    }
    
    updateToggleState() {
        if (this.isAudioPlaying) {
            this.ambientToggle.classList.add('playing');
            this.toggleIcon.textContent = '♫';
        } else {
            this.ambientToggle.classList.remove('playing');
            this.toggleIcon.textContent = '♪';
        }
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
    onDragEnter(e) {
        e.preventDefault();
        this.dragCounter++;
        
        if (!this.isDragActive) {
            this.isDragActive = true;
            this.setFeedingState(true);
        }
        
        // Clear any pending drag leave timeout
        if (this.dragLeaveTimeout) {
            clearTimeout(this.dragLeaveTimeout);
            this.dragLeaveTimeout = null;
        }
    }
    
    onDragOver(e) {
        e.preventDefault();
        // Keep the drag active state but don't toggle classes
    }
    
    onDragLeave(e) {
        e.preventDefault();
        this.dragCounter--;
        
        // Only trigger leave state if we've left all nested elements
        if (this.dragCounter <= 0) {
            this.dragCounter = 0;
            
            // Debounce drag leave to prevent glitching
            this.dragLeaveTimeout = setTimeout(() => {
                if (this.dragCounter === 0 && this.isDragActive) {
                    this.isDragActive = false;
                    this.setFeedingState(false);
                }
            }, 50); // 50ms debounce
        }
    }
    
    setFeedingState(isFeeding) {
        if (isFeeding) {
            this.hexStack.classList.add('feeding');
        } else {
            this.hexStack.classList.remove('feeding');
        }
    }
    
    async onDrop(e) {
        e.preventDefault();
        
        // Reset drag state
        this.dragCounter = 0;
        this.isDragActive = false;
        if (this.dragLeaveTimeout) {
            clearTimeout(this.dragLeaveTimeout);
            this.dragLeaveTimeout = null;
        }
        this.setFeedingState(false);
        
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
        this.hexStack.classList.add('processing'); // Enhanced particles during processing
    }
    
    stopProcessing() {
        this.pentagram.classList.remove('spinning');
        this.processingGlow.classList.remove('active');
        this.progressIndicator.classList.remove('active');
        this.hexStack.classList.remove('processing'); // Reset particles
        this.progressText.textContent = '';
        this.pentagram.style.animationDuration = ''; // Reset speed
    }
    
    showSuccess() {
        // Enhanced success glow confirmation
        this.triggerSuccessGlow();
    }
    
    triggerSuccessGlow() {
        // Add success glow class for enhanced visual feedback
        this.hexStack.classList.add('success-glow');
        
        // Create ripple effect
        this.createSuccessRipple();
        
        // Reset after animation completes
        setTimeout(() => {
            this.hexStack.classList.remove('success-glow');
        }, 2000);
    }
    
    createSuccessRipple() {
        // Create ripple element
        const ripple = document.createElement('div');
        ripple.className = 'success-ripple';
        this.hexStack.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 1500);
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