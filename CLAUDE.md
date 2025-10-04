# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🔮 Project Overview

Hexbloop is a mystical audio processing application with THREE implementations:
1. **Electron App** (Primary) - Cross-platform desktop app in root directory
2. **Swift App** - Native macOS app in `/swift/Hexbloop/`
3. **Marketing Website** - Deno Fresh site in `/hexbloop-site/` (separate repo)

## 🚀 Development Commands

### Electron Version (Primary Desktop App)
```bash
# Install dependencies (requires sox and ffmpeg installed via Homebrew)
npm install

# Development
npm start              # Run the app
npm run dev           # Run with debugging on port 5858

# Building
npm run build         # Build for current platform
npm run dist          # Build macOS distribution
npm run dist:all      # Build for all platforms

# Testing
npm test              # Run basic tests

# Maintenance
npm run clean         # Remove node_modules and package-lock
npm run clean:install # Clean and reinstall dependencies
```

### Swift Version (macOS Native)
```bash
# Open in Xcode
open swift/Hexbloop/Hexbloop.xcodeproj

# Build from command line
cd swift/Hexbloop
xcodebuild -scheme Hexbloop build
```

### Marketing Website (Deno Fresh)
```bash
# Navigate to website directory (separate repo)
cd ../hexbloop-site

# Development
deno task start       # Start dev server on port 8000
deno task check      # Format, lint, and type check
deno task build      # Production build
deno task preview    # Preview production build

# The site runs on port 8000 by default
# Multiple instances may be running - check background processes
```

## 🏗 Architecture Overview

### Audio Processing Pipeline
The core mystical processing flow shared between implementations:

1. **Lunar Calculation** (`src/lunar-processor.js`)
   - Calculates current moon phase using astronomical algorithms
   - Returns phase name and influence percentage
   - Reference date: January 6, 2000 (known new moon)

2. **Audio Processing** (`src/audio-processor.js`)
   - Uses sox for initial transformation with lunar parameters
   - Pipes to ffmpeg for final mastering
   - Applies overdrive, bass, treble based on moon phase
   - Time of day modifies parameters (night = darker, morning = brighter)

3. **Name Generation** (`src/name-generator.js`)
   - Three style pools: sparklepop, blackmetal, witchhouse
   - Combines prefixes and suffixes with random numbers
   - Style selection influenced by moon phase and time

4. **Artwork Generation** (`src/artwork-generator-vibrant-refined.js`)
   - Creates procedural artwork using Canvas API
   - Audio-responsive visual elements
   - Multiple generators available (original, vibrant, refined)

5. **Metadata Embedding** (`src/metadata-embedder.js`)
   - Embeds artwork and metadata into MP3 files
   - Uses node-id3 for tagging

### IPC Communication Pattern
The Electron app uses a secure IPC bridge:
- **main.js**: Orchestrates file processing, manages windows
- **preload.js**: Exposes limited API to renderer
- **renderer/app.js**: Handles UI and user interactions
- All file operations happen in main process for security

### Visual Design System
- **Hexagonal Interface**: Three nested hexagons with breathing animations
- **Color Palette**: Soft pastels with mystical gradients
- **Animations**: 3-8 second breathing cycles at ~70 BPM
- **Effects**: VHS scanlines, film grain, vintage vignette

## 🎨 Key Implementation Details

### Moon Phase Processing Parameters
```javascript
// New Moon (Dark): High overdrive, deep bass
{ overdrive: 6.0, bass: 4.0, treble: -0.5 }

// Full Moon (Ethereal): Low overdrive, bright treble
{ overdrive: 2.0, bass: 1.0, treble: 2.5 }

// Phases interpolate between extremes
```

### Hexagon Animation Timing
- **Outer**: 3s pulse, 0s delay
- **Middle**: 3.2s pulse, 0.5s delay
- **Inner**: 3.5s pulse, 1s delay
- **Pentagram**: Spins during processing

### Output File Structure
```
~/Documents/HexbloopOutput/
├── GLITTERSTAR8400.mp3      # Sparklepop style
├── BONEALTAR5166.mp3        # Blackmetal style
└── MYSTICPROTOCOL6765.mp3   # Witchhouse style
```

## 🔧 Dependencies & Requirements

### System Requirements
- **macOS**: sox and ffmpeg (install via `brew install sox ffmpeg`)
- **Node.js**: v16+ for Electron app
- **Deno**: v1.37+ for website

### Critical NPM Dependencies
- **electron**: v37.3.1 - Desktop app framework
- **fluent-ffmpeg**: Audio processing pipeline
- **node-id3**: MP3 metadata embedding
- **canvas**: Procedural artwork generation

### Website Dependencies (Deno)
- **Fresh**: v1.7.3 - Web framework
- **Tailwind**: v4.1.13 - Styling (via plugin)
- **Preact**: v10.22.0 - UI components

## 🌙 Processing Philosophy

The app follows "Maximum magic, minimal engineering":
- Every interaction has deliberate mystical delay
- Animations sync to biological rhythms (70 BPM)
- Processing influenced by real astronomical data
- Interface communicates through geometry not text

## 📍 Important Files

### Core Processing
- `main.js`: Electron main process, file handling
- `src/audio-processor.js`: Sox/FFmpeg pipeline
- `src/lunar-processor.js`: Moon phase calculations
- `src/name-generator.js`: Mystical naming system
- `src/artwork-generator-vibrant-refined.js`: Latest art generator

### UI & Interaction
- `src/renderer/app.js`: Main UI logic
- `src/renderer/style.css`: Complete visual design
- `src/renderer/index.html`: Minimal markup structure

### Swift Version (for reference)
- `swift/Hexbloop/MacAudioEngine.swift`: Native audio processing
- `swift/Hexbloop/ArtGenerator.swift`: 7 art styles implementation

### Website
- `hexbloop-site/routes/index.tsx`: Main landing page
- `hexbloop-site/islands/HeroSection.tsx`: Hero with hexagon
- `hexbloop-site/islands/WhatItDoes.tsx`: Feature showcase
- `hexbloop-site/islands/ProcessFlow.tsx`: Process visualization

## 🚨 Known Issues & Considerations

1. **Web Security**: Electron runs with `webSecurity: false` for file access
2. **Multiple Website Instances**: Check for running Deno processes on port 8000
3. **Artwork Generator**: Two versions exist - use `vibrant-refined` for best results
4. **Swift Version**: Lacks batch processing and preferences UI
5. **Performance**: Hexagon animations may lag with multiple files processing

## 🎯 Current Development Focus

- Unifying best features from Electron and Swift versions
- Improving audio analysis for dynamic artwork generation
- Adding more mystical name generation styles
- Optimizing website performance and animations