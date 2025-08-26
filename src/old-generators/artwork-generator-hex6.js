const { createCanvas } = require('canvas');
const fs = require('fs').promises;
const os = require('os');

// ===================================================================
// 🔮 HEXBLOOP 6x6x6 ARTWORK GENERATOR
// ===================================================================
// True hexagonal system: 6 styles × 6 parameters × 6 inputs = 216 dimensions
// Dense, organic, luminous artwork with proper style separation
// ===================================================================

class Hex6ArtworkGenerator {
    constructor() {
        this.width = 1400;
        this.height = 1400;
        this.canvas = createCanvas(this.width, this.height);
        this.ctx = this.canvas.getContext('2d');
        
        // 6×6×6 System State
        this.generation = 0;
        this.styleIndex = 0;
        
        // 6 Core Styles (each with unique identity)
        this.styles = ['plasma', 'cosmic', 'bioform', 'neural', 'crystal', 'liquid'];
        
        // 6 Variation Parameters (0-1 range)
        this.parameters = {
            density: 0.5,
            scale: 0.5,
            turbulence: 0.5,
            luminosity: 0.5,
            saturation: 0.5,
            symmetry: 0.5
        };
        
        // 6 Input Modifiers (influence parameters)
        this.modifiers = {
            audioEnergy: 0.5,
            moonPhase: 0.5,
            timeFractal: 0.5,
            systemEntropy: 0.5,
            generationMemory: 0.5,
            userChaos: 0.5
        };
        
        // Color palette memory
        this.palette = [];
        
        // Particle systems for density
        this.particles = [];
        
        // Noise seed
        this.noiseSeed = Math.random() * 1000;
    }
    
    // ===================================================================
    // INPUT PROCESSING
    // ===================================================================
    
    processInputs(options = {}) {
        // Audio features
        if (options.audioFeatures) {
            this.modifiers.audioEnergy = options.audioFeatures.energy || 0.5;
            // Energy affects density and luminosity
            this.parameters.density = 0.3 + this.modifiers.audioEnergy * 0.5;
            this.parameters.luminosity = 0.4 + this.modifiers.audioEnergy * 0.4;
        }
        
        // Moon phase
        this.modifiers.moonPhase = options.moonPhase || 0.5;
        // Moon affects symmetry and scale
        this.parameters.symmetry = 0.3 + Math.abs(this.modifiers.moonPhase - 0.5) * 1.4;
        
        // Time fractals (multiple time cycles)
        const now = new Date();
        const hourCycle = (now.getHours() + now.getMinutes() / 60) / 24;
        const dayCycle = now.getDay() / 7;
        const yearCycle = (now.getMonth() + 1) / 12;
        this.modifiers.timeFractal = (hourCycle + dayCycle + yearCycle) / 3;
        
        // System entropy
        this.modifiers.systemEntropy = os.loadavg()[0] / os.cpus().length;
        this.parameters.turbulence = 0.3 + this.modifiers.systemEntropy * 0.5;
        
        // Generation memory (increases complexity over time)
        this.modifiers.generationMemory = Math.min(1, this.generation / 10);
        this.parameters.scale = 0.4 + this.modifiers.generationMemory * 0.3;
        
        // User chaos
        this.modifiers.userChaos = options.seed ? (options.seed % 100) / 100 : Math.random();
        this.parameters.saturation = 0.5 + (this.modifiers.userChaos - 0.5) * 0.6;
        
        // Determine style based on inputs
        this.selectStyle(options);
    }
    
    selectStyle(options) {
        if (options.style && this.styles.includes(options.style)) {
            this.styleIndex = this.styles.indexOf(options.style);
        } else {
            // Auto-select based on modifiers
            let weights = new Array(6).fill(1);
            
            // High energy → plasma or neural
            if (this.modifiers.audioEnergy > 0.7) {
                weights[0] += 3; // plasma
                weights[3] += 2; // neural
            }
            
            // Full/new moon → cosmic or crystal
            if (this.modifiers.moonPhase < 0.1 || this.modifiers.moonPhase > 0.9) {
                weights[1] += 3; // cosmic
                weights[4] += 2; // crystal
            }
            
            // High entropy → bioform or liquid
            if (this.modifiers.systemEntropy > 0.5) {
                weights[2] += 2; // bioform
                weights[5] += 3; // liquid
            }
            
            // Select weighted random
            const total = weights.reduce((a, b) => a + b, 0);
            let random = Math.random() * total;
            for (let i = 0; i < weights.length; i++) {
                random -= weights[i];
                if (random <= 0) {
                    this.styleIndex = i;
                    break;
                }
            }
        }
    }
    
