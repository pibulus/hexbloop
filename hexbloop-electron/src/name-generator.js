/**
 * @fileoverview Mystical name generator with style variations
 * @author Hexbloop Audio Labs
 * @description Generates mystical names influenced by time and lunar cycles
 */

class NameGenerator {
    // Style-specific dictionaries for enhanced name generation
    static sparklepopPrefixes = [
        "GLITTER", "STAR", "RAINBOW", "BUBBLE", "CANDY",
        "DREAM", "MAGIC", "FAIRY", "CRYSTAL", "PRISM",
        "SHINE", "SPARKLE", "GLOW", "BEAM", "LIGHT"
    ];
    
    static sparklepopSuffixes = [
        "WAVE", "BEAM", "DREAM", "MAGIC", "SPELL",
        "CORE", "PULSE", "GLOW", "SHINE", "STAR",
        "FLUX", "VECTOR", "PRISM", "CRYSTAL", "DUST"
    ];
    
    static blackmetalPrefixes = [
        "DARK", "SHADOW", "DEATH", "VOID", "CHAOS",
        "CRYPT", "FROST", "DOOM", "HELL", "NIGHT",
        "BLOOD", "BONE", "GRAVE", "WITCH", "DEMON"
    ];
    
    static blackmetalSuffixes = [
        "RITUAL", "CULT", "SPELL", "GATE", "VOID",
        "TOMB", "RUNE", "CURSE", "OATH", "PACT",
        "RITE", "ALTAR", "THRONE", "CROWN", "SWORD"
    ];
    
    static witchhousePrefixes = [
        "WITCH", "COVEN", "LUNAR", "MYSTIC", "OCCULT",
        "ACID", "CYBER", "NEON", "PLASMA", "GHOST",
        "ASTRAL", "PSYCHIC", "COSMIC", "ETHEREAL", "SPIRIT"
    ];
    
    static witchhouseSuffixes = [
        "MACHINE", "VECTOR", "CIPHER", "NOISE", "PULSE",
        "CORE", "FLUX", "NETWORK", "PROTOCOL", "MATRIX",
        "RITUAL", "SPELL", "CHARM", "HEX", "CURSE"
    ];
    
    // Default/mixed style
    static prefixes = [
        "GLITTER", "CRYPT", "LUNAR", "SHADOW", "FROST",
        "VOID", "NEON", "ACID", "PLASMA", "GHOST",
        "CYBER", "MYSTIC", "WITCH", "DARK", "CHAOS"
    ];
    
    static suffixes = [
        "RITUAL", "MACHINE", "VECTOR", "CIPHER", "NOISE",
        "PULSE", "WAVE", "SPELL", "CULT", "DREAM",
        "CORE", "FLUX", "RUNE", "GATE", "VOID"
    ];
    
    static generateName() {
        const prefix = this.prefixes[Math.floor(Math.random() * this.prefixes.length)];
        const suffix = this.suffixes[Math.floor(Math.random() * this.suffixes.length)];
        const number = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
        
        return `${prefix}${suffix}${number}`;
    }
    
    static generateWithGlitch() {
        let name = this.generateName();
        
        // Apply some glitch effects (basic for now)
        const glitchChance = Math.random();
        
        if (glitchChance < 0.3) {
            // Replace some characters with similar looking ones
            name = name.replace(/A/g, '∆')
                      .replace(/E/g, '∃')
                      .replace(/O/g, '◯')
                      .replace(/I/g, '|');
        }
        
        if (glitchChance < 0.2) {
            // Add some random symbols
            const symbols = ['✧', '◆', '▲', '●', '◇', '△'];
            const symbol = symbols[Math.floor(Math.random() * symbols.length)];
            name = symbol + name + symbol;
        }
        
        return name;
    }
    
    static generateByStyle(style) {
        let prefixes, suffixes;
        
        switch (style) {
            case 'sparklepop':
                prefixes = this.sparklepopPrefixes;
                suffixes = this.sparklepopSuffixes;
                break;
            case 'blackmetal':
                prefixes = this.blackmetalPrefixes;
                suffixes = this.blackmetalSuffixes;
                break;
            case 'witchhouse':
                prefixes = this.witchhousePrefixes;
                suffixes = this.witchhouseSuffixes;
                break;
            default:
                prefixes = this.prefixes;
                suffixes = this.suffixes;
        }
        
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        const number = Math.floor(Math.random() * 9000) + 1000;
        
        return `${prefix}${suffix}${number}`;
    }
    
    static generateMystical() {
        // Generate a name influenced by current time and lunar influences
        const now = new Date();
        const hour = now.getHours();
        const day = now.getDate();
        
        // Choose style based on time and lunar phase
        let style = 'mixed';
        
        // Night time influences (10PM - 6AM) - darker styles
        if (hour >= 22 || hour <= 6) {
            style = Math.random() < 0.6 ? 'blackmetal' : 'witchhouse';
        }
        // Morning/day influences (6AM - 6PM) - brighter styles
        else if (hour >= 6 && hour <= 18) {
            style = Math.random() < 0.5 ? 'sparklepop' : 'mixed';
        }
        // Evening influences (6PM - 10PM) - mystical styles
        else {
            style = Math.random() < 0.7 ? 'witchhouse' : 'mixed';
        }
        
        // Lunar influence on style selection
        const lunarDay = day % 29; // Rough lunar cycle
        if (lunarDay < 7) { // New moon phase - darker
            style = Math.random() < 0.8 ? 'blackmetal' : 'witchhouse';
        } else if (lunarDay > 22) { // Full moon phase - brighter
            style = Math.random() < 0.6 ? 'sparklepop' : 'witchhouse';
        }
        
        return this.generateByStyle(style);
    }
}

module.exports = NameGenerator;