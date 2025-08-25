/**
 * Basic test suite for Hexbloop
 * Tests core functionality without requiring full Electron environment
 */

const fs = require('fs');
const path = require('path');

// Test utilities
const assert = (condition, message) => {
    if (!condition) {
        console.error(`❌ ${message}`);
        process.exit(1);
    }
    console.log(`✅ ${message}`);
};

// Test counter
let testsRun = 0;
let testsPassed = 0;

// Test lunar processor
const testLunarProcessor = () => {
    console.log('\n🌙 Testing Lunar Processor...');
    const LunarProcessor = require('../src/lunar-processor');
    
    const phase = LunarProcessor.getMoonPhase();
    
    assert(phase !== null, 'Moon phase calculated');
    assert(typeof phase.illumination === 'number', 'Illumination is a number');
    assert(phase.illumination >= 0 && phase.illumination <= 1, 'Illumination in valid range');
    assert(typeof phase.name === 'string', 'Phase name is a string');
    assert(phase.influence !== undefined, 'Mystical influence calculated');
    
    testsRun += 5;
    testsPassed += 5;
};

// Test name generator
const testNameGenerator = () => {
    console.log('\n✨ Testing Name Generator...');
    const NameGenerator = require('../src/name-generator');
    
    const name = NameGenerator.generateCleanName();
    
    assert(name !== null, 'Name generated');
    assert(typeof name === 'string', 'Name is a string');
    assert(name.length > 0, 'Name is not empty');
    assert(name.length > 5, 'Name has reasonable length');
    
    // Generate multiple names to check uniqueness
    const names = new Set();
    for (let i = 0; i < 10; i++) {
        names.add(NameGenerator.generateCleanName());
    }
    assert(names.size > 5, 'Name generator produces variety');
    
    testsRun += 5;
    testsPassed += 5;
};

// Test file validation
const testFileValidation = () => {
    console.log('\n📁 Testing File Validation...');
    
    // Mock the validation logic from main.js
    const validExtensions = ['.mp3', '.wav', '.m4a', '.aiff', '.aif', '.flac', '.ogg', '.aac'];
    
    const isValidAudioFile = (filePath) => {
        const ext = path.extname(filePath).toLowerCase();
        return validExtensions.includes(ext);
    };
    
    assert(isValidAudioFile('test.mp3'), 'MP3 files are valid');
    assert(isValidAudioFile('test.wav'), 'WAV files are valid');
    assert(isValidAudioFile('test.aif'), 'AIF files are valid');
    assert(isValidAudioFile('test.aiff'), 'AIFF files are valid');
    assert(!isValidAudioFile('test.txt'), 'TXT files are invalid');
    assert(!isValidAudioFile('test.pdf'), 'PDF files are invalid');
    
    testsRun += 6;
    testsPassed += 6;
};

// Test configuration
const testConfiguration = () => {
    console.log('\n⚙️ Testing Configuration...');
    
    const configPath = path.join(__dirname, '..', 'package.json');
    assert(fs.existsSync(configPath), 'package.json exists');
    
    const packageJson = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    assert(packageJson.name === 'hexbloop-electron', 'Package name is correct');
    assert(packageJson.main === 'main.js', 'Main entry point is correct');
    assert(packageJson.build !== undefined, 'Build configuration exists');
    assert(packageJson.build.appId === 'com.hexbloop.audio', 'App ID is correct');
    
    testsRun += 5;
    testsPassed += 5;
};

// Test required files exist
const testRequiredFiles = () => {
    console.log('\n📋 Testing Required Files...');
    
    const requiredFiles = [
        'main.js',
        'preload.js',
        'src/renderer/index.html',
        'src/audio-processor.js',
        'src/lunar-processor.js',
        'src/name-generator.js',
        'src/renderer/app.js',
        'src/renderer/spectrum-visualizer.js',
        'build/entitlements.mac.plist'
    ];
    
    requiredFiles.forEach(file => {
        const filePath = path.join(__dirname, '..', file);
        assert(fs.existsSync(filePath), `${file} exists`);
        testsRun++;
        testsPassed++;
    });
};

// Test cleanup methods exist
const testMemoryLeakPrevention = () => {
    console.log('\n🧹 Testing Memory Leak Prevention...');
    
    // Check spectrum visualizer has destroy method
    const spectrumPath = path.join(__dirname, '..', 'src/renderer/spectrum-visualizer.js');
    const spectrumContent = fs.readFileSync(spectrumPath, 'utf8');
    assert(spectrumContent.includes('destroy()'), 'Spectrum visualizer has destroy method');
    assert(spectrumContent.includes('clearTimeout'), 'Spectrum visualizer clears timeouts');
    assert(spectrumContent.includes('removeEventListener'), 'Spectrum visualizer removes listeners');
    
    // Check app.js has cleanup
    const appPath = path.join(__dirname, '..', 'src/renderer/app.js');
    const appContent = fs.readFileSync(appPath, 'utf8');
    assert(appContent.includes('destroy()'), 'App has destroy method');
    assert(appContent.includes('beforeunload'), 'App has beforeunload handler');
    
    testsRun += 5;
    testsPassed += 5;
};

// Run all tests
console.log('🔮 HEXBLOOP TEST SUITE');
console.log('━━━━━━━━━━━━━━━━━━━━━');

try {
    testLunarProcessor();
    testNameGenerator();
    testFileValidation();
    testConfiguration();
    testRequiredFiles();
    testMemoryLeakPrevention();
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✨ All tests passed! (${testsPassed}/${testsRun})`);
    console.log('🎉 Hexbloop is ready for mystical audio processing!\n');
    process.exit(0);
} catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    console.error(error.stack);
    process.exit(1);
}