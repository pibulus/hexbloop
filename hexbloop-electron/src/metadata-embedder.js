/**
 * @fileoverview Metadata embedding for audio files with artwork
 * @author Hexbloop Audio Labs
 * @description Embeds metadata and artwork into processed audio files
 */

const NodeID3 = require('node-id3');
const fs = require('fs').promises;
const path = require('path');

class MetadataEmbedder {
    constructor() {
        // No need for FFmpeg detection anymore, using node-id3 for MP3s
    }
    
    
    
    /**
     * Embed metadata and artwork into MP3 file using node-id3
     */
    async embedMetadata(inputPath, outputPath, metadata, artworkPath = null) {
        // First copy the file to output location
        await fs.copyFile(inputPath, outputPath);
        
        // Build ID3 tags
        const tags = {
            title: metadata.title || 'Unknown Title',
            artist: metadata.artist || 'Unknown Artist',
            album: metadata.album || 'Unknown Album',
            year: metadata.date || new Date().getFullYear().toString(),
            genre: metadata.genre || 'Electronic',
            comment: {
                language: 'eng',
                text: metadata.comment || 'Processed with Hexbloop'
            }
        };
        
        // Add artwork if provided
        if (artworkPath && artworkPath.endsWith('.png')) {
            try {
                const imageBuffer = await fs.readFile(artworkPath);
                tags.image = {
                    mime: 'image/png',
                    type: {
                        id: 3, // Front cover
                        name: 'front cover'
                    },
                    description: 'Hexbloop Artwork',
                    imageBuffer: imageBuffer
                };
                console.log(`🎨 Embedding PNG artwork: ${artworkPath}`);
            } catch (error) {
                console.log(`⚠️  Could not read artwork file: ${error.message}`);
            }
        }
        
        console.log(`🎵 Embedding metadata: ${metadata.artist} - ${metadata.title}`);
        
        try {
            // Write tags to MP3 file
            const success = NodeID3.write(tags, outputPath);
            if (success) {
                console.log('✅ Metadata and artwork embedded successfully');
                return outputPath;
            } else {
                throw new Error('Failed to write ID3 tags');
            }
        } catch (error) {
            console.error(`❌ Error embedding metadata: ${error.message}`);
            throw error;
        }
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