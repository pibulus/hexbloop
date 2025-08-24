/**
 * @fileoverview Procedural artwork generator for Hexbloop
 * @author Hexbloop Audio Labs
 * @description Generates SVG-based procedural artwork based on band names and styles
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;

class ArtworkGenerator {
    constructor() {
        this.width = 1000;
        this.height = 1000;
        this.maxShapes = 30;
        
        // Color palettes for different moods (matching Swift version)
        this.darkPalette = [
            { r: 0.1, g: 0.0, b: 0.2 },
            { r: 0.3, g: 0.0, b: 0.3 },
            { r: 0.5, g: 0.0, b: 0.1 },
            { r: 0.0, g: 0.0, b: 0.0 },
            { r: 0.2, g: 0.1, b: 0.3 }
        ];
        
        this.brightPalette = [
            { r: 0.8, g: 0.2, b: 0.7 },
            { r: 0.9, g: 0.4, b: 0.3 },
            { r: 0.7, g: 0.8, b: 0.9 },
            { r: 0.5, g: 0.5, b: 1.0 },
            { r: 1.0, g: 0.8, b: 0.2 }
        ];
        
        this.naturalPalette = [
            { r: 0.0, g: 0.3, b: 0.6 }, // Deep blue
            { r: 0.6, g: 0.4, b: 0.2 }, // Earth brown
            { r: 0.2, g: 0.4, b: 0.2 }, // Forest green
            { r: 0.7, g: 0.7, b: 0.8 }, // Silver gray
            { r: 0.5, g: 0.3, b: 0.5 }  // Purple
        ];
    }
    
    /**
     * Convert color object to hex string
     */
    colorToHex(color) {
        const r = Math.round(color.r * 255);
        const g = Math.round(color.g * 255);
        const b = Math.round(color.b * 255);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    /**
     * Get random element from array
     */
    randomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    
    /**
     * Generate hexagon points
     */
    hexagonPoints(centerX, centerY, size) {
        const points = [
            [centerX, centerY - size/2],               // Top
            [centerX + size/2, centerY - size/4],      // Top right
            [centerX + size/2, centerY + size/4],      // Bottom right
            [centerX, centerY + size/2],               // Bottom
            [centerX - size/2, centerY + size/4],      // Bottom left
            [centerX - size/2, centerY - size/4]       // Top left
        ];
        
        return points.map(point => `${point[0]},${point[1]}`).join(' ');
    }
    
    /**
     * Generate star points
     */
    starPoints(centerX, centerY, size) {
        const outerRadius = size / 2;
        const innerRadius = outerRadius * 0.4;
        let points = [];
        
        for (let i = 0; i < 10; i++) {
            const angle = i * Math.PI / 5;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            points.push(`${Math.round(x)},${Math.round(y)}`);
        }
        
        return points.join(' ');
    }
    
    /**
     * Generate a random shape
     */
    generateRandomShape() {
        const shapeType = Math.floor(Math.random() * 5);
        const x = Math.floor(Math.random() * this.width);
        const y = Math.floor(Math.random() * this.height);
        const size = Math.floor(Math.random() * 250) + 50;
        const rotation = Math.floor(Math.random() * 360);
        const opacity = Math.random() * 0.6 + 0.2;
        
        // Determine color palette based on time of day
        const hourOfDay = new Date().getHours();
        let colors;
        
        if (hourOfDay >= 20 || hourOfDay < 6) {
            colors = this.darkPalette;
        } else if (hourOfDay >= 10 && hourOfDay < 16) {
            colors = this.brightPalette;
        } else {
            colors = this.naturalPalette;
        }
        
        const color = this.randomElement(colors);
        const colorString = this.colorToHex(color);
        
        let svg = '';
        
        switch (shapeType) {
            case 0: // Circle
                svg = `<circle cx="${x}" cy="${y}" r="${size/2}"
                        fill="${colorString}" opacity="${opacity}"
                        transform="rotate(${rotation} ${x} ${y})" />`;
                break;
            case 1: // Rectangle
                svg = `<rect x="${x - size/2}" y="${y - size/2}" width="${size}" height="${size}"
                      fill="${colorString}" opacity="${opacity}"
                      transform="rotate(${rotation} ${x} ${y})" />`;
                break;
            case 2: // Hexagon
                const hexPoints = this.hexagonPoints(x, y, size);
                svg = `<polygon points="${hexPoints}"
                         fill="${colorString}" opacity="${opacity}"
                         transform="rotate(${rotation} ${x} ${y})" />`;
                break;
            case 3: // Triangle
                const x1 = x;
                const y1 = y - size/2;
                const x2 = x - size/2;
                const y2 = y + size/2;
                const x3 = x + size/2;
                const y3 = y + size/2;
                svg = `<polygon points="${x1},${y1} ${x2},${y2} ${x3},${y3}"
                         fill="${colorString}" opacity="${opacity}"
                         transform="rotate(${rotation} ${x} ${y})" />`;
                break;
            case 4: // Star
                const starPoint = this.starPoints(x, y, size);
                svg = `<polygon points="${starPoint}"
                         fill="${colorString}" opacity="${opacity}"
                         transform="rotate(${rotation} ${x} ${y})" />`;
                break;
        }
        
        // Occasionally add a glitch effect
        if (Math.random() > 0.7) {
            svg = svg.replace('/>', ' filter="url(#glitch)" />');
        }
        
        return svg;
    }
    
    /**
     * Generate SVG filters for glitch effects
     */
    generateFilters() {
        const glitchDx = Math.floor(Math.random() * 20) - 10;
        const glitchDy = Math.floor(Math.random() * 16) - 8;
        const glitchBx = Math.floor(Math.random() * 12) - 6;
        const glitchBy = Math.floor(Math.random() * 12) - 6;
        const displacementScale = Math.floor(Math.random() * 10);
        
        return `
        <defs>
            <filter id="glitch" x="-20%" y="-20%" width="140%" height="140%">
                <feColorMatrix type="matrix"
                    values="1 0 0 0 0
                            0 1 0 0 0
                            0 0 1 0 0
                            0 0 0 1 0" result="r" />
                <feOffset in="r" dx="${glitchDx}" dy="0" result="r1" />
                <feColorMatrix in="SourceGraphic" type="matrix"
                    values="0 0 0 0 0
                            0 1 0 0 0
                            0 0 0 0 0
                            0 0 0 1 0" result="g" />
                <feOffset in="g" dx="0" dy="${glitchDy}" result="g1" />
                <feColorMatrix in="SourceGraphic" type="matrix"
                    values="0 0 0 0 0
                            0 0 0 0 0
                            0 0 1 0 0
                            0 0 0 1 0" result="b" />
                <feOffset in="b" dx="${glitchBx}" dy="${glitchBy}" result="b1" />
                <feBlend mode="normal" in="r1" in2="g1" result="rg" />
                <feBlend mode="normal" in="rg" in2="b1" result="rgb" />
                <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise" />
                <feDisplacementMap in="rgb" in2="noise" scale="${displacementScale}" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            
            <filter id="grain" x="0%" y="0%" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" result="noise"/>
                <feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.15 0" result="grainPattern"/>
                <feComposite operator="in" in="grainPattern" in2="SourceGraphic" result="grain"/>
                <feBlend mode="overlay" in="SourceGraphic" in2="grain" result="blend"/>
            </filter>
            
            <filter id="vignette">
                <feColorMatrix type="matrix" 
                    values="0.5 0 0 0 0
                            0 0.5 0 0 0
                            0 0 0.5 0 0
                            0 0 0 1 0" />
                <feGaussianBlur stdDeviation="50" result="blur" />
                <feBlend in="SourceGraphic" in2="blur" mode="multiply" />
            </filter>
            
            <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#000000" />
                <stop offset="100%" stop-color="#333333" />
            </linearGradient>
        </defs>`;
    }
    
    /**
     * Generate complete SVG artwork
     */
    generateSVG(bandName) {
        const numShapes = Math.floor(Math.random() * 15) + 15;
        const shapes = [];
        
        for (let i = 0; i < numShapes; i++) {
            shapes.push(this.generateRandomShape());
        }
        
        // Generate background gradient colors
        const bgColor1 = this.randomElement(this.darkPalette);
        const bgColor2 = this.randomElement(this.darkPalette);
        
        const bgColor1String = this.colorToHex(bgColor1);
        const bgColor2String = this.colorToHex(bgColor2);
        
        const svg = `<svg width="${this.width}" height="${this.height}" xmlns="http://www.w3.org/2000/svg">
            ${this.generateFilters()}
            
            <!-- Background -->
            <rect width="100%" height="100%" fill="black" />
            <rect width="100%" height="100%" fill="url(#bgGradient)" filter="url(#grain)" />
            
            <!-- Update gradient definition -->
            <defs>
                <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="${bgColor1String}" />
                    <stop offset="100%" stop-color="${bgColor2String}" />
                </linearGradient>
            </defs>
            
            <!-- Shapes -->
            ${shapes.join('\n            ')}
            
            <!-- Vignette effect -->
            <rect width="100%" height="100%" fill="none" filter="url(#vignette)" />
        </svg>`;
        
        return svg;
    }
    
    /**
     * Generate artwork and save to file (both SVG and PNG)
     */
    async generateArtwork(bandName, outputPath) {
        const svg = this.generateSVG(bandName);
        const fs = require('fs').promises;
        const path = require('path');
        
        try {
            // Save SVG
            await fs.writeFile(outputPath, svg, 'utf8');
            console.log(`✨ SVG artwork saved to: ${outputPath}`);
            
            // Convert to PNG using built-in macOS tools (no puppeteer needed!)
            const pngPath = outputPath.replace('.svg', '.png');
            try {
                await this.convertSvgToPng(outputPath, pngPath);
                console.log(`✨ PNG artwork saved to: ${pngPath}`);
            } catch (error) {
                console.log(`⚠️ PNG conversion failed, using SVG only: ${error.message}`);
            }
            
            return {
                svgPath: outputPath,
                pngPath: pngPath
            };
        } catch (error) {
            console.error(`❌ Error saving artwork: ${error.message}`);
            throw error;
        }
    }
    
    // Simple SVG to PNG conversion using macOS built-in tools
    async convertSvgToPng(svgPath, pngPath) {
        return new Promise((resolve, reject) => {
            // Use qlmanage (QuickLook) to convert SVG to PNG - built into macOS
            const process = spawn('qlmanage', ['-t', '-s', '800', '-o', require('path').dirname(pngPath), svgPath]);
            
            process.on('close', (code) => {
                if (code === 0) {
                    // qlmanage creates filename.svg.png, rename it
                    const qlPath = pngPath.replace('.png', '.svg.png');
                    require('fs').rename(qlPath, pngPath, (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                } else {
                    reject(new Error(`qlmanage failed with code ${code}`));
                }
            });
        });
    }
}

module.exports = ArtworkGenerator;