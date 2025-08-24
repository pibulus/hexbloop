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
    
    // Helper function to pick random from array
    static pick(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    
    // Helper to capitalize first letter only
    static capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
    
    // Generate clean, musical names
    static generateCleanName() {
        const patterns = [
            // Single evocative word
            () => this.capitalize(this.pick([
                ...this.atmosphericWords,
                ...this.mysticalWords
            ])),
            
            // Movement + concept
            () => `${this.capitalize(this.pick(this.movementWords))} ${this.capitalize(this.pick(this.atmosphericWords))}`,
            
            // Temporal + electronic
            () => `${this.capitalize(this.pick(this.temporalWords))} ${this.capitalize(this.pick(this.electronicWords))}`,
            
            // Mystical phrase
            () => `${this.capitalize(this.pick(this.mysticalWords))} ${this.capitalize(this.pick(["transmission", "sequence", "protocol", "signal", "pattern"]))}`,
            
            // Electronic + number (occasionally)
            () => `${this.capitalize(this.pick(this.electronicWords))}_${Math.floor(Math.random() * 999) + 1}`,
            
            // Atmospheric combination
            () => `${this.capitalize(this.pick(this.atmosphericWords))}.${this.pick(this.atmosphericWords)}`,
            
            // Time-based
            () => {
                const hour = new Date().getHours();
                const timeWord = hour < 6 ? "nocturnal" : hour < 12 ? "dawn" : hour < 18 ? "meridian" : "dusk";
                return `${this.capitalize(timeWord)} ${this.capitalize(this.pick(this.mysticalWords))}`;
            }
        ];
        
        return this.pick(patterns)();
    }
    
    // Generate name with subtle stylistic elements
    static generateStyledName(style = 'neutral') {
        let name = this.generateCleanName();
        
        // Add subtle style markers based on preference
        switch(style) {
            case 'minimal':
                // Just clean names, maybe lowercase
                name = name.toLowerCase();
                break;
                
            case 'technical':
                // Add underscores or dots
                if (Math.random() < 0.3) {
                    name = name.replace(/ /g, '_');
                }
                if (Math.random() < 0.2) {
                    name += `_${this.pick(this.versionMarkers)}`;
                }
                break;
                
            case 'atmospheric':
                // Add subtle brackets or slashes
                if (Math.random() < 0.2) {
                    name = `[${name}]`;
                } else if (Math.random() < 0.2) {
                    name = `//${name}`;
                }
                break;
                
            case 'mystical':
                // Very subtle geometric symbols
                if (Math.random() < 0.15) {
                    const symbol = this.pick(this.geometricSymbols);
                    name = `${symbol} ${name}`;
                }
                break;
                
            default:
                // Neutral - just clean names
                break;
        }
        
        return name;
    }
    
    // Generate name based on lunar phase
    static generateLunarName(moonPhase) {
        const phaseName = moonPhase.name || 'Unknown';
        const phaseWords = this.lunarNames[phaseName] || this.lunarNames['New Moon'];
        
        const patterns = [
            // Lunar word + atmospheric
            () => `${this.capitalize(this.pick(phaseWords))} ${this.capitalize(this.pick(this.atmosphericWords))}`,
            
            // Phase-influenced electronic
            () => {
                const intensity = moonPhase.illumination || 0.5;
                const word = intensity > 0.7 ? 'bright' : intensity < 0.3 ? 'dark' : 'grey';
                return `${this.capitalize(word)} ${this.capitalize(this.pick(this.electronicWords))}`;
            },
            
            // Direct lunar reference
            () => `${phaseName.toLowerCase().replace(/ /g, '_')}_${this.pick(['transmission', 'signal', 'phase', 'cycle'])}`,
            
            // Mystical lunar
            () => `${this.capitalize(this.pick(phaseWords))}.${this.pick(this.mysticalWords)}`,
            
            // Numeric lunar (day of lunar month)
            () => {
                const lunarDay = Math.floor(moonPhase.phase * 29.53);
                return `lunar_day_${lunarDay}`;
            }
        ];
        
        return this.pick(patterns)();
    }
    
    // Main generation function - intelligent name creation
    static generateMystical(metadata = {}) {
        const now = new Date();
        const hour = now.getHours();
        
        // Try to get real lunar data if available
        let moonPhase = metadata.moonPhase;
        if (!moonPhase) {
            try {
                const LunarProcessor = require('./lunar-processor');
                moonPhase = LunarProcessor.getMoonPhase();
            } catch (e) {
                // Fallback to simple calculation
                const lunarDay = now.getDate() % 29;
                moonPhase = {
                    phase: lunarDay / 29,
                    illumination: Math.abs(Math.cos((lunarDay / 29) * Math.PI * 2)),
                    name: 'Unknown'
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
        let random = Math.random() * total;
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
                name = this.generateLunarName(moonPhase);
                break;
            case 'temporal':
                const timeWord = hour < 6 ? 'nocturnal' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
                name = `${timeWord}_${this.pick(this.mysticalWords)}`;
                break;
            case 'technical':
                name = this.generateStyledName('technical');
                break;
            case 'atmospheric':
                name = this.generateStyledName('atmospheric');
                break;
            default:
                name = this.generateCleanName();
        }
        
        // Post-processing: ensure no emojis, clean up
        name = name.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, ''); // Remove emoji
        name = name.replace(/\s+/g, '_'); // Replace spaces with underscores for filename
        name = name.replace(/[^a-zA-Z0-9_\-\.\[\]\(\)]/g, ''); // Keep only safe filename chars
        
        // Ensure name isn't too long (max 50 chars for reasonable filenames)
        if (name.length > 50) {
            name = name.substring(0, 50);
        }
        
        // Ensure we have something
        if (!name || name.length < 3) {
            name = `hexbloop_${Date.now()}`;
        }
        
        return name;
    }
}

module.exports = NameGenerator;