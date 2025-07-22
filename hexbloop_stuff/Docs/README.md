# Hexbloop

Hexbloop is a macOS application that transforms audio files into stylized, mastered tracks with procedurally-generated names and artwork. Perfect for musicians, producers, and sound designers with libraries of unnamed demo tracks.

![Hexbloop Logo](../Assets.xcassets/AppIcon.appiconset/icon_256x256.png)

## Features

- 🎛️ **Audio Processing**: Professional mastering chain with EQ, compression, and character enhancement
- 🏷️ **Procedural Naming**: Unique, stylized names with configurable aesthetics (cyber, blackmetal, sparklepop)
- 🎨 **Artwork Generation**: Custom cover art created for each processed track
- 📝 **Metadata Embedding**: Complete metadata with generated name, artwork, and timestamps
- 📦 **Batch Processing**: Process multiple files at once with simple drag-and-drop

## Installation

### Requirements
- macOS 12.0 or later
- 4GB RAM minimum (8GB recommended)
- 100MB free disk space

### Download
Hexbloop is currently in development and will be available soon on:
- Mac App Store (pending)
- Direct download from [our website](#) (coming soon)

## Quick Start

1. Launch Hexbloop
2. Drag and drop audio file(s) onto the app's hexagon
3. Choose style settings (optional)
4. Wait for processing to complete
5. Find your processed files in the automatically opened Finder window

## Documentation

For more detailed information, check the following documentation:

- [User Guide](./hexbloop-guide.md): Complete usage instructions
- [Implementation Notes](./implementation-notes.md): Developer documentation
- [Compatibility Notes](./fix-deprecated-apis.md): Technical information on platform compatibility

## Development

Hexbloop is built with:
- Swift 5.9+
- SwiftUI
- AVFoundation audio framework
- Optional FFmpeg integration

### Building from Source

1. Clone the repository
2. Open the project in Xcode 14.0 or newer
3. Build using standard Xcode build commands (Cmd+B)

## Credits

Hexbloop is inspired by the original "hex_bloop" bash script, enhanced with a proper macOS application interface and expanded capabilities.

## License

(C) 2023-2025 Hexbloop Team - All Rights Reserved