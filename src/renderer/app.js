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
        
        // Hexagonal communication system - 6 vertices of the construct
        this.hexagonalWords = {
            vertex1: ["weaving", "flowing", "merging", "dissolving", "threading"],
            vertex2: ["frequencies", "patterns", "echoes", "whispers", "signals"],
            vertex3: ["between", "through", "within", "beyond", "across"],
            vertex4: ["layers", "dimensions", "spaces", "realms", "depths"],
            vertex5: ["warmth", "intent", "purpose", "essence", "breath"],
            vertex6: ["awakens", "remembers", "shifts", "breathes", "stirs"]
        };
        
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

        // A/B playback system — the hexagon becomes the player after processing.
        // Glowing = you're hearing the PROCESSED master, dimmed = the ORIGINAL.
        this.abAudio = document.getElementById('abAudio');
        this.abState = null;
        this.abBlob = null; // One selected side at a time, never two full-file IPC copies
        this.hasABResult = false;
        this.playbackToken = 0;
        this.pendingMetadataListener = null;
        this.successfulPairs = [];
        this.selectedPairIndex = 0;
        this.ambientRestore = false;
        this.receiptPanel = document.getElementById('batchReceipt');
        this.previewStatus = document.getElementById('previewStatus');
        
        // Track timeouts and event listeners for cleanup
        this.activeTimeouts = new Set();
        this.eventListeners = [];
        this.ambientToggle = document.getElementById('ambientToggle');
        this.toggleIcon = document.getElementById('toggleIcon');
        this.isAudioPlaying = false;
        
        // Settings button
        this.settingsButton = document.getElementById('settingsButton');
        
        this.initEvents();
        this.initProgressListeners();
        this.initParallax();
        this.initAmbientAudio();
        this.initSettingsButton();
        this.initBatchControls();
        document.getElementById('idleRail').appendChild(document.getElementById('utilityRail'));
        this.initProcessingSwitches();
        this.initHUD();
        document.getElementById('firstRunHint').hidden = localStorage.getItem('hexbloop-first-output') === 'done';

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
        document.addEventListener('keydown', event => {
            if (this.receiptPanel.hidden || event.metaKey || event.ctrlKey || event.altKey ||
                ['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
            if (event.key.toLowerCase() === 'a') { event.preventDefault(); this.flipAB(); }
            if (event.key === 'ArrowLeft') { event.preventDefault(); this.selectBatchPair(this.selectedPairIndex - 1); }
            if (event.key === 'ArrowRight') { event.preventDefault(); this.selectBatchPair(this.selectedPairIndex + 1); }
        });
    }

    initBatchControls() {
        document.getElementById('previousFile').addEventListener('click', () => this.selectBatchPair(this.selectedPairIndex - 1));
        document.getElementById('nextFile').addEventListener('click', () => this.selectBatchPair(this.selectedPairIndex + 1));
        document.getElementById('flipAB').addEventListener('click', () => this.flipAB());
        document.getElementById('pauseAB').addEventListener('click', () => this.pauseAB());
        document.getElementById('skippedToggle').addEventListener('click', () => {
            const popover = document.getElementById('skippedPopover');
            popover.hidden = !popover.hidden;
            document.getElementById('skippedToggle').setAttribute('aria-expanded', String(!popover.hidden));
        });
        document.getElementById('openOutput').addEventListener('click', async () => {
            const opened = await window.electronAPI.openOutput();
            if (!opened) this.previewStatus.textContent = 'Output folder not available yet';
        });
        document.getElementById('outputDestination').addEventListener('click', async () => {
            if (!await window.electronAPI.openOutput()) {
                document.getElementById('idleState').textContent = 'Output folder appears after first processing';
            }
        });
    }

    initHUD() {
        const huds = [...document.querySelectorAll('.hud')];
        const format = document.getElementById('formatMenu');
        const closePopovers = () => {
            format.open = false;
            document.getElementById('skippedPopover').hidden = true;
            document.getElementById('skippedToggle').setAttribute('aria-expanded', 'false');
        };
        document.addEventListener('pointermove', event => {
            for (const hud of huds) {
                const box = hud.getBoundingClientRect();
                hud.classList.toggle('is-near', event.clientX >= box.left - 24 && event.clientX <= box.right + 24 &&
                    event.clientY >= box.top - 24 && event.clientY <= box.bottom + 24);
            }
        });
        document.addEventListener('pointerdown', event => {
            if (!event.target.closest('.format-menu, #skippedToggle, #skippedPopover')) closePopovers();
        });
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                const restoreFocus = format.open ? format.querySelector('summary') :
                    !document.getElementById('skippedPopover').hidden ? document.getElementById('skippedToggle') : null;
                closePopovers();
                restoreFocus?.focus();
            }
        });
    }

    async initProcessingSwitches() {
        const controls = [...document.querySelectorAll('[data-main-switch]')];
        const formats = [...document.querySelectorAll('input[name="quick-format"]')];
        const render = (settings) => {
            this.currentSettings = settings;
            controls.forEach(control => { control.checked = Boolean(settings.processing[control.dataset.mainSwitch]); });
            formats.forEach(control => { control.checked = control.value === settings.output.format; });
            document.getElementById('currentFormat').textContent = settings.output.format === 'source'
                ? 'Source' : settings.output.format.toUpperCase();
            const active = ['mastering', 'compressing', 'coverArt', 'metadata', 'renaming']
                .some(key => settings.processing[key]);
            document.getElementById('idleState').textContent = !active && settings.output.format === 'source' &&
                settings.output.sampleRate === 0 ? 'No stages active' : '';
            const destination = document.getElementById('outputDestination');
            document.getElementById('outputPathText').textContent = settings.ui.outputFolder;
            destination.title = `Open ${settings.ui.outputFolder}`;
        };
        try { render(await window.electronAPI.getSettings()); }
        catch (error) { console.error('Processing settings unavailable:', error); }
        window.electronAPI.onSettingsChanged(render);
        controls.forEach(control => control.addEventListener('change', async () => {
            control.disabled = true;
            try { render(await window.electronAPI.setMainSwitch(control.dataset.mainSwitch, control.checked)); }
            catch (error) {
                render(await window.electronAPI.getSettings());
                console.error('Processing switch not saved:', error);
            } finally { control.disabled = false; }
        }));
        formats.forEach(control => control.addEventListener('change', async () => {
            control.disabled = true;
            try { render(await window.electronAPI.setOutputFormat(control.value)); }
            catch (error) { render(await window.electronAPI.getSettings()); console.error('Format not saved:', error); }
            finally {
                control.disabled = false;
                document.getElementById('formatMenu').open = false;
                document.querySelector('#formatMenu summary').focus();
            }
        }));
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
        
        // Handle ambient audio toggle from menu
        window.electronAPI.onAmbientToggle((event, enabled) => {
            console.log('🎵 Ambient audio toggle:', enabled);
            this.toggleAmbientAudio(enabled);
        });
    }
    
    initParallax() {
        // Calculate center position
        this.updateCenter();
        this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        this.parallaxLayers = [...document.querySelectorAll('[data-parallax-depth]')];
        this.pointerFrame = null;
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            if (this.motionQuery.matches || this.pointerFrame !== null) return;
            this.pointerFrame = requestAnimationFrame(() => {
                this.pointerFrame = null;
                this.updateParallax();
            });
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
    
    // Hexagonal communication - let the construct speak through its geometry
    generateHexagonalPhrase(current, total) {
        // Use current file number and time to seed hexagonal positioning
        const timeStamp = Date.now();
        const seedValue = (current + timeStamp) % 6;
        
        // Select starting vertex (1-6)
        const startVertex = (seedValue % 6) + 1;
        
        // Different hexagonal movement patterns based on progress
        const progressPhase = Math.floor((current / total) * 3); // 0, 1, or 2
        
        let phrase = "";
        
        if (progressPhase === 0) {
            // Early phase: 2-word phrases using opposite vertices
            const word1 = this.getVertexWord(startVertex);
            const word2 = this.getVertexWord((startVertex + 2) % 6 + 1); // Skip 2 vertices
            phrase = `${word1} ${word2}`;
        } else if (progressPhase === 1) {
            // Middle phase: 3-word phrases moving clockwise
            const word1 = this.getVertexWord(startVertex);
            const word2 = this.getVertexWord((startVertex % 6) + 1);
            const word3 = this.getVertexWord(((startVertex + 1) % 6) + 1);
            phrase = `${word1} ${word2}, ${word3}`;
        } else {
            // Final phase: 4-word diamond pattern
            const word1 = this.getVertexWord(startVertex);
            const word2 = this.getVertexWord((startVertex + 1) % 6 + 1);
            const word3 = this.getVertexWord((startVertex + 3) % 6 + 1);
            const word4 = this.getVertexWord((startVertex + 4) % 6 + 1);
            phrase = `${word1} ${word2} ${word3}, ${word4}`;
        }
        
        return phrase;
    }
    
    // Get word from specific hexagon vertex
    getVertexWord(vertexNumber) {
        const vertexKey = `vertex${vertexNumber}`;
        const wordArray = this.hexagonalWords[vertexKey];
        const randomIndex = Math.floor(Math.random() * wordArray.length);
        return wordArray[randomIndex];
    }
    
    updateParallax() {
        if (this.motionQuery?.matches) return;
        // Calculate mouse position relative to center (-1 to 1)
        const deltaX = (this.mouseX - this.centerX) / (this.centerX || 1);
        const deltaY = (this.mouseY - this.centerY) / (this.centerY || 1);
        
        // Subtle parallax intensity (max 5px movement)
        const intensity = 5;
        
        // Apply different parallax amounts to each layer for depth
        for (const layer of this.parallaxLayers) {
            const depth = Number(layer.dataset.parallaxDepth);
            layer.style.transform = `translate3d(${deltaX * intensity * depth}px, ${deltaY * intensity * depth}px, 0)`;
        }
    }
    
    async initAmbientAudio() {
        if (!this.ambientAudio) return;

        // Set initial volume
        this.ambientAudio.volume = 0.3;

        // Add toggle click handler
        // (menu/preferences toggles arrive via onAmbientToggle in initProgressListeners)
        if (this.ambientToggle) {
            this.ambientToggle.addEventListener('click', () => {
                this.toggleAmbientAudio();
            });
        }

        // Load settings and only auto-start if enabled
        try {
            const settings = await window.electronAPI.getSettings();
            const ambientEnabled = settings?.ui?.ambientAudio !== false; // Default to true

            if (ambientEnabled) {
                // Auto-start ambient audio (with user interaction fallback)
                this.startAmbientAudio();
            } else {
                console.log('🎵 Ambient audio disabled in settings, not auto-starting');
                this.isAudioPlaying = false;
                this.updateToggleState();
            }
        } catch (error) {
            console.error('⚠️ Could not load settings, defaulting to enabled:', error);
            this.startAmbientAudio();
        }
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
    
    toggleAmbientAudio(forceState = null) {
        if (!this.ambientAudio) return;
        if (forceState === false) this.ambientRestore = false;

        const shouldPlay = forceState !== null ? forceState : !this.isAudioPlaying;
        if (shouldPlay && this.hasABResult && !this.abAudio.paused) {
            this.ambientRestore = true;
            return;
        }

        if (shouldPlay && !this.isAudioPlaying) {
            this.ambientAudio.play().then(() => {
                this.isAudioPlaying = true;
                this.toggleIcon.textContent = '♫';
                console.log('🎵 Ambient audio playing');
            }).catch(error => {
                console.log('🎵 Could not play ambient audio:', error);
            });
        } else if (!shouldPlay && this.isAudioPlaying) {
            this.ambientAudio.pause();
            this.isAudioPlaying = false;
            this.toggleIcon.textContent = '♪';
            console.log('🎵 Ambient audio paused');
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
    
    initSettingsButton() {
        // Settings button click handler (hover styling handled in CSS)
        if (this.settingsButton) {
            this.settingsButton.addEventListener('click', () => {
                console.log('⚙️ Opening preferences window...');
                window.electronAPI.openPreferences();
            });
        }
    }
    
    updateProgress(data) {
        const { current, total, fileName, status } = data;
        this.currentFileIndex = current;
        this.totalFiles = total;
        
        if (status === 'processing') {
            console.log(`🎵 Processing ${current}/${total}: ${fileName}`);

            this.progressIndicator.classList.add('active');

            this.progressText.textContent = `Blooping ${current} of ${total} · ${fileName}`;
            this.progressText.title = this.progressText.textContent;
            
            // Progressive pentagram ceremony - starts slow, peaks, then settles
            const progress = current / total;
            let speed;
            if (progress < 0.3) {
                speed = 8; // Ceremonial start
            } else if (progress < 0.7) {
                speed = 6 - (progress * 3); // Original acceleration
            } else {
                speed = 6; // Satisfied completion rhythm
            }
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
        
        const entries = Array.from(e.dataTransfer.files);
        if (entries.length > 0) {
            if (this.motionQuery?.matches) { await this.processDroppedFiles(entries); return; }
            // Cosmic Receipt Flow: Stronger anticipation - hexagon hungers for the offering
            this.hexStack.style.transform = 'scale(0.95)';
            this.hexStack.style.transition = 'transform 0.18s ease-out';
            this.hexStack.style.filter = 'brightness(1.1) saturate(1.2)';
            
            setTimeout(() => {
                this.hexStack.style.transform = 'scale(1.02)'; // Slightly expand past normal
                this.hexStack.style.filter = '';
                setTimeout(() => {
                    this.hexStack.style.transform = 'scale(1.0)';
                    this.processDroppedFiles(entries);
                }, 150);
            }, 250);
        }
    }
    
    async processDroppedFiles(entries) {
        try {
            // The main process performs all extension and folder discovery.
            const filePaths = window.electronAPI.getFilePathsFromFiles(entries);
            
            if (filePaths && filePaths.length > 0) {
                await this.processFiles(filePaths);
            } else {
                this.showError('Drop could not be read · Choose Files or Choose Folder');
            }
            
        } catch (error) {
            console.error('❌ Error processing dropped files:', error);
            this.showError('Drop could not be read · Choose Files or Choose Folder');
        }
    }
    
    async onClick() {
        if (this.isProcessing) return;

        // The hex stays the drop/browse target, even after a batch completes.
        try {
            const paths = await window.electronAPI.selectFiles();
            if (paths && paths.length > 0) {
                await this.processFiles(paths);
            }
        } catch (error) {
            console.error('File selection failed:', error);
        }
    }
    
    // === A/B Playback — one selected pair, one Blob URL, one audio element ===

    // Read a file's bytes via IPC and turn them into a renderer Blob URL
    async _fetchBlobUrl(filePath) {
        const result = await window.electronAPI.readAudioFile(filePath);
        if (!result || !result.success || !result.data) {
            throw new Error(result?.error || 'Could not read audio file');
        }
        const blob = new Blob([result.data], { type: result.mime });
        return { url: URL.createObjectURL(blob), mime: result.mime };
    }

    async loadABResult(index) {
        const pair = this.successfulPairs[index];
        if (!pair) return;
        this.clearAB(false);
        this.selectedPairIndex = index;
        this.renderReceiptPosition();
        const selection = ++this.playbackToken;
        try {
            await window.electronAPI.selectPreviewPair(pair.originalFile, pair.outputFile);
            if (selection !== this.playbackToken) return;
            this.hasABResult = true;
            await this._playSide('processed', 0);
        } catch (error) {
            if (selection !== this.playbackToken) return;
            this.hasABResult = false;
            this.showPreviewUnavailable(error.message);
            this.abState = null;
            this._updateABGlow();
            this.restoreAmbientAfterAB();
        }
    }

    async _playSide(side, position = null) {
        const pair = this.successfulPairs[this.selectedPairIndex];
        if (!pair) return;
        const token = ++this.playbackToken;
        const resumeAt = position !== null
            ? position
            : (Number.isFinite(this.abAudio.currentTime) ? this.abAudio.currentTime : 0);
        // Pause before every source change. No overlapping A/B playback.
        this.abAudio.pause();
        if (this.pendingMetadataListener) this.abAudio.removeEventListener('loadedmetadata', this.pendingMetadataListener);
        this.pendingMetadataListener = null;
        this.abAudio.removeAttribute('src');
        this.abAudio.load();
        if (this.abBlob?.url) URL.revokeObjectURL(this.abBlob.url);
        this.abBlob = null;
        this.abState = side;
        this._updateABGlow();
        try {
            const blob = await this._fetchBlobUrl(side === 'original' ? pair.originalFile : pair.outputFile);
            if (token !== this.playbackToken) { URL.revokeObjectURL(blob.url); return; }
            this.abBlob = blob;
            this.abAudio.src = blob.url;
            this.abAudio.volume = 0.85;
            const playLoaded = async () => {
                this.pendingMetadataListener = null;
                if (token !== this.playbackToken) return;
                try {
                    if (resumeAt > 0 && Number.isFinite(this.abAudio.duration)) {
                        this.abAudio.currentTime = Math.min(resumeAt, Math.max(0, this.abAudio.duration - 0.05));
                    }
                    this.pauseAmbientForAB();
                    await this.abAudio.play();
                    if (token !== this.playbackToken) return; // A newer side owns the shared element now.
                    this.previewStatus.textContent = `${side === 'original' ? 'A · Original' : 'B · Processed'} · playing`;
                    this.setPlaybackControl(true);
                } catch {
                    this.previewStatus.textContent = 'Playback paused · Play to listen';
                    this.setPlaybackControl(false);
                    this.restoreAmbientAfterAB();
                }
            };
            this.pendingMetadataListener = playLoaded;
            this.abAudio.addEventListener('loadedmetadata', playLoaded, { once: true });
            this.abAudio.load();
            if (this.abAudio.readyState >= 1) {
                this.abAudio.removeEventListener('loadedmetadata', playLoaded);
                playLoaded();
            }
        } catch (error) {
            if (token !== this.playbackToken) return;
            this.hasABResult = false;
            this.showPreviewUnavailable(error.message);
            this.abState = null;
            this._updateABGlow();
            this.restoreAmbientAfterAB();
        }
    }

    showPreviewUnavailable(reason = '') {
        this.previewStatus.textContent = 'No preview';
        this.previewStatus.title = reason || 'Preview unavailable · Open Output';
    }

    // Tap-to-flip: processed <-> original at the same moment in the track
    flipAB() {
        if (!this.hasABResult) {
            if (this.successfulPairs.length) this.loadABResult(this.selectedPairIndex);
            return;
        }
        const next = this.abState === 'processed' ? 'original' : 'processed';
        this._playSide(next);
    }

    // Reflect which side is playing in the hexagon's glow
    _updateABGlow() {
        document.getElementById('flipAB').dataset.side = this.abState || 'none';
        this.hexStack.classList.remove('ab-processed', 'ab-original');
        if (this.abState === 'processed') {
            this.hexStack.classList.add('ab-processed');
        } else if (this.abState === 'original') {
            this.hexStack.classList.add('ab-original');
        }
    }

    // Stop A/B playback and release blob URLs
    clearAB(restoreAmbient = true) {
        this.playbackToken++;
        if (this.abAudio) {
            this.abAudio.pause();
            if (this.pendingMetadataListener) this.abAudio.removeEventListener('loadedmetadata', this.pendingMetadataListener);
            this.pendingMetadataListener = null;
            this.abAudio.removeAttribute('src');
            try { this.abAudio.load(); } catch (e) { /* noop */ }
        }
        if (this.abBlob?.url) URL.revokeObjectURL(this.abBlob.url);
        this.abBlob = null;
        this.abState = null;
        this.hasABResult = false;
        this.setPlaybackControl(false);
        document.getElementById('flipAB').dataset.side = 'none';
        this.hexStack.classList.remove('ab-processed', 'ab-original');
        if (restoreAmbient) this.restoreAmbientAfterAB();
    }

    pauseAmbientForAB() {
        if (this.isAudioPlaying && this.currentSettings?.ui?.ambientAudio !== false) {
            this.ambientRestore = true;
            this.ambientAudio.pause();
            this.isAudioPlaying = false;
            this.updateToggleState();
        }
    }

    restoreAmbientAfterAB() {
        if (this.ambientRestore && this.currentSettings?.ui?.ambientAudio !== false) this.startAmbientAudio();
        this.ambientRestore = false;
    }

    async pauseAB() {
        if (!this.abBlob) { this.previewStatus.textContent = 'Preview unavailable · Open Output'; return; }
        if (this.abAudio.paused) {
            try {
                this.pauseAmbientForAB();
                await this.abAudio.play();
                this.setPlaybackControl(true);
                this.previewStatus.textContent = `${this.abState === 'original' ? 'A · Original' : 'B · Processed'} · playing`;
            } catch { this.previewStatus.textContent = 'Playback paused'; this.restoreAmbientAfterAB(); }
        } else {
            this.abAudio.pause();
            this.restoreAmbientAfterAB();
            this.setPlaybackControl(false);
            this.previewStatus.textContent = 'Playback paused';
        }
    }

    stopAB() {
        this.clearAB();
        this.previewStatus.textContent = 'Playback stopped · Flip A/B to listen';
    }

    setPlaybackControl(playing) {
        const control = document.getElementById('pauseAB');
        control.dataset.playing = String(playing);
        control.setAttribute('aria-label', playing ? 'Pause audio' : 'Play audio');
        document.getElementById('flipAB').dataset.playing = String(playing);
    }

    setReceiptVisible(visible) {
        this.receiptPanel.hidden = !visible;
        const container = document.querySelector('.app-container');
        container.classList.toggle('has-receipt', visible);
        (visible ? document.getElementById('utilitySlot') : document.getElementById('idleRail'))
            .appendChild(document.getElementById('utilityRail'));
    }

    async selectBatchPair(index) {
        if (index < 0 || index >= this.successfulPairs.length) return;
        await this.loadABResult(index);
    }

    showReceipt(results) {
        // Progress and the completed transport must never share the screen.
        if (this.isProcessing) {
            this.isProcessing = false;
            this.stopProcessing();
        }
        const receipt = window.HexbloopBatchReceipt.summarizeBatch(results);
        this.successfulPairs = receipt.ready;
        this.selectedPairIndex = 0;
        document.getElementById('receiptSummary').textContent = `${receipt.ready.length} ready`;
        const skipped = document.getElementById('skippedToggle');
        skipped.hidden = !receipt.issues.length;
        skipped.textContent = `${receipt.issues.length} skipped ▾`;
        skipped.setAttribute('aria-expanded', 'false');
        document.getElementById('skippedPopover').hidden = true;
        const list = document.getElementById('receiptIssues');
        list.replaceChildren();
        for (const issue of receipt.issues) {
            const item = document.createElement('li');
            item.textContent = `${issue.fileName} · ${issue.reason}`;
            item.title = item.textContent;
            list.appendChild(item);
        }
        this.setReceiptVisible(true);
        this.previewStatus.textContent = receipt.ready.length ? '' : 'No audio ready';
        this.renderReceiptPosition();
        return receipt;
    }

    renderReceiptPosition() {
        const pair = this.successfulPairs[this.selectedPairIndex];
        const label = pair?.outputFile?.split(/[\\/]/).pop() || '';
        const position = document.getElementById('receiptPosition');
        position.textContent = pair
            ? `${this.selectedPairIndex + 1}/${this.successfulPairs.length} · ${label}` : '';
        position.title = label;
        document.getElementById('previousFile').disabled = this.selectedPairIndex <= 0;
        document.getElementById('nextFile').disabled = this.selectedPairIndex >= this.successfulPairs.length - 1;
        document.getElementById('flipAB').disabled = !pair;
        document.getElementById('pauseAB').disabled = !pair;
    }

    // === Audio Processing ===
    async processFiles(paths) {
        if (this.isProcessing) return;
        const settings = this.currentSettings || await window.electronAPI.getSettings();
        if (!['mastering', 'compressing', 'coverArt', 'metadata', 'renaming'].some(key => settings.processing[key]) &&
            settings.output.format === 'source' && settings.output.sampleRate === 0) {
            document.getElementById('idleState').textContent = 'No stages active';
            return;
        }
        this.isProcessing = true;
        this.setReceiptVisible(false);
        this.startProcessing();

        // New offering — stop any A/B playback from the previous result
        this.clearAB();

        try {
            console.log('🎵 Processing mystical audio:', paths);

            const results = await window.electronAPI.processAudio(paths);
            console.log('✅ Mystical transformation complete:', results);
            const receipt = this.showReceipt(results);
            if (receipt.ready.length > 0) {
                localStorage.setItem('hexbloop-first-output', 'done');
                document.getElementById('firstRunHint').hidden = true;
                if (!receipt.issues.length) this.showSuccess();
                await this.loadABResult(0);
            } else {
                if (results.some(r => r.reason === 'No stages active')) {
                    document.getElementById('idleState').textContent = 'No stages active';
                }
            }

        } catch (error) {
            console.error('❌ Mystical transformation failed:', error);
            this.showReceipt([{ success: false, fileName: 'Batch', error: 'Processing paused · Output unchanged' }]);
        } finally {
            if (this.isProcessing) {
                this.isProcessing = false;
                this.stopProcessing();
            }
        }
    }
    
    // === UI State Management ===
    startProcessing() {
        document.querySelector('.app-container').classList.add('is-processing');
        this.pentagram.classList.add('spinning');
        this.processingGlow.classList.add('active');
        this.progressIndicator.classList.add('active');
        this.hexStack.classList.add('processing'); // Enhanced particles during processing
        this.progressText.textContent = 'Blooping…';
    }
    
    stopProcessing() {
        document.querySelector('.app-container').classList.remove('is-processing');
        // Smooth pentagram transition - no jarring speed reset
        this.pentagram.style.transition = 'animation-duration 0.8s ease-out';
        this.pentagram.style.animationDuration = '6s'; // Gentle slowdown to final rhythm
        
        setTimeout(() => {
            this.pentagram.classList.remove('spinning');
            this.pentagram.style.transition = '';
            this.pentagram.style.animationDuration = '';
        }, 800);
        
        this.processingGlow.classList.remove('active');
        this.progressIndicator.classList.remove('active');
        this.hexStack.classList.remove('processing');
        this.progressText.textContent = '';
    }
    
    showSuccess() {
        // Enhanced success glow confirmation
        this.triggerSuccessGlow();
    }
    
    triggerSuccessGlow() {
        // Completion ceremony pause - hexagon savors the transformation
        setTimeout(() => {
            // Subtle pre-glow anticipation
            this.hexStack.style.filter = 'brightness(1.05)';
            
            setTimeout(() => {
                this.hexStack.style.filter = '';
                // Add success glow class for enhanced visual feedback
                this.hexStack.classList.add('success-glow');
                
                // Create ripple effect
                this.createSuccessRipple();
                
                // Reset after animation completes
                setTimeout(() => {
                    this.hexStack.classList.remove('success-glow');
                }, 2000);
            }, 100);
        }, 400); // Longer ceremonial pause before success
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

        // Surface the reason in the progress line so failure isn't just a
        // silent red flash — the user needs to know WHAT went wrong
        if (this.progressText && message) {
            this.progressIndicator.classList.add('active');
            this.progressText.textContent = message;
            clearTimeout(this._errorTextTimer);
            this._errorTextTimer = setTimeout(() => {
                this.progressText.textContent = '';
                this.progressIndicator.classList.remove('active');
            }, 4000);
        }
    }
    
    // Add custom setTimeout that tracks timeouts
    setTrackedTimeout(callback, delay) {
        const timeoutId = setTimeout(() => {
            this.activeTimeouts.delete(timeoutId);
            callback();
        }, delay);
        this.activeTimeouts.add(timeoutId);
        return timeoutId;
    }
    
    // Cleanup method to prevent memory leaks
    destroy() {
        console.log('🧹 Cleaning up Hexbloop resources...');
        
        // Clear all active timeouts
        this.activeTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
        this.activeTimeouts.clear();
        if (this.pointerFrame !== null) cancelAnimationFrame(this.pointerFrame);
        
        // Clear drag leave timeout
        if (this.dragLeaveTimeout) {
            clearTimeout(this.dragLeaveTimeout);
            this.dragLeaveTimeout = null;
        }

        // Remove all tracked event listeners
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
        
        // Pause and cleanup ambient audio
        if (this.ambientAudio) {
            this.ambientAudio.pause();
            this.ambientAudio.src = '';
        }

        // Release A/B playback blobs
        this.clearAB();

        console.log('✨ Cleanup complete');
    }
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    window.hexbloopMystic = new HexbloopMystic();
});

// Cleanup on window unload
window.addEventListener('beforeunload', () => {
    if (window.hexbloopMystic) {
        window.hexbloopMystic.destroy();
    }
});
