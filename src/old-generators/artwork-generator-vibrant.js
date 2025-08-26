const { createCanvas } = require('canvas');
const fs = require('fs').promises;
const path = require('path');

// ===================================================================
// 🎨 VIBRANT ARTWORK GENERATOR - Port of Swift's bright SVG approach
// ===================================================================

class VibrantArtworkGenerator {
    constructor() {
        this.width = 1000;
        this.height = 1000;
        this.canvas = createCanvas(this.width, this.height);
        this.ctx = this.canvas.getContext('2d');
        
        // Art Styles - matching Swift version
        this.styles = [
            'electronic',
            'synthwave',     // Changed from darkSynthwave - we want bright!
            'vaporwave',
            'cyberpunk',
            'lofi',
            'glitch',
            'sunset',        // New bright style
            'neon'          // New bright style
        ];
    }
    
    // ===================================================================
    // COLOR PALETTES - All bright and vibrant!
    // ===================================================================
    
    getPalette(style) {
        const palettes = {
            electronic: [
                '#FF006E',  // Hot pink
                '#FB5607',  // Orange
                '#FFBE0B',  // Yellow
                '#8338EC',  // Purple
                '#3A86FF'   // Blue
            ],
            
            synthwave: [
                '#FF10F0',  // Neon pink
                '#00FFF0',  // Cyan
                '#FF00AA',  // Magenta
                '#7700FF',  // Purple
                '#FF7700'   // Orange
            ],
            
            vaporwave: [
                '#FF6AD5',  // Bubble gum pink
                '#C774E8',  // Light purple
                '#AD8CFF',  // Lavender
                '#8795E8',  // Periwinkle
                '#94D0FF'   // Baby blue
            ],
            
            cyberpunk: [
                '#00FFFF',  // Neon cyan
                '#FF00FF',  // Hot magenta
                '#FFFF00',  // Bright yellow
                '#00FF00',  // Neon green
                '#FF0080'   // Pink
            ],
            
            lofi: [
                '#FFC6FF',  // Pastel pink
                '#BDB2FF',  // Pastel purple
                '#A0C4FF',  // Pastel blue
                '#CAFFBF',  // Pastel green
                '#FDFFB6'   // Pastel yellow
            ],
            
            glitch: [
                '#FF0000',  // Pure red
                '#00FF00',  // Pure green
                '#0000FF',  // Pure blue
                '#FFFF00',  // Yellow
                '#FF00FF'   // Magenta
            ],
            
            sunset: [
                '#FFD60A',  // Sun yellow
                '#FEB237',  // Orange
                '#FD6A6A',  // Coral
                '#9B5DE5',  // Purple
                '#00BBF9'   // Sky blue
            ],
            
            neon: [
                '#DFFF00',  // Lime
                '#FF1493',  // Deep pink
                '#00CED1',  // Dark turquoise
                '#FF4500',  // Orange red
                '#9370DB'   // Medium purple
            ]
        };
        
        return palettes[style] || palettes.electronic;
    }
    
    // ===================================================================
    // BACKGROUND GRADIENTS - No more solid black!
    // ===================================================================
    
