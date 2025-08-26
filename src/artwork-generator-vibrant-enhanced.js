const { createCanvas } = require('canvas');
const fs = require('fs').promises;
const path = require('path');

// ===================================================================
// 🎨 VIBRANT ENHANCED - Combining best of all approaches
// ===================================================================

class VibrantEnhancedArtworkGenerator {
    constructor() {
        this.width = 1000;
        this.height = 1000;
        this.canvas = createCanvas(this.width, this.height);
        this.ctx = this.canvas.getContext('2d');
        
        // Expanded styles with sub-variations
        this.styles = [
            'neon-plasma',      // Bright metaballs
            'cosmic-flow',      // Flow fields with stars
            'vapor-dream',      // Soft vaporwave with organic shapes
            'cyber-matrix',     // Digital rain with neon
            'sunset-liquid',    // Flowing sunset colors
            'electric-storm',   // Lightning and energy
            'crystal-prism',    // Geometric with rainbow
            'ocean-aurora'      // Flowing northern lights
        ];
        
        this.time = 0;
        this.noiseOffset = Math.random() * 1000;
    }
    
    // ===================================================================
    // DYNAMIC COLOR PALETTES - Audio & mood responsive
    // ===================================================================
    
    getPalette(style, audioFeatures = null) {
        // Base palettes
        const palettes = {
            'neon-plasma': {
                bright: ['#FF00FF', '#00FFFF', '#FFFF00', '#FF00AA', '#00FF00'],
                dark: ['#AA00AA', '#00AAAA', '#AAAA00', '#AA0066', '#00AA00'],
                glow: '#FFFFFF'
            },
            'cosmic-flow': {
                bright: ['#FFD700', '#FF69B4', '#00CED1', '#FF4500', '#9370DB'],
                dark: ['#4B0082', '#191970', '#000080', '#2F4F4F', '#483D8B'],
                glow: '#E0FFFF'
            },
            'vapor-dream': {
                bright: ['#FF6AD5', '#C774E8', '#AD8CFF', '#8795E8', '#94D0FF'],
                dark: ['#FFB3E6', '#D4A5FF', '#B8E7FC', '#C8B6FF', '#FFDEE9'],
                glow: '#FFFFFF'
            },
            'cyber-matrix': {
                bright: ['#00FF00', '#00FF88', '#00FFFF', '#88FF00', '#00FF44'],
                dark: ['#003300', '#004400', '#005500', '#002200', '#001100'],
                glow: '#00FF00'
            },
            'sunset-liquid': {
                bright: ['#FFD60A', '#FEB237', '#FD6A6A', '#9B5DE5', '#00BBF9'],
                dark: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#F7DC6F', '#BB8FCE'],
                glow: '#FFAA00'
            },
            'electric-storm': {
                bright: ['#FFFF00', '#00FFFF', '#FF00FF', '#FFFFFF', '#8888FF'],
                dark: ['#000033', '#000066', '#330066', '#003366', '#000099'],
                glow: '#FFFFFF'
            },
            'crystal-prism': {
                bright: ['#FF0080', '#8000FF', '#0080FF', '#00FF80', '#FFFF00'],
                dark: ['#FF80C0', '#C080FF', '#80C0FF', '#80FFC0', '#FFFF80'],
                glow: '#FFFFFF'
            },
            'ocean-aurora': {
                bright: ['#00F5FF', '#00FA9A', '#40E0D0', '#48D1CC', '#00CED1'],
                dark: ['#006994', '#004466', '#003355', '#002244', '#001133'],
                glow: '#00FFAA'
            }
        };
        
        let palette = palettes[style] || palettes['neon-plasma'];
        
        // Modify based on audio features
        if (audioFeatures) {
            const energy = audioFeatures.energy || 0.5;
            const tempo = audioFeatures.tempo || 120;
            
            // High energy = brighter colors
            if (energy > 0.7) {
                return palette.bright;
            } else if (energy < 0.3) {
                // Mix dark and bright for low energy
                return [...palette.dark, ...palette.bright.slice(0, 2)];
            }
            
            // Fast tempo = more variety
            if (tempo > 140) {
                // Shuffle colors
                const mixed = [...palette.bright];
                for (let i = mixed.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [mixed[i], mixed[j]] = [mixed[j], mixed[i]];
                }
                return mixed;
            }
        }
        
        return palette.bright;
    }
    
