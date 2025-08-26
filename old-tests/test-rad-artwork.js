#!/usr/bin/env node

const RadArtworkGenerator = require('./src/artwork-generator-rad');
const fs = require('fs').promises;
const path = require('path');

// ===================================================================
// TEST RAD ARTWORK GENERATOR
// ===================================================================

async function testRadArtwork() {
    console.log('🎨 Testing Rad Artwork Generator...\n');
    
    // Create output directory
    const outputDir = path.join(__dirname, 'test-rad-output');
    await fs.mkdir(outputDir, { recursive: true });
    
    // Test configurations
    const testConfigs = [
        { style: 'fluid', title: 'Liquid Dreams', moonPhase: 0.75 },
        { style: 'nebula', title: 'Cosmic Clouds', moonPhase: 0.5 },
        { style: 'organic', title: 'Living Matter', moonPhase: 0.25 },
        { style: 'energy', title: 'Electric Pulse', moonPhase: 1.0 }
    ];
    
    for (const config of testConfigs) {
        console.log(`\n🌊 Generating ${config.style} style artwork...`);
        
        const generator = new RadArtworkGenerator();
        const canvas = await generator.generate({
            style: config.style,
            title: config.title,
            moonPhase: config.moonPhase,
            seed: Math.random() * 10000 // Different seed for variety
        });
        
        const filename = `${config.style}_${Date.now()}.png`;
        const filepath = path.join(outputDir, filename);
        await generator.saveToFile(filepath);
        console.log(`  ✅ Saved: ${filename}`);
    }
    
    // Generate multiple variations of same style
    console.log('\n\n🎭 Generating variations of fluid style...');
    for (let i = 0; i < 3; i++) {
        const generator = new RadArtworkGenerator();
        const canvas = await generator.generate({
            style: 'fluid',
            title: `Variation ${i + 1}`,
            moonPhase: Math.random()
        });
        
        const filename = `fluid_variation_${i + 1}.png`;
        const filepath = path.join(outputDir, filename);
        await generator.saveToFile(filepath);
        console.log(`  ✅ ${filename}`);
    }
    
    console.log('\n' + '═'.repeat(60));
    console.log('✨ Rad artwork generation complete!');
    console.log(`📁 Check the output in: ${outputDir}`);
    console.log('\nOrganic improvements:');
    console.log('  • Metaballs for smooth blob merging');
    console.log('  • Gradient fields instead of shape drawing');
    console.log('  • Multi-stop glow with proper luminosity');
    console.log('  • Color bleeding through composite operations');
    console.log('  • Only 4 focused styles that actually work');
    console.log('═'.repeat(60));
}

// Run the test
testRadArtwork().catch(console.error);