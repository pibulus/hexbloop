/**
 * @fileoverview Mystical name generator with style variations
 * @author Hexbloop Audio Labs
 * @description Generates mystical names influenced by time and lunar cycles
 */

class NameGenerator {
    // ADVANCED WORDLIST FROM ORIGINAL SWIFT VERSION
    // 5 distinct word categories with 400+ words total
    
    // Starter words (90 words) - Temporal/Cosmic, Tech/Digital, Dark/Occult, Elements, Power themes
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
    
    // Middle words (50+ words) - Core concepts, Tech/Digital, Occult/Mystical, Horror themes
    static middleWords = [
        "MACHINE", "ENGINE", "SYSTEM", "NETWORK", "PROTOCOL", "ALGORITHM", "PROGRAM", "CODE", "DATA", "BYTE",
        "FLUX", "FLOW", "STREAM", "CURRENT", "WAVE", "SIGNAL", "FREQUENCY", "RESONANCE", "VIBRATION", "ECHO",
        "RITUAL", "SPELL", "CHARM", "HEX", "CURSE", "MAGIC", "POWER", "FORCE", "ENERGY", "AURA",
        "PORTAL", "GATEWAY", "DIMENSION", "REALM", "WORLD", "UNIVERSE", "GALAXY", "STAR", "PLANET", "MOON",
        "NIGHTMARE", "HORROR", "TERROR", "FEAR", "PANIC", "DOOM", "GLOOM", "SHADOW", "DARKNESS", "LIGHT"
    ];
    
    // End words (40+ words) - Tech/Digital, Dark/Mystic, Power/Element, Cosmic nouns
    static enderWords = [
        "CORE", "MATRIX", "NEXUS", "HUB", "NODE", "TERMINAL", "INTERFACE", "GATEWAY", "PORTAL", "BRIDGE",
        "VOID", "ABYSS", "CHASM", "PIT", "HOLE", "CAVE", "TOMB", "CRYPT", "GRAVE", "ALTAR",
        "THRONE", "CROWN", "SWORD", "BLADE", "DAGGER", "SPEAR", "ARROW", "BOLT", "SPARK", "FLAME",
        "CRYSTAL", "GEM", "STONE", "ROCK", "METAL", "STEEL", "IRON", "GOLD", "SILVER", "COPPER"
    ];
    
    // Verb starters (30+ words) - Aggressive, Movement, Tech verbs
    static verbStarters = [
        "CRUSH", "DESTROY", "ANNIHILATE", "OBLITERATE", "DEVASTATE", "SHATTER", "BREAK", "KILL", "MURDER", "SLAUGHTER",
        "HACK", "CRACK", "EXPLOIT", "PENETRATE", "INFILTRATE", "CORRUPT", "VIRUS", "INFECT", "POISON", "TOXIC",
        "DANCE", "MOVE", "FLOW", "STREAM", "RUSH", "SURGE", "BLAST", "EXPLODE", "BURST", "FLASH"
    ];
    
    // Blackmetal words (50+ words) - Specialized dark/metal vocabulary
    static blackmetalWords = [
        "NECRO", "GRIMM", "KVLT", "TRVE", "FROSTBITTEN", "WINTERMOON", "DARKTHRONE", "IMMORTAL", "EMPEROR", "MAYHEM",
        "BLASPHEMY", "HERESY", "SACRILEGE", "PROFANE", "UNHOLY", "CURSED", "DAMNED", "DOOMED", "FALLEN", "LOST",
        "CORPSE", "CADAVER", "SKELETON", "SKULL", "BONES", "FLESH", "BLOOD", "GORE", "CARNAGE", "MASSACRE",
        "THRONE", "KINGDOM", "EMPIRE", "REALM", "DOMAIN", "TERRITORY", "LAND", "WORLD", "UNIVERSE", "COSMOS",
        "RITUAL", "CEREMONY", "SACRIFICE", "OFFERING", "WORSHIP", "PRAYER", "CHANT", "INCANTATION", "SPELL", "CURSE"
    ];
    
    // Sparklepop words (50+ words) - Bright/positive vocabulary with symbols
    static sparklepopWords = [
        "RAINBOW", "UNICORN", "FAIRY", "ANGEL", "HEAVEN", "PARADISE", "DREAM", "FANTASY", "MAGIC", "MIRACLE",
        "SPARKLE", "GLITTER", "SHIMMER", "SHINE", "GLOW", "RADIANCE", "BRILLIANCE", "LUMINOUS", "BRIGHT", "LIGHT",
        "CRYSTAL", "DIAMOND", "PEARL", "JEWEL", "GEM", "TREASURE", "GOLD", "SILVER", "PLATINUM", "PRECIOUS",
        "BUTTERFLY", "FLOWER", "BLOSSOM", "PETAL", "ROSE", "LILY", "DAISY", "SUNFLOWER", "TULIP", "ORCHID",
        "PRINCESS", "QUEEN", "GODDESS", "ANGEL", "STAR", "MOON", "SUN", "COMET", "METEOR", "GALAXY"
    ];
    
