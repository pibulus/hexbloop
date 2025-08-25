/**
 * @fileoverview Enhanced procedural artwork generator for Hexbloop
 * @author Hexbloop Audio Labs
 * @description Advanced SVG generator with style harmony, organic shapes, and golden ratio composition
 * 
 * KEY ENHANCEMENTS:
 * - 12 distinct art styles with unique aesthetics
 * - Color harmony system (analogous, complementary, triadic)
 * - Organic blob shapes and flow fields
 * - Golden ratio composition and fibonacci spirals
 * - Layering system with depth perception
 * - Texture overlays (grain, crosshatch, dots)
 * - Moon phase influence on generation
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;

class EnhancedArtworkGenerator {
    constructor() {
        this.width = 1000;
        this.height = 1000;
        this.phi = 1.618033988749895; // Golden ratio
        
        // Art styles with distinct personalities
        this.styles = {
            'cosmic': {
                name: 'Cosmic Nebula',
                description: 'Deep space with nebulas and stars',
                shapePreference: ['circle', 'blob', 'star'],
                colorScheme: 'analogous',
                layerCount: [20, 35],
                opacity: [0.4, 0.8],
                blur: true,
                grain: 0.2
            },
            'organic': {
                name: 'Organic Flow',
                description: 'Natural flowing forms and curves',
                shapePreference: ['blob', 'wave', 'spiral'],
                colorScheme: 'triadic',
                layerCount: [15, 25],
                opacity: [0.2, 0.6],
                blur: false,
                grain: 0.1
            },
            'geometric': {
                name: 'Sacred Geometry',
                description: 'Precise geometric patterns with golden ratio',
                shapePreference: ['hexagon', 'triangle', 'mandala'],
                colorScheme: 'complementary',
                layerCount: [10, 20],
                opacity: [0.3, 0.7],
                blur: false,
                grain: 0.05
            },
            'glitch': {
                name: 'Digital Glitch',
                description: 'Corrupted digital aesthetics',
                shapePreference: ['rectangle', 'line', 'fragment'],
                colorScheme: 'split-complementary',
                layerCount: [25, 40],
                opacity: [0.4, 0.9],
                blur: false,
                grain: 0.3,
                glitchAmount: 0.8
            },
            'watercolor': {
                name: 'Watercolor Dreams',
                description: 'Soft, bleeding watercolor effects',
                shapePreference: ['blob', 'circle', 'wave'],
                colorScheme: 'analogous',
                layerCount: [8, 15],
                opacity: [0.1, 0.3],
                blur: true,
                grain: 0.15,
                bleed: true
            },
            'crystalline': {
                name: 'Crystal Formation',
                description: 'Faceted crystal structures',
                shapePreference: ['diamond', 'triangle', 'shard'],
                colorScheme: 'monochromatic',
                layerCount: [15, 30],
                opacity: [0.2, 0.8],
                blur: false,
                grain: 0.1,
                refraction: true
            },
            'retro': {
                name: 'Retro Wave',
                description: '80s synthwave aesthetics',
                shapePreference: ['grid', 'sun', 'mountain'],
                colorScheme: 'neon',
                layerCount: [10, 20],
                opacity: [0.5, 1.0],
                blur: false,
                grain: 0.2,
                scanlines: true
            },
            'minimal': {
                name: 'Minimal Zen',
                description: 'Clean, minimal compositions',
                shapePreference: ['circle', 'line', 'dot'],
                colorScheme: 'monochromatic',
                layerCount: [3, 8],
                opacity: [0.3, 0.9],
                blur: false,
                grain: 0.02
            },
            'aurora': {
                name: 'Aurora Borealis',
                description: 'Northern lights flowing patterns',
                shapePreference: ['wave', 'ribbon', 'gradient'],
                colorScheme: 'aurora',
                layerCount: [5, 12],
                opacity: [0.2, 0.5],
                blur: true,
                grain: 0.1,
                glow: true
            },
            'botanical': {
                name: 'Botanical Garden',
                description: 'Organic plant-like growth patterns',
                shapePreference: ['leaf', 'branch', 'petal'],
                colorScheme: 'earthy',
                layerCount: [20, 35],
                opacity: [0.3, 0.7],
                blur: false,
                grain: 0.08
            },
            'liquid': {
                name: 'Liquid Metal',
                description: 'Flowing metallic surfaces',
                shapePreference: ['blob', 'wave', 'droplet'],
                colorScheme: 'metallic',
                layerCount: [10, 18],
                opacity: [0.4, 0.8],
                blur: true,
                grain: 0.05,
                reflection: true
            },
            'mandala': {
                name: 'Sacred Mandala',
                description: 'Symmetrical spiritual patterns',
                shapePreference: ['mandala', 'lotus', 'star'],
                colorScheme: 'chakra',
                layerCount: [1, 1],
                opacity: [0.8, 1.0],
                blur: false,
                grain: 0.03,
                symmetry: 8
            }
        };
        
        // Color harmony generator
        this.colorHarmony = {
            analogous: (base) => {
                const h = base.h;
                return [
                    base,
                    { h: (h + 30) % 360, s: base.s, l: base.l },
                    { h: (h - 30 + 360) % 360, s: base.s, l: base.l },
                    { h: (h + 15) % 360, s: base.s * 0.8, l: base.l * 1.1 },
                    { h: (h - 15 + 360) % 360, s: base.s * 0.8, l: base.l * 0.9 }
                ];
            },
            complementary: (base) => {
                const h = base.h;
                return [
                    base,
                    { h: (h + 180) % 360, s: base.s, l: base.l },
                    { h: h, s: base.s * 0.5, l: base.l * 1.2 },
                    { h: (h + 180) % 360, s: base.s * 0.5, l: base.l * 0.8 },
                    { h: h, s: base.s * 0.3, l: base.l * 0.6 }
                ];
            },
            triadic: (base) => {
                const h = base.h;
                return [
                    base,
                    { h: (h + 120) % 360, s: base.s, l: base.l },
                    { h: (h + 240) % 360, s: base.s, l: base.l },
                    { h: h, s: base.s * 0.7, l: base.l * 1.1 },
                    { h: (h + 120) % 360, s: base.s * 0.7, l: base.l * 0.9 }
                ];
            },
            'split-complementary': (base) => {
                const h = base.h;
                return [
                    base,
                    { h: (h + 150) % 360, s: base.s, l: base.l },
                    { h: (h + 210) % 360, s: base.s, l: base.l },
                    { h: h, s: base.s * 0.6, l: base.l * 1.2 },
                    { h: (h + 180) % 360, s: base.s * 0.4, l: base.l * 0.7 }
                ];
            },
            monochromatic: (base) => {
                return [
                    base,
                    { h: base.h, s: base.s * 0.7, l: base.l * 1.3 },
                    { h: base.h, s: base.s * 0.5, l: base.l * 0.8 },
                    { h: base.h, s: base.s * 0.3, l: base.l * 1.5 },
                    { h: base.h, s: base.s * 0.9, l: base.l * 0.5 }
                ];
            },
            neon: () => {
                return [
                    { h: 300, s: 100, l: 50 }, // Magenta
                    { h: 180, s: 100, l: 50 }, // Cyan
                    { h: 60, s: 100, l: 50 },  // Yellow
                    { h: 270, s: 100, l: 50 }, // Purple
                    { h: 120, s: 100, l: 50 }  // Green
                ];
            },
            aurora: () => {
                return [
                    { h: 120, s: 70, l: 50 }, // Green
                    { h: 180, s: 60, l: 60 }, // Cyan
                    { h: 270, s: 50, l: 55 }, // Purple
                    { h: 90, s: 60, l: 65 },  // Yellow-green
                    { h: 210, s: 55, l: 50 }  // Blue
                ];
            },
            earthy: () => {
                return [
                    { h: 30, s: 40, l: 35 },  // Brown
                    { h: 90, s: 30, l: 40 },  // Olive
                    { h: 25, s: 50, l: 50 },  // Sienna
                    { h: 120, s: 25, l: 35 }, // Forest
                    { h: 40, s: 35, l: 60 }   // Sand
                ];
            },
            metallic: () => {
                return [
                    { h: 40, s: 15, l: 70 },  // Gold
                    { h: 0, s: 5, l: 75 },    // Silver
                    { h: 30, s: 25, l: 40 },  // Bronze
                    { h: 200, s: 10, l: 60 }, // Steel blue
                    { h: 20, s: 30, l: 50 }   // Copper
                ];
            },
            chakra: () => {
                return [
                    { h: 0, s: 70, l: 45 },   // Root red
                    { h: 30, s: 80, l: 50 },  // Sacral orange
                    { h: 60, s: 70, l: 55 },  // Solar yellow
                    { h: 120, s: 60, l: 45 }, // Heart green
                    { h: 240, s: 65, l: 50 }  // Throat blue
                ];
            }
        };
    }
    
    // ===================================================================
    // COLOR UTILITIES
    // ===================================================================
    
    hslToHex(h, s, l) {
        s /= 100;
        l /= 100;
        
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c/2;
        let r = 0, g = 0, b = 0;
        
        if (0 <= h && h < 60) {
            r = c; g = x; b = 0;
        } else if (60 <= h && h < 120) {
            r = x; g = c; b = 0;
        } else if (120 <= h && h < 180) {
            r = 0; g = c; b = x;
        } else if (180 <= h && h < 240) {
            r = 0; g = x; b = c;
        } else if (240 <= h && h < 300) {
            r = x; g = 0; b = c;
        } else if (300 <= h && h < 360) {
            r = c; g = 0; b = x;
        }
        
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    generateColorPalette(styleName, moonPhase = 0.5) {
        const style = this.styles[styleName];
        
        // Base color influenced by moon phase - more vibrant
        const baseHue = (moonPhase * 240 + 180) % 360; // Blue to purple range
        const baseSat = 70 + moonPhase * 20; // Higher saturation
        const baseLum = 45 + moonPhase * 15; // Brighter colors
        
        const baseColor = { h: baseHue, s: baseSat, l: baseLum };
        
        // Get harmony colors
        const harmonyFn = this.colorHarmony[style.colorScheme];
        const colors = harmonyFn ? harmonyFn(baseColor) : [baseColor];
        
        return colors.map(c => this.hslToHex(c.h, c.s, c.l));
    }
    
    // ===================================================================
    // ORGANIC SHAPE GENERATORS
    // ===================================================================
    
    generateBlob(x, y, size) {
        const points = [];
        const segments = 8;
        const angleStep = (Math.PI * 2) / segments;
        
        for (let i = 0; i < segments; i++) {
            const angle = i * angleStep;
            const radius = size/2 + (Math.random() - 0.5) * size * 0.3;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            points.push([px, py]);
        }
        
        // Create smooth curve through points
        let path = `M ${points[0][0]},${points[0][1]} `;
        
        for (let i = 0; i < points.length; i++) {
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];
            const p3 = points[(i + 2) % points.length];
            
            const cp1x = p1[0] + (p2[0] - p1[0]) * 0.5;
            const cp1y = p1[1] + (p2[1] - p1[1]) * 0.5;
            const cp2x = p2[0] + (p3[0] - p2[0]) * 0.5;
            const cp2y = p2[1] + (p3[1] - p2[1]) * 0.5;
            
            path += `C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]} `;
        }
        
        path += 'Z';
        return path;
    }
    
    generateWave(x, y, width, amplitude) {
        const points = [];
        const steps = 20;
        
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const px = x + t * width;
            const py = y + Math.sin(t * Math.PI * 2) * amplitude;
            points.push(`${px},${py}`);
        }
        
        return `M ${points.join(' L ')}`;
    }
    
    generateSpiral(x, y, maxRadius) {
        const points = [];
        const rotations = 3;
        const steps = 50;
        
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const angle = t * Math.PI * 2 * rotations;
            const radius = t * maxRadius;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            points.push(`${px},${py}`);
        }
        
        return `M ${points.join(' L ')}`;
    }
    
    generateMandala(x, y, size, petals = 8) {
        let path = '';
        const petalSize = size / 3;
        
        for (let i = 0; i < petals; i++) {
            const angle = (i / petals) * Math.PI * 2;
            const px = x + Math.cos(angle) * size/2;
            const py = y + Math.sin(angle) * size/2;
            
            // Create petal shape
            path += `<ellipse cx="${px}" cy="${py}" 
                     rx="${petalSize}" ry="${petalSize/2}"
                     transform="rotate(${angle * 180 / Math.PI} ${px} ${py})" />`;
        }
        
        // Add center circle
        path += `<circle cx="${x}" cy="${y}" r="${size/4}" />`;
        
        return path;
    }
    
    generateLeaf(x, y, size) {
        const width = size / 3;
        const height = size;
        
        const path = `M ${x},${y} 
                      Q ${x - width/2},${y - height/3} ${x},${y - height/2}
                      Q ${x + width/2},${y - height/3} ${x},${y}
                      Q ${x - width/3},${y - height/4} ${x},${y - height/2}`;
        
        return path;
    }
    
    // ===================================================================
    // GOLDEN RATIO COMPOSITION
    // ===================================================================
    
    getGoldenPoints() {
        const points = [];
        
        // Golden ratio grid points
        const x1 = this.width / this.phi;
        const x2 = this.width - x1;
        const y1 = this.height / this.phi;
        const y2 = this.height - y1;
        
        points.push(
            { x: x1, y: y1, weight: 1.0 },  // Primary golden point
            { x: x2, y: y1, weight: 0.8 },
            { x: x1, y: y2, weight: 0.8 },
            { x: x2, y: y2, weight: 0.6 },
            { x: this.width/2, y: y1, weight: 0.5 },
            { x: x1, y: this.height/2, weight: 0.5 }
        );
        
        return points;
    }
    
    getFibonacciSpiral(centerX, centerY, scale = 1) {
        const fib = [1, 1, 2, 3, 5, 8, 13, 21, 34];
        let path = '';
        let x = centerX;
        let y = centerY;
        let direction = 0; // 0: right, 1: down, 2: left, 3: up
        
        fib.forEach((n, i) => {
            const size = n * scale * 5;
            
            // Draw arc for this fibonacci square
            const startAngle = direction * 90;
            const endAngle = startAngle + 90;
            
            // Calculate arc center based on direction
            let cx = x, cy = y;
            switch(direction) {
                case 0: cx = x - size; cy = y - size; break;
                case 1: cx = x + size; cy = y - size; break;
                case 2: cx = x + size; cy = y + size; break;
                case 3: cx = x - size; cy = y + size; break;
            }
            
            // Move to next position
            switch(direction) {
                case 0: x += size; break;
                case 1: y += size; break;
                case 2: x -= size; break;
                case 3: y -= size; break;
            }
            
            direction = (direction + 1) % 4;
            
            // Create arc path
            const rad1 = startAngle * Math.PI / 180;
            const rad2 = endAngle * Math.PI / 180;
            const x1 = cx + Math.cos(rad1) * size;
            const y1 = cy + Math.sin(rad1) * size;
            const x2 = cx + Math.cos(rad2) * size;
            const y2 = cy + Math.sin(rad2) * size;
            
            if (i === 0) {
                path += `M ${x1},${y1} `;
            }
            path += `A ${size},${size} 0 0,1 ${x2},${y2} `;
        });
        
        return path;
    }
    
    // ===================================================================
    // TEXTURE GENERATORS
    // ===================================================================
    
    generateGrainTexture(opacity = 0.1) {
        return `
        <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/>
            <feColorMatrix type="saturate" values="0"/>
            <feComponentTransfer>
                <feFuncA type="discrete" tableValues="0 .5 .5 .5 .5 .5 .5 .5 .5 .5 .5 .5 .5 .5 .5 .5 1"/>
            </feComponentTransfer>
            <feComponentTransfer>
                <feFuncA type="table" tableValues="0 ${opacity}"/>
            </feComponentTransfer>
            <feComposite operator="over" in2="SourceGraphic"/>
        </filter>`;
    }
    
    generateCrosshatchTexture(spacing = 5) {
        return `
        <pattern id="crosshatch" patternUnits="userSpaceOnUse" width="${spacing*2}" height="${spacing*2}">
            <line x1="0" y1="0" x2="${spacing*2}" y2="${spacing*2}" stroke="white" stroke-width="0.5" opacity="0.1"/>
            <line x1="${spacing*2}" y1="0" x2="0" y2="${spacing*2}" stroke="white" stroke-width="0.5" opacity="0.1"/>
        </pattern>`;
    }
    
    // ===================================================================
    // MAIN GENERATION
    // ===================================================================
    
    generateShapeForStyle(style, x, y, size, color, opacity) {
        const shapeTypes = style.shapePreference;
        const shapeType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
        const rotation = Math.random() * 360;
        
        let element = '';
        
        switch(shapeType) {
            case 'blob':
                const blobPath = this.generateBlob(x, y, size);
                element = `<path d="${blobPath}" fill="${color}" opacity="${opacity}" 
                          transform="rotate(${rotation} ${x} ${y})"/>`;
                break;
                
            case 'wave':
                const wavePath = this.generateWave(x - size/2, y, size, size/4);
                element = `<path d="${wavePath}" stroke="${color}" fill="none" 
                          stroke-width="${size/20}" opacity="${opacity}"/>`;
                break;
                
            case 'spiral':
                const spiralPath = this.generateSpiral(x, y, size/2);
                element = `<path d="${spiralPath}" stroke="${color}" fill="none" 
                          stroke-width="${size/40}" opacity="${opacity}"/>`;
                break;
                
            case 'mandala':
                element = `<g fill="${color}" opacity="${opacity}" 
                          transform="rotate(${rotation} ${x} ${y})">
                          ${this.generateMandala(x, y, size)}
                          </g>`;
                break;
                
            case 'leaf':
                const leafPath = this.generateLeaf(x, y, size);
                element = `<path d="${leafPath}" fill="${color}" opacity="${opacity}" 
                          transform="rotate(${rotation} ${x} ${y})"/>`;
                break;
                
            case 'hexagon':
                const hexPoints = this.hexagonPoints(x, y, size);
                element = `<polygon points="${hexPoints}" fill="${color}" opacity="${opacity}" 
                          transform="rotate(${rotation} ${x} ${y})"/>`;
                break;
                
            case 'circle':
                element = `<circle cx="${x}" cy="${y}" r="${size/2}" fill="${color}" opacity="${opacity}"/>`;
                break;
                
            case 'star':
                const starPoints = this.starPoints(x, y, size);
                element = `<polygon points="${starPoints}" fill="${color}" opacity="${opacity}" 
                          transform="rotate(${rotation} ${x} ${y})"/>`;
                break;
                
            default:
                element = `<rect x="${x - size/2}" y="${y - size/2}" width="${size}" height="${size}" 
                          fill="${color}" opacity="${opacity}" transform="rotate(${rotation} ${x} ${y})"/>`;
        }
        
        return element;
    }
    
    hexagonPoints(centerX, centerY, size) {
        const points = [];
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
            const x = centerX + Math.cos(angle) * size/2;
            const y = centerY + Math.sin(angle) * size/2;
            points.push(`${x},${y}`);
        }
        return points.join(' ');
    }
    
    starPoints(centerX, centerY, size) {
        const points = [];
        const outerRadius = size / 2;
        const innerRadius = outerRadius * 0.382; // Golden ratio
        
        for (let i = 0; i < 10; i++) {
            const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            points.push(`${x},${y}`);
        }
        return points.join(' ');
    }
    
    generateBackground(style, colors) {
        const gradientType = Math.random() > 0.5 ? 'linear' : 'radial';
        const gradientId = `bg_${Date.now()}`;
        
        // Ensure we have valid colors, fallback if needed
        const bgColors = colors.length >= 3 ? colors : [...colors, '#4a1e5c', '#1a0033'];
        
        let gradient = '';
        if (gradientType === 'linear') {
            const angle = Math.random() * 360;
            gradient = `
            <linearGradient id="${gradientId}" gradientTransform="rotate(${angle} 0.5 0.5)">
                <stop offset="0%" stop-color="${bgColors[0]}" />
                <stop offset="50%" stop-color="${bgColors[1]}" />
                <stop offset="100%" stop-color="${bgColors[2] || bgColors[0]}" />
            </linearGradient>`;
        } else {
            gradient = `
            <radialGradient id="${gradientId}" cx="50%" cy="50%" r="70%">
                <stop offset="0%" stop-color="${bgColors[1] || '#664488'}" />
                <stop offset="60%" stop-color="${bgColors[0] || '#332244'}" />
                <stop offset="100%" stop-color="${bgColors[2] || '#110022'}" />
            </radialGradient>`;
        }
        
        return `
        ${gradient}
        <!-- Solid base color for safety -->
        <rect width="100%" height="100%" fill="#1a0033"/>
        <rect width="100%" height="100%" fill="url(#${gradientId})"/>
        `;
    }
    
    generateStyleEffects(style) {
        let effects = '';
        
        if (style.scanlines) {
            effects += `
            <pattern id="scanlines" patternUnits="userSpaceOnUse" width="100" height="4">
                <line x1="0" y1="0" x2="100" y2="0" stroke="white" stroke-width="1" opacity="0.1"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#scanlines)"/>`;
        }
        
        if (style.glow) {
            effects += `
            <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>`;
        }
        
        if (style.refraction) {
            effects += `
            <filter id="refraction">
                <feTurbulence type="turbulence" baseFrequency="0.01" numOctaves="2" result="turbulence"/>
                <feDisplacementMap in2="turbulence" in="SourceGraphic" scale="10" xChannelSelector="R" yChannelSelector="G"/>
            </filter>`;
        }
        
        return effects;
    }
    
    generateEnhancedSVG(bandName, styleName = null, moonPhase = 0.5) {
        // Auto-select style based on band name hash if not provided
        if (!styleName) {
            const styles = Object.keys(this.styles);
            const hash = bandName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            styleName = styles[hash % styles.length];
        }
        
        const style = this.styles[styleName];
        const colors = this.generateColorPalette(styleName, moonPhase);
        const goldenPoints = this.getGoldenPoints();
        
        // Determine layer count
        const layerCount = Math.floor(
            Math.random() * (style.layerCount[1] - style.layerCount[0]) + style.layerCount[0]
        );
        
        // Generate layers with depth
        let shapes = '';
        for (let layer = 0; layer < layerCount; layer++) {
            const depth = layer / layerCount; // 0 = back, 1 = front
            
            // Use golden ratio points for important elements
            let x, y;
            if (layer < goldenPoints.length && Math.random() > 0.3) {
                const point = goldenPoints[layer % goldenPoints.length];
                x = point.x + (Math.random() - 0.5) * 100;
                y = point.y + (Math.random() - 0.5) * 100;
            } else {
                x = Math.random() * this.width;
                y = Math.random() * this.height;
            }
            
            const size = (50 + Math.random() * 200) * (1 - depth * 0.3); // Smaller in back
            const color = colors[Math.floor(Math.random() * colors.length)];
            // Increase base opacity significantly
            const baseOpacity = 0.6 + Math.random() * 0.4; // 0.6 to 1.0
            const adjustedOpacity = baseOpacity * (0.7 + depth * 0.3); // Less fade in back
            
            shapes += this.generateShapeForStyle(style, x, y, size, color, adjustedOpacity);
            shapes += '\n';
        }
        
        // Add special composition elements
        if (styleName === 'mandala' && style.symmetry) {
            const centerX = this.width / 2;
            const centerY = this.height / 2;
            const mainSize = Math.min(this.width, this.height) * 0.8;
            shapes = `<g fill="${colors[0]}" opacity="0.9">
                     ${this.generateMandala(centerX, centerY, mainSize, style.symmetry)}
                     </g>`;
        }
        
        // Generate filters
        const filters = `
        ${this.generateGrainTexture(style.grain)}
        ${this.generateCrosshatchTexture()}
        ${this.generateStyleEffects(style)}
        
        <filter id="vignette">
            <feGaussianBlur in="SourceGraphic" stdDeviation="150"/>
            <feComponentTransfer>
                <feFuncA type="table" tableValues="0 0.2 0.5 0.7 0.8 0.85 0.9 0.95 1"/>
            </feComponentTransfer>
        </filter>
        
        <filter id="blur">
            <feGaussianBlur stdDeviation="2"/>
        </filter>
        `;
        
        // Build final SVG
        const svg = `<svg width="${this.width}" height="${this.height}" xmlns="http://www.w3.org/2000/svg">
            <!-- Filters -->
            <defs>
                ${filters}
            </defs>
            
            <!-- Background -->
            ${this.generateBackground(style, colors)}
            
            <!-- Main composition -->
            <g ${style.blur ? 'filter="url(#blur)"' : ''}>
                ${shapes}
            </g>
            
            <!-- Grain overlay -->
            <rect width="100%" height="100%" filter="url(#grain)"/>
            
            <!-- Vignette -->
            <rect width="100%" height="100%" fill="black" filter="url(#vignette)" opacity="0.4"/>
            
            <!-- Style name watermark -->
            <text x="20" y="${this.height - 20}" font-family="monospace" font-size="10" fill="white" opacity="0.3">
                ${style.name} • ${bandName}
            </text>
        </svg>`;
        
        return svg;
    }
    
    // ===================================================================
    // FILE OPERATIONS
    // ===================================================================
    
    async generateArtwork(bandName, outputPath, options = {}) {
        const { 
            style = null, 
            moonPhase = 0.5,
            format = 'both' // 'svg', 'png', or 'both'
        } = options;
        
        const svg = this.generateEnhancedSVG(bandName, style, moonPhase);
        const path = require('path');
        
        try {
            // Always save SVG
            await fs.writeFile(outputPath, svg, 'utf8');
            console.log(`✨ Enhanced SVG artwork saved to: ${outputPath}`);
            
            // Convert to PNG if requested
            if (format === 'png' || format === 'both') {
                const pngPath = outputPath.replace('.svg', '.png');
                try {
                    await this.convertSvgToPng(outputPath, pngPath);
                    console.log(`✨ PNG artwork saved to: ${pngPath}`);
                } catch (error) {
                    console.log(`⚠️ PNG conversion failed, using SVG only: ${error.message}`);
                }
            }
            
            return {
                svgPath: outputPath,
                pngPath: format !== 'svg' ? outputPath.replace('.svg', '.png') : null,
                style: style || 'auto-selected',
                moonPhase
            };
        } catch (error) {
            console.error(`❌ Error saving artwork: ${error.message}`);
            throw error;
        }
    }
    
    async convertSvgToPng(svgPath, pngPath) {
        return new Promise((resolve, reject) => {
            // Try multiple conversion methods
            const converters = [
                { cmd: 'qlmanage', args: ['-t', '-s', '1000', '-o', require('path').dirname(pngPath), svgPath] },
                { cmd: 'convert', args: [svgPath, '-resize', '1000x1000', pngPath] }, // ImageMagick
                { cmd: 'rsvg-convert', args: ['-w', '1000', '-h', '1000', '-o', pngPath, svgPath] } // librsvg
            ];
            
            const tryConverter = (index) => {
                if (index >= converters.length) {
                    reject(new Error('No SVG converter available'));
                    return;
                }
                
                const { cmd, args } = converters[index];
                const process = spawn(cmd, args);
                
                process.on('close', (code) => {
                    if (code === 0) {
                        // Handle qlmanage's weird naming
                        if (cmd === 'qlmanage') {
                            const qlPath = pngPath.replace('.png', '.svg.png');
                            require('fs').rename(qlPath, pngPath, (err) => {
                                if (err) reject(err);
                                else resolve();
                            });
                        } else {
                            resolve();
                        }
                    } else {
                        tryConverter(index + 1);
                    }
                });
                
                process.on('error', () => {
                    tryConverter(index + 1);
                });
            };
            
            tryConverter(0);
        });
    }
    
    // Get available styles
    getAvailableStyles() {
        return Object.entries(this.styles).map(([key, style]) => ({
            id: key,
            name: style.name,
            description: style.description
        }));
    }
}

module.exports = EnhancedArtworkGenerator;