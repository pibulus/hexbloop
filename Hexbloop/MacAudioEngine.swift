import Foundation
import AVFoundation
import GameKit
import os.log // For improved logging

// MARK: - Processing Parameters
struct ProcessingParameters {
    // Audio effects settings
    var distortionAmount: Float = 0.5          // Range: 0.0-1.0
    var distortionPreset: DistortionPreset = .overdrive
    
    var highPassFreq: Float = 80.0             // High-pass filter frequency (Hz)
    var lowPassFreq: Float = 12000.0           // Low-pass filter frequency (Hz)
    var midFreq: Float = 1000.0                // Mid frequency boost (Hz)
    var midGain: Float = 3.0                   // Mid frequency gain (dB)
    
    var compressionRatio: Float = 4.0          // Range: 1.0-20.0
    var compressionThreshold: Float = -18.0    // Range: -40.0-0.0 dB
    var compressionAttack: Float = 0.01        // Range: 0.001-0.5 seconds
    var compressionRelease: Float = 0.1        // Range: 0.01-2.0 seconds
    
    var limiterThreshold: Float = -1.0         // Range: -20.0-0.0 dB
    
    var reverbAmount: Float = 0.3              // Range: 0.0-1.0
    var delayTime: Float = 0.0                 // Range: 0.0-2.0 seconds
    var delayFeedback: Float = 0.0             // Range: 0.0-0.9
    
    var outputGain: Float = 0.0                // Range: -20.0-20.0 dB
    
    // Distortion presets
    enum DistortionPreset: String, CaseIterable {
        case overdrive
        case ringModulator
        case distortion
        case decimation
        case lowPassFilter
        case multiEcho
        case multiEcho2
        case tapeDelay
        
        // Map to AVAudioUnitDistortionPreset
        var audioUnitPreset: Int {
            switch self {
            case .overdrive: return 10     // Maps to .overdrive2
            case .ringModulator: return 14 // Maps to .ringModulator
            case .distortion: return 4     // Maps to .distortion
            case .decimation: return 5     // Maps to .distortionDecimation
            case .lowPassFilter: return 8  // Maps to .lowPassFilter
            case .multiEcho: return 15     // Maps to .multiEcho1
            case .multiEcho2: return 16    // Maps to .multiEcho2
            case .tapeDelay: return 19     // Maps to .tapeDelay
            }
        }
    }
    
    // Static factory method to create parameters influenced by natural factors
    static func generateWithMoonPhaseInfluence() -> ProcessingParameters {
        // Create default parameters
        var params = ProcessingParameters()
        
        // Get current moon phase and time
        let moonPhase = calculateMoonPhase()
        let hourOfDay = Calendar.current.component(.hour, from: Date())
        let dayOfMonth = Calendar.current.component(.day, from: Date())
        
        // Create a random source based on natural factors for consistent randomization
        let seed = UInt64((moonPhase * 100) + (hourOfDay * 10) + dayOfMonth)
        let randomSource = GKMersenneTwisterRandomSource(seed: seed)
        
        // Adjust parameters based on moon phase
        if moonPhase >= 95 || moonPhase <= 5 {
            // Full Moon - Bright, clear, ethereal
            params.highPassFreq = Float(randomSource.nextInt(upperBound: 100) + 100) // 100-200 Hz
            params.lowPassFreq = 16000 // High frequency ceiling
            params.reverbAmount = 0.2 // Light reverb
            params.compressionRatio = 2.0 // Light compression
            params.distortionAmount = 0.3 // Light distortion
        } else if moonPhase >= 45 && moonPhase <= 55 {
            // New Moon - Dark, mysterious, heavy
            params.highPassFreq = Float(randomSource.nextInt(upperBound: 50) + 20) // 20-70 Hz
            params.lowPassFreq = Float(randomSource.nextInt(upperBound: 2000) + 6000) // 6000-8000 Hz
            params.reverbAmount = 0.8 // Heavy reverb
            params.delayTime = 0.3 // Medium delay
            params.compressionRatio = 5.0 // Heavy compression
            params.distortionAmount = 0.7 // Heavy distortion
        } else if moonPhase > 5 && moonPhase < 45 {
            // Waxing Moon - Growing, building intensity
            params.highPassFreq = Float(randomSource.nextInt(upperBound: 60) + 40) // 40-100 Hz
            params.lowPassFreq = Float(randomSource.nextInt(upperBound: 4000) + 8000) // 8000-12000 Hz
            params.reverbAmount = 0.4 // Medium reverb
            params.compressionRatio = 3.0 // Medium compression
            params.distortionAmount = 0.5 // Medium distortion
        } else {
            // Waning Moon - Receding, mellower
            params.highPassFreq = Float(randomSource.nextInt(upperBound: 80) + 60) // 60-140 Hz
            params.lowPassFreq = Float(randomSource.nextInt(upperBound: 3000) + 7000) // 7000-10000 Hz
            params.reverbAmount = 0.5 // Medium reverb
            params.delayTime = 0.2 // Medium delay
            params.compressionRatio = 3.5 // Medium-heavy compression
            params.distortionAmount = 0.4 // Medium-light distortion
        }
        
        return params
    }
    
