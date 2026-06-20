/**
 * @fileoverview Mystical name generator with lunar, temporal, and chaos influences
 * @author Hexbloop Audio Labs
 * @description Generates unpredictable musical track names with tape-cassette energy
 */

class NameGenerator {
    // ============================================================
    // WORD BANKS — massive, diverse, unpredictable
    // ============================================================

    // Opening power words (capitalized, sets the tone)
    static starters = [
        // Temporal/Cosmic
        "Ancient", "Eternal", "Infinite", "Cosmic", "Stellar", "Astral", "Galactic", "Solar",
        "Lunar", "Celestial", "Primordial", "Timeless", "Universal", "Dimensional", "Void",
        "Ethereal", "Quantum", "Temporal", "Perpetual", "Parallel",
        // Tech/Digital
        "Cyber", "Digital", "Virtual", "Neural", "Binary", "Atomic", "Vector",
        "Matrix", "Circuit", "Synthetic", "Electronic", "Bionic", "Nano", "Hyper", "Ultra",
        "Neo", "Post", "Trans", "Proto", "Mega",
        // Dark/Occult
        "Dark", "Black", "Shadow", "Occult", "Arcane", "Esoteric", "Hermetic",
        "Infernal", "Abyssal", "Nether", "Forbidden", "Hidden", "Veiled", "Cryptic", "Obscure",
        // Elements
        "Storm", "Thunder", "Lightning", "Fire", "Ice", "Frost", "Wind",
        "Crystal", "Plasma", "Nuclear", "Electric", "Toxic",
        // Attitude
        "Absolute", "Omega", "Alpha", "Prime", "Supreme", "Maximum", "Ultimate",
        "Psycho", "Manic", "Deranged", "Twisted", "Warped", "Mad",
        // Abstract
        "Abstract", "Surreal", "Bizarre", "Strange", "Alien", "Unknown",
        "Broken", "Glitched", "Fractured", "Shattered", "Divided",
        // Cozy/DIY
        "Backyard", "Garage", "Basement", "Attic", "Porch",
        "Snuggled", "Nestled", "Tucked", "Wrapped", "Bundled",
        "Lazy", "Chill", "Mellow", "Soft", "Gentle", "Warm", "Calm",
        // Skate/Punk
        "Thrashed", "Shredded", "Grinded", "Wrecked", "Crushed", "Stoked",
        // Weather/Time
        "Sunny", "Foggy", "Misty", "Stormy", "Hazy", "Overcast", "Grey",
    ];

    // Core middle concepts
    static middles = [
        // Power concepts
        "Death", "Blood", "Void", "Ghost", "Witch", "Storm", "Doom", "Demon", "Dragon",
        "Shadow", "Moon", "Star", "Sun", "Wolf", "Snake", "Crow", "Raven",
        // Tech
        "Circuit", "System", "Matrix", "Code", "Data", "Signal", "Virus", "Network",
        "Machine", "Cyber", "Digital", "Virtual", "Neural", "Quantum",
        // Occult
        "Ritual", "Magic", "Curse", "Spell", "Rune", "Sigil", "Oracle", "Spirit",
        "Soul", "Alchemy", "Mystic", "Phantom",
        // Dark
        "Terror", "Horror", "Nightmare", "Dread", "Grave", "Tomb", "Crypt",
        "Zombie", "Vampire", "Specter", "Wraith",
        // Weapons
        "Blade", "Sword", "Axe", "Knife", "Gun", "Weapon", "Armor", "Shield",
        "Warrior", "Assassin", "Slayer",
        // Industrial
        "Engine", "Motor", "Gear", "Steel", "Iron", "Chrome", "Metal",
        "Furnace", "Forge", "Reactor",
        // Sound
        "Noise", "Static", "Feedback", "Echo", "Reverb", "Drone", "Bass",
        "Beat", "Rhythm", "Pulse", "Frequency", "Resonance",
        // Body
        "Brain", "Heart", "Bone", "Flesh", "Spine", "Skull", "Teeth",
        "Claw", "Fang", "Eye", "Mind",
        // Abstract
        "Chaos", "Order", "Truth", "Dream", "Infinity", "Destiny", "Fate",
        "Glitch", "Error", "Null", "Zero", "Random", "Spiral", "Vortex", "Nexus", "Portal",
        // Cozy
        "Blanket", "Pillow", "Sweater", "Tea", "Coffee", "Toast", "Soup",
        "Garden", "Cottage", "Nook", "Corner", "Window",
        // Creatures
        "Raccoon", "Possum", "Rat", "Frog", "Toad", "Spider", "Cricket",
        "Moth", "Snail", "Slug", "Squirrel", "Cat", "Dog", "Bird", "Bug",
        // Food
        "Pizza", "Burger", "Fries", "Snack", "Candy", "Cookie", "Cake",
        "Cheese", "Pickle", "Onion",
    ];

