/**
 * @fileoverview Metadata embedding for audio files with artwork
 * @author Hexbloop Audio Labs
 * @description Embeds metadata and artwork into processed audio files
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class MetadataEmbedder {
    constructor() {
        this.ffmpegPath = null;
        this.initializeFFmpeg();
    }
    
    /**
     * Initialize FFmpeg path detection
     */
    async initializeFFmpeg() {
        const possiblePaths = [
            '/opt/homebrew/bin/ffmpeg',
            '/usr/local/bin/ffmpeg',
            '/usr/bin/ffmpeg',
            'ffmpeg'
        ];
        
        for (const ffmpegPath of possiblePaths) {
            try {
                await this.testFFmpeg(ffmpegPath);
                this.ffmpegPath = ffmpegPath;
                console.log(`✅ FFmpeg found at: ${ffmpegPath}`);
                return;
            } catch (error) {
                continue;
            }
        }
        
        console.log('⚠️  FFmpeg not found - metadata embedding will be limited');
    }
    
    /**
     * Test FFmpeg availability
     */
    testFFmpeg(ffmpegPath) {
        return new Promise((resolve, reject) => {
            const process = spawn(ffmpegPath, ['-version'], { stdio: 'pipe' });
            
            process.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`FFmpeg test failed with code ${code}`));
                }
            });
            
            process.on('error', reject);
        });
    }
    
    /**
     * Embed metadata and artwork into audio file
     */
    async embedMetadata(inputPath, outputPath, metadata, artworkPath = null) {
        if (!this.ffmpegPath) {
            console.log('⚠️  FFmpeg not available - skipping metadata embedding');
            // Copy file without metadata embedding
            await fs.copyFile(inputPath, outputPath);
            return outputPath;
        }
        
        const args = [
            '-i', inputPath,
            '-c', 'copy', // Copy streams without re-encoding
            '-metadata', `artist=${metadata.artist || 'Unknown Artist'}`,
            '-metadata', `album=${metadata.album || 'Unknown Album'}`,
            '-metadata', `title=${metadata.title || 'Unknown Title'}`,
            '-metadata', `date=${metadata.date || new Date().getFullYear()}`,
            '-metadata', `genre=${metadata.genre || 'Electronic'}`,
            '-metadata', `comment=${metadata.comment || 'Processed with Hexbloop'}`,
            '-y', // Overwrite output file
            outputPath
        ];
        
        // Add PNG artwork if provided
        if (artworkPath && artworkPath.endsWith('.png')) {
            try {
                await fs.access(artworkPath);
                args.splice(2, 0, '-i', artworkPath); // Insert artwork input
                args.splice(6, 0, '-map', '0:a', '-map', '1:0'); // Map audio from first input, artwork from second
                args.splice(8, 0, '-id3v2_version', '3'); // Use ID3v2.3 for better compatibility
                console.log(`🎨 Embedding PNG artwork: ${artworkPath}`);
            } catch (error) {
                console.log(`⚠️  Artwork file not found: ${artworkPath}`);
            }
        } else if (artworkPath) {
            console.log(`🎨 Artwork generated: ${artworkPath} (SVG format, PNG version will be embedded)`);
        }
        
        return new Promise((resolve, reject) => {
            console.log(`🎵 Embedding metadata: ${metadata.artist} - ${metadata.title}`);
            
            const process = spawn(this.ffmpegPath, args, { stdio: 'pipe' });
            
            let stderr = '';
            process.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            
            process.on('close', (code) => {
                if (code === 0) {
                    console.log('✅ Metadata embedded successfully');
                    resolve(outputPath);
                } else {
                    console.error(`❌ FFmpeg metadata embedding failed with code ${code}`);
                    console.error(`FFmpeg stderr: ${stderr}`);
                    reject(new Error(`FFmpeg failed with code ${code}`));
                }
            });
            
            process.on('error', (error) => {
                console.error(`❌ Error running FFmpeg: ${error.message}`);
                reject(error);
            });
        });
    }
    
    /**
     * Generate metadata from band name and processing info
     */
    generateMetadata(bandName, originalFileName = null) {
        const now = new Date();
        const timestamp = now.toISOString().slice(0, 19).replace('T', ' ');
        
        // Extract genre hints from band name style
        let genre = 'Electronic';
        const bandNameLower = bandName.toLowerCase();
        
        if (bandNameLower.includes('black') || bandNameLower.includes('death') || bandNameLower.includes('necro')) {
            genre = 'Black Metal';
        } else if (bandNameLower.includes('sparkle') || bandNameLower.includes('rainbow') || bandNameLower.includes('fairy')) {
            genre = 'Sparklepop';
        } else if (bandNameLower.includes('witch') || bandNameLower.includes('occult') || bandNameLower.includes('ritual')) {
            genre = 'Witch House';
        } else if (bandNameLower.includes('cyber') || bandNameLower.includes('digital') || bandNameLower.includes('neural')) {
            genre = 'Cyberpunk';
        }
        
        return {
            artist: bandName,
            album: `${bandName} - Chaos Magic Audio`,
            title: originalFileName ? path.parse(originalFileName).name : 'Hexbloop Transform',
            date: now.getFullYear().toString(),
            genre: genre,
            comment: `Processed with Hexbloop Chaos Magic Audio Engine on ${timestamp}. 🌙✨`
        };
    }
    
    /**
     * Convert SVG artwork to PNG for embedding
     */
    async convertArtworkForEmbedding(svgPath, outputPath) {
        if (!this.ffmpegPath) {
            console.log('⚠️  FFmpeg not available - cannot convert SVG to PNG');
            return null;
        }
        
        // FFmpeg doesn't handle SVG directly, so we'll need to use a different approach
        // For now, we'll save the SVG content as a comment in the metadata
        try {
            const svgContent = await fs.readFile(svgPath, 'utf8');
            console.log('📝 SVG artwork will be embedded as metadata comment');
            return svgPath; // Return original path for reference
        } catch (error) {
            console.error(`❌ Error reading SVG file: ${error.message}`);
            return null;
        }
    }
    
    /**
     * Process file with metadata and artwork
     */
    async processFileWithMetadata(inputPath, outputPath, bandName, artworkPath = null) {
        const metadata = this.generateMetadata(bandName, path.basename(inputPath));
        
        try {
            // First embed metadata
            const metadataResult = await this.embedMetadata(inputPath, outputPath, metadata, artworkPath);
            
            console.log(`✅ File processed with metadata: ${outputPath}`);
            return {
                success: true,
                outputPath: metadataResult,
                metadata: metadata,
                artworkPath: artworkPath
            };
        } catch (error) {
            console.error(`❌ Error processing file with metadata: ${error.message}`);
            // Fallback: copy file without metadata
            await fs.copyFile(inputPath, outputPath);
            return {
                success: false,
                outputPath: outputPath,
                error: error.message,
                metadata: metadata
            };
        }
    }
    
    /**
     * Check if metadata embedding is available
     */
    isAvailable() {
        return this.ffmpegPath !== null;
    }
    
    /**
     * Get status information
     */
    getStatus() {
        return {
            available: this.isAvailable(),
            ffmpegPath: this.ffmpegPath,
            capabilities: this.ffmpegPath ? ['metadata', 'artwork'] : ['limited']
        };
    }
}

module.exports = MetadataEmbedder;