/**
 * Frequency Spectrum Visualizer for Hexbloop
 * Creates mystical frequency visualization during audio processing
 */

class SpectrumVisualizer {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.analyser = null;
        this.animationId = null;
        this.isActive = false;
        this.resizeHandler = null;
        this.fadeTimeout = null;
        this.frameThrottle = null;
        
        // Performance settings
        this.lowPerformanceMode = false;
        this.checkPerformance();
        
        // Visualization settings
        this.barCount = this.lowPerformanceMode ? 16 : 32; // Reduce bars in low-perf mode
        this.colors = {
            primary: '#9333EA',    // Purple
            secondary: '#EC4899',  // Pink
            accent: '#3B82F6',     // Blue
            glow: '#F59E0B'        // Amber
        };
    }
    
    checkPerformance() {
        // Enable low performance mode on battery or low-end systems
        if (navigator.getBattery) {
            navigator.getBattery().then(battery => {
                this.lowPerformanceMode = battery.charging === false && battery.level < 0.3;
            });
        }
    }
    
    init() {
        // Create canvas element
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'spectrumCanvas';
        this.canvas.className = 'spectrum-canvas';
        this.ctx = this.canvas.getContext('2d');
        
        // Add canvas to DOM (behind hexagons)
        const container = document.querySelector('.app-container');
        const hexStack = document.getElementById('hexStack');
        container.insertBefore(this.canvas, hexStack);
        
        // Set canvas size
        this.resizeCanvas();
        this.resizeHandler = () => this.resizeCanvas();
        window.addEventListener('resize', this.resizeHandler);
        
        // Apply initial styles
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.zIndex = '1';
        this.canvas.style.opacity = '0';
        this.canvas.style.transition = 'opacity 1s ease';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.filter = 'blur(2px)';
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    startVisualization(audioData = null) {
        if (this.isActive) return;
        
        this.isActive = true;
        this.canvas.style.opacity = '0.7';
        
        // Create mock frequency data if no audio provided
        this.mockData = new Uint8Array(this.barCount);
        
        // Start animation loop
        this.animate();
    }
    
    stopVisualization() {
        this.isActive = false;
        this.canvas.style.opacity = '0';
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Clear any existing fade timeout
        if (this.fadeTimeout) {
            clearTimeout(this.fadeTimeout);
        }
        
        // Clear canvas after fade
        this.fadeTimeout = setTimeout(() => {
            if (this.ctx) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
            this.fadeTimeout = null;
        }, 1000);
    }
    
    animate() {
        if (!this.isActive) return;
        
        // Throttle to 30fps for better performance
        this.animationId = requestAnimationFrame(() => {
            setTimeout(() => this.animate(), 33); // ~30fps instead of 60fps
        });
        
        // Generate dynamic mock data (simulating audio processing)
        this.generateMockFrequencies();
        
        // Clear canvas with fade effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw frequency bars
        this.drawBars();
        
        // Draw circular visualization (only when processing)
        if (this.isActive) {
            this.drawCircularSpectrum();
        }
    }
    
    generateMockFrequencies() {
        const time = Date.now() / 1000;
        
        for (let i = 0; i < this.barCount; i++) {
            // Create wave-like motion with multiple sine waves
            const base = Math.sin(time * 2 + i * 0.5) * 50;
            const harmonic = Math.sin(time * 4 + i * 0.3) * 30;
            const noise = Math.random() * 20;
            
            // Emphasize bass frequencies (lower indices)
            const bassBoost = i < 8 ? 1.5 : 1;
            
            this.mockData[i] = Math.abs(base + harmonic + noise) * bassBoost + 20;
            this.mockData[i] = Math.min(255, this.mockData[i]);
        }
    }
    
    drawBars() {
        const barWidth = this.canvas.width / this.barCount;
        const centerY = this.canvas.height / 2;
        
        for (let i = 0; i < this.barCount; i++) {
            const barHeight = (this.mockData[i] / 255) * (this.canvas.height / 3);
            const x = i * barWidth;
            
            // Create gradient for each bar
            const gradient = this.ctx.createLinearGradient(0, centerY - barHeight, 0, centerY + barHeight);
            gradient.addColorStop(0, this.colors.primary);
            gradient.addColorStop(0.5, this.colors.secondary);
            gradient.addColorStop(1, this.colors.accent);
            
            this.ctx.fillStyle = gradient;
            this.ctx.globalAlpha = 0.6;
            
            // Draw mirrored bars
            this.ctx.fillRect(x, centerY - barHeight, barWidth - 2, barHeight);
            this.ctx.fillRect(x, centerY, barWidth - 2, barHeight);
            
            // Add glow effect for high frequencies
            if (this.mockData[i] > 180) {
                this.ctx.shadowBlur = 20;
                this.ctx.shadowColor = this.colors.glow;
                this.ctx.fillRect(x, centerY - barHeight, barWidth - 2, barHeight);
                this.ctx.shadowBlur = 0;
            }
        }
    }
    
    drawCircularSpectrum() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(this.canvas.width, this.canvas.height) / 4;
        
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        
        for (let i = 0; i < this.barCount; i++) {
            const angle = (i / this.barCount) * Math.PI * 2;
            const barHeight = (this.mockData[i] / 255) * radius;
            
            this.ctx.save();
            this.ctx.rotate(angle);
            
            // Create radial gradient
            const gradient = this.ctx.createLinearGradient(0, 0, 0, barHeight);
            gradient.addColorStop(0, 'rgba(147, 51, 234, 0.2)');
            gradient.addColorStop(1, this.colors.primary);
            
            this.ctx.fillStyle = gradient;
            this.ctx.globalAlpha = 0.4;
            
            // Draw radial bar
            this.ctx.fillRect(-2, radius / 2, 4, barHeight);
            
            this.ctx.restore();
        }
        
        this.ctx.restore();
    }
    
    // Pulse effect for processing events
    pulse(color = null) {
        const pulseColor = color || this.colors.glow;
        this.canvas.style.filter = `blur(2px) drop-shadow(0 0 30px ${pulseColor})`;
        
        setTimeout(() => {
            this.canvas.style.filter = 'blur(2px)';
        }, 500);
    }
    
    // Cleanup method to prevent memory leaks
    destroy() {
        // Stop animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Clear timeouts
        if (this.fadeTimeout) {
            clearTimeout(this.fadeTimeout);
            this.fadeTimeout = null;
        }
        
        if (this.frameThrottle) {
            clearTimeout(this.frameThrottle);
            this.frameThrottle = null;
        }
        
        // Remove event listeners
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
            this.resizeHandler = null;
        }
        
        // Clear canvas and remove from DOM
        if (this.canvas) {
            if (this.ctx) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
            if (this.canvas.parentNode) {
                this.canvas.parentNode.removeChild(this.canvas);
            }
            this.canvas = null;
            this.ctx = null;
        }
        
        this.isActive = false;
    }
}

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SpectrumVisualizer;
}