    // Ending words (mostly lowercase, the "payload")
    static enders = [
        // Tech
        "entropy", "matrix", "cortex", "cipher", "nexus", "paradox", "void", "crisis",
        "omega", "virus", "machine", "reactor", "system", "plasma", "circuit",
        // Dark
        "specter", "wraith", "demon", "oracle", "prophet", "witch", "serpent", "dragon",
        "leviathan", "cult", "ritual", "omen", "raven", "sphinx", "beast",
        // Elements
        "thunder", "venom", "steel", "crystal", "storm", "fire", "frost", "lightning",
        "stone", "chrome", "iron", "hammer", "blade", "fang", "claw",
        // Cosmic
        "monolith", "eclipse", "star", "cosmos", "abyss", "vortex", "nebula", "nova",
        "titan", "comet", "planet", "moon", "sun", "galaxy",
        // Cozy
        "nap", "snack", "vibe", "zone", "mood", "dream", "rest", "glow", "hush", "cozy",
        "soft", "warm", "sweet", "gentle", "calm",
        // Skate
        "ollie", "slide", "grind", "drop", "bail", "slash", "stall",
        "deck", "trucks", "wheels", "curb", "ramp", "rail",
        // Food
        "sauce", "crust", "cheese", "crumbs", "sugar", "salt", "pepper", "butter", "jam",
    ];

    // Connectors (word_of_word patterns)
    static connectors = [
        // Prepositions
        "of", "from", "in", "beyond", "beneath", "above", "through", "without",
        "versus", "against", "inside", "outside", "between", "within", "despite",
        "under", "over", "behind", "before", "and",
        // Mystical
        "betwixt", "amidst", "throughout", "beyond-the", "beneath-the",
        "within-the", "through-the", "outside-the", "inside-the",
        // Tech
        "via", "using", "while", "during", "after", "before",
        "buffer", "cache", "stack", "void",
        // Action-based
        "corrupted-by", "glitched-through", "destroyed-by", "consumed-by",
        "processed-by", "filtered-through", "converted-to", "transformed-into",
        "summoning", "conjuring", "invoking", "channeling", "manifesting",
        "crushing", "destroying", "consuming", "devouring", "executing",
        "processing", "compiling", "rendering", "parsing", "encoding",
        // Abstract
        "like", "unlike", "becoming", "approaching", "exceeding", "transcending",
        "morphing-into", "evolving-to", "mutating-to", "shifting-into", "warping-into",
    ];

    // Witch house symbols (filename-safe subset)
    static witchSymbols = ['▲', '△', '◇', '◆', '▽', '◯', '□', '▪', '▫', '•', '°'];

    // Vaporwave fragments (ASCII-only aesthetic)
    static vaporwaveFrags = [
        'VAPOR', 'WAVE', 'CYBER', 'DREAM', 'VOID',
        'NIGHT', 'SYSTEM', 'MEMORY', 'FLUX', 'DATA',
        'SUNSET', 'PLAZA', 'NEON', 'AESTHETIC', 'AMBIENT',
    ];

    // Numerology power numbers
    static powerNumbers = [
        "666", "777", "888", "333", "444", "555", "111", "222", "999",
        "101", "010", "404", "303", "808", "909",
        "13", "23", "93", "616", "418",
        "1999", "2000", "Y2K", "808s",
    ];

    // Zalgo marks for glitch text
    static zalgo = [
        '\u0315', '\u0316', '\u0317', '\u0318', '\u0319', '\u031A', '\u031B',
        '\u031C', '\u031D', '\u031E', '\u031F', '\u0320', '\u0321', '\u0322',
        '\u0323', '\u0324', '\u0325', '\u0326', '\u0327', '\u0328', '\u0329',
        '\u032A', '\u032B', '\u032C', '\u032D', '\u032E', '\u032F', '\u0330',
        '\u0300', '\u0301', '\u0302', '\u0303', '\u0304', '\u0305', '\u0306',
    ];

    // Geometric symbols
    static geometricSymbols = [
        '△', '▽', '◇', '◯', '□', '▪', '▫', '•', '°', '∞',
        '∴', '∵', '≈', '≡', '∂', '∇',
    ];

