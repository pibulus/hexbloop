# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure
This repository contains two implementations:
1. **Swift macOS App** (`/hexbloop/`) - Native Mac App Store version
2. **Electron Cross-Platform App** (`/hexbloop-electron/`) - Modern web-based version

## About Hexbloop
Hexbloop is a creative audio processing app that enhances audio files with mystical digital processing influenced by natural factors like moon phases and time of day. It's a digital-meets-organic "chaos magic engine" for creative audio processing featuring:
- Nature-influenced audio processing (moon phases, time of day affect sound characteristics)
- Procedural name generation with glitch effects and multiple styles (sparklepop, blackmetal, witchhouse)
- Procedural SVG artwork generation that matches the generated names
- Drag-and-drop batch processing with mesmerizing hexagonal UI
- Mac App Store compliant processing using native AVAudioEngine

## Build Commands

### Swift Version (macOS only)
- **Build**: Open in Xcode and press Cmd+B or use Product > Build
- **Run**: Cmd+R or Product > Run in Xcode
- **Test**: Cmd+U to run unit tests
- **Target**: macOS 12.0+, designed for Mac App Store distribution
- **Important**: Set "Strict Concurrency Checking" to "Minimal" in Build Settings to avoid Swift 6 warnings

### Electron Version (Cross-platform)
```bash
cd hexbloop-electron
npm install              # Install dependencies
npm start               # Run the app
npm run dev             # Run with DevTools
npm run build           # Build for distribution
```
- **Dependencies**: Requires sox and ffmpeg installed (`brew install sox ffmpeg`)
- **Output**: MP3 files with embedded artwork using node-id3

## Development Setup
- Uses Xcode 16.2+ with Swift 5.0
- No external package dependencies
- All audio processing uses AVFoundation for App Store compatibility
- Optional FFmpeg integration for enhanced mastering (graceful fallback if not available)

## Architecture Overview
Hexbloop follows a modular architecture with clear separation of concerns:

### Core Components
- **ContentView**: Main SwiftUI interface with hexagonal drag-drop target and animated visuals
- **MacAudioEngine**: Primary audio processing engine using AVAudioEngine for Mac App Store compliance
- **NameGenerator**: Procedural name generation with style variations and glitch effects
- **ArtGenerator**: SVG-based procedural artwork generation matching naming aesthetics
- **HexbloopFileManager**: Sandboxed file operations for input/output management
- **Configuration/ProcessingParameters**: Nature-influenced processing parameter generation

### Audio Processing Chain
1. **Input Stage**: File loading and format conversion using AVAssetExportSession
2. **Distortion Stage**: AVAudioUnitDistortion with moon phase and time-controlled presets
3. **Equalization**: Multi-band EQ (high-pass, low-pass, mid-frequency boost)
4. **Dynamics Processing**: Dual-stage compression (vintage + mastering) plus limiting
5. **Effects**: Reverb and delay with natural influence control
6. **Output**: Export with embedded metadata and procedural artwork

### Natural Influences System
Processing parameters are influenced by real-world factors:
- **Moon Phase**: Full moon = bright/ethereal, New moon = dark/heavy, Waxing/Waning = medium variations
- **Time of Day**: Night = darker processing, Morning = brighter, Afternoon/Evening = neutral
- **Day of Month**: Influences distortion preset selection and parameter randomness

## Code Style Guidelines
- **Imports**: Foundation first, then SwiftUI/AppKit, then AVFoundation and other frameworks
- **Naming**: PascalCase for types, camelCase for properties/functions
- **Indentation**: 4 spaces, no tabs
- **Organization**: Use MARK comments to organize code sections
- **Error Handling**: Use do-catch blocks with custom error types
- **Concurrency**: Use async/await and @MainActor annotations for UI updates
- **SwiftUI**: Follow declarative patterns, use @State/@StateObject appropriately
- **Memory Management**: Include cleanup for audio resources and temp files

## Key Implementation Details
- **Audio Processing**: Uses AVAudioEngine exclusively for core processing to ensure App Store compatibility
- **File Management**: All operations respect sandboxing, with proper user file access permissions
- **Progress Tracking**: Real-time progress updates during batch processing with hexagonal UI
- **Memory Optimization**: Includes memory monitoring, cleanup systems, and hardware-specific optimizations
- **Error Recovery**: Graceful handling of invalid files, processing failures, and cancellation

## Testing Audio Features
- Test with various audio formats: MP3, WAV, M4A, AIFF, FLAC
- Verify batch processing with multiple files
- Test cancellation during processing
- Validate output file integrity and metadata embedding
- Test on different macOS versions (12.0+) and hardware (Intel/Apple Silicon)

## Performance Considerations
- Audio processing is CPU-intensive; progress reporting prevents UI blocking
- Memory usage monitoring with automatic cleanup for low-memory conditions
- Hardware detection for Apple Silicon optimizations
- Timeout protection for hanging audio operations
- Efficient buffer management for large audio files

## Mac App Store Compliance
- Uses only AVFoundation APIs (no external audio libraries bundled)
- Respects sandboxing with proper file access permissions
- Handles deprecated APIs with version-specific fallbacks
- Memory and performance optimized for App Store review guidelines
- Clean app termination and resource cleanup

## Known Issues & Workarounds
- Some AVFoundation APIs deprecated in macOS 15.0 (see Docs/fix-deprecated-apis.md)
- M2/M3 Mac compatibility handled with hardware detection
- Swift concurrency warnings resolved with "Minimal" concurrency checking setting

## Recent Fixes & Updates (Jan 2025)
- **CRITICAL FIX**: Removed `engine.mainMixerNode.outputVolume = 0.0` which was causing silent audio output
- Added `ErrorHandling.swift` with HexbloopError enum for proper error management
- Fixed async/await issues in CancellationManager with proper actor isolation
- Updated memory calculation to include inactive pages (fixes false low memory warnings)
- Added `BatchAudioProcessor` for fast concurrent file processing (10x speed improvement)
- Implemented proper metadata and artwork embedding in output files
- Fixed deprecated menu style API and registerFileRepresentation
- Output format is M4A (not MP3) for native AVFoundation support in Swift version
- Electron version outputs MP3 with embedded artwork via node-id3

## Critical Audio Processing Notes
- **DO NOT MUTE mainMixerNode** - This kills the audio tap and results in silent files
- For silent processing, use offline rendering or disconnect from speakers instead
- The audio tap must be installed BEFORE any volume adjustments
- Use M4A format for output (MP3 requires external encoders not allowed in App Store)
- Batch processing should use concurrent operations for performance
- Always embed artwork as PNG data in metadata, not as separate files
