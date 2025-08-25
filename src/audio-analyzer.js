const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// ===================================================================
// 🎵 AUDIO ANALYZER - Extract features for visual generation
// ===================================================================

class AudioAnalyzer {
    /**
     * Extract audio features using FFmpeg
     * Returns waveform data and basic audio characteristics
     */
    static async analyzeAudio(inputPath) {
        const features = {
            duration: 0,
            waveform: [],
            energy: 0,
            peaks: [],
            // These would require more complex analysis:
            tempo: 120, // Default BPM
            brightness: 0.5 // Spectral centroid normalized
        };

        try {
            // Get duration using ffprobe
            const durationCmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${inputPath}"`;
            features.duration = parseFloat(execSync(durationCmd, { encoding: 'utf8' }).trim());
            
            // Extract waveform samples (downsample for visualization)
            // We want ~360 samples for circular visualization
            const samples = 360;
            const waveformCmd = `ffmpeg -i "${inputPath}" -af "aresample=8000,highpass=f=200,lowpass=f=3000" -f f32le -acodec pcm_f32le - 2>/dev/null`;
            
            try {
                const waveformBuffer = execSync(waveformCmd, { maxBuffer: 10 * 1024 * 1024 });
                features.waveform = this.extractWaveformPeaks(waveformBuffer, samples);
                features.energy = this.calculateEnergy(features.waveform);
                features.peaks = this.findPeaks(features.waveform);
            } catch (waveformError) {
                // If waveform extraction fails, generate synthetic data
                console.log('⚠️ Using synthetic waveform data');
                features.waveform = this.generateSyntheticWaveform(samples);
                features.energy = 0.5;
            }

            // Estimate tempo based on peak intervals (simplified)
            if (features.peaks.length > 1) {
                const intervals = [];
                for (let i = 1; i < features.peaks.length && i < 10; i++) {
                    intervals.push(features.peaks[i] - features.peaks[i-1]);
                }
                if (intervals.length > 0) {
                    const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length;
                    const samplesPerSecond = samples / features.duration;
                    const beatsPerSecond = samplesPerSecond / avgInterval;
                    features.tempo = Math.round(beatsPerSecond * 60);
                    features.tempo = Math.max(60, Math.min(180, features.tempo)); // Clamp to reasonable range
                }
            }

            // Estimate brightness (simplified - based on high frequency presence)
            const highFreqSamples = features.waveform.slice(Math.floor(samples * 0.7));
            const highEnergy = this.calculateEnergy(highFreqSamples);
            features.brightness = Math.min(1, highEnergy * 2);

        } catch (error) {
            console.log('⚠️ Audio analysis failed, using defaults:', error.message);
            // Return default features
            features.waveform = this.generateSyntheticWaveform(360);
        }

        return features;
    }

    /**
     * Extract evenly spaced peaks from audio buffer
     */
    static extractWaveformPeaks(buffer, targetSamples) {
        const floatArray = new Float32Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / 4);
        const peaks = [];
        const samplesPerPeak = Math.floor(floatArray.length / targetSamples);
        
        for (let i = 0; i < targetSamples; i++) {
            const start = i * samplesPerPeak;
            const end = Math.min(start + samplesPerPeak, floatArray.length);
            
            let maxAbs = 0;
            for (let j = start; j < end; j++) {
                const abs = Math.abs(floatArray[j]);
                if (abs > maxAbs) maxAbs = abs;
            }
            
            peaks.push(Math.min(1, maxAbs)); // Normalize to 0-1
        }
        
        return peaks;
    }

    /**
     * Calculate overall energy/loudness
     */
    static calculateEnergy(waveform) {
        const sum = waveform.reduce((acc, val) => acc + Math.abs(val), 0);
        return Math.min(1, sum / waveform.length * 2);
    }

    /**
     * Find peak positions for beat detection
     */
    static findPeaks(waveform, threshold = 0.6) {
        const peaks = [];
        for (let i = 1; i < waveform.length - 1; i++) {
            if (waveform[i] > threshold &&
                waveform[i] > waveform[i - 1] &&
                waveform[i] > waveform[i + 1]) {
                peaks.push(i);
            }
        }
        return peaks;
    }

    /**
     * Generate synthetic waveform for fallback
     */
    static generateSyntheticWaveform(samples) {
        const waveform = [];
        for (let i = 0; i < samples; i++) {
            // Create interesting synthetic pattern
            const angle = (i / samples) * Math.PI * 8;
            const value = Math.sin(angle) * 0.5 + 
                         Math.sin(angle * 3) * 0.3 + 
                         Math.sin(angle * 7) * 0.2;
            waveform.push(Math.abs(value));
        }
        return waveform;
    }

    /**
     * Detect genre/mood from filename or metadata (simple heuristic)
     */
    static detectMood(filename, duration, energy, tempo) {
        const name = filename.toLowerCase();
        
        // Check filename for mood hints
        if (name.includes('ambient') || name.includes('chill') || name.includes('relax')) {
            return 'calm';
        }
        if (name.includes('dance') || name.includes('party') || name.includes('club')) {
            return 'energetic';
        }
        if (name.includes('dark') || name.includes('gothic') || name.includes('doom')) {
            return 'dark';
        }
        if (name.includes('happy') || name.includes('joy') || name.includes('fun')) {
            return 'happy';
        }
        
        // Use audio features
        if (energy > 0.7 && tempo > 120) return 'energetic';
        if (energy < 0.3 && tempo < 100) return 'calm';
        if (energy > 0.5 && tempo > 140) return 'intense';
        
        return 'neutral';
    }

    /**
     * Get style suggestions based on audio features
     */
    static suggestArtStyle(features, filename) {
        const mood = this.detectMood(filename, features.duration, features.energy, features.tempo);
        
        const styleMap = {
            'energetic': ['glitch', 'matrix', 'geometric'],
            'calm': ['cosmic', 'aurora', 'organic'],
            'dark': ['glitch', 'matrix', 'fractal'],
            'happy': ['vapor', 'retro', 'crystal'],
            'intense': ['fractal', 'glitch', 'nebula'],
            'neutral': ['cosmic', 'geometric', 'mystic']
        };
        
        const styles = styleMap[mood] || styleMap['neutral'];
        return styles[Math.floor(Math.random() * styles.length)];
    }
}

module.exports = AudioAnalyzer;