    drawBackground(style) {
        const gradient = this.ctx.createLinearGradient(0, 0, this.width, this.height);
        
        switch(style) {
            case 'synthwave':
                gradient.addColorStop(0, '#240046');    // Deep purple
                gradient.addColorStop(0.5, '#3C096C');  // Purple
                gradient.addColorStop(1, '#7209B7');    // Bright purple
                break;
                
            case 'vaporwave':
                gradient.addColorStop(0, '#FFB3E6');    // Light pink
                gradient.addColorStop(0.5, '#C8B6FF');  // Lavender
                gradient.addColorStop(1, '#B8E7FC');    // Light blue
                break;
                
            case 'cyberpunk':
                gradient.addColorStop(0, '#0A0E27');    // Dark blue
                gradient.addColorStop(0.5, '#1A0B5B');  // Purple dark
                gradient.addColorStop(1, '#3D087B');    // Purple
                break;
                
            case 'sunset':
                gradient.addColorStop(0, '#FFE5B4');    // Peach
                gradient.addColorStop(0.3, '#FFCAB0');  // Coral
                gradient.addColorStop(0.6, '#FF8C94');  // Pink
                gradient.addColorStop(1, '#8E7CC3');    // Purple
                break;
                
            case 'neon':
                gradient.addColorStop(0, '#000428');    // Dark blue
                gradient.addColorStop(1, '#004E92');    // Blue
                break;
                
            default:
                gradient.addColorStop(0, '#667EEA');    // Purple blue
                gradient.addColorStop(1, '#764BA2');    // Purple
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    // ===================================================================
    // SHAPE GENERATORS - Ported from Swift
    // ===================================================================
    
    drawShape(type, x, y, size, rotation, color, opacity = 0.8) {
        this.ctx.save();
        this.ctx.globalAlpha = opacity;
        this.ctx.translate(x, y);
        this.ctx.rotate(rotation * Math.PI / 180);
        
        // Create gradient for shape
        const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, size);
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.7, color + '88'); // Add transparency
        gradient.addColorStop(1, 'transparent');
        
        this.ctx.fillStyle = gradient;
        
        switch(type) {
            case 'circle':
                this.ctx.beginPath();
                this.ctx.arc(0, 0, size/2, 0, Math.PI * 2);
                this.ctx.fill();
                break;
                
            case 'hexagon':
                this.drawHexagon(size);
                break;
                
            case 'triangle':
                this.drawTriangle(size);
                break;
                
            case 'star':
                this.drawStar(size);
                break;
                
            case 'diamond':
                this.drawDiamond(size);
                break;
                
            case 'crescent':
                this.drawCrescent(size);
                break;
                
            case 'cross':
                this.drawCross(size);
                break;
                
            default:
                // Default to circle
                this.ctx.beginPath();
                this.ctx.arc(0, 0, size/2, 0, Math.PI * 2);
                this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    drawHexagon(size) {
        this.ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const x = Math.cos(angle) * size/2;
            const y = Math.sin(angle) * size/2;
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    drawTriangle(size) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, -size/2);
        this.ctx.lineTo(-size/2, size/2);
        this.ctx.lineTo(size/2, size/2);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    drawStar(size) {
        const outerRadius = size/2;
        const innerRadius = outerRadius * 0.4;
        
        this.ctx.beginPath();
        for (let i = 0; i < 10; i++) {
            const angle = (Math.PI / 5) * i;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = Math.cos(angle - Math.PI/2) * radius;
            const y = Math.sin(angle - Math.PI/2) * radius;
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    drawDiamond(size) {
        const halfSize = size/2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -halfSize);
        this.ctx.lineTo(halfSize, 0);
        this.ctx.lineTo(0, halfSize);
        this.ctx.lineTo(-halfSize, 0);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    drawCrescent(size) {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, size/2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Cut out with another circle
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.beginPath();
        this.ctx.arc(size/4, 0, size/2.5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalCompositeOperation = 'source-over';
    }
    
    drawCross(size) {
        const thickness = size/6;
        const halfSize = size/2;
        
        this.ctx.fillRect(-thickness/2, -halfSize, thickness, size);
        this.ctx.fillRect(-halfSize, -thickness/2, size, thickness);
    }
    
    // ===================================================================
    // GLOW EFFECTS
    // ===================================================================
    
    addGlow(x, y, radius, color) {
        const glow = this.ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
        
        // Parse hex color to get brighter version
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        
        glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1)`);
        glow.addColorStop(0.2, `rgba(${r}, ${g}, ${b}, 0.8)`);
        glow.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.4)`);
        glow.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen'; // Additive blending for glow
        this.ctx.fillStyle = glow;
        this.ctx.fillRect(x - radius * 2, y - radius * 2, radius * 4, radius * 4);
        this.ctx.restore();
    }
    
    // ===================================================================
    // FILTERS & EFFECTS
    // ===================================================================
    
    applyFilter(style) {
        switch(style) {
            case 'glitch':
                this.applyGlitchEffect();
                break;
                
            case 'vaporwave':
                this.applyVaporwaveGrid();
                break;
                
            case 'synthwave':
                this.applySynthwaveGrid();
                break;
        }
        
        // Add subtle grain to all styles
        this.addGrain(0.02);
    }
    
    applyGlitchEffect() {
        // RGB shift effect
        const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
        const data = imageData.data;
        const shift = 10;
        
        // Shift red channel
        for (let i = 0; i < data.length; i += 4) {
            const shiftedIndex = i + shift * 4;
            if (shiftedIndex < data.length) {
                data[i] = data[shiftedIndex]; // Red channel
            }
        }
        
        this.ctx.putImageData(imageData, 0, 0);
        
        // Add scanlines
        this.ctx.save();
        this.ctx.globalAlpha = 0.1;
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 1;
        for (let y = 0; y < this.height; y += 4) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
        this.ctx.restore();
    }
    
    applyVaporwaveGrid() {
        this.ctx.save();
        this.ctx.globalAlpha = 0.3;
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 1;
        
        // Horizontal lines
        for (let i = 0; i <= 10; i++) {
            const y = i * (this.height / 10);
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
        
        // Vertical lines
        for (let i = 0; i <= 10; i++) {
            const x = i * (this.width / 10);
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
    
    applySynthwaveGrid() {
        // Perspective grid at bottom
        this.ctx.save();
        this.ctx.globalAlpha = 0.4;
        this.ctx.strokeStyle = '#FF00FF';
        this.ctx.lineWidth = 2;
        
        const horizon = this.height * 0.7;
        const centerX = this.width / 2;
        
        // Horizontal lines
        for (let i = 0; i <= 20; i++) {
            const y = horizon + i * ((this.height - horizon) / 20);
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
        
        // Perspective lines
        for (let i = -10; i <= 10; i++) {
            const x1 = centerX + i * 100;
            const x2 = centerX + i * 50;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x1, this.height);
            this.ctx.lineTo(x2, horizon);
            this.ctx.stroke();
        }
        
        // Sun/moon
        const sunGradient = this.ctx.createRadialGradient(
            centerX, horizon - 100, 0,
            centerX, horizon - 100, 150
        );
        sunGradient.addColorStop(0, '#FFFF00');
        sunGradient.addColorStop(0.5, '#FF00FF');
        sunGradient.addColorStop(1, 'transparent');
        
        this.ctx.fillStyle = sunGradient;
        this.ctx.fillRect(centerX - 150, horizon - 250, 300, 300);
        
        this.ctx.restore();
    }
    
    addGrain(opacity = 0.05) {
        const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 255 * opacity;
            data[i] = Math.max(0, Math.min(255, data[i] + noise));     // Red
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)); // Green
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)); // Blue
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }
    
    // ===================================================================
    // MAIN GENERATION
    // ===================================================================
    
    async generate(options = {}) {
        const {
            style = this.styles[Math.floor(Math.random() * this.styles.length)],
            seed = Date.now(),
            audioFeatures = null,
            title = ''
        } = options;
        
        // Use seed for reproducible randomness
        this.seed = seed;
        this.random = () => {
            this.seed = (this.seed * 1664525 + 1013904223) % 2147483647;
            return this.seed / 2147483647;
        };
        
        // Clear canvas and draw gradient background
        this.drawBackground(style);
        
        // Get palette for this style
        const palette = this.getPalette(style);
        
        // Generate shapes based on style
        const shapeCount = style === 'lofi' ? 10 : 20 + Math.floor(this.random() * 20);
        const shapeTypes = ['circle', 'hexagon', 'triangle', 'star', 'diamond', 'crescent', 'cross'];
        
        for (let i = 0; i < shapeCount; i++) {
            const shapeType = shapeTypes[Math.floor(this.random() * shapeTypes.length)];
            const x = this.random() * this.width;
            const y = this.random() * this.height;
            const size = 50 + this.random() * 200;
            const rotation = this.random() * 360;
            const color = palette[Math.floor(this.random() * palette.length)];
            const opacity = 0.3 + this.random() * 0.5;
            
            this.drawShape(shapeType, x, y, size, rotation, color, opacity);
            
            // Add glow to some shapes
            if (this.random() > 0.6) {
                this.addGlow(x, y, size/2, color);
            }
        }
        
        // Apply style-specific filters
        this.applyFilter(style);
        
        // Add title if provided
        if (title) {
            this.ctx.save();
            this.ctx.font = 'bold 20px monospace';
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(title, this.width/2, this.height - 30);
            this.ctx.restore();
        }
        
        return this.canvas;
    }
    
    async saveToFile(outputPath) {
        const buffer = this.canvas.toBuffer('image/png');
        await fs.writeFile(outputPath, buffer);
        return outputPath;
    }
}

module.exports = VibrantArtworkGenerator;