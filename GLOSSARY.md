# Hexbloop Swift - Code Glossary

Quick reference for the Hexbloop macOS app architecture.

## Views (SwiftUI)

**ContentView** - Main drag-drop interface with hexagon animations
`swift/Hexbloop/ContentView.swift`

**HexbloopApp** - App entry point, window configuration
`swift/Hexbloop/HexbloopApp.swift`

**Hexagon** - Custom Shape for hexagonal UI elements
`swift/Hexbloop/ContentView.swift`

**AudioPlayer** - Ambient audio loop controller (disabled)
`swift/Hexbloop/ContentView.swift`

## Models & Data

**ProcessingParameters** - Audio effect settings (distortion, compression, reverb)
`swift/Hexbloop/MacAudioEngine.swift`

**Configuration** - App configuration state
`swift/Hexbloop/Configuration.swift`

**FileType** - Enums for distortion presets, audio matching
`swift/Hexbloop/MacAudioEngine.swift`

## Services & Managers

**MacAudioEngine** - AVFoundation audio processing pipeline
`swift/Hexbloop/MacAudioEngine.swift`

**ArtGenerator** - Procedural SVG artwork with 7 styles
`swift/Hexbloop/ArtGenerator.swift`

**NameGenerator** - Mystical file name generation system
`swift/Hexbloop/NameGenerator.swift`

**AudioProcessorService** - Audio processing state management
`swift/Hexbloop/AudioProcessorService.swift`

**HexbloopFileManager** - File operations and output management
`swift/Hexbloop/HexbloopFileManager.swift`

**AudioProcessor** - Legacy audio processing interface
`swift/Hexbloop/AudioProcessor.swift`

## Core Concepts

**Moon Phase Processing** - Astronomical calculations influencing audio parameters
- Full Moon: Bright, ethereal (low overdrive, high treble)
- New Moon: Dark, heavy (high overdrive, deep bass)
- Waxing/Waning: Interpolated between extremes

**Art Styles** - 8 procedural generation styles
- Electronic, Dark Synthwave, Ambient Space, Lo-Fi, Industrial, Cyberpunk, Vaporwave, Glitch

**Audio Pipeline** - AVAssetExportSession → Effects → Metadata embedding
- Uses AVFoundation instead of sox/ffmpeg for native processing

**Processing Flow**
1. Generate mystical name (NameGenerator)
2. Calculate moon phase influence
3. Process audio (MacAudioEngine)
4. Generate artwork (ArtGenerator)
5. Embed metadata + artwork
6. Save to ~/Documents/HexbloopOutput/