    // Version markers (no single letters — look like typos)
    static versionMarkers = [
        'v1', 'v2', 'v3', 'v4', 'v5',
        'mk1', 'mk2', 'mk3',
        'alpha', 'beta', 'gamma', 'delta', 'epsilon',
    ];

    // Lunar phase word mappings
    static lunarNames = {
        'New Moon': ['void', 'null', 'shadow', 'umbra', 'dark', 'hidden', 'nascent', 'embryonic'],
        'Waxing Crescent': ['ascending', 'emerging', 'growing', 'nascent', 'dawning', 'birthing'],
        'First Quarter': ['equilibrium', 'balance', 'threshold', 'crossroads', 'junction', 'nexus'],
        'Waxing Gibbous': ['expanding', 'swelling', 'amplifying', 'intensifying', 'building', 'charging'],
        'Full Moon': ['apex', 'zenith', 'illuminated', 'radiant', 'complete', 'whole', 'manifest'],
        'Waning Gibbous': ['releasing', 'dissipating', 'unwinding', 'softening', 'dimming', 'receding'],
        'Last Quarter': ['transition', 'turning', 'pivot', 'reflection', 'review', 'return'],
        'Waning Crescent': ['fading', 'dissolving', 'vanishing', 'ephemeral', 'ghosting', 'waning'],
    };

    // ============================================================
    // UTILITY
    // ============================================================

    static pick(array, randomFunc = Math.random) {
        return array[Math.floor(randomFunc() * array.length)];
    }

    static pickWeighted(array, randomFunc = Math.random, weightFn = null) {
        if (!weightFn) return this.pick(array, randomFunc);
        const weights = array.map(w => Math.max(1, weightFn(w)));
        const total = weights.reduce((a, b) => a + b, 0);
        let r = randomFunc() * total;
        for (let i = 0; i < array.length; i++) {
            r -= weights[i];
            if (r <= 0) return array[i];
        }
        return array[array.length - 1];
    }

    static seededRandom(seed) {
        let s = seed;
        return () => {
            s = (s * 1664525 + 1013904223) % 2147483647;
            return s / 2147483647;
        };
    }

    static capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

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

    // ============================================================
    // NAME ASSEMBLY
    // ============================================================

    /**
     * Build a compound name from word banks
     * Patterns: Single, Double, Triple (with connector), Quad (rare)
     */
    static buildCompoundName(randomFunc = Math.random) {
        const roll = randomFunc() * 100;

        if (roll < 12) {
            // Single power word
            return this.capitalize(this.pick(this.enders, randomFunc));
        } else if (roll < 38) {
            // Starter_Middle
            const s = this.pick(this.starters, randomFunc);
            const m = this.pick(this.middles, randomFunc);
            return `${s}_${m}`;
        } else if (roll < 68) {
            // Starter + Connector + Middle/Ender
            const s = this.pick(this.starters, randomFunc);
            const c = this.pick(this.connectors, randomFunc);
            const t = randomFunc() < 0.5
                ? this.pick(this.middles, randomFunc)
                : this.pick(this.enders, randomFunc);
            return `${s}_${c}_${t}`;
        } else if (roll < 85) {
            // Middle_of_Ender (classic band name style)
            const m = this.pick(this.middles, randomFunc);
            const e = this.pick(this.enders, randomFunc);
            return `${m}_of_the_${e}`;
        } else if (roll < 95) {
            // Triple: Starter_Middle_Ender
            const s = this.pick(this.starters, randomFunc);
            const m = this.pick(this.middles, randomFunc);
            const e = this.pick(this.enders, randomFunc);
            return `${s}_${m}_${e}`;
        } else {
            // Quad: rare epic names
            const s = this.pick(this.starters, randomFunc);
            const m = this.pick(this.middles, randomFunc);
            const c = this.pick(this.connectors, randomFunc);
            const e = this.pick(this.enders, randomFunc);
            return `${s}_${m}_${c}_${e}`;
        }
    }

    // ============================================================
    // MUTATIONS — chaos sprinkles
    // ============================================================

