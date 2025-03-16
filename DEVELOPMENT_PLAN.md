# Hexbloop Development Plan

## Overview
Hexbloop is a macOS App Store application that procedurally generates unique band names with accompanying artwork, and applies lo-fi, vintage-inspired audio processing to user-provided audio files. The application uses natural influences like moon phase and time of day to affect the processing parameters, creating a "chaos magic" audio engine.

## Core Technologies
- **AVAudioEngine**: Primary audio processing framework (replacing FFmpeg)
- **SwiftUI**: User interface implementation
- **Core Graphics**: SVG generation and rendering
- **FileManager**: Sandboxed file handling

## Architecture Components

### 1. Configuration System
- Central `ProcessingParameters` struct holding all adjustable parameters
- Natural influence integration (moon phase, time of day calculations)
- Parameter preset saving/loading capability

```swift
struct ProcessingParameters {
    var distortionAmount: Float = 0.5
    var highPassFreq: Float = 80.0
    var lowPassFreq: Float = 12000.0
    var compressionRatio: Float = 4.0
    var reverbAmount: Float = 0.3
    var delayTime: Float = 0.0
    var outputGain: Float = 0.0
    
    // Influence methods
    static func generateWithNaturalInfluences() -> ProcessingParameters
}
```

### 2. Name Generator
- Procedural band name creation
- Style-specific formatting (uppercase, symbols)
- Glitch effects and numerological suffixes

```swift
class NameGenerator {
    // Word lists
    private let prefixes: [String]
    private let suffixes: [String]
    private let symbols: [String]
    
    // Generation methods
    func generateName() -> String
    private func applyGlitchEffects(to name: String) -> String
}
```

### 3. Audio Processor
- AVAudioEngine-based processing chain
- Distortion → EQ → Compressor(s) → Limiter
- Fallback processing options
- Parameter mapping from Configuration

```swift
class AudioProcessor {
    // Audio engine components
    private let audioEngine = AVAudioEngine()
    private let distortionNode = AVAudioUnitDistortion()
    private let eqNode = AVAudioUnitEQ(numberOfBands: 10)
    private let compressorNode = AVAudioUnitCompressor()
    private let limiterNode = AVAudioUnitLimiter()
    
    // Setup and processing methods
    func setupProcessingChain()
    func applyParameters(_ params: ProcessingParameters)
    func processAudio(at inputURL: URL, to outputURL: URL) async throws
    private func configureDistortion(amount: Float)
    private func configureEQ(highPass: Float, lowPass: Float)
}
```

### 4. Art Generator
- SVG-based artwork generation
- Geometric primitives with random properties
- SVG filter effects for glitch aesthetic
- PNG rendering for export

```swift
class ArtGenerator {
    // Generation properties
    private let width: Int = 1000
    private let height: Int = 1000
    private let maxShapes: Int = 30
    
    // Generation methods
    func generateSVG() -> String
    func renderToPNG(svgString: String) -> NSImage?
    private func generateRandomShape() -> String
    private func generateFilters() -> String
}
```

### 5. File Manager
- Sandbox-compatible file handling
- Temporary file workspace in Documents/HexbloopTemp
- Organized output in Documents/HexbloopOutput
- Cleanup and error recovery

```swift
class HexbloopFileManager {
    // Directory URLs
    let tempDirectory: URL
    let outputDirectory: URL
    
    // File management methods
    func setupDirectories() throws
    func generateUniqueOutputPath(baseName: String, extension: String) -> URL
    func cleanupTempFiles()
    func createSessionDirectory() -> URL
}
```

### 6. User Interface
- Drag-and-drop hexagonal interface
- Visual processing feedback
- Parameter controls
- Output preview

```swift
struct ContentView: View {
    @StateObject private var audioProcessor = AudioProcessor()
    @StateObject private var nameGenerator = NameGenerator()
    @StateObject private var artGenerator = ArtGenerator()
    @State private var processingParameters = ProcessingParameters()
    
    // UI state properties
    @State private var isProcessing = false
    @State private var dragActive = false
    @State private var processedFiles: [ProcessedFile] = []
    
    // View body and components
    var body: some View
    private func processDrop(providers: [NSItemProvider])
    private func showSuccessFeedback()
}
```

## Implementation Phases

### Phase 1: Core Framework Setup (1 week)
- Create project structure with all base classes
- Implement ProcessingParameters with natural influences
- Set up basic file management system
- Build minimal UI with drag-drop support

### Phase 2: Audio Processing (2 weeks)
- Implement AVAudioEngine processing chain
- Create parameter mapping from ProcessingParameters
- Set up asynchronous processing with progress reporting
- Implement error handling and fallbacks

### Phase 3: Name & Art Generation (1 week)
- Implement NameGenerator with word lists and formatting
- Create ArtGenerator with SVG generation and rendering
- Connect generator outputs to file saving system
- Integrate with processing workflow

### Phase 4: UI Enhancement & Testing (2 weeks)
- Build complete UI with parameter controls
- Add visual feedback during processing
- Implement presets and batch processing
- Test across various macOS versions and audio inputs

### Phase 5: Refinement & App Store Preparation (1 week)
- Audio parameter tuning for optimal vintage sound
- Performance optimization and error recovery
- Create App Store assets (icons, screenshots)
- Documentation and submission preparation

## Technical Considerations

### Mac App Store Compliance
- No external dependencies with incompatible licenses
- Full sandboxing compliance
- Proper entitlements configuration
- User-initiated file access only

### Error Handling
- Graceful error recovery using Swift's do-catch
- Fallback processing options when advanced effects fail
- User-friendly error messages and suggestions
- Automatic cleanup after errors

### Performance Optimization
- Concurrent processing for multiple files
- Efficient memory management during audio processing
- Background thread usage for non-UI operations
- Progress reporting to keep UI responsive

### User Experience
- Consistent visual design with occult/glitch aesthetic
- Clear feedback during processing operations
- Intuitive parameter controls with live preview where possible
- Organized output file structure

### Sandboxing Lessons Learned
- Create persistent workspace in Documents/HexbloopTemp
- Avoid system temporary directories that get cleaned up
- Always check file existence before operations
- Use user-selected file access for input files
- Save output to Documents/HexbloopOutput by default

## AVAudioEngine Processing Chain Details

### Vintage Audio Effects Implementation
1. **Input Stage**
   - Convert any input format to the processing format (44.1kHz, 16-bit)
   - Apply initial gain control

2. **Distortion Stage**
   - Use AVAudioUnitDistortion with carefully tuned parameters
   - Presets to try: .overdrive, .ringModulator for vintage character
   - Control wetDryMix based on intensity parameter

3. **Equalization Stage**
   - AVAudioUnitEQ with 10 bands
   - Apply high-pass filter to remove rumble
   - Apply low-pass filter to roll off digital highs
   - Add mid-range resonance for analog character
   - Vary EQ based on natural influences

4. **Compression Stage**
   - First compressor: moderate ratio (3:1 - 4:1) for vintage sound
   - Second compressor: higher ratio (6:1 - 8:1) for mastering
   - Threshold and attack/release tuned for musical response
   - Vary compression parameters based on natural influences

5. **Output Stage**
   - Apply final limiting to prevent clipping
   - Convert to output format (MP3/AAC for export)

### Key Challenges and Solutions:
- **Parameter Mapping**: Create mathematical functions to map intuitive controls to complex effect parameters
- **Resampling**: Implement proper sample rate conversion for various input files
- **Gain Staging**: Carefully manage levels between processing stages