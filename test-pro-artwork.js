#!/usr/bin/env node

const ArtworkGeneratorCanvas = require('./src/artwork-generator-canvas');
const ProfessionalArtworkGenerator = require('./src/artwork-generator-pro');
const fs = require('fs').promises;
const path = require('path');

// ===================================================================
// TEST PROFESSIONAL ARTWORK GENERATOR
// ===================================================================

async function testProfessionalArtwork() {
    console.log('🎨 Testing Professional Artwork Generator...\n');
    
    // Create output directory
    const outputDir = path.join(__dirname, 'test-artwork-comparison');
    await fs.mkdir(outputDir, { recursive: true });
    
    // Test configurations
    const testConfigs = [
        { style: 'cosmic', title: 'Cosmic Journey', moonPhase: 0.75 },
        { style: 'organic', title: 'Living Forms', moonPhase: 0.5 },
        { style: 'geometric', title: 'Crystal Matrix', moonPhase: 0.25 }
    ];
    
    for (const config of testConfigs) {
        console.log(`\n📸 Generating ${config.style} style artwork...`);
        
        // Generate with original generator
        console.log('  → Original generator...');
        const originalGen = new ArtworkGeneratorCanvas();
        const originalCanvas = await originalGen.generate({
            style: config.style,
            title: config.title,
            moonPhase: config.moonPhase,
            seed: 12345 // Fixed seed for comparison
        });
        
        const originalPath = path.join(outputDir, `${config.style}_original.png`);
        await originalGen.saveToFile(originalPath);
        console.log(`  ✅ Saved: ${originalPath}`);
        
        // Generate with professional generator
        console.log('  → Professional generator...');
        const proGen = new ProfessionalArtworkGenerator();
        const proCanvas = await proGen.generate({
            style: config.style,
            title: config.title,
            moonPhase: config.moonPhase,
            seed: 12345 // Same seed for fair comparison
        });
        
        const proPath = path.join(outputDir, `${config.style}_professional.png`);
        await proGen.saveToFile(proPath);
        console.log(`  ✅ Saved: ${proPath}`);
    }
    
    console.log('\n' + '═'.repeat(60));
    console.log('✨ Artwork comparison complete!');
    console.log(`📁 Check the output in: ${outputDir}`);
    console.log('\nQuality improvements in professional version:');
    console.log('  • Multi-layer rendering with proper compositing');
    console.log('  • Perlin/Simplex noise for organic textures');
    console.log('  • Advanced blending modes (screen, multiply, overlay)');
    console.log('  • Atmospheric perspective with depth blur');
    console.log('  • Professional lighting with bloom effects');
    console.log('  • Rich material textures and surface effects');
    console.log('  • Golden ratio composition and flow fields');
    console.log('  • Chromatic aberration and post-processing');
    console.log('═'.repeat(60));
}

// Run the test
testProfessionalArtwork().catch(console.error);