import SwiftUI
import AVFoundation
import UniformTypeIdentifiers
import CoreImage.CIFilterBuiltins
import GameKit
// Add FFmpegKit import when dependency is added
// import FFmpegKit

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

// MARK: - NameGenerator with Enhanced Word Lists
class NameGenerator: ObservableObject {
    // Core word lists for name generation
    private let prefixes = [
        "GLITTER", "CRYPT", "LUNAR", "SHADOW", "FROST", "NEBULA", "PHANTOM", "SOLAR", 
        "TWILIGHT", "EMBER", "CYBER", "DIGITAL", "VIRTUAL", "NEURAL", "BINARY", "ATOMIC", 
        "VECTOR", "MATRIX", "CIRCUIT", "SYNTHETIC", "ARTIFICIAL", "MECHANICAL", "ELECTRONIC", 
        "BIONIC", "TECHNO", "NANO", "MEGA", "HYPER", "ULTRA", "PROTO", "NEO", "POST",
        "DARK", "BLACK", "SHADOW", "NIGHT", "OCCULT", "MYSTIC", "ARCANE", "ESOTERIC", 
        "HERMETIC", "DEMONIC", "DIABOLIC", "INFERNAL", "ABYSSAL", "STYGIAN", "FORBIDDEN", 
        "HIDDEN", "SECRET", "VEILED", "OBSCURE", "CRYPTIC", "STORM", "THUNDER", "LIGHTNING"
    ]
    
    private let suffixes = [
        "RITUAL", "MACHINE", "VECTOR", "CIPHER", "NOISE", "SPECTRUM", "ECHO", "WAVE", 
        "SPHERE", "FLARE", "DEATH", "BLOOD", "VOID", "GHOST", "WITCH", "STORM", "DOOM", 
        "DEMON", "DRAGON", "SHADOW", "MOON", "STAR", "SUN", "WOLF", "SNAKE", "CROW", 
        "CIRCUIT", "SYSTEM", "MATRIX", "CODE", "DATA", "SIGNAL", "VIRUS", "NETWORK", 
        "BINARY", "MACHINE", "ROBOT", "CYBER", "DIGITAL", "VIRTUAL", "NEURAL", "QUANTUM"
    ]
    
    private let verbStarters = [
        "CRUSHING", "BURNING", "DESTROYING", "SMASHING", "BREAKING", "SHATTERING",
        "RIPPING", "TEARING", "BLASTING", "EXPLODING", "DECIMATING", "SLAYING",
        "GLITCHING", "CORRUPTING", "PROCESSING", "COMPUTING", "PROGRAMMING", "CODING",
        "HACKING", "SCANNING", "LOADING", "BUFFERING", "COMPILING", "ENCRYPTING"
    ]
    
    private let witchHouseSymbols = ["†", "‡", "✟", "✞", "☨", "✝", "✠", "✚", "▲", "△"]
    
    // Get current hour to influence naming
    private var hourOfDay: Int {
        Calendar.current.component(.hour, from: Date())
    }
    
    func generateName() -> String {
        let useDarkMode = hourOfDay >= 20 || hourOfDay <= 6
        let useVerb = Int.random(in: 1...100) <= 30
        
        // Choose prefix based on time and randomness
        let prefix: String
        if useVerb {
            prefix = verbStarters.randomElement() ?? "GLITCHING"
        } else {
            prefix = prefixes.randomElement() ?? "CYBER"
        }
        
        let suffix = suffixes.randomElement() ?? "PULSE"
        let number = Int.random(in: 1000...9999)
        
        // Add witch house symbols at night
        let name: String
        if useDarkMode && Int.random(in: 1...100) <= 40 {
            let symbol = witchHouseSymbols.randomElement() ?? "†"
            name = "\(symbol)\(prefix)\(suffix)\(number)\(symbol)"
        } else {
            name = "\(prefix)\(suffix)\(number)"
        }
        
        return name
    }
}

// MARK: - AudioConverter with FFmpeg Integration and Moon Phase Influence
class AudioConverter {
    var useFFmpeg = false  // Set to true when FFmpegKit is available
    // Calculate moon phase (0-100%)
    private func calculateMoonPhase() -> Int {
        // Lunar period in seconds (29.53 days)
        let lunarPeriodSeconds: TimeInterval = 29.53 * 24 * 60 * 60
        
        // Known new moon reference date (January 6, 2022 18:33 UTC)
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd HH:mm"
        formatter.timeZone = TimeZone(abbreviation: "UTC")
        let referenceNewMoon = formatter.date(from: "2022-01-06 18:33")!
        
        // Calculate time since reference new moon
        let timeSinceReference = Date().timeIntervalSince(referenceNewMoon)
        
        // Calculate current phase percentage (0-100)
        let phase = (timeSinceReference.truncatingRemainder(dividingBy: lunarPeriodSeconds)) / lunarPeriodSeconds * 100
        
        return Int(phase)
    }
    
