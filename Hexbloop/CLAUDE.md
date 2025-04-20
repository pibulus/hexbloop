# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About Hexbloop
Hexbloop is a macOS application for batch processing audio files, adding unique names, metadata, and artwork. Key features:
- Audio processing with style-aware mastering chains
- Procedural name generation with multiple styles (cyber, witchhouse, blackmetal, etc.)
- Cover art generation that matches the song name aesthetics
- Batch processing with proper metadata embedding

## Build Commands
- Build app: Open in Xcode and press Cmd+B or use Product > Build
- Run app: Cmd+R or Product > Run in Xcode
- Compatible with macOS 12.0+, targeting Mac App Store distribution

## Code Style
- **Imports**: Foundation first, then SwiftUI/AppKit, followed by AVFoundation and other frameworks
- **Naming**: Classes/Structs/Protocols: PascalCase; Variables/Functions: camelCase
- **Indentation**: 4 spaces
- **Documentation**: Use MARK comments to organize code sections
- **Error Handling**: Use custom error enums and do-catch blocks
- **Concurrency**: Use async/await and proper actor annotations
- **Types**: Use Swift type inference where appropriate, explicit types when needed
- **SwiftUI**: Follow declarative programming patterns for views
- **Organization**: Group related properties and methods together
- **Testing**: Follow XCTest patterns when creating unit tests

## Architecture
- **ContentView**: Main UI and drop target for audio files
- **AudioProcessor/MacAudioEngine**: Audio processing system using AVFoundation
- **NameGenerator**: Procedural name generation with multiple style options
- **ArtGenerator**: Cover art generation using SVG/PNG
- **HexbloopFileManager**: File system operations for input/output management
- **AudioProcessingOptimizer**: Performance enhancements for audio processing

## Key Components
- **Name Generation**: Based on original bash script with extensive word banks and style options
- **Audio Processing**: Multi-stage mastering using AVFoundation with EQ, compression, reverb
- **Advanced Mastering**: Optional FFmpeg-based mastering similar to the original bash script
- **Artwork**: Procedural SVG artwork with styles matching the naming convention
- **Batch Processing**: Support for multiple file drag-and-drop operations

## Requirements & Constraints
- Must work on macOS 12+ with App Store compatibility
- Should handle various audio formats (mp3, wav, m4a, aiff)
- Should use AVFoundation for audio processing when possible
- Can use FFmpeg as an optional enhancement if available

## Known Issues
- Some AVFoundation APIs are deprecated in macOS 15.0
- See Docs/fix-deprecated-apis.md for planned fixes

## Workflow - Use Taskmaster
Howto: Docs/taskmaster-guide.md
When implementing a feature, use the following TaskMaster workflow:

parse-prd: Generate initial tasks from the feature spec
analyze-complexity: Identify complex tasks that need breakdown
expand: Break down complex tasks into smaller subtasks
next: Determine the next task to work on
set-status: Update task status as you progress
validate-dependencies: Ensure proper task dependencies before marking complete
