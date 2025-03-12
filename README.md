# Hexbloop

Hexbloop is a creative audio processing app that enhances your audio files with mystical digital processing influenced by natural factors like moon phases and time of day. It's a digital-meets-organic "chaos magic engine" for creative audio processing.

## Features

- Drag and drop interface with mesmerizing visuals
- Audio processing influenced by moon phases, time of day, and other natural factors
- Unique naming system that creates mystical, glitchy names for your files
- Easy export of processed files

## Setup

### Required Frameworks

For full functionality, Hexbloop requires:

1. **FFmpegKit** - For advanced audio processing

### Installing FFmpegKit

To add FFmpegKit to the project:

1. Add via Swift Package Manager:
   - In Xcode: File > Add Packages...
   - Enter URL: https://github.com/kewlbear/FFmpeg-iOS.git
   - Select main branch

Alternatively, you can use CocoaPods:

```
pod 'ffmpeg-kit-macos-full', '~> 5.1'
```

### Project Structure

Hexbloop follows MVVM architecture:

```
Hexbloop/
├── App/ 
│   └── HexbloopApp.swift
├── Views/
│   ├── ContentView.swift
│   ├── Components/
│   │   └── HexagonShape.swift
├── Models/
│   └── ProcessedFile.swift
├── ViewModels/
│   └── AudioProcessingViewModel.swift
├── Services/
│   ├── AudioPlayerService.swift
│   ├── AudioProcessorService.swift
│   └── NameGeneratorService.swift
├── Utilities/
│   ├── NaturalInfluences.swift
│   └── Extensions/
│       └── NSItemProviderExtension.swift
├── Resources/
│   ├── Assets.xcassets
│   └── ambient_loop.mp3
```

## Using FFmpeg Processing

Hexbloop now includes a framework for FFmpeg-based audio processing with the following features:

1. **Two-stage processing pipeline:**
   - Stage 1: Adds vintage character with filters influenced by natural factors
   - Stage 2: Applies mastering chain for professional sound quality

2. **Natural influences on audio processing:**
   - Moon phase affects the overall processing style
   - Time of day influences specific effects
   - Day of month adds subtle randomness to pitch

3. **Processing parameters include:**
   - High-pass and low-pass frequency filters
   - Vintage saturation/distortion
   - Tape-like compression
   - Reverb and delay
   - Pitch shifting
   - Output gain

To enable FFmpeg processing:

1. **Add FFmpegKit** using one of the methods in the Setup section
2. **Enable FFmpeg in the code:**
   - Uncomment the FFmpegKit import at the top of ContentView.swift
   - Change `ffmpegAvailable` to `true` in the AudioConverter class
   - Rebuild the app

3. **Toggle FFmpeg processing** in the UI when processing files

## Development Roadmap

- ✅ Implement FFmpeg-based audio processing with vintage character and mastering 
- Enhance audio processing with additional filters and effects
- Add visual processing of images and videos
- Expand natural influence factors (weather API integration, etc.)
- Create visualizations that react to audio playback
- Add preset system for saving favorite processing combinations