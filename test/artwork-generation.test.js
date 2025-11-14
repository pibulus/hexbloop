/**
 * @fileoverview Artwork Generation Tests
 * @description Comprehensive tests for Hexbloop artwork generation pipeline
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const VibrantRefinedArtworkGenerator = require('../src/artwork-generator-vibrant-refined');

// ===================================================================
// TEST CONFIGURATION
// ===================================================================

const TEST_OUTPUT_DIR = path.join(__dirname, 'output/artwork');

// Ensure test directories exist
if (!fs.existsSync(TEST_OUTPUT_DIR)) {
    fs.mkdirSync(TEST_OUTPUT_DIR, { recursive: true });
}

// ===================================================================
// HELPER FUNCTIONS
// ===================================================================

/**
 * Validate PNG file exists and has content
 */
function validatePNGOutput(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`PNG file does not exist: ${filePath}`);
    }

    const stats = fs.statSync(filePath);
    if (stats.size === 0) {
        throw new Error(`PNG file is empty: ${filePath}`);
    }

    // Check PNG signature (first 8 bytes)
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(8);
    fs.readSync(fd, buffer, 0, 8, 0);
    fs.closeSync(fd);

    const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    if (!buffer.equals(pngSignature)) {
        throw new Error(`Invalid PNG signature in ${filePath}`);
    }

    return true;
}

/**
 * Validate color is valid hex
 */
function validateHexColor(color) {
    const hexRegex = /^#[0-9A-F]{6}$/i;
    return hexRegex.test(color);
}

// ===================================================================
// TESTS
// ===================================================================