    // Get current moon phase description
    private var moonPhaseDescription: String {
        let phase = calculateMoonPhase()
        if phase >= 95 || phase <= 5 {
            return "Full Moon"
        } else if phase >= 45 && phase <= 55 {
            return "New Moon"
        } else if phase > 5 && phase < 45 {
            return "Waxing Moon"
        } else {
            return "Waning Moon"
        }
    }
    
    // Get current hour of day (0-23)
    private var hourOfDay: Int {
        Calendar.current.component(.hour, from: Date())
    }
    
    // Get day of month (1-31)
    private var dayOfMonth: Int {
        Calendar.current.component(.day, from: Date())
    }
    
    // Generate a seeded random source based on natural factors
    private func createRandomSource() -> GKMersenneTwisterRandomSource {
        let moonPhase = calculateMoonPhase()
        let hour = hourOfDay
        let day = dayOfMonth
        
        // Create a deterministic seed based on natural factors
        let seed = UInt64((moonPhase * 100) + (hour * 10) + day)
        return GKMersenneTwisterRandomSource(seed: seed)
    }
    
    // Generate FFmpeg processing parameters based on natural influences
    func generateProcessingParameters() -> ProcessingParameters {
        let moonPhase = calculateMoonPhase()
        let randomSource = createRandomSource()
        
        // Base parameters that will be influenced by natural factors
        var params = ProcessingParameters()
        
        // Moon phase influences the overall processing style
        if moonPhase >= 95 || moonPhase <= 5 {
            // Full Moon - Bright, clear, ethereal
            params.highPassFreq = Float(randomSource.nextInt(upperBound: 100) + 100) // 100-200 Hz
            params.lowPassFreq = 16000 // High frequency ceiling
            params.reverb = 0.2 // Light reverb
            params.delay = 0.0 // No delay
            params.compression = 2.0 // Light compression
            params.gainDb = 3.0 // Slight boost
        } else if moonPhase >= 45 && moonPhase <= 55 {
            // New Moon - Dark, mysterious, heavy
            params.highPassFreq = Float(randomSource.nextInt(upperBound: 50) + 20) // 20-70 Hz
            params.lowPassFreq = Float(randomSource.nextInt(upperBound: 2000) + 6000) // 6000-8000 Hz
            params.reverb = 0.8 // Heavy reverb
            params.delay = 0.3 // Medium delay
            params.compression = 5.0 // Heavy compression
            params.gainDb = -1.0 // Slight reduction
        } else if moonPhase > 5 && moonPhase < 45 {
            // Waxing Moon - Growing, building intensity
            params.highPassFreq = Float(randomSource.nextInt(upperBound: 60) + 40) // 40-100 Hz
            params.lowPassFreq = Float(randomSource.nextInt(upperBound: 4000) + 8000) // 8000-12000 Hz
            params.reverb = 0.4 // Medium reverb
            params.delay = 0.1 // Light delay
            params.compression = 3.0 // Medium compression
            params.gainDb = 2.0 // Medium boost
        } else {
            // Waning Moon - Receding, mellower
            params.highPassFreq = Float(randomSource.nextInt(upperBound: 80) + 60) // 60-140 Hz
            params.lowPassFreq = Float(randomSource.nextInt(upperBound: 3000) + 7000) // 7000-10000 Hz
            params.reverb = 0.5 // Medium reverb
            params.delay = 0.2 // Medium delay
            params.compression = 3.5 // Medium-heavy compression
            params.gainDb = 0.0 // Neutral gain
        }
        
        // Time of day influences specific effects
        if hourOfDay >= 22 || hourOfDay < 6 {
            // Night - Darker, heavier processing
            params.reverb += 0.2
            params.lowPassFreq -= 1000 // Reduce high frequencies
            params.saturation = 1.5 // More saturation
        } else if hourOfDay >= 6 && hourOfDay < 12 {
            // Morning - Clearer, brighter
            params.reverb -= 0.1
            params.highPassFreq += 20 // Less low end
            params.gainDb += 1.0 // Slightly brighter
        }
        
        // Day of month influences subtle randomness
        let dayInfluence = Float(dayOfMonth) / 31.0
        params.pitchShift = (dayInfluence * 2.0) - 1.0 // -1.0 to 1.0
        
        return params
    }
    
