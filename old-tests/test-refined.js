#!/usr/bin/env node

// Test the refined artwork generator with better colors and variety
const VibrantRefinedArtworkGenerator = require('./src/artwork-generator-vibrant-refined');
const fs = require('fs').promises;
const path = require('path');

async function testRefined() {
    console.log('🎨 Testing Vibrant Refined Artwork Generator');
    console.log('━'.repeat(60));
    
    const generator = new VibrantRefinedArtworkGenerator();
    const outputDir = path.join(process.env.HOME, 'Desktop', 'hexbloop-refined-samples');
    
    // Create output directory
    await fs.mkdir(outputDir, { recursive: true });
    
    // Focus on the improved styles
    const focusStyles = ['ocean-aurora', 'cyber-matrix'];
    
    console.log('\n🌟 Testing improved styles with variations...\n');
    
    // Test each focus style with different seeds to show palette variations
    for (const style of focusStyles) {
        console.log(`\n✨ Style: ${style}`);
        
        // Generate 6 variations to show randomization
        for (let i = 0; i < 6; i++) {
            const audioEnergy = i < 2 ? 0.9 : i < 4 ? 0.5 : 0.2; // High, medium, low
            const tempo = i % 2 === 0 ? 160 : 100; // Fast vs slow
            
            const canvas = await generator.generate({
                style: style,
                seed: Date.now() + i * 1000,
                audioEnergy: audioEnergy,
                tempo: tempo,
                title: `${style} v${i+1}`
            });
            
            const filename = `${style}_variation_${i+1}_e${(audioEnergy*10).toFixed(0)}_t${tempo}.png`;
            const outputPath = path.join(outputDir, filename);
            await generator.saveToFile(outputPath);
            
            console.log(`  📁 ${filename}`);
        }
    }
    
    // Test all styles for comparison
    console.log('\n📊 Generating full comparison set...\n');
    
    const allStyles = generator.styles;
    for (const style of allStyles) {
        const canvas = await generator.generate({
            style: style,
            seed: Date.now(),
            audioEnergy: 0.7,
            tempo: 120,
            title: style
        });
        
        const filename = `compare_${style}.png`;
        const outputPath = path.join(outputDir, filename);
        await generator.saveToFile(outputPath);
        console.log(`  📁 ${filename}`);
    }
    
    console.log('\n✅ Test complete!');
    console.log(`📁 Output: ${outputDir}`);
    console.log('\n🎯 Key improvements in Refined version:');
    console.log('  • Ocean-Aurora: True aurora colors (green/pink/purple/yellow)');
    console.log('  • Cyber-Matrix: No more all-green! Cyberpunk rainbow');
    console.log('  • Each style has 3 palette variations');
    console.log('  • 30% chance of random variation selection');
    console.log('  • Color shuffling for more variety');
    console.log('  • Accent colors appear 10% of the time');
}

testRefined().catch(console.error);