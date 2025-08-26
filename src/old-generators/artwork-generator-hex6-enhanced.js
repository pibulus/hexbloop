#!/usr/bin/env node

// ===================================================================
// HEX6 ENHANCED - MAXIMUM DENSITY & VARIATION 
// ===================================================================
// This version dramatically increases parameter sensitivity and
// adds complex layering for truly unique outputs every time

const { createCanvas } = require('canvas');
const fs = require('fs').promises;

class Hex6EnhancedArtworkGenerator {
    constructor() {
        this.width = 600;
        this.height = 600;
        this.canvas = createCanvas(this.width, this.height);
        this.ctx = this.canvas.getContext('2d');
        
        // 6 Styles
        this.styles = ['plasma', 'cosmic', 'bioform', 'neural', 'crystal', 'liquid'];
        this.styleIndex = 0;
        
        // 6 Parameters - with enhanced sensitivity
        this.parameters = {
            density: 0.5,     // Now controls 10x more elements
            scale: 0.5,       // Dramatic size variations
            turbulence: 0.5,  // Chaos and distortion
            luminosity: 0.5,  // Brightness and glow intensity
            saturation: 0.5,  // Color intensity
            symmetry: 0.5     // Pattern organization
        };
        
        // 6 Inputs (external modifiers)
        this.inputs = {
            audioEnergy: 0.5,
            moonPhase: 0.5,
            timeFractal: 0.5,
            systemEntropy: 0.5,
            generationMemory: 0.5,
            userChaos: 0.5
        };
        
        // Enhanced state tracking
        this.generation = 0;
        this.history = [];
        this.noiseSeed = Math.random() * 1000;
        this.palette = [];
        
        // Flow field for organic movement
        this.flowField = [];
        this.initFlowField();
    }
    
    initFlowField() {
        const resolution = 20;
        for (let y = 0; y < this.height; y += resolution) {
            for (let x = 0; x < this.width; x += resolution) {
                const angle = this.noise2D(x * 0.01, y * 0.01) * Math.PI * 2;
                this.flowField.push({
                    x: x,
                    y: y,
                    angle: angle,
                    force: 0.5 + this.noise2D(x * 0.02, y * 0.02) * 0.5
                });
            }
        }
    }
    
    async generate(options = {}) {
        // Extract options
        const { style, title, audioFeatures, moonPhase, seed } = options;
        
        // Update seed for variation
        if (seed !== undefined) {
            this.noiseSeed = seed;
        }
        
        // Select style based on inputs or specified
        if (style) {
            this.styleIndex = this.styles.indexOf(style.toLowerCase());
            if (this.styleIndex === -1) this.styleIndex = 0;
        } else {
            // Auto-select based on combined inputs
            const selector = (audioFeatures?.energy || 0.5) + (moonPhase || 0.5);
            this.styleIndex = Math.floor(selector * 3) % 6;
        }
        
        // Update inputs with dramatic scaling
        if (audioFeatures) {
            this.inputs.audioEnergy = audioFeatures.energy || 0.5;
            // Use audio to dramatically affect other parameters
            this.inputs.userChaos = (audioFeatures.tempo || 120) / 240;
            this.inputs.systemEntropy = audioFeatures.danceability || 0.5;
        }
        
        if (moonPhase !== undefined) {
            this.inputs.moonPhase = moonPhase;
            // Moon phase affects symmetry and flow
            this.inputs.timeFractal = Math.sin(moonPhase * Math.PI * 2) * 0.5 + 0.5;
        }
        
        // Calculate parameters with ENHANCED ranges
        this.calculateEnhancedParameters();
        
        // Generate enhanced color palette
        this.generateEnhancedPalette();
        
        // Balanced background - not black but not washed out
        const bgGradient = this.ctx.createRadialGradient(
            this.width/2, this.height/2, 0,
            this.width/2, this.height/2, this.width * 0.7
        );
        
        // Style-specific backgrounds with good contrast
        const currentStyle = this.styles[this.styleIndex];
        if (currentStyle === 'plasma') {
            // Dark but colorful for plasma to pop
            const bg1 = this.palette[0];
            bgGradient.addColorStop(0, `hsla(${bg1.h}, 40%, 10%, 1)`);
            bgGradient.addColorStop(0.5, `hsla(${bg1.h + 60}, 30%, 8%, 1)`);
            bgGradient.addColorStop(1, `hsla(${bg1.h + 120}, 20%, 5%, 1)`);
        } else if (currentStyle === 'liquid') {
            // Deep ocean background
            bgGradient.addColorStop(0, 'hsl(200, 50%, 12%)');
            bgGradient.addColorStop(0.5, 'hsl(210, 40%, 8%)');
            bgGradient.addColorStop(1, 'hsl(220, 30%, 4%)');
        } else if (currentStyle === 'cosmic') {
            // Deep space with color
            bgGradient.addColorStop(0, 'hsl(250, 60%, 8%)');
            bgGradient.addColorStop(0.5, 'hsl(270, 50%, 6%)');
            bgGradient.addColorStop(1, 'hsl(290, 40%, 4%)');
        } else if (currentStyle === 'bioform') {
            // Dark organic
            bgGradient.addColorStop(0, 'hsl(80, 20%, 10%)');
            bgGradient.addColorStop(0.5, 'hsl(100, 15%, 8%)');
            bgGradient.addColorStop(1, 'hsl(120, 10%, 5%)');
        } else if (currentStyle === 'neural' || currentStyle === 'crystal') {
            // Very dark for contrast
            bgGradient.addColorStop(0, 'hsl(0, 0%, 8%)');
            bgGradient.addColorStop(0.5, 'hsl(0, 0%, 5%)');
            bgGradient.addColorStop(1, 'hsl(0, 0%, 2%)');
        } else {
            // Default dark gradient
            const bg = this.palette[0];
            bgGradient.addColorStop(0, `hsla(${bg.h}, 20%, 10%, 1)`);
            bgGradient.addColorStop(1, `hsla(${bg.h + 90}, 10%, 5%, 1)`);
        }
        
        this.ctx.fillStyle = bgGradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Render with enhanced complexity
        this.renderEnhanced();
        
        // Add title if provided
        if (title) {
            this.addTitle(title);
        }
        
        // Update generation counter
        this.generation++;
        
        // Special hexagonal boost every 6th generation
        if (this.generation % 6 === 0) {
            this.applyHexagonalBoost();
        }
        
        return this.canvas;
    }
    