    func processAudio(at inputURL: URL, to outputURL: URL) async throws {
        // Let the moon phase influence processing parameters
        let moonPhase = calculateMoonPhase()
        print("🌙 Processing under \(moonPhaseDescription) (\(moonPhase)%)")
        
        // Check if FFmpegKit is available (will be false until the package is added)
        let ffmpegAvailable = false // Change to true after importing FFmpegKit
        
        if ffmpegAvailable && useFFmpeg {
            try await processWithFFmpeg(inputURL: inputURL, outputURL: outputURL)
        } else {
            if useFFmpeg && !ffmpegAvailable {
                print("⚠️ FFmpeg processing requested but FFmpegKit is not available. Falling back to AVFoundation.")
            }
            // Fallback to AVFoundation
            try await processWithAVFoundation(inputURL: inputURL, outputURL: outputURL)
        }
    }
    
    // Process audio with AVFoundation (basic conversion)
    private func processWithAVFoundation(inputURL: URL, outputURL: URL) async throws {
        let asset = AVURLAsset(url: inputURL)
        
        guard let exportSession = AVAssetExportSession(
            asset: asset,
            presetName: AVAssetExportPresetAppleM4A
        ) else {
            throw NSError(domain: "AudioProcessing", code: 1, userInfo: [NSLocalizedDescriptionKey: "Could not create export session"]) as Error
        }

        exportSession.outputURL = outputURL
        exportSession.outputFileType = .m4a

        print("🎵 Starting basic conversion (FFmpeg not available)...")
        await exportSession.export()

        if let error = exportSession.error {
            print("❌ Export error: \(error.localizedDescription)")
            throw error as Error
        }

        print("✨ Basic conversion complete: \(outputURL.lastPathComponent)")
    }
    
    // Process audio with FFmpeg (advanced processing)
    private func processWithFFmpeg(inputURL: URL, outputURL: URL) async throws {
        print("🎛️ Starting FFmpeg advanced processing...")
        
        // Generate processing parameters based on natural influences
        let params = generateProcessingParameters()
        print("📊 Processing parameters: \(params)")
        
        // For now just log the parameters - FFmpegKit implementation will be added later
        // This would be replaced with actual FFmpegKit code when the package is added
        /* 
        // Example of how the FFmpegKit implementation would look:
        let ffmpegCommand = buildFFmpegCommand(
            inputURL: inputURL,
            outputURL: outputURL,
            params: params
        )
        
        let session = FFmpegKit.executeAsync(ffmpegCommand) { session in
            guard let returnCode = session?.getReturnCode() else {
                print("❌ FFmpegKit session error: No return code")
                return
            }
            
            if ReturnCode.isSuccess(returnCode) {
                print("✨ FFmpeg processing complete: \(outputURL.lastPathComponent)")
            } else {
                print("❌ FFmpeg processing error: \(session?.getFailStackTrace() ?? "Unknown error")")
            }
        }
        
        // Wait for FFmpeg processing to complete
        await withCheckedContinuation { continuation in
            session.setCompleteCallback {
                continuation.resume()
            }
        }
        */
        
        // Until FFmpegKit is added, fall back to basic AVFoundation processing
        try await processWithAVFoundation(inputURL: inputURL, outputURL: outputURL)
    }
    
