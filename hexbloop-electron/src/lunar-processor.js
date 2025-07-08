/**
 * @fileoverview Lunar processor for moon phase influenced audio processing
 * @author Hexbloop Audio Labs
 * @description Implements mystical lunar influences on audio transformation
 */

class LunarProcessor {
    static getMoonPhase() {
        // Calculate current moon phase (0-1, where 0/1 = new moon, 0.5 = full moon)
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        
        // Simplified lunar phase calculation
        // Based on the fact that moon phases repeat every 29.53 days
        const lunarMonth = 29.530588853;
        
        // Known new moon reference: January 6, 2000
        const referenceNewMoon = new Date(2000, 0, 6);
        const daysSinceReference = (now - referenceNewMoon) / (1000 * 60 * 60 * 24);
        
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
    
    static getPhaseInfluence(phase) {
        // Each moon phase affects audio processing differently
        if (phase < 0.03 || phase > 0.97) {
            // New Moon - Dark, heavy, mysterious
            return {
                type: 'dark',
                overdrive: 6.0,
                bass: 4.0,
                treble: -0.5,
                echo: { delay: 0.5, decay: 0.1 },
                compand: { attack: 0.3, ratio: 8 }
            };
        } else if (phase < 0.22) {
            // Waxing Crescent - Building energy
            return {
                type: 'building',
                overdrive: 3.5,
                bass: 2.0,
                treble: 0.5,
                echo: { delay: 0.4, decay: 0.06 },
                compand: { attack: 0.25, ratio: 6 }
            };
        } else if (phase < 0.28) {
            // First Quarter - Balanced but intense
            return {
                type: 'balanced',
                overdrive: 4.0,
                bass: 2.5,
                treble: 1.0,
                echo: { delay: 0.35, decay: 0.07 },
                compand: { attack: 0.2, ratio: 6 }
            };
        } else if (phase < 0.47) {
            // Waxing Gibbous - Growing power
            return {
                type: 'growing',
                overdrive: 3.0,
                bass: 1.5,
                treble: 1.5,
                echo: { delay: 0.3, decay: 0.05 },
                compand: { attack: 0.15, ratio: 4 }
            };
        } else if (phase < 0.53) {
            // Full Moon - Bright, ethereal, maximum energy
            return {
                type: 'ethereal',
                overdrive: 2.0,
                bass: 1.0,
                treble: 2.5,
                echo: { delay: 0.25, decay: 0.04 },
                compand: { attack: 0.1, ratio: 3 }
            };
        } else if (phase < 0.72) {
            // Waning Gibbous - Reflective power
            return {
                type: 'reflective',
                overdrive: 3.5,
                bass: 2.0,
                treble: 1.0,
                echo: { delay: 0.4, decay: 0.06 },
                compand: { attack: 0.2, ratio: 5 }
            };
        } else if (phase < 0.78) {
            // Last Quarter - Releasing energy
            return {
                type: 'releasing',
                overdrive: 4.5,
                bass: 3.0,
                treble: 0.0,
                echo: { delay: 0.45, decay: 0.08 },
                compand: { attack: 0.25, ratio: 7 }
            };
        } else {
            // Waning Crescent - Fading to darkness
            return {
                type: 'fading',
                overdrive: 5.0,
                bass: 3.5,
                treble: -1.0,
                echo: { delay: 0.5, decay: 0.09 },
                compand: { attack: 0.3, ratio: 7 }
            };
        }
    }
    
    static getTimeInfluence() {
        const now = new Date();
        const hour = now.getHours();
        
        // Time of day affects processing subtly
        if (hour >= 0 && hour < 6) {
            // Deep Night - Enhance the darkness
            return {
                type: 'deep_night',
                modifier: 1.3,
                echoMultiplier: 1.4,
                bassBoost: 0.5
            };
        } else if (hour >= 6 && hour < 12) {
            // Morning - Brighter, cleaner
            return {
                type: 'morning',
                modifier: 0.8,
                echoMultiplier: 0.7,
                bassBoost: -0.3,
                trebleBoost: 0.5
            };
        } else if (hour >= 12 && hour < 18) {
            // Afternoon - Neutral
            return {
                type: 'afternoon',
                modifier: 1.0,
                echoMultiplier: 1.0,
                bassBoost: 0.0
            };
        } else {
            // Evening - Warm, mellow
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
        
        // Combine moon phase and time influences
        const base = moonPhase.influence;
        const time = timeInfluence;
        
        return {
            moonPhase: moonPhase.name,
            timeOfDay: time.type,
            influence: moonPhase.influence.type,
            
            // Apply time modifications to moon phase base
            overdrive: Math.max(1.0, base.overdrive * time.modifier),
            bass: base.bass + (time.bassBoost || 0),
            treble: base.treble + (time.trebleBoost || 0),
            echo: {
                delay: base.echo.delay * time.echoMultiplier,
                decay: base.echo.decay * time.echoMultiplier
            },
            compand: base.compand,
            
            // Mystical flavor text
            description: `${moonPhase.name} ${time.type} processing (${base.type})`
        };
    }
}

module.exports = LunarProcessor;