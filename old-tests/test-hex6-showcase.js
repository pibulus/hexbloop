#!/usr/bin/env node

const Hex6ArtworkGenerator = require('./src/artwork-generator-hex6');
const fs = require('fs').promises;
const path = require('path');

// ===================================================================
// HEX6 SHOWCASE - True 6×6×6 System Demo
// ===================================================================

async function generateHex6Showcase() {
    console.log('🔮 HEXBLOOP 6×6×6 System Showcase\n');
    console.log('═'.repeat(60));
    console.log('6 Styles × 6 Parameters × 6 Inputs = 216 Dimensions');
    console.log('═'.repeat(60));
    
    const outputDir = path.join(__dirname, 'hex6-showcase');
    await fs.mkdir(outputDir, { recursive: true });
    
    // Test all 6 styles with different parameter combinations
    const testCases = [
        // Each style with its optimal conditions
        {
            name: 'plasma_high_energy',
            style: 'plasma',
            audioFeatures: { energy: 0.9 },
            moonPhase: 0.5,
            seed: 100
        },
        {
            name: 'cosmic_full_moon',
            style: 'cosmic',
            audioFeatures: { energy: 0.3 },
            moonPhase: 1.0,
            seed: 200
        },
        {
            name: 'bioform_organic',
            style: 'bioform',
            audioFeatures: { energy: 0.5 },
            moonPhase: 0.25,
            seed: 300
        },
        {
            name: 'neural_network',
            style: 'neural',
            audioFeatures: { energy: 0.8 },
            moonPhase: 0.5,
            seed: 400
        },
        {
            name: 'crystal_lattice',
            style: 'crystal',
            audioFeatures: { energy: 0.4 },
            moonPhase: 0.9,
            seed: 500
        },
        {
            name: 'liquid_flow',
            style: 'liquid',
            audioFeatures: { energy: 0.6 },
            moonPhase: 0.3,
            seed: 600
        }
    ];
    
    console.log('\n📊 Generating all 6 styles...\n');
    
    for (const test of testCases) {
        const generator = new Hex6ArtworkGenerator();
        
        console.log(`✨ ${test.style.toUpperCase()}`);
        
        const canvas = await generator.generate({
            style: test.style,
            title: test.style.toUpperCase(),
            audioFeatures: test.audioFeatures,
            moonPhase: test.moonPhase,
            seed: test.seed
        });
        
        const filename = `${test.name}.png`;
        await generator.saveToFile(path.join(outputDir, filename));
        
        // Log parameters
        console.log(`   Parameters: density(${generator.parameters.density.toFixed(2)}) ` +
                   `scale(${generator.parameters.scale.toFixed(2)}) ` +
                   `turbulence(${generator.parameters.turbulence.toFixed(2)})`);
        console.log(`   ✅ Saved: ${filename}`);
    }
    
    // Generate parameter variation series
    console.log('\n' + '─'.repeat(60));
    console.log('📈 Generating parameter variations...\n');
    
    const variationDir = path.join(outputDir, 'variations');
    await fs.mkdir(variationDir, { recursive: true });
    
    // Test density variations (plasma style)
    console.log('Density variations (plasma):');
    for (let i = 0; i < 3; i++) {
        const generator = new Hex6ArtworkGenerator();
        const energy = 0.2 + i * 0.3; // 0.2, 0.5, 0.8
        
        await generator.generate({
            style: 'plasma',
            title: `Density ${(energy * 100).toFixed(0)}%`,
            audioFeatures: { energy: energy },
            moonPhase: 0.5
        });
        
        const filename = `plasma_density_${i}.png`;
        await generator.saveToFile(path.join(variationDir, filename));
        console.log(`   ${filename} - density: ${generator.parameters.density.toFixed(2)}`);
    }
    
    // Test 6-generation evolution
    console.log('\n' + '─'.repeat(60));
    console.log('🔄 Generating 6-generation evolution...\n');
    
    const evolutionDir = path.join(outputDir, 'evolution');
    await fs.mkdir(evolutionDir, { recursive: true });
    
    const evGen = new Hex6ArtworkGenerator();
    
    for (let i = 0; i < 6; i++) {
        // Let the generator auto-select style based on changing inputs
        const canvas = await evGen.generate({
            title: `Generation ${i + 1}`,
            audioFeatures: {
                energy: 0.5 + Math.sin(i * Math.PI / 3) * 0.3
            },
            moonPhase: i / 6,
            seed: 12345 // Fixed seed for consistency
        });
        
        const filename = `evolution_${i + 1}.png`;
        await evGen.saveToFile(path.join(evolutionDir, filename));
        
        console.log(`   Gen ${i + 1}: ${evGen.styles[evGen.styleIndex]} style`);
        
        if ((i + 1) % 6 === 0) {
            console.log('      ✨ Hexagonal boost applied!');
        }
    }
    
    console.log('\n' + '═'.repeat(60));
    console.log('🎨 Hex6 Showcase Complete!');
    console.log(`📁 View artwork in: ${outputDir}`);
    console.log('\n6×6×6 System Features:');
    console.log('  • 6 distinct styles with unique renderers');
    console.log('  • 6 variation parameters per style');
    console.log('  • 6 input modifiers from multiple sources');
    console.log('  • Dense, organic rendering with multiple layers');
    console.log('  • Style-specific color palettes');
    console.log('  • Hexagonal symmetry and sacred geometry');
    console.log('  • Special boost every 6th generation');
    console.log('═'.repeat(60));
}

// Run showcase
generateHex6Showcase().catch(console.error);