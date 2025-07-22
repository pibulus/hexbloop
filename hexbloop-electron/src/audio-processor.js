/**
 * @fileoverview Audio processing pipeline with lunar influences
 * @author Hexbloop Audio Labs
 * 
 * Pipeline: Input → Sox (mystical effects) → FFmpeg (mastering) → MP3 with embedded artwork
 */

const ffmpeg = require('fluent-ffmpeg');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const LunarProcessor = require('./lunar-processor');
const NameGenerator = require('./name-generator');
const ArtworkGenerator = require('./artwork-generator');
const MetadataEmbedder = require('./metadata-embedder');

class AudioProcessor {
    static async processFile(inputPath, outputPath) {
        console.log(`🎵 Processing: ${path.basename(inputPath)} -> ${path.basename(outputPath)}`);
        
        const bandName = NameGenerator.generateMystical();
        console.log(`✨ Generated band name: ${bandName}`);
        
        const influences = LunarProcessor.getInfluencedParameters();
        console.log(`🌙 ${influences.description}`);
        
        // Temp files for processing stages
        const tempFile = path.join(path.dirname(outputPath), 'temp_audio.aif');
        const processedFile = path.join(path.dirname(outputPath), 'temp_processed.mp3');
        
        const artworkGenerator = new ArtworkGenerator();
        const metadataEmbedder = new MetadataEmbedder();
        
        try {
            // Step 1: Sox processing with lunar influences
            await this.processSox(inputPath, tempFile, influences);
            
            // Step 2: FFmpeg mastering
            await this.processFFmpeg(tempFile, processedFile);
            
            // Step 3: Generate artwork
            const artworkPath = path.join(path.dirname(outputPath), `${bandName.replace(/[^a-zA-Z0-9]/g, '_')}_artwork.svg`);
            const artworkResult = await artworkGenerator.generateArtwork(bandName, artworkPath);
            
            // Step 4: Embed metadata and artwork
            await metadataEmbedder.processFileWithMetadata(processedFile, outputPath, bandName, artworkResult.pngPath);
            
            // Clean up temp files
            if (fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile);
            }
            if (fs.existsSync(processedFile)) {
                fs.unlinkSync(processedFile);
            }
            
            // Clean up artwork files
            try {
                if (fs.existsSync(artworkPath)) {
                    fs.unlinkSync(artworkPath);
                    console.log('🧹 Cleaned up SVG artwork file');
                }
                if (artworkResult.pngPath && fs.existsSync(artworkResult.pngPath)) {
                    fs.unlinkSync(artworkResult.pngPath);
                    console.log('🧹 Cleaned up PNG artwork file');
                }
            } catch (cleanupError) {
                console.log('⚠️  Could not clean up artwork files:', cleanupError.message);
            }
            
            console.log(`✅ Successfully processed: ${path.basename(outputPath)}`);
            return { success: true, bandName, artwork: artworkResult };
            
        } catch (error) {
            // Clean up temp files on error
            if (fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile);
            }
            if (fs.existsSync(processedFile)) {
                fs.unlinkSync(processedFile);
            }
            throw error;
        }
    }
    
    static async processSox(inputPath, outputPath, influences) {
        return new Promise((resolve, reject) => {
            // Sox effects chain with lunar-influenced parameters
            const soxProcess = spawn('sox', [
                inputPath,
                outputPath,
                'gain', '-n', '-1.5',                    // Normalize
                'overdrive', influences.overdrive.toString(), '2.5',  // Distortion
                'bass', `+${influences.bass}`,            // Low freq boost
                'treble', influences.treble >= 0 ? `+${influences.treble}` : influences.treble.toString(),  // High freq adjust
                'echo', influences.echo.delay.toString(), influences.echo.decay.toString(), '6.5', '0.045',  // Echo effect
                'compand', `${influences.compand.attack},0.6`, '6:-70,-60,-20', '-2', '-90', '0.25',  // Compression
                'rate', '44100',                          // Sample rate
                'dither'                                  // Dithering
            ]);
            
            let stderr = '';
            
            soxProcess.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            
            soxProcess.on('close', (code) => {
                if (code === 0) {
                    console.log('✨ Sox processing complete');
                    resolve();
                } else {
                    console.log('⚠️ Sox not available, using FFmpeg for all processing...');
                    this.processWithFFmpegOnly(inputPath, outputPath, influences).then(resolve).catch(reject);
                }
            });
            
            soxProcess.on('error', (error) => {
                console.log('⚠️ Sox not found, using FFmpeg fallback...');
                this.processWithFFmpegOnly(inputPath, outputPath, influences).then(resolve).catch(reject);
            });
        });
    }
    
    static async processWithFFmpegOnly(inputPath, outputPath, influences) {
        return new Promise((resolve, reject) => {
            // FFmpeg fallback that approximates Sox effects
            const soxLikeFilters = [
                'volume=-1.5dB',
                `bass=g=${influences.bass}`,
                `treble=g=${influences.treble}`,
                `aecho=${influences.echo.delay}:${influences.echo.decay}:6.5:0.045`,
                `acompressor=threshold=-20dB:ratio=${influences.compand.ratio || 6}:attack=${influences.compand.attack * 1000}:release=250:makeup=2`
            ].join(',');
            
            ffmpeg(inputPath)
                .audioFilters(soxLikeFilters)
                .audioFrequency(44100)
                .audioChannels(2)
                .format('aiff')
                .on('start', (commandLine) => {
                    console.log('🎛️ FFmpeg sox-like processing: ' + commandLine);
                })
                .on('end', () => {
                    console.log('✨ FFmpeg sox-like processing complete');
                    resolve();
                })
                .on('error', (err) => {
                    console.error('❌ FFmpeg sox-like processing failed:', err.message);
                    reject(err);
                })
                .save(outputPath);
        });
    }
    
    static async processFFmpeg(inputPath, outputPath) {
        return new Promise((resolve, reject) => {
            // Mastering chain: EQ → Compression → Limiting
            const filterComplex = [
                'equalizer=f=100:t=q:w=1:g=0.3',      // Low bass boost
                'equalizer=f=800:t=q:w=1.2:g=0.5',    // Low-mid presence
                'equalizer=f=1600:t=q:w=1:g=0.4',     // Mid clarity
                'equalizer=f=5000:t=q:w=1:g=0.3',     // High-mid sparkle
                'acompressor=threshold=-12dB:ratio=2:attack=100:release=1000:makeup=1.5',  // Gentle compression
                'alimiter=limit=0.97'                  // Brick wall limiter
            ].join(',');
            
            ffmpeg(inputPath)
                .complexFilter(filterComplex)
                .audioFrequency(44100)
                .audioChannels(2)
                .format('mp3')
                .audioCodec('libmp3lame')
                .audioBitrate('320k')
                .on('start', (commandLine) => {
                    console.log('🎛️ FFmpeg mastering: ' + commandLine);
                })
                .on('progress', (progress) => {
                    if (progress.percent) {
                        process.stdout.write(`\r🎵 Processing: ${Math.round(progress.percent)}%`);
                    }
                })
                .on('end', () => {
                    console.log('\n✅ FFmpeg mastering complete');
                    resolve();
                })
                .on('error', (err) => {
                    console.error('\n❌ FFmpeg mastering failed:', err.message);
                    reject(err);
                })
                .save(outputPath);
        });
    }
}

module.exports = AudioProcessor;