#!/usr/bin/env node

const Hex6EnhancedArtworkGenerator = require('./src/artwork-generator-hex6-enhanced');
const fs = require('fs').promises;
const path = require('path');

async function testBrightStyles() {
    console.log('🌈 Testing BRIGHT Enhanced Styles\n');
    
    const outputDir = path.join(__dirname, 'hex6-bright');
    await fs.mkdir(outputDir, { recursive: true });
    
    const styles = ['plasma', 'cosmic', 'bioform', 'neural', 'crystal', 'liquid'];
    
    for (const style of styles) {
        const generator = new Hex6EnhancedArtworkGenerator();
        
        // High energy for bright colors
        await generator.generate({
            style: style,
            title: style.toUpperCase(),
            audioFeatures: { 
                energy: 0.8,
                tempo: 140
            },
            moonPhase: 0.6,
            seed: Date.now()
        });
        
        const filename = `${style}_bright.png`;
        await generator.saveToFile(path.join(outputDir, filename));
        console.log(`✨ ${style}: Generated bright version`);
    }
    
    console.log('\n🎨 Bright styles complete!');
    console.log(`📁 View in: ${outputDir}`);
}

testBrightStyles().catch(console.error);