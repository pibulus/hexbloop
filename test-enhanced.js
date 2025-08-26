#!/usr/bin/env node

// Test the enhanced vibrant artwork generator with all its variety
const VibrantEnhancedArtworkGenerator = require('./src/artwork-generator-vibrant-enhanced');
const fs = require('fs').promises;
const path = require('path');

async function testEnhanced() {
    console.log('🎨 Testing Vibrant Enhanced Artwork Generator');
    console.log('━'.repeat(60));
    
    const generator = new VibrantEnhancedArtworkGenerator();
    const outputDir = path.join(process.env.HOME, 'Desktop', 'hexbloop-enhanced-samples');
    
    // Create output directory
    await fs.mkdir(outputDir, { recursive: true });
    
    // Test each style with different audio parameters
    const styles = generator.styles;
    const audioVariations = [
        { energy: 0.3, tempo: 60, name: 'calm' },
        { energy: 0.7, tempo: 120, name: 'groove' },
        { energy: 0.95, tempo: 160, name: 'intense' }
    ];
    
    console.log('\n🌈 Generating samples with audio-responsive variations...\n');
    
    for (const style of styles) {
        console.log(`\n✨ Style: ${style}`);
        
        for (const audio of audioVariations) {
            const canvas = await generator.generate({
                style: style,
                seed: Date.now(),
                title: `${style} (${audio.name})`,
                audioEnergy: audio.energy,
                tempo: audio.tempo
            });
            
            const filename = `${style}_${audio.name}.png`;
            const outputPath = path.join(outputDir, filename);
            await generator.saveToFile(outputPath);
            
            console.log(`  📁 ${filename} - Energy: ${audio.energy}, Tempo: ${audio.tempo}`);
        }
    }
    
    // Generate comparison grid with same seed
    console.log('\n📊 Generating comparison grid (same seed, different styles)...\n');
    const fixedSeed = 42;
    
    for (const style of styles) {
        const canvas = await generator.generate({
            style: style,
            seed: fixedSeed,
            title: style,
            audioEnergy: 0.7,
            tempo: 120
        });
        
        const filename = `compare_${style}.png`;
        const outputPath = path.join(outputDir, filename);
        await generator.saveToFile(outputPath);
        console.log(`  📁 ${filename}`);
    }
    
    console.log('\n✅ Test complete!');
    console.log(`📁 Output: ${outputDir}`);
    console.log('\n🎯 Key improvements in Enhanced version:');
    console.log('  • Metaballs for organic shapes');
    console.log('  • Flow fields and particle systems');
    console.log('  • Audio-responsive color palettes');
    console.log('  • 8 unique styles with sub-variations');
    console.log('  • Dynamic background types');
    console.log('  • Each output is dramatically different!');
}

testEnhanced().catch(console.error);