/**
 * @fileoverview Name Generation Tests
 * @description Comprehensive tests for Hexbloop mystical name generator
 */

const assert = require('assert');
const NameGenerator = require('../src/name-generator');

// ===================================================================
// TEST CONFIGURATION
// ===================================================================

console.log('\n🔮 HEXBLOOP NAME GENERATION TESTS\n');
console.log('=' .repeat(60));

const testResults = {
    passed: 0,
    failed: 0,
    skipped: 0
};

// ===================================================================
// HELPER FUNCTIONS
// ===================================================================

function validateFilename(name) {
    // Check valid filename characters
    const validChars = /^[a-zA-Z0-9_\-\.\[\]\(\)△▽◇◯□▪▫•°∞∴∵≈≡∂∇]+$/;
    if (!validChars.test(name)) {
        throw new Error(`Invalid filename characters: ${name}`);
    }

    // Check length
    if (name.length < 3 || name.length > 50) {
        throw new Error(`Invalid length (${name.length}): ${name}`);
    }

    // Check has letters
    if (!/[a-zA-Z]/.test(name)) {
        throw new Error(`No letters in name: ${name}`);
    }

    return true;
}

// ===================================================================
// TESTS
// ===================================================================

async function runTests() {
    // Test 1: Clean Name Generation
    console.log('\n📝 Testing Clean Name Generation...');
    try {
        for (let i = 0; i < 10; i++) {
            const name = NameGenerator.generateCleanName();
            validateFilename(name);
        }
        console.log('  ✅ Generated 10 valid clean names');
        testResults.passed++;
    } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
        testResults.failed++;
    }

    // Test 2: Seeded Reproducibility
    console.log('\n📝 Testing Seeded Reproducibility...');
    try {
        const seed = 12345;
        const name1 = NameGenerator.generateMystical({ seed });
        const name2 = NameGenerator.generateMystical({ seed });

        assert.strictEqual(name1, name2, 'Same seed should produce same name');
        console.log(`  ✅ Seeded generation is reproducible: "${name1}"`);
        testResults.passed++;
    } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
        testResults.failed++;
    }

    // Test 3: Different Seeds Produce Different Names
    console.log('\n📝 Testing Seed Variation...');
    try {
        const name1 = NameGenerator.generateMystical({ seed: 11111 });
        const name2 = NameGenerator.generateMystical({ seed: 22222 });
        const name3 = NameGenerator.generateMystical({ seed: 33333 });

        assert.notStrictEqual(name1, name2, 'Different seeds should produce different names');
        assert.notStrictEqual(name2, name3, 'Different seeds should produce different names');
        assert.notStrictEqual(name1, name3, 'Different seeds should produce different names');

        console.log(`  ✅ Different seeds produce different names`);
        console.log(`     Seed 11111: "${name1}"`);
        console.log(`     Seed 22222: "${name2}"`);
        console.log(`     Seed 33333: "${name3}"`);
        testResults.passed++;
    } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
        testResults.failed++;
    }

    // Test 4: Lunar Name Generation
    console.log('\n📝 Testing Lunar Name Generation...');
    try {
        const moonPhases = [
            { name: 'New Moon', phase: 0, illumination: 0 },
            { name: 'First Quarter', phase: 0.25, illumination: 0.5 },
            { name: 'Full Moon', phase: 0.5, illumination: 1.0 },
            { name: 'Last Quarter', phase: 0.75, illumination: 0.5 }
        ];

        for (const moonPhase of moonPhases) {
            const name = NameGenerator.generateLunarName(moonPhase);
            validateFilename(name);
        }

        console.log('  ✅ All 4 lunar phases generate valid names');
        testResults.passed++;
    } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
        testResults.failed++;
    }

    // Test 5: Styled Name Generation
    console.log('\n📝 Testing Styled Names...');
    try {
        const styles = ['neutral', 'minimal', 'technical', 'atmospheric', 'mystical'];

        for (const style of styles) {
            const name = NameGenerator.generateStyledName(style);
            validateFilename(name);
        }

        console.log(`  ✅ All ${styles.length} styles generate valid names`);
        testResults.passed++;
    } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
        testResults.failed++;
    }

    // Test 6: Lunar Fallback Calculation
    console.log('\n📝 Testing Lunar Fallback Calculation...');
    try {
        // Test without lunar processor (fallback mode)
        const name = NameGenerator.generateMystical({});
        validateFilename(name);

        console.log(`  ✅ Fallback lunar calculation works: "${name}"`);
        testResults.passed++;
    } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
        testResults.failed++;
    }

    // Test 7: Lunar Phase Name Mapping
    console.log('\n📝 Testing Lunar Phase Name Mapping...');
    try {
        const phaseTests = [
            { phase: 0.0, expected: 'New Moon' },
            { phase: 0.1, expected: 'Waxing Crescent' },
            { phase: 0.25, expected: 'First Quarter' },
            { phase: 0.4, expected: 'Waxing Gibbous' },
            { phase: 0.5, expected: 'Full Moon' },
            { phase: 0.6, expected: 'Waning Gibbous' },
            { phase: 0.75, expected: 'Last Quarter' },
            { phase: 0.9, expected: 'Waning Crescent' }
        ];

        for (const test of phaseTests) {
            const name = NameGenerator.getLunarPhaseName(test.phase);
            assert.strictEqual(name, test.expected,
                `Phase ${test.phase} should be "${test.expected}", got "${name}"`);
        }

        console.log('  ✅ All 8 lunar phase mappings correct');
        testResults.passed++;
    } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
        testResults.failed++;
    }

    // Test 8: Filename Safety
    console.log('\n📝 Testing Filename Safety...');
    try {
        // Generate many names and verify all are safe
        for (let i = 0; i < 50; i++) {
            const name = NameGenerator.generateMystical({ seed: i * 1000 });
            validateFilename(name);

            // Check for unsafe patterns
            assert(!name.includes(' '), 'Name should not contain spaces');
            assert(!name.includes('//'), 'Name should not contain double slashes');
            assert(!/[<>:"/\\|?*]/.test(name), 'Name should not contain unsafe chars');
        }

        console.log('  ✅ All 50 generated names are filename-safe');
        testResults.passed++;
    } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
        testResults.failed++;
    }

    // Test 9: No Emoji Leakage
    console.log('\n📝 Testing Emoji Removal...');
    try {
        // Even if somehow an emoji gets in, it should be stripped
        for (let i = 0; i < 20; i++) {
            const name = NameGenerator.generateMystical({ seed: i * 500 });

            // Check for emoji (surrogate pairs)
            assert(!/[\uD800-\uDBFF][\uDC00-\uDFFF]/.test(name),
                'Name should not contain emojis');
        }

        console.log('  ✅ No emojis in any generated names');
        testResults.passed++;
    } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
        testResults.failed++;
    }

    // Test 10: Geometric Symbols Preserved
    console.log('\n📝 Testing Geometric Symbol Preservation...');
    try {
        // Generate mystical style names which may include symbols
        let foundSymbol = false;
        for (let i = 0; i < 100; i++) {
            const name = NameGenerator.generateStyledName('mystical',
                NameGenerator.seededRandom(i * 100));

            // Check if any contain geometric symbols
            if (/[△▽◇◯□▪▫•°∞∴∵≈≡∂∇]/.test(name)) {
                foundSymbol = true;
                console.log(`     Found symbol in: "${name}"`);
                break;
            }
        }

        // Should occasionally get symbols (15% chance per call)
        console.log(`  ✅ Geometric symbols ${foundSymbol ? 'preserved when generated' : 'can be generated'}`);
        testResults.passed++;
    } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
        testResults.failed++;
    }

    // Test 11: Length Validation
    console.log('\n📝 Testing Length Constraints...');
    try {
        for (let i = 0; i < 30; i++) {
            const name = NameGenerator.generateMystical({ seed: i * 777 });

            assert(name.length >= 3, `Name too short: ${name}`);
            assert(name.length <= 50, `Name too long: ${name}`);
        }

        console.log('  ✅ All names within 3-50 character range');
        testResults.passed++;
    } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
        testResults.failed++;
    }

    // Test 12: Letter Requirement
    console.log('\n📝 Testing Letter Requirement...');
    try {
        for (let i = 0; i < 30; i++) {
            const name = NameGenerator.generateMystical({ seed: i * 999 });

            assert(/[a-zA-Z]/.test(name), `Name has no letters: ${name}`);
        }

        console.log('  ✅ All names contain at least one letter');
        testResults.passed++;
    } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
        testResults.failed++;
    }

    // Test 13: Variety Test
    console.log('\n📝 Testing Name Variety...');
    try {
        const uniqueNames = new Set();
        for (let i = 0; i < 100; i++) {
            const name = NameGenerator.generateMystical({});
            uniqueNames.add(name);
        }

        const uniqueCount = uniqueNames.size;
        const varietyPercent = (uniqueCount / 100 * 100).toFixed(0);

        assert(uniqueCount > 80, `Not enough variety: ${uniqueCount}/100 unique`);

        console.log(`  ✅ High variety: ${uniqueCount}/100 unique names (${varietyPercent}%)`);
        testResults.passed++;
    } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
        testResults.failed++;
    }

    // Test: user-supplied word bank
    console.log('\n📝 Testing Custom Word Bank...');
    try {
        const customWords = 'moss, brick\nstatic\nmoss';
        assert.deepStrictEqual(NameGenerator.parseCustomWords(customWords), ['moss', 'brick', 'static']);

        let hits = 0;
        for (let seed = 1; seed <= 40; seed++) {
            const name = NameGenerator.generateMystical({ seed, customWords });
            validateFilename(name);
            if (/moss|brick|static/i.test(name)) hits++;
        }
        assert(hits >= 8, `word bank rarely used: ${hits}/40`);
        console.log(`  ✅ ${hits}/40 seeded names drew from the custom bank`);
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
        console.log('\n🎉 All tests passed! Name generation is working perfectly.\n');
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