    /**
     * Post-processing mutations for unpredictability.
     * Each mutation has an independent chance to fire.
     */
    static mutate(name, randomFunc = Math.random) {
        let result = name;
        const r = randomFunc;

        // 10%: Add numerology suffix
        if (r() < 0.10) {
            result += `_${this.pick(this.powerNumbers, r)}`;
        }

        // 22%: Add version marker
        if (r() < 0.22) {
            result += `_${this.pick(this.versionMarkers, r)}`;
        }

        // 6%: Witch house geometric framing
        if (r() < 0.06) {
            const sym = this.pick(this.witchSymbols, r);
            result = `${sym}_${result}_${sym}`;
        }

        // 4%: Glitch/zalgo a random word (rare, fun surprise)
        if (r() < 0.04) {
            const parts = result.split('_');
            const idx = Math.floor(r() * parts.length);
            parts[idx] = this.applyZalgo(parts[idx], r);
            result = parts.join('_');
        }

        // 8%: Geometric symbol prefix
        if (r() < 0.08) {
            result = `${this.pick(this.geometricSymbols, r)}_${result}`;
        }

        // 18%: Force-lowercase the whole thing
        if (r() < 0.18) {
            result = result.toLowerCase();
        }

        // 8%: ALL CAPS mode
        if (r() < 0.08) {
            result = result.toUpperCase();
        }

        return result;
    }

    static applyZalgo(word, randomFunc = Math.random) {
        let result = '';
        for (const char of word) {
            result += char;
            if (randomFunc() < 0.3) {
                const count = Math.floor(randomFunc() * 3) + 1;
                for (let i = 0; i < count; i++) {
                    result += this.pick(this.zalgo, randomFunc);
                }
            }
        }
        return result;
    }

    // ============================================================
    // MAIN GENERATION
    // ============================================================

    /**
     * Main entry point: generate a mystical name.
     * Uses moon phase, time of day, batch index, and seeded randomness.
     */
    static generateMystical(metadata = {}) {
        const now = new Date();
        const hour = now.getHours();

        // Seeded RNG for reproducibility — when no seed, add entropy
        const seed = metadata.seed ?? (Date.now() + (metadata.batchIndex || 0) * 7919 + Math.floor(Math.random() * 999999));
        const rng = this.seededRandom(seed);

        // Resolve moon phase
        let moonPhase = metadata.moonPhase;
        if (!moonPhase) {
            try {
                const LunarProcessor = require('./lunar-processor');
                moonPhase = LunarProcessor.getMoonPhase();
            } catch (e) {
                const daysSinceNewMoon = Math.floor((now.getTime() / 86400000 + 0.5) % 29.53);
                const phase = daysSinceNewMoon / 29.53;
                moonPhase = {
                    phase,
                    illumination: (1 - Math.cos(phase * Math.PI * 2)) / 2,
                    name: this.getLunarPhaseName(phase),
                };
            }
        }

        // ---- Select generation strategy ----
        const roll = rng() * 100;

        let name;
        if (roll < 35) {
            // Compound name from word banks (most common)
            name = this.buildCompoundName(rng);
        } else if (roll < 55) {
            // Lunar-influenced name
            name = this.generateLunarName(moonPhase, rng);
        } else if (roll < 70) {
            // Time-based name
            name = this.generateTimeName(hour, rng);
        } else if (roll < 80) {
            // Style-flavored (witch house / vaporwave)
            name = this.generateStyledName(rng);
        } else if (roll < 90) {
            // Action verb starter
            name = this.generateActionName(rng);
        } else {
            // Wildcard: pure compound, no extra mutations
            name = this.buildCompoundName(rng);
        }

        // Apply mutations once
        name = this.mutate(name, rng);

        // Sanitize
        name = this.sanitize(name);

        // Fallback if sanitization destroyed everything
        if (!name || name.length < 3 || !/[a-zA-Z]/.test(name)) {
            name = `hexbloop_${Date.now()}`;
        }

        return name;
    }

    // ---- Sub-generators ----

    static generateLunarName(moonPhase, rng) {
        const phaseName = moonPhase.name || 'New Moon';
        const phaseWords = this.lunarNames[phaseName] || this.lunarNames['New Moon'];
        const lunarWord = this.pick(phaseWords, rng);

        // Weighted patterns — less _of_the_, more variety
        const roll = rng() * 100;
        if (roll < 20) {
            return `${this.capitalize(lunarWord)}_${this.pick(this.enders, rng)}`;
        } else if (roll < 40) {
            return `${this.capitalize(this.pick(this.starters, rng))}_${lunarWord}`;
        } else if (roll < 55) {
            return `${lunarWord}_of_the_${this.pick(this.middles, rng).toLowerCase()}`;
        } else if (roll < 72) {
            return `${phaseName.toLowerCase().replace(/ /g, '_')}_${this.pick(this.enders, rng)}`;
        } else if (roll < 88) {
            return `${this.capitalize(lunarWord)}_${this.pick(this.starters, rng).toLowerCase()}_${this.pick(this.middles, rng).toLowerCase()}`;
        } else {
            return `${this.pick(this.starters, rng)}_${lunarWord}_${this.pick(this.enders, rng)}`;
        }
    }

