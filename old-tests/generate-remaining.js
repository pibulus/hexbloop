#!/usr/bin/env node

const Hex6EnhancedArtworkGenerator = require('./src/artwork-generator-hex6-enhanced');
const fs = require('fs').promises;
const path = require('path');

async function generateRemaining() {
    console.log('🎨 Generating Remaining Samples');
    
    const generator = new Hex6EnhancedArtworkGenerator();
    const outputDir = path.join(process.env.HOME, 'Desktop', 'hexbloop-artwork-samples');
    
    // Check what's missing and generate liquid samples
    const liquidDir = path.join(outputDir, 'liquid');
    await fs.mkdir(liquidDir, { recursive: true });
    
    const testCases = [
        { params: { density: 0.5, scale: 0.5, turbulence: 0.5, luminosity: 0.5, saturation: 0.5, symmetry: 0.5 }, suffix: 'default-balanced' },
        { params: { density: 0.2, scale: 0.3, turbulence: 0.1, luminosity: 0.6, saturation: 0.4, symmetry: 0.8 }, suffix: 'minimal-clean' },
        { params: { density: 1.0, scale: 0.5, turbulence: 0.5, luminosity: 0.5, saturation: 0.5, symmetry: 0.5 }, suffix: 'max-density' },
        { params: { density: 0.5, scale: 1.0, turbulence: 0.5, luminosity: 0.5, saturation: 0.5, symmetry: 0.5 }, suffix: 'max-scale' },
        { params: { density: 0.7, scale: 0.6, turbulence: 1.0, luminosity: 0.5, saturation: 0.5, symmetry: 0.0 }, suffix: 'max-chaos' },
        { params: { density: 0.6, scale: 0.5, turbulence: 0.4, luminosity: 1.0, saturation: 1.0, symmetry: 0.5 }, suffix: 'bright-neon' },
        { params: { density: 0.4, scale: 0.6, turbulence: 0.7, luminosity: 0.2, saturation: 0.3, symmetry: 0.5 }, suffix: 'dark-moody' },
        { params: { density: 0.5, scale: 0.5, turbulence: 0.2, luminosity: 0.5, saturation: 0.5, symmetry: 1.0 }, suffix: 'perfect-symmetry' },
        { params: { density: 0.6, scale: 0.7, turbulence: 0.8, luminosity: 0.4, saturation: 0.6, symmetry: 0.2 }, suffix: 'organic-flow' },
        { params: { density: 0.4, scale: 0.5, turbulence: 0.2, luminosity: 0.8, saturation: 0.7, symmetry: 0.9 }, suffix: 'digital-structured' }
    ];
    
    console.log('✨ Generating liquid samples...');
    
    for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        generator.parameters = testCase.params;
        
        const audioEnergies = [0.2, 0.5, 0.8];
        
        for (const energy of audioEnergies) {
            const canvas = await generator.generate({
                style: 'liquid',
                audioFeatures: { energy, tempo: 120, danceability: 0.5 },
                moonPhase: 0.5,
                seed: 42 + i * 10 + energy * 100,
                title: `liquid ${testCase.suffix}`
            });
            
            const filename = `${i+1}-liquid-${testCase.suffix}-energy${energy}.png`;
            const outputPath = path.join(liquidDir, filename);
            
            await generator.saveToFile(outputPath);
            console.log(`  📁 ${filename}`);
        }
    }
    
    // Create README
    const readmeContent = `# Hexbloop Artwork Samples

## 📁 Structure
- 6 style folders (plasma, cosmic, bioform, neural, crystal, liquid)
- Each has 30 variations (10 settings × 3 energy levels)

## 🎯 Quick Reference Guide

### Settings Types:
1. **default-balanced** - All at 0.5
2. **minimal-clean** - Sparse, organized
3. **max-density** - Maximum elements
4. **max-scale** - Largest sizes
5. **max-chaos** - Wild turbulence
6. **bright-neon** - Maximum glow
7. **dark-moody** - Subtle, dark
8. **perfect-symmetry** - Geometric order
9. **organic-flow** - Natural movement
10. **digital-structured** - Clean tech look

### How to Give Feedback:
- "plasma max-density looks great"
- "cosmic needs more stars in minimal-clean"
- "liquid organic-flow is perfect"
- "neural bright-neon too intense"

### Energy Levels:
- 0.2 = Cool colors
- 0.5 = Balanced
- 0.8 = Warm colors

Total: 180 unique artwork samples
Generated: ${new Date().toLocaleString()}
`;
    
    await fs.writeFile(path.join(outputDir, 'README.md'), readmeContent);
    
    console.log('\n✅ Complete!');
    console.log(`📁 ~/Desktop/hexbloop-artwork-samples/`);
    console.log('📊 180 total images across 6 styles');
}

generateRemaining().catch(console.error);