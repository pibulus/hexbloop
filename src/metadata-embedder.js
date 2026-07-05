/**
 * @fileoverview Metadata embedding for audio files with artwork
 * @author Hexbloop Audio Labs
 * @description Embeds metadata and artwork into processed audio files (all formats)
 */

const NodeID3 = require('node-id3');
const fs = require('fs').promises;
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const binaries = require('./binary-resolver');

// Use resolved binary paths so metadata embedding works in packaged builds
if (binaries.ffmpeg.path) ffmpeg.setFfmpegPath(binaries.ffmpeg.path);
if (binaries.ffprobe.path) ffmpeg.setFfprobePath(binaries.ffprobe.path);

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
            year: (metadata.year || new Date().getFullYear()).toString(),
            genre: metadata.genre || 'Electronic',
            comment: {
                language: 'eng',
                text: metadata.comment || 'Processed with Hexbloop',
            },
        };

        // Add date if provided (TDAT frame)
        if (metadata.date) {
            tags.date = metadata.date;
        }

        // Add track number if provided
        if (metadata.trackNumber) {
            tags.trackNumber = String(metadata.trackNumber);
        }

        // Add artwork if provided (supports PNG and JPG)
        if (artworkPath && /\.(png|jpe?g)$/i.test(artworkPath)) {
            try {
                const imageBuffer = await fs.readFile(artworkPath);
                const isJpg = /\.jpe?g$/i.test(artworkPath);
                tags.image = {
                    mime: isJpg ? 'image/jpeg' : 'image/png',
                    type: {
                        id: 3, // Front cover
                        name: 'front cover'
                    },
                    description: 'Hexbloop Artwork',
                    imageBuffer: imageBuffer
                };
                console.log(`🎨 Embedding ${isJpg ? 'JPG' : 'PNG'} artwork (MP3): ${artworkPath}`);
            } catch (error) {
                console.log(`⚠️  Could not read artwork file: ${error.message}`);
            }
        }

        console.log(`🎵 Embedding MP3 metadata: ${tags.artist} - ${tags.title}`);

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
     *
     * If artwork muxing fails (container/codec combos vary), the file is
     * retried tags-only — losing the cover must never lose the track.
     */
    async embedMetadataFFmpeg(inputPath, outputPath, metadata, artworkPath = null) {
        const ext = path.extname(outputPath).toLowerCase();
        const artworkSupported = ['.flac', '.m4a'].includes(ext);
        const wantArtwork = Boolean(artworkPath && /\.(png|jpe?g)$/i.test(artworkPath));

        if (wantArtwork && !artworkSupported) {
            console.log(`ℹ️  Embedded artwork not supported for ${ext}, writing tags only`);
        }

        const run = (withArtwork) => new Promise((resolve, reject) => {
            const resolvedYear = metadata.year || metadata.date || new Date().getFullYear();

            let command = ffmpeg(inputPath);

            // IMPORTANT: two-arg outputOptions form — fluent-ffmpeg passes each
            // argument verbatim to spawn. Array strings get re-tokenized on
            // spaces, which mangles values like 'Lunar Transmutations'.
            command = command
                .outputOptions('-metadata', `title=${metadata.title || 'Unknown Title'}`)
                .outputOptions('-metadata', `artist=${metadata.artist || 'Unknown Artist'}`)
                .outputOptions('-metadata', `album=${metadata.album || 'Unknown Album'}`)
                .outputOptions('-metadata', `date=${resolvedYear}`)
                .outputOptions('-metadata', `genre=${metadata.genre || 'Electronic'}`)
                .outputOptions('-metadata', `comment=${metadata.comment || 'Processed with Hexbloop'}`);

            if (withArtwork) {
                command = command
                    .input(artworkPath)
                    .outputOptions('-map', '0:a')
                    .outputOptions('-map', '1:v')
                    .outputOptions('-c:a', 'copy')
                    .outputOptions('-c:v', 'copy')
                    .outputOptions('-metadata:s:v', 'title=Album cover')
                    .outputOptions('-metadata:s:v', 'comment=Cover (front)')
                    .outputOptions('-disposition:v:0', 'attached_pic');
                console.log(`🎨 Embedding artwork via FFmpeg (${ext.toUpperCase()})`);
            } else {
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
                .on('error', reject)
                .save(outputPath);
        });

        console.log(`🎵 Embedding metadata via FFmpeg: ${metadata.artist} - ${metadata.title}`);

        try {
            return await run(wantArtwork && artworkSupported);
        } catch (error) {
            if (wantArtwork && artworkSupported) {
                console.log(`⚠️  Artwork embed failed (${error.message}), retrying tags-only`);
                return await run(false);
            }
            console.error('❌ FFmpeg metadata embedding failed:', error.message);
            throw error;
        }
    }
}

module.exports = MetadataEmbedder;
