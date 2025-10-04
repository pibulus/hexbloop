/**
 * @fileoverview Mystical name generator with lunar and temporal influences
 * @author Hexbloop Audio Labs
 * @description Creates musical track names based on moon phases, time, and mystical concepts
 */

class NameGenerator {
    // === Curated word banks for better musical names ===
    
    // Atmospheric/ambient concepts
    static atmosphericWords = [
        "echo", "drift", "wave", "pulse", "flow", "haze", "mist", "fog", "vapor", "cloud",
        "aurora", "nebula", "cosmos", "void", "abyss", "stellar", "astral", "lunar", "solar", "eclipse",
        "twilight", "dusk", "dawn", "midnight", "eventide", "gloaming", "shadow", "shade", "umbra", "penumbra"
    ];
    
    // Electronic/digital concepts (lowercase for better readability)
    static electronicWords = [
        "signal", "circuit", "binary", "quantum", "neural", "digital", "analog", "synth", "modular", "matrix",
        "frequency", "resonance", "oscillation", "waveform", "amplitude", "phase", "filter", "voltage", "current", "flux",
        "algorithm", "protocol", "interface", "terminal", "console", "kernel", "daemon", "process", "thread", "stack"
    ];
    
    // Mystical/occult concepts (more subtle)
    static mysticalWords = [
        "ritual", "sigil", "oracle", "vision", "dream", "trance", "portal", "gateway", "threshold", "liminal",
        "crystal", "prism", "mirror", "reflection", "phantom", "specter", "spirit", "essence", "aura", "emanation",
        "incantation", "invocation", "divination", "transmutation", "transcendence", "manifestation", "revelation"
    ];
    
    // Action/movement verbs (present participle for flow)
    static movementWords = [
        "cascading", "flowing", "drifting", "shifting", "morphing", "ascending", "descending", "spiraling", "weaving", "threading",
        "pulsing", "breathing", "expanding", "contracting", "oscillating", "vibrating", "resonating", "echoing", "reverberating",
        "emerging", "dissolving", "crystallizing", "fragmenting", "coalescing", "transmuting", "evolving", "unfolding"
    ];
    
    // Time-specific descriptors
    static temporalWords = [
        "eternal", "infinite", "ephemeral", "transient", "liminal", "perpetual", "cyclic", "recursive", "parallel", "quantum",
        "ancient", "primordial", "nascent", "emergent", "future", "temporal", "chronologic", "synchronous", "asynchronous"
    ];
    
    // Subtle ASCII symbols (no emojis!)
    static subtleSymbols = [
        "//", "--", "__", "++", "::", "..", "~", "^", "|", "/", "\\",
        "[", "]", "{", "}", "<", ">", "(", ")"
    ];
    
    // Geometric/mathematical symbols (sparingly used)
    static geometricSymbols = [
        "△", "▽", "◇", "◯", "□", "▪", "▫", "•", "°", "∞", "∴", "∵", "≈", "≡", "∂", "∇"
    ];
    
    // Lunar phase name mappings
    static lunarNames = {
        'New Moon': ['void', 'null', 'shadow', 'umbra', 'dark', 'hidden', 'nascent', 'embryonic'],
        'Waxing Crescent': ['ascending', 'emerging', 'growing', 'nascent', 'dawning', 'birthing'],
        'First Quarter': ['equilibrium', 'balance', 'threshold', 'crossroads', 'junction', 'nexus'],
        'Waxing Gibbous': ['expanding', 'swelling', 'amplifying', 'intensifying', 'building', 'charging'],
        'Full Moon': ['apex', 'zenith', 'illuminated', 'radiant', 'complete', 'whole', 'manifest'],
        'Waning Gibbous': ['releasing', 'dissipating', 'unwinding', 'softening', 'dimming', 'receding'],
        'Last Quarter': ['transition', 'turning', 'pivot', 'reflection', 'review', 'return'],
        'Waning Crescent': ['fading', 'dissolving', 'vanishing', 'ephemeral', 'ghosting', 'waning']
    };
    
    // Version/iteration markers (subtle)
    static versionMarkers = [
        'v1', 'v2', 'v3', 'mk1', 'mk2', 'mk3', 'alpha', 'beta', 'gamma', 'delta',
        'a', 'b', 'c', 'x', 'y', 'z', 'i', 'ii', 'iii', 'iv', 'v'
    ];
    
    // Helper function to pick random from array (supports seeding)
    static pick(array, randomFunc = Math.random) {
        return array[Math.floor(randomFunc() * array.length)];
    }

