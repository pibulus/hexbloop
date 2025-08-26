#!/usr/bin/env node

const Hex6EnhancedArtworkGenerator = require('./src/artwork-generator-hex6-enhanced');
const fs = require('fs').promises;
const path = require('path');

async function generateSamples() {
    console.log('🎨 Generating Comprehensive Artwork Samples for Desktop');
    console.log('━'.repeat(60));
    
    const generator = new Hex6EnhancedArtworkGenerator();
    const outputDir = path.join(process.env.HOME, 'Desktop', 'hexbloop-artwork-samples');
    
    // Ensure directory exists
    await fs.mkdir(outputDir, { recursive: true });
    
    const styles = ['plasma', 'cosmic', 'bioform', 'neural', 'crystal', 'liquid'];
    
    // Test cases with descriptive names
    const testCases = [
        // Default/balanced settings
        { 
            params: { density: 0.5, scale: 0.5, turbulence: 0.5, luminosity: 0.5, saturation: 0.5, symmetry: 0.5 },
            suffix: 'default-balanced'
        },
        // Minimal settings
        { 
            params: { density: 0.2, scale: 0.3, turbulence: 0.1, luminosity: 0.6, saturation: 0.4, symmetry: 0.8 },
            suffix: 'minimal-clean'
        },
        // Maximum density
        { 
            params: { density: 1.0, scale: 0.5, turbulence: 0.5, luminosity: 0.5, saturation: 0.5, symmetry: 0.5 },
            suffix: 'max-density'
        },
        // Maximum scale
        { 
            params: { density: 0.5, scale: 1.0, turbulence: 0.5, luminosity: 0.5, saturation: 0.5, symmetry: 0.5 },
            suffix: 'max-scale'
        },
        // Maximum chaos
        { 
            params: { density: 0.7, scale: 0.6, turbulence: 1.0, luminosity: 0.5, saturation: 0.5, symmetry: 0.0 },
            suffix: 'max-chaos'
        },
        // Bright neon
        { 
            params: { density: 0.6, scale: 0.5, turbulence: 0.4, luminosity: 1.0, saturation: 1.0, symmetry: 0.5 },
            suffix: 'bright-neon'
        },
        // Dark moody
        { 
            params: { density: 0.4, scale: 0.6, turbulence: 0.7, luminosity: 0.2, saturation: 0.3, symmetry: 0.5 },
            suffix: 'dark-moody'
        },
        // Perfect symmetry
        { 
            params: { density: 0.5, scale: 0.5, turbulence: 0.2, luminosity: 0.5, saturation: 0.5, symmetry: 1.0 },
            suffix: 'perfect-symmetry'
        },
        // Organic flow
        { 
            params: { density: 0.6, scale: 0.7, turbulence: 0.8, luminosity: 0.4, saturation: 0.6, symmetry: 0.2 },
            suffix: 'organic-flow'
        },
        // Digital structured
        { 
            params: { density: 0.4, scale: 0.5, turbulence: 0.2, luminosity: 0.8, saturation: 0.7, symmetry: 0.9 },
            suffix: 'digital-structured'
        }
    ];
    
    // Generate samples for each style
    for (const style of styles) {
        console.log(`\n✨ Generating ${style} samples...`);
        
        // Create style directory
        const styleDir = path.join(outputDir, style);
        await fs.mkdir(styleDir, { recursive: true });
        
        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            
            // Update generator parameters
            generator.parameters = testCase.params;
            
            // Different audio energy levels for color variation
            const audioEnergies = [0.2, 0.5, 0.8];
            
            for (let j = 0; j < audioEnergies.length; j++) {
                const energy = audioEnergies[j];
                
                const canvas = await generator.generate({
                    style: style,
                    audioFeatures: {
                        energy: energy,
                        tempo: 120,
                        danceability: 0.5
                    },
                    moonPhase: 0.5,
                    seed: 42 + i * 10 + j,
                    title: `${style} ${testCase.suffix}`
                });
                
                const filename = `${i+1}-${style}-${testCase.suffix}-energy${energy}.png`;
                const outputPath = path.join(styleDir, filename);
                
                await generator.saveToFile(outputPath);
                console.log(`  📁 ${filename}`);
            }
        }
    }
    
    // Generate comparison sheet - same parameters across all styles
    console.log('\n📊 Generating comparison sheets...');
    const comparisonDir = path.join(outputDir, '_comparisons');
    await fs.mkdir(comparisonDir, { recursive: true });
    
    for (const testCase of testCases) {
        generator.parameters = testCase.params;
        
        for (const style of styles) {
            const canvas = await generator.generate({
                style: style,
                audioFeatures: { energy: 0.5, tempo: 120, danceability: 0.5 },
                moonPhase: 0.5,
                seed: 999,
                title: style
            });
            
            const filename = `compare-${testCase.suffix}-${style}.png`;
            const outputPath = path.join(comparisonDir, filename);
            
            await generator.saveToFile(outputPath);
        }
        console.log(`  ✅ ${testCase.suffix} comparison set`);
    }
    
    // Create an index file explaining the samples
    const indexContent = `# Hexbloop Artwork Samples Guide

## Folder Structure
- Each style has its own folder (plasma, cosmic, bioform, neural, crystal, liquid)
- _comparisons folder shows same settings across all styles

## File Naming Convention
[number]-[style]-[description]-energy[value].png

## Test Cases:
1. **default-balanced** - All parameters at 0.5
2. **minimal-clean** - Low density, high symmetry
3. **max-density** - Maximum element count
4. **max-scale** - Largest element sizes
5. **max-chaos** - Maximum turbulence, no symmetry
6. **bright-neon** - Maximum luminosity and saturation
7. **dark-moody** - Low brightness and saturation
8. **perfect-symmetry** - Maximum pattern organization
9. **organic-flow** - Natural, flowing parameters
10. **digital-structured** - Clean, geometric settings

## Energy Variations
Each setting has 3 versions with different audio energy:
- energy0.2 - Low energy (cooler colors)
- energy0.5 - Medium energy (balanced)
- energy0.8 - High energy (warmer colors)

## How to Reference
When giving feedback, reference like:
- "plasma max-density looks good"
- "cosmic bright-neon needs more stars"
- "compare digital-structured shows crystal is best"

Generated: ${new Date().toISOString()}
`;
    
    await fs.writeFile(path.join(outputDir, 'README.txt'), indexContent);
    
    console.log('\n✅ Sample generation complete!');
    console.log(`📁 ${outputDir}`);
    console.log(`📊 Total files: ${styles.length * testCases.length * 3 + styles.length * testCases.length} images`);
    console.log('\n🎯 Quick Reference:');
    console.log('  • Each style folder has 30 variations');
    console.log('  • _comparisons shows same settings across styles');
    console.log('  • Check README.txt for full guide');
}

generateSamples().catch(console.error);