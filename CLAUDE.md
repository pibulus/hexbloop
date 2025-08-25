# 🔮 HEXBLOOP - Project Guide

## 📁 Project Structure

Hexbloop has TWO implementations:
1. **Electron Version** (Primary) - Root directory, cross-platform
2. **Swift Version** - `/swift/Hexbloop/` - Native macOS app

## 🚀 Quick Start

### Electron Version (Primary)
```bash
# Install and run
npm install
npm start

# Key files:
main.js                      # Electron main process
src/audio-processor.js       # Sox/FFmpeg pipeline
src/lunar-processor.js       # Moon phase calculations
src/name-generator.js        # Mystical name generation
src/renderer/app.js          # UI and hexagon animations
```

### Swift Version
```bash
# Open in Xcode
open swift/Hexbloop/Hexbloop.xcodeproj

# Key files:
swift/Hexbloop/ContentView.swift      # SwiftUI interface
swift/Hexbloop/MacAudioEngine.swift   # AVAudioEngine processing
swift/Hexbloop/ArtGenerator.swift     # Enhanced art with multiple styles
```

## 🎯 Current Status

- **Electron**: Full-featured with preferences, batch processing, mystical UI
- **Swift**: Clean native implementation with enhanced art generation (7 styles)
- **Progress**: 75% complete overall
- **Next**: Unify best features from both versions

## 🛠 Tech Stack

### Electron Version
- **Framework**: Electron + Vanilla JS
- **Audio**: Sox + FFmpeg pipeline
- **Output**: MP3 with embedded artwork
- **Features**: Batch processing, preferences window, menu system

### Swift Version  
- **Framework**: SwiftUI + AVAudioEngine
- **Audio**: Native AVFoundation (App Store compliant)
- **Output**: M4A with embedded artwork
- **Features**: Enhanced art generation with multiple styles

## 🌙 Core Features

Both versions implement:
- Moon phase influenced audio processing
- Mystical name generation
- Procedural artwork creation
- Hexagonal breathing interface
- Natural time-based influences

## 📊 Key Differences

| Feature | Electron | Swift |
|---------|----------|-------|
| Platform | Cross-platform | macOS only |
| Audio Engine | Sox/FFmpeg | AVAudioEngine |
| Output Format | MP3 | M4A |
| Art Styles | Basic | 7 styles (Cyberpunk, Vaporwave, etc.) |
| Batch Processing | Yes | No |
| Preferences UI | Yes | No |
| App Store Ready | No | Yes |

## 🎨 Art Generation Styles (Swift Version)

The Swift version includes enhanced art generation with:
- Electronic
- Dark Synthwave  
- Ambient Space
- Lo-Fi
- Industrial
- Cyberpunk
- Vaporwave
- Glitch

## 🔧 Development Notes

- Electron version is primary for features and cross-platform
- Swift version is for Mac App Store distribution
- Both share core mystical processing philosophy
- Moon phase calculations are identical
- Name generation algorithms match

## 💡 Philosophy

"Maximum magic, minimal engineering" - Every feature enhances the mystical experience through:
- Biological synchronization (70 BPM animations)
- Geometric communication (6-vertex phrase system)
- Real astronomical lunar data
- Ceremonial interactions with deliberate delays

---
*Transform your audio with the power of lunar influences* 🌙✨