# Hexbloop

Hexbloop is a creative audio processing app that enhances your audio files with mystical digital processing influenced by natural factors like moon phases and time of day. It's a digital-meets-organic "chaos magic engine" for creative audio processing.

## Features

- Drag and drop interface with mesmerizing visuals
- Audio processing influenced by moon phases, time of day, and other natural factors
- Unique naming system that creates mystical, glitchy names for your files
- Procedural artwork generation for each processed file
- Mac App Store compliant processing using native AVAudioEngine
- Easy export of processed files

## Architecture

Hexbloop is built with a modular architecture:

1. **Configuration System** - Central configuration with nature-influenced parameters
2. **NameGenerator** - Procedural band name creation with glitch effects
3. **AudioProcessor** - AVAudioEngine-based audio processing chain
4. **ArtGenerator** - SVG-based artwork generation
5. **HexbloopFileManager** - Sandboxed file handling system

### Project Structure

```
Hexbloop/
├── Configuration.swift       # Central parameters management
├── NameGenerator.swift       # Procedural name creation
├── AudioProcessor.swift      # AVAudioEngine processing chain
├── ArtGenerator.swift        # SVG artwork generation
├── HexbloopFileManager.swift # File management
├── ContentView.swift         # Main UI
├── HexbloopApp.swift         # App entry point
├── Resources/
│   └── ambient_loop.mp3      # Background ambient loop
```

## Audio Processing Chain

Hexbloop uses a native AVAudioEngine processing chain for Mac App Store compliance:

1. **Input Stage**
   - File loading and format conversion

2. **Distortion Stage** 
   - AVAudioUnitDistortion with various presets (overdrive, ring modulator, etc.)
   - Controlled by moon phase and time of day

3. **Equalization Stage**
   - High-pass filter to remove rumble
   - Low-pass filter for vintage warmth
   - Mid-frequency boost for character

4. **Dynamics Processing**
   - First compressor for vintage character (3:1 - 4:1 ratio)
   - Second compressor for mastering (6:1 - 8:1 ratio)
   - Limiter to prevent clipping

5. **Effects Stage**
   - Reverb with natural influence control
   - Delay with feedback control

## Natural Influences

Hexbloop's unique feature is how natural factors influence audio processing:

1. **Moon Phase**
   - Full Moon: Bright, clear, ethereal sound (light compression, high frequency ceiling)
   - New Moon: Dark, mysterious, heavy sound (heavy compression, filtered highs)
   - Waxing Moon: Growing intensity (medium settings, building character)
   - Waning Moon: Receding, mellower sound (medium-light settings, softer character)

2. **Time of Day**
   - Night (10PM-6AM): Darker, heavier processing
   - Morning (6AM-12PM): Clearer, brighter sound
   - Afternoon/Evening: Neutral influence

3. **Day of Month**
   - Influences distortion preset selection
   - Subtle randomness in processing parameters

## Development Roadmap

- ✅ Replace FFmpeg with AVAudioEngine for Mac App Store compliance
- ✅ Implement modular architecture with separation of concerns
- ✅ Create procedural artwork generation
- Add parameter preset system
- Improve visualization with audio reactivity
- Add batch processing capabilities
- Expand natural influence factors (weather API integration, etc.)
- Create companion iOS version