    calculateEnhancedParameters() {
        // DRAMATICALLY increased parameter effects
        const audioMod = this.inputs.audioEnergy;
        const moonMod = this.inputs.moonPhase;
        const timeMod = Math.sin(Date.now() * 0.0001) * 0.5 + 0.5;
        
        // Density now goes from 0.1 to 2.0 (20x range)
        this.parameters.density = 0.1 + (audioMod * 0.8 + moonMod * 0.6 + timeMod * 0.5);
        
        // Scale from 0.2 to 3.0 (15x range)
        this.parameters.scale = 0.2 + (moonMod * 1.5 + audioMod * 0.8 + this.inputs.userChaos * 0.5);
        
        // Turbulence from 0 to 2.0 (infinite increase)
        this.parameters.turbulence = (audioMod * 0.8 + this.inputs.systemEntropy * 0.7 + timeMod * 0.5);
        
        // Luminosity affects glow intensity dramatically
        this.parameters.luminosity = 0.3 + (moonMod * 0.5 + audioMod * 0.4);
        
        // Saturation from grayscale to hyper-saturated
        this.parameters.saturation = 0.2 + (audioMod * 0.6 + this.inputs.timeFractal * 0.4);
        
        // Symmetry affects pattern organization
        this.parameters.symmetry = moonMod * 0.7 + this.inputs.generationMemory * 0.3;
    }
    
    generateEnhancedPalette() {
        this.palette = [];
        const baseHue = (this.generation * 30 + this.inputs.audioEnergy * 180) % 360;
        
        // MUCH BRIGHTER palettes - like the rad generator!
        const sat = 50 + this.parameters.saturation * 50; // 50-100% saturation
        const lum = 40 + this.parameters.luminosity * 30; // 40-70% lightness (brighter!)
        
        // Style-specific bright palettes
        const style = this.styles[this.styleIndex];
        
        if (style === 'plasma') {
            // Bright neons that shift based on inputs
            const hueShift = (baseHue) % 360; // Use the calculated base hue
            const neonColors = [
                { h: (320 + hueShift) % 360, s: 100, l: 60 }, // Hot pink variant
                { h: (45 + hueShift) % 360, s: 100, l: 65 },  // Yellow variant
                { h: (180 + hueShift) % 360, s: 100, l: 55 }, // Cyan variant
                { h: (270 + hueShift) % 360, s: 90, l: 65 },  // Purple variant
                { h: (90 + hueShift) % 360, s: 80, l: 60 },   // Lime variant
                { h: (20 + hueShift) % 360, s: 100, l: 60 }   // Orange variant
            ];
            this.palette = neonColors.concat(neonColors); // Duplicate for 12 colors
        } else if (style === 'cosmic') {
            // Space colors that shift with base hue
            const cosmicBase = (200 + baseHue * 0.5) % 360; // Influenced by base hue
            for (let i = 0; i < 12; i++) {
                this.palette.push({
                    h: (cosmicBase + i * 15) % 360, // Shifting blues to purples
                    s: 70 + Math.sin(i) * 30,
                    l: 50 + Math.cos(i) * 20 // Brighter!
                });
            }
        } else if (style === 'bioform') {
            // Organic colors that shift naturally
            const bioShift = (baseHue * 0.3) % 120; // Stays in green/organic range
            const bioColors = [
                { h: (120 + bioShift) % 360, s: 70, l: 50 }, // Green variant
                { h: (160 + bioShift) % 360, s: 60, l: 55 }, // Teal variant
                { h: (80 + bioShift) % 360, s: 70, l: 60 },  // Yellow-green variant
                { h: (40 + bioShift) % 360, s: 80, l: 55 },  // Gold variant
                { h: (200 + bioShift * 0.5) % 360, s: 50, l: 60 }, // Sky blue variant
                { h: (140 + bioShift) % 360, s: 60, l: 50 }  // Mint variant
            ];
            this.palette = bioColors.concat(bioColors);
        } else if (style === 'liquid') {
            // Ocean colors - bright blues, aquas, foams
            for (let i = 0; i < 12; i++) {
                this.palette.push({
                    h: 170 + i * 8, // Aqua range
                    s: 60 + Math.sin(i * 0.5) * 40,
                    l: 55 + Math.sin(i * 0.3) * 15
                });
            }
        } else if (style === 'neural') {
            // Electric colors - bright purples, blues, pinks
            for (let i = 0; i < 12; i++) {
                this.palette.push({
                    h: 260 + i * 10,
                    s: 80 + Math.sin(i) * 20,
                    l: 55 + i * 2 // Getting brighter
                });
            }
        } else if (style === 'crystal') {
            // Rainbow prisms! All colors, bright and shimmering
            for (let i = 0; i < 12; i++) {
                this.palette.push({
                    h: (i * 30) % 360, // Full spectrum
                    s: 70 + Math.sin(i) * 30,
                    l: 60 + Math.cos(i) * 10
                });
            }
        } else {
            // Default: vibrant rainbow
            for (let i = 0; i < 12; i++) {
                const hueShift = Math.sin(i * 0.5) * 60;
                const satShift = Math.cos(i * 0.3) * 20;
                const lumShift = Math.sin(i * 0.7) * 15;
                
                this.palette.push({
                    h: (baseHue + hueShift + i * 30) % 360,
                    s: Math.max(50, Math.min(100, sat + satShift)),
                    l: Math.max(40, Math.min(80, lum + lumShift))
                });
            }
        }
    }
    
