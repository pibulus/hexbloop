/**
 * @fileoverview Lunar processor for moon phase influenced audio processing
 * @author Hexbloop Audio Labs
 * @description Implements mystical lunar influences on audio transformation
 */

class LunarProcessor {
    static getMoonPhase() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        
        // Calculate days since known new moon (Jan 6, 2000)
        const lunarMonth = 29.530588853;
        const referenceNewMoon = new Date(2000, 0, 6);
        const daysSinceReference = (now - referenceNewMoon) / (1000 * 60 * 60 * 24);
        
        // Phase: 0-1 (0/1 = new moon, 0.5 = full moon)
        const phase = (daysSinceReference % lunarMonth) / lunarMonth;
        
        return {
            phase: phase,
            illumination: Math.abs(Math.cos(phase * Math.PI * 2)),
            name: this.getPhaseName(phase),
            influence: this.getPhaseInfluence(phase)
        };
    }
    
    static getPhaseName(phase) {
        if (phase < 0.03 || phase > 0.97) return 'New Moon';
        if (phase < 0.22) return 'Waxing Crescent';
        if (phase < 0.28) return 'First Quarter';
        if (phase < 0.47) return 'Waxing Gibbous';
        if (phase < 0.53) return 'Full Moon';
        if (phase < 0.72) return 'Waning Gibbous';
        if (phase < 0.78) return 'Last Quarter';
        return 'Waning Crescent';
    }
    
    // === Moon Phase → Audio Parameter Mapping (tape-cassette calibrated) ===
    // Overdrive: 1.0=clean warmth, 2.0=gentle saturation, 3.0=full tape crunch
    // Bass/Treble: subtle EQ shaping (not radical)
    // Compand ratio: 2=glue, 3=moderate, 4=heavy tape squash
    static getPhaseInfluence(phase) {
        if (phase < 0.03 || phase > 0.97) {
            // New Moon → Dark, warm, thick tape saturation
            return {
                type: 'dark',
                overdrive: 2.8,
                bass: 2.2,
                treble: -0.8,
                echo: { delay: 0.45, decay: 0.08 },
                compand: { attack: 0.08, ratio: 3.5 }
            };
        } else if (phase < 0.22) {
            // Waxing Crescent → Building warmth
            return {
                type: 'building',
                overdrive: 2.0,
                bass: 1.5,
                treble: 0.0,
                echo: { delay: 0.35, decay: 0.05 },
                compand: { attack: 0.06, ratio: 3.0 }
            };
        } else if (phase < 0.28) {
            // First Quarter → Punchy tape compression
            return {
                type: 'balanced',
                overdrive: 2.3,
                bass: 1.5,
                treble: 0.5,
                echo: { delay: 0.30, decay: 0.06 },
                compand: { attack: 0.06, ratio: 3.0 }
            };
        } else if (phase < 0.47) {
            // Waxing Gibbous → Open, dynamic
            return {
                type: 'growing',
                overdrive: 1.7,
                bass: 1.0,
                treble: 0.8,
                echo: { delay: 0.25, decay: 0.04 },
                compand: { attack: 0.05, ratio: 2.5 }
            };
        } else if (phase < 0.53) {
            // Full Moon → Bright, airy, light touch
            return {
                type: 'ethereal',
                overdrive: 1.2,
                bass: 0.5,
                treble: 1.5,
                echo: { delay: 0.20, decay: 0.03 },
                compand: { attack: 0.04, ratio: 2.0 }
            };
        } else if (phase < 0.72) {
            // Waning Gibbous → Warm, reflective
            return {
                type: 'reflective',
                overdrive: 2.0,
                bass: 1.3,
                treble: 0.3,
                echo: { delay: 0.35, decay: 0.05 },
                compand: { attack: 0.07, ratio: 3.0 }
            };
        } else if (phase < 0.78) {
            // Last Quarter → Driven, lo-fi
            return {
                type: 'releasing',
                overdrive: 2.5,
                bass: 1.8,
                treble: -0.3,
                echo: { delay: 0.40, decay: 0.07 },
                compand: { attack: 0.07, ratio: 3.5 }
            };
        } else {
            // Waning Crescent → Muffled warmth, tape degradation
            return {
                type: 'fading',
                overdrive: 2.8,
                bass: 2.0,
                treble: -0.8,
                echo: { delay: 0.45, decay: 0.09 },
                compand: { attack: 0.08, ratio: 3.5 }
            };
        }
    }
    
    // === Time of Day Modifiers ===
    static getTimeInfluence() {
        const now = new Date();
        const hour = now.getHours();
        
        if (hour >= 0 && hour < 6) {
            // Deep Night → Enhance darkness
            return {
                type: 'deep_night',
                modifier: 1.3,
                echoMultiplier: 1.4,
                bassBoost: 0.5
            };
        } else if (hour >= 6 && hour < 12) {
            // Morning → Brighter
            return {
                type: 'morning',
                modifier: 0.8,
                echoMultiplier: 0.7,
                bassBoost: -0.3,
                trebleBoost: 0.5
            };
        } else if (hour >= 12 && hour < 18) {
            // Afternoon → Neutral
            return {
                type: 'afternoon',
                modifier: 1.0,
                echoMultiplier: 1.0,
                bassBoost: 0.0
            };
        } else {
            // Evening → Warm
            return {
                type: 'evening',
                modifier: 1.1,
                echoMultiplier: 1.2,
                bassBoost: 0.2,
                trebleBoost: -0.2
            };
        }
    }
    
    static getInfluencedParameters() {
        const moonPhase = this.getMoonPhase();
        const timeInfluence = this.getTimeInfluence();
        
        // Combine moon + time influences
        const base = moonPhase.influence;
        const time = timeInfluence;
        
        return {
            moonPhase: moonPhase.name,
            timeOfDay: time.type,
            influence: moonPhase.influence.type,
            
            // Apply time modifiers to moon base
            overdrive: Math.max(1.0, base.overdrive * time.modifier),
            bass: base.bass + (time.bassBoost || 0),
            treble: base.treble + (time.trebleBoost || 0),
            echo: {
                delay: base.echo.delay * time.echoMultiplier,
                decay: base.echo.decay * time.echoMultiplier
            },
            compand: base.compand,
            
            description: `${moonPhase.name} ${time.type} processing (${base.type})`
        };
    }
}

module.exports = LunarProcessor;