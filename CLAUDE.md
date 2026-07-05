# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🔮 Project Overview

Hexbloop is a mystical audio processing application:
1. **Electron App** (this repo) - Cross-platform desktop app in root directory
2. **Marketing Website** - Deno Fresh site in `../hexbloop-site/` (separate repo)

(The old native Swift implementation has been archived and removed from this repo.)

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
npm test              # Runs all four suites: audio pipeline, naming, artwork, release hardening

# Maintenance
npm run clean         # Remove node_modules and package-lock
npm run clean:install # Clean and reinstall dependencies
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
The core mystical processing flow:

1. **Lunar Calculation** (`src/lunar-processor.js`)
   - Calculates current moon phase using astronomical algorithms
   - Returns phase name and influence percentage
   - Reference date: January 6, 2000 (known new moon)

2. **Audio Processing** (`src/audio-processor.js`)
   - Sox tape chain (headroom → overdrive → EQ → echo → compand → normalize)
     with lunar parameters; FFmpeg emulation fallback if sox is missing
   - FFmpeg mastering: tape EQ → 2:1 glue compression → loudnorm → limiter
   - Time of day modifies parameters (night = darker, morning = brighter)
   - Output formats: mp3 / wav / flac (resolveOutputFormat guards the rest)

3. **Name Generation** (`src/name-generator.js`)
   - Chaotic engine: large word banks, compound/lunar/time/styled patterns
   - Mutations (power numbers, version markers, symbols), filename-safe sanitize
   - Batch schemes + session folders via `src/batch/batch-naming-engine.js`

4. **Artwork Generation** (`src/artwork-generator-vibrant-refined.js`)
   - Creates procedural artwork using Canvas API (the single, current generator)
   - Audio-responsive (energy/tempo via `src/audio-analyzer.js`) + moon phase
   - 8 styles: neon-plasma, cosmic-flow, vapor-dream, cyber-matrix,
     sunset-liquid, electric-storm, crystal-prism, ocean-aurora

5. **Metadata Embedding** (`src/metadata-embedder.js`)
   - MP3 via node-id3; WAV/FLAC via FFmpeg (artwork failure retries tags-only)

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

### Moon Phase Processing Parameters (tape-cassette calibrated)
```javascript
// New Moon (Dark): thick tape saturation, deep bass
{ overdrive: 2.8, bass: 2.2, treble: -0.8 }

// Full Moon (Ethereal): light touch, bright treble
{ overdrive: 1.2, bass: 0.5, treble: 1.5 }

// Phases interpolate between extremes; time of day multiplies the base
```

### Hexagon Animation Timing
- **Outer**: 3s pulse, 0s delay
- **Middle**: 3.2s pulse, 0.5s delay
- **Inner**: 3.5s pulse, 1s delay
- **Pentagram**: Spins during processing

### Output File Structure
```
~/Documents/HexbloopOutput/
├── Shadow_Circuit_entropy.mp3       # Compound pattern
├── waning_gibbous_monolith.mp3      # Lunar pattern
└── Twilight_vortex_v2.mp3           # Time pattern + mutation
```
(Names collide-proof: batch siblings and reruns get _2, _3 suffixes.)

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
- `main.js`: Electron main process, file handling, batch orchestration
- `src/audio-processor.js`: Sox/FFmpeg pipeline
- `src/lunar-processor.js`: Moon phase calculations
- `src/name-generator.js`: Mystical naming system
- `src/artwork-generator-vibrant-refined.js`: The art generator (single, current)
- `src/metadata-embedder.js`: Tags + cover art (MP3/WAV/FLAC)

### UI & Interaction
- `src/renderer/app.js`: Main UI logic (hexagon, drag-drop, A/B playback)
- `src/renderer/style.css`: Complete visual design
- `src/renderer/index.html`: Minimal markup structure
- `src/renderer/preferences/`: Preferences window UI

### Website
- `hexbloop-site/routes/index.tsx`: Main landing page
- `hexbloop-site/islands/HeroSection.tsx`: Hero with hexagon
- `hexbloop-site/islands/WhatItDoes.tsx`: Feature showcase
- `hexbloop-site/islands/ProcessFlow.tsx`: Process visualization

## 🚨 Known Issues & Considerations

1. **Web Security**: renderer runs sandboxed (`webSecurity: true`,
   `contextIsolation: true`); drag-drop uses `webUtils.getPathForFile()`
2. **Multiple Website Instances**: Check for running Deno processes on port 8000
3. **Vendor binaries**: `vendor/` is empty in dev (system sox/ffmpeg used);
   run `npm run vendor:setup` before packaging a self-contained build
4. **Performance**: Hexagon animations may lag with multiple files processing
5. **style.css**: has duplicated selector blocks (e.g. `.ambient-toggle`) —
   cosmetic debt, last-in-cascade wins; dedupe carefully with visual checks

## 🎯 Current Development Focus

- Launch readiness: packaging with bundled binaries, DMG polish
- A/B hexagon player refinements (latest shipped feature)
- Improving audio analysis for dynamic artwork generation
- Optimizing website performance and animations