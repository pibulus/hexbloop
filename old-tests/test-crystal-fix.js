#!/usr/bin/env node

const Hex6EnhancedArtworkGenerator = require('./src/artwork-generator-hex6-enhanced');
const fs = require('fs').promises;
const path = require('path');

async function testCrystalFix() {
    console.log('🔮 Testing Crystal Style Fix\n');
    
    const outputDir = path.join(__dirname, 'hex6-enhanced', 'crystal-test');
    await fs.mkdir(outputDir, { recursive: true });
    
    for (let i = 0; i < 3; i++) {
        const generator = new Hex6EnhancedArtworkGenerator();
        const params = [
            { energy: 0.2, moon: 0.9 },  // Minimal
            { energy: 0.5, moon: 0.5 },  // Balanced
            { energy: 0.9, moon: 0.1 }   // Maximum
        ][i];
        
        await generator.generate({
            style: 'crystal',
            title: `Crystal Test ${i + 1}`,
            audioFeatures: { 
                energy: params.energy,
                tempo: 60 + params.energy * 180
            },
            moonPhase: params.moon,
            seed: 7000 + i * 100
        });
        
        const filename = `crystal_test_${i}.png`;
        await generator.saveToFile(path.join(outputDir, filename));
        console.log(`✅ Generated: ${filename}`);
    }
    
    console.log('\n✨ Crystal style fixed and tested!');
}

testCrystalFix().catch(console.error);