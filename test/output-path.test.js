/**
 * @fileoverview Unit tests for collision-safe output path resolution
 */

const assert = require('assert');
const path = require('path');
const { resolveUniqueOutputPath } = require('../src/shared/output-path');

console.log('\n🔮 HEXBLOOP OUTPUT PATH TESTS\n' + '='.repeat(60));

const results = { passed: 0, failed: 0 };
function test(name, fn) {
    try { fn(); console.log(`  ✅ ${name}`); results.passed++; }
    catch (e) { console.log(`  ❌ ${name}: ${e.message}`); results.failed++; }
}

const DIR = '/out';
const noDisk = () => false;

test('first file keeps its name', () => {
    const taken = new Set();
    const p = resolveUniqueOutputPath(DIR, 'song', 'mp3', taken, noDisk);
    assert.strictEqual(p, path.join(DIR, 'song.mp3'));
    assert(taken.has(p));
});

test('batch sibling with same name gets _2', () => {
    const taken = new Set();
    const a = resolveUniqueOutputPath(DIR, 'song', 'mp3', taken, noDisk);
    const b = resolveUniqueOutputPath(DIR, 'song', 'mp3', taken, noDisk);
    assert.strictEqual(a, path.join(DIR, 'song.mp3'));
    assert.strictEqual(b, path.join(DIR, 'song_2.mp3'));
});

test('three collisions → _2, _3', () => {
    const taken = new Set();
    const names = [0, 1, 2].map(() => resolveUniqueOutputPath(DIR, 'x', 'wav', taken, noDisk));
    assert.deepStrictEqual(names, [
        path.join(DIR, 'x.wav'),
        path.join(DIR, 'x_2.wav'),
        path.join(DIR, 'x_3.wav'),
    ]);
});

test('existing file on disk is skipped', () => {
    const taken = new Set();
    const onDisk = (p) => p === path.join(DIR, 'song.mp3');
    const p = resolveUniqueOutputPath(DIR, 'song', 'mp3', taken, onDisk);
    assert.strictEqual(p, path.join(DIR, 'song_2.mp3'));
});

test('disk AND batch collision both skipped', () => {
    const taken = new Set([path.join(DIR, 'song_2.mp3')]);
    const onDisk = (p) => p === path.join(DIR, 'song.mp3');
    const p = resolveUniqueOutputPath(DIR, 'song', 'mp3', taken, onDisk);
    assert.strictEqual(p, path.join(DIR, 'song_3.mp3'));
});

test('extension is respected', () => {
    const taken = new Set();
    const p = resolveUniqueOutputPath(DIR, 'track', 'flac', taken, noDisk);
    assert(p.endsWith('.flac'));
});

console.log('\n' + '='.repeat(60));
console.log(`\n📊 ${results.passed} passed, ${results.failed} failed\n`);
process.exit(results.failed === 0 ? 0 : 1);
