#!/usr/bin/env node

const RadArtworkGenerator = require('./src/artwork-generator-rad');
const fs = require('fs').promises;
const path = require('path');

// ===================================================================
// GENERATE ARTWORK SHOWCASE - 3 VARIATIONS PER STYLE
// ===================================================================

async function generateShowcase() {
    console.log('🎨 Generating Artwork Showcase...\n');
    
    const outputDir = path.join(__dirname, 'artwork-showcase');
    await fs.mkdir(outputDir, { recursive: true });
    
    const styles = ['fluid', 'nebula', 'organic', 'energy'];
    const variations = 3;
    
    for (const style of styles) {
        console.log(`\n✨ Generating ${style} variations...`);
        
        // Create style subdirectory
        const styleDir = path.join(outputDir, style);
        await fs.mkdir(styleDir, { recursive: true });
        
        for (let i = 1; i <= variations; i++) {
            const generator = new RadArtworkGenerator();
            
            // Generate with unique seed for variation
            const canvas = await generator.generate({
                style: style,
                title: `${style.charAt(0).toUpperCase() + style.slice(1)} Variation ${i}`,
                moonPhase: Math.random(),
                seed: Date.now() + i * 1000
            });
            
            const filename = `${style}_v${i}.png`;
            const filepath = path.join(styleDir, filename);
            await generator.saveToFile(filepath);
            
            console.log(`   ✅ ${filename}`);
        }
    }
    
    console.log('\n' + '═'.repeat(60));
    console.log('🎨 Showcase Complete!');
    console.log(`📁 View artwork in: ${outputDir}`);
    console.log('\nFolder structure:');
    console.log('  artwork-showcase/');
    console.log('    ├── fluid/     (3 variations)');
    console.log('    ├── nebula/    (3 variations)');
    console.log('    ├── organic/   (3 variations)');
    console.log('    └── energy/    (3 variations)');
    console.log('═'.repeat(60));
}

// Run the showcase generator
generateShowcase().catch(console.error);