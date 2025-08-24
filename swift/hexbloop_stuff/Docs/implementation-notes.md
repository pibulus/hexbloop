# Hexbloop Implementation Notes

This document outlines the internal implementation details of Hexbloop, intended for developers working on the codebase.

## Core Components

### 1. NameGenerator

The name generator uses procedural generation techniques based on the original bash script:

- Multiple word banks categorized by theme and style
- Style-specific symbol sets (witch house, sparklepop, etc.)
- Special effects including zalgo text, corruption, and glitch effects
- Natural influences (time of day, moon phase)

The implementation allows runtime configuration of:
- Style mode (useSparklepop, useBlackmetal)
- Effect intensity (glitchIntensity, corruptionIntensity)
- Symbol usage (useWitchHouse)

### 2. Audio Processing Pipeline

Hexbloop's audio processing follows a multi-stage pipeline:

1. **Initial Format Conversion**
   - Uses AVAssetExportSession to normalize input format
   - Ensures consistent processing regardless of source format

2. **Effect Chain Processing**
   - Uses AVAudioEngine for core DSP operations
   - Processing nodes include:
     - EQ (high-pass, low-pass, mid boost, presence)
     - Distortion (configurable amount and type)
     - Reverb (subtle room character)
     - Compression (multi-band, multi-stage)
     - Limiting (final output protection)

3. **Optional Final Mastering**
   - Uses FFmpeg if available for final touch (App Store compatible by making optional)
   - Replicates original bash script mastering chain exactly
   - Falls back gracefully to AVFoundation mastering if FFmpeg not installed

4. **Metadata & Artwork Embedding**
   - Adds generated metadata and embedded artwork
   - Preserves compatibility with players and DAWs

### 3. Artwork Generation

The ArtGenerator creates procedural vector graphics based on the generated name:

- SVG-based for quality and flexibility
- Style-matching visuals (color schemes, symbols)
- Converts to PNG for embedding in audio files
- Uses randomized elements for unique output per file

### 4. File Management

The HexbloopFileManager handles all file operations:

- Creates organized output structure
- Ensures unique filenames
- Manages temporary files for processing
- Handles Finder integration for output display

## Technical Approach

### AVFoundation Usage

The app primarily uses AVFoundation for audio manipulation to maintain Mac App Store compatibility:

1. **AVAudioEngine**: For real-time DSP processing chain
2. **AVAssetExportSession**: For format conversion and metadata
3. **AVAudioSession**: Intentionally avoided (iOS-only API)

### FFmpeg Integration

FFmpeg is used as an optional enhancement with graceful fallbacks:

1. **Path Detection**: Searches common FFmpeg installation locations
2. **Error Handling**: Properly handles missing dependency
3. **Filter Settings**: Replicates the original script's processing chain
4. **Compatibility**: All App Store requirements addressed

### Concurrency Model

The app uses Swift's modern concurrency features:

1. **Async/Await**: For clean processing flow
2. **TaskGroups**: For parallel operations
3. **Actors**: For thread-safe state management
4. **Progress Reporting**: Real-time UI feedback during processing

### Memory Management

Audio processing can be memory-intensive, so the app includes:

1. **Buffer Management**: Efficient PCM buffer handling
2. **Resource Cleanup**: Proper cleanup of audio resources
3. **Processing Timeouts**: Protection against hanging operations
4. **Optimized Chains**: Efficient node configuration to reduce overhead

## Optimizations

1. **Batch Processing**
   - Collects and validates all files before beginning processing
   - Applies the same processing settings to all files in a batch
   - Opens output folder only once when batch is complete

2. **Performance**
   - Optimized buffer sizes for different hardware capabilities
   - Efficient asset loading with timeout protection
   - Proper resource cleanup during and after processing

3. **Error Handling**
   - Graceful recovery from common audio processing errors
   - Clear user feedback on processing status
   - Protection against invalid input files

## Mac App Store Considerations

For successful App Store submission:

1. The core app works perfectly without FFmpeg (100% AVFoundation)
2. FFmpeg is an optional enhancement that works if the user has it installed
3. No bundled external executables or libraries
4. All file operations respect sandboxing requirements
5. Proper error handling and memory management

## Future Improvements

1. **User Preferences**
   - Allow custom artist name configuration
   - Provide output format selection (MP3 vs. M4A)
   - Add processing style presets (vintage, modern, etc.)

2. **Enhanced Mastering**
   - Provide selectable mastering styles
   - Allow preview before processing
   - Add genre-specific processing options

3. **Artwork Options**
   - Additional artwork styles
   - Custom artwork import option
   - Higher resolution output for specific uses