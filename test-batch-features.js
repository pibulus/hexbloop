#!/usr/bin/env node

const BatchNamingEngine = require('./src/batch/batch-naming-engine');
const { DEFAULT_SETTINGS } = require('./src/shared/settings-schema');

console.log('\n========================================');
console.log('HEXBLOOP BATCH PROCESSING TEST');
console.log('========================================\n');

// Test files for demonstration
const testFiles = [
    '/path/to/song1.mp3',
    '/path/to/track2.wav',
    '/path/to/demo3.m4a',
    '/path/to/loop4.flac',
    '/path/to/sample5.ogg'
];

// Test different naming schemes
const schemes = [
    {
        name: 'DEFAULT (Mystical)',
        settings: DEFAULT_SETTINGS.batch
    },
    {
        name: 'SEQUENTIAL WITH PREFIX',
        settings: {
            ...DEFAULT_SETTINGS.batch,
            namingScheme: 'sequential',
            prefix: 'demo',
            numberingStyle: 'numeric',
            numberingPadding: 3
        }
    },
    {
        name: 'TIMESTAMP WITH SESSION',
        settings: {
            ...DEFAULT_SETTINGS.batch,
            namingScheme: 'timestamp',
            sessionFolders: true,
            folderScheme: 'date'
        }
    },
    {
        name: 'HYBRID WITH SUFFIX',
        settings: {
            ...DEFAULT_SETTINGS.batch,
            namingScheme: 'hybrid',
            suffix: 'mastered',
            numberingStyle: 'alpha'
        }
    },
    {
        name: 'PRESERVE ORIGINAL',
        settings: {
            ...DEFAULT_SETTINGS.batch,
            namingScheme: 'preserve',
            preserveOriginal: true,
            sessionFolders: true,
            folderScheme: 'lunar'
        }
    },
    {
        name: 'ROMAN NUMERALS',
        settings: {
            ...DEFAULT_SETTINGS.batch,
            namingScheme: 'sequential',
            prefix: 'opus',
            numberingStyle: 'roman',
            separator: '-'
        }
    }
];

// Test each scheme
schemes.forEach(scheme => {
    console.log(`\n🎨 ${scheme.name}`);
    console.log('----------------------------------------');
    
    const engine = new BatchNamingEngine(scheme.settings);
    const preview = engine.previewBatch(testFiles);
    
    // Show session folder if applicable
    if (preview[0].folder) {
        console.log(`📁 Session Folder: ${preview[0].folder}/`);
    }
    
    // Show generated names
    preview.forEach((item, i) => {
        console.log(`  ${i + 1}. ${item.original} → ${item.generated}`);
    });
});

// Test output formats
console.log('\n\n🎵 OUTPUT FORMAT OPTIONS');
console.log('----------------------------------------');
const formats = ['mp3', 'wav', 'flac', 'aac', 'ogg'];
const qualityLevels = ['low', 'medium', 'high', 'maximum'];

formats.forEach(format => {
    console.log(`\n${format.toUpperCase()}:`);
    qualityLevels.forEach(quality => {
        let details = '';
        if (format === 'mp3') {
            const bitrate = quality === 'maximum' ? 320 : quality === 'high' ? 320 : quality === 'medium' ? 192 : 128;
            details = `${bitrate}kbps`;
        } else if (format === 'flac') {
            const compression = quality === 'maximum' ? 8 : quality === 'high' ? 5 : 2;
            details = `compression level ${compression}`;
        } else if (format === 'aac') {
            const bitrate = quality === 'maximum' ? 320 : quality === 'high' ? 256 : quality === 'medium' ? 192 : 128;
            details = `${bitrate}kbps`;
        }
        console.log(`  ${quality}: ${details}`);
    });
});

// Show batch processing capabilities
console.log('\n\n✨ BATCH PROCESSING CAPABILITIES');
console.log('----------------------------------------');
console.log('✅ Multiple naming schemes (mystical, sequential, timestamp, hybrid, preserve)');
console.log('✅ Custom prefix/suffix support');
console.log('✅ Numbering styles (numeric, alpha, roman)');
console.log('✅ Session folder organization (date, lunar, counter)');
console.log('✅ Multiple output formats (MP3, WAV, FLAC, AAC, OGG)');
console.log('✅ Quality presets (low, medium, high, maximum)');
console.log('✅ Manifest generation for session tracking');
console.log('✅ Lunar phase integration in naming');
console.log('⏳ Parallel processing (coming soon)');
console.log('⏳ Processing profiles (coming soon)');
console.log('⏳ Dry run preview (coming soon)');

console.log('\n========================================\n');