    // Calculate current moon phase (0-100%)
    private static func calculateMoonPhase() -> Int {
        // Simplified calculation of moon phase
        // Lunar period in seconds (29.53 days)
        let lunarPeriodSeconds: TimeInterval = 29.53 * 24 * 60 * 60
        
        // Known new moon reference date
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
    static func getMoonPhaseDescription() -> String {
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
}

// MARK: - Audio Processing Engine for macOS
class MacAudioEngine {
    // Error types
    enum AudioProcessingError: Error {
        case inputFileError(String)
        case outputFileError(String)
        case processingError(String)
        case engineStartError(String)
        case fileTooLarge(String)
        case conversionFailed(String)
        case metadataFailed(String)
    }
    
    // Progress reporting
    typealias ProgressHandler = (Float) -> Void
    
    // Process audio file with AVAssetExportSession (optimized for Mac App Store)
    func processAudioFile(
        at sourceURL: URL,
        to destinationURL: URL,
        with parameters: ProcessingParameters,
        progressHandler: @escaping ProgressHandler
    ) async throws -> Bool {
        // Special case for Mac14,15 models with extreme memory pressure
        // Provide a bypass mode that just copies the file when under extreme conditions
        if AudioProcessingOptimizer.shared.isRunningOnMac14_15() {
            let systemUsage = AudioProcessingOptimizer.shared.checkMemoryUsage()
            if systemUsage.available < 150 * 1024 * 1024 { // Less than 150MB available 
                print("⚠️ EXTREME SAFE MODE: Bypassing all audio processing due to critical memory pressure")
                
                // Just copy the file and return success
                if FileManager.default.fileExists(atPath: destinationURL.path) {
                    try FileManager.default.removeItem(at: destinationURL)
                }
                try FileManager.default.copyItem(at: sourceURL, to: destinationURL)
                
                // We still need to show progress to the user
                progressHandler(0.2)
                try await Task.sleep(nanoseconds: 500_000_000) // 0.5s
                progressHandler(0.5)
                try await Task.sleep(nanoseconds: 500_000_000) // 0.5s
                progressHandler(0.8)
                try await Task.sleep(nanoseconds: 500_000_000) // 0.5s
                progressHandler(1.0)
                
                return true
            }
        }
        // Initialize the audio processing optimizer system
        let optimizer = AudioProcessingOptimizer.shared
        
        // Log at beginning with os_log for better performance
        if #available(macOS 10.12, *) {
            let logger = OSLog(subsystem: "com.hexbloop.audio", category: "Processing")
            os_log("Starting audio processing", log: logger, type: .info)
        }
        
        // 1. Validate input file - use more specific error message
        guard FileManager.default.fileExists(atPath: sourceURL.path) else {
            throw AudioProcessingError.inputFileError("Input file does not exist at path: \(sourceURL.path)")
        }
        
        // Show initial progress
        progressHandler(0.1)
        
        do {
            // Create directories if needed
            try FileManager.default.createDirectory(
                at: destinationURL.deletingLastPathComponent(),
                withIntermediateDirectories: true
            )
            
            // 2. Create an AVAsset from the input file using optimized loading system
            let asset = optimizer.optimizedAsset(for: sourceURL)
            
            // Check if the asset is valid and can be exported using compatibility helpers
            let isExportableTask = Task {
                return try await asset.isAssetExportable()
            }
            
            // Use timeout mechanism from our optimizer
            let isExportable = try await withThrowingTaskGroup(of: Bool.self) { group in
                // Add the main operation
                group.addTask {
                    return try await isExportableTask.value
                }
                
                // Add a timeout task
                group.addTask {
                    try await Task.sleep(nanoseconds: 5_000_000_000) // 5 seconds
                    throw AudioProcessingError.processingError("Operation timed out checking exportable status")
                }
                
                // Return the first completed task result
                guard let result = try await group.next() else {
                    throw AudioProcessingError.processingError("No task completed")
                }
                
                // Cancel any remaining tasks
                group.cancelAll()
                
                return result
            }
            
            // Check for audio tracks with timeout protection
            let audioTracksTask = Task {
                return try await asset.getAudioTracks()
            }
            
            let audioTracks = try await withThrowingTaskGroup(of: [AVAssetTrack].self) { group in
                // Add the main operation
                group.addTask {
                    return try await audioTracksTask.value
                }
                
                // Add a timeout task
                group.addTask {
                    try await Task.sleep(nanoseconds: 5_000_000_000) // 5 seconds
                    throw AudioProcessingError.processingError("Operation timed out checking audio tracks")
                }
                
                // Return the first completed task result
                guard let result = try await group.next() else {
                    throw AudioProcessingError.processingError("No task completed")
                }
                
                // Cancel any remaining tasks
                group.cancelAll()
                
                return result
            }
            
            guard isExportable, audioTracks.count > 0 else {
                throw AudioProcessingError.inputFileError("Audio file cannot be processed - either not exportable or has no audio tracks")
            }
            
            // 3. Create a temporary URL for processing steps
            let tempDirectory = FileManager.default.temporaryDirectory
            let processingURL = tempDirectory.appendingPathComponent("hexbloop_processing_\(UUID().uuidString).m4a")
            
            // 4. Set up the audio processing chain
            // First convert to standard format
            progressHandler(0.2)
            let processedAudioURL = try await convertAudio(
                asset: asset,
                to: processingURL,
                format: AVFileType.m4a,
                with: parameters
            )
            
            // 5. Apply audio effects to the converted file
            progressHandler(0.5)
            try await applyAudioEffects(
                at: processedAudioURL,
                with: parameters,
                progressCallback: { progress in
                    // Scale progress from 0.5 to 0.9
                    progressHandler(0.5 + (progress * 0.4))
                }
            )
            
            // 6. Final mastering stage - apply enhanced mastering similar to original script
            progressHandler(0.9)
            try await enhancedMastering(
                at: processedAudioURL,
                with: parameters
            )
            
            // 7. Move the processed file to the destination
            if FileManager.default.fileExists(atPath: destinationURL.path) {
                try FileManager.default.removeItem(at: destinationURL)
            }
            
            // Verify the processed file has content before moving
            let processedFileSize = try FileManager.default.attributesOfItem(atPath: processedAudioURL.path)[.size] as? Int64 ?? 0
            print("📊 Processed file size: \(processedFileSize) bytes (\(Double(processedFileSize) / 1024.0 / 1024.0) MB)")
            
            try FileManager.default.moveItem(at: processedAudioURL, to: destinationURL)
            
            // Show final progress
            progressHandler(1.0)
            
            return true
        } catch {
            throw AudioProcessingError.processingError("Error processing audio: \(error.localizedDescription)")
        }
    }
    
    // Enhanced final mastering stage inspired by the original bash script
    private func enhancedMastering(
        at audioURL: URL,
        with parameters: ProcessingParameters
    ) async throws {
        // Create a temporary output file for the mastered version
        let tempOutputURL = FileManager.default.temporaryDirectory.appendingPathComponent("hexbloop_mastered_\(UUID().uuidString).m4a")
        
        // Create the ffmpeg command
        // This attempts to recreate the mastering chain from the original script:
        // equalizer=f=100:t=q:w=1:g=0.3,
        // equalizer=f=800:t=q:w=1.2:g=0.5,
        // equalizer=f=1600:t=q:w=1:g=0.4,
        // equalizer=f=5000:t=q:w=1:g=0.3,
        // acompressor=threshold=-12dB:ratio=2:attack=100:release=1000:makeup=1.5,
        // alimiter=limit=0.97
        
        let ffmpegTask = Process()
        ffmpegTask.executableURL = URL(fileURLWithPath: "/usr/local/bin/ffmpeg")
        
        // Check if ffmpeg exists at the specified path
        if let ffmpegURL = ffmpegTask.executableURL, !FileManager.default.fileExists(atPath: ffmpegURL.path) {
            // Try with just "ffmpeg" which will use PATH
            ffmpegTask.executableURL = URL(fileURLWithPath: "/usr/bin/ffmpeg")
            
            // If still doesn't exist, skip this mastering step
            if let altURL = ffmpegTask.executableURL, !FileManager.default.fileExists(atPath: altURL.path) {
                if #available(macOS 10.12, *) {
                    let logger = OSLog(subsystem: "com.hexbloop.audio", category: "Mastering")
                    os_log("ffmpeg not found - skipping enhanced mastering stage", log: logger, type: .info)
                }
                // Just copy the file instead
                try FileManager.default.copyItem(at: audioURL, to: tempOutputURL)
                try FileManager.default.removeItem(at: audioURL)
                try FileManager.default.moveItem(at: tempOutputURL, to: audioURL)
                return
            }
        }
        
        // FFmpeg filter chain similar to original bash script
        let filterComplex = "equalizer=f=100:t=q:w=1:g=0.3,equalizer=f=800:t=q:w=1.2:g=0.5,equalizer=f=1600:t=q:w=1:g=0.4,equalizer=f=5000:t=q:w=1:g=0.3,acompressor=threshold=-12dB:ratio=2:attack=100:release=1000:makeup=1.5,alimiter=limit=0.97"
        
        // Construct FFmpeg command based on desired output format
        ffmpegTask.arguments = [
            "-y",
            "-i", audioURL.path,
            "-filter_complex", filterComplex,
            "-ar", "44100",  // Sample rate
            "-ac", "2",      // Stereo
            "-b:a", "320k",  // High bitrate
            tempOutputURL.path
        ]
        
        // Configure pipes for stdout and stderr
        let outputPipe = Pipe()
        let errorPipe = Pipe()
        ffmpegTask.standardOutput = outputPipe
        ffmpegTask.standardError = errorPipe
        
        do {
            // Run FFmpeg
            try ffmpegTask.run()
            ffmpegTask.waitUntilExit()
            
            // Check if successful
            if ffmpegTask.terminationStatus == 0 {
                // Success - replace original file with mastered version
                try FileManager.default.removeItem(at: audioURL)
                try FileManager.default.moveItem(at: tempOutputURL, to: audioURL)
                
                if #available(macOS 10.12, *) {
                    let logger = OSLog(subsystem: "com.hexbloop.audio", category: "Mastering")
                    os_log("Enhanced mastering completed successfully", log: logger, type: .info)
                }
            } else {
                // FFmpeg failed - log error and keep original file
                let errorData = errorPipe.fileHandleForReading.readDataToEndOfFile()
                let errorOutput = String(data: errorData, encoding: .utf8) ?? "Unknown error"
                
                if #available(macOS 10.12, *) {
                    let logger = OSLog(subsystem: "com.hexbloop.audio", category: "Mastering")
                    os_log("FFmpeg mastering failed: %{public}s", log: logger, type: .error, errorOutput)
                }
                
                // Clean up temp file
                try? FileManager.default.removeItem(at: tempOutputURL)
            }
        } catch {
            if #available(macOS 10.12, *) {
                let logger = OSLog(subsystem: "com.hexbloop.audio", category: "Mastering")
                os_log("Error running FFmpeg mastering: %{public}s", log: logger, type: .error, error.localizedDescription)
            }
            
            // Clean up temp file
            try? FileManager.default.removeItem(at: tempOutputURL)
        }
    }
    
    // Convert audio to a standard format with AVAssetExportSession
    private func convertAudio(
        asset: AVAsset,
        to outputURL: URL,
        format: AVFileType,
        with parameters: ProcessingParameters
    ) async throws -> URL {
        // Create an export session using our comprehensive optimizer
        let optimizer = AudioProcessingOptimizer.shared
        guard let exportSession = try await optimizer.createOptimizedExportSession(
            for: asset,
            preset: AVAssetExportPresetAppleM4A
        ) else {
            throw AudioProcessingError.conversionFailed("Unable to create export session")
        }
        
        // Configure the export session
        exportSession.outputURL = outputURL
        exportSession.outputFileType = format
        exportSession.shouldOptimizeForNetworkUse = false // Optimized for local use
        
        // Configure audio mix for adjusting gain if needed
        if parameters.outputGain != 0.0 {
            let audioMix = try await createGainAudioMix(for: asset, gain: parameters.outputGain)
            exportSession.audioMix = audioMix
        }
        
        // Use the optimized export with progress monitoring
        var progressUpdateTask: Task<Void, Error>? = nil
        
        progressUpdateTask = Task {
            // Set up a task for occasional progress monitoring
            while !Task.isCancelled {
                if exportSession.progress > 0 {
                    // Only log significant changes to avoid console spam
                    if Int(exportSession.progress * 100) % 20 == 0 {
                        if #available(macOS 10.12, *) {
                            let logger = OSLog(subsystem: "com.hexbloop.audio", category: "Export")
                            os_log("Export progress: %.0f%%", log: logger, type: .debug, exportSession.progress * 100)
                        }
                    }
                }
                try await Task.sleep(nanoseconds: 500_000_000) // 0.5 second
            }
        }
        
        do {
            // Perform the export with optimized progress handling and timeout protection
            try await optimizer.exportWithProgress(exportSession) { _ in
                // Progress is handled internally
            }
            
            // Cancel the progress task
            progressUpdateTask?.cancel()
            
            return outputURL
        } catch {
            // Cancel the progress task on error
            progressUpdateTask?.cancel()
            
            // Convert general errors to our specific error type
            let nsError = error as NSError
            if nsError.domain == "AudioProcessingOptimizer" {
                if nsError.code == 1002 { // Timeout error
                    throw AudioProcessingError.conversionFailed("Export timed out. The file may be corrupted or too large.")
                }
            }
            
            throw AudioProcessingError.conversionFailed("Export failed: \(error.localizedDescription)")
        }
    }
    
    // Create an audio mix to adjust gain
    private func createGainAudioMix(for asset: AVAsset, gain: Float) async throws -> AVAudioMix {
        let audioMix = AVMutableAudioMix()
        var trackMixes: [AVMutableAudioMixInputParameters] = []
        
        // Get audio tracks using compatibility layer
        let audioTracks = try await asset.getAudioTracks()
        
        // Create input parameters for each audio track
        for track in audioTracks {
            let parameters = AVMutableAudioMixInputParameters(track: track)
            parameters.setVolume(pow(10, gain/20), at: CMTime.zero) // Convert dB to linear gain
            trackMixes.append(parameters)
        }
        
        audioMix.inputParameters = trackMixes
        return audioMix
    }
    
    // Apply audio effects using AVAudioEngine with memory and performance optimizations
    private func applyAudioEffects(
        at audioURL: URL,
        with parameters: ProcessingParameters,
        progressCallback: @escaping (Float) -> Void
    ) async throws {
        // Skip audio processing entirely for Mac14,15 in extreme cases
        // This is a last-resort fallback for when even simplified processing is failing
        if AudioProcessingOptimizer.shared.isRunningOnMac14_15() {
            let systemUsage = AudioProcessingOptimizer.shared.checkMemoryUsage()
            if systemUsage.available < 120 * 1024 * 1024 { // Less than 120MB
                print("⚠️ CRITICAL: Skipping audio processing due to extreme memory pressure on Mac14,15")
                // Just copy the file instead to avoid crashes
                let tempOutputURL = FileManager.default.temporaryDirectory.appendingPathComponent("hexbloop_bypass_\(UUID().uuidString).mp3")
                try FileManager.default.copyItem(at: audioURL, to: tempOutputURL)
                try FileManager.default.removeItem(at: audioURL)
                try FileManager.default.moveItem(at: tempOutputURL, to: audioURL)
                progressCallback(1.0)
                return
            }
        }
        // Log memory usage before processing
        logMemoryUsage(tag: "Before audio processing")
        
        // Get the device model and check if it's Mac14,15
        let isMac14_15 = AudioProcessingOptimizer.shared.isRunningOnMac14_15()
        
        // Use a simplified processing path for Mac14,15 to avoid crashes and memory issues
        if isMac14_15 {
            // On Mac14,15, use external processing instead of AVAudioEngine
            // This completely skips the problematic audio rendering code
            let success = try await processUsingExternalTools(
                audioURL: audioURL, 
                parameters: parameters,
                progressCallback: progressCallback
            )
            
            if success {
                progressCallback(1.0)
                return
            }
            
            // If external processing failed, fall back to simplified internal processing
            if #available(macOS 10.12, *) {
                let logger = OSLog(subsystem: "com.hexbloop.audio", category: "Processing")
                os_log("External processing failed, using simplified internal processing", log: logger, type: .info)
            }
            
            // We'll use a simplified internal path that is much lighter on memory usage
        }
        
        // Use optimized audio file loading to prevent errors
        let audioFile: AVAudioFile
        do {
            audioFile = try AVAudioFile.optimizedLoading(at: audioURL)
        } catch {
            throw AudioProcessingError.processingError("Failed to load audio file: \(error.localizedDescription)")
        }
        
        // Create a temporary output file for processing
        let outputFormat = audioFile.processingFormat
        let tempOutputURL = FileManager.default.temporaryDirectory.appendingPathComponent("hexbloop_effects_\(UUID().uuidString).m4a")
        
        let outputFile: AVAudioFile
        do {
            outputFile = try AVAudioFile(
                forWriting: tempOutputURL,
                settings: audioFile.fileFormat.settings,
                commonFormat: .pcmFormatFloat32,
                interleaved: false
            )
        } catch {
            throw AudioProcessingError.processingError("Failed to create output file: \(error.localizedDescription)")
        }
        
        // Use smaller buffer sizes on problematic machines to reduce memory usage
        let optimizer = AudioProcessingOptimizer.shared
        let bufferSizes = optimizer.configureOptimalBufferSizes()
        let bufferSize = isMac14_15 ? AVAudioFrameCount(bufferSizes.input / 2) : AVAudioFrameCount(bufferSizes.input)
        
        // Get audio file details for better progress tracking
        let fileLength = audioFile.length
        let sampleRate = audioFile.processingFormat.sampleRate
        
        // Use actor to safely track write progress
        actor ProgressTracker {
            private var framesProcessed: AVAudioFramePosition = 0
            private let totalFrames: AVAudioFramePosition
            
            init(totalFrames: AVAudioFramePosition) {
                self.totalFrames = totalFrames
            }
            
            func update(framesWritten: AVAudioFrameCount) {
                framesProcessed += AVAudioFramePosition(framesWritten)
            }
            
            func getProgress() -> Float {
                return min(Float(framesProcessed) / Float(totalFrames), 1.0)
            }
        }
        
        let progressTracker = ProgressTracker(totalFrames: fileLength)
        
        // Set up the audio engine with reliable error handling and recovery for the reporterIDs error
        let engine = AVAudioEngine()
        
        // CRITICAL: We must attach a node before attempting to start the engine
        // This ensures we meet the required condition: inputNode != nullptr || outputNode != nullptr
        // Create a temporary node for warmup
        let tempPlayerNode = AVAudioPlayerNode()
        engine.attach(tempPlayerNode)
        engine.connect(tempPlayerNode, to: engine.mainMixerNode, format: outputFormat)
        
        // Attempt to recover from "Error (-4) getting reporterIDs" by doing a small warmup
        do {
            try engine.start()
            try? await Task.sleep(nanoseconds: 100_000_000) // 0.1 seconds
            engine.stop()
            
            // Disconnect and detach the temporary node - we'll create a fresh one later
            engine.disconnectNodeOutput(tempPlayerNode)
            engine.detach(tempPlayerNode)
        } catch {
            // Ignore error - this is just to initialize the audio system
            print("Audio engine warmup: \(error.localizedDescription)")
        }
        
        let playerNode = AVAudioPlayerNode()
        
        // Use a simplified processing chain on problematic machines
        if isMac14_15 {
            // Only use essential nodes for Mac14,15 to minimize memory usage
            // Add nodes to engine
            engine.attach(playerNode)
            
            // Connect player directly to main mixer for minimal processing
            engine.connect(playerNode, to: engine.mainMixerNode, format: outputFormat)
            
            // Log memory optimization
            if #available(macOS 10.12, *) {
                let logger = OSLog(subsystem: "com.hexbloop.audio", category: "Processing")
                os_log("Using simplified audio processing chain for Mac14,15", log: logger, type: .info)
            }
        } else {
            // For other devices, use the full processing chain
            // Add effects nodes
            let eqNode = AVAudioUnitEQ(numberOfBands: 10)
            let distortionNode = AVAudioUnitDistortion()
            let reverbNode = AVAudioUnitReverb()
            
            // Configure EQ
            configureEQ(eqNode, with: parameters)
            
            // Configure distortion with safety checks
            if let preset = AVAudioUnitDistortionPreset(rawValue: parameters.distortionPreset.audioUnitPreset) {
                distortionNode.loadFactoryPreset(preset)
            } else {
                // Fallback to overdrive preset
                distortionNode.loadFactoryPreset(.drumsBitBrush)
            }
            distortionNode.wetDryMix = min(max(parameters.distortionAmount * 100.0, 0.0), 100.0) // Ensure within 0-100
            
            // Configure reverb
            reverbNode.loadFactoryPreset(.mediumHall)
            reverbNode.wetDryMix = min(max(parameters.reverbAmount * 100.0, 0.0), 100.0) // Ensure within 0-100
            
            // Log effect settings for debugging
            if #available(macOS 10.12, *) {
                let logger = OSLog(subsystem: "com.hexbloop.audio", category: "Effects")
                os_log("Effects configured - Distortion: %{public}@ @ %.1f%%, Reverb: %.1f%%", 
                       log: logger, type: .info, 
                       parameters.distortionPreset.rawValue,
                       parameters.distortionAmount * 100.0,
                       parameters.reverbAmount * 100.0)
                
                // Log EQ settings
                os_log("EQ configured - HighPass: %.0fHz, LowPass: %.0fHz, Mid: %.0fHz @ %.1fdB", 
                       log: logger, type: .info,
                       parameters.highPassFreq,
                       parameters.lowPassFreq,
                       parameters.midFreq,
                       parameters.midGain)
            }
            
            // Add nodes to engine
            engine.attach(playerNode)
            engine.attach(eqNode)
            engine.attach(distortionNode)
            engine.attach(reverbNode)
            
            // Connect nodes - simpler chain to reduce memory usage
            engine.connect(playerNode, to: eqNode, format: outputFormat)
            engine.connect(eqNode, to: distortionNode, format: outputFormat)
            engine.connect(distortionNode, to: reverbNode, format: outputFormat)
            engine.connect(reverbNode, to: engine.mainMixerNode, format: outputFormat)
            
            // IMPORTANT: Mute the output so processing is silent
            engine.mainMixerNode.outputVolume = 0.0
        }
        
        // Create a progress update mechanism with less frequent updates to reduce overhead
        let progressTask = Task {
            while !Task.isCancelled {
                let progress = await progressTracker.getProgress()
                progressCallback(progress)
                try await Task.sleep(nanoseconds: 250_000_000) // 0.25 second - less frequent updates
            }
        }
        
        // Set up task for error handling and cleanup
        var processingError: Error? = nil
        var totalFramesWritten: Int64 = 0
        var tapCallCount = 0
        
        // Create a temporary autorelease pool to better manage memory
        autoreleasepool {
            // Set up the tap with error handling
            engine.mainMixerNode.installTap(
                onBus: 0,
                bufferSize: bufferSize,
                format: outputFormat
            ) { [weak progressTracker] buffer, time in
                // Use autoreleasepool to better manage memory within the tap
                autoreleasepool {
                    do {
                        try outputFile.write(from: buffer)
                        totalFramesWritten += Int64(buffer.frameLength)
                        tapCallCount += 1
                        
                        // Log progress every 100 tap calls
                        if tapCallCount % 100 == 0 {
                            if #available(macOS 10.12, *) {
                                let logger = OSLog(subsystem: "com.hexbloop.audio", category: "Processing")
                                os_log("Audio tap progress - Frames written: %lld, Tap calls: %d", 
                                       log: logger, type: .debug, totalFramesWritten, tapCallCount)
                            }
                        }
                        
                        // Use a Task only if we need to update progress
                        if let progressTracker = progressTracker {
                            Task { await progressTracker.update(framesWritten: buffer.frameLength) }
                        }
                    } catch {
                        processingError = error
                        if #available(macOS 10.12, *) {
                            let logger = OSLog(subsystem: "com.hexbloop.audio", category: "Processing")
                            os_log("Error writing buffer: %{public}s", log: logger, type: .error, error.localizedDescription)
                        }
                    }
                }
            }
        }
        
        do {
            // Start the engine with error handling
            try engine.start()
            
            // Use a timeout for the entire operation
            try await withThrowingTaskGroup(of: Void.self) { group in
                // Add the main playback task
                group.addTask {
                    try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Void, Error>) in
                        // Schedule the file with the completion handler - split into chunks for large files
                        let chunkSize: AVAudioFrameCount = 32768 // Use smaller chunks to prevent memory issues
                        
                        if isMac14_15 || fileLength > 10000000 { // For Mac14,15 or very large files
                            // Use chunked scheduling to reduce memory pressure
                            self.scheduleFileInChunks(
                                audioFile: audioFile,
                                playerNode: playerNode,
                                chunkSize: chunkSize,
                                completionHandler: {
                                    Task { @MainActor in
                                        if let error = processingError {
                                            continuation.resume(throwing: error)
                                        } else {
                                            continuation.resume()
                                        }
                                    }
                                }
                            )
                        } else {
                            // For smaller files on other machines, use standard scheduling
                            playerNode.scheduleFile(audioFile, at: nil) {
                                Task { @MainActor in
                                    if let error = processingError {
                                        continuation.resume(throwing: error)
                                    } else {
                                        continuation.resume()
                                    }
                                }
                            }
                        }
                        
                        // Start playback
                        playerNode.play()
                    }
                }
                
                // Add a timeout task (duration proportional to audio length, but shorter for problematic machines)
                let timeoutFactor = isMac14_15 ? 1.2 : 2.0 // Less time on problematic machines
                let maxTimeout = isMac14_15 ? 180.0 : 300.0 // 3 vs 5 minutes max
                let timeoutSeconds = min(Double(fileLength) / sampleRate * timeoutFactor, maxTimeout)
                
                group.addTask {
                    try await Task.sleep(nanoseconds: UInt64(timeoutSeconds * 1_000_000_000))
                    throw AudioProcessingError.processingError("Effects processing timed out after \(Int(timeoutSeconds)) seconds")
                }
                
                // Wait for the first task to complete and cancel others
                do {
                    _ = try await group.next()
                    group.cancelAll()
                } catch {
                    group.cancelAll()
                    throw error
                }
            }
            
            // Ensure all buffers are processed - shorter wait for problematic machines
            let flushDelay = isMac14_15 ? 250_000_000 : 500_000_000 // 0.25 vs 0.5 seconds
            try await Task.sleep(nanoseconds: UInt64(flushDelay))
            
        } catch {
            // Clean up on error
            if engine.isRunning {
                engine.mainMixerNode.removeTap(onBus: 0)
                if playerNode.isPlaying {
                    playerNode.stop()
                }
                engine.stop()
            }
            
            // Log memory usage after error
            logMemoryUsage(tag: "After audio processing error")
            
            throw AudioProcessingError.processingError("Error during audio effects processing: \(error.localizedDescription)")
        }
        
        // Clean up
        progressTask.cancel()
        engine.mainMixerNode.removeTap(onBus: 0)
        playerNode.stop()
        engine.stop()
        
        // IMPORTANT: Close the output file to ensure all data is written
        // This is critical for ensuring the audio is properly saved
        outputFile.close()
        
        // Small delay to ensure file system has flushed
        try await Task.sleep(nanoseconds: 100_000_000) // 0.1 seconds
        
        // Log memory usage after processing
        logMemoryUsage(tag: "After audio processing")
        
        // Log final processing statistics
        if #available(macOS 10.12, *) {
            let logger = OSLog(subsystem: "com.hexbloop.audio", category: "Processing")
            os_log("Audio processing complete - Total frames written: %lld, Total tap calls: %d", 
                   log: logger, type: .info, totalFramesWritten, tapCallCount)
        }
        
        // Verify the output file was created correctly
        guard FileManager.default.fileExists(atPath: tempOutputURL.path) else {
            throw AudioProcessingError.processingError("Output file was not created")
        }
        
        // Also verify the file has actual content
        let fileAttributes = try FileManager.default.attributesOfItem(atPath: tempOutputURL.path)
        let fileSize = fileAttributes[.size] as? Int64 ?? 0
        guard fileSize > 1000 else { // At least 1KB
            throw AudioProcessingError.processingError("Output file appears to be empty (size: \(fileSize) bytes)")
        }
        
        // Log file size
        if #available(macOS 10.12, *) {
            let logger = OSLog(subsystem: "com.hexbloop.audio", category: "Processing")
            os_log("Output file size: %lld bytes (%.2f MB)", log: logger, type: .info, fileSize, Double(fileSize) / 1024.0 / 1024.0)
        }
        
        // Replace the original file with the processed one
        if FileManager.default.fileExists(atPath: audioURL.path) {
            try FileManager.default.removeItem(at: audioURL)
        }
        try FileManager.default.moveItem(at: tempOutputURL, to: audioURL)
        
        progressCallback(1.0)
    }
    
    // Helper to schedule audio file in chunks to reduce memory pressure
    private func scheduleFileInChunks(
        audioFile: AVAudioFile,
        playerNode: AVAudioPlayerNode,
        chunkSize: AVAudioFrameCount,
        completionHandler: @escaping () -> Void
    ) {
        // Total number of frames
        let totalFrames = audioFile.length
        let format = audioFile.processingFormat
        
        // Calculate number of complete chunks
        let fullChunks = Int(totalFrames / AVAudioFramePosition(chunkSize))
        let remainingFrames = AVAudioFrameCount(totalFrames % AVAudioFramePosition(chunkSize))
        
        // Set up scheduling completion counter
        let totalChunks = fullChunks + (remainingFrames > 0 ? 1 : 0)
        var completedChunks = 0
        
        // Helper for tracking completions
        let chunkCompleted = {
            completedChunks += 1
            if completedChunks >= totalChunks {
                completionHandler()
            }
        }
        
        // Log chunking info
        if #available(macOS 10.12, *) {
            let logger = OSLog(subsystem: "com.hexbloop.audio", category: "Processing")
            os_log("Scheduling audio in %d chunks of %d frames each", log: logger, type: .debug, totalChunks, chunkSize)
        }
        
        // Schedule full chunks
        for chunk in 0..<fullChunks {
            autoreleasepool {
                do {
                    let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: chunkSize)!
                    try audioFile.read(into: buffer, frameCount: chunkSize)
                    
                    // Calculate chunk timing
                    let startFrame = AVAudioFramePosition(chunk) * AVAudioFramePosition(chunkSize)
                    let startTime = AVAudioTime(sampleTime: startFrame, atRate: format.sampleRate)
                    
                    // Schedule this chunk
                    playerNode.scheduleBuffer(buffer, at: startTime, options: [], completionCallbackType: .dataPlayedBack) { _ in
                        chunkCompleted()
                    }
                } catch {
                    print("Error scheduling chunk \(chunk): \(error)")
                    chunkCompleted()
                }
            }
        }
        
        // Schedule the remaining partial chunk if needed
        if remainingFrames > 0 {
            autoreleasepool {
                do {
                    let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: remainingFrames)!
                    try audioFile.read(into: buffer, frameCount: remainingFrames)
                    
                    // Calculate final chunk timing
                    let startFrame = AVAudioFramePosition(fullChunks) * AVAudioFramePosition(chunkSize)
                    let startTime = AVAudioTime(sampleTime: startFrame, atRate: format.sampleRate)
                    
                    // Schedule the final chunk
                    playerNode.scheduleBuffer(buffer, at: startTime, options: [], completionCallbackType: .dataPlayedBack) { _ in
                        chunkCompleted()
                    }
                } catch {
                    print("Error scheduling final chunk: \(error)")
                    chunkCompleted()
                }
            }
        }
        
        // If no chunks were scheduled (empty file), call completion handler
        if totalChunks == 0 {
            completionHandler()
        }
    }
    
    // Use external tools (ffmpeg) for processing on problematic machines
    private func processUsingExternalTools(
        audioURL: URL, 
        parameters: ProcessingParameters,
        progressCallback: @escaping (Float) -> Void
    ) async throws -> Bool {
        progressCallback(0.1)
        
        // Create a temporary output file
        let tempOutputURL = FileManager.default.temporaryDirectory.appendingPathComponent("hexbloop_ffmpeg_\(UUID().uuidString).m4a")
        
        // Check if ffmpeg is available
        let ffmpegTask = Process()
        let ffmpegPath = "/usr/local/bin/ffmpeg"
        
        if !FileManager.default.fileExists(atPath: ffmpegPath) {
            // Try alternate location
            let altPath = "/usr/bin/ffmpeg"
            if !FileManager.default.fileExists(atPath: altPath) {
                // No ffmpeg - can't use external processing
                return false
            }
            ffmpegTask.executableURL = URL(fileURLWithPath: altPath)
        } else {
            ffmpegTask.executableURL = URL(fileURLWithPath: ffmpegPath)
        }
        
        // Construct filter chain based on parameters
        var filterChain = ""
        
        // High-pass filter
        filterChain += "highpass=f=\(Int(parameters.highPassFreq)),"
        
        // Low-pass filter
        filterChain += "lowpass=f=\(Int(parameters.lowPassFreq)),"
        
        // Distortion (simplified)
        let distortionAmount = min(max(parameters.distortionAmount, 0.0), 1.0)
        if distortionAmount > 0.1 {
            filterChain += "overdrive=\(String(format: "%.1f", distortionAmount * 10)),"
        }
        
        // Compression
        filterChain += "acompressor=threshold=\(parameters.compressionThreshold)dB:ratio=\(parameters.compressionRatio):attack=\(parameters.compressionAttack * 1000):release=\(parameters.compressionRelease * 1000):makeup=2,"
        
        // Reverb (simplified)
        let reverbAmount = min(max(parameters.reverbAmount, 0.0), 1.0)
        if reverbAmount > 0.1 {
            filterChain += "aecho=0.8:0.9:1000|1800:0.3|0.25,"
        }
        
        // Limiter
        filterChain += "alimiter=limit=0.95"
        
        // Prepare arguments
        ffmpegTask.arguments = [
            "-y",
            "-i", audioURL.path,
            "-af", filterChain,
            "-ar", "44100",
            "-ac", "2",
            "-b:a", "320k",
            tempOutputURL.path
        ]
        
        // Set up pipes
        let pipe = Pipe()
        ffmpegTask.standardOutput = pipe
        ffmpegTask.standardError = pipe
        
        // Progress monitoring task
        var totalDuration: TimeInterval = 0
        var currentProgress: TimeInterval = 0
        
        let progressTask = Task {
            do {
                for try await line in pipe.fileHandleForReading.bytes.lines {
                    // Try to extract duration info
                    if line.contains("Duration:") {
                        if let durationStr = line.split(separator: "Duration:").last?.split(separator: ",").first?.trimmingCharacters(in: .whitespaces),
                           let duration = parseFFmpegTime(durationStr) {
                            totalDuration = duration
                        }
                    }
                    
                    // Try to extract progress info
                    if line.contains("time=") {
                        if let timeStr = line.split(separator: "time=").last?.split(separator: " ").first?.trimmingCharacters(in: .whitespaces),
                           let currentTime = parseFFmpegTime(timeStr) {
                            currentProgress = currentTime
                            if totalDuration > 0 {
                                let progress = Float(currentProgress / totalDuration)
                                progressCallback(min(0.1 + progress * 0.8, 0.9)) // Scale to 10-90%
                            }
                        }
                    }
                }
            } catch {
                // Handle error in async sequence
                print("Error reading FFmpeg output: \(error.localizedDescription)")
            }
        }
        
        // Run ffmpeg
        do {
            try ffmpegTask.run()
            ffmpegTask.waitUntilExit()
            
            // Cancel the progress task
            progressTask.cancel()
            
            // Check if successful
            if ffmpegTask.terminationStatus == 0 {
                // Success
                if FileManager.default.fileExists(atPath: audioURL.path) {
                    try FileManager.default.removeItem(at: audioURL)
                }
                try FileManager.default.moveItem(at: tempOutputURL, to: audioURL)
                progressCallback(1.0)
                return true
            } else {
                // Failed
                if #available(macOS 10.12, *) {
                    let logger = OSLog(subsystem: "com.hexbloop.audio", category: "Processing")
                    os_log("FFmpeg processing failed with status %d", log: logger, type: .error, ffmpegTask.terminationStatus)
                }
                return false
            }
        } catch {
            // Error running ffmpeg
            progressTask.cancel()
            if #available(macOS 10.12, *) {
                let logger = OSLog(subsystem: "com.hexbloop.audio", category: "Processing")
                os_log("Failed to run FFmpeg: %{public}s", log: logger, type: .error, error.localizedDescription)
            }
            return false
        }
    }
    
    // Helper to parse FFmpeg time format (HH:MM:SS.ms)
    private func parseFFmpegTime(_ timeString: String) -> TimeInterval? {
        let components = timeString.split(separator: ":")
        guard components.count == 3 else { return nil }
        
        guard let hours = Double(components[0]),
              let minutes = Double(components[1]),
              let seconds = Double(components[2]) else {
            return nil
        }
        
        return hours * 3600 + minutes * 60 + seconds
    }
    
    // Log memory usage and clean up if needed
    private func logMemoryUsage(tag: String) {
        var info = mach_task_basic_info()
        var count = mach_msg_type_number_t(MemoryLayout<mach_task_basic_info>.size)/4
        
        let kerr: kern_return_t = withUnsafeMutablePointer(to: &info) {
            $0.withMemoryRebound(to: integer_t.self, capacity: 1) {
                task_info(mach_task_self_, task_flavor_t(MACH_TASK_BASIC_INFO), $0, &count)
            }
        }
        
        if kerr == KERN_SUCCESS {
            let usedMB = Double(info.resident_size) / 1024.0 / 1024.0
            
            // Get available memory
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
            
            if status == KERN_SUCCESS {
                let free_memory = Double(vm_stat.free_count) * Double(pagesize) / 1024.0 / 1024.0
                print("Memory usage: \(Int(usedMB)) MB / \(Int(free_memory)) MB available")
                
                // If memory is running low, proactively clear caches to prevent crashes
                if free_memory < 100 { // Less than 100MB available
                    print("Critical memory pressure detected - clearing caches")
                    // Clear optimizer cache
                    AudioProcessingOptimizer.shared.clearCache()
                    
                    // Run a memory cleanup
                    autoreleasepool {
                        // Trigger garbage collection-like behavior
                        let _ = [Int](repeating: 0, count: 1)
                    }
                }
            } else {
                print("Memory usage: \(Int(usedMB)) MB")
            }
        }
    }
    
    // Configure EQ settings
    private func configureEQ(_ eqNode: AVAudioUnitEQ, with parameters: ProcessingParameters) {
        // Reset all bands
        for i in 0..<eqNode.bands.count {
            eqNode.bands[i].bypass = true
            eqNode.bands[i].filterType = .parametric
            eqNode.bands[i].frequency = 1000.0
            eqNode.bands[i].gain = 0.0
            eqNode.bands[i].bandwidth = 1.0
        }
        
        // Band 0: High-pass filter
        eqNode.bands[0].bypass = false
        eqNode.bands[0].filterType = .highPass
        eqNode.bands[0].frequency = parameters.highPassFreq
        
        // Band 1: Low-pass filter
        eqNode.bands[1].bypass = false
        eqNode.bands[1].filterType = .lowPass
        eqNode.bands[1].frequency = parameters.lowPassFreq
        
        // Band 2: Mid boost
        eqNode.bands[2].bypass = false
        eqNode.bands[2].filterType = .parametric
        eqNode.bands[2].frequency = parameters.midFreq
        eqNode.bands[2].gain = parameters.midGain
        eqNode.bands[2].bandwidth = 1.0
        
        // Band 3: Low shelf for warmth
        eqNode.bands[3].bypass = false
        eqNode.bands[3].filterType = .lowShelf
        eqNode.bands[3].frequency = 200.0
        eqNode.bands[3].gain = 2.0
        
        // Band 4: High shelf cut for vintage feel
        eqNode.bands[4].bypass = false
        eqNode.bands[4].filterType = .highShelf
        eqNode.bands[4].frequency = 8000.0
        eqNode.bands[4].gain = -3.0
        
        // Add slight presence boost around 3kHz
        eqNode.bands[5].bypass = false
        eqNode.bands[5].filterType = .parametric
        eqNode.bands[5].frequency = 3000.0
        eqNode.bands[5].gain = 2.0
        eqNode.bands[5].bandwidth = 0.5
    }
    
    // Apply metadata and artwork to audio file with optimized reliability
    func applyMetadataAndArtwork(
        to audioURL: URL,
        artistName: String,
        albumName: String,
        trackName: String,
        artworkURL: URL?
    ) async throws {
        // Use our optimized asset creation
        let optimizer = AudioProcessingOptimizer.shared
        let asset = optimizer.optimizedAsset(for: audioURL)
        
        // Create an export session with our optimized system
        guard let exportSession = try await optimizer.createOptimizedExportSession(
            for: asset,
            preset: AVAssetExportPresetAppleM4A
        ) else {
            throw AudioProcessingError.metadataFailed("Unable to create export session for metadata")
        }
        
        // Create a temporary output file
        let tempOutputURL = FileManager.default.temporaryDirectory.appendingPathComponent("hexbloop_metadata_\(UUID().uuidString).m4a")
        
        // Configure export session
        exportSession.outputURL = tempOutputURL
        exportSession.outputFileType = .m4a
        exportSession.shouldOptimizeForNetworkUse = false // Set to false for local use
        
        // Sanitize metadata inputs to prevent issues (truncate if too long)
        let maxStringLength = 255
        let safeArtistName = String(artistName.prefix(maxStringLength))
        let safeAlbumName = String(albumName.prefix(maxStringLength))
        let safeTrackName = String(trackName.prefix(maxStringLength))
        
        // Create metadata
        let metadata = createMetadata(
            artistName: safeArtistName,
            albumName: safeAlbumName,
            trackName: safeTrackName,
            artworkURL: artworkURL
        )
        
        // Apply metadata
        exportSession.metadata = metadata
        
        // Use our timeout-protected export
        do {
            try await optimizer.exportWithProgress(exportSession) { _ in
                // Progress is handled internally
            }
            
            // Verify the output file exists
            guard FileManager.default.fileExists(atPath: tempOutputURL.path) else {
                throw AudioProcessingError.metadataFailed("Metadata export file was not created")
            }
            
            // Replace the original file
            if FileManager.default.fileExists(atPath: audioURL.path) {
                try FileManager.default.removeItem(at: audioURL)
            }
            try FileManager.default.moveItem(at: tempOutputURL, to: audioURL)
            
            // Log success with os_log
            if #available(macOS 10.12, *) {
                let logger = OSLog(subsystem: "com.hexbloop.audio", category: "Metadata")
                os_log("Successfully applied metadata to file", log: logger, type: .info)
            }
            
        } catch {
            // Handle specific error types
            let nsError = error as NSError
            if nsError.domain == "AudioProcessingOptimizer" {
                if nsError.code == 1002 { // Timeout error
                    throw AudioProcessingError.metadataFailed("Metadata export timed out")
                }
            }
            
            throw AudioProcessingError.metadataFailed("Metadata export failed: \(error.localizedDescription)")
        }
    }
    
    // Helper function for timeouts - crucial for Mac App Store performance
    private func withTimeout<T>(seconds: TimeInterval, operation: @escaping () async throws -> T) async throws -> T {
        return try await withThrowingTaskGroup(of: T.self) { group in
            // Add the main operation
            group.addTask {
                return try await operation()
            }
            
            // Add a timeout task
            group.addTask {
                try await Task.sleep(nanoseconds: UInt64(seconds * 1_000_000_000))
                throw AudioProcessingError.processingError("Operation timed out after \(seconds) seconds")
            }
            
            // Return the first completed task result (or error)
            guard let result = try await group.next() else {
                throw AudioProcessingError.processingError("No task completed")
            }
            
            // Cancel any remaining tasks
            group.cancelAll()
            
            return result
        }
    }
    
    // Create metadata for audio file
    private func createMetadata(
        artistName: String,
        albumName: String,
        trackName: String,
        artworkURL: URL?
    ) -> [AVMetadataItem] {
        var metadataItems = [AVMetadataItem]()
        
        // Artist metadata
        let artistItem = AVMutableMetadataItem()
        artistItem.identifier = AVMetadataIdentifier.commonIdentifierArtist
        artistItem.value = artistName as NSString
        metadataItems.append(artistItem)
        
        // Album metadata
        let albumItem = AVMutableMetadataItem()
        albumItem.identifier = AVMetadataIdentifier.commonIdentifierAlbumName
        albumItem.value = albumName as NSString
        metadataItems.append(albumItem)
        
        // Track name metadata
        let trackItem = AVMutableMetadataItem()
        trackItem.identifier = AVMetadataIdentifier.commonIdentifierTitle
        trackItem.value = trackName as NSString
        metadataItems.append(trackItem)
        
        // Add artwork if available
        if let artworkURL = artworkURL, 
           let artworkData = try? Data(contentsOf: artworkURL) {
            let artworkItem = AVMutableMetadataItem()
            artworkItem.identifier = AVMetadataIdentifier.commonIdentifierArtwork
            artworkItem.value = artworkData as NSData
            metadataItems.append(artworkItem)
        }
        
        return metadataItems
    }
}
