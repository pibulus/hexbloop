#!/usr/bin/env node

const NameGenerator = require('./src/name-generator');
const LunarProcessor = require('./src/lunar-processor');

console.log('\n========================================');
console.log('HEXBLOOP NAME GENERATOR TEST');
console.log('========================================\n');

// Get current moon phase
const moonPhase = LunarProcessor.getMoonPhase();
console.log(`Current Moon Phase: ${moonPhase.name} (${(moonPhase.illumination * 100).toFixed(1)}% illuminated)`);
console.log(`Phase value: ${moonPhase.phase.toFixed(3)}`);
console.log('----------------------------------------\n');

// Generate various names
console.log('GENERATED NAMES (10 samples):');
console.log('----------------------------------------');
for (let i = 0; i < 10; i++) {
    const name = NameGenerator.generateMystical({ moonPhase });
    console.log(`  ${i + 1}. ${name}.mp3`);
}

console.log('\n----------------------------------------');
console.log('CLEAN NAMES (5 samples):');
console.log('----------------------------------------');
for (let i = 0; i < 5; i++) {
    const name = NameGenerator.generateCleanName();
    console.log(`  ${i + 1}. ${name}`);
}

console.log('\n----------------------------------------');
console.log('LUNAR-INFLUENCED NAMES (5 samples):');
console.log('----------------------------------------');
for (let i = 0; i < 5; i++) {
    const name = NameGenerator.generateLunarName(moonPhase);
    console.log(`  ${i + 1}. ${name}`);
}

console.log('\n----------------------------------------');
console.log('STYLED NAMES:');
console.log('----------------------------------------');
const styles = ['minimal', 'technical', 'atmospheric', 'mystical'];
styles.forEach(style => {
    const name = NameGenerator.generateStyledName(style);
    console.log(`  ${style}: ${name}`);
});

console.log('\n========================================\n');

// Show time-based influence
const hour = new Date().getHours();
const timeOfDay = hour < 6 ? 'Late Night' : hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening';
console.log(`Time: ${hour}:00 (${timeOfDay})`);
console.log('Names will lean more ' + (hour >= 22 || hour <= 6 ? 'atmospheric/mystical' : 'clean/technical'));
console.log('\n');