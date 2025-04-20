import Foundation
import AVFoundation

// MARK: - Audio Optimizations for Mac App Store
// This file contains optimizations to prevent the audio overload issues

class AudioOptimizer {
    // Configure optimal audio settings for AVFoundation
    static func configureAudioSystem() {
        // macOS doesn't use AVAudioSession like iOS does
        // For macOS, we need to use different approaches
        
        #if os(macOS)
        // Mac-specific audio initializations
        // Init a small silent engine to warm up Core Audio
        let engine = AVAudioEngine()
        let format = AVAudioFormat(standardFormatWithSampleRate: 44100, channels: 2)!
        
        if let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: 1024) {
            buffer.frameLength = 1024 // Set a valid frame length
            
            let player = AVAudioPlayerNode()
            engine.attach(player)
            engine.connect(player, to: engine.mainMixerNode, format: format)
            
            do {
                try engine.start()
                player.scheduleBuffer(buffer, at: nil, options: .interrupts)
                player.play()
                
                // Run briefly then stop
                Thread.sleep(forTimeInterval: 0.1)
                player.stop()
                engine.stop()
            } catch {
                print("Note: Core Audio warmup failed - \(error.localizedDescription)")
            }
        }
        #else
        // iOS/tvOS specific code would go here but is not needed for macOS
        #endif
    }
    
    // Prevent audio processing overload by ensuring reasonable buffer sizes
    static func configureOptimalBufferSizes() -> (inputBufferSize: Int, processingBufferSize: Int) {
        // Default safe buffer sizes that avoid overload
        let defaultInputBuffer = 4096
        let defaultProcessingBuffer = 1024
        
        // On Mac, we can use slightly larger buffers for better performance
        #if os(macOS)
        return (defaultInputBuffer * 2, defaultProcessingBuffer * 2)
        #else
        return (defaultInputBuffer, defaultProcessingBuffer)
        #endif
    }
    
    // Create optimized export session to avoid the HALC errors
    static func createOptimizedExportSession(for asset: AVAsset, preset: String = AVAssetExportPresetAppleM4A) -> AVAssetExportSession? {
        // Basic session creation
        let session = AVAssetExportSession(asset: asset, presetName: preset)
        
        // Additional optimization:
        // 1. Set the timeRange to ensure we process the whole asset correctly
        session?.timeRange = CMTimeRange(start: .zero, duration: asset.duration)
        
        // 2. Set optimization flag
        session?.shouldOptimizeForNetworkUse = false // Set to false for local use
        
        return session
    }
    
    // Optimize audio file loading to avoid "Error getting reporterIDs"
    static func safelyLoadAudioFile(at url: URL) throws -> AVAudioFile {
        // Retry mechanism for loading audio files
        var attempts = 0
        var lastError: Error? = nil
        
        while attempts < 3 {
            do {
                let audioFile = try AVAudioFile(forReading: url)
                return audioFile
            } catch {
                lastError = error
                attempts += 1
                // Short delay before retry
                Thread.sleep(forTimeInterval: 0.1)
            }
        }
        
        // If we get here, all attempts failed
        throw lastError ?? NSError(domain: "AudioOptimizer", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to load audio file after multiple attempts"])
    }
    
    // Fix for the "AddInstanceForFactory" errors with HALC and other related errors
    static func prepareAudioSession() {
        // For Mac App Store, we need to ensure audio system is ready before processing
        
        #if os(macOS)
        // Add specific workaround for Mac14,15 hardware issues
        fixPlatformUtilitiesIssue()
        #endif
        
        // Dummy silent sound to initialize audio system
        let silentAudioURL = URL(fileURLWithPath: NSTemporaryDirectory()).appendingPathComponent("silent.wav")
        
        // Only create if doesn't exist yet
        if !FileManager.default.fileExists(atPath: silentAudioURL.path) {
            // Create a small silent audio file if needed
            createSilentAudioFile(at: silentAudioURL)
        }
        
        // Play silent sound to warm up audio system
        if FileManager.default.fileExists(atPath: silentAudioURL.path) {
            do {
                let audioPlayer = try AVAudioPlayer(contentsOf: silentAudioURL)
                audioPlayer.volume = 0.0
                audioPlayer.prepareToPlay()
                audioPlayer.play()
                
                // Stop after a very short time
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                    audioPlayer.stop()
                }
            } catch {
                print("Error playing silent audio: \(error.localizedDescription)")
            }
        }
    }
    
    // Fix for PlatformUtilities errors related to Mac14,15 model
    private static func fixPlatformUtilitiesIssue() {
        // This is a workaround for the "PlatformUtilities::CopyHardwareModelFullName() returns unknown value" error
        // For macOS, we need a different approach than iOS's AVAudioSession
        
        // Force a hardware model detection
        let process = Process()
        process.launchPath = "/usr/sbin/sysctl"
        process.arguments = ["-n", "hw.model"]
        
        // Redirect output
        let pipe = Pipe()
        process.standardOutput = pipe
        
        // Try to run but don't fail if we can't
        do {
            if #available(macOS 10.13, *) {
                try process.run()
                process.waitUntilExit()
                
                // Read model information
                let data = pipe.fileHandleForReading.readDataToEndOfFile()
                if let model = String(data: data, encoding: .utf8)?.trimmingCharacters(in: .whitespacesAndNewlines) {
                    print("Detected hardware model: \(model)")
                    
                    // For Mac14,15 models that have reported issues, do special initialization
                    if model.contains("Mac14,15") {
                        print("Detected Mac14,15 model - applying specific optimizations")
                        // Initialize a temporary audio engine to force hardware detection
                        let tempEngine = AVAudioEngine()
                        do {
                            try tempEngine.start()
                            Thread.sleep(forTimeInterval: 0.05)
                            tempEngine.stop()
                        } catch {
                            print("Warning during audio engine initialization: \(error.localizedDescription)")
                        }
                    }
                }
            }
        } catch {
            // Ignore errors - this is just a detection mechanism
            print("Hardware detection note: \(error.localizedDescription)")
        }
    }
    
    // Create a silent audio file for system initialization
    private static func createSilentAudioFile(at url: URL) {
        // Create a small silent WAV file
        let sampleRate = 44100.0
        let duration = 0.1 // Short duration
        let numSamples = Int(sampleRate * duration)
        
        // Create a buffer with zeros (silence)
        var samples = [Float](repeating: 0.0, count: numSamples)
        
        // Get audio format
        let format = AVAudioFormat(standardFormatWithSampleRate: sampleRate, channels: 1)
        
        guard let format = format,
              let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: AVAudioFrameCount(numSamples)) else {
            return
        }
        
        // Copy samples to buffer
        for i in 0..<numSamples {
            buffer.floatChannelData?[0][i] = samples[i]
        }
        buffer.frameLength = AVAudioFrameCount(numSamples)
        
        // Create audio file
        do {
            let file = try AVAudioFile(forWriting: url, settings: format.settings)
            try file.write(from: buffer)
        } catch {
            print("Error creating silent audio file: \(error.localizedDescription)")
        }
    }
}