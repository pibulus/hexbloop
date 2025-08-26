#!/usr/bin/env node

const HexbloopArtworkGenerator = require('./src/artwork-generator-hexbloop');
const fs = require('fs').promises;
const path = require('path');

// ===================================================================
// HEXBLOOP SHOWCASE - Oscillating Systems Demo
// ===================================================================

async function generateHexbloopShowcase() {
    console.log('🔮 HEXBLOOP Oscillating Systems Showcase\n');
    console.log('═'.repeat(60));
    
    const outputDir = path.join(__dirname, 'hexbloop-showcase');
    await fs.mkdir(outputDir, { recursive: true });
    
    // Test different parameter combinations
    const scenarios = [
        {
            name: 'high_energy_neural',
            audioFeatures: { energy: 0.9, tempo: 140, spectralCentroid: 0.7, transientDensity: 0.8 },
            moonPhase: 0.5,
            description: 'High energy audio → Neural networks'
        },
        {
            name: 'cosmic_drift',
            audioFeatures: { energy: 0.2, tempo: 60, spectralCentroid: 0.3, transientDensity: 0.1 },
            moonPhase: 0.95,
            description: 'Slow tempo + full moon → Cosmic style'
        },
        {
            name: 'organic_rhythm',
            audioFeatures: { energy: 0.5, tempo: 120, spectralCentroid: 0.4, transientDensity: 0.7 },
            moonPhase: 0.25,
            description: 'Rhythmic transients → Bioform growth'
        },
        {
            name: 'plasma_bass',
            audioFeatures: { energy: 0.7, tempo: 90, spectralCentroid: 0.2, transientDensity: 0.4 },
            moonPhase: 0.5,
            description: 'Low frequencies → Plasma flows'
        },
        {
            name: 'chaos_mode',
            audioFeatures: { energy: Math.random(), tempo: Math.random() * 100 + 60, spectralCentroid: Math.random(), transientDensity: Math.random() },
            moonPhase: Math.random(),
            description: 'Pure randomness'
        },
        {
            name: 'hexagonal_special',
            audioFeatures: { energy: 0.6, tempo: 100, spectralCentroid: 0.5, transientDensity: 0.5 },
            moonPhase: 0.5,
            description: 'Generation 6 - Hexagonal overlay',
            forceGeneration: 6
        }
    ];
    
    for (const scenario of scenarios) {
        console.log(`\n✨ ${scenario.name}`);
        console.log(`   ${scenario.description}`);
        
        const generator = new HexbloopArtworkGenerator();
        
        // Force generation number for hexagonal test
        if (scenario.forceGeneration) {
            generator.generation = scenario.forceGeneration - 1;
        }
        
        // Generate artwork
        const canvas = await generator.generate({
            title: scenario.name.replace(/_/g, ' ').toUpperCase(),
            audioFeatures: scenario.audioFeatures,
            moonPhase: scenario.moonPhase
        });
        
        const filename = `${scenario.name}.png`;
        const filepath = path.join(outputDir, filename);
        await generator.saveToFile(filepath);
        
        // Log the actual style mix
        console.log(`   Style mix: plasma(${(generator.styleMix.plasma * 100).toFixed(0)}%) ` +
                   `cosmic(${(generator.styleMix.cosmic * 100).toFixed(0)}%) ` +
                   `bioform(${(generator.styleMix.bioform * 100).toFixed(0)}%) ` +
                   `neural(${(generator.styleMix.neural * 100).toFixed(0)}%)`);
        
        // Log oscillator values
        console.log(`   Oscillators: density(${generator.oscillators.density.value.toFixed(2)}) ` +
                   `complexity(${generator.oscillators.complexity.value.toFixed(2)}) ` +
                   `glow(${generator.oscillators.glow.value.toFixed(2)})`);
        
        console.log(`   ✅ Saved: ${filename}`);
    }
    
    // Generate a series showing evolution over time
    console.log('\n' + '─'.repeat(60));
    console.log('📈 Generating evolution series (6 generations)...\n');
    
    const evolutionGen = new HexbloopArtworkGenerator();
    const evolutionDir = path.join(outputDir, 'evolution');
    await fs.mkdir(evolutionDir, { recursive: true });
    
    for (let i = 0; i < 6; i++) {
        const canvas = await evolutionGen.generate({
            title: `Evolution ${i + 1}`,
            audioFeatures: {
                energy: 0.5 + Math.sin(i * 0.5) * 0.3,
                tempo: 120,
                spectralCentroid: 0.5,
                transientDensity: 0.4
            },
            moonPhase: i / 6
        });
        
        const filename = `evolution_${i + 1}.png`;
        await evolutionGen.saveToFile(path.join(evolutionDir, filename));
        console.log(`   Gen ${i + 1}: ${filename} ${i === 5 ? '(hexagonal!)' : ''}`);
    }
    
    console.log('\n' + '═'.repeat(60));
    console.log('🎨 Hexbloop Showcase Complete!');
    console.log(`📁 View artwork in: ${outputDir}`);
    console.log('\nFeatures demonstrated:');
    console.log('  • Oscillating parameter system');
    console.log('  • Dynamic style morphing based on audio');
    console.log('  • Metadata from cosmic, system, and environmental sources');
    console.log('  • Hexagonal overlay on 6th generation');
    console.log('  • Chromatic aberration and scanline effects');
    console.log('  • Evolution over multiple generations');
    console.log('═'.repeat(60));
}

// Run showcase
generateHexbloopShowcase().catch(console.error);