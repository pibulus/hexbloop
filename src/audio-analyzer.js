const fs = require('fs');
const { execFileSync, spawn } = require('child_process');
const path = require('path');
const binaries = require('./binary-resolver');

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
            tempo: null, // No beat claim without a confident onset envelope
            brightness: null, // Frequency-domain energy centroid
            analysisAvailable: false
        };

        try {
            // Get duration using ffprobe (bundled or system)
            // execFileSync with an arg array — no shell, so filenames with
            // quotes/spaces/$() can't break or inject anything
            const ffprobeBin = binaries.ffprobe.path || 'ffprobe';
            features.duration = parseFloat(execFileSync(ffprobeBin, [
                '-v', 'error',
                '-show_entries', 'format=duration',
                '-of', 'default=noprint_wrappers=1:nokey=1',
                inputPath
            ], { encoding: 'utf8', timeout: 10000 }).trim());
            
            // Extract waveform samples (downsample for visualization)
            // We want ~360 samples for circular visualization
            const samples = 360;

            try {
                // Stream audio data with a memory cap instead of buffering entire file
                // 22.05kHz retains the high frequencies needed for brightness
                const waveformBuffer = await this.extractWaveformStream(inputPath);
                features.waveform = this.extractWaveformPeaks(waveformBuffer, samples);
                features.energy = this.calculateEnergy(features.waveform);
                features.peaks = this.findPeaks(features.waveform);
                features.brightness = this.calculateSpectralBrightness(waveformBuffer, 22050);
                features.tempo = this.estimateTempo(waveformBuffer, 22050);
                features.analysisAvailable = true;
            } catch (waveformError) {
                // If waveform extraction fails, generate synthetic data
                console.log('⚠️ Using synthetic waveform data');
                features.waveform = this.generateSyntheticWaveform(samples);
                features.energy = 0.5;
            }

            if (!Number.isFinite(features.duration) || features.duration <= 0) {
                features.duration = 0;
            }

        } catch (error) {
            console.log('⚠️ Audio analysis failed, using defaults:', error.message);
            // Return default features
            features.waveform = this.generateSyntheticWaveform(360);
        }

        return features;
    }

    static calculateSpectralBrightness(buffer, sampleRate) {
        const samples = new Float32Array(buffer.buffer, buffer.byteOffset, Math.floor(buffer.length / 4));
        const size = 2048;
        if (samples.length < size) return null;
        const frequencies = [125, 250, 440, 750, 1200, 2000, 3000, 4400, 6000, 8500];
        let weighted = 0, total = 0;
        const windows = Math.min(12, Math.floor(samples.length / size));
        for (let w = 0; w < windows; w++) {
            const start = Math.floor(w * (samples.length - size) / Math.max(1, windows - 1));
            for (const hz of frequencies) {
                // Goertzel energy at actual frequency bins, not time positions.
                const coefficient = 2 * Math.cos(2 * Math.PI * hz / sampleRate);
                let s1 = 0, s2 = 0;
                for (let i = 0; i < size; i++) {
                    const s = samples[start + i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / (size - 1))) + coefficient * s1 - s2;
                    s2 = s1; s1 = s;
                }
                const power = Math.max(0, s1 * s1 + s2 * s2 - coefficient * s1 * s2);
                weighted += power * hz;
                total += power;
            }
        }
        return total > 1e-9 ? Math.min(1, weighted / total / 8500) : null;
    }

    static estimateTempo(buffer, sampleRate) {
        const samples = new Float32Array(buffer.buffer, buffer.byteOffset, Math.floor(buffer.length / 4));
        if (samples.length < sampleRate * 8) return null;
        const hop = 512, frame = 1024, rms = [];
        for (let start = 0; start + frame < samples.length; start += hop) {
            let sum = 0;
            for (let i = 0; i < frame; i++) sum += samples[start + i] ** 2;
            rms.push(Math.sqrt(sum / frame));
        }
        const onset = rms.slice(1).map((value, index) => Math.max(0, value - rms[index]));
        if (onset.filter(value => value > 0.005).length < 6) return null;
        const scores = [];
        for (let bpm = 70; bpm <= 180; bpm++) {
            const lag = Math.round(60 * sampleRate / (bpm * hop));
            let score = 0;
            for (let i = lag; i < onset.length; i++) score += onset[i] * onset[i - lag];
            scores.push({ bpm, score });
        }
        const average = scores.reduce((sum, item) => sum + item.score, 0) / scores.length;
        const best = scores.reduce((a, b) => b.score > a.score ? b : a);
        return average > 0 && best.score > average * 1.4 ? best.bpm : null;
    }

    /**
     * Stream-based waveform extraction with memory cap
     * Downsamples to 2kHz mono to keep memory under ~1MB for any file length
     */
    static extractWaveformStream(inputPath) {
        return new Promise((resolve, reject) => {
            const MAX_BYTES = 1024 * 1024; // 1MB cap
            const chunks = [];
            let totalBytes = 0;

            const ffmpegBin = binaries.ffmpeg.path || 'ffmpeg';
            const proc = spawn(ffmpegBin, [
                '-i', inputPath,
                '-ar', '22050', '-t', '15',
                '-ac', '1',           // Mono - halves memory
                '-f', 'f32le',
                '-acodec', 'pcm_f32le',
                '-v', 'error',
                '-'                    // Output to stdout
            ], { stdio: ['ignore', 'pipe', 'pipe'] });

            proc.stdout.on('data', (chunk) => {
                if (totalBytes < MAX_BYTES) {
                    const remaining = MAX_BYTES - totalBytes;
                    chunks.push(remaining >= chunk.length ? chunk : chunk.subarray(0, remaining));
                    totalBytes += chunk.length;
                }
                // Data beyond the cap is discarded - we have enough for analysis
            });

            proc.on('close', (code) => {
                if (chunks.length > 0) {
                    resolve(Buffer.concat(chunks));
                } else {
                    reject(new Error(`FFmpeg waveform extraction failed (code ${code})`));
                }
            });

            proc.on('error', reject);

            // Kill if it takes too long (30s timeout)
            const timeout = setTimeout(() => {
                proc.kill('SIGTERM');
                if (chunks.length > 0) {
                    resolve(Buffer.concat(chunks));
                } else {
                    reject(new Error('Waveform extraction timed out'));
                }
            }, 30000);

            proc.on('close', () => clearTimeout(timeout));
        });
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
        if (Number.isFinite(tempo) && energy > 0.7 && tempo > 120) return 'energetic';
        if (Number.isFinite(tempo) && energy < 0.3 && tempo < 100) return 'calm';
        if (Number.isFinite(tempo) && energy > 0.5 && tempo > 140) return 'intense';
        
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
