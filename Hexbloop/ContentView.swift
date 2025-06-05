import SwiftUI
import AVFoundation
import UniformTypeIdentifiers
import CoreImage.CIFilterBuiltins
import os.log

// MARK: - AudioPlayer: Ambient Audio Loop
class AudioPlayer: ObservableObject {
    private var audioPlayer: AVAudioPlayer?

    func startAmbientLoop() {
        guard let url = Bundle.main.url(forResource: "ambient_loop", withExtension: "mp3") else {
            print("❌ Could not find ambient_loop.mp3")
            return
        }

        do {
            audioPlayer = try AVAudioPlayer(contentsOf: url)
            audioPlayer?.numberOfLoops = -1
            audioPlayer?.volume = 0.5
            audioPlayer?.play()
        } catch {
            print("❌ Error playing ambient loop: \(error)")
        }
    }
    
    func stopAmbientLoop() {
        audioPlayer?.stop()
    }
    
    func setVolume(_ volume: Float) {
        audioPlayer?.volume = volume
    }
}

// MARK: - ContentView
struct ContentView: View {
    // MARK: - Services and State Objects
    @StateObject private var nameGenerator: NameGenerator
    @StateObject private var audioProcessor: AudioProcessorService
    @StateObject private var artGenerator: ArtGenerator
    
    init() {
        _nameGenerator = StateObject(wrappedValue: NameGenerator())
        _audioProcessor = StateObject(wrappedValue: AudioProcessorService())
        _artGenerator = StateObject(wrappedValue: ArtGenerator())
    }
    
    // MARK: - Processing State
    @State private var processedFiles: [String] = []
    @State private var isProcessing = false
    @State private var showSuccess = false
    @State private var successOpacity = 0.0
    @State private var pentagramRotation = 0.0
    @State private var showProcessingParams = false
    @State private var configuration = Configuration()
    @State private var processingParameters = ProcessingParameters()
    
    // MARK: - Batch Processing State
    @State private var totalFilesCount = 0
    @State private var currentFileIndex = 0
    @State private var showBatchProgress = false
    @State private var batchProgress: Float = 0.0
    @State private var currentFileName: String = ""
    @State private var isCancelling = false
    @State private var lastMemoryCleanup: Date? = nil
    @State private var lastProcessedFile: URL?
    @StateObject private var cancellationManager = CancellationManager()

    // MARK: - UI State
    @State private var isHoveringOverHex = false
    @State private var backgroundColors: [Color] = [Color.black.opacity(0.9), Color.gray.opacity(0.8), Color.blue.opacity(0.7)]
    @State private var hexagonColors: [Color] = [Color.purple.opacity(0.7), Color.pink.opacity(0.6)]
    @State private var innerHexagonColors: [Color] = [Color.yellow.opacity(0.5), Color.orange.opacity(0.5)]
    @State private var glowPulse1 = false
    @State private var glowPulse2 = false
    @State private var glowPulse3 = false

    private let backgroundColor = Color(red: 0.05, green: 0.05, blue: 0.1)
    private let fileManager = HexbloopFileManager.shared