    // Seeded random number generator (Linear Congruential Generator)
    static seededRandom(seed) {
        let currentSeed = seed;
        return function() {
            currentSeed = (currentSeed * 1664525 + 1013904223) % 2147483647;
            return currentSeed / 2147483647;
        };
    }
    
    // Helper to capitalize first letter only
    static capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    // Get lunar phase name from numeric phase (0-1)
    static getLunarPhaseName(phase) {
        if (phase < 0.03 || phase > 0.97) return 'New Moon';
        if (phase < 0.22) return 'Waxing Crescent';
        if (phase < 0.28) return 'First Quarter';
        if (phase < 0.47) return 'Waxing Gibbous';
        if (phase < 0.53) return 'Full Moon';
        if (phase < 0.72) return 'Waning Gibbous';
        if (phase < 0.78) return 'Last Quarter';
        return 'Waning Crescent';
    }
    
    // Generate clean, musical names (supports seeding)
    static generateCleanName(randomFunc = Math.random) {
        const patterns = [
            // Single evocative word
            () => this.capitalize(this.pick([
                ...this.atmosphericWords,
                ...this.mysticalWords
            ], randomFunc)),

            // Movement + concept
            () => `${this.capitalize(this.pick(this.movementWords, randomFunc))}_${this.capitalize(this.pick(this.atmosphericWords, randomFunc))}`,

            // Temporal + electronic
            () => `${this.capitalize(this.pick(this.temporalWords, randomFunc))}_${this.capitalize(this.pick(this.electronicWords, randomFunc))}`,

            // Mystical phrase
            () => `${this.capitalize(this.pick(this.mysticalWords, randomFunc))}_${this.capitalize(this.pick(["transmission", "sequence", "protocol", "signal", "pattern"], randomFunc))}`,

            // Electronic + number (occasionally)
            () => `${this.capitalize(this.pick(this.electronicWords, randomFunc))}_${Math.floor(randomFunc() * 999) + 1}`,

            // Atmospheric combination
            () => `${this.capitalize(this.pick(this.atmosphericWords, randomFunc))}.${this.pick(this.atmosphericWords, randomFunc)}`,

            // Time-based
            () => {
                const hour = new Date().getHours();
                const timeWord = hour < 6 ? "nocturnal" : hour < 12 ? "dawn" : hour < 18 ? "meridian" : "dusk";
                return `${this.capitalize(timeWord)}_${this.capitalize(this.pick(this.mysticalWords, randomFunc))}`;
            }
        ];

        return this.pick(patterns, randomFunc)();
    }
    
    // Generate name with subtle stylistic elements (supports seeding)
    static generateStyledName(style = 'neutral', randomFunc = Math.random) {
        let name = this.generateCleanName(randomFunc);
        
        // Add subtle style markers based on preference
        switch(style) {
            case 'minimal':
                // Just clean names, maybe lowercase
                name = name.toLowerCase();
                break;
                
            case 'technical':
                // Add underscores or dots
                if (randomFunc() < 0.3) {
                    name = name.replace(/ /g, '_');
                }
                if (randomFunc() < 0.2) {
                    name += `_${this.pick(this.versionMarkers, randomFunc)}`;
                }
                break;

            case 'atmospheric':
                // Add subtle brackets or slashes
                if (randomFunc() < 0.2) {
                    name = `[${name}]`;
                } else if (randomFunc() < 0.2) {
                    name = `//${name}`;
                }
                break;

            case 'mystical':
                // Very subtle geometric symbols
                if (randomFunc() < 0.15) {
                    const symbol = this.pick(this.geometricSymbols, randomFunc);
                    name = `${symbol} ${name}`;
                }
                break;
                
            default:
                // Neutral - just clean names
                break;
        }
        
        return name;
    }
    
