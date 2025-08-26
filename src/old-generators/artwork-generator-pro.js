const { createCanvas } = require('canvas');
const fs = require('fs').promises;
const path = require('path');

// ===================================================================
// 🎨 PROFESSIONAL ARTWORK GENERATOR - GALLERY QUALITY
// ===================================================================

class ProfessionalArtworkGenerator {
    constructor() {
        this.width = 1400;
        this.height = 1400;
        
        // Main canvas
        this.canvas = createCanvas(this.width, this.height);
        this.ctx = this.canvas.getContext('2d');
        
        // Create multiple rendering layers for compositing
        this.layers = {
            background: this.createLayer(),
            atmosphere: this.createLayer(),
            midground: this.createLayer(),
            foreground: this.createLayer(),
            effects: this.createLayer(),
            lighting: this.createLayer(),
            postprocess: this.createLayer()
        };
        
        // Noise field for organic patterns
        this.noiseField = null;
        this.noiseScale = 0.002;
        
        // Initialize Simplex noise
        this.initializeNoise();
    }
    
    createLayer() {
        const canvas = createCanvas(this.width, this.height);
        return {
            canvas: canvas,
            ctx: canvas.getContext('2d')
        };
    }
    
    // ===================================================================
    // NOISE GENERATION (Simplex/Perlin-like)
    // ===================================================================
    
