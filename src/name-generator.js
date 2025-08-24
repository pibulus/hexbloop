/**
 * @fileoverview Mystical name generator with style variations
 * @author Hexbloop Audio Labs
 * @description Generates mystical names influenced by time and lunar cycles
 */

class NameGenerator {
    // === Word Categories (400+ mystical words) ===
    
    // Temporal/Cosmic/Tech/Dark/Elements/Power
    static starterWords = [
        "QUANTUM", "DIGITAL", "NEURAL", "CYBER", "VIRAL", "MATRIX", "BINARY", "PHANTOM", "SHADOW", "MYSTIC",
        "ASTRAL", "COSMIC", "STELLAR", "LUNAR", "SOLAR", "VOID", "CHAOS", "PRISM", "CRYSTAL", "PLASMA",
        "NEON", "CHROME", "STEEL", "ACID", "TOXIC", "ATOMIC", "KINETIC", "ELECTRIC", "MAGNETIC", "SONIC",
        "PSYCHIC", "MENTAL", "DREAM", "GHOST", "SPIRIT", "ETHERIC", "ASTRAL", "OCCULT", "MYSTIC", "WITCH",
        "CRYPT", "GRAVE", "TOMB", "DEATH", "BLOOD", "BONE", "SKULL", "DEMON", "DEVIL", "HELL",
        "FIRE", "ICE", "FROST", "STORM", "THUNDER", "LIGHTNING", "WIND", "EARTH", "WATER", "METAL",
        "DARK", "LIGHT", "BRIGHT", "GLOW", "SHINE", "SPARK", "FLASH", "BEAM", "WAVE", "PULSE",
        "POWER", "FORCE", "ENERGY", "RAGE", "FURY", "WRATH", "HATE", "LOVE", "PEACE", "WAR",
        "TIME", "SPACE", "DIMENSION", "REALITY", "TRUTH", "FALSE", "REAL", "FAKE", "TRUE", "LIE"
    ];
    
    // Core concepts/Tech/Occult/Horror
    static middleWords = [
        "MACHINE", "ENGINE", "SYSTEM", "NETWORK", "PROTOCOL", "ALGORITHM", "PROGRAM", "CODE", "DATA", "BYTE",
        "FLUX", "FLOW", "STREAM", "CURRENT", "WAVE", "SIGNAL", "FREQUENCY", "RESONANCE", "VIBRATION", "ECHO",
        "RITUAL", "SPELL", "CHARM", "HEX", "CURSE", "MAGIC", "POWER", "FORCE", "ENERGY", "AURA",
        "PORTAL", "GATEWAY", "DIMENSION", "REALM", "WORLD", "UNIVERSE", "GALAXY", "STAR", "PLANET", "MOON",
        "NIGHTMARE", "HORROR", "TERROR", "FEAR", "PANIC", "DOOM", "GLOOM", "SHADOW", "DARKNESS", "LIGHT"
    ];
    
    // Tech/Digital/Dark/Power nouns
    static enderWords = [
        "CORE", "MATRIX", "NEXUS", "HUB", "NODE", "TERMINAL", "INTERFACE", "GATEWAY", "PORTAL", "BRIDGE",
        "VOID", "ABYSS", "CHASM", "PIT", "HOLE", "CAVE", "TOMB", "CRYPT", "GRAVE", "ALTAR",
        "THRONE", "CROWN", "SWORD", "BLADE", "DAGGER", "SPEAR", "ARROW", "BOLT", "SPARK", "FLAME",
        "CRYSTAL", "GEM", "STONE", "ROCK", "METAL", "STEEL", "IRON", "GOLD", "SILVER", "COPPER"
    ];
    