    var body: some View {
        ZStack {
            // MARK: - Background Glow
            RadialGradient(
                gradient: Gradient(colors: [backgroundColor, Color.black]),
                center: .center,
                startRadius: 10,
                endRadius: 700
            )
            .ignoresSafeArea()
            .blur(radius: 30)

            // Background texture (commented out as image may not exist)
            // Image("grain")
            //     .resizable()
            //     .ignoresSafeArea()
            //     .blendMode(.overlay)
            //     .opacity(0.2)

            // MARK: - Glowing Hexagons and Pentagram
            ZStack {
                Hexagon()
                    .fill(LinearGradient(gradient: Gradient(colors: isHoveringOverHex ? [Color.purple, Color.purple.opacity(0.8)] : hexagonColors), startPoint: .top, endPoint: .bottom))
                    .frame(width: 300, height: 300)
                    .shadow(color: Color.purple.opacity(0.6), radius: glowPulse1 ? 40 : 30)
                    .opacity(glowPulse1 ? 0.9 : 0.7)
                    .scaleEffect(glowPulse1 ? 1.3 : 1.0)
                    .animation(
                        .easeInOut(duration: 2.5).repeatForever(autoreverses: true),
                        value: glowPulse1
                    )

                Hexagon()
                    .fill(LinearGradient(gradient: Gradient(colors: isHoveringOverHex ? [Color.purple, Color.purple.opacity(0.8)] : hexagonColors.reversed()), startPoint: .bottom, endPoint: .top))
                    .frame(width: 250, height: 250)
                    .shadow(color: Color.blue.opacity(0.5), radius: glowPulse2 ? 35 : 25)
                    .opacity(glowPulse2 ? 0.8 : 0.6)
                    .scaleEffect(glowPulse2 ? 1.2 : 1.0)
                    .animation(
                        .easeInOut(duration: 2.5).repeatForever(autoreverses: true),
                        value: glowPulse2
                    )

                Hexagon()
                    .fill(LinearGradient(gradient: Gradient(colors: innerHexagonColors), startPoint: .leading, endPoint: .trailing))
                    .frame(width: 200, height: 200)
                    .shadow(color: Color.orange.opacity(0.4), radius: glowPulse3 ? 30 : 20)
                    .opacity(glowPulse3 ? 0.7 : 0.5)
                    .scaleEffect(glowPulse3 ? 1.2 : 1.0)
                    .animation(
                        .easeInOut(duration: 3).repeatForever(autoreverses: true),
                        value: glowPulse3
                    )

                Text("\u{26E7}") // Pentagram
                    .font(.system(size: 120))
                    .foregroundColor(.white.opacity(0.4))
                    .shadow(color: .purple.opacity(0.5), radius: 20)
                    .rotationEffect(.degrees(isProcessing ? pentagramRotation : 0))
                    .animation(.linear(duration: 6), value: pentagramRotation)
                
                // Add file picker button
                if !isProcessing {
                    Button(action: {
                        showFilePicker()
                    }) {
                        Label("Choose Files", systemImage: "folder.badge.plus")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(.white.opacity(0.8))
                            .padding(.horizontal, 16)
                            .padding(.vertical, 8)
                            .background(Color.purple.opacity(0.3))
                            .cornerRadius(8)
                            .overlay(
                                RoundedRectangle(cornerRadius: 8)
                                    .stroke(Color.purple.opacity(0.5), lineWidth: 1)
                            )
                    }
                    .buttonStyle(PlainButtonStyle())
                    .help("Select audio files to process")
                    .padding(.top, 20)
                }
                
                // Display moon phase and time info
                VStack {
                    Spacer()
                    
                    Text("Drop audio files here")
                        .foregroundColor(.white.opacity(0.7))
                        .font(.system(size: 14, weight: .medium))
                        .padding(.bottom, 4)
                    
                    if !isProcessing {
                        Text(getNaturalInfluencesText())
                            .foregroundColor(.white.opacity(0.5))
                            .font(.system(size: 12, weight: .light))
                            .italic()
                    }
                    
                    Spacer().frame(height: 16)
                }
            }

            // MARK: - Processing parameters display
            VStack {
                Spacer()
                
                // Display current processing parameters
                if showProcessingParams {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Processing Parameters:")
                            .foregroundColor(.white.opacity(0.8))
                            .font(.system(size: 12, weight: .bold))
                        
                        Text("Distortion: \(String(format: "%.1f", processingParameters.distortionAmount)) (\(processingParameters.distortionPreset.rawValue))")
                            .foregroundColor(.white.opacity(0.7))
                            .font(.system(size: 10))
                        
                        Text("Compression: \(String(format: "%.1f", processingParameters.compressionRatio)):1")
                            .foregroundColor(.white.opacity(0.7))
                            .font(.system(size: 10))
                        
                        Text("Filters: HP \(Int(processingParameters.highPassFreq))Hz - LP \(Int(processingParameters.lowPassFreq))Hz")
                            .foregroundColor(.white.opacity(0.7))
                            .font(.system(size: 10))
                        
                        Text("Reverb: \(String(format: "%.1f", processingParameters.reverbAmount)) • Delay: \(String(format: "%.1f", processingParameters.delayTime))s")
                            .foregroundColor(.white.opacity(0.7))
                            .font(.system(size: 10))
                    }
                    .padding(8)
                    .background(Color.black.opacity(0.5))
                    .cornerRadius(8)
                    .padding(.horizontal, 20)
                    .padding(.bottom, 10)
                    .transition(.opacity)
                    .onAppear {
                        DispatchQueue.main.asyncAfter(deadline: .now() + 5) {
                            withAnimation {
                                showProcessingParams = false
                            }
                        }
                    }
                }
            }
            
            // MARK: - Style Settings
            HStack {
                Spacer()
                VStack(alignment: .trailing, spacing: 8) {
                    Menu {
                        Button(action: {
                            nameGenerator.updateConfiguration(useSparklepop: true, useBlackmetal: false)
                        }) {
                            Label("Sparklepop", systemImage: "sparkles")
                        }
                        
                        Button(action: {
                            nameGenerator.updateConfiguration(useSparklepop: false, useBlackmetal: true)
                        }) {
                            Label("Black Metal", systemImage: "cross")
                        }
                        
                        Button(action: {
                            nameGenerator.updateConfiguration(useSparklepop: false, useBlackmetal: false)
                        }) {
                            Label("Neutral", systemImage: "circle.grid.cross")
                        }
                        
                        Divider()
                        
                        Button(action: {
                            nameGenerator.updateConfiguration(useWitchHouse: true)
                        }) {
                            Label("Enable Witch House Symbols", systemImage: "chevron.up.chevron.down")
                        }
                        
                        Button(action: {
                            nameGenerator.updateConfiguration(useWitchHouse: false)
                        }) {
                            Label("Disable Witch House Symbols", systemImage: "chevron.up.chevron.down")
                        }
                        
                        Divider()
                        
                        Button(action: {
                            nameGenerator.updateConfiguration(glitchIntensity: 50)
                        }) {
                            Label("High Glitch", systemImage: "waveform.path.ecg")
                        }
                        
                        Button(action: {
                            nameGenerator.updateConfiguration(glitchIntensity: 20)
                        }) {
                            Label("Medium Glitch", systemImage: "waveform.path")
                        }
                        
                        Button(action: {
                            nameGenerator.updateConfiguration(glitchIntensity: 5)
                        }) {
                            Label("Low Glitch", systemImage: "waveform")
                        }
                        
                        Divider()
                        
                        Button(action: {
                            fileManager.revealInFinder(url: fileManager.outputDirectory)
                        }) {
                            Label("Show Output Folder", systemImage: "folder")
                        }
                        
                    } label: {
                        Image(systemName: "gearshape.fill")
                            .font(.system(size: 20))
                            .foregroundColor(.white.opacity(0.7))
                            .padding(8)
                            .background(Color.black.opacity(0.4))
                            .clipShape(Circle())
                    }
                    .buttonStyle(.plain)
                    .fixedSize()
                }
                .padding(.trailing, 20)
                .padding(.top, 20)
            }
    
            // MARK: - Notifications
            VStack {
                Spacer()
                ForEach(processedFiles, id: \.self) { fileName in
                    Text("Converted: \(fileName)")
                        .foregroundColor(.white)
                        .font(.subheadline)
                        .padding()
                        .background(Color.black.opacity(0.4))
                        .clipShape(RoundedRectangle(cornerRadius: 15))
                        .padding(.bottom, 5)
                        .transition(.opacity)
                        .onAppear {
                            DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                                withAnimation(.easeOut(duration: 2)) {
                                    processedFiles.removeAll { $0 == fileName }
                                }
                            }
                        }
                }
            }