    initializeNoise() {
        // Create a pseudo-random permutation table for noise
        this.perm = [];
        for (let i = 0; i < 256; i++) {
            this.perm[i] = i;
        }
        
        // Shuffle the permutation table
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.perm[i], this.perm[j]] = [this.perm[j], this.perm[i]];
        }
        
        // Duplicate for overflow
        for (let i = 0; i < 256; i++) {
            this.perm[i + 256] = this.perm[i];
        }
    }
    
    noise2D(x, y) {
        // Simplified Perlin-like noise implementation
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        
        x -= Math.floor(x);
        y -= Math.floor(y);
        
        const u = this.fade(x);
        const v = this.fade(y);
        
        const A = this.perm[X] + Y;
        const B = this.perm[X + 1] + Y;
        
        const res = this.lerp(v, 
            this.lerp(u, this.grad2D(this.perm[A], x, y), this.grad2D(this.perm[B], x - 1, y)),
            this.lerp(u, this.grad2D(this.perm[A + 1], x, y - 1), this.grad2D(this.perm[B + 1], x - 1, y - 1))
        );
        
        return (res + 1) / 2; // Normalize to 0-1
    }
    
    noise3D(x, y, z) {
        // 3D noise for more complex patterns
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;
        
        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);
        
        const u = this.fade(x);
        const v = this.fade(y);
        const w = this.fade(z);
        
        const A = this.perm[X] + Y;
        const AA = this.perm[A] + Z;
        const AB = this.perm[A + 1] + Z;
        const B = this.perm[X + 1] + Y;
        const BA = this.perm[B] + Z;
        const BB = this.perm[B + 1] + Z;
        
        const res = this.lerp(w,
            this.lerp(v,
                this.lerp(u, this.grad3D(this.perm[AA], x, y, z), this.grad3D(this.perm[BA], x - 1, y, z)),
                this.lerp(u, this.grad3D(this.perm[AB], x, y - 1, z), this.grad3D(this.perm[BB], x - 1, y - 1, z))
            ),
            this.lerp(v,
                this.lerp(u, this.grad3D(this.perm[AA + 1], x, y, z - 1), this.grad3D(this.perm[BA + 1], x - 1, y, z - 1)),
                this.lerp(u, this.grad3D(this.perm[AB + 1], x, y - 1, z - 1), this.grad3D(this.perm[BB + 1], x - 1, y - 1, z - 1))
            )
        );
        
        return (res + 1) / 2; // Normalize to 0-1
    }
    
    turbulence(x, y, octaves = 4) {
        let value = 0;
        let amplitude = 1;
        let frequency = 1;
        let maxValue = 0;
        
        for (let i = 0; i < octaves; i++) {
            value += this.noise2D(x * frequency, y * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= 0.5;
            frequency *= 2;
        }
        
        return value / maxValue;
    }
    
    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }
    
    lerp(t, a, b) {
        return a + t * (b - a);
    }
    
    grad2D(hash, x, y) {
        const h = hash & 3;
        const u = h < 2 ? x : y;
        const v = h < 2 ? y : x;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }
    
    grad3D(hash, x, y, z) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }
    
    // ===================================================================
    // FLOW FIELD GENERATION
    // ===================================================================
    
    generateFlowField(scale = 0.005) {
        const field = [];
        const cols = Math.ceil(this.width / 10);
        const rows = Math.ceil(this.height / 10);
        
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const angle = this.noise2D(x * scale, y * scale) * Math.PI * 4;
                const force = 0.5 + this.noise2D(x * scale + 100, y * scale + 100) * 0.5;
                
                field.push({
                    x: x * 10,
                    y: y * 10,
                    angle: angle,
                    force: force
                });
            }
        }
        
        return field;
    }
    
    // ===================================================================
    // ADVANCED COLOR SYSTEM
    // ===================================================================
    
    hslToRgb(h, s, l) {
        s /= 100;
        l /= 100;
        
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        const m = l - c / 2;
        
        let r = 0, g = 0, b = 0;
        
        if (h >= 0 && h < 60) {
            r = c; g = x; b = 0;
        } else if (h >= 60 && h < 120) {
            r = x; g = c; b = 0;
        } else if (h >= 120 && h < 180) {
            r = 0; g = c; b = x;
        } else if (h >= 180 && h < 240) {
            r = 0; g = x; b = c;
        } else if (h >= 240 && h < 300) {
            r = x; g = 0; b = c;
        } else if (h >= 300 && h < 360) {
            r = c; g = 0; b = x;
        }
        
        return {
            r: Math.round((r + m) * 255),
            g: Math.round((g + m) * 255),
            b: Math.round((b + m) * 255)
        };
    }
    
    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }
    
    generateHarmonicPalette(baseHue, scheme = 'complementary') {
        const colors = [];
        
        switch (scheme) {
            case 'complementary':
                colors.push(this.hslToRgb(baseHue, 70, 50));
                colors.push(this.hslToRgb((baseHue + 180) % 360, 70, 50));
                colors.push(this.hslToRgb((baseHue + 30) % 360, 60, 40));
                colors.push(this.hslToRgb((baseHue + 210) % 360, 60, 60));
                break;
                
            case 'triadic':
                colors.push(this.hslToRgb(baseHue, 70, 50));
                colors.push(this.hslToRgb((baseHue + 120) % 360, 70, 50));
                colors.push(this.hslToRgb((baseHue + 240) % 360, 70, 50));
                break;
                
            case 'analogous':
                colors.push(this.hslToRgb(baseHue, 70, 50));
                colors.push(this.hslToRgb((baseHue + 30) % 360, 65, 45));
                colors.push(this.hslToRgb((baseHue - 30 + 360) % 360, 65, 55));
                colors.push(this.hslToRgb((baseHue + 60) % 360, 60, 40));
                colors.push(this.hslToRgb((baseHue - 60 + 360) % 360, 60, 60));
                break;
        }
        
        return colors.map(c => this.rgbToHex(c.r, c.g, c.b));
    }
    
    // ===================================================================
    // PROFESSIONAL LIGHTING SYSTEM
    // ===================================================================
    
    applyLighting(ctx, lights) {
        const imageData = ctx.getImageData(0, 0, this.width, this.height);
        const data = imageData.data;
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const idx = (y * this.width + x) * 4;
                
                let totalLight = 0.2; // Ambient light
                
                // Calculate lighting from each source
                for (const light of lights) {
                    const distance = Math.sqrt(
                        Math.pow(x - light.x, 2) + 
                        Math.pow(y - light.y, 2)
                    );
                    
                    const falloff = Math.max(0, 1 - distance / light.radius);
                    totalLight += falloff * light.intensity;
                }
                
                totalLight = Math.min(1, totalLight);
                
                // Apply lighting to pixel
                data[idx] *= totalLight;
                data[idx + 1] *= totalLight;
                data[idx + 2] *= totalLight;
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
    }
    
    applyBloom(ctx, threshold = 0.8, radius = 20) {
        // Create bloom layer
        const bloomCanvas = createCanvas(this.width, this.height);
        const bloomCtx = bloomCanvas.getContext('2d');
        
        // Extract bright pixels
        const imageData = ctx.getImageData(0, 0, this.width, this.height);
        const data = imageData.data;
        const bloomData = bloomCtx.createImageData(this.width, this.height);
        const bData = bloomData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3 / 255;
            
            if (brightness > threshold) {
                const multiplier = (brightness - threshold) / (1 - threshold);
                bData[i] = data[i] * multiplier;
                bData[i + 1] = data[i + 1] * multiplier;
                bData[i + 2] = data[i + 2] * multiplier;
                bData[i + 3] = data[i + 3];
            }
        }
        
        bloomCtx.putImageData(bloomData, 0, 0);
        
        // Apply gaussian blur
        bloomCtx.filter = `blur(${radius}px)`;
        bloomCtx.drawImage(bloomCanvas, 0, 0);
        
        // Composite back with screen blend mode
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.8;
        ctx.drawImage(bloomCanvas, 0, 0);
        ctx.restore();
    }
    
    // ===================================================================
    // DEPTH & ATMOSPHERIC PERSPECTIVE
    // ===================================================================
    
    applyAtmosphericPerspective(ctx, depth) {
        // Depth: 0 (far) to 1 (near)
        const blur = (1 - depth) * 15;
        const opacity = 0.3 + depth * 0.7;
        const colorShift = 1 - depth; // Cooler colors in distance
        
        ctx.save();
        ctx.filter = `blur(${blur}px)`;
        ctx.globalAlpha = opacity;
        
        // Apply cool color overlay for distance
        if (colorShift > 0.1) {
            ctx.globalCompositeOperation = 'overlay';
            ctx.fillStyle = `rgba(100, 150, 200, ${colorShift * 0.3})`;
            ctx.fillRect(0, 0, this.width, this.height);
        }
        
        ctx.restore();
    }
    
    // ===================================================================
    // TEXTURE GENERATION
    // ===================================================================
    
    generateMarbleTexture(ctx, colors) {
        const imageData = ctx.createImageData(this.width, this.height);
        const data = imageData.data;
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const value = this.turbulence(x * 0.01, y * 0.01, 6);
                const pattern = Math.sin(x * 0.02 + value * 10) * 0.5 + 0.5;
                
                const colorIndex = Math.floor(pattern * colors.length);
                const color = colors[Math.min(colorIndex, colors.length - 1)];
                
                const idx = (y * this.width + x) * 4;
                const rgb = this.hexToRgb(color);
                
                data[idx] = rgb.r;
                data[idx + 1] = rgb.g;
                data[idx + 2] = rgb.b;
                data[idx + 3] = 255;
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
    }
    
    generateCrystallineTexture(ctx, baseColor) {
        const facets = 50;
        
        for (let i = 0; i < facets; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            const size = 50 + Math.random() * 200;
            const sides = 3 + Math.floor(Math.random() * 5);
            const rotation = Math.random() * Math.PI * 2;
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);
            
            // Create gradient for depth
            const gradient = ctx.createLinearGradient(-size, -size, size, size);
            const rgb = this.hexToRgb(baseColor);
            
            gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`);
            gradient.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`);
            gradient.addColorStop(1, `rgba(${rgb.r * 0.5}, ${rgb.g * 0.5}, ${rgb.b * 0.5}, 0.5)`);
            
            ctx.fillStyle = gradient;
            ctx.strokeStyle = `rgba(255, 255, 255, 0.2)`;
            ctx.lineWidth = 1;
            
            // Draw crystalline shape
            ctx.beginPath();
            for (let j = 0; j <= sides; j++) {
                const angle = (j / sides) * Math.PI * 2;
                const radius = size * (0.7 + Math.random() * 0.3);
                const px = Math.cos(angle) * radius;
                const py = Math.sin(angle) * radius;
                
                if (j === 0) {
                    ctx.moveTo(px, py);
                } else {
                    ctx.lineTo(px, py);
                }
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            ctx.restore();
        }
    }
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }
    
    // ===================================================================
    // ADVANCED SHAPE GENERATION
    // ===================================================================
    
    drawOrganicBlob(ctx, x, y, radius, complexity = 8) {
        ctx.beginPath();
        
        const points = [];
        for (let i = 0; i < complexity; i++) {
            const angle = (i / complexity) * Math.PI * 2;
            const noiseValue = this.noise2D(
                Math.cos(angle) * 2 + x * 0.01,
                Math.sin(angle) * 2 + y * 0.01
            );
            const r = radius * (0.7 + noiseValue * 0.6);
            
            points.push({
                x: x + Math.cos(angle) * r,
                y: y + Math.sin(angle) * r
            });
        }
        
        // Draw smooth curve through points
        ctx.moveTo(points[0].x, points[0].y);
        
        for (let i = 0; i < points.length; i++) {
            const next = points[(i + 1) % points.length];
            const cp1x = points[i].x + (next.x - points[i].x) * 0.3;
            const cp1y = points[i].y + (next.y - points[i].y) * 0.3;
            const cp2x = next.x - (next.x - points[i].x) * 0.3;
            const cp2y = next.y - (next.y - points[i].y) * 0.3;
            
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, next.x, next.y);
        }
        
        ctx.closePath();
    }
    
    drawFlowLine(ctx, startX, startY, length, flowField) {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        
        let x = startX;
        let y = startY;
        
        for (let i = 0; i < length; i++) {
            // Find nearest flow field vector
            const gridX = Math.floor(x / 10);
            const gridY = Math.floor(y / 10);
            const cols = Math.ceil(this.width / 10);
            const fieldIndex = gridY * cols + gridX;
            
            if (flowField[fieldIndex]) {
                const vector = flowField[fieldIndex];
                x += Math.cos(vector.angle) * vector.force * 2;
                y += Math.sin(vector.angle) * vector.force * 2;
                ctx.lineTo(x, y);
            }
            
            if (x < 0 || x > this.width || y < 0 || y > this.height) break;
        }
        
        ctx.stroke();
    }
    
    // ===================================================================
    // STYLE IMPLEMENTATIONS WITH PROFESSIONAL QUALITY
    // ===================================================================
    
    async generateCosmicPro(moonPhase, colors) {
        // Clear all layers
        for (const layer of Object.values(this.layers)) {
            layer.ctx.clearRect(0, 0, this.width, this.height);
        }
        
        // === BACKGROUND LAYER ===
        const bgCtx = this.layers.background.ctx;
        
        // Deep space gradient with noise
        const bgGradient = bgCtx.createRadialGradient(
            this.width / 2, this.height / 2, 0,
            this.width / 2, this.height / 2, this.width
        );
        bgGradient.addColorStop(0, '#0a0a1f');
        bgGradient.addColorStop(0.5, '#050515');
        bgGradient.addColorStop(1, '#000000');
        bgCtx.fillStyle = bgGradient;
        bgCtx.fillRect(0, 0, this.width, this.height);
        
        // Add subtle noise texture
        const noiseData = bgCtx.createImageData(this.width, this.height);
        const nData = noiseData.data;
        for (let i = 0; i < nData.length; i += 4) {
            const noise = Math.random() * 20;
            nData[i] = noise;
            nData[i + 1] = noise;
            nData[i + 2] = noise;
            nData[i + 3] = 10;
        }
        bgCtx.putImageData(noiseData, 0, 0);
        
        // === ATMOSPHERE LAYER - Nebula Clouds ===
        const atmCtx = this.layers.atmosphere.ctx;
        
        // Multi-layer nebula with Perlin noise
        for (let layer = 0; layer < 5; layer++) {
            atmCtx.save();
            atmCtx.globalCompositeOperation = 'screen';
            
            for (let i = 0; i < 3; i++) {
                const x = this.width * (0.2 + Math.random() * 0.6);
                const y = this.height * (0.2 + Math.random() * 0.6);
                const radius = 200 + Math.random() * 300;
                
                // Create nebula gradient with noise distortion
                const nebulaGradient = atmCtx.createRadialGradient(x, y, 0, x, y, radius);
                const color = colors[i % colors.length];
                const rgb = this.hexToRgb(color);
                
                nebulaGradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`);
                nebulaGradient.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`);
                nebulaGradient.addColorStop(1, 'transparent');
                
                // Draw with noise distortion
                atmCtx.fillStyle = nebulaGradient;
                
                for (let ny = -radius; ny < radius; ny += 10) {
                    for (let nx = -radius; nx < radius; nx += 10) {
                        const noiseValue = this.turbulence(
                            (x + nx) * 0.003,
                            (y + ny) * 0.003,
                            3
                        );
                        
                        if (noiseValue > 0.3) {
                            const dist = Math.sqrt(nx * nx + ny * ny);
                            if (dist < radius) {
                                atmCtx.globalAlpha = (1 - dist / radius) * noiseValue * 0.5;
                                atmCtx.fillRect(x + nx, y + ny, 10, 10);
                            }
                        }
                    }
                }
            }
            
            atmCtx.restore();
        }
        
        // Apply gaussian blur to atmosphere
        atmCtx.filter = 'blur(20px)';
        atmCtx.drawImage(this.layers.atmosphere.canvas, 0, 0);
        atmCtx.filter = 'none';
        
        // === MIDGROUND LAYER - Stars ===
        const midCtx = this.layers.midground.ctx;
        
        // Multi-depth star field
        for (let depth = 0; depth < 3; depth++) {
            const starCount = 100 * (3 - depth);
            const maxSize = 3 - depth;
            
            for (let i = 0; i < starCount; i++) {
                const x = Math.random() * this.width;
                const y = Math.random() * this.height;
                const size = Math.random() * maxSize;
                const brightness = 0.5 + Math.random() * 0.5;
                
                // Star glow
                const glowGradient = midCtx.createRadialGradient(x, y, 0, x, y, size * 4);
                glowGradient.addColorStop(0, `rgba(255, 255, 255, ${brightness})`);
                glowGradient.addColorStop(0.5, `rgba(200, 220, 255, ${brightness * 0.3})`);
                glowGradient.addColorStop(1, 'transparent');
                
                midCtx.fillStyle = glowGradient;
                midCtx.fillRect(x - size * 4, y - size * 4, size * 8, size * 8);
                
                // Star core
                midCtx.fillStyle = '#ffffff';
                midCtx.beginPath();
                midCtx.arc(x, y, size, 0, Math.PI * 2);
                midCtx.fill();
            }
        }
        
        // === FOREGROUND LAYER - Cosmic structures ===
        const fgCtx = this.layers.foreground.ctx;
        
        // Draw galaxy spiral
        fgCtx.save();
        fgCtx.translate(this.width / 2, this.height / 2);
        fgCtx.globalCompositeOperation = 'screen';
        
        for (let arm = 0; arm < 3; arm++) {
            fgCtx.rotate((Math.PI * 2) / 3);
            fgCtx.strokeStyle = colors[arm % colors.length];
            fgCtx.lineWidth = 3;
            fgCtx.globalAlpha = 0.3;
            
            fgCtx.beginPath();
            for (let t = 0; t < 100; t++) {
                const angle = t * 0.1;
                const radius = t * 3;
                const noiseOffset = this.noise2D(t * 0.05, arm) * 30;
                const x = Math.cos(angle) * (radius + noiseOffset);
                const y = Math.sin(angle) * (radius + noiseOffset);
                
                if (t === 0) {
                    fgCtx.moveTo(x, y);
                } else {
                    fgCtx.lineTo(x, y);
                }
            }
            fgCtx.stroke();
        }
        
        fgCtx.restore();
        
        // === LIGHTING LAYER ===
        const lightCtx = this.layers.lighting.ctx;
        
        // Add light sources
        const lights = [
            { x: this.width / 2, y: this.height / 2, radius: 400, intensity: 0.8 },
            { x: this.width * 0.2, y: this.height * 0.3, radius: 200, intensity: 0.5 },
            { x: this.width * 0.8, y: this.height * 0.7, radius: 250, intensity: 0.6 }
        ];
        
        for (const light of lights) {
            const lightGradient = lightCtx.createRadialGradient(
                light.x, light.y, 0,
                light.x, light.y, light.radius
            );
            lightGradient.addColorStop(0, `rgba(255, 255, 255, ${light.intensity})`);
            lightGradient.addColorStop(0.5, `rgba(200, 220, 255, ${light.intensity * 0.5})`);
            lightGradient.addColorStop(1, 'transparent');
            
            lightCtx.fillStyle = lightGradient;
            lightCtx.fillRect(0, 0, this.width, this.height);
        }
        
        // === COMPOSITE ALL LAYERS ===
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw layers in order with appropriate blend modes
        this.ctx.drawImage(this.layers.background.canvas, 0, 0);
        
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';
        this.ctx.drawImage(this.layers.atmosphere.canvas, 0, 0);
        this.ctx.restore();
        
        this.ctx.drawImage(this.layers.midground.canvas, 0, 0);
        
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';
        this.ctx.drawImage(this.layers.foreground.canvas, 0, 0);
        this.ctx.restore();
        
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'soft-light';
        this.ctx.globalAlpha = 0.5;
        this.ctx.drawImage(this.layers.lighting.canvas, 0, 0);
        this.ctx.restore();
        
        // Apply bloom effect
        this.applyBloom(this.ctx, 0.7, 15);
        
        // Add vignette
        const vignette = this.ctx.createRadialGradient(
            this.width / 2, this.height / 2, this.width / 3,
            this.width / 2, this.height / 2, this.width
        );
        vignette.addColorStop(0, 'transparent');
        vignette.addColorStop(0.7, 'transparent');
        vignette.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
        
        this.ctx.fillStyle = vignette;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    async generateOrganicPro(moonPhase, colors) {
        // Clear all layers
        for (const layer of Object.values(this.layers)) {
            layer.ctx.clearRect(0, 0, this.width, this.height);
        }
        
        // === BACKGROUND LAYER ===
        const bgCtx = this.layers.background.ctx;
        
        // Organic gradient background
        const bgGradient = bgCtx.createLinearGradient(0, 0, this.width, this.height);
        bgGradient.addColorStop(0, colors[0]);
        bgGradient.addColorStop(0.5, colors[1]);
        bgGradient.addColorStop(1, colors[2]);
        bgCtx.fillStyle = bgGradient;
        bgCtx.fillRect(0, 0, this.width, this.height);
        
        // === ATMOSPHERE LAYER - Flow Fields ===
        const atmCtx = this.layers.atmosphere.ctx;
        const flowField = this.generateFlowField(0.005);
        
        atmCtx.strokeStyle = colors[3];
        atmCtx.lineWidth = 1;
        atmCtx.globalAlpha = 0.1;
        
        // Draw flow lines
        for (let i = 0; i < 200; i++) {
            const startX = Math.random() * this.width;
            const startY = Math.random() * this.height;
            this.drawFlowLine(atmCtx, startX, startY, 100, flowField);
        }
        
        // === MIDGROUND LAYER - Organic Shapes ===
        const midCtx = this.layers.midground.ctx;
        
        // Draw organic blobs with depth
        const blobs = [];
        for (let i = 0; i < 10; i++) {
            blobs.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: 50 + Math.random() * 150,
                depth: Math.random(),
                color: colors[i % colors.length]
            });
        }
        
        // Sort by depth (back to front)
        blobs.sort((a, b) => a.depth - b.depth);
        
        for (const blob of blobs) {
            midCtx.save();
            
            // Apply atmospheric perspective
            const blur = (1 - blob.depth) * 10;
            const opacity = 0.3 + blob.depth * 0.5;
            
            midCtx.filter = `blur(${blur}px)`;
            midCtx.globalAlpha = opacity;
            
            // Create gradient for blob
            const blobGradient = midCtx.createRadialGradient(
                blob.x, blob.y, 0,
                blob.x, blob.y, blob.radius
            );
            
            const rgb = this.hexToRgb(blob.color);
            blobGradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`);
            blobGradient.addColorStop(0.7, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`);
            blobGradient.addColorStop(1, 'transparent');
            
            midCtx.fillStyle = blobGradient;
            this.drawOrganicBlob(midCtx, blob.x, blob.y, blob.radius, 12);
            midCtx.fill();
            
            // Add inner glow
            midCtx.globalCompositeOperation = 'screen';
            midCtx.fillStyle = `rgba(255, 255, 255, ${0.1 * blob.depth})`;
            this.drawOrganicBlob(midCtx, blob.x, blob.y, blob.radius * 0.7, 12);
            midCtx.fill();
            
            midCtx.restore();
        }
        
        // === FOREGROUND LAYER - Details ===
        const fgCtx = this.layers.foreground.ctx;
        
        // Add cellular patterns
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            const radius = 10 + Math.random() * 30;
            
            fgCtx.strokeStyle = colors[4];
            fgCtx.lineWidth = 2;
            fgCtx.globalAlpha = 0.3;
            
            fgCtx.beginPath();
            fgCtx.arc(x, y, radius, 0, Math.PI * 2);
            fgCtx.stroke();
            
            // Inner circles
            fgCtx.beginPath();
            fgCtx.arc(x, y, radius * 0.5, 0, Math.PI * 2);
            fgCtx.stroke();
        }
        
        // === COMPOSITE ALL LAYERS ===
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        this.ctx.drawImage(this.layers.background.canvas, 0, 0);
        
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'multiply';
        this.ctx.drawImage(this.layers.atmosphere.canvas, 0, 0);
        this.ctx.restore();
        
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'soft-light';
        this.ctx.drawImage(this.layers.midground.canvas, 0, 0);
        this.ctx.restore();
        
        this.ctx.save();
        this.ctx.globalAlpha = 0.7;
        this.ctx.drawImage(this.layers.foreground.canvas, 0, 0);
        this.ctx.restore();
        
        // Apply subtle bloom
        this.applyBloom(this.ctx, 0.8, 10);
    }
    
    async generateGeometricPro(moonPhase, colors) {
        // Clear all layers
        for (const layer of Object.values(this.layers)) {
            layer.ctx.clearRect(0, 0, this.width, this.height);
        }
        
        // === BACKGROUND LAYER ===
        const bgCtx = this.layers.background.ctx;
        
        // Dark geometric background
        bgCtx.fillStyle = '#0a0a0f';
        bgCtx.fillRect(0, 0, this.width, this.height);
        
        // === MIDGROUND LAYER - Crystal Grid ===
        const midCtx = this.layers.midground.ctx;
        
        // Generate crystalline texture
        this.generateCrystallineTexture(midCtx, colors[0]);
        
        // === FOREGROUND LAYER - Sacred Geometry ===
        const fgCtx = this.layers.foreground.ctx;
        
        // Golden ratio positioning
        const phi = 1.618;
        const centerX = this.width / phi;
        const centerY = this.height / phi;
        
        // Draw sacred geometry pattern
        fgCtx.save();
        fgCtx.translate(centerX, centerY);
        
        // Flower of life pattern
        const baseRadius = 80;
        fgCtx.strokeStyle = colors[2];
        fgCtx.lineWidth = 2;
        fgCtx.globalAlpha = 0.6;
        
        // Center circle
        fgCtx.beginPath();
        fgCtx.arc(0, 0, baseRadius, 0, Math.PI * 2);
        fgCtx.stroke();
        
        // Surrounding circles
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const x = Math.cos(angle) * baseRadius;
            const y = Math.sin(angle) * baseRadius;
            
            fgCtx.beginPath();
            fgCtx.arc(x, y, baseRadius, 0, Math.PI * 2);
            fgCtx.stroke();
            
            // Second layer with transparency
            for (let j = 0; j < 6; j++) {
                const angle2 = angle + (j / 6) * Math.PI * 2;
                const x2 = Math.cos(angle2) * baseRadius * 2;
                const y2 = Math.sin(angle2) * baseRadius * 2;
                
                fgCtx.globalAlpha = 0.2;
                fgCtx.beginPath();
                fgCtx.arc(x2, y2, baseRadius, 0, Math.PI * 2);
                fgCtx.stroke();
            }
        }
        
        fgCtx.restore();
        
        // === EFFECTS LAYER - Refraction ===
        const effectsCtx = this.layers.effects.ctx;
        
        // Simulate glass refraction effect
        effectsCtx.save();
        effectsCtx.globalCompositeOperation = 'overlay';
        
        const refractionGradient = effectsCtx.createLinearGradient(
            0, 0, this.width, this.height
        );
        refractionGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        refractionGradient.addColorStop(0.5, 'rgba(200, 220, 255, 0.2)');
        refractionGradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
        
        effectsCtx.fillStyle = refractionGradient;
        effectsCtx.fillRect(0, 0, this.width, this.height);
        
        effectsCtx.restore();
        
        // === COMPOSITE ALL LAYERS ===
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        this.ctx.drawImage(this.layers.background.canvas, 0, 0);
        
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';
        this.ctx.globalAlpha = 0.5;
        this.ctx.drawImage(this.layers.midground.canvas, 0, 0);
        this.ctx.restore();
        
        this.ctx.drawImage(this.layers.foreground.canvas, 0, 0);
        
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'soft-light';
        this.ctx.drawImage(this.layers.effects.canvas, 0, 0);
        this.ctx.restore();
        
        // Apply bloom to bright areas
        this.applyBloom(this.ctx, 0.6, 20);
        
        // Add chromatic aberration effect
        const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
        const data = imageData.data;
        const aberrationAmount = 3;
        
        for (let y = 0; y < this.height; y++) {
            for (let x = aberrationAmount; x < this.width - aberrationAmount; x++) {
                const idx = (y * this.width + x) * 4;
                const idxR = (y * this.width + x - aberrationAmount) * 4;
                const idxB = (y * this.width + x + aberrationAmount) * 4;
                
                data[idx] = data[idxR]; // Red channel shifted left
                data[idx + 2] = data[idxB + 2]; // Blue channel shifted right
            }
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }
    
    // ===================================================================
    // MAIN GENERATION METHOD
    // ===================================================================
    
    async generate(options = {}) {
        const {
            style = 'cosmic',
            title = 'Untitled',
            moonPhase = 0.5,
            seed = Date.now()
        } = options;
        
        // Set random seed
        this.seed = seed;
        Math.random = this.seededRandom(seed);
        
        // Re-initialize noise with seed
        this.initializeNoise();
        
        // Generate color palette
        const baseHue = Math.random() * 360;
        const colors = this.generateHarmonicPalette(baseHue, 'complementary');
        
        // Generate based on style
        switch (style) {
            case 'cosmic':
                await this.generateCosmicPro(moonPhase, colors);
                break;
            case 'organic':
                await this.generateOrganicPro(moonPhase, colors);
                break;
            case 'geometric':
                await this.generateGeometricPro(moonPhase, colors);
                break;
            default:
                await this.generateCosmicPro(moonPhase, colors);
        }
        
        // Add title if provided
        if (title) {
            this.addTitle(title);
        }
        
        return this.canvas;
    }
    
    addTitle(title) {
        // Subtle title with backdrop
        const gradient = this.ctx.createLinearGradient(
            0, this.height - 120, 0, this.height
        );
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, this.height - 120, this.width, 120);
        
        // Title text with glow
        this.ctx.save();
        this.ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        this.ctx.shadowBlur = 10;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 36px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(title, this.width / 2, this.height - 50);
        this.ctx.restore();
    }
    
    seededRandom(seed) {
        let currentSeed = seed;
        return () => {
            currentSeed = (currentSeed * 9301 + 49297) % 233280;
            return currentSeed / 233280;
        };
    }
    
    // ===================================================================
    // EXPORT METHODS
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

module.exports = ProfessionalArtworkGenerator;