    // Aggressive/Movement/Tech verbs
    static verbStarters = [
        "CRUSH", "DESTROY", "ANNIHILATE", "OBLITERATE", "DEVASTATE", "SHATTER", "BREAK", "KILL", "MURDER", "SLAUGHTER",
        "HACK", "CRACK", "EXPLOIT", "PENETRATE", "INFILTRATE", "CORRUPT", "VIRUS", "INFECT", "POISON", "TOXIC",
        "DANCE", "MOVE", "FLOW", "STREAM", "RUSH", "SURGE", "BLAST", "EXPLODE", "BURST", "FLASH"
    ];
    
    // Dark/metal vocabulary
    static blackmetalWords = [
        "NECRO", "GRIMM", "KVLT", "TRVE", "FROSTBITTEN", "WINTERMOON", "DARKTHRONE", "IMMORTAL", "EMPEROR", "MAYHEM",
        "BLASPHEMY", "HERESY", "SACRILEGE", "PROFANE", "UNHOLY", "CURSED", "DAMNED", "DOOMED", "FALLEN", "LOST",
        "CORPSE", "CADAVER", "SKELETON", "SKULL", "BONES", "FLESH", "BLOOD", "GORE", "CARNAGE", "MASSACRE",
        "THRONE", "KINGDOM", "EMPIRE", "REALM", "DOMAIN", "TERRITORY", "LAND", "WORLD", "UNIVERSE", "COSMOS",
        "RITUAL", "CEREMONY", "SACRIFICE", "OFFERING", "WORSHIP", "PRAYER", "CHANT", "INCANTATION", "SPELL", "CURSE"
    ];
    
    // Bright/positive vocabulary
    static sparklepopWords = [
        "RAINBOW", "UNICORN", "FAIRY", "ANGEL", "HEAVEN", "PARADISE", "DREAM", "FANTASY", "MAGIC", "MIRACLE",
        "SPARKLE", "GLITTER", "SHIMMER", "SHINE", "GLOW", "RADIANCE", "BRILLIANCE", "LUMINOUS", "BRIGHT", "LIGHT",
        "CRYSTAL", "DIAMOND", "PEARL", "JEWEL", "GEM", "TREASURE", "GOLD", "SILVER", "PLATINUM", "PRECIOUS",
        "BUTTERFLY", "FLOWER", "BLOSSOM", "PETAL", "ROSE", "LILY", "DAISY", "SUNFLOWER", "TULIP", "ORCHID",
        "PRINCESS", "QUEEN", "GODDESS", "ANGEL", "STAR", "MOON", "SUN", "COMET", "METEOR", "GALAXY"
    ];
    
    // === Style-Specific Symbols ===
    static witchHouseSymbols = ["†", "‡", "§", "¶", "∆", "◊", "◯", "◇", "△", "▲", "▼", "►", "◄", "♠", "♣", "♥", "♦"];
    static vaporwaveSymbols = ["ａ", "ｂ", "ｃ", "ｄ", "ｅ", "ｆ", "ｇ", "ｈ", "ｉ", "ｊ", "ｋ", "ｌ", "ｍ", "ｎ", "ｏ", "ｐ"];
    static sparklepopSymbols = ["♡", "♥", "★", "☆", "✧", "✦", "✨", "💫", "🌟", "⭐", "✩", "❤", "💖", "💕", "💝", "💗"];
    static zalgoMarks = ["̴", "̵", "̶", "̷", "̸", "̡", "̢", "̧", "̨", "̩", "̪", "̫", "̬", "̭", "̮", "̯"];
    static numerologyNumbers = ["111", "222", "333", "444", "555", "666", "777", "888", "999", "1111", "2222", "3333"];
    static asciiElements = ["░", "▒", "▓", "█", "▄", "▀", "■", "□", "▪", "▫", "◘", "◙", "◚", "◛", "◜", "◝"];
    
    static connectorWords = ["OF", "THE", "AND", "IN", "ON", "AT", "BY", "FOR", "WITH", "FROM", "TO", "AS", "IS", "ARE", "BE", "WAS", "WERE"];
    