            // MARK: - Success Effect
            if showSuccess {
                Circle()
                    .strokeBorder(
                        LinearGradient(
                            gradient: Gradient(colors: [Color.white.opacity(0.7), Color.purple.opacity(0.5)]),
                            startPoint: .top,
                            endPoint: .bottom
                        ),
                        lineWidth: 20
                    )
                    .frame(width: 350, height: 350)
                    .blur(radius: 30)
                    .opacity(successOpacity)
                    .scaleEffect(showSuccess ? 1.5 : 1.0)
                    .animation(
                        .easeInOut(duration: 2.5),
                        value: showSuccess
                    )
                    .onAppear {
                        DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                            withAnimation(.easeOut(duration: 2)) {
                                successOpacity = 0.0
                                showSuccess = false
                            }
                        }
                    }
            }
            
            // MARK: - Progress Overlay
            if isProcessing {
                ZStack {
                    // Hexagonal background for progress
                    Hexagon()
                        .fill(LinearGradient(
                            gradient: Gradient(colors: [Color.black.opacity(0.8), Color.purple.opacity(0.3)]),
                            startPoint: .top,
                            endPoint: .bottom
                        ))
                        .frame(width: 280, height: 280)
                        .shadow(color: .purple.opacity(0.5), radius: 20)
                    
                    // Show batch progress if processing multiple files
                    if showBatchProgress {
                        VStack(spacing: 15) {
                            // Hexagonal icon at top
                            Hexagon()
                                .stroke(LinearGradient(
                                    gradient: Gradient(colors: [.purple, .blue]),
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                ), lineWidth: 2)
                                .frame(width: 40, height: 40)
                                .rotationEffect(.degrees(30))
                                
                            // Status text with styling
                            Text("Processing file \(currentFileIndex) of \(totalFilesCount)")
                                .foregroundColor(.white)
                                .font(.system(size: 14, weight: .medium))
                                .padding(.top, 5)
                            
                            Text(currentFileName)
                                .foregroundColor(.white.opacity(0.8))
                                .font(.system(size: 12, weight: .light))
                                .italic()
                                .lineLimit(1)
                                .truncationMode(.middle)
                                .frame(width: 220)
                            
                            // Create hexagonal progress - batch progress
                            ZStack {
                                // Background track
                                Circle()
                                    .stroke(Color.black.opacity(0.3), lineWidth: 6)
                                    .frame(width: 120, height: 120)
                                
                                // Progress circle
                                Circle()
                                    .trim(from: 0, to: CGFloat(batchProgress))
                                    .stroke(
                                        LinearGradient(
                                            gradient: Gradient(colors: [.orange, .yellow]),
                                            startPoint: .leading,
                                            endPoint: .trailing
                                        ),
                                        style: StrokeStyle(lineWidth: 6, lineCap: .round)
                                    )
                                    .frame(width: 120, height: 120)
                                    .rotationEffect(.degrees(-90))
                                
                                // File progress circle (inner)
                                Circle()
                                    .trim(from: 0, to: CGFloat(self.audioProcessor.progress))
                                    .stroke(
                                        LinearGradient(
                                            gradient: Gradient(colors: [.purple, .pink]),
                                            startPoint: .leading,
                                            endPoint: .trailing
                                        ),
                                        style: StrokeStyle(lineWidth: 6, lineCap: .round)
                                    )
                                    .frame(width: 90, height: 90)
                                    .rotationEffect(.degrees(-90))
                                
                                // Percentage display
                                Text("\(Int(batchProgress * 100))%")
                                    .font(.system(size: 20, weight: .bold))
                                    .foregroundColor(.white)
                            }
                            
                            // Cancel button with improved styling
                            Button(action: {
                                isCancelling = true
                                Task {
                                    await cancelProcessing()
                                }
                            }) {
                                Text(isCancelling ? "Cancelling..." : "Cancel")
                                    .font(.system(size: 14, weight: .medium))
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 20)
                                    .padding(.vertical, 10)
                                    .background(
                                        LinearGradient(
                                            gradient: Gradient(colors: [.red.opacity(0.7), .orange.opacity(0.7)]),
                                            startPoint: .leading,
                                            endPoint: .trailing
                                        )
                                    )
                                    .clipShape(Capsule())
                                    .shadow(color: .black.opacity(0.3), radius: 5, x: 0, y: 2)
                            }
                            .disabled(isCancelling)
                            .opacity(isCancelling ? 0.5 : 1.0)
                            .padding(.top, 10)
                        }
                        .padding(30)
                    } else {
                        // Single file progress - simplified but elegant
                        VStack(spacing: 15) {
                            // Hex icon
                            Hexagon()
                                .stroke(LinearGradient(
                                    gradient: Gradient(colors: [.purple, .pink]),
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                ), lineWidth: 2)
                                .frame(width: 40, height: 40)
                                .rotationEffect(.degrees(30))
                            
                            // Status
                            Text("Processing audio...")
                                .foregroundColor(.white)
                                .font(.system(size: 16, weight: .medium))
                                .padding(.vertical, 10)
                            
                            // Circular progress
                            ZStack {
                                // Background track
                                Circle()
                                    .stroke(Color.black.opacity(0.3), lineWidth: 8)
                                    .frame(width: 140, height: 140)
                                
                                // Progress circle
                                Circle()
                                    .trim(from: 0, to: CGFloat(self.audioProcessor.progress))
                                    .stroke(
                                        LinearGradient(
                                            gradient: Gradient(colors: [.purple, .pink, .blue]),
                                            startPoint: .leading,
                                            endPoint: .trailing
                                        ),
                                        style: StrokeStyle(lineWidth: 8, lineCap: .round)
                                    )
                                    .frame(width: 140, height: 140)
                                    .rotationEffect(.degrees(-90))
                                
                                // Percentage
                                Text("\(Int(self.audioProcessor.progress * 100))%")
                                    .font(.system(size: 26, weight: .bold))
                                    .foregroundColor(.white)
                            }
                            
                            // Cancel button - styled
                            Button(action: {
                                isCancelling = true
                                Task {
                                    await cancelProcessing()
                                }
                            }) {
                                Text(isCancelling ? "Cancelling..." : "Cancel")
                                    .font(.system(size: 14, weight: .medium))
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 20)
                                    .padding(.vertical, 10)
                                    .background(
                                        LinearGradient(
                                            gradient: Gradient(colors: [.red.opacity(0.7), .orange.opacity(0.7)]),
                                            startPoint: .leading,
                                            endPoint: .trailing
                                        )
                                    )
                                    .clipShape(Capsule())
                                    .shadow(color: .black.opacity(0.3), radius: 5, x: 0, y: 2)
                            }
                            .disabled(isCancelling)
                            .opacity(isCancelling ? 0.5 : 1.0)
                            .padding(.top, 20)
                        }
                        .padding(30)
                    }
                }
                .frame(width: 320, height: 400)
                .background(
                    ZStack {
                        // Blurred background
                        Color.black.opacity(0.5)
                            .blur(radius: 5)
                        
                        // Border gradient
                        RoundedRectangle(cornerRadius: 20)
                            .stroke(
                                LinearGradient(
                                    gradient: Gradient(colors: [.purple.opacity(0.5), .blue.opacity(0.3), .clear, .clear]),
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                ),
                                lineWidth: 2
                            )
                    }
                )
                .clipShape(RoundedRectangle(cornerRadius: 20))
                .shadow(color: .purple.opacity(0.3), radius: 15)
                .padding()
            }
        }
        .onDrop(of: ["public.file-url"], isTargeted: $isHoveringOverHex) { providers in
            // Drop handling with better error capture
            Task {
                await processDrop(providers: providers)
            }
            return true
        }
        .onAppear {
            // Start ambient audio
            // Ambient audio disabled for now
            // audioPlayer.startAmbientLoop()
            
            // Start visual effects
            glowPulse1.toggle()
            glowPulse2.toggle()
            glowPulse3.toggle()
            
            // Initialize audio optimizations
            initializeAudioSystem()
        }
    }

    // MARK: - File Selection
    
    // Show file picker
    private func showFilePicker() {
        let panel = NSOpenPanel()
        panel.title = "Select Audio Files"
        panel.message = "Choose audio files to process with Hexbloop"
        panel.prompt = "Select"
        panel.allowsMultipleSelection = true
        panel.canChooseDirectories = false
        panel.canChooseFiles = true
        panel.allowedContentTypes = [
            .audio,
            .mp3,
            .mpeg4Audio,
            .wav,
            .aiff,
            .init(filenameExtension: "flac") ?? .audio
        ]
        
        panel.begin { response in
            if response == .OK {
                let urls = panel.urls
                if !urls.isEmpty {
                    // Convert URLs to NSItemProviders and process
                    let providers = urls.map { url in
                        let provider = NSItemProvider()
                        provider.registerFileRepresentation(forTypeIdentifier: "public.audio", fileOptions: [], visibility: .all) { completion in
                            completion(url, false, nil)
                            return nil
                        }
                        return provider
                    }
                    
                    Task {
                        await processDrop(providers: providers)
                    }
                }
            }
        }
    }

    // MARK: - Audio Processing

    @MainActor
    private func processDrop(providers: [NSItemProvider]) async {
        // Don't process if already processing
        guard !isProcessing else {
            withAnimation {
                processedFiles.append("🚫 Already processing files, please wait")
            }
            return
        }
        
        // Setup cancellation support
        isCancelling = false
        
        // Track overall processing state
        isProcessing = true
        pentagramRotation += 360
        
        // Collect all valid files first
        var validFiles: [(URL, String)] = []
        
        // Process each file
        for provider in providers {
            do {
                // Generate a name for the file
                let generatedName = nameGenerator.generateName()
                let glitchedName = nameGenerator.applyGlitchEffects(to: generatedName)
                
                // Load file URL with simplified validation
                var inputURL: URL?
                let fileURLType = "public.file-url"
                
                if provider.hasItemConformingToTypeIdentifier(fileURLType) {
                    inputURL = try await withCheckedThrowingContinuation { continuation in
                        provider.loadItem(forTypeIdentifier: fileURLType, options: nil) { item, error in
                            if let error = error {
                                continuation.resume(throwing: error)
                                return
                            }
                            
                            if let url = item as? URL {
                                continuation.resume(returning: url)
                            } else if let data = item as? Data, let url = URL(dataRepresentation: data, relativeTo: nil) {
                                continuation.resume(returning: url)
                            } else {
                                continuation.resume(throwing: HexbloopError.invalidInput("Could not load file URL"))
                            }
                        }
                    }
                }
                
                guard let inputURL = inputURL else {
                    withAnimation {
                        processedFiles.append("❌ Error: Invalid file")
                    }
                    continue
                }
                
                // Check if it's an audio file by extension
                let validExtensions = ["mp3", "wav", "m4a", "aac", "aif", "aiff", "flac"]
                guard validExtensions.contains(inputURL.pathExtension.lowercased()) else {
                    withAnimation {
                        processedFiles.append("❌ Error: \(inputURL.lastPathComponent) is not an audio file")
                    }
                    continue
                }
                
                // Validate file size first
                let fileAttributes = try? FileManager.default.attributesOfItem(atPath: inputURL.path)
                let fileSize = fileAttributes?[.size] as? Int64 ?? 0
                let maxFileSize: Int64 = 500 * 1024 * 1024 // 500MB limit
                
                if fileSize > maxFileSize {
                    withAnimation {
                        processedFiles.append("❌ Error: \(inputURL.lastPathComponent) is too large (max 500MB)")
                    }
                    continue
                }
                
                if fileSize == 0 {
                    withAnimation {
                        processedFiles.append("❌ Error: \(inputURL.lastPathComponent) is empty")
                    }
                    continue
                }
                
                // Validate file can be opened
                do {
                    let testFile = try AVAudioFile(forReading: inputURL)
                    let frameCount = testFile.length
                    if frameCount <= 0 {
                        withAnimation {
                            processedFiles.append("❌ Error: \(inputURL.lastPathComponent) appears to be empty")
                        }
                        continue
                    }
                } catch {
                    withAnimation {
                        processedFiles.append("❌ Error: \(inputURL.lastPathComponent) could not be read as audio")
                    }
                    continue
                }
                
                // Add to valid files
                validFiles.append((inputURL, glitchedName))
                
            } catch {
                print("❌ Error reading file: \(error.localizedDescription)")
                withAnimation {
                    processedFiles.append("❌ Error: Could not read file")
                }
            }
        }
        
        // Set up batch processing if we have multiple files
        totalFilesCount = validFiles.count
        currentFileIndex = 0
        showBatchProgress = validFiles.count > 1
        
        // If we have valid files, generate parameters
        if !validFiles.isEmpty {
            // Generate processing parameters with natural influences
            processingParameters = ProcessingParameters.generateWithMoonPhaseInfluence()
            showProcessingParams = true
            
            // Process each valid file sequentially
            for (index, (inputURL, glitchedName)) in validFiles.enumerated() {
                // Check if processing was cancelled
                if await cancellationManager.shouldCancel || isCancelling {
                    withAnimation {
                        processedFiles.append("ℹ️ Processing cancelled")
                    }
                    break
                }
                
                // Update batch progress
                currentFileIndex = index + 1
                batchProgress = Float(index) / Float(validFiles.count)
                currentFileName = inputURL.lastPathComponent
                
                do {
                    // Create output file path
                    // Determine output format:
                    // - MP3: Great compatibility but slightly lower quality
                    // - M4A: Better quality, good metadata support, less compatibility with some systems
                    let outputExtension = "m4a" // Use M4A for better AVFoundation compatibility
                    let finalOutputURL = fileManager.generateUniqueOutputPath(
                        baseName: glitchedName,
                        fileExtension: outputExtension
                    )
                    
                    // Generate artwork for the processed file
                    let artworkURL = artGenerator.generateArtwork(
                        for: glitchedName,
                        to: fileManager.outputDirectory
                    )
                    
                    // Process audio using our enhanced MacAudioEngine with memory monitoring
                    let engine = MacAudioEngine()
                    
                    // Log memory status before processing starts
                    logCurrentMemoryStatus()
                    
                    let success = try await engine.processAudioFile(
                        at: inputURL,
                        to: finalOutputURL,
                        with: processingParameters
                    ) { progress in
                        // Update our progress on the main actor
                        Task { @MainActor in
                            audioProcessor.progress = progress
                            
                            // Force UI update when complete
                            if progress >= 1.0 {
                                audioProcessor.progress = 0.0
                            }
                            
                            // Occasionally log memory status during processing
                            if Int(progress * 100) % 20 == 0 {
                                logCurrentMemoryStatus()
                            }
                        }
                    }
                    
                    // Log memory status after processing completes
                    logCurrentMemoryStatus()
                    
                    // Check for cancellation after processing
                    if isCancelling {
                        // Try to clean up partial file
                        try? FileManager.default.removeItem(at: finalOutputURL)
                        break
                    }
                    
                    if success {
                        // Generate PNG version of SVG for embedding
                        var artworkPNGURL: URL? = nil
                        if let svgURL = artworkURL {
                            // Convert SVG to PNG using NSImage
                            if let image = NSImage(contentsOf: svgURL) {
                                let pngURL = svgURL.deletingPathExtension().appendingPathExtension("png")
                                if let pngData = image.pngData() {
                                    try pngData.write(to: pngURL)
                                    artworkPNGURL = pngURL
                                }
                            }
                        }
                        
                        // Apply metadata with artwork
                        try await engine.applyMetadataAndArtwork(
                            to: finalOutputURL,
                            artistName: "HEX_BLOOP_\(Calendar.current.component(.year, from: Date()))",
                            albumName: "CYBER_GRIMOIRE_\(dateToYYYYMMDD(Date()))",
                            trackName: glitchedName,
                            artworkURL: artworkPNGURL
                        )
                        
                        // Show success feedback
                        withAnimation {
                            processedFiles.append("✅ \(glitchedName)")
                        }
                        
                        // Store the output file path for later
                        lastProcessedFile = finalOutputURL
                        print("✅ File processed successfully: \(finalOutputURL.path)")
                    } else {
                        throw HexbloopError.processingFailed("Failed to process audio")
                    }
                } catch {
                    print("❌ Audio processing failed: \(error.localizedDescription)")
                    
                    // Show error to the user
                    withAnimation {
                        let errorMsg = "❌ Error processing: \(glitchedName)"
                        processedFiles.append(errorMsg)
                    }
                }
            }
            
            // After all files are processed or processing was cancelled
            print("🏁 Processing complete. Files processed: \(processedFiles.count), isCancelling: \(isCancelling)")
            if !processedFiles.isEmpty {
                withAnimation {
                    if !isCancelling {
                        showSuccessFeedback()
                        
                        // Always open Finder to show the output file or directory
                        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                            if let outputFile = lastProcessedFile {
                                print("📂 Attempting to reveal file: \(outputFile.path)")
                                fileManager.revealInFinder(url: outputFile)
                            } else {
                                print("📂 Attempting to reveal directory: \(fileManager.outputDirectory.path)")
                                fileManager.revealInFinder(url: fileManager.outputDirectory)
                            }
                        }
                    } else {
                        // Show cancellation feedback
                        withAnimation {
                            processedFiles.append("⚠️ Processing cancelled by user")
                        }
                    }
                }
            }
            
            // Always clean up temp files regardless of success/cancel
            fileManager.cleanupTempFiles()
        }
        
        // Reset processing state
        withAnimation {
            isProcessing = false
            showBatchProgress = false
            isCancelling = false
            audioProcessor.progress = 0.0
            batchProgress = 0.0
            showProcessingParams = false
        }
    }
    
    // Function to cancel ongoing processing
    @MainActor
    private func cancelProcessing() async {
        if isProcessing {
            isCancelling = true
            cancellationManager.requestCancellation()
            
            // Alert the user that cancellation is in progress
            withAnimation {
                processedFiles.append("⚠️ Cancelling processing...")
            }
            
            // Reset audio processor state
            await MainActor.run {
                audioProcessor.isProcessing = false
                audioProcessor.progress = 0.0
            }
            
            // Allow time for ongoing tasks to detect the cancellation flag
            // Add a small delay to ensure the cancellation is detected
            try? await Task.sleep(nanoseconds: 500_000_000) // 0.5 seconds
            
            // Reset state
            withAnimation {
                isProcessing = false
                showBatchProgress = false
                isCancelling = false
                audioProcessor.progress = 0.0
                batchProgress = 0.0
                cancellationManager.reset()
            }
            
            // Clean up temp files immediately 
            fileManager.cleanupTempFiles()
        }
    }
    
    // Helper to convert Date to YYYYMMDD format
    private func dateToYYYYMMDD(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyyMMdd"
        return formatter.string(from: date)
    }

    private func showSuccessFeedback() {
        withAnimation {
            successOpacity = 1.0
            showSuccess = true
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
            withAnimation(.easeOut(duration: 2.5)) {
                successOpacity = 0.0
                showSuccess = false
            }
        }
    }
    
    // MARK: - Helper Methods
    
    /// Initialize audio optimizations for Mac App Store compatibility
    private func initializeAudioSystem() {
        // Initialize audio optimization system at app startup
        // This ensures all audio systems are warmed up and properly initialized
        
        // Use the shared optimizer instance
        Task {
            // Initialize in the background to avoid blocking UI
            _ = AudioProcessingOptimizer.shared
            
            // For M2 Macs that might be detected incorrectly
            #if DEBUG
            // For testing only - force disable model-specific optimizations for M2 models
            if !UserDefaults.standard.bool(forKey: "DisableHardwareSpecificOptimizationsSet") {
                let process = Process()
                process.executableURL = URL(fileURLWithPath: "/usr/sbin/sysctl")
                process.arguments = ["-n", "machdep.cpu.brand_string"]
                
                let pipe = Pipe()
                process.standardOutput = pipe
                
                do {
                    try process.run()
                    process.waitUntilExit()
                    
                    let data = pipe.fileHandleForReading.readDataToEndOfFile()
                    if let cpuInfo = String(data: data, encoding: .utf8)?.trimmingCharacters(in: .whitespacesAndNewlines) {
                        // If M2 processor is detected, automatically disable optimizations
                        if cpuInfo.contains("Apple M2") || cpuInfo.contains("Apple M3") {
                            print("M2/M3 processor detected - disabling potentially incorrect hardware optimizations")
                            UserDefaults.standard.set(true, forKey: "DisableHardwareSpecificOptimizations")
                            UserDefaults.standard.set(true, forKey: "DisableHardwareSpecificOptimizationsSet")
                        }
                    }
                } catch {
                    print("Error checking CPU info: \(error)")
                }
            }
            #endif
            
            // Log initialization
            if #available(macOS 10.12, *) {
                let logger = OSLog(subsystem: "com.hexbloop.audio", category: "Initialization")
                os_log("Initializing audio optimization systems", log: logger, type: .info)
            }
            
            // Let the system fully initialize
            try? await Task.sleep(nanoseconds: 500_000_000) // 0.5 seconds
            
            // Set low memory mode if needed based on system resources
            let memoryInfo = checkSystemMemory()
            if memoryInfo.percentAvailable < 0.2 { // Less than 20% available
                // Log memory constraint
                if #available(macOS 10.12, *) {
                    let logger = OSLog(subsystem: "com.hexbloop.audio", category: "Memory")
                    os_log("Low memory detected (%.1f%% available). Enabling memory optimizations.", 
                           log: logger, 
                           type: .info, 
                           memoryInfo.percentAvailable * 100)
                }
            }
        }
    }
    
    /// Check system memory and return memory information
    private func checkSystemMemory() -> (used: UInt64, available: UInt64, percentAvailable: Double) {
        var pagesize: vm_size_t = 0
        
        let host_port: mach_port_t = mach_host_self()
        var host_size = mach_msg_type_number_t(MemoryLayout<vm_statistics_data_t>.stride / MemoryLayout<integer_t>.stride)
        var vm_stat = vm_statistics_data_t()
        
        host_page_size(host_port, &pagesize)
        
        let status = withUnsafeMutablePointer(to: &vm_stat) {
            $0.withMemoryRebound(to: integer_t.self, capacity: Int(host_size)) {
                host_statistics(host_port, HOST_VM_INFO, $0, &host_size)
            }
        }
        
        if status != KERN_SUCCESS {
            return (0, 0, 1.0) // Default to assume memory is available if check fails
        }
        
        // Include inactive pages as available since macOS can reclaim them
        let mem_available = UInt64(vm_stat.free_count + vm_stat.inactive_count) * UInt64(pagesize)
        let mem_used = UInt64(vm_stat.active_count + vm_stat.wire_count) * UInt64(pagesize)
        let total = mem_available + mem_used
        
        // Calculate percentage of available memory (including inactive pages)
        let percentAvailable = total > 0 ? Double(mem_available) / Double(total) : 0.5
        
        return (mem_used, mem_available, percentAvailable)
    }
    
    /// Log current memory status for debugging
    private func logCurrentMemoryStatus() {
        // For app memory usage
        var info = mach_task_basic_info()
        var count = mach_msg_type_number_t(MemoryLayout<mach_task_basic_info>.size)/4
        
        let kerr: kern_return_t = withUnsafeMutablePointer(to: &info) {
            $0.withMemoryRebound(to: integer_t.self, capacity: 1) {
                task_info(mach_task_self_, task_flavor_t(MACH_TASK_BASIC_INFO), $0, &count)
            }
        }
        
        if kerr == KERN_SUCCESS {
            let appMemoryUsage = Double(info.resident_size) / 1024.0 / 1024.0
            
            // For system memory
            let systemMemory = checkSystemMemory()
            let freeMemoryMB = Double(systemMemory.available) / 1024.0 / 1024.0
            
            // Log memory stats
            print("Memory usage: \(Int(appMemoryUsage)) MB / \(Int(freeMemoryMB)) MB available")
            
            // Check if we're running low on memory
            if systemMemory.percentAvailable < 0.05 { // Less than 5% available (was 10%)
                // Force a cleanup only if it hasn't been done recently
                let now = Date()
                if lastMemoryCleanup == nil || (lastMemoryCleanup.map { now.timeIntervalSince($0) > 30 } ?? true) {
                    lastMemoryCleanup = now
                    autoreleasepool {
                        // Clear caches
                        AudioProcessingOptimizer.shared.clearCache()
                        
                        // Clean temp files
                        fileManager.cleanupTempFiles()
                        
                        // Suggest GC
                        #if DEBUG
                        print("⚠️ Low memory condition: forcing cleanup (won't cleanup again for 30 seconds)")
                        #endif
                    }
                }
            }
        }
    }
    
    /// Get current natural influences text
    private func getNaturalInfluencesText() -> String {
        let moonPhase = ProcessingParameters.getMoonPhaseDescription()
        let hourOfDay = Calendar.current.component(.hour, from: Date())
        let dayOfMonth = Calendar.current.component(.day, from: Date())
        
        let timeDesc: String
        if hourOfDay >= 5 && hourOfDay < 12 {
            timeDesc = "Morning"
        } else if hourOfDay >= 12 && hourOfDay < 18 {
            timeDesc = "Afternoon"
        } else if hourOfDay >= 18 && hourOfDay < 22 {
            timeDesc = "Evening"
        } else {
            timeDesc = "Night"
        }
        
        return "\(moonPhase) • \(timeDesc) • Day \(dayOfMonth)"
    }
    
    // Load file URL from provider with better error handling
    private func loadFileURL(from provider: NSItemProvider) async throws -> URL {
        // Use simple string identifier instead of UTType
        let fileURLType = "public.file-url"
        
        return try await withCheckedThrowingContinuation { continuation in
            // Check if provider can load this type
            guard provider.hasItemConformingToTypeIdentifier(fileURLType) else {
                continuation.resume(throwing: HexbloopError.invalidInput("Dropped item is not a file URL"))
                return
            }
            
            provider.loadItem(forTypeIdentifier: fileURLType, options: nil) { item, error in
                if let error = error {
                    continuation.resume(throwing: error)
                    return
                }
                
                // Handle different item types
                if let url = item as? URL {
                    continuation.resume(returning: url)
                } else if let data = item as? Data {
                    // Try to recover URL from data
                    if let urlString = String(data: data, encoding: .utf8),
                       let url = URL(string: urlString) {
                        continuation.resume(returning: url)
                    } else if let url = URL(dataRepresentation: data, relativeTo: nil) {
                        continuation.resume(returning: url)
                    } else {
                        continuation.resume(throwing: HexbloopError.invalidInput("Could not convert data to URL"))
                    }
                } else {
                    continuation.resume(throwing: HexbloopError.invalidInput("Unknown item type from drop operation"))
                }
            }
        }
    }
}