    // ===================================================================
    // COLOR GENERATION
    // ===================================================================
    
    generatePalette() {
        const baseHue = (this.styleIndex * 60 + this.generation * 15) % 360;
        const sat = this.parameters.saturation * 100;
        const lum = this.parameters.luminosity * 50 + 25;
        
        this.palette = [];
        
        // Style-specific palettes
        switch (this.styles[this.styleIndex]) {
            case 'plasma':
                // Hot colors - reds, oranges, yellows, magentas
                for (let i = 0; i < 6; i++) {
                    this.palette.push({
                        h: (baseHue + i * 20) % 360,
                        s: sat,
                        l: lum + i * 5
                    });
                }
                break;
                
            case 'cosmic':
                // Cool colors - blues, purples, cyans
                for (let i = 0; i < 6; i++) {
                    this.palette.push({
                        h: (200 + i * 30) % 360,
                        s: sat * 0.8,
                        l: lum - i * 3
                    });
                }
                break;
                
            case 'bioform':
                // Organic colors - greens, yellows, browns
                for (let i = 0; i < 6; i++) {
                    this.palette.push({
                        h: (90 + i * 15) % 360,
                        s: sat * 0.7,
                        l: lum
                    });
                }
                break;
                
            case 'neural':
                // Electric colors - cyans, blues, whites
                for (let i = 0; i < 6; i++) {
                    this.palette.push({
                        h: (180 + i * 20) % 360,
                        s: sat,
                        l: lum + i * 8
                    });
                }
                break;
                
            case 'crystal':
                // Prismatic colors - full spectrum
                for (let i = 0; i < 6; i++) {
                    this.palette.push({
                        h: i * 60,
                        s: sat * 0.9,
                        l: lum + 10
                    });
                }
                break;
                
            case 'liquid':
                // Water colors - blues, teals, aquas
                for (let i = 0; i < 6; i++) {
                    this.palette.push({
                        h: (170 + i * 10) % 360,
                        s: sat * 0.6,
                        l: lum + i * 2
                    });
                }
                break;
        }
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
    
    getColor(index) {
        const color = this.palette[index % this.palette.length];
        return `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
    }
    
    // ===================================================================
    // NOISE FUNCTIONS
    // ===================================================================
    
    noise2D(x, y) {
        // Improved noise function
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
    
    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }
    
    lerp(t, a, b) {
        return a + t * (b - a);
    }
    
    // ===================================================================
    // STYLE RENDERERS (Dense versions)
    // ===================================================================
    
    renderPlasma() {
        const density = Math.floor(10 + this.parameters.density * 40);
        const scale = 50 + this.parameters.scale * 200;
        
        // Multiple layers for depth
        for (let layer = 0; layer < 3; layer++) {
            this.ctx.save();
            this.ctx.globalAlpha = 0.6 - layer * 0.1;
            this.ctx.globalCompositeOperation = layer === 0 ? 'source-over' : 'screen';
            
            // Dense plasma blobs
            for (let i = 0; i < density; i++) {
                const angle = (i / density) * Math.PI * 2;
                const radius = scale * (0.5 + this.noise2D(i * 0.1, this.generation * 0.1) * 0.5);
                const x = this.width/2 + Math.cos(angle) * radius;
                const y = this.height/2 + Math.sin(angle) * radius;
                
                // Multi-layer glow
                for (let glow = 0; glow < 3; glow++) {
                    const glowRadius = (scale * 0.5) * (3 - glow);
                    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
                    
                    const color = this.palette[i % 6];
                    const rgb = this.hslToRgb(color.h, color.s, color.l);
                    
                    gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.5 / (glow + 1)})`);
                    gradient.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.2 / (glow + 1)})`);
                    gradient.addColorStop(1, 'transparent');
                    
                    this.ctx.fillStyle = gradient;
                    this.ctx.fillRect(x - glowRadius, y - glowRadius, glowRadius * 2, glowRadius * 2);
                }
            }
            
            // Apply blur for smoothness
            if (layer < 2) {
                this.ctx.filter = `blur(${20 + layer * 10}px)`;
                this.ctx.drawImage(this.canvas, 0, 0);
                this.ctx.filter = 'none';
            }
            
            this.ctx.restore();
        }
    }
    
    renderCosmic() {
        // Deep space background
        const gradient = this.ctx.createRadialGradient(
            this.width/2, this.height/2, 0,
            this.width/2, this.height/2, this.width * 0.7
        );
        gradient.addColorStop(0, 'rgba(10, 0, 30, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 0, 5, 1)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Dense star field
        const starCount = Math.floor(200 + this.parameters.density * 800);
        
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';
        
        for (let i = 0; i < starCount; i++) {
            const x = this.pseudoRandom(i * 2) * this.width;
            const y = this.pseudoRandom(i * 2 + 1) * this.height;
            const size = this.pseudoRandom(i * 3) * 2 * this.parameters.scale;
            const brightness = this.pseudoRandom(i * 4);
            
            if (brightness > 0.95 && this.parameters.luminosity > 0.5) {
                // Bright star with rays
                this.ctx.strokeStyle = `rgba(255, 255, 255, ${brightness * 0.5})`;
                this.ctx.lineWidth = 0.5;
                this.ctx.beginPath();
                this.ctx.moveTo(x - size * 5, y);
                this.ctx.lineTo(x + size * 5, y);
                this.ctx.moveTo(x, y - size * 5);
                this.ctx.lineTo(x, y + size * 5);
                this.ctx.stroke();
            }
            
            // Star glow
            const starGradient = this.ctx.createRadialGradient(x, y, 0, x, y, size * 3);
            starGradient.addColorStop(0, `rgba(255, 255, 255, ${brightness})`);
            starGradient.addColorStop(0.2, `rgba(200, 220, 255, ${brightness * 0.5})`);
            starGradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = starGradient;
            this.ctx.fillRect(x - size * 3, y - size * 3, size * 6, size * 6);
        }
        
        // Nebula clouds
        const cloudCount = Math.floor(3 + this.parameters.density * 5);
        this.ctx.filter = 'blur(40px)';
        
        for (let i = 0; i < cloudCount; i++) {
            const x = this.width * (0.2 + this.pseudoRandom(i * 10) * 0.6);
            const y = this.height * (0.2 + this.pseudoRandom(i * 10 + 1) * 0.6);
            const radius = 100 + this.parameters.scale * 200;
            
            const nebGradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
            const color = this.palette[i % 6];
            
            nebGradient.addColorStop(0, `hsla(${color.h}, ${color.s}%, ${color.l}%, 0.3)`);
            nebGradient.addColorStop(0.5, `hsla(${color.h}, ${color.s}%, ${color.l * 0.7}%, 0.1)`);
            nebGradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = nebGradient;
            this.ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
        }
        
        this.ctx.filter = 'none';
        this.ctx.restore();
    }
    
    renderBioform() {
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'multiply';
        
        // Generate organic cells
        const cellCount = Math.floor(20 + this.parameters.density * 80);
        const cells = [];
        
        // Create cell network
        for (let i = 0; i < cellCount; i++) {
            cells.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: 20 + this.parameters.scale * 60 * Math.random(),
                growth: Math.random(),
                connections: []
            });
        }
        
        // Find nearby cells for connections
        for (let i = 0; i < cells.length; i++) {
            for (let j = i + 1; j < cells.length; j++) {
                const dist = Math.hypot(cells[i].x - cells[j].x, cells[i].y - cells[j].y);
                if (dist < 150 * (1 + this.parameters.scale)) {
                    cells[i].connections.push(j);
                }
            }
        }
        
        // Draw cell membranes
        for (const cell of cells) {
            this.ctx.beginPath();
            
            // Organic blob shape
            for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
                const noiseVal = this.noise2D(
                    Math.cos(angle) * 2 + cell.x * 0.01,
                    Math.sin(angle) * 2 + cell.y * 0.01
                );
                const r = cell.radius * (1 + noiseVal * this.parameters.turbulence * 0.3);
                const x = cell.x + Math.cos(angle) * r;
                const y = cell.y + Math.sin(angle) * r;
                
                if (angle === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            this.ctx.closePath();
            
            // Cell gradient
            const cellGradient = this.ctx.createRadialGradient(
                cell.x, cell.y, 0,
                cell.x, cell.y, cell.radius
            );
            
            const color = this.palette[Math.floor(cell.growth * 6)];
            cellGradient.addColorStop(0, `hsla(${color.h}, ${color.s}%, ${color.l}%, 0.6)`);
            cellGradient.addColorStop(0.7, `hsla(${color.h}, ${color.s}%, ${color.l * 0.8}%, 0.3)`);
            cellGradient.addColorStop(1, `hsla(${color.h}, ${color.s}%, ${color.l * 0.6}%, 0.1)`);
            
            this.ctx.fillStyle = cellGradient;
            this.ctx.fill();
            
            // Cell nucleus
            if (cell.radius > 30) {
                const nucleusGradient = this.ctx.createRadialGradient(
                    cell.x, cell.y, 0,
                    cell.x, cell.y, cell.radius * 0.3
                );
                nucleusGradient.addColorStop(0, `hsla(${color.h}, ${color.s * 0.5}%, ${color.l * 0.5}%, 0.8)`);
                nucleusGradient.addColorStop(1, `hsla(${color.h}, ${color.s * 0.5}%, ${color.l * 0.3}%, 0.4)`);
                
                this.ctx.fillStyle = nucleusGradient;
                this.ctx.beginPath();
                this.ctx.arc(cell.x, cell.y, cell.radius * 0.3, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
        
        // Draw connections (cytoplasm strands)
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 2;
        
        for (let i = 0; i < cells.length; i++) {
            for (const j of cells[i].connections) {
                this.ctx.beginPath();
                this.ctx.moveTo(cells[i].x, cells[i].y);
                
                // Organic curve
                const midX = (cells[i].x + cells[j].x) / 2 + 
                           (this.noise2D(i, j) - 0.5) * 50 * this.parameters.turbulence;
                const midY = (cells[i].y + cells[j].y) / 2 + 
                           (this.noise2D(j, i) - 0.5) * 50 * this.parameters.turbulence;
                
                this.ctx.quadraticCurveTo(midX, midY, cells[j].x, cells[j].y);
                this.ctx.stroke();
            }
        }
        
        this.ctx.restore();
    }
    
    renderNeural() {
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';
        
        // Create neural layers
        const layers = 4 + Math.floor(this.parameters.density * 3);
        const nodesPerLayer = 5 + Math.floor(this.parameters.density * 10);
        const nodes = [];
        
        // Generate node positions
        for (let l = 0; l < layers; l++) {
            const layerNodes = [];
            const x = this.width * (0.1 + (l / (layers - 1)) * 0.8);
            
            for (let n = 0; n < nodesPerLayer; n++) {
                const y = this.height * (0.1 + (n / (nodesPerLayer - 1)) * 0.8);
                layerNodes.push({
                    x: x + (this.noise2D(l, n) - 0.5) * 30 * this.parameters.turbulence,
                    y: y + (this.noise2D(n, l) - 0.5) * 30 * this.parameters.turbulence,
                    activation: Math.random(),
                    pulsePhase: Math.random() * Math.PI * 2
                });
            }
            nodes.push(layerNodes);
        }
        
        // Draw connections with gradient
        for (let l = 0; l < nodes.length - 1; l++) {
            for (const node1 of nodes[l]) {
                for (const node2 of nodes[l + 1]) {
                    // Connection probability based on activation
                    if (Math.random() < 0.3 + node1.activation * 0.4) {
                        const strength = (node1.activation + node2.activation) / 2;
                        
                        // Electric gradient
                        const connGradient = this.ctx.createLinearGradient(
                            node1.x, node1.y, node2.x, node2.y
                        );
                        
                        const color = this.palette[Math.floor(strength * 6)];
                        connGradient.addColorStop(0, `hsla(${color.h}, ${color.s}%, ${color.l}%, ${strength * 0.3})`);
                        connGradient.addColorStop(0.5, `hsla(${color.h}, ${color.s}%, ${color.l + 20}%, ${strength * 0.6})`);
                        connGradient.addColorStop(1, `hsla(${color.h}, ${color.s}%, ${color.l}%, ${strength * 0.3})`);
                        
                        this.ctx.strokeStyle = connGradient;
                        this.ctx.lineWidth = strength * 2;
                        this.ctx.beginPath();
                        this.ctx.moveTo(node1.x, node1.y);
                        
                        // Add electric jitter
                        const segments = 5;
                        for (let s = 1; s <= segments; s++) {
                            const t = s / segments;
                            const x = node1.x + (node2.x - node1.x) * t;
                            const y = node1.y + (node2.y - node1.y) * t;
                            const jitterX = (Math.random() - 0.5) * 10 * this.parameters.turbulence;
                            const jitterY = (Math.random() - 0.5) * 10 * this.parameters.turbulence;
                            
                            if (s === segments) {
                                this.ctx.lineTo(node2.x, node2.y);
                            } else {
                                this.ctx.lineTo(x + jitterX, y + jitterY);
                            }
                        }
                        
                        this.ctx.stroke();
                    }
                }
            }
        }
        
        // Draw nodes with pulsing glow
        for (const layer of nodes) {
            for (const node of layer) {
                const pulseScale = 1 + Math.sin(this.generation * 0.1 + node.pulsePhase) * 0.2;
                const radius = (5 + node.activation * 15) * pulseScale * this.parameters.scale;
                
                // Multi-layer glow
                for (let glow = 0; glow < 3; glow++) {
                    const glowRadius = radius * (3 - glow);
                    const nodeGradient = this.ctx.createRadialGradient(
                        node.x, node.y, 0,
                        node.x, node.y, glowRadius
                    );
                    
                    const color = this.palette[Math.floor(node.activation * 6)];
                    const alpha = node.activation * (0.8 - glow * 0.2);
                    
                    nodeGradient.addColorStop(0, `hsla(${color.h}, ${color.s}%, ${color.l + 20}%, ${alpha})`);
                    nodeGradient.addColorStop(0.3, `hsla(${color.h}, ${color.s}%, ${color.l}%, ${alpha * 0.5})`);
                    nodeGradient.addColorStop(1, 'transparent');
                    
                    this.ctx.fillStyle = nodeGradient;
                    this.ctx.fillRect(
                        node.x - glowRadius,
                        node.y - glowRadius,
                        glowRadius * 2,
                        glowRadius * 2
                    );
                }
            }
        }
        
        this.ctx.restore();
    }
    
    renderCrystal() {
        this.ctx.save();
        
        // Hexagonal crystal lattice
        const hexRadius = 20 + this.parameters.scale * 40;
        const rings = Math.floor(3 + this.parameters.density * 5);
        
        // Create hexagonal grid
        const hexagons = [];
        for (let q = -rings; q <= rings; q++) {
            for (let r = -rings; r <= rings; r++) {
                if (Math.abs(q + r) <= rings) {
                    const x = this.width/2 + hexRadius * 3/2 * q;
                    const y = this.height/2 + hexRadius * Math.sqrt(3) * (r + q/2);
                    
                    hexagons.push({
                        x, y, q, r,
                        depth: Math.abs(q) + Math.abs(r) + Math.abs(-q-r),
                        hue: (q * 60 + r * 120 + this.generation * 10) % 360
                    });
                }
            }
        }
        
        // Sort by depth for proper rendering
        hexagons.sort((a, b) => b.depth - a.depth);
        
        // Render hexagons
        for (const hex of hexagons) {
            const depthScale = 1 - (hex.depth / (rings * 2)) * 0.3;
            const actualRadius = hexRadius * depthScale;
            
            // Crystal faces with gradient
            for (let face = 0; face < 6; face++) {
                this.ctx.beginPath();
                
                // Draw triangular face from center to edge
                this.ctx.moveTo(hex.x, hex.y);
                
                const angle1 = (Math.PI / 3) * face;
                const angle2 = (Math.PI / 3) * (face + 1);
                
                const x1 = hex.x + actualRadius * Math.cos(angle1);
                const y1 = hex.y + actualRadius * Math.sin(angle1);
                const x2 = hex.x + actualRadius * Math.cos(angle2);
                const y2 = hex.y + actualRadius * Math.sin(angle2);
                
                this.ctx.lineTo(x1, y1);
                this.ctx.lineTo(x2, y2);
                this.ctx.closePath();
                
                // Face gradient
                const faceGradient = this.ctx.createLinearGradient(
                    hex.x, hex.y,
                    (x1 + x2) / 2, (y1 + y2) / 2
                );
                
                const color = this.palette[face];
                const brightness = 0.3 + (face / 6) * 0.4 + depthScale * 0.3;
                
                faceGradient.addColorStop(0, `hsla(${color.h}, ${color.s}%, ${color.l * brightness}%, 0.6)`);
                faceGradient.addColorStop(1, `hsla(${color.h}, ${color.s}%, ${color.l * brightness * 1.5}%, 0.3)`);
                
                this.ctx.fillStyle = faceGradient;
                this.ctx.fill();
                
                // Edge highlight
                this.ctx.strokeStyle = `hsla(${color.h}, ${color.s}%, ${color.l + 30}%, ${0.2 * depthScale})`;
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
            }
            
            // Central glow
            if (hex.depth < rings) {
                const glowGradient = this.ctx.createRadialGradient(
                    hex.x, hex.y, 0,
                    hex.x, hex.y, actualRadius
                );
                
                const glowColor = this.palette[hex.depth % 6];
                glowGradient.addColorStop(0, `hsla(${glowColor.h}, ${glowColor.s}%, ${glowColor.l + 20}%, 0.3)`);
                glowGradient.addColorStop(1, 'transparent');
                
                this.ctx.fillStyle = glowGradient;
                this.ctx.fillRect(
                    hex.x - actualRadius,
                    hex.y - actualRadius,
                    actualRadius * 2,
                    actualRadius * 2
                );
            }
        }
        
        this.ctx.restore();
    }
    
    renderLiquid() {
        this.ctx.save();
        
        // Flow field visualization
        const resolution = 20;
        const cellSize = this.width / resolution;
        
        // Create flow field
        const flowField = [];
        for (let x = 0; x < resolution; x++) {
            flowField[x] = [];
            for (let y = 0; y < resolution; y++) {
                const angle = this.noise2D(x * 0.1, y * 0.1 + this.generation * 0.05) * Math.PI * 2;
                const magnitude = this.noise2D(x * 0.1 + 100, y * 0.1 + 100) * this.parameters.turbulence;
                flowField[x][y] = { angle, magnitude };
            }
        }
        
        // Render flow as liquid streams
        const streamCount = Math.floor(50 + this.parameters.density * 200);
        
        for (let i = 0; i < streamCount; i++) {
            // Start position
            let x = Math.random() * this.width;
            let y = Math.random() * this.height;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            
            // Follow flow field
            const steps = 50 + Math.floor(this.parameters.scale * 100);
            const points = [{x, y}];
            
            for (let step = 0; step < steps; step++) {
                const gridX = Math.floor(x / cellSize);
                const gridY = Math.floor(y / cellSize);
                
                if (gridX >= 0 && gridX < resolution && gridY >= 0 && gridY < resolution) {
                    const flow = flowField[gridX][gridY];
                    x += Math.cos(flow.angle) * flow.magnitude * 5;
                    y += Math.sin(flow.angle) * flow.magnitude * 5;
                    points.push({x, y});
                } else {
                    break;
                }
            }
            
            // Draw stream with gradient
            if (points.length > 10) {
                const streamGradient = this.ctx.createLinearGradient(
                    points[0].x, points[0].y,
                    points[points.length - 1].x, points[points.length - 1].y
                );
                
                const color = this.palette[i % 6];
                streamGradient.addColorStop(0, `hsla(${color.h}, ${color.s}%, ${color.l}%, 0)`);
                streamGradient.addColorStop(0.3, `hsla(${color.h}, ${color.s}%, ${color.l}%, 0.5)`);
                streamGradient.addColorStop(0.7, `hsla(${color.h}, ${color.s}%, ${color.l}%, 0.5)`);
                streamGradient.addColorStop(1, `hsla(${color.h}, ${color.s}%, ${color.l}%, 0)`);
                
                this.ctx.strokeStyle = streamGradient;
                this.ctx.lineWidth = 2 + Math.random() * 3 * this.parameters.scale;
                this.ctx.lineCap = 'round';
                this.ctx.globalAlpha = 0.3 + Math.random() * 0.4;
                
                for (let p = 1; p < points.length; p++) {
                    this.ctx.lineTo(points[p].x, points[p].y);
                }
                
                this.ctx.stroke();
            }
        }
        
        // Add ripples
        const rippleCount = Math.floor(5 + this.parameters.density * 15);
        
        for (let i = 0; i < rippleCount; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            const maxRadius = 50 + Math.random() * 100 * this.parameters.scale;
            
            // Multiple concentric ripples
            for (let r = 0; r < 3; r++) {
                const radius = maxRadius * (1 - r * 0.3);
                const rippleGradient = this.ctx.createRadialGradient(
                    x, y, radius * 0.8,
                    x, y, radius
                );
                
                const color = this.palette[(i + r) % 6];
                rippleGradient.addColorStop(0, 'transparent');
                rippleGradient.addColorStop(0.7, `hsla(${color.h}, ${color.s}%, ${color.l}%, 0.2)`);
                rippleGradient.addColorStop(1, 'transparent');
                
                this.ctx.strokeStyle = rippleGradient;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(x, y, radius, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        }
        
        this.ctx.restore();
    }
    
    // ===================================================================
    // POST-PROCESSING EFFECTS
    // ===================================================================
    
    applyHexagonalSymmetry() {
        if (this.parameters.symmetry < 0.5) return;
        
        const strength = (this.parameters.symmetry - 0.5) * 2;
        
        this.ctx.save();
        this.ctx.globalAlpha = strength * 0.3;
        this.ctx.globalCompositeOperation = 'overlay';
        
        // Draw hexagonal overlay
        const hexRadius = 100;
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 2;
        
        for (let ring = 1; ring <= 6; ring++) {
            const radius = hexRadius * ring;
            this.ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i;
                const x = centerX + radius * Math.cos(angle);
                const y = centerY + radius * Math.sin(angle);
                
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            this.ctx.closePath();
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
    
    applyChromaticAberration() {
        if (this.parameters.turbulence < 0.7) return;
        
        const intensity = (this.parameters.turbulence - 0.7) * 3.33;
        const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
        const tempCanvas = createCanvas(this.width, this.height);
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCtx.putImageData(imageData, 0, 0);
        
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';
        this.ctx.globalAlpha = intensity * 0.3;
        
        // Offset RGB channels
        const offset = Math.floor(3 + intensity * 5);
        
        // Red channel
        this.ctx.drawImage(tempCanvas, -offset, 0);
        // Blue channel
        this.ctx.drawImage(tempCanvas, offset, 0);
        
        this.ctx.restore();
    }
    
    addVignette() {
        const vignette = this.ctx.createRadialGradient(
            this.width / 2, this.height / 2, this.width / 3,
            this.width / 2, this.height / 2, this.width * 0.8
        );
        vignette.addColorStop(0, 'transparent');
        vignette.addColorStop(0.7, 'transparent');
        vignette.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
        
        this.ctx.fillStyle = vignette;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    // ===================================================================
    // MAIN GENERATION
    // ===================================================================
    
    async generate(options = {}) {
        // Process all inputs
        this.processInputs(options);
        
        // Generate color palette
        this.generatePalette();
        
        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Render selected style
        const style = this.styles[this.styleIndex];
        console.log(`   Rendering ${style} style (gen ${this.generation + 1})`);
        
        switch (style) {
            case 'plasma':
                this.renderPlasma();
                break;
            case 'cosmic':
                this.renderCosmic();
                break;
            case 'bioform':
                this.renderBioform();
                break;
            case 'neural':
                this.renderNeural();
                break;
            case 'crystal':
                this.renderCrystal();
                break;
            case 'liquid':
                this.renderLiquid();
                break;
        }
        
        // Apply post-processing
        this.applyHexagonalSymmetry();
        this.applyChromaticAberration();
        this.addVignette();
        
        // Add title if provided
        if (options.title) {
            this.addTitle(options.title);
        }
        
        // Increment generation
        this.generation++;
        
        // Special treatment every 6th generation
        if (this.generation % 6 === 0) {
            console.log(`   ✨ Generation ${this.generation} - Hexagonal boost!`);
            this.parameters.symmetry = Math.min(1, this.parameters.symmetry * 1.5);
        }
        
        return this.canvas;
    }
    
    addTitle(title) {
        const gradient = this.ctx.createLinearGradient(
            0, this.height - 100, 0, this.height
        );
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, this.height - 100, this.width, 100);
        
        this.ctx.save();
        this.ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        this.ctx.shadowBlur = 10;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 32px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(title, this.width / 2, this.height - 40);
        this.ctx.restore();
    }
    
    // ===================================================================
    // EXPORT
    // ===================================================================
    
    async saveToFile(outputPath, format = 'png') {
        const buffer = format === 'jpeg' 
            ? this.canvas.toBuffer('image/jpeg', { quality: 0.95 })
            : this.canvas.toBuffer('image/png');
        
        await fs.writeFile(outputPath, buffer);
        return outputPath;
    }
    
    toBuffer(format = 'png') {
        return format === 'jpeg'
            ? this.canvas.toBuffer('image/jpeg', { quality: 0.95 })
            : this.canvas.toBuffer('image/png');
    }
}

module.exports = Hex6ArtworkGenerator;