    // Generate name based on lunar phase (supports seeding)
    static generateLunarName(moonPhase, randomFunc = Math.random) {
        const phaseName = moonPhase.name || 'Unknown';
        const phaseWords = this.lunarNames[phaseName] || this.lunarNames['New Moon'];

        const patterns = [
            // Lunar word + atmospheric
            () => `${this.capitalize(this.pick(phaseWords, randomFunc))}_${this.capitalize(this.pick(this.atmosphericWords, randomFunc))}`,

            // Phase-influenced electronic
            () => {
                const intensity = moonPhase.illumination || 0.5;
                const word = intensity > 0.7 ? 'bright' : intensity < 0.3 ? 'dark' : 'grey';
                return `${this.capitalize(word)}_${this.capitalize(this.pick(this.electronicWords, randomFunc))}`;
            },

            // Direct lunar reference
            () => `${phaseName.toLowerCase().replace(/ /g, '_')}_${this.pick(['transmission', 'signal', 'phase', 'cycle'], randomFunc)}`,

            // Mystical lunar
            () => `${this.capitalize(this.pick(phaseWords, randomFunc))}.${this.pick(this.mysticalWords, randomFunc)}`,

            // Numeric lunar (day of lunar month)
            () => {
                const lunarDay = Math.floor(moonPhase.phase * 29.53);
                return `lunar_day_${lunarDay}`;
            }
        ];

        return this.pick(patterns, randomFunc)();
    }
    
    // Main generation function - intelligent name creation
    static generateMystical(metadata = {}) {
        const now = new Date();
        const hour = now.getHours();

        // BEST PRACTICE: Support seeding for reproducible names
        const seed = metadata.seed || Date.now();
        const randomFunc = metadata.seed ? this.seededRandom(seed) : Math.random;

        // Try to get real lunar data if available
        let moonPhase = metadata.moonPhase;
        if (!moonPhase) {
            try {
                const LunarProcessor = require('./lunar-processor');
                moonPhase = LunarProcessor.getMoonPhase();
            } catch (e) {
                // BEST PRACTICE: Correct lunar fallback calculation
                // Julian day approximation for lunar cycle
                const daysSinceNewMoon = Math.floor((now.getTime() / 86400000 + 0.5) % 29.53);
                const phase = daysSinceNewMoon / 29.53;

                moonPhase = {
                    phase,
                    illumination: (1 - Math.cos(phase * Math.PI * 2)) / 2,
                    name: this.getLunarPhaseName(phase)
                };
            }
        }
        
        // Weighted selection based on time and moon
        const weights = {
            clean: 40,      // Always good chance of clean names
            lunar: 20,      // Lunar-influenced
            temporal: 15,   // Time-based
            technical: 15,  // Technical style
            atmospheric: 10 // Atmospheric style
        };
        
        // Adjust weights based on conditions
        if (hour >= 22 || hour <= 6) {
            weights.atmospheric += 10;
            weights.lunar += 5;
        }
        
        if (moonPhase.illumination < 0.2 || moonPhase.illumination > 0.8) {
            weights.lunar += 15; // Strong lunar influence at extremes
        }
        
        // Pick generation method based on weights
        const total = Object.values(weights).reduce((a, b) => a + b, 0);
        let random = randomFunc() * total;
        let method = 'clean';

        for (const [key, weight] of Object.entries(weights)) {
            random -= weight;
            if (random <= 0) {
                method = key;
                break;
            }
        }

        // Generate based on selected method
        let name;
        switch(method) {
            case 'lunar':
                name = this.generateLunarName(moonPhase, randomFunc);
                break;
            case 'temporal':
                const timeWord = hour < 6 ? 'nocturnal' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
                name = `${timeWord}_${this.pick(this.mysticalWords, randomFunc)}`;
                break;
            case 'technical':
                name = this.generateStyledName('technical', randomFunc);
                break;
            case 'atmospheric':
                name = this.generateStyledName('atmospheric', randomFunc);
                break;
            default:
                name = this.generateCleanName(randomFunc);
        }

        // BEST PRACTICE: Post-processing with better symbol handling
        // Remove emojis
        name = name.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '');

        // Replace spaces with underscores (but preserve intentional underscores/dots/dashes)
        name = name.replace(/\s+/g, '_');

        // Keep safe filename chars INCLUDING geometric symbols that were intentionally added
        name = name.replace(/[^a-zA-Z0-9_\-\.\[\]\(\)△▽◇◯□▪▫•°∞∴∵≈≡∂∇]/g, '');
        
        // BEST PRACTICE: Validation and safety checks
        // Ensure name isn't too long (max 50 chars for reasonable filenames)
        if (name.length > 50) {
            name = name.substring(0, 50);
        }

        // Remove trailing separators
        name = name.replace(/[_\-\.]+$/, '');

        // Validate: minimum length, not just numbers/symbols
        const hasLetters = /[a-zA-Z]/.test(name);
        if (!name || name.length < 3 || !hasLetters) {
            // Fallback to timestamp-based name
            name = `hexbloop_${Date.now()}`;
        }

        return name;
    }
}

module.exports = NameGenerator;