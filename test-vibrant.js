#!/usr/bin/env node

// Test the new vibrant artwork generator
const VibrantArtworkGenerator = require('./src/artwork-generator-vibrant');
const fs = require('fs').promises;
const path = require('path');

async function testVibrant() {
    console.log('🎨 Testing Vibrant Artwork Generator');
    console.log('━'.repeat(60));
    
    const generator = new VibrantArtworkGenerator();
    const outputDir = path.join(process.env.HOME, 'Desktop', 'hexbloop-vibrant-test');
    
    // Create output directory
    await fs.mkdir(outputDir, { recursive: true });
    
    // Test each style
    const styles = generator.styles;
    
    for (const style of styles) {
        console.log(`\n✨ Generating ${style} samples...`);
        
        // Generate 3 variations of each style
        for (let i = 0; i < 3; i++) {
            const canvas = await generator.generate({
                style: style,
                seed: Date.now() + i * 1000,
                title: `${style} v${i+1}`
            });
            
            const filename = `${style}_${i+1}.png`;
            const outputPath = path.join(outputDir, filename);
            await generator.saveToFile(outputPath);
            
            console.log(`  📁 ${filename}`);
        }
    }
    
    // Generate a comparison grid
    console.log('\n📊 Generating comparison grid...');
    
    // Same seed for all styles to see differences
    const seed = 999;
    for (const style of styles) {
        const canvas = await generator.generate({
            style: style,
            seed: seed,
            title: style
        });
        
        const filename = `compare_${style}.png`;
        const outputPath = path.join(outputDir, filename);
        await generator.saveToFile(outputPath);
    }
    
    console.log('\n✅ Test complete!');
    console.log(`📁 Output: ${outputDir}`);
    console.log('\n🎯 Key improvements:');
    console.log('  • Bright, vibrant color palettes');
    console.log('  • Gradient backgrounds (no solid black!)');
    console.log('  • Additive blending for glow effects');
    console.log('  • Style-specific filters');
    console.log('  • 8 distinct styles with unique personalities');
}

testVibrant().catch(console.error);