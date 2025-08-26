/**
 * Vibrant Refined Artwork Generator
 * Maximum variety with better color harmony and randomization
 */

const { createCanvas } = require('canvas');
const fs = require('fs').promises;

class VibrantRefinedArtworkGenerator {
    constructor() {
        this.width = 800;
        this.height = 800;
        this.canvas = createCanvas(this.width, this.height);
        this.ctx = this.canvas.getContext('2d');
        this.noiseOffset = Math.random() * 1000;
        
        // Expanded styles with better names
        this.styles = [
            'neon-plasma',
            'cosmic-flow', 
            'vapor-dream',
            'cyber-matrix',
            'sunset-liquid',
            'electric-storm',
            'crystal-prism',
            'ocean-aurora'
        ];
    }
    
    // ===================================================================
    // ENHANCED COLOR PALETTES WITH VARIATIONS
    // ===================================================================
    
    getPalette(style, audioEnergy = 0.5, tempo = 120) {
        const palettes = {
            'neon-plasma': [
                // Variation 1: Electric neon
                ['#FF006E', '#FB5607', '#FFBE0B', '#8338EC', '#3A86FF'],
                // Variation 2: Toxic glow
                ['#39FF14', '#FF1493', '#00FFFF', '#FFD700', '#FF00FF'],
                // Variation 3: Plasma fire
                ['#FF4500', '#FF69B4', '#FFB6C1', '#FF1493', '#FF00FF']
            ],
            'cosmic-flow': [
                // Variation 1: Deep space
                ['#9D4EDD', '#7B2CBF', '#5A189A', '#FF006E', '#FFBE0B'],
                // Variation 2: Nebula
                ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FDCB6E', '#A29BFE'],
                // Variation 3: Stellar
                ['#667EEA', '#764BA2', '#F093FB', '#FCCDE3', '#FFD700']
            ],
            'vapor-dream': [
                // Variation 1: Classic vaporwave
                ['#FF6AD5', '#C774E8', '#AD8CFF', '#8795E8', '#94D0FF'],
                // Variation 2: Sunset vapor
                ['#FFB6C1', '#FFC0CB', '#DDA0DD', '#E6E6FA', '#F0E68C'],
                // Variation 3: Miami vice
                ['#FF69B4', '#FF1493', '#00CED1', '#40E0D0', '#FFFF00']
            ],
            'cyber-matrix': [
                // Variation 1: Cyberpunk neon (NO MORE ALL GREEN!)
                ['#FF00FF', '#00FFFF', '#FF1493', '#00FF00', '#FFA500'],
                // Variation 2: Tech noir
                ['#FF0080', '#0080FF', '#80FF00', '#FF8000', '#8000FF'],
                // Variation 3: Digital sunset
                ['#FF00AA', '#AA00FF', '#00AAFF', '#FFAA00', '#00FFAA']
            ],
            'sunset-liquid': [
                // Variation 1: Golden hour
                ['#FF6B6B', '#FFE66D', '#FF8E53', '#C73866', '#6A4C93'],
                // Variation 2: Tropical sunset
                ['#FF006E', '#FB5607', '#FFBE0B', '#8338EC', '#3A86FF'],
                // Variation 3: Desert heat
                ['#FF4500', '#FF6347', '#FF7F50', '#FFA500', '#FFD700']
            ],
            'electric-storm': [
                // Variation 1: Lightning
                ['#FFFFFF', '#00FFFF', '#0000FF', '#FF00FF', '#FFFF00'],
                // Variation 2: Thunder purple
                ['#9400D3', '#4B0082', '#0000FF', '#00FF00', '#FFFF00'],
                // Variation 3: Electric blue
                ['#00CED1', '#1E90FF', '#4169E1', '#0000CD', '#FFFFFF']
            ],
            'crystal-prism': [
                // Variation 1: Rainbow crystal
                ['#FF0080', '#8000FF', '#0080FF', '#00FF80', '#FFFF00'],
                // Variation 2: Diamond shine
                ['#E0E0E0', '#FFD700', '#FFC0CB', '#B19CD9', '#98FF98'],
                // Variation 3: Gem tones
                ['#DC143C', '#4B0082', '#008B8B', '#FFD700', '#FF1493']
            ],
            'ocean-aurora': [
                // Variation 1: TRUE Aurora Borealis (green, pink, purple, yellow)
                ['#00FF00', '#FF69B4', '#9400D3', '#FFFF00', '#00CED1'],
                // Variation 2: Arctic lights
                ['#7FFF00', '#FF1493', '#8A2BE2', '#F0E68C', '#00FFFF'],
                // Variation 3: Bioluminescent ocean
                ['#00FFFF', '#7FFFD4', '#40E0D0', '#FF69B4', '#ADFF2F']
            ]
        };
        
        // Select palette variation based on audio and randomness
        const stylePalettes = palettes[style] || palettes['neon-plasma'];
        
        // Choose variation based on energy and tempo
        let variationIndex = 0;
        if (audioEnergy > 0.7 && tempo > 140) {
            variationIndex = 0; // High energy = most vibrant
        } else if (audioEnergy < 0.3 && tempo < 100) {
            variationIndex = 2; // Low energy = softer variation
        } else {
            variationIndex = 1; // Medium = balanced
        }
        
        // Add 30% chance to randomly pick any variation
        if (Math.random() < 0.3) {
            variationIndex = Math.floor(Math.random() * stylePalettes.length);
        }
        
        let selectedPalette = [...stylePalettes[variationIndex]];
        
        // Shuffle colors for variety
        for (let i = selectedPalette.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [selectedPalette[i], selectedPalette[j]] = [selectedPalette[j], selectedPalette[i]];
        }
        
        // Add accent colors (10% chance)
        if (Math.random() < 0.1) {
            const accentColors = ['#FFD700', '#FF1493', '#00FF00', '#FF00FF', '#00FFFF'];
            selectedPalette.push(accentColors[Math.floor(Math.random() * accentColors.length)]);
        }
        
        return selectedPalette;
    }
    