    static generateTimeName(hour, rng) {
        const timeWords = {
            dead: ['Nocturnal', 'Witching', 'Deepnight', 'Voidhour'],
            dawn: ['PreDawn', 'Firstlight', 'Dawn', 'Daybreak'],
            morning: ['Morning', 'Rising', 'Waking', 'Sunrise'],
            noon: ['Meridian', 'HighNoon', 'Zenith', 'Overhead'],
            afternoon: ['Afternoon', 'Sunkissed', 'Golden', 'Declining'],
            dusk: ['Dusk', 'Gloaming', 'Eventide', 'Fading'],
            twilight: ['Twilight', 'Dusking', 'Bleeding', 'Violet'],
            midnight: ['Midnight', 'Witching', 'ZeroHour', 'Deepnight'],
        };

        let key;
        if (hour < 4) key = 'dead';
        else if (hour < 6) key = 'dawn';
        else if (hour < 12) key = 'morning';
        else if (hour < 14) key = 'noon';
        else if (hour < 17) key = 'afternoon';
        else if (hour < 20) key = 'dusk';
        else if (hour < 23) key = 'twilight';
        else key = 'midnight';

        const timeWord = this.pick(timeWords[key], rng);
        return `${timeWord}_${this.pick(this.enders, rng)}`;
    }

    static generateStyledName(rng) {
        // Geometric-framed or vaporwave-flavored
        if (rng() < 0.5) {
            const word = this.pick(this.middles, rng);
            const sym = this.pick(this.witchSymbols, rng);
            return `${sym}_${word}_${sym}`.toUpperCase();
        } else {
            const frag = this.pick(this.vaporwaveFrags, rng).charAt(0) + this.pick(this.vaporwaveFrags, rng).slice(1).toLowerCase();
            const word = this.pick(this.enders, rng);
            return `${this.capitalize(frag)}_${word}`;
        }
    }

    static generateActionName(rng) {
        const actions = [
            "Crushing", "Burning", "Destroying", "Smashing", "Breaking", "Shattering",
            "Ripping", "Tearing", "Blasting", "Exploding", "Decimating", "Slaying",
            "Falling", "Rising", "Drifting", "Floating", "Sliding", "Gliding",
            "Spinning", "Warping", "Phasing", "Diving", "Soaring",
            "Glitching", "Corrupting", "Processing", "Computing", "Hacking",
            "Scanning", "Loading", "Compiling", "Encrypting", "Decoding",
            "Snuggling", "Napping", "Brewing", "Baking", "Sipping", "Lounging",
            "Wandering", "Exploring", "Roaming", "Lurking", "Chilling",
            "Wiggling", "Wobbling", "Bouncing", "Hopping", "Dancing",
            "Sleeping", "Dreaming", "Dozing", "Yawning", "Mellowing",
        ];

        const action = this.pick(actions, rng);
        const target = this.pick(this.middles, rng);
        return `${action}_${target}`;
    }

    // ---- Backward-compatible wrappers (used by tests/batch engine) ----

    static generateCleanName(randomFunc = Math.random) {
        return this.buildCompoundName(randomFunc);
    }

    static generateStyledName(style = 'neutral', randomFunc = Math.random) {
        return this.buildCompoundName(randomFunc);
    }

    // ---- Sanitization ----

    static sanitize(name) {
        // Remove emojis
        name = name.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '');

        // Replace spaces with underscores
        name = name.replace(/\s+/g, '_');

        // Keep safe filename chars (ASCII + geometric symbols from test spec)
        name = name.replace(/[^a-zA-Z0-9_\-\.\[\]()△▽◇◯□▪▫•°∞∴∵≈≡∂∇]/g, '');

        // Trim to max 60 chars
        if (name.length > 60) {
            name = name.substring(0, 60);
        }

        // Remove trailing separators
        name = name.replace(/[_\-\.]+$/, '');

        // Remove leading separators
        name = name.replace(/^[_\-\.]+/, '');

        // Collapse multiple underscores
        name = name.replace(/_{2,}/g, '_');

        return name;
    }
}

module.exports = NameGenerator;
