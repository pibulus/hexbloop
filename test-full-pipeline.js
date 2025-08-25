#!/usr/bin/env node

// Mock the preferences manager before importing AudioProcessor
const mockPreferencesManager = {
    getProcessingConfig: () => ({
        stages: {
            naming: 'mystical',
            compressing: true,
            mastering: true,
            coverArt: true
        },
        options: {
            lunarInfluence: true
        }
    }),
    getSettings: () => ({
        processing: {},
        output: {
            format: 'mp3',
            quality: 'high'
        }
    }),
    getPath: () => null
};

// Mock the menu/preferences module
require.cache[require.resolve('./src/menu/preferences')] = {
    exports: {
        getPreferencesManager: () => mockPreferencesManager
    }
};

const AudioProcessor = require('./src/audio-processor');
const path = require('path');
const fs = require('fs').promises;
const { execSync } = require('child_process');

// ===================================================================
// TEST FULL PIPELINE WITH RAD ARTWORK
// ===================================================================

async function testFullPipeline() {
    console.log('🎯 Testing Full Pipeline with Rad Artwork Generator...\n');
    
    // Create a test audio file using ffmpeg
    const testInputDir = path.join(__dirname, 'test-input');
    const testOutputDir = path.join(__dirname, 'test-output-rad');
    
    // Ensure directories exist
    await fs.mkdir(testInputDir, { recursive: true });
    await fs.mkdir(testOutputDir, { recursive: true });
    
    // Generate a test audio file (sine wave)
    const testAudioFile = path.join(testInputDir, 'test-audio.wav');
    
    console.log('🎵 Generating test audio file...');
    try {
        // Generate a 5-second sine wave at 440Hz
        execSync(`ffmpeg -y -f lavfi -i "sine=frequency=440:duration=5" -ar 44100 -ac 2 "${testAudioFile}"`, {
            stdio: 'pipe'
        });
        console.log('✅ Test audio file created');
    } catch (error) {
        console.log('⚠️ Could not generate test audio, using any existing file');
    }
    
    // Test different name types to trigger different styles
    const testCases = [
        { name: 'Cosmic_Dream', expectedStyle: 'nebula' },
        { name: 'Electric_Surge', expectedStyle: 'energy' },
        { name: 'Botanical_Growth', expectedStyle: 'organic' },
        { name: 'Liquid_Flow', expectedStyle: 'fluid' },
        { name: 'Mystic_Aurora_Dreams', expectedStyle: 'random' } // Random style selection
    ];
    
    for (const testCase of testCases) {
        const name = testCase.name;
        const outputFile = path.join(testOutputDir, `${name}.mp3`);
        
        console.log(`\n${'═'.repeat(60)}`);
        console.log(`🔮 Processing: ${name}`);
        console.log(`   Expected style: ${testCase.expectedStyle}`);
        console.log('─'.repeat(60));
        
        try {
            const result = await AudioProcessor.processFile(testAudioFile, outputFile);
            
            console.log(`\n✨ Processing complete!`);
            console.log(`   Name: ${result.finalName}`);
            console.log(`   Artwork style: ${result.artwork?.style || 'none'}`);
            console.log(`   Output: ${outputFile}`);
            
            // Check file size
            const stats = await fs.stat(outputFile);
            console.log(`   File size: ${(stats.size / 1024).toFixed(2)} KB`);
            
        } catch (error) {
            console.error(`❌ Processing failed: ${error.message}`);
        }
    }
    
    console.log(`\n${'═'.repeat(60)}`);
    console.log('🎨 Full Pipeline Test Complete!');
    console.log(`📁 Check output in: ${testOutputDir}`);
    console.log('\nRad Artwork Features:');
    console.log('  • Organic metaball blending');
    console.log('  • Luminous glow effects');
    console.log('  • Gradient field rendering');
    console.log('  • 4 focused styles that actually work');
    console.log('═'.repeat(60));
}

// Run the test
testFullPipeline().catch(console.error);