    // ===================================================================
    // RENDERING METHODS (kept from enhanced)
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
        
        // Apply blur and contrast for smooth blending
        tempCtx.filter = 'blur(20px) contrast(2) brightness(1.5)';
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';
        this.ctx.drawImage(tempCanvas, 0, 0);
        this.ctx.restore();
    }
    
    renderFlowField(colors, particleCount = 100) {
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'lighter';
        
        for (let i = 0; i < particleCount; i++) {
            let x = Math.random() * this.width;
            let y = Math.random() * this.height;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 1 + Math.random() * 2;
            this.ctx.globalAlpha = 0.3 + Math.random() * 0.4;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            
            // Follow flow field
            for (let step = 0; step < 50; step++) {
                const angle = this.noise2D(x * 0.01, y * 0.01) * Math.PI * 2;
                x += Math.cos(angle) * 5;
                y += Math.sin(angle) * 5;
                
                // Wrap around edges
                if (x < 0) x = this.width;
                if (x > this.width) x = 0;
                if (y < 0) y = this.height;
                if (y > this.height) y = 0;
                
                this.ctx.lineTo(x, y);
            }
            
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
    
    renderParticles(colors, count = 200, sizeRange = { min: 1, max: 5 }) {
        for (let i = 0; i < count; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            const size = sizeRange.min + Math.random() * (sizeRange.max - sizeRange.min);
            const color = colors[Math.floor(Math.random() * colors.length)];
            
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
    // BACKGROUND VARIATIONS (from enhanced generator)
    // ===================================================================
    
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
    // ENHANCED STYLE RENDERERS WITH AUDIO RESPONSIVENESS
    // ===================================================================
    
    renderNeonPlasma(colors, energy, tempo) {
        // Energy affects glow intensity and ball count
        const glowIntensity = 0.5 + energy * 0.5;
        const ballCount = Math.floor(5 + energy * 10 + Math.random() * 3);
        
        // Vibrant gradient background
        const bgType = Math.random();
        if (bgType < 0.33) {
            this.drawRadialBurst(colors);
        } else if (bgType < 0.66) {
            this.drawWaveGradient(colors);
        } else {
            this.drawGradientMesh(colors);
        }
        
        // Plasma metaballs
        const balls = [];
        for (let i = 0; i < ballCount; i++) {
            balls.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: (30 + Math.random() * 100) * (0.5 + energy * 0.5)
            });
        }
        
        this.ctx.globalAlpha = glowIntensity;
        this.renderMetaballs(balls, colors);
        this.ctx.globalAlpha = 1;
        
        // Particle overlay - tempo affects count
        const particleCount = Math.floor(100 + tempo * 0.5);
        this.renderParticles(colors, particleCount, { 
            min: 1 + energy * 2, 
            max: 3 + energy * 4 
        });
        
        // Energy lightning
        if (energy > 0.7) {
            this.ctx.strokeStyle = colors[0];
            this.ctx.lineWidth = 2;
            this.ctx.globalAlpha = 0.6;
            this.ctx.globalCompositeOperation = 'screen';
            for (let i = 0; i < 5; i++) {
                this.ctx.beginPath();
                this.ctx.moveTo(Math.random() * this.width, 0);
                this.ctx.lineTo(Math.random() * this.width, this.height);
                this.ctx.stroke();
            }
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.globalAlpha = 1;
        }
    }
    
    renderCosmicFlow(colors, energy, tempo) {
        // Dark space background - energy affects darkness
        const gradient = this.ctx.createRadialGradient(
            this.width/2, this.height/2, 0,
            this.width/2, this.height/2, this.width
        );
        const darkness = 0.1 + (1 - energy) * 0.2;
        gradient.addColorStop(0, `rgba(10, 14, 39, ${darkness})`);
        gradient.addColorStop(1, '#000000');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Stars - more stars with higher tempo
        const starCount = Math.floor(200 + tempo * 2);
        this.renderParticles(['#FFFFFF', '#FFFF00', '#00FFFF', '#FF00FF'], starCount, { 
            min: 0.5, 
            max: 1.5 + energy 
        });
        
        // Flow fields - energy affects density
        const flowDensity = Math.floor(80 + energy * 120 + tempo * 0.5);
        this.renderFlowField(colors, flowDensity);
        
        // Nebula clouds - count based on energy
        const nebulaCount = Math.floor(3 + energy * 5);
        const nebulaBalls = [];
        for (let i = 0; i < nebulaCount; i++) {
            nebulaBalls.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: (80 + Math.random() * 150) * (0.5 + energy)
            });
        }
        this.ctx.globalAlpha = 0.2 + energy * 0.3;
        this.renderMetaballs(nebulaBalls, colors);
        this.ctx.globalAlpha = 1;
        
        // Add spiral galaxy effect for high energy
        if (energy > 0.6) {
            this.ctx.save();
            this.ctx.translate(this.width/2, this.height/2);
            this.ctx.rotate(Date.now() * 0.0001);
            this.ctx.globalCompositeOperation = 'screen';
            for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
                const x = Math.cos(angle) * angle * 30;
                const y = Math.sin(angle) * angle * 30;
                this.ctx.fillStyle = colors[Math.floor(angle * 2) % colors.length];
                this.ctx.globalAlpha = 0.3 * (1 - angle / (Math.PI * 2));
                this.ctx.fillRect(x - 2, y - 2, 4, 4);
            }
            this.ctx.restore();
            this.ctx.globalAlpha = 1;
            this.ctx.globalCompositeOperation = 'source-over';
        }
    }
    
    renderVaporDream(colors, energy, tempo) {
        // Pastel gradient shifts with energy
        const gradientType = energy > 0.5 ? 'diagonal' : 'wave';
        if (gradientType === 'diagonal') {
            const gradient = this.ctx.createLinearGradient(0, 0, this.width, this.height);
            colors.forEach((color, i) => {
                const stop = i / (colors.length - 1);
                const rgb = this.hexToRgb(color);
                gradient.addColorStop(stop, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.3 + energy * 0.2})`);
            });
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.width, this.height);
        } else {
            this.drawWaveGradient(colors);
        }
        
        // Soft organic shapes - count varies with tempo
        const shapeCount = Math.floor(8 + tempo / 20);
        const balls = [];
        for (let i = 0; i < shapeCount; i++) {
            balls.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: (20 + Math.random() * 60) * (1 + energy * 0.5)
            });
        }
        
        // Use different blend modes based on energy
        this.ctx.globalCompositeOperation = energy > 0.5 ? 'multiply' : 'soft-light';
        this.ctx.globalAlpha = 0.4 + energy * 0.3;
        this.renderMetaballs(balls, colors);
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.globalAlpha = 1;
        
        // Grid overlay - density based on tempo
        const gridDensity = Math.floor(8 + tempo / 40);
        this.ctx.save();
        this.ctx.globalAlpha = 0.1 + energy * 0.2;
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 1;
        
        // Perspective grid for high energy
        if (energy > 0.7) {
            const vanishingY = this.height * 0.3;
            for (let i = 0; i <= gridDensity; i++) {
                const x = i * (this.width / gridDensity);
                this.ctx.beginPath();
                this.ctx.moveTo(x, this.height);
                this.ctx.lineTo(this.width/2, vanishingY);
                this.ctx.stroke();
            }
            // Horizontal lines
            for (let i = 0; i <= 10; i++) {
                const y = vanishingY + (this.height - vanishingY) * (i / 10);
                const perspective = 1 - (y - vanishingY) / (this.height - vanishingY);
                const width = this.width * (1 - perspective * 0.7);
                const x = (this.width - width) / 2;
                this.ctx.beginPath();
                this.ctx.moveTo(x, y);
                this.ctx.lineTo(x + width, y);
                this.ctx.stroke();
            }
        } else {
            // Regular grid
            for (let i = 0; i <= gridDensity; i++) {
                const pos = i * (this.width / gridDensity);
                this.ctx.beginPath();
                this.ctx.moveTo(pos, 0);
                this.ctx.lineTo(pos, this.height);
                this.ctx.stroke();
                this.ctx.beginPath();
                this.ctx.moveTo(0, pos);
                this.ctx.lineTo(this.width, pos);
                this.ctx.stroke();
            }
        }
        this.ctx.restore();
        
        // Dreamy particles
        this.renderParticles(colors, Math.floor(50 + tempo), { min: 1, max: 3 });
    }
    
    renderSunsetLiquid(colors, energy, tempo) {
        // Sunset gradient - energy affects warmth
        const sunPosition = energy; // 0 = low, 1 = high
        const gradient = this.ctx.createRadialGradient(
            this.width * 0.5, this.height * (1 - sunPosition * 0.5), 100,
            this.width * 0.5, this.height * (1 - sunPosition * 0.5), this.width
        );
        
        // Dynamic sunset colors
        const sunColors = energy > 0.5 
            ? ['#FF6B6B', '#FFE66D', '#FF8E53'] 
            : ['#C73866', '#6A4C93', '#4A5568'];
        
        sunColors.forEach((color, i) => {
            gradient.addColorStop(i / (sunColors.length - 1), color);
        });
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Liquid blobs - more fluid with higher tempo
        const blobCount = Math.floor(8 + tempo / 30);
        const liquidBalls = [];
        for (let i = 0; i < blobCount; i++) {
            liquidBalls.push({
                x: Math.random() * this.width,
                y: this.height * (0.3 + Math.random() * 0.7), // Lower half bias
                radius: (40 + Math.random() * 100) * (0.5 + energy)
            });
        }
        
        this.ctx.globalCompositeOperation = 'overlay';
        this.ctx.globalAlpha = 0.6;
        this.renderMetaballs(liquidBalls, colors);
        this.ctx.globalCompositeOperation = 'source-over';
        
        // Sun rays for high energy
        if (energy > 0.6) {
            this.ctx.globalCompositeOperation = 'screen';
            this.ctx.globalAlpha = 0.3;
            const rayCount = Math.floor(5 + energy * 10);
            for (let i = 0; i < rayCount; i++) {
                const angle = (i / rayCount) * Math.PI;
                const gradient = this.ctx.createLinearGradient(
                    this.width/2, this.height * (1 - sunPosition * 0.5),
                    this.width/2 + Math.cos(angle) * this.width,
                    this.height * (1 - sunPosition * 0.5) + Math.sin(angle) * this.height
                );
                gradient.addColorStop(0, sunColors[0]);
                gradient.addColorStop(1, 'transparent');
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(0, 0, this.width, this.height);
            }
            this.ctx.globalCompositeOperation = 'source-over';
        }
        
        this.ctx.globalAlpha = 1;
        
        // Liquid flow lines
        this.renderFlowField(colors, Math.floor(50 + tempo * 0.5));
    }
    
    renderElectricStorm(colors, energy, tempo) {
        // Storm darkness based on energy
        const stormIntensity = energy;
        const bgGradient = this.ctx.createRadialGradient(
            this.width/2, this.height/2, 0,
            this.width/2, this.height/2, this.width
        );
        bgGradient.addColorStop(0, `rgba(0, 0, 51, ${1 - stormIntensity * 0.5})`);
        bgGradient.addColorStop(1, '#000000');
        this.ctx.fillStyle = bgGradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Storm clouds
        const cloudBalls = [];
        const cloudCount = Math.floor(5 + energy * 5);
        for (let i = 0; i < cloudCount; i++) {
            cloudBalls.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height * 0.5, // Upper half
                radius: (60 + Math.random() * 120) * (0.5 + stormIntensity)
            });
        }
        this.ctx.globalAlpha = 0.3;
        this.ctx.globalCompositeOperation = 'screen';
        this.renderMetaballs(cloudBalls, ['#4B0082', '#0000FF', '#000033']);
        this.ctx.globalAlpha = 1;
        this.ctx.globalCompositeOperation = 'source-over';
        
        // Lightning bolts - more with higher energy
        const boltCount = Math.floor(energy * 10);
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.globalCompositeOperation = 'screen';
        
        for (let i = 0; i < boltCount; i++) {
            this.ctx.lineWidth = 1 + Math.random() * 3;
            this.ctx.globalAlpha = 0.5 + Math.random() * 0.5;
            
            this.ctx.beginPath();
            let x = Math.random() * this.width;
            let y = 0;
            this.ctx.moveTo(x, y);
            
            // Zigzag down
            while (y < this.height) {
                y += 20 + Math.random() * 50;
                x += (Math.random() - 0.5) * 100;
                this.ctx.lineTo(x, y);
            }
            this.ctx.stroke();
            
            // Glow around lightning
            this.ctx.strokeStyle = colors[i % colors.length];
            this.ctx.lineWidth = 8;
            this.ctx.globalAlpha = 0.2;
            this.ctx.stroke();
            this.ctx.strokeStyle = '#FFFFFF';
        }
        
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.globalAlpha = 1;
        
        // Energy particles - tempo affects speed/count
        const particleColors = [...colors, '#FFFFFF', '#FFFF00'];
        this.renderParticles(particleColors, Math.floor(100 + tempo), { 
            min: 1, 
            max: 3 + energy * 2 
        });
        
        // Flow field for wind effect
        this.renderFlowField(['#00FFFF', '#FFFFFF'], Math.floor(50 + tempo * 0.3));
    }
    
    renderCrystalPrism(colors, energy, tempo) {
        // Rainbow gradient mesh background
        this.drawGradientMesh(colors);
        
        // Crystal shapes - complexity based on energy
        const shapeCount = Math.floor(10 + energy * 20);
        const shapeComplexity = Math.floor(3 + energy * 5); // sides
        
        for (let i = 0; i < shapeCount; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            const size = (30 + Math.random() * 100) * (0.5 + energy);
            const sides = Math.floor(3 + Math.random() * shapeComplexity);
            const rotation = Math.random() * Math.PI * 2;
            
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(rotation + tempo * 0.001);
            
            // Crystal with gradient
            const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, size);
            const color1 = colors[i % colors.length];
            const color2 = colors[(i + 1) % colors.length];
            const rgb1 = this.hexToRgb(color1);
            const rgb2 = this.hexToRgb(color2);
            
            gradient.addColorStop(0, `rgba(${rgb1.r}, ${rgb1.g}, ${rgb1.b}, 0.8)`);
            gradient.addColorStop(0.5, `rgba(${rgb2.r}, ${rgb2.g}, ${rgb2.b}, 0.5)`);
            gradient.addColorStop(1, `rgba(${rgb2.r}, ${rgb2.g}, ${rgb2.b}, 0)`);
            
            this.ctx.fillStyle = gradient;
            this.ctx.globalAlpha = 0.3 + Math.random() * 0.4;
            this.ctx.globalCompositeOperation = Math.random() > 0.5 ? 'screen' : 'overlay';
            
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
            
            // Inner crystal facets
            if (energy > 0.5) {
                this.ctx.strokeStyle = color1;
                this.ctx.lineWidth = 1;
                this.ctx.globalAlpha = 0.5;
                for (let j = 0; j < sides; j++) {
                    const angle = (j / sides) * Math.PI * 2;
                    const px = Math.cos(angle) * size;
                    const py = Math.sin(angle) * size;
                    this.ctx.beginPath();
                    this.ctx.moveTo(0, 0);
                    this.ctx.lineTo(px, py);
                    this.ctx.stroke();
                }
            }
            
            this.ctx.restore();
        }
        
        this.ctx.globalAlpha = 1;
        this.ctx.globalCompositeOperation = 'source-over';
        
        // Light refraction particles
        this.renderParticles([...colors, '#FFFFFF'], Math.floor(100 + tempo * 0.5), {
            min: 0.5,
            max: 2
        });
        
        // Prismatic light beams for high energy
        if (energy > 0.7) {
            this.ctx.globalCompositeOperation = 'screen';
            for (let i = 0; i < colors.length; i++) {
                const angle = (i / colors.length) * Math.PI;
                const gradient = this.ctx.createLinearGradient(
                    this.width/2, this.height/2,
                    this.width/2 + Math.cos(angle) * this.width,
                    this.height/2 + Math.sin(angle) * this.height
                );
                const rgb = this.hexToRgb(colors[i]);
                gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
                gradient.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`);
                gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(0, 0, this.width, this.height);
            }
            this.ctx.globalCompositeOperation = 'source-over';
        }
    }
    
    renderOceanAurora(colors) {
        // Deep ocean gradient base
        const oceanGradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        oceanGradient.addColorStop(0, '#001133');
        oceanGradient.addColorStop(0.5, '#003366');
        oceanGradient.addColorStop(1, '#004466');
        this.ctx.fillStyle = oceanGradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Aurora curtains with proper colors
        this.ctx.globalCompositeOperation = 'screen';
        
        // Create vertical aurora bands
        for (let i = 0; i < 7; i++) {
            const x = (i / 7) * this.width + Math.sin(i) * 100;
            const width = 100 + Math.random() * 150;
            
            const gradient = this.ctx.createLinearGradient(x, 0, x + width, this.height);
            const color = colors[i % colors.length];
            const rgb = this.hexToRgb(color);
            
            // Aurora fade pattern
            gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
            gradient.addColorStop(0.2, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`);
            gradient.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`);
            gradient.addColorStop(0.8, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`);
            gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
            
            this.ctx.fillStyle = gradient;
            
            // Wavy aurora shape
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            for (let y = 0; y <= this.height; y += 20) {
                const wave = Math.sin(y * 0.01 + i) * 50;
                this.ctx.lineTo(x + width/2 + wave, y);
            }
            this.ctx.lineTo(x + width, this.height);
            this.ctx.lineTo(x + width, 0);
            this.ctx.closePath();
            this.ctx.fill();
        }
        
        // Add stars
        this.ctx.globalCompositeOperation = 'source-over';
        this.renderParticles(['#FFFFFF', '#FFFFAA', '#AAFFFF'], 150, { min: 0.5, max: 2 });
        
        // Bioluminescent particles
        this.ctx.globalCompositeOperation = 'screen';
        this.renderParticles([colors[2], colors[3]], 50, { min: 2, max: 4 });
        
        this.ctx.globalCompositeOperation = 'source-over';
    }
    
    renderCyberMatrix(colors) {
        // Dark tech background
        const bgGradient = this.ctx.createRadialGradient(
            this.width/2, this.height/2, 0,
            this.width/2, this.height/2, this.width
        );
        bgGradient.addColorStop(0, '#1a0033');
        bgGradient.addColorStop(1, '#000000');
        this.ctx.fillStyle = bgGradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Digital rain with multiple colors
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';
        
        // Create columns of falling characters
        const columns = 30;
        for (let i = 0; i < columns; i++) {
            const x = (i / columns) * this.width;
            const color = colors[i % colors.length];
            
            // Vertical gradient for each column
            const gradient = this.ctx.createLinearGradient(x, 0, x, this.height);
            const rgb = this.hexToRgb(color);
            
            gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`);
            gradient.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`);
            gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
            
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([10, 5, 5, 5]);
            
            this.ctx.beginPath();
            this.ctx.moveTo(x + Math.random() * 20, 0);
            this.ctx.lineTo(x + Math.random() * 20, this.height);
            this.ctx.stroke();
        }
        
        this.ctx.setLineDash([]);
        this.ctx.restore();
        
        // Glitch blocks
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            const w = 50 + Math.random() * 150;
            const h = 5 + Math.random() * 30;
            
            this.ctx.save();
            this.ctx.globalCompositeOperation = 'difference';
            this.ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            this.ctx.globalAlpha = 0.8;
            this.ctx.fillRect(x, y, w, h);
            this.ctx.restore();
        }
        
        // Data nodes
        this.ctx.globalCompositeOperation = 'screen';
        const nodes = [];
        for (let i = 0; i < 8; i++) {
            nodes.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: 20 + Math.random() * 40
            });
        }
        this.renderMetaballs(nodes, colors);
        
        // Circuit lines
        this.ctx.strokeStyle = colors[0];
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = 0.5;
        for (let i = 0; i < nodes.length - 1; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(nodes[i].x, nodes[i].y);
            this.ctx.lineTo(nodes[i + 1].x, nodes[i + 1].y);
            this.ctx.stroke();
        }
        
        this.ctx.globalAlpha = 1;
        this.ctx.globalCompositeOperation = 'source-over';
    }
    
    // ===================================================================
    // MAIN GENERATION WITH MORE RANDOMIZATION
    // ===================================================================
    
    async generate(options = {}) {
        const {
            style = this.styles[Math.floor(Math.random() * this.styles.length)],
            seed = Date.now(),
            audioEnergy = 0.5,
            tempo = 120,
            moonPhase = 0.5,
            title = ''
        } = options;
        
        // Use seed for reproducible randomness
        this.seed = seed;
        Math.random = () => {
            this.seed = (this.seed * 1664525 + 1013904223) % 2147483647;
            return this.seed / 2147483647;
        };
        
        // Get palette with variations
        const colors = this.getPalette(style, audioEnergy, tempo);
        
        // Clear canvas with subtle gradient
        const bgGradient = this.ctx.createRadialGradient(
            this.width/2, this.height/2, 0,
            this.width/2, this.height/2, this.width
        );
        bgGradient.addColorStop(0, '#0a0a0a');
        bgGradient.addColorStop(1, '#000000');
        this.ctx.fillStyle = bgGradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Render based on style with enhanced versions
        switch (style) {
            case 'ocean-aurora':
                this.renderOceanAurora(colors);
                break;
                
            case 'cyber-matrix':
                this.renderCyberMatrix(colors);
                break;
                
            case 'neon-plasma':
                this.renderNeonPlasma(colors, audioEnergy, tempo);
                break;
                
            case 'cosmic-flow':
                this.renderCosmicFlow(colors, audioEnergy, tempo);
                break;
                
            case 'vapor-dream':
                this.renderVaporDream(colors, audioEnergy, tempo);
                break;
                
            case 'sunset-liquid':
                this.renderSunsetLiquid(colors, audioEnergy, tempo);
                break;
                
            case 'electric-storm':
                this.renderElectricStorm(colors, audioEnergy, tempo);
                break;
                
            case 'crystal-prism':
                this.renderCrystalPrism(colors, audioEnergy, tempo);
                break;
                
            // ... other styles remain similar but with added randomization
            
            default:
                this.renderMetaballs(
                    Array(8).fill().map(() => ({
                        x: Math.random() * this.width,
                        y: Math.random() * this.height,
                        radius: 40 + Math.random() * 100
                    })),
                    colors
                );
        }
        
        // Add title if provided
        if (title) {
            this.ctx.save();
            this.ctx.font = 'bold 24px sans-serif';
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(title, this.width / 2, this.height - 30);
            this.ctx.restore();
        }
        
        return this.canvas;
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
    
    async saveToFile(outputPath, format = 'png') {
        const buffer = format === 'png' 
            ? this.canvas.toBuffer('image/png')
            : this.canvas.toBuffer('image/jpeg', { quality: 0.95 });
        
        await fs.writeFile(outputPath, buffer);
        console.log(`✅ Saved artwork to ${outputPath}`);
    }
}

module.exports = VibrantRefinedArtworkGenerator;