    static generateName() {
        const starter = this.starterWords[Math.floor(Math.random() * this.starterWords.length)];
        const middle = this.middleWords[Math.floor(Math.random() * this.middleWords.length)];
        const ender = this.enderWords[Math.floor(Math.random() * this.enderWords.length)];
        
        // 30% chance to add connector
        const useConnector = Math.random() < 0.3;
        if (useConnector) {
            const connector = this.connectorWords[Math.floor(Math.random() * this.connectorWords.length)];
            return `${starter} ${connector} ${middle} ${ender}`;
        }
        
        return `${starter} ${middle} ${ender}`;
    }
    
    static generateWithGlitch() {
        let name = this.generateName();
        
        const glitchChance = Math.random();
        
        if (glitchChance < 0.3) {
            // Character substitution
            name = name.replace(/A/g, '∆')
                      .replace(/E/g, '∃')
                      .replace(/O/g, '◯')
                      .replace(/I/g, '|')
                      .replace(/S/g, '§')
                      .replace(/T/g, '†');
        }
        
        if (glitchChance < 0.2) {
            // Add symbols
            const symbol = this.witchHouseSymbols[Math.floor(Math.random() * this.witchHouseSymbols.length)];
            name = symbol + name + symbol;
        }
        
        if (glitchChance < 0.1) {
            // Zalgo text
            const zalgoMark = this.zalgoMarks[Math.floor(Math.random() * this.zalgoMarks.length)];
            name = name.split('').map(char => char + zalgoMark).join('');
        }
        
        return name;
    }
    
    // === Style Generation ===
    static generateByStyle(style) {
        let words, symbols;
        
        switch (style) {
            case 'sparklepop':  // Bright, magical
                words = [...this.sparklepopWords, ...this.starterWords.slice(0, 20)];
                symbols = this.sparklepopSymbols;
                break;
            case 'blackmetal':  // Dark, aggressive
                words = [...this.blackmetalWords, ...this.starterWords.slice(40, 60)];
                symbols = this.witchHouseSymbols;
                break;
            case 'witchhouse':  // Mystical, occult
                words = [...this.starterWords.slice(30, 50), ...this.middleWords.slice(20, 30)];
                symbols = this.witchHouseSymbols;
                break;
            case 'vaporwave':   // Digital, aesthetic
                words = [...this.starterWords.slice(0, 30), ...this.middleWords.slice(0, 20)];
                symbols = this.vaporwaveSymbols;
                break;
            default:
                return this.generateName();
        }
        
        const word1 = words[Math.floor(Math.random() * words.length)];
        const word2 = words[Math.floor(Math.random() * words.length)];
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];
        
        // 30% chance for numerology
        const useNumber = Math.random() < 0.3;
        const number = useNumber ? this.numerologyNumbers[Math.floor(Math.random() * this.numerologyNumbers.length)] : '';
        
        return `${symbol} ${word1} ${word2} ${number} ${symbol}`.trim();
    }
    
    // === Lunar/Time-Influenced Generation ===
    static generateMystical() {
        const now = new Date();
        const hour = now.getHours();
        const day = now.getDate();
        
        let style = 'mixed';
        
        // Time-based style selection
        if (hour >= 22 || hour <= 6) {
            style = Math.random() < 0.6 ? 'blackmetal' : 'witchhouse';  // Night
        }
        else if (hour >= 6 && hour <= 18) {
            style = Math.random() < 0.5 ? 'sparklepop' : 'mixed';       // Day
        }
        else {
            style = Math.random() < 0.7 ? 'witchhouse' : 'mixed';       // Evening
        }
        
        // Lunar override
        const lunarDay = day % 29;
        if (lunarDay < 7) {  // New moon
            style = Math.random() < 0.8 ? 'blackmetal' : 'witchhouse';
        } else if (lunarDay > 22) {  // Full moon
            style = Math.random() < 0.6 ? 'sparklepop' : 'witchhouse';
        }
        
        return this.generateByStyle(style);
    }
}

module.exports = NameGenerator;