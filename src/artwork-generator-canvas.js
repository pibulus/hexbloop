const { createCanvas } = require('canvas');
const fs = require('fs').promises;
const path = require('path');

// ===================================================================
// 🎨 CANVAS-BASED ARTWORK GENERATOR - VIBRANT & MYSTICAL
// ===================================================================

class ArtworkGeneratorCanvas {
    constructor() {
        this.width = 1400;
        this.height = 1400;
        this.canvas = createCanvas(this.width, this.height);
        this.ctx = this.canvas.getContext('2d');
    }

    // ===================================================================
    // CORE GENERATION
    // ===================================================================

    async generate(options = {}) {
        const {
            style = this.getRandomStyle(),
            title = 'Untitled',
            duration = 0,
            moonPhase = 0.5,
            seed = Date.now()
        } = options;

        // Clear canvas with dark background
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Set random seed for consistent generation
        this.seed = seed;
        this.random = this.seededRandom(seed);

        // Generate based on style
        switch (style) {
            case 'cosmic':
                await this.generateCosmic(moonPhase);
                break;
            case 'organic':
                await this.generateOrganic(moonPhase);
                break;
            case 'geometric':
                await this.generateGeometric(moonPhase);
                break;
            case 'glitch':
                await this.generateGlitch(moonPhase);
                break;
            case 'aurora':
                await this.generateAurora(moonPhase);
                break;
            case 'crystal':
                await this.generateCrystal(moonPhase);
                break;
            case 'vapor':
                await this.generateVapor(moonPhase);
                break;
            case 'retro':
                await this.generateRetro(moonPhase);
                break;
            case 'fractal':
                await this.generateFractal(moonPhase);
                break;
            case 'nebula':
                await this.generateNebula(moonPhase);
                break;
            case 'matrix':
                await this.generateMatrix(moonPhase);
                break;
            case 'mystic':
                await this.generateMystic(moonPhase);
                break;
            default:
                await this.generateCosmic(moonPhase);
        }

        // Add subtle overlay effects
        this.addOverlayEffects(moonPhase);

        // Add title if provided
        if (title) {
            this.addTitle(title);
        }

        return this.canvas;
    }

    // ===================================================================
    // STYLE GENERATORS
    // ===================================================================

    async generateCosmic(moonPhase) {
        const colors = this.getCosmicPalette(moonPhase);
        
        // Background gradient
        const gradient = this.ctx.createRadialGradient(
            this.width / 2, this.height / 2, 0,
            this.width / 2, this.height / 2, this.width / 2
        );
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(0.5, colors[1]);
        gradient.addColorStop(1, '#000000');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Stars
        for (let i = 0; i < 200; i++) {
            const x = this.random() * this.width;
            const y = this.random() * this.height;
            const size = this.random() * 3;
            const opacity = 0.3 + this.random() * 0.7;
            
            this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Nebula clouds
        for (let i = 0; i < 5; i++) {
            this.ctx.save();
            this.ctx.globalAlpha = 0.1 + this.random() * 0.2;
            const x = this.random() * this.width;
            const y = this.random() * this.height;
            const radius = 100 + this.random() * 200;
            
            const cloudGradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
            cloudGradient.addColorStop(0, colors[2]);
            cloudGradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = cloudGradient;
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.restore();
        }
    }

    async generateOrganic(moonPhase) {
        const colors = this.getOrganicPalette(moonPhase);
        
        // Organic background
        this.ctx.fillStyle = colors[0];
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Flowing curves using bezier
        for (let i = 0; i < 15; i++) {
            this.ctx.strokeStyle = colors[i % colors.length];
            this.ctx.lineWidth = 2 + this.random() * 8;
            this.ctx.globalAlpha = 0.3 + this.random() * 0.4;
            
            this.ctx.beginPath();
            const startX = this.random() * this.width;
            const startY = this.random() * this.height;
            this.ctx.moveTo(startX, startY);
            
            for (let j = 0; j < 4; j++) {
                const cp1x = this.random() * this.width;
                const cp1y = this.random() * this.height;
                const cp2x = this.random() * this.width;
                const cp2y = this.random() * this.height;
                const endX = this.random() * this.width;
                const endY = this.random() * this.height;
                
                this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
            }
            
            this.ctx.stroke();
        }
        
        this.ctx.globalAlpha = 1;
    }

    async generateGeometric(moonPhase) {
        const colors = this.getGeometricPalette(moonPhase);
        
        // Dark background
        this.ctx.fillStyle = '#0f0f0f';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Hexagon grid
        const hexSize = 40 + moonPhase * 20;
        const rows = Math.ceil(this.height / (hexSize * 1.5));
        const cols = Math.ceil(this.width / (hexSize * Math.sqrt(3)));

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = col * hexSize * Math.sqrt(3) + (row % 2) * hexSize * Math.sqrt(3) / 2;
                const y = row * hexSize * 1.5;
                
                if (this.random() > 0.3) {
                    this.ctx.fillStyle = colors[Math.floor(this.random() * colors.length)];
                    this.ctx.globalAlpha = 0.3 + this.random() * 0.7;
                    this.drawHexagon(x, y, hexSize * (0.5 + this.random() * 0.5));
                }
            }
        }
        
