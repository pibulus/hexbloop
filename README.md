# 🔮 HEXBLOOP - CHAOS MAGIC AUDIO ENGINE

**A mystical audio processing application that transforms your audio files using lunar influences and natural cycles.**

![Hexbloop Interface](https://img.shields.io/badge/Interface-Hexagonal%20Mystical-purple) ![Moon Phase](https://img.shields.io/badge/Moon%20Phase-Influenced-blue) ![Audio Processing](https://img.shields.io/badge/Audio-Sox%20%2B%20FFmpeg-green)

## ✨ What is Hexbloop?

Hexbloop is a **chaos magic audio engine** that enhances your audio files with mystical digital processing influenced by natural forces. Originally built in Swift for macOS, this Electron version breaks free from Apple's sandboxing restrictions while preserving all the mystical functionality.

### 🌙 The Magic Behind the Processing

- **Moon Phase Influences**: Audio processing parameters change based on the current lunar cycle
- **Time-Based Variations**: Different processing styles for night, morning, and evening
- **Mystical Name Generation**: Each processed file gets a unique name with style variations
- **Hexagonal Interface**: Beautiful breathing hexagons with soft, mystical colors

## 🚀 Features

### 🎵 Audio Processing
- **High-quality audio pipeline** using sox → ffmpeg processing chain
- **Lunar-influenced parameters** that change with moon phases and time
- **Batch processing** with drag-and-drop support
- **Multiple format support**: MP3, WAV, M4A, AIFF, FLAC, OGG
- **MP3 output** with embedded artwork and metadata

### 🌙 Mystical Influences
- **New Moon**: Dark, heavy processing (high overdrive, deep bass)
- **Full Moon**: Ethereal, bright processing (low overdrive, enhanced treble)
- **Waxing/Waning**: Graduated processing between extremes
- **Time of Day**: Night enhances darkness, morning brightens, evening mellows

### 🎭 Name Generation Styles
- **Sparklepop**: GLITTERSTAR8400, PRISMPULSE2165, RAINBOWDREAM3421
- **Blackmetal**: BONEALTAR5166, GRAVEVOID1387, DEMONTHRONE5210
- **Witchhouse**: MYSTICPROTOCOL6765, SPIRITMACHINE6429, ASTRALNETWORK1977
- **Mixed**: Combination of all styles based on lunar and time influences

### 🎨 Visual Design
- **Hexagonal interface** with CSS clip-path polygons
- **Apple system colors** for soft, mystical appearance
- **Vignette and grain effects** for vintage aesthetic
- **Real-time progress tracking** with mystical feedback
- **Smooth animations** with SwiftUI-like easing curves

## 🛠️ Installation

### Prerequisites
- **Node.js** (v16 or higher)
- **sox** (for audio processing)
- **ffmpeg** (for audio mastering)

### macOS Setup
```bash
# Install dependencies via Homebrew
brew install sox ffmpeg

# Clone and setup project
git clone <repository-url>
cd hexbloop-electron
npm install
```

### Dependencies Check
The app will automatically check for sox and ffmpeg on startup and provide fallback processing if needed.

## 🎮 Usage

### Starting the Application
```bash
npm start
```

### Processing Audio Files

1. **Drag & Drop**: Simply drag audio files onto the hexagonal interface
2. **File Selector**: Click the hexagon to open a file selection dialog
3. **Batch Processing**: Drop multiple files for batch processing with progress tracking
4. **Output**: Processed files are saved to `~/Documents/HexbloopOutput/`

### Processing Feedback
- **Spinning Pentagram**: Indicates active processing
- **Breathing Glow**: Mystical processing energy
- **Progress Text**: Shows current file being processed
- **Folder Opening**: Automatically opens output folder when complete

## 🔧 Technical Architecture

### Core Components
- **main.js**: Electron main process with IPC orchestration
- **app.js**: Renderer process with mystical UI logic
- **preload.js**: Secure IPC bridge
- **src/audio-processor.js**: Lunar-influenced audio processing pipeline
- **src/lunar-processor.js**: Moon phase and time calculations
- **src/name-generator.js**: Style-based mystical name generation

### Audio Processing Pipeline
1. **Input Validation**: File existence and format checking
2. **Lunar Calculation**: Current moon phase and time influence
3. **Sox Processing**: Initial audio transformation with lunar parameters
4. **FFmpeg Mastering**: Final mastering with EQ and compression
5. **Output Generation**: MP3 file creation with mystical naming and embedded artwork

### Security Configuration
- **webSecurity: false**: Required for file access (documented limitation)
- **contextIsolation: true**: Maintains process separation
- **nodeIntegration: false**: Prevents direct Node.js access in renderer

## 🌙 Lunar Processing Details

### Moon Phase Calculations
The app calculates the current moon phase using astronomical algorithms:
- **Reference Date**: January 6, 2000 (known new moon)
- **Lunar Cycle**: 29.53 days average
- **Phase Precision**: Calculated to determine exact influence

### Processing Parameters by Phase
- **New Moon (Dark)**: Overdrive 6.0, Bass +4.0, Treble -0.5
- **Waxing Crescent (Building)**: Overdrive 3.5, Bass +2.0, Treble +0.5
- **First Quarter (Balanced)**: Overdrive 4.0, Bass +2.5, Treble +1.0
- **Waxing Gibbous (Growing)**: Overdrive 3.0, Bass +1.5, Treble +1.5
- **Full Moon (Ethereal)**: Overdrive 2.0, Bass +1.0, Treble +2.5
- **Waning Phases**: Gradual return to darkness

## 🎨 Visual Effects

### Hexagonal Design
- **Outer Hexagon**: Purple to pink gradient with scaling animation
- **Middle Hexagon**: Reversed gradient with blue glow
- **Inner Hexagon**: Yellow to orange gradient with fastest animation
- **Central Pentagram**: White with purple text-shadow, spins during processing

### Animation Easing
- **Cubic Bezier**: `cubic-bezier(0.4, 0.0, 0.6, 1.0)` for SwiftUI-like motion
- **Staggered Timing**: Each hexagon animates with different delays
- **GPU Acceleration**: All animations use `transform` for optimal performance

### Grain and Vignette
- **Multi-layer Grain**: Fine texture with subtle color noise
- **Radial Vignette**: Darkens edges for mystical focus
- **Blend Modes**: Overlay mode for authentic film grain effect

## 🚀 Development

### Project Structure
```
hexbloop-electron/
├── README.md
├── package.json
├── .gitignore
├── main.js              # Main Electron process
├── preload.js           # Secure IPC bridge
├── app.js               # Renderer UI logic
├── index.html           # Minimal HTML structure
├── style.css            # Complete mystical styling
└── src/
    ├── audio-processor.js    # Audio processing pipeline
    ├── lunar-processor.js    # Moon phase calculations
    └── name-generator.js     # Mystical name generation
```

### Building for Distribution
```bash
npm run build
```

### Development Mode
```bash
npm run dev
```

## 🎯 Migration from Swift

This Electron version provides identical functionality to the original Swift macOS app while offering several advantages:

### Benefits
- **No Sandboxing**: Full file system access without Apple restrictions
- **Standalone Distribution**: No Mac App Store requirements
- **Cross-Platform Potential**: Can be adapted for Windows/Linux
- **Enhanced Features**: Additional lunar influences and name styles
- **Modern Web Technologies**: Easier to maintain and extend

### Feature Parity
- ✅ Audio Processing: Complete sox/ffmpeg pipeline
- ✅ Moon Phase Influence: Full lunar cycle calculations
- ✅ Mystical Names: Enhanced with style variations
- ✅ Hexagonal UI: Pixel-perfect recreation with CSS
- ✅ Batch Processing: Drag-drop with progress tracking
- ✅ Visual Effects: Grain, vignette, and animations
- ✅ File Management: Improved output organization

## 🌟 Examples

### Sample Generated Names
```
🌟 Sparklepop: GLITTERSTAR8400, RAINBOWBEAM7329, CRYSTALPULSE2165
🖤 Blackmetal: BONEALTAR5166, DEATHCULT6939, GRAVEVOID1387
🔮 Witchhouse: MYSTICPROTOCOL6765, ASTRALNETWORK1977, SPIRITMACHINE6429
```

### Lunar Influence Examples
```
🌑 New Moon + Deep Night: HELLRITUAL4605 (Dark, heavy processing)
🌕 Full Moon + Morning: GLITTERBEAM3421 (Ethereal, bright processing)
🌓 First Quarter + Evening: MYSTICFLUX7892 (Balanced, mystical processing)
```

## 🛡️ Security Notes

- **File Access**: `webSecurity: false` is required for drag-drop functionality
- **Process Isolation**: Renderer process cannot directly access Node.js APIs
- **IPC Validation**: All inter-process communication is validated
- **Dependency Security**: All npm packages are from trusted sources

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Credits

- **Original Concept**: Hexbloop Swift macOS application
- **Electron Implementation**: Migration preserving all mystical functionality
- **Audio Processing**: Based on "bloop it" Automator script parameters
- **Lunar Calculations**: Astronomical algorithms for moon phase precision
- **Visual Design**: Inspired by SwiftUI's natural motion and Apple's design system

## 🔮 Philosophy

> "In the intersection of technology and mysticism, we find the tools to transform not just audio, but experience itself. Each file processed carries the signature of cosmic forces, each name generated reflects the eternal dance of time and space."

---

**Transform your audio with the power of lunar influences.** 🌙✨

---

*Generated with love for the mystical arts of audio processing.*