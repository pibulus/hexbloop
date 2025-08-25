const { createCanvas } = require('canvas');
const fs = require('fs').promises;
const os = require('os');

// ===================================================================
// 🔮 HEXBLOOP ARTWORK GENERATOR - OSCILLATING SYSTEMS
// ===================================================================
// "Like a modular synth for visuals" - Living, breathing artwork
// that responds to audio, cosmic, and system influences
// ===================================================================

class HexbloopArtworkGenerator {
    constructor() {
        this.width = 1400;
        this.height = 1400;
        this.canvas = createCanvas(this.width, this.height);
        this.ctx = this.canvas.getContext('2d');
        
        // Initialize oscillators (different prime frequencies for complex interactions)
        this.oscillators = {
            density: { freq: 0.13, phase: 0, value: 0 },
            complexity: { freq: 0.27, phase: 0, value: 0 },
            glow: { freq: 0.07, phase: 0, value: 0 },
            symmetry: { freq: 0.19, phase: 0, value: 0 },
            flow: { freq: 0.31, phase: 0, value: 0 },
            chaos: { freq: 0.11, phase: 0, value: 0 }
        };
        
        // Style morphing weights
        this.styleMix = {
            plasma: 0.25,
            cosmic: 0.25,
            bioform: 0.25,
            neural: 0.25
        };
        
        // History buffer for feedback effects
        this.history = [];
        this.generation = 0;
    }
    
    // ===================================================================
    // METADATA GATHERING - Organic + Digital Chaos
    // ===================================================================
    
    gatherMetadata(options = {}) {
        const now = new Date();
        
        // Audio metadata (provided or defaults)
        const audio = {
            energy: options.audioFeatures?.energy || Math.random(),
            tempo: options.audioFeatures?.tempo || 120,
            spectralCentroid: options.audioFeatures?.spectralCentroid || 0.5,
            transientDensity: options.audioFeatures?.transientDensity || 0.3
        };
        
        // Cosmic metadata
        const cosmic = {
            moonPhase: options.moonPhase || 0.5,
            hourOfDay: now.getHours() + now.getMinutes() / 60,
            dayOfYear: Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000),
            solarAngle: (now.getHours() * 15) * Math.PI / 180
        };
        
        // System metadata
        const system = {
            cpuUsage: os.loadavg()[0] / os.cpus().length, // Normalized CPU load
            memoryPressure: 1 - (os.freemem() / os.totalmem()),
            uptimePhase: (os.uptime() % 3600) / 3600, // Hour cycle
            entropy: Math.random() // Pure chaos
        };
        
        // Environmental simulation (could connect to real APIs)
        const environmental = {
            temperature: 20 + Math.sin(cosmic.dayOfYear * 0.0172) * 15, // Seasonal
            humidity: 0.5 + Math.sin(now.getTime() / 100000) * 0.3,
            pressure: 1013 + Math.cos(now.getTime() / 50000) * 20
        };
        