        this.ctx.globalAlpha = 1;
    }

    async generateGlitch(moonPhase) {
        const colors = this.getGlitchPalette(moonPhase);
        
        // Noisy background
        this.ctx.fillStyle = colors[0];
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Glitch bars
        for (let i = 0; i < 20; i++) {
            const y = this.random() * this.height;
            const height = 2 + this.random() * 50;
            const offset = (this.random() - 0.5) * 100;
            
            this.ctx.save();
            this.ctx.globalCompositeOperation = 'screen';
            this.ctx.fillStyle = colors[Math.floor(this.random() * colors.length)];
            this.ctx.globalAlpha = 0.5 + this.random() * 0.5;
            this.ctx.fillRect(offset, y, this.width, height);
            this.ctx.restore();
        }

        // Digital artifacts
        for (let i = 0; i < 50; i++) {
            const x = this.random() * this.width;
            const y = this.random() * this.height;
            const size = 10 + this.random() * 50;
            
            this.ctx.fillStyle = colors[Math.floor(this.random() * colors.length)];
            this.ctx.globalAlpha = 0.1 + this.random() * 0.3;
            this.ctx.fillRect(x, y, size, size);
        }
        
        this.ctx.globalAlpha = 1;
    }

    async generateAurora(moonPhase) {
        const colors = this.getAuroraPalette(moonPhase);
        
        // Night sky background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#000428');
        gradient.addColorStop(1, '#004e92');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Aurora waves
        for (let i = 0; i < 5; i++) {
            this.ctx.save();
            this.ctx.globalCompositeOperation = 'screen';
            this.ctx.globalAlpha = 0.2 + this.random() * 0.3;
            
            const waveGradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
            waveGradient.addColorStop(0, 'transparent');
            waveGradient.addColorStop(0.3, colors[i % colors.length]);
            waveGradient.addColorStop(0.7, colors[(i + 1) % colors.length]);
            waveGradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = waveGradient;
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, this.height / 2);
            
            for (let x = 0; x <= this.width; x += 20) {
                const y = this.height / 2 + 
                         Math.sin((x + i * 100) * 0.01) * 200 * (1 + moonPhase) +
                         Math.sin((x + i * 50) * 0.02) * 100;
                this.ctx.lineTo(x, y);
            }
            
            this.ctx.lineTo(this.width, this.height);
            this.ctx.lineTo(0, this.height);
            this.ctx.closePath();
            this.ctx.fill();
            
            this.ctx.restore();
        }
    }

    async generateCrystal(moonPhase) {
        const colors = this.getCrystalPalette(moonPhase);
        
        // Dark crystalline background
        this.ctx.fillStyle = '#0a0a1a';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Crystal formations
        for (let i = 0; i < 15; i++) {
            const x = this.random() * this.width;
            const y = this.random() * this.height;
            const size = 30 + this.random() * 100;
            const sides = 3 + Math.floor(this.random() * 4);
            
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(this.random() * Math.PI * 2);
            
            // Crystal shape
            this.ctx.strokeStyle = colors[i % colors.length];
            this.ctx.lineWidth = 2;
            this.ctx.globalAlpha = 0.3 + this.random() * 0.5;
            
            this.ctx.beginPath();
            for (let j = 0; j <= sides; j++) {
                const angle = (j / sides) * Math.PI * 2;
                const px = Math.cos(angle) * size;
                const py = Math.sin(angle) * size;
                
                if (j === 0) {
                    this.ctx.moveTo(px, py);
                } else {
                    this.ctx.lineTo(px, py);
                }
            }
            this.ctx.stroke();
            
            // Inner glow
            const glowGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, size);
            glowGradient.addColorStop(0, colors[i % colors.length] + '40');
            glowGradient.addColorStop(1, 'transparent');
            this.ctx.fillStyle = glowGradient;
            this.ctx.fill();
            
            this.ctx.restore();
        }
        
        this.ctx.globalAlpha = 1;
    }

    async generateVapor(moonPhase) {
        const colors = this.getVaporPalette(moonPhase);
        
        // Gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, this.width, this.height);
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(0.5, colors[1]);
        gradient.addColorStop(1, colors[2]);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Sun/moon circle
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const sunRadius = 150 + moonPhase * 50;
        
        const sunGradient = this.ctx.createRadialGradient(
            centerX, centerY, sunRadius * 0.8,
            centerX, centerY, sunRadius
        );
        sunGradient.addColorStop(0, '#ff6b9d');
        sunGradient.addColorStop(0.5, '#feca57');
        sunGradient.addColorStop(1, '#ff9ff3');
        
        this.ctx.fillStyle = sunGradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, sunRadius, 0, Math.PI * 2);
        this.ctx.fill();

        // Grid lines
        this.ctx.strokeStyle = '#00ffff80';
        this.ctx.lineWidth = 2;
        
        // Horizontal lines
        for (let y = this.height * 0.6; y < this.height; y += 30) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
        
        // Vertical lines with perspective
        for (let x = -this.width; x < this.width * 2; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
    }

    async generateRetro(moonPhase) {
        const colors = this.getRetroPalette(moonPhase);
        
        // Retro gradient background
        this.ctx.fillStyle = colors[0];
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Scan lines
        this.ctx.strokeStyle = '#00000020';
        this.ctx.lineWidth = 1;
        for (let y = 0; y < this.height; y += 4) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }

        // Retro shapes
        for (let i = 0; i < 10; i++) {
            const x = this.random() * this.width;
            const y = this.random() * this.height;
            const size = 50 + this.random() * 150;
            
            this.ctx.fillStyle = colors[i % colors.length];
            this.ctx.globalAlpha = 0.5 + this.random() * 0.3;
            
            // Random retro shape
            const shapeType = Math.floor(this.random() * 3);
            switch (shapeType) {
                case 0: // Circle
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, size / 2, 0, Math.PI * 2);
                    this.ctx.fill();
                    break;
                case 1: // Triangle
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, y - size / 2);
                    this.ctx.lineTo(x - size / 2, y + size / 2);
                    this.ctx.lineTo(x + size / 2, y + size / 2);
                    this.ctx.closePath();
                    this.ctx.fill();
                    break;
                case 2: // Square
                    this.ctx.fillRect(x - size / 2, y - size / 2, size, size);
                    break;
            }
        }
        
        this.ctx.globalAlpha = 1;
    }

    async generateFractal(moonPhase) {
        const colors = this.getFractalPalette(moonPhase);
        
        // Dark background
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Sierpinski-like triangles
        const drawTriangle = (x, y, size, depth) => {
            if (depth === 0 || size < 2) return;
            
            this.ctx.strokeStyle = colors[depth % colors.length];
            this.ctx.globalAlpha = 0.3 + (depth * 0.1);
            this.ctx.lineWidth = 1;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x, y - size);
            this.ctx.lineTo(x - size, y + size);
            this.ctx.lineTo(x + size, y + size);
            this.ctx.closePath();
            this.ctx.stroke();
            
            // Recursive calls
            const newSize = size / 2;
            drawTriangle(x, y - newSize, newSize, depth - 1);
            drawTriangle(x - newSize, y + newSize / 2, newSize, depth - 1);
            drawTriangle(x + newSize, y + newSize / 2, newSize, depth - 1);
        };

        // Draw multiple fractals
        for (let i = 0; i < 3; i++) {
            const x = this.width / 4 + (i * this.width / 4);
            const y = this.height / 2 + (this.random() - 0.5) * 200;
            const size = 100 + this.random() * 100;
            drawTriangle(x, y, size, 5 + Math.floor(moonPhase * 3));
        }
        
        this.ctx.globalAlpha = 1;
    }

    async generateNebula(moonPhase) {
        const colors = this.getNebulaPalette(moonPhase);
        
        // Space background
        this.ctx.fillStyle = '#000011';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Multiple nebula clouds
        for (let cloud = 0; cloud < 8; cloud++) {
            const x = this.random() * this.width;
            const y = this.random() * this.height;
            const radius = 100 + this.random() * 300;
            
            // Create nebula effect with multiple gradients
            for (let layer = 0; layer < 5; layer++) {
                this.ctx.save();
                this.ctx.globalCompositeOperation = 'screen';
                this.ctx.globalAlpha = 0.05 + this.random() * 0.1;
                
                const layerRadius = radius * (1 + layer * 0.3);
                const gradient = this.ctx.createRadialGradient(
                    x + (this.random() - 0.5) * 50,
                    y + (this.random() - 0.5) * 50,
                    0,
                    x, y, layerRadius
                );
                
                gradient.addColorStop(0, colors[cloud % colors.length]);
                gradient.addColorStop(0.5, colors[(cloud + 1) % colors.length]);
                gradient.addColorStop(1, 'transparent');
                
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(0, 0, this.width, this.height);
                this.ctx.restore();
            }
        }

        // Add stars on top
        for (let i = 0; i < 100; i++) {
            const x = this.random() * this.width;
            const y = this.random() * this.height;
            const size = this.random() * 2;
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.globalAlpha = 0.5 + this.random() * 0.5;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.globalAlpha = 1;
    }

    async generateMatrix(moonPhase) {
        const colors = this.getMatrixPalette(moonPhase);
        
        // Black background
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Matrix rain effect
        const fontSize = 14;
        const columns = Math.floor(this.width / fontSize);
        const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
        
        for (let col = 0; col < columns; col++) {
            const x = col * fontSize;
            const columnHeight = 5 + Math.floor(this.random() * 30);
            
            for (let row = 0; row < columnHeight; row++) {
                const y = row * fontSize;
                const char = chars[Math.floor(this.random() * chars.length)];
                const opacity = 1 - (row / columnHeight);
                
                this.ctx.fillStyle = row === 0 ? '#ffffff' : colors[0];
                this.ctx.globalAlpha = opacity * (0.5 + moonPhase * 0.5);
                this.ctx.font = `${fontSize}px monospace`;
                this.ctx.fillText(char, x, y);
            }
        }
        
        this.ctx.globalAlpha = 1;
    }

    async generateMystic(moonPhase) {
        const colors = this.getMysticPalette(moonPhase);
        
        // Mystical gradient background
        const gradient = this.ctx.createRadialGradient(
            this.width / 2, this.height / 2, 0,
            this.width / 2, this.height / 2, this.width / 2
        );
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(0.5, colors[1]);
        gradient.addColorStop(1, '#000000');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Sacred geometry - Flower of Life pattern
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const baseRadius = 60 + moonPhase * 40;
        
        this.ctx.strokeStyle = colors[2];
        this.ctx.lineWidth = 2;
        this.ctx.globalAlpha = 0.6;
        
        // Center circle
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Surrounding circles
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * baseRadius;
            const y = centerY + Math.sin(angle) * baseRadius;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, baseRadius, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // Second layer
            for (let j = 0; j < 6; j++) {
                const angle2 = angle + (j / 6) * Math.PI * 2;
                const x2 = centerX + Math.cos(angle2) * baseRadius * 2;
                const y2 = centerY + Math.sin(angle2) * baseRadius * 2;
                
                this.ctx.globalAlpha = 0.3;
                this.ctx.beginPath();
                this.ctx.arc(x2, y2, baseRadius, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        }
        
        // Mystical symbols
        this.ctx.globalAlpha = 0.4;
        this.ctx.font = '48px serif';
        this.ctx.fillStyle = colors[3];
        const symbols = ['☽', '☾', '⚜', '✧', '✦', '✯', '⬟', '◈'];
        
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const distance = 200 + this.random() * 100;
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            
            this.ctx.fillText(symbols[i % symbols.length], x - 24, y + 24);
        }
        
        this.ctx.globalAlpha = 1;
    }

    // ===================================================================
    // COLOR PALETTES
    // ===================================================================

    // Helper to convert HSL to hex for canvas compatibility
    hslToHex(h, s, l) {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }

    getCosmicPalette(moonPhase) {
        return [
            this.hslToHex(280 + moonPhase * 40, 80, 20),
            this.hslToHex(260 + moonPhase * 30, 70, 30),
            this.hslToHex(300 + moonPhase * 60, 90, 60),
            this.hslToHex(200 + moonPhase * 40, 80, 50),
            this.hslToHex(180 + moonPhase * 20, 70, 40)
        ];
    }

    getOrganicPalette(moonPhase) {
        return [
            this.hslToHex(120 + moonPhase * 60, 30, 20),
            this.hslToHex(140 + moonPhase * 40, 50, 40),
            this.hslToHex(160 + moonPhase * 30, 60, 50),
            this.hslToHex(100 + moonPhase * 50, 40, 35),
            this.hslToHex(80 + moonPhase * 40, 55, 45)
        ];
    }

    getGeometricPalette(moonPhase) {
        return [
            this.hslToHex(0 + moonPhase * 60, 90, 50),
            this.hslToHex(60 + moonPhase * 60, 90, 50),
            this.hslToHex(180 + moonPhase * 60, 90, 50),
            this.hslToHex(240 + moonPhase * 60, 90, 50),
            this.hslToHex(300 + moonPhase * 60, 90, 50)
        ];
    }

    getGlitchPalette(moonPhase) {
        return [
            '#0a0a0a',
            '#ff00ff',
            '#00ffff',
            '#ffff00',
            '#ff0080',
            '#00ff80'
        ];
    }

    getAuroraPalette(moonPhase) {
        return [
            this.hslToHex(120 + moonPhase * 60, 100, 50),
            this.hslToHex(180 + moonPhase * 40, 100, 50),
            this.hslToHex(280 + moonPhase * 30, 80, 60),
            this.hslToHex(340 + moonPhase * 20, 70, 50),
            this.hslToHex(60 + moonPhase * 50, 90, 60)
        ];
    }

    getCrystalPalette(moonPhase) {
        return [
            this.hslToHex(200 + moonPhase * 40, 80, 60),
            this.hslToHex(280 + moonPhase * 30, 90, 70),
            this.hslToHex(320 + moonPhase * 20, 70, 65),
            this.hslToHex(180 + moonPhase * 50, 85, 55),
            this.hslToHex(240 + moonPhase * 40, 75, 60)
        ];
    }

    getVaporPalette(moonPhase) {
        return [
            '#ff6b9d',
            '#c44569',
            '#feca57',
            '#48dbfb',
            '#ff9ff3'
        ];
    }

    getRetroPalette(moonPhase) {
        return [
            '#2d3436',
            '#ff7675',
            '#74b9ff',
            '#a29bfe',
            '#fd79a8',
            '#fdcb6e'
        ];
    }

    getFractalPalette(moonPhase) {
        return [
            this.hslToHex(0 + moonPhase * 360, 80, 50),
            this.hslToHex(72 + moonPhase * 360, 80, 50),
            this.hslToHex(144 + moonPhase * 360, 80, 50),
            this.hslToHex(216 + moonPhase * 360, 80, 50),
            this.hslToHex(288 + moonPhase * 360, 80, 50)
        ];
    }

    getNebulaPalette(moonPhase) {
        return [
            this.hslToHex(280 + moonPhase * 60, 90, 60),
            this.hslToHex(200 + moonPhase * 40, 80, 50),
            this.hslToHex(340 + moonPhase * 30, 85, 55),
            this.hslToHex(160 + moonPhase * 50, 70, 45),
            this.hslToHex(60 + moonPhase * 40, 75, 50)
        ];
    }

    getMatrixPalette(moonPhase) {
        return [
            '#00ff00',
            '#00cc00',
            '#009900',
            '#00ff80',
            '#80ff00'
        ];
    }

    getMysticPalette(moonPhase) {
        return [
            this.hslToHex(280 + moonPhase * 30, 60, 20),
            this.hslToHex(260 + moonPhase * 40, 50, 30),
            this.hslToHex(300 + moonPhase * 20, 70, 60),
            this.hslToHex(240 + moonPhase * 50, 80, 70),
            this.hslToHex(200 + moonPhase * 60, 60, 50)
        ];
    }

    // ===================================================================
    // HELPER METHODS
    // ===================================================================

    drawHexagon(x, y, size) {
        this.ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const px = x + size * Math.cos(angle);
            const py = y + size * Math.sin(angle);
            
            if (i === 0) {
                this.ctx.moveTo(px, py);
            } else {
                this.ctx.lineTo(px, py);
            }
        }
        this.ctx.closePath();
        this.ctx.fill();
    }

    addOverlayEffects(moonPhase) {
        // Subtle vignette
        const gradient = this.ctx.createRadialGradient(
            this.width / 2, this.height / 2, this.width / 4,
            this.width / 2, this.height / 2, this.width / 1.5
        );
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.7, 'transparent');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Moon phase influence overlay
        if (moonPhase > 0.5) {
            this.ctx.save();
            this.ctx.globalCompositeOperation = 'overlay';
            this.ctx.globalAlpha = (moonPhase - 0.5) * 0.2;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.restore();
        }
    }

    addTitle(title) {
        // Title background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, this.height - 100, this.width, 100);
        
        // Title text
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 36px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(title, this.width / 2, this.height - 50);
        
        // Reset text alignment
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'alphabetic';
    }

    seededRandom(seed) {
        let currentSeed = seed;
        return () => {
            currentSeed = (currentSeed * 9301 + 49297) % 233280;
            return currentSeed / 233280;
        };
    }

    getRandomStyle() {
        const styles = [
            'cosmic', 'organic', 'geometric', 'glitch', 'aurora',
            'crystal', 'vapor', 'retro', 'fractal', 'nebula',
            'matrix', 'mystic'
        ];
        return styles[Math.floor(Math.random() * styles.length)];
    }

    // ===================================================================
    // EXPORT METHODS
    // ===================================================================

    async saveToFile(outputPath, format = 'png') {
        const buffer = format === 'jpeg' 
            ? this.canvas.toBuffer('image/jpeg', { quality: 0.9 })
            : this.canvas.toBuffer('image/png');
        
        await fs.writeFile(outputPath, buffer);
        return outputPath;
    }

    toBuffer(format = 'png') {
        return format === 'jpeg'
            ? this.canvas.toBuffer('image/jpeg', { quality: 0.9 })
            : this.canvas.toBuffer('image/png');
    }
}

module.exports = ArtworkGeneratorCanvas;