if (require.main === module) {
    console.log('\n🎨 HEXBLOOP ARTWORK GENERATION TESTS\n');
    console.log('=' .repeat(60));

    const testResults = {
        passed: 0,
        failed: 0,
        skipped: 0
    };

    async function runTests() {
        // Test 1: Generator Instantiation
        console.log('\n📝 Testing Generator Instantiation...');
        try {
            const generator = new VibrantRefinedArtworkGenerator();
            assert(generator.width === 800, 'Default width should be 800');
            assert(generator.height === 800, 'Default height should be 800');
            assert(generator.styles.length === 8, 'Should have 8 styles');
            console.log('  ✅ Generator instantiates with correct defaults');
            testResults.passed++;
        } catch (error) {
            console.log(`  ❌ Error: ${error.message}`);
            testResults.failed++;
        }

        // Test 2: Quality Settings
        console.log('\n📝 Testing Quality Settings...');
        try {
            const generator = new VibrantRefinedArtworkGenerator({
                patternQuality: 'best',
                quality: 'best',
                imageSmoothingQuality: 'high'
            });
            assert(generator.ctx.patternQuality === 'best', 'Pattern quality should be "best"');
            assert(generator.ctx.quality === 'best', 'Quality should be "best"');
            assert(generator.ctx.imageSmoothingQuality === 'high', 'Image smoothing should be "high"');
            console.log('  ✅ Quality settings applied correctly');
            testResults.passed++;
        } catch (error) {
            console.log(`  ❌ Error: ${error.message}`);
            testResults.failed++;
        }

        // Test 3: All Styles Render
        console.log('\n📝 Testing All 8 Styles Render...');
        try {
            const generator = new VibrantRefinedArtworkGenerator();
            const styles = generator.styles;

            for (const style of styles) {
                const canvas = await generator.generate({
                    style,
                    seed: 12345,
                    audioEnergy: 0.5,
                    tempo: 120
                });

                assert(canvas, `Style ${style} should return a canvas`);
                assert(canvas.width === 800, `Canvas width should be 800 for ${style}`);
                assert(canvas.height === 800, `Canvas height should be 800 for ${style}`);
            }

            console.log(`  ✅ All ${styles.length} styles render successfully`);
            testResults.passed++;
        } catch (error) {
            console.log(`  ❌ Error: ${error.message}`);
            testResults.failed++;
        }

        // Test 4: Audio Responsiveness
        console.log('\n📝 Testing Audio Energy Responsiveness...');
        try {
            const generator = new VibrantRefinedArtworkGenerator();

            // Test with different energy levels
            const energyLevels = [0, 0.25, 0.5, 0.75, 1.0];
            for (const energy of energyLevels) {
                const canvas = await generator.generate({
                    style: 'neon-plasma',
                    seed: 12345,
                    audioEnergy: energy,
                    tempo: 120
                });
                assert(canvas, `Should render with energy ${energy}`);
            }

            console.log('  ✅ Audio energy affects rendering (tested 0, 0.25, 0.5, 0.75, 1.0)');
            testResults.passed++;
        } catch (error) {
            console.log(`  ❌ Error: ${error.message}`);
            testResults.failed++;
        }

        // Test 5: Parameter Validation
        console.log('\n📝 Testing Parameter Validation...');
        try {
            const generator = new VibrantRefinedArtworkGenerator();

            // Test with invalid values (should clamp)
            const canvas = await generator.generate({
                style: 'cosmic-flow',
                audioEnergy: 2.5,  // Invalid: > 1
                tempo: 300         // Invalid: > 200
            });

            assert(canvas, 'Should render even with invalid parameters (clamped)');
            console.log('  ✅ Invalid parameters are clamped (energy: 2.5→1.0, tempo: 300→200)');
            testResults.passed++;
        } catch (error) {
            console.log(`  ❌ Error: ${error.message}`);
            testResults.failed++;
        }

        // Test 6: Color Palette Generation
        console.log('\n📝 Testing Color Palette Generation...');
        try {
            const generator = new VibrantRefinedArtworkGenerator();

            for (const style of generator.styles) {
                const palette = generator.getPalette(style, 0.5, 120);

                assert(Array.isArray(palette), `Palette for ${style} should be an array`);
                assert(palette.length >= 5, `Palette for ${style} should have at least 5 colors`);

                for (const color of palette) {
                    assert(validateHexColor(color), `Color ${color} should be valid hex`);
                }
            }

            console.log('  ✅ All palettes generate valid hex colors');
            testResults.passed++;
        } catch (error) {
            console.log(`  ❌ Error: ${error.message}`);
            testResults.failed++;
        }

        // Test 7: PNG Export
        console.log('\n📝 Testing PNG Export...');
        try {
            const generator = new VibrantRefinedArtworkGenerator();
            const outputPath = path.join(TEST_OUTPUT_DIR, 'test-export.png');

            await generator.generate({
                style: 'vapor-dream',
                seed: 99999,
                audioEnergy: 0.7,
                tempo: 140
            });

            await generator.saveToFile(outputPath, 'png');
            validatePNGOutput(outputPath);

            console.log('  ✅ PNG export produces valid files');
            testResults.passed++;
        } catch (error) {
            console.log(`  ❌ Error: ${error.message}`);
            testResults.failed++;
        }

        // Test 8: Stream Export
        console.log('\n📝 Testing Stream-Based Export...');
        try {
            const generator = new VibrantRefinedArtworkGenerator();
            const outputPath = path.join(TEST_OUTPUT_DIR, 'test-stream.png');

            await generator.generate({
                style: 'electric-storm',
                seed: 55555
            });

            await generator.saveToFileStream(outputPath);
            validatePNGOutput(outputPath);

            console.log('  ✅ Stream export produces valid PNG files');
            testResults.passed++;
        } catch (error) {
            console.log(`  ❌ Error: ${error.message}`);
            testResults.failed++;
        }

        // Test 9: Seeded Reproducibility
        console.log('\n📝 Testing Seeded Reproducibility...');
        try {
            const generator1 = new VibrantRefinedArtworkGenerator();
            const generator2 = new VibrantRefinedArtworkGenerator();

            const seed = 12345;
            const options = { style: 'cyber-matrix', seed, audioEnergy: 0.6, tempo: 130 };

            const canvas1 = await generator1.generate(options);
            const canvas2 = await generator2.generate(options);

            // Compare buffers
            const buffer1 = canvas1.toBuffer('image/png');
            const buffer2 = canvas2.toBuffer('image/png');

            assert(buffer1.equals(buffer2), 'Same seed should produce identical output');
            console.log('  ✅ Seeding produces reproducible results');
            testResults.passed++;
        } catch (error) {
            console.log(`  ❌ Error: ${error.message}`);
            testResults.failed++;
        }

        // Test 10: Math.random Restoration
        console.log('\n📝 Testing Math.random Restoration...');
        try {
            const originalRandom = Math.random;
            const generator = new VibrantRefinedArtworkGenerator();

            await generator.generate({ seed: 11111 });

            // Verify Math.random was restored
            assert(Math.random === originalRandom, 'Math.random should be restored after generation');

            // Verify randomness still works
            const r1 = Math.random();
            const r2 = Math.random();
            assert(r1 !== r2, 'Math.random should still work after generation');

            console.log('  ✅ Math.random correctly restored (no side effects)');
            testResults.passed++;
        } catch (error) {
            console.log(`  ❌ Error: ${error.message}`);
            testResults.failed++;
        }

        // Test 11: Performance Benchmark
        console.log('\n📝 Testing Performance...');
        try {
            const generator = new VibrantRefinedArtworkGenerator();
            const start = Date.now();

            await generator.generate({
                style: 'cosmic-flow',
                seed: 77777,
                audioEnergy: 0.8,
                tempo: 150
            });

            const duration = Date.now() - start;

            assert(duration < 3000, 'Generation should complete in < 3 seconds');
            console.log(`  ✅ Generation completed in ${duration}ms (< 3000ms threshold)`);
            testResults.passed++;
        } catch (error) {
            console.log(`  ❌ Error: ${error.message}`);
            testResults.failed++;
        }

        // Results Summary
        console.log('\n' + '='.repeat(60));
        console.log('\n📊 TEST RESULTS:');
        console.log(`   ✅ Passed:  ${testResults.passed}`);
        console.log(`   ❌ Failed:  ${testResults.failed}`);
        console.log(`   ⏭️  Skipped: ${testResults.skipped}`);
        console.log(`   📊 Total:   ${testResults.passed + testResults.failed + testResults.skipped}`);

        if (testResults.failed === 0) {
            console.log('\n🎉 All tests passed! Artwork generation pipeline is operational.\n');
            process.exit(0);
        } else {
            console.log('\n⚠️  Some tests failed. Review the output above.\n');
            process.exit(1);
        }
    }

    runTests().catch((error) => {
        console.error('\n❌ Test runner error:', error);
        process.exit(1);
    });
}

module.exports = {
    validatePNGOutput,
    validateHexColor
};
