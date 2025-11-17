/**
 * @fileoverview Metadata embedding for audio files with artwork
 * @author Hexbloop Audio Labs
 * @description Embeds metadata and artwork into processed audio files (all formats)
 */

const NodeID3 = require('node-id3');
const fs = require('fs').promises;
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

class MetadataEmbedder {
    constructor() {
        // Support both node-id3 (MP3) and FFmpeg (all formats)
    }

    /**
     * Embed metadata and artwork - automatically detects format and uses appropriate method
     */
    async embedMetadata(inputPath, outputPath, metadata, artworkPath = null) {
        const ext = path.extname(outputPath).toLowerCase();

        // Use node-id3 for MP3 (faster and more reliable for ID3 tags)
        if (ext === '.mp3') {
            return await this.embedMetadataMP3(inputPath, outputPath, metadata, artworkPath);
        }

        // Use FFmpeg for all other formats (WAV, FLAC, AAC, OGG, etc.)
        return await this.embedMetadataFFmpeg(inputPath, outputPath, metadata, artworkPath);
    }

    /**
     * Embed metadata and artwork into MP3 file using node-id3
     */
    async embedMetadataMP3(inputPath, outputPath, metadata, artworkPath = null) {
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
                console.log(`🎨 Embedding PNG artwork (MP3): ${artworkPath}`);
            } catch (error) {
                console.log(`⚠️  Could not read artwork file: ${error.message}`);
            }
        }

        console.log(`🎵 Embedding MP3 metadata: ${metadata.artist} - ${metadata.title}`);

        try {
            // Write tags to MP3 file
            const success = NodeID3.write(tags, outputPath);
            if (success) {
                console.log('✅ MP3 metadata and artwork embedded successfully');
                return outputPath;
            } else {
                throw new Error('Failed to write ID3 tags');
            }
        } catch (error) {
            console.error(`❌ Error embedding MP3 metadata: ${error.message}`);
            throw error;
        }
    }

    /**
     * Embed metadata and artwork using FFmpeg (for WAV, FLAC, AAC, OGG, etc.)
     */
    async embedMetadataFFmpeg(inputPath, outputPath, metadata, artworkPath = null) {
        return new Promise((resolve, reject) => {
            console.log(`🎵 Embedding metadata via FFmpeg: ${metadata.artist} - ${metadata.title}`);

            let command = ffmpeg(inputPath);

            // Add metadata tags
            command = command
                .outputOptions([
                    `-metadata title="${this.escapeMetadata(metadata.title || 'Unknown Title')}"`,
                    `-metadata artist="${this.escapeMetadata(metadata.artist || 'Unknown Artist')}"`,
                    `-metadata album="${this.escapeMetadata(metadata.album || 'Unknown Album')}"`,
                    `-metadata date="${metadata.date || new Date().getFullYear()}"`,
                    `-metadata genre="${this.escapeMetadata(metadata.genre || 'Electronic')}"`,
                    `-metadata comment="${this.escapeMetadata(metadata.comment || 'Processed with Hexbloop')}"`
                ]);

            // Add artwork if provided (works for FLAC, AAC/M4A, OGG)
            if (artworkPath && artworkPath.endsWith('.png')) {
                const ext = path.extname(outputPath).toLowerCase();

                // Different formats need different artwork embedding approaches
                if (ext === '.flac' || ext === '.m4a' || ext === '.ogg') {
                    try {
                        command = command
                            .input(artworkPath)
                            .outputOptions([
                                '-map 0:a',  // Map audio from first input
                                '-map 1:v',  // Map artwork from second input
                                '-c:a copy', // Copy audio codec
                                '-c:v copy', // Copy image codec
                                '-metadata:s:v title="Album cover"',
                                '-metadata:s:v comment="Cover (front)"',
                                '-disposition:v:0 attached_pic'
                            ]);
                        console.log(`🎨 Embedding artwork via FFmpeg (${ext.toUpperCase()})`);
                    } catch (error) {
                        console.log(`⚠️  Could not add artwork for ${ext}: ${error.message}`);
                    }
                } else if (ext === '.wav') {
                    // WAV doesn't support embedded artwork, skip silently
                    console.log(`ℹ️  WAV format doesn't support embedded artwork`);
                } else {
                    console.log(`ℹ️  Artwork embedding not yet supported for ${ext}`);
                }
            }

            // Copy codec to preserve quality
            if (!artworkPath || path.extname(outputPath).toLowerCase() === '.wav') {
                command = command.audioCodec('copy');
            }

            command
                .on('start', (commandLine) => {
                    console.log('🎛️ FFmpeg metadata command: ' + commandLine);
                })
                .on('end', () => {
                    console.log('✅ FFmpeg metadata embedded successfully');
                    resolve(outputPath);
                })
                .on('error', (err) => {
                    console.error('❌ FFmpeg metadata embedding failed:', err.message);
                    reject(err);
                })
                .save(outputPath);
        });
    }

    /**
     * Escape special characters in metadata for FFmpeg
     */
    escapeMetadata(str) {
        return str.replace(/["\\]/g, '\\$&');
    }
}

module.exports = MetadataEmbedder;