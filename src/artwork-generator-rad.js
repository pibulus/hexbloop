const { createCanvas } = require('canvas');
const fs = require('fs').promises;

// ===================================================================
// 🎨 RAD ORGANIC ARTWORK GENERATOR
// ===================================================================

class RadArtworkGenerator {
    constructor() {
        this.width = 1400;
        this.height = 1400;
        this.canvas = createCanvas(this.width, this.height);
        this.ctx = this.canvas.getContext('2d');
        
        // Initialize noise field
        this.noiseOffset = Math.random() * 1000;
        this.time = 0;
    }
    
    // ===================================================================
    // METABALLS - Organic blob merging
    // ===================================================================
    
    renderMetaballs(balls, colors) {
        // Create temporary canvas for smooth blending
        const tempCanvas = createCanvas(this.width, this.height);
        const tempCtx = tempCanvas.getContext('2d');
        
        // Draw each metaball as a radial gradient
        for (let i = 0; i < balls.length; i++) {
            const ball = balls[i];
            const gradient = tempCtx.createRadialGradient(
                ball.x, ball.y, 0,
                ball.x, ball.y, ball.radius * 2
            );
            
            // Use ball color or pick from colors array
            const color = ball.color || this.hexToRgb(colors[i % colors.length]);
            
            gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 1)`);
            gradient.addColorStop(0.4, `rgba(${color.r}, ${color.g}, ${color.b}, 0.8)`);
            gradient.addColorStop(0.7, `rgba(${color.r}, ${color.g}, ${color.b}, 0.3)`);
            gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
            
            tempCtx.fillStyle = gradient;
            tempCtx.fillRect(
                ball.x - ball.radius * 2,
                ball.y - ball.radius * 2,
                ball.radius * 4,
                ball.radius * 4
            );
        }
        
        // Apply blur for smooth blending
        this.ctx.save();
        this.ctx.filter = 'blur(30px) contrast(3) brightness(1.2)';
        this.ctx.globalCompositeOperation = 'screen';
        this.ctx.drawImage(tempCanvas, 0, 0);
        this.ctx.restore();
    }
    
    // ===================================================================
    // GRADIENT FIELDS - Smooth color transitions
    // ===================================================================
    
    renderGradientField(nodes) {
        // Create gradient field using inverse distance weighting
        const imageData = this.ctx.createImageData(this.width, this.height);
        const data = imageData.data;
        const step = 2;
        
        for (let x = 0; x < this.width; x += step) {
            for (let y = 0; y < this.height; y += step) {
                let totalWeight = 0;
                let r = 0, g = 0, b = 0;
                
                // Inverse distance weighted interpolation
                for (const node of nodes) {
                    const dx = x - node.x;
                    const dy = y - node.y;
                    const dist = Math.sqrt(dx * dx + dy * dy) + 1;
                    const weight = 1 / (dist * dist * 0.0001);
                    
                    totalWeight += weight;
                    r += node.color.r * weight;
                    g += node.color.g * weight;
                    b += node.color.b * weight;
                }
                
                r /= totalWeight;
                g /= totalWeight;
                b /= totalWeight;
                
                // Add noise for organic feel
                const noise = this.noise2D(x * 0.003, y * 0.003);
                r = Math.max(0, Math.min(255, r + noise * 30));
                g = Math.max(0, Math.min(255, g + noise * 30));
                b = Math.max(0, Math.min(255, b + noise * 30));
                
                // Fill pixels
                for (let px = 0; px < step; px++) {
                    for (let py = 0; py < step; py++) {
                        const idx = ((y + py) * this.width + (x + px)) * 4;
                        if (idx < data.length - 3) {
                            data[idx] = r;
                            data[idx + 1] = g;
                            data[idx + 2] = b;
                            data[idx + 3] = 255;
                        }
                    }
                }
            }
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }
    
    // ===================================================================
    // PROPER GLOW - Luminous effects
    // ===================================================================
    
    addGlow(x, y, radius, color, intensity = 1) {
        // Multi-stop radial gradient for realistic glow
        const glow = this.ctx.createRadialGradient(x, y, 0, x, y, radius * 3);
        
        const r = color.r || 255;
        const g = color.g || 255;
        const b = color.b || 255;
        
        glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${intensity})`);
        glow.addColorStop(0.1, `rgba(${r}, ${g}, ${b}, ${intensity * 0.8})`);
        glow.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${intensity * 0.5})`);
        glow.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${intensity * 0.2})`);
        glow.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${intensity * 0.05})`);
        glow.addColorStop(1, 'transparent');
        
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';
        this.ctx.fillStyle = glow;
        this.ctx.fillRect(x - radius * 3, y - radius * 3, radius * 6, radius * 6);
        this.ctx.restore();
    }
    
    // ===================================================================
    // COLOR BLEEDING - Organic color flow
    // ===================================================================
    
    applyColorBleeding() {
        // Apply gaussian blur for color bleeding effect
        this.ctx.save();
        this.ctx.filter = 'blur(20px)';
        this.ctx.globalAlpha = 0.5;
        this.ctx.drawImage(this.canvas, 0, 0);
        this.ctx.restore();
        
        // Overlay with multiply for richer colors
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'multiply';
        this.ctx.globalAlpha = 0.3;
        this.ctx.drawImage(this.canvas, 0, 0);
        this.ctx.restore();
    }
    
    // ===================================================================
    // SIMPLIFIED NOISE
    // ===================================================================
    
    noise2D(x, y) {
        // Simple pseudo-noise for organic variation
        const n = Math.sin(x * 12.9898 + y * 78.233 + this.noiseOffset) * 43758.5453;
        return (n - Math.floor(n)) * 2 - 1;
    }
    
    // ===================================================================
    // STYLE IMPLEMENTATIONS (Only the good ones)
    // ===================================================================
    
    async generateFluid(colors) {
        // Deep dark background
        const bgGradient = this.ctx.createRadialGradient(
            this.width / 2, this.height / 2, 0,
            this.width / 2, this.height / 2, this.width
        );
        bgGradient.addColorStop(0, '#050510');
        bgGradient.addColorStop(1, '#000000');
        this.ctx.fillStyle = bgGradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Create flowing metaballs with organic movement
        const balls = [];
        const numBalls = 6 + Math.floor(Math.random() * 4);
        
        for (let i = 0; i < numBalls; i++) {
            // Organic placement using golden ratio
            const golden = 1.618033988;
            const angle = i * 2.39996323; // golden angle
            const radius = Math.sqrt(i / numBalls) * this.width * 0.4;
            
            balls.push({
                x: this.width / 2 + Math.cos(angle) * radius + (Math.random() - 0.5) * 100,
                y: this.height / 2 + Math.sin(angle) * radius + (Math.random() - 0.5) * 100,
                radius: 100 + Math.random() * 150,
                color: this.hexToRgb(colors[i % colors.length])
            });
        }
        
        // Multiple layers for depth
        // Base glow layer
        this.ctx.save();
        this.ctx.filter = 'blur(60px)';
        this.renderMetaballs(balls, colors);
        this.ctx.restore();
        
        // Mid layer with less blur
        this.ctx.save();
        this.ctx.globalAlpha = 0.8;
        this.ctx.filter = 'blur(20px)';
        this.renderMetaballs(balls.map(b => ({...b, radius: b.radius * 0.7})), colors);
        this.ctx.restore();
        
        // Sharp core layer
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';
        this.ctx.globalAlpha = 0.6;
        this.renderMetaballs(balls.map(b => ({...b, radius: b.radius * 0.4})), colors);
        this.ctx.restore();
        
        // Color bleeding for organic flow
        this.ctx.save();
        this.ctx.filter = 'blur(40px) saturate(1.5)';
        this.ctx.globalCompositeOperation = 'soft-light';
        this.ctx.globalAlpha = 0.5;
        this.ctx.drawImage(this.canvas, 0, 0);
        this.ctx.restore();
        
        // Subtle particles for atmosphere
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            const size = Math.random() * 2;
            const opacity = Math.random() * 0.3;
            
            const glow = this.ctx.createRadialGradient(x, y, 0, x, y, size * 4);
            glow.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
            glow.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = glow;
            this.ctx.fillRect(x - size * 4, y - size * 4, size * 8, size * 8);
        }
        this.ctx.restore();
    }
    
    async generateNebula(colors) {
        // Deep space background
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Create gradient field nodes
        const nodes = [];
        for (let i = 0; i < 6; i++) {
            nodes.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                color: this.hexToRgb(colors[i % colors.length])
            });
        }
        
        // Render gradient field
        this.renderGradientField(nodes);
        
        // Apply heavy blur for nebula effect
        this.ctx.save();
        this.ctx.filter = 'blur(40px)';
        this.ctx.globalAlpha = 0.8;
        this.ctx.drawImage(this.canvas, 0, 0);
        this.ctx.restore();
        
        // Add bright cores with glow
        for (const node of nodes) {
            this.addGlow(node.x, node.y, 100, node.color, 0.8);
        }
        
        // Star field on top
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            const size = Math.random() * 2;
            const brightness = 0.3 + Math.random() * 0.7;
            
            // Tiny glow for each star
            const starGlow = this.ctx.createRadialGradient(x, y, 0, x, y, size * 3);
            starGlow.addColorStop(0, `rgba(255, 255, 255, ${brightness})`);
            starGlow.addColorStop(0.5, `rgba(200, 220, 255, ${brightness * 0.3})`);
            starGlow.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = starGlow;
            this.ctx.fillRect(x - size * 3, y - size * 3, size * 6, size * 6);
        }
        this.ctx.restore();
        
        // Final color bleeding pass
        this.applyColorBleeding();
    }
    
    async generateOrganic(colors) {
        // Warm organic background
        const bgGradient = this.ctx.createLinearGradient(0, 0, this.width, this.height);
        bgGradient.addColorStop(0, colors[0]);
        bgGradient.addColorStop(1, colors[1]);
        this.ctx.fillStyle = bgGradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Reaction-diffusion-like pattern (simplified)
        const cells = [];
        const gridSize = 20;
        
        // Initialize cells
        for (let x = 0; x < this.width; x += gridSize) {
            for (let y = 0; y < this.height; y += gridSize) {
                if (Math.random() > 0.7) {
                    cells.push({
                        x: x + Math.random() * gridSize,
                        y: y + Math.random() * gridSize,
                        radius: 10 + Math.random() * 30,
                        growth: Math.random() * 0.5 + 0.5,
                        color: this.hexToRgb(colors[Math.floor(Math.random() * colors.length)])
                    });
                }
            }
        }
        
        // Grow cells organically
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'multiply';
        
        for (const cell of cells) {
            // Organic blob shape using noise
            this.ctx.beginPath();
            for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
                const noiseValue = this.noise2D(
                    Math.cos(angle) * 2 + cell.x * 0.01,
                    Math.sin(angle) * 2 + cell.y * 0.01
                );
                const r = cell.radius * (1 + noiseValue * 0.3);
                const x = cell.x + Math.cos(angle) * r;
                const y = cell.y + Math.sin(angle) * r;
                
                if (angle === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            this.ctx.closePath();
            
            // Gradient fill for depth
            const gradient = this.ctx.createRadialGradient(
                cell.x, cell.y, 0,
                cell.x, cell.y, cell.radius
            );
            gradient.addColorStop(0, `rgba(${cell.color.r}, ${cell.color.g}, ${cell.color.b}, 0.8)`);
            gradient.addColorStop(1, `rgba(${cell.color.r}, ${cell.color.g}, ${cell.color.b}, 0.1)`);
            
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
        }
        
        this.ctx.restore();
        
        // Add veins/connections
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'overlay';
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i < cells.length - 1; i++) {
            for (let j = i + 1; j < cells.length; j++) {
                const dist = Math.hypot(cells[i].x - cells[j].x, cells[i].y - cells[j].y);
                if (dist < 150) {
                    this.ctx.globalAlpha = 1 - dist / 150;
                    this.ctx.beginPath();
                    this.ctx.moveTo(cells[i].x, cells[i].y);
                    this.ctx.lineTo(cells[j].x, cells[j].y);
                    this.ctx.stroke();
                }
            }
        }
        
        this.ctx.restore();
        
        // Final glow pass
        for (const cell of cells.slice(0, 5)) {
            this.addGlow(cell.x, cell.y, cell.radius * 2, cell.color, 0.3);
        }
        
        // Color bleeding
        this.applyColorBleeding();
    }
    
    async generateEnergy(colors) {
        // Pure black background for contrast
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        // Create energy plasma core
        const plasmaBalls = [];
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.5;
            const dist = 80 + Math.sin(i * 0.7) * 40;
            plasmaBalls.push({
                x: centerX + Math.cos(angle) * dist,
                y: centerY + Math.sin(angle) * dist,
                radius: 60 + Math.random() * 40,
                color: this.hexToRgb(colors[i % colors.length])
            });
        }
        
        // Render plasma with heavy glow
        this.ctx.save();
        this.ctx.filter = 'blur(50px) brightness(2)';
        this.renderMetaballs(plasmaBalls, colors);
        this.ctx.restore();
        
        // Sharp plasma core
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';
        this.ctx.filter = 'blur(10px) contrast(2)';
        this.renderMetaballs(plasmaBalls.map(b => ({...b, radius: b.radius * 0.5})), colors);
        this.ctx.restore();
        
        // Energy tendrils
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';
        
        for (let i = 0; i < 20; i++) {
            const startAngle = Math.random() * Math.PI * 2;
            
            // Create gradient stroke for energy beam
            const gradient = this.ctx.createLinearGradient(
                centerX, centerY,
                centerX + Math.cos(startAngle) * 400,
                centerY + Math.sin(startAngle) * 400
            );
            
            const color = colors[i % colors.length];
            gradient.addColorStop(0, color);
            gradient.addColorStop(0.5, color + '88');
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 2 + Math.random() * 3;
            this.ctx.lineCap = 'round';
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = color;
            
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            
            // Organic curve using bezier
            const cp1x = centerX + Math.cos(startAngle + 0.3) * 200;
            const cp1y = centerY + Math.sin(startAngle + 0.3) * 200;
            const cp2x = centerX + Math.cos(startAngle - 0.3) * 300;
            const cp2y = centerY + Math.sin(startAngle - 0.3) * 300;
            const endX = centerX + Math.cos(startAngle) * 400 + (Math.random() - 0.5) * 100;
            const endY = centerY + Math.sin(startAngle) * 400 + (Math.random() - 0.5) * 100;
            
            this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
        
        // Bright core glow
        for (let i = 0; i < 3; i++) {
            this.addGlow(centerX, centerY, 150 + i * 100, 
                       this.hexToRgb(colors[0]), 0.4 - i * 0.1);
        }
        
        // Final enhancement
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'soft-light';
        this.ctx.filter = 'blur(30px) saturate(2)';
        this.ctx.globalAlpha = 0.5;
        this.ctx.drawImage(this.canvas, 0, 0);
        this.ctx.restore();
    }
    
    // ===================================================================
    // COLOR UTILITIES
    // ===================================================================
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 255, g: 255, b: 255 };
    }
    
    generateHarmonicColors(baseHue, scheme = 'triadic') {
        const colors = [];
        const saturation = 70;
        const lightness = 50;
        
        const hslToHex = (h, s, l) => {
            l /= 100;
            const a = s * Math.min(l, 1 - l) / 100;
            const f = n => {
                const k = (n + h / 30) % 12;
                const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
                return Math.round(255 * color).toString(16).padStart(2, '0');
            };
            return `#${f(0)}${f(8)}${f(4)}`;
        };
        
        switch (scheme) {
            case 'triadic':
                colors.push(hslToHex(baseHue, saturation, lightness));
                colors.push(hslToHex((baseHue + 120) % 360, saturation, lightness));
                colors.push(hslToHex((baseHue + 240) % 360, saturation, lightness));
                colors.push(hslToHex((baseHue + 60) % 360, saturation - 10, lightness + 10));
                colors.push(hslToHex((baseHue + 180) % 360, saturation - 10, lightness - 10));
                break;
                
            case 'analogous':
                for (let i = -2; i <= 2; i++) {
                    colors.push(hslToHex(
                        (baseHue + i * 30 + 360) % 360,
                        saturation + (Math.abs(i) * 5),
                        lightness - (Math.abs(i) * 5)
                    ));
                }
                break;
                
            default:
                // Complementary
                colors.push(hslToHex(baseHue, saturation, lightness));
                colors.push(hslToHex((baseHue + 180) % 360, saturation, lightness));
                colors.push(hslToHex((baseHue + 90) % 360, saturation - 10, lightness + 10));
                colors.push(hslToHex((baseHue + 270) % 360, saturation - 10, lightness - 10));
        }
        
        return colors;
    }
    
    // ===================================================================
    // MAIN GENERATION
    // ===================================================================
    
    async generate(options = {}) {
        const {
            style = this.pickRandomStyle(),
            title = '',
            moonPhase = 0.5,
            seed = Date.now()
        } = options;
        
        // Set random seed
        this.noiseOffset = seed;
        
        // Generate harmonic colors
        const baseHue = (seed % 360);
        const scheme = ['triadic', 'analogous', 'complementary'][seed % 3];
        const colors = this.generateHarmonicColors(baseHue, scheme);
        
        // Generate based on style (only the good ones)
        switch (style) {
            case 'fluid':
                await this.generateFluid(colors);
                break;
            case 'nebula':
                await this.generateNebula(colors);
                break;
            case 'organic':
                await this.generateOrganic(colors);
                break;
            case 'energy':
                await this.generateEnergy(colors);
                break;
            default:
                // Pick random if unknown style
                const styles = ['fluid', 'nebula', 'organic', 'energy'];
                const randomStyle = styles[Math.floor(Math.random() * styles.length)];
                await this[`generate${randomStyle.charAt(0).toUpperCase() + randomStyle.slice(1)}`](colors);
        }
        
        // Add subtle vignette
        const vignette = this.ctx.createRadialGradient(
            this.width / 2, this.height / 2, this.width / 3,
            this.width / 2, this.height / 2, this.width
        );
        vignette.addColorStop(0, 'transparent');
        vignette.addColorStop(0.8, 'transparent');
        vignette.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
        
        this.ctx.fillStyle = vignette;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Add title if provided
        if (title) {
            this.addTitle(title);
        }
        
        return this.canvas;
    }
    
    pickRandomStyle() {
        const styles = ['fluid', 'nebula', 'organic', 'energy'];
        return styles[Math.floor(Math.random() * styles.length)];
    }
    
    addTitle(title) {
        // Subtle gradient backdrop
        const gradient = this.ctx.createLinearGradient(
            0, this.height - 100, 0, this.height
        );
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, this.height - 100, this.width, 100);
        
        // Title with subtle glow
        this.ctx.save();
        this.ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
        this.ctx.shadowBlur = 5;
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

module.exports = RadArtworkGenerator;