    // Build FFmpeg command with the processing parameters
    private func buildFFmpegCommand(inputURL: URL, outputURL: URL, params: ProcessingParameters) -> String {
        // Two-stage processing: first add vintage character, then mastering
        
        // Stage 1: Add vintage character with filters based on natural influences
        let vintageFX = [
            // High-pass filter to remove rumble
            "highpass=f=\(params.highPassFreq)",
            
            // Low-pass filter to roll off highs (vintage character)
            "lowpass=f=\(params.lowPassFreq)",
            
            // Add subtle pitch shift based on day of month
            "rubberband=pitch=\(1.0 + params.pitchShift/12.0)",
            
            // Add vintage saturation/distortion
            "volume=\(1.0 + params.saturation)",
            
            // Add tape-like compression
            "compand=0.3|0.3:1|1:-90/-\(params.compression)|-30/-\(params.compression)|-16/-16|0/-6|20/0:6:0.2:0:0"
        ].joined(separator: ",")
        
        // Stage 2: Mastering chain
        let masteringFX = [
            // Reverb based on natural influences
            "aecho=0.8:\(params.reverb):1000|\(Int(500 + params.reverb * 1000)):0.5",
            
            // Delay if applicable
            params.delay > 0 ? "adelay=\(Int(params.delay * 1000))|all=1" : "",
            
            // Multiband compression for master bus
            "compand=0.3|0.3:1|1:-90/-900|-70/-70|-30/-9|-20/-6|0/-3|20/0:6:0:0:0",
            
            // Final gain adjustment
            "volume=\(params.gainDb)dB"
        ].filter { !$0.isEmpty }.joined(separator: ",")
        
        // Construct full FFmpeg command with both processing stages
        let command = "-i \"\(inputURL.path)\" -filter_complex \"[0:a]\(vintageFX)[vintage]; [vintage]\(masteringFX)[out]\" -map \"[out]\" -c:a aac -b:a 256k \"\(outputURL.path)\""
        
        return command
    }
}

// Structure to hold audio processing parameters
struct ProcessingParameters: CustomStringConvertible {
    var highPassFreq: Float = 80.0  // High-pass filter frequency (Hz)
    var lowPassFreq: Float = 12000.0 // Low-pass filter frequency (Hz)
    var reverb: Float = 0.3         // Reverb amount (0.0-1.0)
    var delay: Float = 0.0          // Delay amount (0.0-1.0)
    var compression: Float = 3.0    // Compression amount (1.0-6.0)
    var saturation: Float = 0.5     // Saturation/distortion amount (0.0-2.0)
    var pitchShift: Float = 0.0     // Pitch shift in semitones (-1.0 to 1.0)
    var gainDb: Float = 0.0         // Output gain in dB
    
    var description: String {
        return "HighPass: \(highPassFreq)Hz, LowPass: \(lowPassFreq)Hz, Reverb: \(reverb), " +
               "Delay: \(delay), Compression: \(compression), Saturation: \(saturation), " +
               "PitchShift: \(pitchShift), Gain: \(gainDb)dB"
    }
}

// MARK: - ContentView
struct ContentView: View {
    @StateObject private var audioPlayer = AudioPlayer()
    @StateObject private var nameGenerator = NameGenerator()
    @State private var processedFiles: [String] = []
    @State private var isProcessing = false
    @State private var showSuccess = false
    @State private var successOpacity = 0.0
    @State private var pentagramRotation = 0.0
    @State private var showProcessingParams = false
    @State private var lastProcessingParams: ProcessingParameters?
    @State private var useFFmpegProcessing = false // Will be used when FFmpegKit is available

    @State private var isHoveringOverHex = false

    @State private var backgroundColors: [Color] = [Color.black.opacity(0.9), Color.gray.opacity(0.8), Color.blue.opacity(0.7)]
    @State private var hexagonColors: [Color] = [Color.purple.opacity(0.7), Color.pink.opacity(0.6)]
    @State private var innerHexagonColors: [Color] = [Color.yellow.opacity(0.5), Color.orange.opacity(0.5)]

    @State private var glowPulse1 = false
    @State private var glowPulse2 = false
    @State private var glowPulse3 = false

    private let backgroundColor = Color(red: 0.05, green: 0.05, blue: 0.1)

    private let audioConverter = AudioConverter()

    private var outputDirectory: URL {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("HexbloopOutput", isDirectory: true)
    }

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

            // Grain Texture Overlay
            Image("grain")
                .resizable()
                .ignoresSafeArea()
                .blendMode(.overlay)
                .opacity(0.2)

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