    renderEnhanced() {
        const currentStyle = this.styles[this.styleIndex];
        
        // Multi-layer rendering for ALL styles
        for (let layer = 0; layer < 4; layer++) {
            this.ctx.save();
            // Higher opacity for more vibrant colors
            this.ctx.globalAlpha = 0.9 - layer * 0.1; // Was 0.7 - layer * 0.15
            
            switch(currentStyle) {
                case 'plasma':
                    this.renderEnhancedPlasma(layer);
                    break;
                case 'cosmic':
                    this.renderEnhancedCosmic(layer);
                    break;
                case 'bioform':
                    this.renderEnhancedBioform(layer);
                    break;
                case 'neural':
                    this.renderEnhancedNeural(layer);
                    break;
                case 'crystal':
                    this.renderEnhancedCrystal(layer);
                    break;
                case 'liquid':
                    this.renderEnhancedLiquid(layer);
                    break;
            }
            
            this.ctx.restore();
        }
        
        // Add texture overlay for depth
        this.addTextureOverlay();
    }
    
    renderEnhancedPlasma(layer) {
        // Much more dense plasma with true neon glow
        const density = Math.floor(100 + this.parameters.density * 300); // 100-400 blobs
        const scale = this.parameters.scale;
        const turbulence = this.parameters.turbulence;
        
        // Use screen/lighter for maximum vibrancy
        this.ctx.globalCompositeOperation = layer === 0 ? 'source-over' : 'screen';
        
        // Generate random positions with seeded randomness for consistency
        const seed = this.generation + layer * 1000;
        
        for (let i = 0; i < density; i++) {
            // Distributed across canvas with some clustering
            const clusterCenter = Math.floor(i / 20);
            const clusterX = this.pseudoRandom(seed + clusterCenter * 100) * this.width;
            const clusterY = this.pseudoRandom(seed + clusterCenter * 100 + 1) * this.height;
            
            // Individual blob position within cluster
            const spread = 150 + turbulence * 100;
            const x = clusterX + (this.pseudoRandom(seed + i * 2) - 0.5) * spread;
            const y = clusterY + (this.pseudoRandom(seed + i * 2 + 1) - 0.5) * spread;
            
            // Variable sizes for organic look
            const sizeMultiplier = 0.2 + this.pseudoRandom(seed + i * 3) * 1.5;
            const radius = (15 + this.pseudoRandom(seed + i * 4) * 40) * scale * sizeMultiplier;
            
            // Pick color from palette
            const color = this.palette[(i + layer * 2) % this.palette.length];
            
            // Create bright neon gradient
            const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
            
            // Much stronger opacity and brightness
            const brightL = Math.min(color.l * 1.3, 90); // Boost brightness
            gradient.addColorStop(0, `hsla(${color.h}, ${color.s}%, ${brightL}%, 1)`);
            gradient.addColorStop(0.2, `hsla(${color.h}, ${color.s}%, ${color.l}%, 0.9)`);
            gradient.addColorStop(0.4, `hsla(${color.h}, ${color.s * 0.9}%, ${color.l * 0.9}%, 0.6)`);
            gradient.addColorStop(0.7, `hsla(${color.h + 10}, ${color.s * 0.8}%, ${color.l * 0.8}%, 0.3)`);
            gradient.addColorStop(1, `hsla(${color.h + 20}, ${color.s * 0.7}%, ${color.l * 0.7}%, 0)`);
            
            // Draw circular blob
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Add extra glow for larger blobs
            if (radius > 30 * scale) {
                const glowGradient = this.ctx.createRadialGradient(x, y, radius * 0.5, x, y, radius * 2);
                glowGradient.addColorStop(0, `hsla(${color.h}, ${color.s}%, ${color.l}%, 0)`);
                glowGradient.addColorStop(0.5, `hsla(${color.h}, ${color.s * 0.8}%, ${color.l * 1.2}%, 0.2)`);
                glowGradient.addColorStop(1, `hsla(${color.h + 15}, ${color.s * 0.6}%, ${color.l}%, 0)`);
                
                this.ctx.fillStyle = glowGradient;
                this.ctx.beginPath();
                this.ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
        
        // Add flowing connections between nearby blobs on upper layers
        if (layer > 0 && turbulence > 0.3) {
            this.ctx.globalAlpha = 0.3;
            
            // Create connection network
            for (let i = 0; i < density / 4; i++) {
                const x1 = this.pseudoRandom(seed + i * 10) * this.width;
                const y1 = this.pseudoRandom(seed + i * 10 + 1) * this.height;
                const x2 = x1 + (this.pseudoRandom(seed + i * 10 + 2) - 0.5) * 200;
                const y2 = y1 + (this.pseudoRandom(seed + i * 10 + 3) - 0.5) * 200;
                
                const connectionColor = this.palette[(i + layer) % this.palette.length];
                
                // Flowing curved connection
                this.ctx.strokeStyle = `hsla(${connectionColor.h}, ${connectionColor.s}%, ${connectionColor.l}%, 0.2)`;
                this.ctx.lineWidth = 1 + turbulence * 3;
                this.ctx.beginPath();
                this.ctx.moveTo(x1, y1);
                
                const cpX = (x1 + x2) / 2 + this.noise2D(i, layer) * 50 * turbulence;
                const cpY = (y1 + y2) / 2 + this.noise2D(i + 1, layer) * 50 * turbulence;
                
                this.ctx.quadraticCurveTo(cpX, cpY, x2, y2);
                this.ctx.stroke();
            }
            
            this.ctx.globalAlpha = 1;
        }
    }
    
    renderEnhancedCosmic(layer) {
        const density = Math.floor(500 + this.parameters.density * 2000); // MANY stars
        const scale = this.parameters.scale;
        
        if (layer === 0) {
            // Brighter space gradient - not pitch black!
            const g1 = this.ctx.createRadialGradient(
                this.width * (0.3 + this.noise2D(1, 1) * 0.4),
                this.height * (0.3 + this.noise2D(2, 2) * 0.4),
                0,
                this.width/2, this.height/2,
                this.width * (0.5 + scale * 0.3)
            );
            
            const deepColor = this.palette[0];
            // Much brighter background - deep blue/purple instead of black
            g1.addColorStop(0, `hsla(${deepColor.h}, ${deepColor.s * 0.7}%, 20%, 1)`);
            g1.addColorStop(0.5, `hsla(${deepColor.h + 180}, ${deepColor.s * 0.5}%, 15%, 1)`);
            g1.addColorStop(1, `hsla(${deepColor.h + 90}, 40%, 10%, 1)`);
            
            this.ctx.fillStyle = g1;
            this.ctx.fillRect(0, 0, this.width, this.height);
        }
        
        this.ctx.globalCompositeOperation = 'screen';
        
        // Star clusters with varying densities
        const clusterCount = 3 + Math.floor(this.parameters.density * 5);
        
        for (let c = 0; c < clusterCount; c++) {
            const clusterX = this.width * (0.1 + this.pseudoRandom(c * 100) * 0.8);
            const clusterY = this.height * (0.1 + this.pseudoRandom(c * 100 + 1) * 0.8);
            const clusterRadius = 50 + scale * 150;
            const starsInCluster = Math.floor(density / clusterCount);
            
            for (let i = 0; i < starsInCluster; i++) {
                // Gaussian distribution around cluster center
                const angle = this.pseudoRandom(c * 1000 + i * 2) * Math.PI * 2;
                const dist = Math.sqrt(this.pseudoRandom(c * 1000 + i * 2 + 1)) * clusterRadius;
                
                const x = clusterX + Math.cos(angle) * dist;
                const y = clusterY + Math.sin(angle) * dist;
                
                const brightness = 0.3 + this.pseudoRandom(c * 1000 + i * 3) * 0.7;
                const size = 0.5 + this.pseudoRandom(c * 1000 + i * 4) * scale * 3;
                
                // Star with halo
                const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, size * 4);
                const starColor = this.palette[(c + layer) % this.palette.length];
                
                gradient.addColorStop(0, `hsla(${starColor.h}, ${starColor.s * 0.3}%, 100%, ${brightness})`);
                gradient.addColorStop(0.1, `hsla(${starColor.h}, ${starColor.s}%, 80%, ${brightness * 0.7})`);
                gradient.addColorStop(0.3, `hsla(${starColor.h}, ${starColor.s}%, 60%, ${brightness * 0.3})`);
                gradient.addColorStop(1, 'transparent');
                
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(x - size * 4, y - size * 4, size * 8, size * 8);
            }
        }
        
        // Nebula wisps
        if (layer > 0) {
            this.ctx.filter = `blur(${20 + layer * 15}px)`;
            this.ctx.globalAlpha = 0.3;
            
            for (let i = 0; i < 5; i++) {
                const startX = this.width * this.pseudoRandom(layer * 100 + i * 10);
                const startY = this.height * this.pseudoRandom(layer * 100 + i * 10 + 1);
                
                this.ctx.beginPath();
                this.ctx.moveTo(startX, startY);
                
                // Create flowing nebula path
                for (let p = 0; p < 10; p++) {
                    const cpX = startX + this.noise2D(i * 10 + p, layer) * 200;
                    const cpY = startY + this.noise2D(i * 10 + p + 1, layer) * 200;
                    const nextX = startX + (p + 1) * 60;
                    const nextY = startY + this.noise2D(i * 10 + p + 2, layer) * 100;
                    
                    this.ctx.quadraticCurveTo(cpX, cpY, nextX, nextY);
                }
                
                const nebColor = this.palette[(i + layer * 2) % this.palette.length];
                this.ctx.strokeStyle = `hsla(${nebColor.h}, ${nebColor.s}%, ${nebColor.l}%, 0.2)`;
                this.ctx.lineWidth = 30 + scale * 50;
                this.ctx.stroke();
            }
            
            this.ctx.filter = 'none';
        }
    }
    
    renderEnhancedBioform(layer) {
        const density = Math.floor(30 + this.parameters.density * 120);
        const scale = 10 + this.parameters.scale * 50;
        
        this.ctx.globalCompositeOperation = layer === 0 ? 'source-over' : 'multiply';
        
        // Organic cell structures
        const cells = [];
        
        // Generate cell positions with organic clustering
        for (let i = 0; i < density; i++) {
            const cluster = Math.floor(i / 20);
            const clusterX = this.width * (0.2 + (cluster % 3) * 0.3);
            const clusterY = this.height * (0.2 + Math.floor(cluster / 3) * 0.3);
            
            cells.push({
                x: clusterX + this.noise2D(i * 0.1, layer) * 100,
                y: clusterY + this.noise2D(i * 0.1 + 1, layer) * 100,
                radius: scale * (0.5 + this.pseudoRandom(i) * 0.5),
                growth: this.pseudoRandom(i + layer) * Math.PI * 2,
                division: Math.floor(this.pseudoRandom(i + 100) * 3) + 1
            });
        }
        
        // Draw cell membranes and cytoplasm
        cells.forEach((cell, i) => {
            // Membrane
            const membraneGradient = this.ctx.createRadialGradient(
                cell.x, cell.y, cell.radius * 0.8,
                cell.x, cell.y, cell.radius
            );
            
            const cellColor = this.palette[i % this.palette.length];
            membraneGradient.addColorStop(0, 'transparent');
            membraneGradient.addColorStop(0.7, `hsla(${cellColor.h}, ${cellColor.s}%, ${cellColor.l}%, 0.2)`);
            membraneGradient.addColorStop(1, `hsla(${cellColor.h}, ${cellColor.s}%, ${cellColor.l * 0.7}%, 0.6)`);
            
            this.ctx.fillStyle = membraneGradient;
            this.ctx.beginPath();
            
            // Organic shape using noise
            for (let a = 0; a < Math.PI * 2; a += 0.1) {
                const noiseRadius = cell.radius * (1 + this.noise2D(
                    Math.cos(a) * 2 + i,
                    Math.sin(a) * 2 + layer
                ) * 0.3);
                
                const px = cell.x + Math.cos(a + cell.growth) * noiseRadius;
                const py = cell.y + Math.sin(a + cell.growth) * noiseRadius;
                
                if (a === 0) {
                    this.ctx.moveTo(px, py);
                } else {
                    this.ctx.lineTo(px, py);
                }
            }
            
            this.ctx.closePath();
            this.ctx.fill();
            
            // Nucleus
            if (cell.division > 1) {
                for (let n = 0; n < cell.division; n++) {
                    const nucleusX = cell.x + Math.cos(n * Math.PI * 2 / cell.division) * cell.radius * 0.3;
                    const nucleusY = cell.y + Math.sin(n * Math.PI * 2 / cell.division) * cell.radius * 0.3;
                    
                    const nucleusGradient = this.ctx.createRadialGradient(
                        nucleusX, nucleusY, 0,
                        nucleusX, nucleusY, cell.radius * 0.2
                    );
                    
                    nucleusGradient.addColorStop(0, `hsla(${cellColor.h + 30}, ${cellColor.s}%, ${cellColor.l + 10}%, 0.8)`);
                    nucleusGradient.addColorStop(1, `hsla(${cellColor.h + 30}, ${cellColor.s}%, ${cellColor.l}%, 0.3)`);
                    
                    this.ctx.fillStyle = nucleusGradient;
                    this.ctx.beginPath();
                    this.ctx.arc(nucleusX, nucleusY, cell.radius * 0.2, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        });
        
        // Cell connections (cytoskeleton)
        this.ctx.strokeStyle = `hsla(120, 50%, 50%, 0.1)`;
        this.ctx.lineWidth = 0.5;
        
        for (let i = 0; i < cells.length - 1; i++) {
            for (let j = i + 1; j < cells.length; j++) {
                const dist = Math.hypot(cells[j].x - cells[i].x, cells[j].y - cells[i].y);
                if (dist < 100 && this.pseudoRandom(i * 1000 + j) > 0.7) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(cells[i].x, cells[i].y);
                    
                    // Organic curve
                    const cpX = (cells[i].x + cells[j].x) / 2 + this.noise2D(i, j) * 30;
                    const cpY = (cells[i].y + cells[j].y) / 2 + this.noise2D(j, i) * 30;
                    
                    this.ctx.quadraticCurveTo(cpX, cpY, cells[j].x, cells[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }
    
    renderEnhancedNeural(layer) {
        const nodes = Math.floor(20 + this.parameters.density * 80);
        const scale = this.parameters.scale;
        
        this.ctx.globalCompositeOperation = layer === 0 ? 'source-over' : 'lighter';
        
        // Generate neural network
        const neurons = [];
        const layers = 4 + Math.floor(this.parameters.symmetry * 3);
        
        for (let l = 0; l < layers; l++) {
            const nodesInLayer = Math.floor(nodes / layers);
            for (let n = 0; n < nodesInLayer; n++) {
                neurons.push({
                    x: this.width * (0.1 + l * 0.8 / (layers - 1)),
                    y: this.height * (0.1 + n * 0.8 / (nodesInLayer - 1)),
                    activation: this.pseudoRandom(l * 100 + n),
                    layer: l,
                    connections: []
                });
            }
        }
        
        // Create connections
        neurons.forEach((neuron, i) => {
            neurons.forEach((other, j) => {
                if (other.layer === neuron.layer + 1) {
                    const probability = 0.3 + this.parameters.density * 0.5;
                    if (this.pseudoRandom(i * 1000 + j) < probability) {
                        neuron.connections.push(j);
                    }
                }
            });
        });
        
        // Draw synapses
        neurons.forEach((neuron, i) => {
            neuron.connections.forEach(targetIdx => {
                const target = neurons[targetIdx];
                const strength = neuron.activation * target.activation;
                
                // Synaptic firing animation
                const pulse = Math.sin((this.generation + i) * 0.2) * 0.5 + 0.5;
                
                const gradient = this.ctx.createLinearGradient(
                    neuron.x, neuron.y,
                    target.x, target.y
                );
                
                const synapseColor = this.palette[(i + layer) % this.palette.length];
                gradient.addColorStop(0, `hsla(${synapseColor.h}, ${synapseColor.s}%, ${synapseColor.l}%, ${strength * pulse * 0.5})`);
                gradient.addColorStop(0.5, `hsla(${synapseColor.h + 10}, ${synapseColor.s}%, ${synapseColor.l + 10}%, ${strength * pulse * 0.7})`);
                gradient.addColorStop(1, `hsla(${synapseColor.h}, ${synapseColor.s}%, ${synapseColor.l}%, ${strength * pulse * 0.5})`);
                
                this.ctx.strokeStyle = gradient;
                this.ctx.lineWidth = 0.5 + strength * 2 * scale;
                this.ctx.beginPath();
                this.ctx.moveTo(neuron.x, neuron.y);
                
                // Add curvature for organic look
                const cpX = (neuron.x + target.x) / 2 + this.noise2D(i, targetIdx) * 50 * this.parameters.turbulence;
                const cpY = (neuron.y + target.y) / 2 + this.noise2D(targetIdx, i) * 50 * this.parameters.turbulence;
                
                this.ctx.quadraticCurveTo(cpX, cpY, target.x, target.y);
                this.ctx.stroke();
            });
        });
        
        // Draw neurons
        neurons.forEach((neuron, i) => {
            const size = 3 + neuron.activation * 10 * scale;
            const glow = this.ctx.createRadialGradient(
                neuron.x, neuron.y, 0,
                neuron.x, neuron.y, size * 3
            );
            
            const neuronColor = this.palette[(neuron.layer + layer * 2) % this.palette.length];
            glow.addColorStop(0, `hsla(${neuronColor.h}, ${neuronColor.s}%, ${neuronColor.l + 30}%, ${neuron.activation})`);
            glow.addColorStop(0.3, `hsla(${neuronColor.h}, ${neuronColor.s}%, ${neuronColor.l + 10}%, ${neuron.activation * 0.7})`);
            glow.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = glow;
            this.ctx.fillRect(neuron.x - size * 3, neuron.y - size * 3, size * 6, size * 6);
        });
    }
    
    renderEnhancedCrystal(layer) {
        const density = Math.floor(6 + this.parameters.density * 30); // Hexagonal multiples
        const scale = 30 + this.parameters.scale * 100;
        
        // First fill background on layer 0
        if (layer === 0) {
            // Bright prismatic background for crystals
            const bgGradient = this.ctx.createRadialGradient(
                this.width/2, this.height/2, 0,
                this.width/2, this.height/2, this.width/2
            );
            // Lighter, more colorful background
            const bgColor = this.palette[0];
            bgGradient.addColorStop(0, `hsla(${bgColor.h}, 30%, 25%, 1)`);
            bgGradient.addColorStop(0.5, `hsla(${bgColor.h + 60}, 20%, 20%, 1)`);
            bgGradient.addColorStop(1, `hsla(${bgColor.h + 120}, 25%, 15%, 1)`);
            this.ctx.fillStyle = bgGradient;
            this.ctx.fillRect(0, 0, this.width, this.height);
        }
        
        this.ctx.save();
        this.ctx.translate(this.width/2, this.height/2);
        
        this.ctx.globalCompositeOperation = layer === 0 ? 'source-over' : 'screen';
        
        // Hexagonal crystal lattice
        for (let ring = 0; ring < density; ring++) {
            const radius = scale * (ring / density);
            const segments = 6 * (ring + 1); // Hexagonal growth
            
            for (let s = 0; s < segments; s++) {
                const angle = (s / segments) * Math.PI * 2;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                // Crystal facet
                const facetSize = scale / (ring + 1) * this.parameters.scale;
                
                this.ctx.save();
                this.ctx.translate(x, y);
                this.ctx.rotate(angle + this.generation * 0.01);
                
                // Multi-layer crystal
                for (let f = 0; f < 3; f++) {
                    const facetGradient = this.ctx.createLinearGradient(
                        -facetSize, -facetSize,
                        facetSize, facetSize
                    );
                    
                    const crystalColor = this.palette[(ring + s + f) % this.palette.length];
                    facetGradient.addColorStop(0, `hsla(${crystalColor.h}, ${crystalColor.s}%, ${crystalColor.l + 20}%, ${0.3 - f * 0.1})`);
                    facetGradient.addColorStop(0.5, `hsla(${crystalColor.h + 10}, ${crystalColor.s}%, ${crystalColor.l}%, ${0.5 - f * 0.1})`);
                    facetGradient.addColorStop(1, `hsla(${crystalColor.h}, ${crystalColor.s}%, ${crystalColor.l - 10}%, ${0.3 - f * 0.1})`);
                    
                    this.ctx.fillStyle = facetGradient;
                    
                    // Hexagonal shape
                    this.ctx.beginPath();
                    for (let h = 0; h < 6; h++) {
                        const hAngle = (h / 6) * Math.PI * 2;
                        const hx = Math.cos(hAngle) * facetSize * (1 - f * 0.2);
                        const hy = Math.sin(hAngle) * facetSize * (1 - f * 0.2);
                        
                        if (h === 0) {
                            this.ctx.moveTo(hx, hy);
                        } else {
                            this.ctx.lineTo(hx, hy);
                        }
                    }
                    this.ctx.closePath();
                    this.ctx.fill();
                    
                    // Add refraction lines
                    if (f === 0 && this.parameters.luminosity > 0.5) {
                        this.ctx.strokeStyle = `hsla(${crystalColor.h}, ${crystalColor.s * 0.5}%, 90%, ${0.3})`;
                        this.ctx.lineWidth = 0.5;
                        this.ctx.stroke();
                    }
                }
                
                this.ctx.restore();
            }
        }
        
        this.ctx.restore();
        
        // Add prismatic light effects
        if (layer === 2) {
            this.ctx.globalCompositeOperation = 'color-dodge';
            this.ctx.filter = `blur(${10 + this.parameters.turbulence * 20}px)`;
            
            for (let i = 0; i < 3; i++) {
                const lightAngle = (i / 3) * Math.PI * 2 + this.generation * 0.05;
                const lightGradient = this.ctx.createLinearGradient(
                    this.width/2 + Math.cos(lightAngle) * this.width/2,
                    this.height/2 + Math.sin(lightAngle) * this.height/2,
                    this.width/2 - Math.cos(lightAngle) * this.width/2,
                    this.height/2 - Math.sin(lightAngle) * this.height/2
                );
                
                const prismColor = this.palette[i * 4 % this.palette.length];
                lightGradient.addColorStop(0, 'transparent');
                lightGradient.addColorStop(0.5, `hsla(${prismColor.h}, ${prismColor.s}%, ${prismColor.l}%, ${0.2})`);
                lightGradient.addColorStop(1, 'transparent');
                
                this.ctx.fillStyle = lightGradient;
                this.ctx.fillRect(0, 0, this.width, this.height);
            }
            
            this.ctx.filter = 'none';
        }
    }
    
    renderEnhancedLiquid(layer) {
        const density = Math.floor(100 + this.parameters.density * 400);
        const scale = this.parameters.scale;
        const turbulence = this.parameters.turbulence;
        
        this.ctx.globalCompositeOperation = layer === 0 ? 'source-over' : 'soft-light';
        
        // Flow field particles
        for (let i = 0; i < density; i++) {
            const particle = {
                x: this.pseudoRandom(i * 2) * this.width,
                y: this.pseudoRandom(i * 2 + 1) * this.height,
                vx: 0,
                vy: 0,
                life: 100
            };
            
            // Trace particle through flow field
            this.ctx.beginPath();
            this.ctx.moveTo(particle.x, particle.y);
            
            for (let step = 0; step < particle.life; step++) {
                // Find nearest flow vector
                const flowX = Math.floor(particle.x / 20) * 20;
                const flowY = Math.floor(particle.y / 20) * 20;
                
                const angle = this.noise2D(flowX * 0.01, flowY * 0.01 + this.generation * 0.01) * Math.PI * 2;
                const force = 0.5 + turbulence;
                
                particle.vx += Math.cos(angle) * force;
                particle.vy += Math.sin(angle) * force;
                
                // Damping
                particle.vx *= 0.98;
                particle.vy *= 0.98;
                
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // Wrap around edges
                if (particle.x < 0) particle.x = this.width;
                if (particle.x > this.width) particle.x = 0;
                if (particle.y < 0) particle.y = this.height;
                if (particle.y > this.height) particle.y = 0;
                
                this.ctx.lineTo(particle.x, particle.y);
            }
            
            // Draw flow trail
            const flowColor = this.palette[(i + layer * 3) % this.palette.length];
            const alpha = 0.02 + (1 - i / density) * 0.08;
            
            this.ctx.strokeStyle = `hsla(${flowColor.h}, ${flowColor.s}%, ${flowColor.l}%, ${alpha})`;
            this.ctx.lineWidth = 0.5 + scale * 2;
            this.ctx.stroke();
        }
        
        // Add turbulent vortices
        if (layer > 0) {
            const vortexCount = 3 + Math.floor(this.parameters.density * 5);
            
            for (let v = 0; v < vortexCount; v++) {
                const vx = this.width * (0.2 + this.pseudoRandom(v * 10) * 0.6);
                const vy = this.height * (0.2 + this.pseudoRandom(v * 10 + 1) * 0.6);
                const vRadius = 50 + scale * 100;
                
                this.ctx.save();
                this.ctx.translate(vx, vy);
                
                // Spiral vortex
                this.ctx.beginPath();
                for (let s = 0; s < 100; s++) {
                    const sAngle = (s / 10) * Math.PI * 2;
                    const sRadius = (s / 100) * vRadius;
                    const sx = Math.cos(sAngle + this.generation * 0.05) * sRadius;
                    const sy = Math.sin(sAngle + this.generation * 0.05) * sRadius;
                    
                    if (s === 0) {
                        this.ctx.moveTo(sx, sy);
                    } else {
                        this.ctx.lineTo(sx, sy);
                    }
                }
                
                const vortexColor = this.palette[(v + layer * 2) % this.palette.length];
                this.ctx.strokeStyle = `hsla(${vortexColor.h}, ${vortexColor.s}%, ${vortexColor.l}%, 0.1)`;
                this.ctx.lineWidth = 2 + turbulence * 3;
                this.ctx.stroke();
                
                this.ctx.restore();
            }
        }
        
        // Surface ripples
        if (layer === 3) {
            this.ctx.filter = `blur(${5 + turbulence * 10}px)`;
            
            for (let r = 0; r < 10; r++) {
                const rx = this.width * this.pseudoRandom(r * 20 + layer);
                const ry = this.height * this.pseudoRandom(r * 20 + layer + 1);
                const rippleRadius = 20 + this.pseudoRandom(r * 20 + 2) * 50 * scale;
                
                const rippleGradient = this.ctx.createRadialGradient(rx, ry, 0, rx, ry, rippleRadius);
                const rippleColor = this.palette[r % this.palette.length];
                
                rippleGradient.addColorStop(0, 'transparent');
                rippleGradient.addColorStop(0.5, `hsla(${rippleColor.h}, ${rippleColor.s}%, ${rippleColor.l + 20}%, 0.1)`);
                rippleGradient.addColorStop(0.7, `hsla(${rippleColor.h}, ${rippleColor.s}%, ${rippleColor.l}%, 0.05)`);
                rippleGradient.addColorStop(1, 'transparent');
                
                this.ctx.fillStyle = rippleGradient;
                this.ctx.fillRect(rx - rippleRadius, ry - rippleRadius, rippleRadius * 2, rippleRadius * 2);
            }
            
            this.ctx.filter = 'none';
        }
    }
    
    addTextureOverlay() {
        // Add VERY subtle grain for organic feel
        // Skip texture overlay - it's overwhelming the artwork
        // We already have enough organic variation from the noise functions
        return;
    }
    
    applyHexagonalBoost() {
        // Special effect every 6th generation
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'color-dodge';
        this.ctx.globalAlpha = 0.3;
        
        // Sacred geometry overlay
        this.ctx.translate(this.width/2, this.height/2);
        
        for (let ring = 1; ring <= 6; ring++) {
            const radius = (this.width / 2) * (ring / 6);
            
            this.ctx.beginPath();
            for (let v = 0; v < 6; v++) {
                const angle = (v / 6) * Math.PI * 2 - Math.PI / 2;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                if (v === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            this.ctx.closePath();
            
            const boostColor = this.palette[ring % this.palette.length];
            this.ctx.strokeStyle = `hsla(${boostColor.h}, ${boostColor.s}%, ${boostColor.l + 30}%, ${0.5 / ring})`;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
    
    // Enhanced noise function with octaves
    noise2D(x, y) {
        let value = 0;
        let amplitude = 1;
        let frequency = 1;
        let maxValue = 0;
        
        for (let i = 0; i < 4; i++) {
            value += this.simpleNoise(x * frequency, y * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= 0.5;
            frequency *= 2;
        }
        
        return value / maxValue;
    }
    
    simpleNoise(x, y) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const xf = x - Math.floor(x);
        const yf = y - Math.floor(y);
        
        const a = this.pseudoRandom(X + Y * 256 + this.noiseSeed);
        const b = this.pseudoRandom(X + 1 + Y * 256 + this.noiseSeed);
        const c = this.pseudoRandom(X + (Y + 1) * 256 + this.noiseSeed);
        const d = this.pseudoRandom(X + 1 + (Y + 1) * 256 + this.noiseSeed);
        
        const u = this.fade(xf);
        const v = this.fade(yf);
        
        return this.lerp(v,
            this.lerp(u, a, b),
            this.lerp(u, c, d)
        );
    }
    
    pseudoRandom(x) {
        x = ((x >> 16) ^ x) * 0x45d9f3b;
        x = ((x >> 16) ^ x) * 0x45d9f3b;
        x = (x >> 16) ^ x;
        return (x & 0x7fffffff) / 0x7fffffff;
    }
    
    seededRandom(seed) {
        // More predictable seeded random for consistent results
        return this.pseudoRandom(Math.floor(seed * 1000000));
    }
    
    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }
    
    lerp(t, a, b) {
        return a + t * (b - a);
    }
    
    hslToRgb(h, s, l) {
        s /= 100;
        l /= 100;
        const a = s * Math.min(l, 1 - l);
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color);
        };
        return { r: f(0), g: f(8), b: f(4) };
    }
    
    addTitle(title) {
        this.ctx.save();
        this.ctx.font = 'bold 14px monospace';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(title, this.width/2, this.height - 20);
        this.ctx.restore();
    }
    
    async saveToFile(filePath) {
        const buffer = this.canvas.toBuffer('image/png');
        await fs.writeFile(filePath, buffer);
    }
}

module.exports = Hex6EnhancedArtworkGenerator;