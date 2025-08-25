#!/usr/bin/env node

const Hex6EnhancedArtworkGenerator = require('./src/artwork-generator-hex6-enhanced');
const fs = require('fs').promises;
const path = require('path');

// ===================================================================
// HEX6 ENHANCED - Dramatic Variation Showcase
// ===================================================================

async function generateEnhancedShowcase() {
    console.log('🔮 HEXBLOOP Enhanced 6×6×6 System\n');
    console.log('═'.repeat(60));
    console.log('DRAMATICALLY ENHANCED DENSITY & VARIATION');
    console.log('═'.repeat(60));
    
    const outputDir = path.join(__dirname, 'hex6-enhanced');
    await fs.mkdir(outputDir, { recursive: true });
    
    // Test 1: Extreme density variations (same style, different parameters)
    console.log('\n📊 EXTREME DENSITY VARIATIONS (Plasma)\n');
    const densityDir = path.join(outputDir, 'density-extreme');
    await fs.mkdir(densityDir, { recursive: true });
    
    for (let i = 0; i < 6; i++) {
        const generator = new Hex6EnhancedArtworkGenerator();
        const energy = i / 5; // 0.0 to 1.0
        
        await generator.generate({
            style: 'plasma',
            title: `Density ${(energy * 100).toFixed(0)}%`,
            audioFeatures: { 
                energy: energy,
                tempo: 60 + i * 30,  // 60 to 210 BPM
                danceability: i / 5
            },
            moonPhase: 0.5,
            seed: 12345  // Same seed to show parameter effect
        });
        
        const filename = `plasma_density_${i}.png`;
        await generator.saveToFile(path.join(densityDir, filename));
        console.log(`   ${filename} - energy: ${energy.toFixed(2)}, density: ${generator.parameters.density.toFixed(2)}`);
    }
    
    // Test 2: All styles with maximum variation
    console.log('\n✨ ALL STYLES - MAXIMUM VARIATION\n');
    const stylesDir = path.join(outputDir, 'styles-max');
    await fs.mkdir(stylesDir, { recursive: true });
    
    const styles = ['plasma', 'cosmic', 'bioform', 'neural', 'crystal', 'liquid'];
    
    for (const style of styles) {
        // Generate 3 very different versions of each style
        for (let variant = 0; variant < 3; variant++) {
            const generator = new Hex6EnhancedArtworkGenerator();
            
            // Extreme parameter combinations
            const params = [
                { energy: 0.1, moon: 0.1 },  // Minimal
                { energy: 0.5, moon: 0.5 },  // Balanced
                { energy: 0.9, moon: 0.9 }   // Maximum
            ][variant];
            
            await generator.generate({
                style: style,
                title: `${style} v${variant + 1}`,
                audioFeatures: { 
                    energy: params.energy,
                    tempo: 60 + params.energy * 180,
                    danceability: params.energy
                },
                moonPhase: params.moon,
                seed: 1000 + variant * 1000
            });
            
            const filename = `${style}_variant_${variant}.png`;
            await generator.saveToFile(path.join(stylesDir, filename));
            console.log(`   ${style} variant ${variant + 1}: density=${generator.parameters.density.toFixed(2)}, scale=${generator.parameters.scale.toFixed(2)}`);
        }
    }
    
    // Test 3: Turbulence showcase
    console.log('\n🌪️ TURBULENCE VARIATIONS (Liquid)\n');
    const turbulenceDir = path.join(outputDir, 'turbulence');
    await fs.mkdir(turbulenceDir, { recursive: true });
    
    for (let i = 0; i < 4; i++) {
        const generator = new Hex6EnhancedArtworkGenerator();
        const turbulence = i / 3; // 0 to 1
        
        await generator.generate({
            style: 'liquid',
            title: `Turbulence ${(turbulence * 100).toFixed(0)}%`,
            audioFeatures: { 
                energy: turbulence,
                tempo: 120
            },
            moonPhase: 0.5,
            seed: 5000
        });
        
        const filename = `liquid_turbulence_${i}.png`;
        await generator.saveToFile(path.join(turbulenceDir, filename));
        console.log(`   Turbulence ${(turbulence * 100).toFixed(0)}%: ${generator.parameters.turbulence.toFixed(2)}`);
    }
    
    // Test 4: Evolution with dramatic changes
    console.log('\n🔄 DRAMATIC EVOLUTION (12 generations)\n');
    const evolutionDir = path.join(outputDir, 'evolution-dramatic');
    await fs.mkdir(evolutionDir, { recursive: true });
    
    const evGen = new Hex6EnhancedArtworkGenerator();
    
    for (let i = 0; i < 12; i++) {
        // Oscillating parameters for dramatic changes
        const phase = i / 12;
        const energy = 0.5 + Math.sin(phase * Math.PI * 4) * 0.5; // Fast oscillation
        const moon = (i / 12); // Linear progression
        
        await evGen.generate({
            title: `Gen ${i + 1}`,
            audioFeatures: {
                energy: energy,
                tempo: 60 + energy * 180,
                danceability: Math.abs(Math.sin(i * 0.7))
            },
            moonPhase: moon,
            seed: 10000 + i  // Slightly changing seed for variety
        });
        
        const filename = `evolution_${String(i + 1).padStart(2, '0')}.png`;
        await evGen.saveToFile(path.join(evolutionDir, filename));
        
        console.log(`   Gen ${String(i + 1).padStart(2, '0')}: ${evGen.styles[evGen.styleIndex]} (E:${energy.toFixed(2)} M:${moon.toFixed(2)})`);
        
        if ((i + 1) % 6 === 0) {
            console.log('      ⚡ HEXAGONAL BOOST APPLIED!');
        }
    }
    
    // Test 5: Chaos comparison
    console.log('\n💥 ORDER vs CHAOS\n');
    const chaosDir = path.join(outputDir, 'chaos');
    await fs.mkdir(chaosDir, { recursive: true });
    
    for (const style of ['neural', 'crystal', 'bioform']) {
        // Minimal chaos
        let generator = new Hex6EnhancedArtworkGenerator();
        await generator.generate({
            style: style,
            title: `${style} - Order`,
            audioFeatures: { energy: 0.1 },
            moonPhase: 1.0,  // Full moon = maximum order
            seed: 20000
        });
        await generator.saveToFile(path.join(chaosDir, `${style}_order.png`));
        
        // Maximum chaos
        generator = new Hex6EnhancedArtworkGenerator();
        await generator.generate({
            style: style,
            title: `${style} - Chaos`,
            audioFeatures: { energy: 0.95 },
            moonPhase: 0.0,  // New moon = maximum chaos
            seed: 20001
        });
        await generator.saveToFile(path.join(chaosDir, `${style}_chaos.png`));
        
        console.log(`   ${style}: Order vs Chaos generated`);
    }
    
    console.log('\n' + '═'.repeat(60));
    console.log('🎨 Enhanced Showcase Complete!');
    console.log(`📁 View artwork in: ${outputDir}`);
    console.log('\n🚀 ENHANCEMENTS:');
    console.log('  • Density range: 10x increase (up to 2500 elements)');
    console.log('  • Scale range: 15x variation');
    console.log('  • Turbulence: Dramatic flow field effects');
    console.log('  • Multi-octave noise for organic patterns');
    console.log('  • Complex layering with 4 render passes');
    console.log('  • Enhanced color palettes (12 colors)');
    console.log('  • Flow fields and particle systems');
    console.log('  • Every output is dramatically unique!');
    console.log('═'.repeat(60));
}

// Run showcase
generateEnhancedShowcase().catch(console.error);