            // MARK: - Controls and FFmpeg Toggle
            VStack {
                // Add when FFmpeg is available
                HStack {
                    Toggle("FFmpeg Processing", isOn: $useFFmpegProcessing)
                        .foregroundColor(.white.opacity(0.7))
                        .font(.system(size: 14, weight: .medium))
                        .disabled(true) // Enable this when FFmpegKit is added
                        .padding(.horizontal, 20)
                }
                .padding(.top, 10)
                .opacity(0.6) // Dim until FFmpeg is available
                
                Spacer()
                
                // Processing parameters display
                if showProcessingParams, let params = lastProcessingParams {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Processing Parameters:")
                            .foregroundColor(.white.opacity(0.8))
                            .font(.system(size: 12, weight: .bold))
                        
                        Text("Compression: \(String(format: "%.1f", params.compression))")
                            .foregroundColor(.white.opacity(0.7))
                            .font(.system(size: 10))
                        
                        Text("Filters: \(Int(params.highPassFreq))Hz - \(Int(params.lowPassFreq))Hz")
                            .foregroundColor(.white.opacity(0.7))
                            .font(.system(size: 10))
                        
                        Text("Reverb: \(String(format: "%.1f", params.reverb)) • Delay: \(String(format: "%.1f", params.delay))")
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
        }
        .onDrop(of: [UTType.fileURL.identifier], isTargeted: $isHoveringOverHex) { providers in
            Task {
                await processDrop(providers: providers)
            }
            return true
        }
        .onAppear {
            setupDirectory()
            audioPlayer.startAmbientLoop()
            glowPulse1.toggle()
            glowPulse2.toggle()
            glowPulse3.toggle()
        }
    }

    private func setupDirectory() {
        do {
            try FileManager.default.createDirectory(at: outputDirectory, withIntermediateDirectories: true)
            print("✨ Directory created successfully at: \(outputDirectory.path)")
        } catch {
            print("❌ Error creating directory: \(error)")
        }
    }

    @MainActor
    private func processDrop(providers: [NSItemProvider]) async {
        for provider in providers {
            do {
                isProcessing = true
                pentagramRotation += 360

                // Generate a name for the file
                let generatedName = nameGenerator.generateName()

                // Create the output URL by appending the file name to the output directory
                let outputURL = outputDirectory.appendingPathComponent("\(generatedName).m4a")

                // Process the input file and save it to the output directory
                if let inputURL = try await provider.loadFileURL() {
                    // Set the FFmpeg processing flag (will work when FFmpegKit is added and enabled)
                    audioConverter.useFFmpeg = useFFmpegProcessing
                    
                    // Generate and capture processing parameters
                    lastProcessingParams = audioConverter.generateProcessingParameters()
                    showProcessingParams = true
                    
                    // Process the audio
                    try await audioConverter.processAudio(at: inputURL, to: outputURL)

                    withAnimation {
                        processedFiles.append(generatedName)
                        showSuccessFeedback()
                    }
                }
            } catch {
                print("❌ Error processing file: \(error)")
            }
        }
        isProcessing = false
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
    
    /// Get current natural influences text
    private func getNaturalInfluencesText() -> String {
        let moonPhase = calculateMoonPhase()
        let hourOfDay = Calendar.current.component(.hour, from: Date())
        let dayOfMonth = Calendar.current.component(.day, from: Date())
        
        let moonDesc: String
        if moonPhase >= 95 || moonPhase <= 5 {
            moonDesc = "Full Moon"
        } else if moonPhase >= 45 && moonPhase <= 55 {
            moonDesc = "New Moon"
        } else if moonPhase > 5 && moonPhase < 45 {
            moonDesc = "Waxing Moon"
        } else {
            moonDesc = "Waning Moon"
        }
        
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
        
        return "\(moonDesc) • \(timeDesc) • Day \(dayOfMonth)"
    }
    
    /// Calculate current moon phase (0-100%)
    private func calculateMoonPhase() -> Int {
        // Lunar period in seconds (29.53 days)
        let lunarPeriodSeconds: TimeInterval = 29.53 * 24 * 60 * 60
        
        // Known new moon reference date (January 6, 2022 18:33 UTC)
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd HH:mm"
        formatter.timeZone = TimeZone(abbreviation: "UTC")
        let referenceNewMoon = formatter.date(from: "2022-01-06 18:33")!
        
        // Calculate time since reference new moon
        let timeSinceReference = Date().timeIntervalSince(referenceNewMoon)
        
        // Calculate current phase percentage (0-100)
        let phase = (timeSinceReference.truncatingRemainder(dividingBy: lunarPeriodSeconds)) / lunarPeriodSeconds * 100
        
        return Int(phase)
    }
}

extension NSItemProvider {
    func loadFileURL() async throws -> URL? {
        guard let urlData = try await loadItem(forTypeIdentifier: UTType.fileURL.identifier, options: nil) as? Data,
              let url = URL(dataRepresentation: urlData, relativeTo: nil) else {
            throw NSError(domain: "FileProcessing", code: 0, userInfo: [NSLocalizedDescriptionKey: "Invalid file data"]) as Error
        }
        return url
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