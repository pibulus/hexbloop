#!/usr/bin/env node

const ArtworkGeneratorCanvas = require('./src/artwork-generator-canvas');
const fs = require('fs').promises;
const path = require('path');

async function testArtworkVariation() {
    const generator = new ArtworkGeneratorCanvas();
    const outputDir = path.join(__dirname, 'test-artwork-output');
    
    // Create output directory
    try {
        await fs.mkdir(outputDir, { recursive: true });
    } catch (e) {
        // Directory might already exist
    }
    
    // Test band names with varying characteristics
    const testBandNames = [
        'Cosmic Drift',           // Short, balanced
        'The Ethereal Wanderers',  // Long, more vowels
        'XKCD',                   // Short, consonant heavy
        'Moonlight Serenade',     // Medium, balanced
        'Zzyzx',                  // Unusual characters
        'The Velvet Underground', // Classic band name
        'æøå',                    // Special characters
        '12345',                  // Numbers
        'a',                      // Single character
        'The Quick Brown Fox Jumps Over The Lazy Dog' // Very long
    ];
    
    console.log('🎨 Testing artwork variation with different band names...\n');
    
    for (const bandName of testBandNames) {
        console.log(`\n📀 Generating artwork for: "${bandName}"`);
        
        // Generate with cosmic style to test consistency
        const canvas = await generator.generate({
            style: 'cosmic',
            title: bandName,
            bandName: bandName,
            moonPhase: 0.5
        });
        
        // Save the image
        const filename = `${bandName.replace(/[^a-zA-Z0-9]/g, '_')}_cosmic.png`;
        const filepath = path.join(outputDir, filename);
        const buffer = canvas.toBuffer('image/png');
        await fs.writeFile(filepath, buffer);
        
        console.log(`   ✅ Saved: ${filename}`);
        
        // Log DNA characteristics
        const dna = generator.dna;
        console.log(`   📊 DNA Stats:`);
        console.log(`      - Complexity: ${(dna.complexity * 100).toFixed(1)}%`);
        console.log(`      - Energy: ${(dna.energy * 100).toFixed(1)}%`);
        console.log(`      - Chaos: ${(dna.chaos * 100).toFixed(1)}%`);
        console.log(`      - Diversity: ${(dna.diversity * 100).toFixed(1)}%`);
        console.log(`      - Hue Offset: ${dna.hueOffset}°`);
    }
    
    // Test same band name with different styles
    const testBandName = 'Hexbloop Audio Labs';
    const styles = ['cosmic', 'organic', 'geometric', 'glitch', 'aurora', 'crystal'];
    
    console.log(`\n\n🎭 Testing different styles for: "${testBandName}"`);
    
    for (const style of styles) {
        const canvas = await generator.generate({
            style: style,
            title: testBandName,
            bandName: testBandName,
            moonPhase: 0.5
        });
        
        const filename = `${testBandName.replace(/[^a-zA-Z0-9]/g, '_')}_${style}.png`;
        const filepath = path.join(outputDir, filename);
        const buffer = canvas.toBuffer('image/png');
        await fs.writeFile(filepath, buffer);
        
        console.log(`   ✅ ${style}: ${filename}`);
    }
    
    console.log(`\n\n✨ All test images saved to: ${outputDir}`);
    console.log('   Open the folder to compare the variations!');
}

// Run the test
testArtworkVariation().catch(console.error);