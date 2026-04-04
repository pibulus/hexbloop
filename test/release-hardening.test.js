/**
 * @fileoverview Release hardening regression tests
 * @description Locks in fixes for naming behavior and artwork settings alignment
 */

const assert = require('assert');
const BatchNamingEngine = require('../src/batch/batch-naming-engine');
const { SETTINGS_SCHEMA } = require('../src/shared/settings-schema');

console.log('\n🔒 HEXBLOOP RELEASE HARDENING TESTS\n');

function testArtworkStyleSchema() {
    const expectedStyles = [
        'auto',
        'neon-plasma',
        'cosmic-flow',
        'vapor-dream',
        'cyber-matrix',
        'sunset-liquid',
        'electric-storm',
        'crystal-prism',
        'ocean-aurora'
    ];

    assert.deepStrictEqual(
        SETTINGS_SCHEMA.artwork.defaultStyle,
        expectedStyles,
        'Artwork style schema should match the actual generator/UI styles'
    );
}

function testHybridNumbering() {
    const engine = new BatchNamingEngine({
        namingScheme: 'hybrid',
        numberingStyle: 'numeric',
        numberingPadding: 2,
        separator: '_'
    });

    const output = engine.generateName('/tmp/Kick Loop.wav', 0, 3);
    assert(/_01$/.test(output), 'Hybrid naming should append numbering once');
    assert(!/_01_01$/.test(output), 'Hybrid naming should not duplicate numbering');
}

function testAppendOriginalName() {
    const engine = new BatchNamingEngine({
        namingScheme: 'mystical',
        preserveOriginal: true,
        numberingStyle: 'none',
        separator: '_'
    });

    const output = engine.generateName('/tmp/Ambient Pad.wav', 0, 1);
    assert(output.includes('Ambient Pad'), 'Generated names should be able to append the source filename');
}

function testPreserveSchemeUsesOriginalName() {
    const engine = new BatchNamingEngine({
        namingScheme: 'preserve',
        preserveOriginal: false,
        numberingStyle: 'none',
        separator: '_'
    });

    const output = engine.generateName('/tmp/Voice Note.wav', 0, 1);
    assert.strictEqual(output, 'Voice Note', 'Preserve mode should keep the original base filename');
}

try {
    testArtworkStyleSchema();
    console.log('✅ Artwork style schema matches runtime styles');

    testHybridNumbering();
    console.log('✅ Hybrid naming no longer duplicates numbering');

    testAppendOriginalName();
    console.log('✅ Generated naming can append the source filename');

    testPreserveSchemeUsesOriginalName();
    console.log('✅ Preserve mode keeps the original filename');

    console.log('\n🎉 Release hardening regressions passed.\n');
} catch (error) {
    console.error(`❌ ${error.message}`);
    process.exit(1);
}
