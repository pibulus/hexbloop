# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About Hexbloop
Hexbloop is a creative audio processing app that enhances audio files with mystical digital processing influenced by natural factors like moon phases and time of day. It's a digital-meets-organic "chaos magic engine" for creative audio processing featuring:
- Nature-influenced audio processing (moon phases, time of day affect sound characteristics)
- Procedural name generation with glitch effects and multiple styles (sparklepop, blackmetal, witchhouse)
- Procedural SVG artwork generation that matches the generated names
- Drag-and-drop batch processing with mesmerizing hexagonal UI
- Mac App Store compliant processing using native AVAudioEngine

## Build Commands
- **Build**: Open in Xcode and press Cmd+B or use Product > Build
- **Run**: Cmd+R or Product > Run in Xcode
- **Test**: Cmd+U to run unit tests
- **Target**: macOS 12.0+, designed for Mac App Store distribution
- **Important**: Set "Strict Concurrency Checking" to "Minimal" in Build Settings to avoid Swift 6 warnings

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
