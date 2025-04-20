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
    @StateObject private var audioPlayer = AudioPlayer()
    @StateObject private var nameGenerator = NameGenerator()
    @StateObject private var audioProcessor = AudioProcessorService()
    @StateObject private var artGenerator = ArtGenerator()
    
    // MARK: - Processing State
    @State private var processedFiles: [String] = []
    @State private var isProcessing = false
    @State private var showSuccess = false
    @State private var successOpacity = 0.0
    @State private var pentagramRotation = 0.0
    @State private var showProcessingParams = false
    @State private var configuration = Configuration()
    @State private var processingParameters = ProcessingParameters()

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
            .blur(radius: 60)

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
                    .shadow(color: Color.purple.opacity(1.0), radius: glowPulse1 ? 120 : 90)
                    .opacity(glowPulse1 ? 0.9 : 0.7)
                    .scaleEffect(glowPulse1 ? 1.3 : 1.0)
                    .animation(
                        .easeInOut(duration: 2.5).repeatForever(autoreverses: true),
                        value: glowPulse1
                    )

                Hexagon()
                    .fill(LinearGradient(gradient: Gradient(colors: isHoveringOverHex ? [Color.purple, Color.purple.opacity(0.8)] : hexagonColors.reversed()), startPoint: .bottom, endPoint: .top))
                    .frame(width: 250, height: 250)
                    .shadow(color: Color.blue.opacity(0.9), radius: glowPulse2 ? 100 : 80)
                    .opacity(glowPulse2 ? 0.8 : 0.6)
                    .scaleEffect(glowPulse2 ? 1.2 : 1.0)
                    .animation(
                        .easeInOut(duration: 2.5).repeatForever(autoreverses: true),
                        value: glowPulse2
                    )

                Hexagon()
                    .fill(LinearGradient(gradient: Gradient(colors: innerHexagonColors), startPoint: .leading, endPoint: .trailing))
                    .frame(width: 200, height: 200)
                    .shadow(color: Color.orange.opacity(0.7), radius: glowPulse3 ? 90 : 60)
                    .opacity(glowPulse3 ? 0.7 : 0.5)
                    .scaleEffect(glowPulse3 ? 1.2 : 1.0)
                    .animation(
                        .easeInOut(duration: 3).repeatForever(autoreverses: true),
                        value: glowPulse3
                    )

                Text("\u{26E7}") // Pentagram
                    .font(.system(size: 120))
                    .foregroundColor(.white.opacity(0.4))
                    .shadow(color: .purple.opacity(0.9), radius: 40)
                    .rotationEffect(.degrees(isProcessing ? pentagramRotation : 0))
                    .animation(.linear(duration: 6), value: pentagramRotation)
                
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
                        
                    } label: {
                        Image(systemName: "gearshape.fill")
                            .font(.system(size: 20))
                            .foregroundColor(.white.opacity(0.7))
                            .padding(8)
                            .background(Color.black.opacity(0.4))
                            .clipShape(Circle())
                    }
                    .menuStyle(BorderlessButtonMenuStyle())
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
            if audioProcessor.isProcessing {
                VStack {
                    ProgressView(value: audioProcessor.progress)
                        .progressViewStyle(LinearProgressViewStyle())
                        .frame(width: 200)
                        .tint(.purple)
                        .background(Color.black.opacity(0.5))
                        .cornerRadius(10)
                        .padding()
                    
                    Text("Processing audio...")
                        .foregroundColor(.white)
                        .font(.caption)
                        .padding(.top, 5)
                }
                .background(Color.black.opacity(0.3))
                .cornerRadius(15)
                .padding()
            }
        }
        .onDrop(of: ["public.file-url"], isTargeted: $isHoveringOverHex) { providers in
            // Drop handling with better error capture
            Task {
                do {
                    await processDrop(providers: providers)
                } catch {
                    print("Error handling drop: \(error)")
                }
            }
            return true
        }
        .onAppear {
            // Start ambient audio
            audioPlayer.startAmbientLoop()
            
            // Start visual effects
            glowPulse1.toggle()
            glowPulse2.toggle()
            glowPulse3.toggle()
            
            // Initialize audio optimizations
            initializeAudioSystem()
        }
    }

    // MARK: - Audio Processing

    @MainActor
    private func processDrop(providers: [NSItemProvider]) async {
        // Don't process if already processing
        guard !isProcessing else {
            print("🚫 Already processing a file, please wait")
            return
        }
        
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
                                continuation.resume(throwing: NSError(domain: "HexbloopError", code: 0, userInfo: [NSLocalizedDescriptionKey: "Could not load file URL"]))
                            }
                        }
                    }
                }
                
                guard let inputURL = inputURL else {
                    withAnimation {
                        processedFiles.append("Error: Invalid file")
                    }
                    continue
                }
                
                // Check if it's an audio file by extension
                let validExtensions = ["mp3", "wav", "m4a", "aac", "aif", "aiff", "flac"]
                guard validExtensions.contains(inputURL.pathExtension.lowercased()) else {
                    withAnimation {
                        processedFiles.append("Error: Not an audio file")
                    }
                    continue
                }
                
                // Add to valid files
                validFiles.append((inputURL, glitchedName))
                
            } catch {
                print("❌ Error reading file: \(error.localizedDescription)")
                withAnimation {
                    processedFiles.append("Error: Could not read file")
                }
            }
        }
        
        // If we have valid files, generate parameters
        if !validFiles.isEmpty {
            // Generate processing parameters with natural influences
            processingParameters = ProcessingParameters.generateWithMoonPhaseInfluence()
            showProcessingParams = true
            
            // Process each valid file sequentially
            for (inputURL, glitchedName) in validFiles {
                do {
                    // Create output file path
                    // Determine output format:
                    // - MP3: Great compatibility but slightly lower quality
                    // - M4A: Better quality, good metadata support, less compatibility with some systems
                    let outputExtension = "mp3" // Default to MP3 as in the original script for max compatibility
                    let finalOutputURL = fileManager.generateUniqueOutputPath(
                        baseName: glitchedName,
                        fileExtension: outputExtension
                    )
                    
                    // Generate artwork for the processed file
                    let artworkURL = artGenerator.generateArtwork(
                        for: glitchedName,
                        to: fileManager.outputDirectory
                    )
                    
                    // Process audio using our enhanced MacAudioEngine
                    let engine = MacAudioEngine()
                    let success = try await engine.processAudioFile(
                        at: inputURL,
                        to: finalOutputURL,
                        with: processingParameters
                    ) { progress in
                        // Update our progress on the main actor
                        Task { @MainActor in
                            audioProcessor.progress = progress
                        }
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
                            processedFiles.append(glitchedName)
                        }
                    } else {
                        throw NSError(domain: "HexbloopError", code: 1, userInfo: [NSLocalizedDescriptionKey: "Failed to process audio"])
                    }
                } catch {
                    print("❌ Audio processing failed: \(error.localizedDescription)")
                    
                    // Show error to the user
                    withAnimation {
                        let errorMsg = "Error processing: \(glitchedName)"
                        processedFiles.append(errorMsg)
                    }
                }
            }
            
            // After all files are processed, show success and open output folder
            if !processedFiles.isEmpty {
                withAnimation {
                    showSuccessFeedback()
                    
                    // Open Finder to show the output directory
                    DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                        fileManager.revealInFinder(url: fileManager.outputDirectory)
                    }
                }
            }
        }
        
        // Reset processing state
        isProcessing = false
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
            let optimizer = AudioProcessingOptimizer.shared
            
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
        
        let mem_free = UInt64(vm_stat.free_count) * UInt64(pagesize)
        let mem_used = UInt64(vm_stat.active_count + vm_stat.inactive_count + vm_stat.wire_count) * UInt64(pagesize)
        let total = mem_free + mem_used
        
        // Calculate percentage of available memory
        let percentAvailable = total > 0 ? Double(mem_free) / Double(total) : 0.0
        
        return (mem_used, mem_free, percentAvailable)
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
                continuation.resume(throwing: NSError(
                    domain: "HexbloopError",
                    code: 1,
                    userInfo: [NSLocalizedDescriptionKey: "Dropped item is not a file URL"]
                ))
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
                        continuation.resume(throwing: NSError(
                            domain: "HexbloopError",
                            code: 2,
                            userInfo: [NSLocalizedDescriptionKey: "Could not convert data to URL"]
                        ))
                    }
                } else {
                    continuation.resume(throwing: NSError(
                        domain: "HexbloopError",
                        code: 3,
                        userInfo: [NSLocalizedDescriptionKey: "Unknown item type from drop operation"]
                    ))
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
            throw NSError(domain: "FileProcessing", code: 0, userInfo: [NSLocalizedDescriptionKey: "Invalid file data"]) as Error
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