        return { audio, cosmic, system, environmental };
    }
    
    // ===================================================================
    // OSCILLATOR SYSTEM - Brian Eno style parameter evolution
    // ===================================================================
    
    updateOscillators(metadata) {
        const time = Date.now() / 1000; // Time in seconds
        
        // Each oscillator is influenced by different metadata
        this.oscillators.density.phase = metadata.cosmic.moonPhase * Math.PI * 2;
        this.oscillators.complexity.phase = metadata.audio.energy * Math.PI;
        this.oscillators.glow.phase = metadata.system.cpuUsage * Math.PI;
        this.oscillators.symmetry.phase = metadata.audio.spectralCentroid * Math.PI * 2;
        this.oscillators.flow.phase = metadata.environmental.temperature / 20;
        this.oscillators.chaos.phase = metadata.system.entropy * Math.PI * 2;
        
        // Update oscillator values
        for (const [key, osc] of Object.entries(this.oscillators)) {
            osc.value = (Math.sin(time * osc.freq + osc.phase) + 1) / 2;
        }
        
        // Special hexbloop rule: every 6th generation gets boosted
        if (this.generation % 6 === 0) {
            this.oscillators.chaos.value = Math.min(1, this.oscillators.chaos.value * 1.5);
            this.oscillators.glow.value = Math.min(1, this.oscillators.glow.value * 1.3);
        }
    }
    
    // ===================================================================
    // STYLE MORPHING - Dynamic blending based on inputs
    // ===================================================================
    
    calculateStyleMix(metadata) {
        // Reset weights
        this.styleMix = {
            plasma: 0.1,
            cosmic: 0.1,
            bioform: 0.1,
            neural: 0.1
        };
        
        // Audio drives style selection
        if (metadata.audio.energy > 0.7) {
            this.styleMix.neural += 0.4; // High energy = neural networks
        }
        if (metadata.audio.tempo < 80) {
            this.styleMix.cosmic += 0.4; // Slow = cosmic drift
        }
        if (metadata.audio.spectralCentroid < 0.3) {
            this.styleMix.plasma += 0.4; // Low frequencies = plasma
        }
        if (metadata.audio.transientDensity > 0.6) {
            this.styleMix.bioform += 0.4; // Rhythmic = organic growth
        }
        
        // Cosmic influences
        if (metadata.cosmic.moonPhase > 0.9 || metadata.cosmic.moonPhase < 0.1) {
            this.styleMix.cosmic += 0.2; // New/full moon = cosmic
        }
        if (metadata.cosmic.hourOfDay < 6 || metadata.cosmic.hourOfDay > 22) {
            this.styleMix.neural += 0.2; // Night time = neural activity
        }
        
        // System chaos
        if (metadata.system.cpuUsage > 0.7) {
            this.styleMix.plasma += 0.2; // High CPU = heat = plasma
        }
        
        // Normalize weights
        const total = Object.values(this.styleMix).reduce((a, b) => a + b, 0);
        for (const key in this.styleMix) {
            this.styleMix[key] /= total;
        }
    }
    
    // ===================================================================
    // HEXAGONAL GEOMETRY - Sacred patterns
    // ===================================================================
    
    createHexagonalGrid(centerX, centerY, radius, rings) {
        const hexagons = [];
        const hexHeight = Math.sqrt(3) * radius;
        const hexWidth = 2 * radius;
        
        for (let q = -rings; q <= rings; q++) {
            for (let r = -rings; r <= rings; r++) {
                if (Math.abs(q + r) <= rings) {
                    const x = centerX + radius * 3/2 * q;
                    const y = centerY + hexHeight * (r + q/2);
                    hexagons.push({ x, y, q, r });
                }
            }
        }
        
        return hexagons;
    }
    
    drawHexagon(x, y, radius, rotation = 0) {
        this.ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i + rotation;
            const px = x + radius * Math.cos(angle);
            const py = y + radius * Math.sin(angle);
            if (i === 0) {
                this.ctx.moveTo(px, py);
            } else {
                this.ctx.lineTo(px, py);
            }
        }
        this.ctx.closePath();
    }
    
    // ===================================================================
    // REACTION-DIFFUSION - Organic pattern generation
    // ===================================================================
    
    generateReactionDiffusion(width, height, iterations = 10) {
        // Simplified Gray-Scott reaction-diffusion
        const grid = [];
        const next = [];
        
        // Initialize with random seeds
        for (let x = 0; x < width; x++) {
            grid[x] = [];
            next[x] = [];
            for (let y = 0; y < height; y++) {
                grid[x][y] = {
                    a: 1,
                    b: Math.random() < 0.1 ? 1 : 0
                };
                next[x][y] = { a: 1, b: 0 };
            }
        }
        
        // Parameters
        const dA = 1.0;
        const dB = 0.5;
        const feed = 0.055;
        const kill = 0.062;
        
        // Iterate
        for (let iter = 0; iter < iterations; iter++) {
            for (let x = 1; x < width - 1; x++) {
                for (let y = 1; y < height - 1; y++) {
                    const a = grid[x][y].a;
                    const b = grid[x][y].b;
                    
                    // Laplacian (simplified)
                    const laplaceA = (grid[x+1][y].a + grid[x-1][y].a + 
                                     grid[x][y+1].a + grid[x][y-1].a - 4 * a);
                    const laplaceB = (grid[x+1][y].b + grid[x-1][y].b + 
                                     grid[x][y+1].b + grid[x][y-1].b - 4 * b);
                    
                    // Reaction-diffusion equations
                    next[x][y].a = a + (dA * laplaceA - a * b * b + feed * (1 - a));
                    next[x][y].b = b + (dB * laplaceB + a * b * b - (kill + feed) * b);
                }
            }
            
            // Swap grids
            [grid, next] = [next, grid];
        }
        
        return grid;
    }
    
    // ===================================================================
    // RENDER METHODS - Style implementations
    // ===================================================================
    
    renderPlasma(weight) {
        if (weight < 0.1) return;
        
        const ctx = this.ctx;
        ctx.save();
        ctx.globalAlpha = weight;
        
        // Create plasma balls based on density oscillator
        const numBalls = Math.floor(4 + this.oscillators.density.value * 8);
        const balls = [];
        
        for (let i = 0; i < numBalls; i++) {
            const angle = (i / numBalls) * Math.PI * 2 + this.oscillators.flow.value * Math.PI;
            const radius = 100 + this.oscillators.complexity.value * 200;
            
            balls.push({
                x: this.width/2 + Math.cos(angle) * radius * (0.5 + Math.random()),
                y: this.height/2 + Math.sin(angle) * radius * (0.5 + Math.random()),
                radius: 80 + this.oscillators.chaos.value * 100 * Math.random(),
                hue: (angle * 180 / Math.PI + this.generation * 10) % 360
            });
        }
        
        // Render with heavy glow
        ctx.filter = `blur(${30 + this.oscillators.glow.value * 50}px)`;
        for (const ball of balls) {
            const gradient = ctx.createRadialGradient(
                ball.x, ball.y, 0,
                ball.x, ball.y, ball.radius * 2
            );
            
            const color = `hsl(${ball.hue}, 70%, 50%)`;
            gradient.addColorStop(0, color);
            gradient.addColorStop(0.5, color + '88');
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(
                ball.x - ball.radius * 2,
                ball.y - ball.radius * 2,
                ball.radius * 4,
                ball.radius * 4
            );
        }
        
        ctx.restore();
    }
    
    renderCosmic(weight) {
        if (weight < 0.1) return;
        
        const ctx = this.ctx;
        ctx.save();
        ctx.globalAlpha = weight;
        ctx.globalCompositeOperation = 'screen';
        
        // Star field with variable density
        const numStars = Math.floor(100 + this.oscillators.density.value * 300);
        
        for (let i = 0; i < numStars; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            const size = Math.random() * 3 * (1 + this.oscillators.complexity.value);
            const brightness = Math.random() * this.oscillators.glow.value;
            
            // Star glow
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 5);
            gradient.addColorStop(0, `rgba(255, 255, 255, ${brightness})`);
            gradient.addColorStop(0.1, `rgba(200, 220, 255, ${brightness * 0.5})`);
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x - size * 5, y - size * 5, size * 10, size * 10);
        }
        
        // Nebula clouds
        if (this.oscillators.complexity.value > 0.3) {
            ctx.filter = `blur(${40 + this.oscillators.glow.value * 40}px)`;
            
            for (let i = 0; i < 3; i++) {
                const x = this.width * (0.2 + i * 0.3 + this.oscillators.flow.value * 0.1);
                const y = this.height * (0.3 + Math.sin(i + this.generation * 0.1) * 0.2);
                const radius = 150 + this.oscillators.chaos.value * 100;
                
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
                const hue = (i * 120 + this.generation * 5) % 360;
                
                gradient.addColorStop(0, `hsla(${hue}, 60%, 50%, 0.5)`);
                gradient.addColorStop(1, 'transparent');
                
                ctx.fillStyle = gradient;
                ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
            }
        }
        
        ctx.restore();
    }
    
    renderBioform(weight) {
        if (weight < 0.1) return;
        
        const ctx = this.ctx;
        ctx.save();
        ctx.globalAlpha = weight;
        ctx.globalCompositeOperation = 'multiply';
        
        // Generate reaction-diffusion pattern (simplified)
        const gridSize = 50;
        const cellSize = this.width / gridSize;
        
        // Create organic cells
        const cells = [];
        for (let i = 0; i < gridSize * this.oscillators.density.value; i++) {
            cells.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: cellSize * (1 + this.oscillators.complexity.value * 2),
                growth: Math.random(),
                hue: 120 + Math.random() * 60 // Green-yellow organic colors
            });
        }
        
        // Draw cells with organic shapes
        for (const cell of cells) {
            ctx.beginPath();
            
            // Organic blob shape using noise
            for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
                const noiseValue = Math.sin(angle * 3 + cell.growth * Math.PI * 2) * 0.3;
                const r = cell.radius * (1 + noiseValue * this.oscillators.chaos.value);
                const x = cell.x + Math.cos(angle) * r;
                const y = cell.y + Math.sin(angle) * r;
                
                if (angle === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            
            // Gradient fill
            const gradient = ctx.createRadialGradient(
                cell.x, cell.y, 0,
                cell.x, cell.y, cell.radius
            );
            
            gradient.addColorStop(0, `hsla(${cell.hue}, 50%, 40%, 0.8)`);
            gradient.addColorStop(1, `hsla(${cell.hue}, 40%, 20%, 0.2)`);
            
            ctx.fillStyle = gradient;
            ctx.fill();
        }
        
        // Add veins/connections
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < cells.length - 1; i++) {
            for (let j = i + 1; j < cells.length; j++) {
                const dist = Math.hypot(cells[i].x - cells[j].x, cells[i].y - cells[j].y);
                if (dist < 150 * (1 + this.oscillators.flow.value)) {
                    ctx.globalAlpha = weight * (1 - dist / 150);
                    ctx.beginPath();
                    ctx.moveTo(cells[i].x, cells[i].y);
                    ctx.lineTo(cells[j].x, cells[j].y);
                    ctx.stroke();
                }
            }
        }
        
        ctx.restore();
    }
    
    renderNeural(weight) {
        if (weight < 0.1) return;
        
        const ctx = this.ctx;
        ctx.save();
        ctx.globalAlpha = weight;
        ctx.globalCompositeOperation = 'screen';
        
        // Neural network nodes
        const layers = 3 + Math.floor(this.oscillators.complexity.value * 3);
        const nodesPerLayer = 4 + Math.floor(this.oscillators.density.value * 6);
        const nodes = [];
        
        // Create node positions
        for (let layer = 0; layer < layers; layer++) {
            const layerNodes = [];
            const x = this.width * (0.2 + (layer / (layers - 1)) * 0.6);
            
            for (let n = 0; n < nodesPerLayer; n++) {
                const y = this.height * (0.2 + (n / (nodesPerLayer - 1)) * 0.6);
                layerNodes.push({
                    x: x + Math.sin(this.generation * 0.1 + n) * 20 * this.oscillators.flow.value,
                    y: y + Math.cos(this.generation * 0.1 + n) * 20 * this.oscillators.flow.value,
                    activation: Math.random()
                });
            }
            nodes.push(layerNodes);
        }
        
        // Draw connections
        ctx.lineWidth = 1;
        for (let l = 0; l < nodes.length - 1; l++) {
            for (const node1 of nodes[l]) {
                for (const node2 of nodes[l + 1]) {
                    if (Math.random() < 0.3 + this.oscillators.chaos.value * 0.4) {
                        const strength = (node1.activation + node2.activation) / 2;
                        
                        // Electric connection gradient
                        const gradient = ctx.createLinearGradient(
                            node1.x, node1.y, node2.x, node2.y
                        );
                        
                        const hue = 180 + strength * 60;
                        gradient.addColorStop(0, `hsla(${hue}, 100%, 50%, ${strength * 0.5})`);
                        gradient.addColorStop(0.5, `hsla(${hue}, 100%, 70%, ${strength})`);
                        gradient.addColorStop(1, `hsla(${hue}, 100%, 50%, ${strength * 0.5})`);
                        
                        ctx.strokeStyle = gradient;
                        ctx.beginPath();
                        ctx.moveTo(node1.x, node1.y);
                        
                        // Add electric jitter
                        const midX = (node1.x + node2.x) / 2 + (Math.random() - 0.5) * 20 * this.oscillators.chaos.value;
                        const midY = (node1.y + node2.y) / 2 + (Math.random() - 0.5) * 20 * this.oscillators.chaos.value;
                        
                        ctx.quadraticCurveTo(midX, midY, node2.x, node2.y);
                        ctx.stroke();
                    }
                }
            }
        }
        
        // Draw nodes with glow
        for (const layer of nodes) {
            for (const node of layer) {
                const radius = 5 + node.activation * 10 * (1 + this.oscillators.glow.value);
                
                const gradient = ctx.createRadialGradient(
                    node.x, node.y, 0,
                    node.x, node.y, radius * 3
                );
                
                const hue = 180 + node.activation * 60;
                gradient.addColorStop(0, `hsla(${hue}, 100%, 70%, ${node.activation})`);
                gradient.addColorStop(0.3, `hsla(${hue}, 100%, 50%, ${node.activation * 0.5})`);
                gradient.addColorStop(1, 'transparent');
                
                ctx.fillStyle = gradient;
                ctx.fillRect(
                    node.x - radius * 3,
                    node.y - radius * 3,
                    radius * 6,
                    radius * 6
                );
            }
        }
        
        ctx.restore();
    }
    
    // ===================================================================
    // SPECIAL EFFECTS - Cyberpunk touches
    // ===================================================================
    
    applyChromaticAberration(intensity = 0.5) {
        if (intensity < 0.1) return;
        
        const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
        const tempCanvas = createCanvas(this.width, this.height);
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCtx.putImageData(imageData, 0, 0);
        
        // Offset RGB channels
        const offset = Math.floor(5 * intensity);
        
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';
        
        // Red channel
        this.ctx.globalAlpha = 0.5;
        this.ctx.drawImage(tempCanvas, -offset, 0);
        
        // Blue channel
        this.ctx.drawImage(tempCanvas, offset, 0);
        
        this.ctx.restore();
    }
    
    addScanlines(intensity = 0.5) {
        if (intensity < 0.1) return;
        
        this.ctx.save();
        this.ctx.globalAlpha = intensity * 0.1;
        
        for (let y = 0; y < this.height; y += 4) {
            this.ctx.fillStyle = y % 8 === 0 ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)';
            this.ctx.fillRect(0, y, this.width, 2);
        }
        
        this.ctx.restore();
    }
    
    // ===================================================================
    // HEXAGONAL OVERLAY - Sacred geometry
    // ===================================================================
    
    renderHexagonalOverlay() {
        // Only on special generations or high complexity
        if (this.generation % 6 !== 0 && this.oscillators.complexity.value < 0.7) {
            return;
        }
        
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'overlay';
        this.ctx.globalAlpha = 0.2 + this.oscillators.symmetry.value * 0.3;
        
        const hexRadius = 30 + this.oscillators.complexity.value * 50;
        const hexagons = this.createHexagonalGrid(
            this.width / 2,
            this.height / 2,
            hexRadius,
            Math.floor(3 + this.oscillators.density.value * 3)
        );
        
        for (const hex of hexagons) {
            const distance = Math.hypot(hex.x - this.width/2, hex.y - this.height/2);
            const maxDist = Math.min(this.width, this.height) / 2;
            const intensity = 1 - (distance / maxDist);
            
            if (intensity > 0) {
                this.ctx.strokeStyle = `rgba(255, 255, 255, ${intensity * 0.3})`;
                this.ctx.lineWidth = 1 + this.oscillators.glow.value * 2;
                
                this.drawHexagon(
                    hex.x,
                    hex.y,
                    hexRadius * (0.8 + Math.sin(hex.q + hex.r + this.generation * 0.1) * 0.2),
                    this.generation * 0.01
                );
                
                this.ctx.stroke();
            }
        }
        
        this.ctx.restore();
    }
    
    // ===================================================================
    // MAIN GENERATION
    // ===================================================================
    
    async generate(options = {}) {
        // Gather all metadata
        const metadata = this.gatherMetadata(options);
        
        // Update oscillators
        this.updateOscillators(metadata);
        
        // Calculate style mix based on inputs
        this.calculateStyleMix(metadata);
        
        // Clear canvas with deep black
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Render each style based on its weight
        this.renderPlasma(this.styleMix.plasma);
        this.renderCosmic(this.styleMix.cosmic);
        this.renderBioform(this.styleMix.bioform);
        this.renderNeural(this.styleMix.neural);
        
        // Apply effects based on oscillators
        if (this.oscillators.chaos.value > 0.5) {
            this.applyChromaticAberration(this.oscillators.chaos.value);
        }
        
        if (this.oscillators.symmetry.value > 0.6) {
            this.renderHexagonalOverlay();
        }
        
        // Cyberpunk touches
        if (metadata.system.cpuUsage > 0.5 || this.oscillators.complexity.value > 0.7) {
            this.addScanlines(0.3);
        }
        
        // Add vignette
        const vignette = this.ctx.createRadialGradient(
            this.width / 2, this.height / 2, this.width / 3,
            this.width / 2, this.height / 2, this.width * 0.8
        );
        vignette.addColorStop(0, 'transparent');
        vignette.addColorStop(0.7, 'transparent');
        vignette.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
        
        this.ctx.fillStyle = vignette;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Add title if provided
        if (options.title) {
            this.addTitle(options.title);
        }
        
        // Increment generation counter
        this.generation++;
        
        // Store in history for potential feedback effects
        this.history.push({
            generation: this.generation,
            metadata: metadata,
            oscillators: { ...this.oscillators },
            styleMix: { ...this.styleMix }
        });
        
        // Keep only last 6 generations
        if (this.history.length > 6) {
            this.history.shift();
        }
        
        return this.canvas;
    }
    
    addTitle(title) {
        const gradient = this.ctx.createLinearGradient(
            0, this.height - 100, 0, this.height
        );
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
        
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

module.exports = HexbloopArtworkGenerator;