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
            seed = Date.now(),
            audioFeatures = null, // New: audio analysis data
            bandName = title // Use band name for deterministic generation
        } = options;

        // Clear canvas with dark background
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Generate DNA from band name for deterministic variation
        this.dna = this.generateBandNameDNA(bandName);
        
        // Set random seed for consistent generation
        this.seed = this.dna.primary || seed;
        this.random = this.seededRandom(this.seed);
        
        // Create secondary random generators for different aspects
        this.randomShape = this.seededRandom(this.dna.shapes);
        this.randomColor = this.seededRandom(this.dna.colors);
        this.randomComposition = this.seededRandom(this.dna.composition);

        // Store audio features for use in generators
        this.audioFeatures = audioFeatures;
        
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
        
        // Determine sub-variation based on DNA
        const cosmicVariation = this.dna ? (this.dna.primary % 4) : 0;
        
        // Dynamic background using complex gradient
        const bgGradient = this.createComplexGradient(
            cosmicVariation % 2 === 0 ? 'radial' : 'linear',
            this.width / 2, this.height / 2,
            this.width, this.height,
            colors.slice(0, 3)
        );
        
        this.ctx.fillStyle = bgGradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Sub-variations
        switch (cosmicVariation) {
            case 0: // Spiral galaxy
                this.drawSpiralGalaxy(colors, moonPhase);
                break;
            case 1: // Star cluster
                this.drawStarCluster(colors, moonPhase);
                break;
            case 2: // Black hole
                this.drawBlackHole(colors, moonPhase);
                break;
            case 3: // Pulsar
                this.drawPulsar(colors, moonPhase);
                break;
        }

        // Dynamic star field with varied densities
        const starDensity = 100 + this.dna.density * 300;
        for (let i = 0; i < starDensity; i++) {
            const x = this.randomComposition() * this.width;
            const y = this.randomComposition() * this.height;
            const size = this.randomShape() * 3 * (1 + this.dna.energy);
            const opacity = 0.3 + this.randomShape() * 0.7;
            
            // Some stars are colored
            if (this.randomShape() > 0.8) {
                this.ctx.fillStyle = colors[Math.floor(this.randomColor() * colors.length)];
                this.ctx.globalAlpha = opacity * 0.5;
            } else {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.globalAlpha = opacity;
            }
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Enhanced nebula clouds using bezier blobs
        const nebulaCount = 3 + Math.floor(this.dna.complexity * 5);
        for (let i = 0; i < nebulaCount; i++) {
            this.ctx.save();
            this.ctx.globalAlpha = 0.05 + this.randomShape() * 0.15;
            this.ctx.globalCompositeOperation = 'screen';
            
            const x = this.randomComposition() * this.width;
            const y = this.randomComposition() * this.height;
            const baseRadius = 100 + this.randomShape() * 300;
            
            // Use bezier blob for organic nebula shape
            this.ctx.fillStyle = colors[i % colors.length];
            this.drawBezierBlob(x, y, baseRadius, 12, 0.5);
            this.ctx.fill();
            
            // Add glow
            const glowGradient = this.ctx.createRadialGradient(x, y, 0, x, y, baseRadius * 1.5);
            glowGradient.addColorStop(0, colors[(i + 1) % colors.length]);
            glowGradient.addColorStop(0.5, colors[(i + 2) % colors.length] + '40');
            glowGradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = glowGradient;
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.restore();
        }
        
        this.ctx.globalAlpha = 1;
        
        // Add waveform visualization if audio features available
        if (this.audioFeatures && this.audioFeatures.waveform) {
            this.drawCosmicWaveform(colors[3], moonPhase);
        }
    }
    
    // Cosmic sub-variation: Spiral Galaxy
    drawSpiralGalaxy(colors, moonPhase) {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';
        this.ctx.strokeStyle = colors[2];
        this.ctx.lineWidth = 2 + this.dna.energy * 3;
        this.ctx.globalAlpha = 0.4;
        
        // Draw multiple spiral arms
        const arms = 2 + Math.floor(this.dna.complexity * 3);
        for (let arm = 0; arm < arms; arm++) {
            const offset = (arm / arms) * Math.PI * 2;
            this.drawSpiral(centerX, centerY, 'logarithmic', 4, 30);
            this.ctx.stroke();
            this.ctx.rotate(offset);
        }
        
        this.ctx.restore();
    }
    
    // Cosmic sub-variation: Star Cluster
    drawStarCluster(colors, moonPhase) {
        const clusters = 2 + Math.floor(this.dna.diversity * 3);
        
        for (let c = 0; c < clusters; c++) {
            const clusterX = this.randomComposition() * this.width;
            const clusterY = this.randomComposition() * this.height;
            const clusterRadius = 50 + this.randomShape() * 150;
            const starCount = 20 + Math.floor(this.dna.density * 50);
            
            for (let s = 0; s < starCount; s++) {
                const angle = this.randomShape() * Math.PI * 2;
                const distance = this.randomShape() * clusterRadius;
                const x = clusterX + Math.cos(angle) * distance;
                const y = clusterY + Math.sin(angle) * distance;
                
                this.ctx.fillStyle = colors[s % colors.length];
                this.ctx.globalAlpha = 0.5 + this.randomShape() * 0.5;
                this.ctx.beginPath();
                this.ctx.arc(x, y, 1 + this.randomShape() * 3, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
        
        this.ctx.globalAlpha = 1;
    }
    
    // Cosmic sub-variation: Black Hole
    drawBlackHole(colors, moonPhase) {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        // Accretion disk
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';
        
        for (let i = 0; i < 20; i++) {
            const radius = 50 + i * 15;
            const opacity = 0.3 - (i * 0.015);
            
            this.ctx.strokeStyle = colors[i % colors.length];
            this.ctx.globalAlpha = opacity;
            this.ctx.lineWidth = 3;
            
            this.ctx.beginPath();
            this.ctx.ellipse(centerX, centerY, radius, radius * 0.3, 0, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // Event horizon
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    // Cosmic sub-variation: Pulsar
    drawPulsar(colors, moonPhase) {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';
        
        // Pulsar beams
        const beamAngle = this.dna.primary * 0.001;
        
        for (let beam = 0; beam < 2; beam++) {
            const angle = beamAngle + beam * Math.PI;
            
            const gradient = this.ctx.createLinearGradient(
                centerX, centerY,
                centerX + Math.cos(angle) * this.width,
                centerY + Math.sin(angle) * this.width
            );
            
            gradient.addColorStop(0, colors[0]);
            gradient.addColorStop(0.5, colors[1] + '80');
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = gradient;
            this.ctx.globalAlpha = 0.6;
            
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.lineTo(
                centerX + Math.cos(angle - 0.1) * this.width,
                centerY + Math.sin(angle - 0.1) * this.width
            );
            this.ctx.lineTo(
                centerX + Math.cos(angle + 0.1) * this.width,
                centerY + Math.sin(angle + 0.1) * this.width
            );
            this.ctx.closePath();
            this.ctx.fill();
        }
        
        // Pulsar core
        this.ctx.fillStyle = colors[2];
        this.ctx.globalAlpha = 1;
        this.drawSuperformula(centerX, centerY, 30, 4, 2, 5, 5);
        this.ctx.fill();
        
        this.ctx.restore();
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
        
        // Add waveform visualization if audio features available
        if (this.audioFeatures && this.audioFeatures.waveform) {
            this.drawOrganicWaveform(colors, moonPhase);
        }
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
        
        // Add waveform visualization if audio features available
        if (this.audioFeatures && this.audioFeatures.waveform) {
            this.drawGeometricWaveform(colors, moonPhase);
        }
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
    // DYNAMIC COLOR GENERATION SYSTEM
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
    
    // Generate dynamic color palette based on harmonic rules
    generateHarmonicPalette(baseHue, saturation, lightness, scheme = 'complementary', count = 5) {
        const colors = [];
        const hue = (baseHue + (this.dna ? this.dna.hueOffset : 0)) % 360;
        
        switch (scheme) {
            case 'complementary':
                colors.push(this.hslToHex(hue, saturation, lightness));
                colors.push(this.hslToHex((hue + 180) % 360, saturation, lightness * 0.8));
                colors.push(this.hslToHex((hue + 30) % 360, saturation * 0.8, lightness * 1.2));
                colors.push(this.hslToHex((hue + 210) % 360, saturation * 0.9, lightness * 0.9));
                colors.push(this.hslToHex((hue + 90) % 360, saturation * 0.7, lightness * 1.1));
                break;
                
            case 'triadic':
                colors.push(this.hslToHex(hue, saturation, lightness));
                colors.push(this.hslToHex((hue + 120) % 360, saturation, lightness));
                colors.push(this.hslToHex((hue + 240) % 360, saturation, lightness));
                colors.push(this.hslToHex((hue + 60) % 360, saturation * 0.8, lightness * 1.2));
                colors.push(this.hslToHex((hue + 180) % 360, saturation * 0.7, lightness * 0.8));
                break;
                
            case 'tetradic':
                colors.push(this.hslToHex(hue, saturation, lightness));
                colors.push(this.hslToHex((hue + 90) % 360, saturation, lightness));
                colors.push(this.hslToHex((hue + 180) % 360, saturation, lightness));
                colors.push(this.hslToHex((hue + 270) % 360, saturation, lightness));
                colors.push(this.hslToHex((hue + 45) % 360, saturation * 0.9, lightness * 1.1));
                break;
                
            case 'analogous':
                colors.push(this.hslToHex(hue, saturation, lightness));
                colors.push(this.hslToHex((hue + 30) % 360, saturation, lightness));
                colors.push(this.hslToHex((hue - 30 + 360) % 360, saturation, lightness));
                colors.push(this.hslToHex((hue + 60) % 360, saturation * 0.9, lightness * 0.9));
                colors.push(this.hslToHex((hue - 60 + 360) % 360, saturation * 0.9, lightness * 1.1));
                break;
                
            case 'monochromatic':
                colors.push(this.hslToHex(hue, saturation, lightness * 0.3));
                colors.push(this.hslToHex(hue, saturation, lightness * 0.5));
                colors.push(this.hslToHex(hue, saturation, lightness * 0.7));
                colors.push(this.hslToHex(hue, saturation, lightness * 0.9));
                colors.push(this.hslToHex(hue, saturation, lightness * 1.1));
                break;
                
            case 'split-complementary':
                colors.push(this.hslToHex(hue, saturation, lightness));
                colors.push(this.hslToHex((hue + 150) % 360, saturation, lightness));
                colors.push(this.hslToHex((hue + 210) % 360, saturation, lightness));
                colors.push(this.hslToHex((hue + 30) % 360, saturation * 0.8, lightness * 1.1));
                colors.push(this.hslToHex((hue + 330) % 360, saturation * 0.8, lightness * 0.9));
                break;
        }
        
        // Add variations based on DNA
        if (this.dna) {
            const variationAmount = this.dna.diversity * 20;
            return colors.map(color => {
                // Parse hex back to HSL for variation
                const rgb = parseInt(color.slice(1), 16);
                const r = (rgb >> 16) & 255;
                const g = (rgb >> 8) & 255;
                const b = rgb & 255;
                
                // Simple RGB to HSL approximation for variation
                const max = Math.max(r, g, b) / 255;
                const min = Math.min(r, g, b) / 255;
                const l = (max + min) / 2;
                
                // Apply slight variations
                const hVariation = (this.randomColor() - 0.5) * variationAmount;
                const sVariation = (this.randomColor() - 0.5) * 10;
                const lVariation = (this.randomColor() - 0.5) * 10;
                
                return this.hslToHex(
                    (hue + hVariation + 360) % 360,
                    Math.max(0, Math.min(100, saturation + sVariation)),
                    Math.max(0, Math.min(100, lightness + lVariation))
                );
            });
        }
        
        // Extend to requested count if needed
        while (colors.length < count) {
            const lastColor = colors[colors.length - 1];
            colors.push(lastColor);
        }
        
        return colors.slice(0, count);
    }
    
    // Generate gradient with multiple stops
    createComplexGradient(type, x1, y1, x2, y2, colors) {
        let gradient;
        
        if (type === 'radial') {
            gradient = this.ctx.createRadialGradient(x1, y1, 0, x1, y1, Math.max(x2, y2));
        } else if (type === 'conic') {
            // Fallback to linear for browsers without conic gradient
            gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
        } else {
            gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
        }
        
        // Add color stops with DNA-influenced positions
        const stopVariation = this.dna ? this.dna.chaos * 0.2 : 0;
        
        colors.forEach((color, i) => {
            let position = i / (colors.length - 1);
            
            // Add variation to stop positions (except first and last)
            if (i > 0 && i < colors.length - 1) {
                position += (this.randomColor() - 0.5) * stopVariation;
                position = Math.max(0.1, Math.min(0.9, position));
            }
            
            gradient.addColorStop(position, color);
        });
        
        return gradient;
    }
    
    // Get palette based on style with dynamic generation
    getDynamicPalette(style, moonPhase) {
        // Determine color scheme based on style and DNA
        const schemes = ['complementary', 'triadic', 'tetradic', 'analogous', 'split-complementary', 'monochromatic'];
        const schemeIndex = this.dna ? Math.floor(this.dna.primary % schemes.length) : 0;
        const scheme = schemes[schemeIndex];
        
        // Base color parameters influenced by style and DNA
        let baseHue, saturation, lightness;
        
        switch (style) {
            case 'cosmic':
                baseHue = 260 + moonPhase * 60;
                saturation = 70 + this.dna.energy * 20;
                lightness = 30 + this.dna.complexity * 20;
                break;
            case 'organic':
                baseHue = 120 + moonPhase * 80;
                saturation = 40 + this.dna.diversity * 30;
                lightness = 40 + this.dna.energy * 20;
                break;
            case 'geometric':
                baseHue = this.dna.primary % 360;
                saturation = 80 + this.dna.chaos * 15;
                lightness = 50;
                break;
            default:
                baseHue = this.randomColor() * 360;
                saturation = 50 + this.randomColor() * 50;
                lightness = 30 + this.randomColor() * 40;
        }
        
        // Generate palette with 3-12 colors based on complexity
        const colorCount = Math.floor(5 + this.dna.complexity * 7);
        
        return this.generateHarmonicPalette(baseHue, saturation, lightness, scheme, colorCount);
    }

    // Legacy palette getters updated to use dynamic generation
    getCosmicPalette(moonPhase) {
        return this.getDynamicPalette('cosmic', moonPhase);
    }

    getOrganicPalette(moonPhase) {
        return this.getDynamicPalette('organic', moonPhase);
    }

    getGeometricPalette(moonPhase) {
        return this.getDynamicPalette('geometric', moonPhase);
    }

    getGlitchPalette(moonPhase) {
        return this.getDynamicPalette('glitch', moonPhase);
    }

    getAuroraPalette(moonPhase) {
        return this.getDynamicPalette('aurora', moonPhase);
    }

    getCrystalPalette(moonPhase) {
        return this.getDynamicPalette('crystal', moonPhase);
    }

    getVaporPalette(moonPhase) {
        return this.getDynamicPalette('vapor', moonPhase);
    }

    getRetroPalette(moonPhase) {
        return this.getDynamicPalette('retro', moonPhase);
    }

    getFractalPalette(moonPhase) {
        return this.getDynamicPalette('fractal', moonPhase);
    }

    getNebulaPalette(moonPhase) {
        return this.getDynamicPalette('nebula', moonPhase);
    }

    getMatrixPalette(moonPhase) {
        return this.getDynamicPalette('matrix', moonPhase);
    }

    getMysticPalette(moonPhase) {
        return this.getDynamicPalette('mystic', moonPhase);
    }

    // ===================================================================
    // BAND NAME DNA SYSTEM
    // ===================================================================
    
    generateBandNameDNA(bandName) {
        // Create multiple seeds from band name for different aspects
        const hashString = (str) => {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32bit integer
            }
            return Math.abs(hash);
        };
        
        const countVowels = (str) => (str.match(/[aeiouAEIOU]/g) || []).length;
        const countConsonants = (str) => (str.match(/[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]/g) || []).length;
        const uniqueChars = (str) => new Set(str.toLowerCase()).size;
        
        return {
            primary: hashString(bandName),
            shapes: hashString(bandName + 'shapes'),
            colors: hashString(bandName + 'colors'),
            composition: hashString(bandName + 'comp'),
            complexity: Math.min(bandName.length / 10, 1), // 0-1 scale
            energy: countVowels(bandName) / Math.max(bandName.length, 1), // vowel ratio
            chaos: countConsonants(bandName) / Math.max(bandName.length, 1), // consonant ratio
            diversity: uniqueChars(bandName) / Math.max(bandName.length, 1), // character diversity
            density: Math.min(bandName.length / 20, 1), // element density 0-1
            hueOffset: (hashString(bandName) % 360), // color hue offset
            styleBlend: (hashString(bandName + 'blend') % 100) / 100 // 0-1 blend ratio
        };
    }
    
    // ===================================================================
    // ENHANCED SHAPE LIBRARY
    // ===================================================================
    
    // Draw organic blob using bezier curves
    drawBezierBlob(x, y, baseRadius, points = 8, variance = 0.3) {
        this.ctx.beginPath();
        
        const angleStep = (Math.PI * 2) / points;
        const controlPoints = [];
        
        // Generate control points
        for (let i = 0; i < points; i++) {
            const angle = i * angleStep;
            const radiusVariation = baseRadius * (1 + (this.randomShape() - 0.5) * variance);
            controlPoints.push({
                x: x + Math.cos(angle) * radiusVariation,
                y: y + Math.sin(angle) * radiusVariation
            });
        }
        
        // Draw smooth bezier curve through points
        this.ctx.moveTo(controlPoints[0].x, controlPoints[0].y);
        
        for (let i = 0; i < points; i++) {
            const next = (i + 1) % points;
            const cp1x = controlPoints[i].x + (controlPoints[next].x - controlPoints[i].x) * 0.3;
            const cp1y = controlPoints[i].y + (controlPoints[next].y - controlPoints[i].y) * 0.3;
            const cp2x = controlPoints[next].x - (controlPoints[next].x - controlPoints[i].x) * 0.3;
            const cp2y = controlPoints[next].y - (controlPoints[next].y - controlPoints[i].y) * 0.3;
            
            this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, controlPoints[next].x, controlPoints[next].y);
        }
        
        this.ctx.closePath();
    }
    
    // Draw Lissajous curve
    drawLissajousCurve(centerX, centerY, radiusX, radiusY, a, b, delta) {
        this.ctx.beginPath();
        
        const steps = 1000;
        for (let i = 0; i <= steps; i++) {
            const t = (i / steps) * Math.PI * 2;
            const x = centerX + radiusX * Math.sin(a * t + delta);
            const y = centerY + radiusY * Math.sin(b * t);
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
    }
    
    // Draw spiral (Archimedean, logarithmic, or Fermat)
    drawSpiral(centerX, centerY, type = 'archimedean', turns = 5, spacing = 5) {
        this.ctx.beginPath();
        
        const steps = turns * 100;
        for (let i = 0; i <= steps; i++) {
            const t = (i / steps) * turns * Math.PI * 2;
            let r;
            
            switch (type) {
                case 'archimedean':
                    r = spacing * t;
                    break;
                case 'logarithmic':
                    r = spacing * Math.exp(t * 0.1);
                    break;
                case 'fermat':
                    r = spacing * Math.sqrt(t) * 10;
                    break;
                default:
                    r = spacing * t;
            }
            
            const x = centerX + r * Math.cos(t);
            const y = centerY + r * Math.sin(t);
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
    }
    
    // Draw superformula shape
    drawSuperformula(centerX, centerY, size, m, n1, n2, n3) {
        this.ctx.beginPath();
        
        const steps = 360;
        for (let i = 0; i <= steps; i++) {
            const angle = (i / steps) * Math.PI * 2;
            
            const term1 = Math.pow(Math.abs(Math.cos(m * angle / 4)), n2);
            const term2 = Math.pow(Math.abs(Math.sin(m * angle / 4)), n3);
            const r = size / Math.pow(term1 + term2, 1 / n1);
            
            const x = centerX + r * Math.cos(angle);
            const y = centerY + r * Math.sin(angle);
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        
        this.ctx.closePath();
    }
    
    // Generate Voronoi-like cells
    drawVoronoiCell(points, index, bounds) {
        const point = points[index];
        const neighbors = [];
        
        // Find neighboring points (simplified Voronoi)
        for (let i = 0; i < points.length; i++) {
            if (i !== index) {
                const midX = (point.x + points[i].x) / 2;
                const midY = (point.y + points[i].y) / 2;
                const angle = Math.atan2(points[i].y - point.y, points[i].x - point.x) + Math.PI / 2;
                neighbors.push({ midX, midY, angle });
            }
        }
        
        // Sort neighbors by angle
        neighbors.sort((a, b) => a.angle - b.angle);
        
        // Draw cell
        this.ctx.beginPath();
        neighbors.forEach((n, i) => {
            if (i === 0) {
                this.ctx.moveTo(n.midX, n.midY);
            } else {
                this.ctx.lineTo(n.midX, n.midY);
            }
        });
        this.ctx.closePath();
    }
    
    // Generate flow field particles
    generateFlowField(width, height, scale = 0.01) {
        const field = [];
        const cols = Math.ceil(width / 20);
        const rows = Math.ceil(height / 20);
        
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                // Use Perlin-like noise simulation
                const angle = (Math.sin(x * scale) + Math.cos(y * scale)) * Math.PI;
                field.push({
                    x: x * 20,
                    y: y * 20,
                    angle: angle,
                    force: 0.5 + this.randomShape() * 0.5
                });
            }
        }
        
        return field;
    }
    
    // Draw metaballs
    drawMetaballs(balls) {
        const imageData = this.ctx.createImageData(this.width, this.height);
        const data = imageData.data;
        
        for (let x = 0; x < this.width; x += 2) {
            for (let y = 0; y < this.height; y += 2) {
                let sum = 0;
                
                balls.forEach(ball => {
                    const dx = x - ball.x;
                    const dy = y - ball.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    sum += ball.radius / Math.max(distance, 0.001);
                });
                
                if (sum > 1) {
                    const index = (y * this.width + x) * 4;
                    data[index] = 255;
                    data[index + 1] = 255;
                    data[index + 2] = 255;
                    data[index + 3] = 255;
                }
            }
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }

    // ===================================================================
    // HELPER METHODS
    // ===================================================================

    drawCosmicWaveform(color, moonPhase) {
        if (!this.audioFeatures || !this.audioFeatures.waveform) return;
        
        const waveform = this.audioFeatures.waveform;
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const baseRadius = 200 + moonPhase * 100;
        const energy = this.audioFeatures.energy || 0.5;
        
        // Draw circular waveform
        this.ctx.save();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2 + energy * 3;
        this.ctx.globalAlpha = 0.6 + energy * 0.3;
        
        this.ctx.beginPath();
        for (let i = 0; i < waveform.length; i++) {
            const angle = (i / waveform.length) * Math.PI * 2 - Math.PI / 2;
            const amplitude = waveform[i] * 150 * (1 + energy);
            const radius = baseRadius + amplitude;
            
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.closePath();
        this.ctx.stroke();
        
        // Add glow effect
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 20;
        this.ctx.stroke();
        
        this.ctx.restore();
    }

    drawOrganicWaveform(colors, moonPhase) {
        if (!this.audioFeatures || !this.audioFeatures.waveform) return;
        
        const waveform = this.audioFeatures.waveform;
        const energy = this.audioFeatures.energy || 0.5;
        
        // Draw flowing waveform across the canvas
        this.ctx.save();
        this.ctx.strokeStyle = colors[2];
        this.ctx.lineWidth = 3 + energy * 5;
        this.ctx.globalAlpha = 0.4 + energy * 0.3;
        
        // Draw multiple wave layers
        for (let layer = 0; layer < 3; layer++) {
            this.ctx.beginPath();
            const yOffset = this.height * (0.3 + layer * 0.2);
            
            for (let i = 0; i < waveform.length; i++) {
                const x = (i / waveform.length) * this.width;
                const amplitude = waveform[i] * 100 * (1 + moonPhase);
                const y = yOffset + amplitude * Math.sin(i * 0.1 + layer);
                
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            
            this.ctx.stroke();
            this.ctx.globalAlpha *= 0.7; // Fade each layer
        }
        
        this.ctx.restore();
    }

    drawGeometricWaveform(colors, moonPhase) {
        if (!this.audioFeatures || !this.audioFeatures.waveform) return;
        
        const waveform = this.audioFeatures.waveform;
        const segments = 32; // Number of geometric segments
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const baseRadius = 150;
        
        this.ctx.save();
        this.ctx.strokeStyle = colors[3];
        this.ctx.fillStyle = colors[4] + '40'; // Semi-transparent fill
        this.ctx.lineWidth = 2;
        
        // Create polygon from waveform
        this.ctx.beginPath();
        for (let i = 0; i < segments; i++) {
            const waveIndex = Math.floor((i / segments) * waveform.length);
            const amplitude = waveform[waveIndex];
            const angle = (i / segments) * Math.PI * 2;
            const radius = baseRadius + amplitude * 200 * (1 + moonPhase * 0.5);
            
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        this.ctx.restore();
    }

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