    // Advanced symbol sets for different styles
    static witchHouseSymbols = ["†", "‡", "§", "¶", "∆", "◊", "◯", "◇", "△", "▲", "▼", "►", "◄", "♠", "♣", "♥", "♦"];
    static vaporwaveSymbols = ["ａ", "ｂ", "ｃ", "ｄ", "ｅ", "ｆ", "ｇ", "ｈ", "ｉ", "ｊ", "ｋ", "ｌ", "ｍ", "ｎ", "ｏ", "ｐ"];
    static sparklepopSymbols = ["♡", "♥", "★", "☆", "✧", "✦", "✨", "💫", "🌟", "⭐", "✩", "❤", "💖", "💕", "💝", "💗"];
    static zalgoMarks = ["̴", "̵", "̶", "̷", "̸", "̡", "̢", "̧", "̨", "̩", "̪", "̫", "̬", "̭", "̮", "̯"];
    static numerologyNumbers = ["111", "222", "333", "444", "555", "666", "777", "888", "999", "1111", "2222", "3333"];
    static asciiElements = ["░", "▒", "▓", "█", "▄", "▀", "■", "□", "▪", "▫", "◘", "◙", "◚", "◛", "◜", "◝"];
    
    // Connector words for complex names
    static connectorWords = ["OF", "THE", "AND", "IN", "ON", "AT", "BY", "FOR", "WITH", "FROM", "TO", "AS", "IS", "ARE", "BE", "WAS", "WERE"];
    
    static generateName() {
        // Use the advanced wordlist system
        const starter = this.starterWords[Math.floor(Math.random() * this.starterWords.length)];
        const middle = this.middleWords[Math.floor(Math.random() * this.middleWords.length)];
        const ender = this.enderWords[Math.floor(Math.random() * this.enderWords.length)];
        
        // Occasionally add a connector word
        const useConnector = Math.random() < 0.3;
        if (useConnector) {
            const connector = this.connectorWords[Math.floor(Math.random() * this.connectorWords.length)];
            return `${starter} ${connector} ${middle} ${ender}`;
        }
        
        return `${starter} ${middle} ${ender}`;
    }
    
    static generateWithGlitch() {
        let name = this.generateName();
        
        // Apply advanced glitch effects using the symbol sets
        const glitchChance = Math.random();
        
        if (glitchChance < 0.3) {
            // Replace some characters with similar looking ones
            name = name.replace(/A/g, '∆')
                      .replace(/E/g, '∃')
                      .replace(/O/g, '◯')
                      .replace(/I/g, '|')
                      .replace(/S/g, '§')
                      .replace(/T/g, '†');
        }
        
        if (glitchChance < 0.2) {
            // Add witch house symbols
            const symbol = this.witchHouseSymbols[Math.floor(Math.random() * this.witchHouseSymbols.length)];
            name = symbol + name + symbol;
        }
        
        if (glitchChance < 0.1) {
            // Add zalgo corruption
            const zalgoMark = this.zalgoMarks[Math.floor(Math.random() * this.zalgoMarks.length)];
            name = name.split('').map(char => char + zalgoMark).join('');
        }
        
        return name;
    }
    
    static generateByStyle(style) {
        let words, symbols;
        
        switch (style) {
            case 'sparklepop':
                words = [...this.sparklepopWords, ...this.starterWords.slice(0, 20)];
                symbols = this.sparklepopSymbols;
                break;
            case 'blackmetal':
                words = [...this.blackmetalWords, ...this.starterWords.slice(40, 60)];
                symbols = this.witchHouseSymbols;
                break;
            case 'witchhouse':
                words = [...this.starterWords.slice(30, 50), ...this.middleWords.slice(20, 30)];
                symbols = this.witchHouseSymbols;
                break;
            case 'vaporwave':
                words = [...this.starterWords.slice(0, 30), ...this.middleWords.slice(0, 20)];
                symbols = this.vaporwaveSymbols;
                break;
            default:
                return this.generateName();
        }
        
        // Generate style-specific name
        const word1 = words[Math.floor(Math.random() * words.length)];
        const word2 = words[Math.floor(Math.random() * words.length)];
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];
        
        // Add numerology number occasionally
        const useNumber = Math.random() < 0.3;
        const number = useNumber ? this.numerologyNumbers[Math.floor(Math.random() * this.numerologyNumbers.length)] : '';
        
        return `${symbol} ${word1} ${word2} ${number} ${symbol}`.trim();
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