// MARK: - Helper Extensions

@MainActor
extension NSItemProvider {
    func loadFileURL() async throws -> URL? {
        guard let urlData = try await withCheckedThrowingContinuation({ (continuation: CheckedContinuation<Any?, Error>) in
            self.loadItem(forTypeIdentifier: UTType.fileURL.identifier, options: nil) { item, error in
                if let error = error {
                    continuation.resume(throwing: error)
                    return
                }
                continuation.resume(returning: item)
            }
        }) as? Data,
        let url = URL(dataRepresentation: urlData, relativeTo: nil) else {
            throw HexbloopError.invalidInput("Invalid file data")
        }
        return url
    }
}

// Extension to convert NSImage to PNG data
extension NSImage {
    func pngData() -> Data? {
        guard let tiffRepresentation = self.tiffRepresentation,
              let bitmapImage = NSBitmapImageRep(data: tiffRepresentation) else {
            return nil
        }
        return bitmapImage.representation(using: .png, properties: [:])
    }
}

struct Hexagon: Shape {
    func path(in rect: CGRect) -> Path {
        let width = rect.width
        let height = rect.height
        let points = [
            CGPoint(x: 0.5 * width, y: 0),
            CGPoint(x: width, y: 0.25 * height),
            CGPoint(x: width, y: 0.75 * height),
            CGPoint(x: 0.5 * width, y: height),
            CGPoint(x: 0, y: 0.75 * height),
            CGPoint(x: 0, y: 0.25 * height)
        ]

        var path = Path()
        path.move(to: points[0])
        points.dropFirst().forEach { path.addLine(to: $0) }
        path.closeSubpath()
        return path
    }
}

#Preview {
    ContentView()
}