    // ===================================================================
    // METABALLS - From rad generator
    // ===================================================================
    
    renderMetaballs(balls, colors) {
        const tempCanvas = createCanvas(this.width, this.height);
        const tempCtx = tempCanvas.getContext('2d');
        
        for (let i = 0; i < balls.length; i++) {
            const ball = balls[i];
            const gradient = tempCtx.createRadialGradient(
                ball.x, ball.y, 0,
                ball.x, ball.y, ball.radius * 2
            );
            
            const color = this.hexToRgb(colors[i % colors.length]);
            
            gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 1)`);
            gradient.addColorStop(0.3, `rgba(${color.r}, ${color.g}, ${color.b}, 0.9)`);
            gradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, 0.5)`);
            gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
            
            tempCtx.fillStyle = gradient;
            tempCtx.fillRect(
                ball.x - ball.radius * 2,
                ball.y - ball.radius * 2,
                ball.radius * 4,
                ball.radius * 4
            );
        }
        
        // Smooth blending with screen mode for brightness
        this.ctx.save();
        this.ctx.filter = 'blur(20px) contrast(2) brightness(1.5)';
        this.ctx.globalCompositeOperation = 'screen';
        this.ctx.drawImage(tempCanvas, 0, 0);
        this.ctx.restore();
    }
    
    // ===================================================================
    // FLOW FIELDS - Organic movement
    // ===================================================================
    
    renderFlowField(colors, density = 100) {
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';
        
        for (let i = 0; i < density; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            
            // Use noise for organic flow
            const angle = this.noise2D(x * 0.005, y * 0.005) * Math.PI * 2;
            const length = 50 + Math.random() * 100;
            
            const gradient = this.ctx.createLinearGradient(
                x, y,
                x + Math.cos(angle) * length,
                y + Math.sin(angle) * length
            );
            
            const color = colors[Math.floor(Math.random() * colors.length)];
            const rgb = this.hexToRgb(color);
            
            gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
            gradient.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`);
            gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
            
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 1 + Math.random() * 3;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            
            // Create flowing curve
            const steps = 20;
            for (let j = 0; j < steps; j++) {
                const t = j / steps;
                const nx = x + Math.cos(angle + t * 0.5) * length * t;
                const ny = y + Math.sin(angle + t * 0.5) * length * t;
                this.ctx.lineTo(nx, ny);
            }
            
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
    
    // ===================================================================
    // PARTICLE SYSTEMS
    // ===================================================================
    
    renderParticles(colors, count = 200) {
        for (let i = 0; i < count; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            const size = 1 + Math.random() * 4;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            // Glow effect for particles
            const glow = this.ctx.createRadialGradient(x, y, 0, x, y, size * 3);
            const rgb = this.hexToRgb(color);
            
            glow.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`);
            glow.addColorStop(0.3, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`);
            glow.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
            
            this.ctx.fillStyle = glow;
            this.ctx.fillRect(x - size * 3, y - size * 3, size * 6, size * 6);
        }
    }
    
    // ===================================================================
    // BACKGROUND VARIATIONS
    // ===================================================================
    
    drawDynamicBackground(style, colors) {
        const bgType = Math.floor(Math.random() * 3);
        
        switch (bgType) {
            case 0: // Gradient mesh
                this.drawGradientMesh(colors);
                break;
                
            case 1: // Radial burst
                this.drawRadialBurst(colors);
                break;
                
            case 2: // Wave gradient
                this.drawWaveGradient(colors);
                break;
        }
    }
    
    drawGradientMesh(colors) {
        // Create multiple gradients overlapping
        for (let i = 0; i < 3; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            const radius = 300 + Math.random() * 400;
            
            const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
            const color1 = colors[Math.floor(Math.random() * colors.length)];
            const color2 = colors[Math.floor(Math.random() * colors.length)];
            
            const rgb1 = this.hexToRgb(color1);
            const rgb2 = this.hexToRgb(color2);
            
            gradient.addColorStop(0, `rgba(${rgb1.r}, ${rgb1.g}, ${rgb1.b}, 0.3)`);
            gradient.addColorStop(1, `rgba(${rgb2.r}, ${rgb2.g}, ${rgb2.b}, 0.1)`);
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.width, this.height);
        }
    }
    
    drawRadialBurst(colors) {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        const gradient = this.ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, this.width * 0.7
        );
        
        // Multi-color gradient
        for (let i = 0; i < colors.length; i++) {
            const stop = i / (colors.length - 1);
            const rgb = this.hexToRgb(colors[i]);
            gradient.addColorStop(stop, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.5 - stop * 0.4})`);
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    drawWaveGradient(colors) {
        const gradient = this.ctx.createLinearGradient(0, 0, this.width, this.height);
        
        // Create wave pattern with colors
        for (let i = 0; i < 5; i++) {
            const stop = i / 4;
            const colorIndex = Math.floor(Math.random() * colors.length);
            const rgb = this.hexToRgb(colors[colorIndex]);
            gradient.addColorStop(stop, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.3 + Math.sin(i) * 0.2})`);
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    // ===================================================================
    // STYLE RENDERERS
    // ===================================================================
    
    renderNeonPlasma(colors) {
        // Bright background
        this.drawDynamicBackground('neon-plasma', colors.slice(2));
        
        // Metaballs
        const balls = [];
        for (let i = 0; i < 8; i++) {
            balls.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: 50 + Math.random() * 100
            });
        }
        this.renderMetaballs(balls, colors);
        
        // Particle overlay
        this.renderParticles(colors, 100);
    }
    
    renderCosmicFlow(colors) {
        // Dark space background with stars
        const gradient = this.ctx.createRadialGradient(
            this.width/2, this.height/2, 0,
            this.width/2, this.height/2, this.width
        );
        gradient.addColorStop(0, '#0A0E27');
        gradient.addColorStop(1, '#000000');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Stars
        this.renderParticles(['#FFFFFF', '#FFFF00', '#00FFFF'], 300);
        
        // Flow fields
        this.renderFlowField(colors, 150);
        
        // Nebula clouds
        const nebulaBalls = [];
        for (let i = 0; i < 5; i++) {
            nebulaBalls.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: 100 + Math.random() * 150
            });
        }
        this.ctx.globalAlpha = 0.3;
        this.renderMetaballs(nebulaBalls, colors);
        this.ctx.globalAlpha = 1;
    }
    
    renderVaporDream(colors) {
        // Pastel gradient background
        this.drawWaveGradient(colors);
        
        // Soft organic shapes
        this.ctx.globalCompositeOperation = 'multiply';
        const balls = [];
        for (let i = 0; i < 12; i++) {
            balls.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: 30 + Math.random() * 80
            });
        }
        this.renderMetaballs(balls, colors);
        this.ctx.globalCompositeOperation = 'source-over';
        
        // Grid overlay
        this.ctx.save();
        this.ctx.globalAlpha = 0.2;
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 1;
        
        // Grid lines
        for (let i = 0; i <= 10; i++) {
            const x = i * (this.width / 10);
            const y = i * (this.height / 10);
            
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
        this.ctx.restore();
    }
    
    // ===================================================================
    // UTILITIES
    // ===================================================================
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 255, g: 255, b: 255 };
    }
    
    noise2D(x, y) {
        const n = Math.sin(x * 12.9898 + y * 78.233 + this.noiseOffset) * 43758.5453;
        return (n - Math.floor(n)) * 2 - 1;
    }
    
    // ===================================================================
    // MAIN GENERATION
    // ===================================================================
    
    async generate(options = {}) {
        const {
            style = this.styles[Math.floor(Math.random() * this.styles.length)],
            seed = Date.now(),
            audioFeatures = null,
            moonPhase = 0.5,
            title = ''
        } = options;
        
        // Use seed for reproducible randomness
        this.seed = seed;
        this.random = () => {
            this.seed = (this.seed * 1664525 + 1013904223) % 2147483647;
            return this.seed / 2147483647;
        };
        
        // Get palette based on style and audio
        const paletteData = this.getPalette(style, audioFeatures);
        const colors = Array.isArray(paletteData) ? paletteData : paletteData.bright;
        
        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Render based on style
        switch (style) {
            case 'neon-plasma':
                this.renderNeonPlasma(colors);
                break;
                
            case 'cosmic-flow':
                this.renderCosmicFlow(colors);
                break;
                
            case 'vapor-dream':
                this.renderVaporDream(colors);
                break;
                
            case 'cyber-matrix':
                // Digital rain effect
                this.drawDynamicBackground(style, colors);
                this.renderFlowField(colors, 200);
                this.renderParticles(colors, 150);
                break;
                
            case 'sunset-liquid':
                // Flowing sunset
                this.drawRadialBurst(colors);
                const sunsetBalls = [];
                for (let i = 0; i < 10; i++) {
                    sunsetBalls.push({
                        x: Math.random() * this.width,
                        y: Math.random() * this.height,
                        radius: 40 + Math.random() * 100
                    });
                }
                this.renderMetaballs(sunsetBalls, colors);
                break;
                
            case 'electric-storm':
                // Lightning effects
                this.ctx.fillStyle = '#000033';
                this.ctx.fillRect(0, 0, this.width, this.height);
                this.renderFlowField(colors, 100);
                this.renderParticles(['#FFFFFF', '#FFFF00', '#00FFFF'], 200);
                break;
                
            case 'crystal-prism':
                // Geometric rainbow
                this.drawGradientMesh(colors);
                // Add geometric shapes
                for (let i = 0; i < 15; i++) {
                    const x = Math.random() * this.width;
                    const y = Math.random() * this.height;
                    const size = 50 + Math.random() * 100;
                    const sides = 3 + Math.floor(Math.random() * 5);
                    
                    this.ctx.save();
                    this.ctx.translate(x, y);
                    this.ctx.rotate(Math.random() * Math.PI * 2);
                    this.ctx.globalAlpha = 0.3 + Math.random() * 0.4;
                    
                    const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, size);
                    const color = colors[Math.floor(Math.random() * colors.length)];
                    const rgb = this.hexToRgb(color);
                    gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`);
                    gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
                    
                    this.ctx.fillStyle = gradient;
                    this.ctx.beginPath();
                    for (let j = 0; j < sides; j++) {
                        const angle = (j / sides) * Math.PI * 2;
                        const px = Math.cos(angle) * size;
                        const py = Math.sin(angle) * size;
                        if (j === 0) {
                            this.ctx.moveTo(px, py);
                        } else {
                            this.ctx.lineTo(px, py);
                        }
                    }
                    this.ctx.closePath();
                    this.ctx.fill();
                    this.ctx.restore();
                }
                break;
                
            case 'ocean-aurora':
                // Northern lights over water
                this.drawWaveGradient(colors);
                this.renderFlowField(colors, 120);
                // Aurora curtains
                this.ctx.globalCompositeOperation = 'screen';
                for (let i = 0; i < 5; i++) {
                    const gradient = this.ctx.createLinearGradient(
                        Math.random() * this.width, 0,
                        Math.random() * this.width, this.height
                    );
                    const color = colors[i % colors.length];
                    const rgb = this.hexToRgb(color);
                    gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
                    gradient.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`);
                    gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
                    
                    this.ctx.fillStyle = gradient;
                    this.ctx.fillRect(0, 0, this.width, this.height);
                }
                this.ctx.globalCompositeOperation = 'source-over';
                break;
                
            default:
                // Fallback to neon plasma
                this.renderNeonPlasma(colors);
        }
        
        // Add subtle grain
        this.addGrain(0.02);
        
        // Add title if provided
        if (title) {
            this.ctx.save();
            this.ctx.font = 'bold 20px monospace';
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.lineWidth = 3;
            this.ctx.textAlign = 'center';
            this.ctx.strokeText(title, this.width/2, this.height - 30);
            this.ctx.fillText(title, this.width/2, this.height - 30);
            this.ctx.restore();
        }
        
        return this.canvas;
    }
    
    addGrain(opacity = 0.05) {
        const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 255 * opacity;
            data[i] = Math.max(0, Math.min(255, data[i] + noise));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }
    
    async saveToFile(outputPath) {
        const buffer = this.canvas.toBuffer('image/png');
        await fs.writeFile(outputPath, buffer);
        return outputPath;
    }
}

module.exports = VibrantEnhancedArtworkGenerator;