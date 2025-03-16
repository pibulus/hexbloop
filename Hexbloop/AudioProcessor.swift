import Foundation
import AVFoundation
import AVFAudio

// MARK: - Audio Processor with AVAudioEngine
@MainActor
class AudioProcessor: ObservableObject {
    // Processing state
    @Published var isProcessing = false
    @Published var progress: Float = 0.0
    
    // Audio engine components
    private let audioEngine = AVAudioEngine()
    private let playerNode = AVAudioPlayerNode()
    private let distortionNode = AVAudioUnitDistortion()
    private let eqNode = AVAudioUnitEQ(numberOfBands: 10)
    
    // Use proper audio units for dynamics processing
    private var compressorNode1: AVAudioUnit?
    private var compressorNode2: AVAudioUnit?
    private var limiterNode: AVAudioUnit?
    private let reverbNode = AVAudioUnitReverb()
    private let delayNode = AVAudioUnitDelay()
    
    private var engineConfigured = false
    
    // Used to store a strong reference to the completion timer
    private var completionTimer: Timer?
    
    // For tracking progress updates
    private var framesWrittenValue: AVAudioFramePosition = 0
    
    // MARK: - Initialization
    
    init() {
        // Initialize audio units
        loadAudioUnits()
        // setupProcessingChain() will be called when audio units are ready
    }
    
    // MARK: - Audio Engine Setup
    
    private func loadAudioUnits() {
        // Create audio component descriptions for the dynamics processors
        var compressorDesc = AudioComponentDescription()
        compressorDesc.componentType = kAudioUnitType_Effect
        compressorDesc.componentSubType = kAudioUnitSubType_DynamicsProcessor
        compressorDesc.componentManufacturer = kAudioUnitManufacturer_Apple
        
        // Create the audio units asynchronously
        Task {
            do {
                // Create compressor nodes
                compressorNode1 = try await AVAudioUnit.instantiate(with: compressorDesc, 
                                                              options: [])
                compressorNode2 = try await AVAudioUnit.instantiate(with: compressorDesc, 
                                                              options: [])
                limiterNode = try await AVAudioUnit.instantiate(with: compressorDesc, 
                                                         options: [])
                
                // After all units are created, configure the processing chain
                setupProcessingChain()
            } catch {
                print("❌ Error creating audio units: \(error.localizedDescription)")
            }
        }
    }
    
    // Set up the audio processing chain
    private func setupProcessingChain() {
        // Only proceed if we have all the required components
        guard let compressorNode1 = compressorNode1,
              let compressorNode2 = compressorNode2,
              let limiterNode = limiterNode else {
            print("⚠️ Not all audio units are created yet. Processing chain setup deferred.")
            return
        }
        
        if engineConfigured {
            // Already configured
            return
        }
        
        // Attach all nodes to the engine
        audioEngine.attach(playerNode)
        audioEngine.attach(distortionNode)
        audioEngine.attach(eqNode)
        audioEngine.attach(compressorNode1)
        audioEngine.attach(compressorNode2)
        audioEngine.attach(limiterNode)
        audioEngine.attach(reverbNode)
        audioEngine.attach(delayNode)
        
        // Create standard mixing/processing format
        let processingFormat = AVAudioFormat(standardFormatWithSampleRate: 44100, channels: 2)!
        
        // Connect the nodes in processing chain order
        audioEngine.connect(playerNode, to: distortionNode, format: processingFormat)
        audioEngine.connect(distortionNode, to: eqNode, format: processingFormat)
        audioEngine.connect(eqNode, to: compressorNode1, format: processingFormat)
        audioEngine.connect(compressorNode1, to: delayNode, format: processingFormat)
        audioEngine.connect(delayNode, to: reverbNode, format: processingFormat)
        audioEngine.connect(reverbNode, to: compressorNode2, format: processingFormat)
        audioEngine.connect(compressorNode2, to: limiterNode, format: processingFormat)
        audioEngine.connect(limiterNode, to: audioEngine.mainMixerNode, format: processingFormat)
        
        // Configure default settings for each node
        configureDefaults()
        
        engineConfigured = true
        print("✅ Audio processing chain configured successfully")
    }
    
    // Configure default settings for the audio processing chain
    private func configureDefaults() {
        // Distortion
        distortionNode.wetDryMix = 50.0 // 50% effect blend
        distortionNode.preGain = 0.0    // No input gain boost
        
        // EQ
        configureEQ(highPass: 80.0, lowPass: 12000.0, midFreq: 1000.0, midGain: 3.0)
        
        // Reverb
        reverbNode.wetDryMix = 30.0 // 30% reverb
        reverbNode.loadFactoryPreset(.mediumRoom)
        
        // Delay
        delayNode.wetDryMix = 0.0 // Off by default
        delayNode.delayTime = 0.1
        delayNode.feedback = 30.0 // 30% feedback
        delayNode.lowPassCutoff = 15000.0
    }
    
    // MARK: - Parameter Configuration
    
    // Apply processing parameters to the audio engine
    func applyParameters(_ params: ProcessingParameters) {
        // Configure Distortion
        configureDistortion(preset: params.distortionPreset, amount: params.distortionAmount)
        
        // Configure EQ
        configureEQ(
            highPass: params.highPassFreq,
            lowPass: params.lowPassFreq,
            midFreq: params.midFreq,
            midGain: params.midGain
        )
        
        // Configure Reverb
        reverbNode.wetDryMix = params.reverbAmount * 100.0 // Convert 0-1 to 0-100
        
        // Configure Delay
        configureDelay(time: params.delayTime, feedback: params.delayFeedback)
        
        print("🎛️ Applied processing parameters: \(params)")
    }
    
    // Configure distortion effect
    private func configureDistortion(preset: ProcessingParameters.DistortionPreset, amount: Float) {
        distortionNode.loadFactoryPreset(AVAudioUnitDistortionPreset(rawValue: Int(preset.audioUnitPreset))!)
        distortionNode.wetDryMix = amount * 100.0 // Convert 0-1 to 0-100 for wetDryMix
        distortionNode.preGain = amount * 6.0 // Adjust pre-gain based on distortion amount
    }
    
    // Configure EQ with high-pass, low-pass, and mid boost
    private func configureEQ(highPass: Float, lowPass: Float, midFreq: Float, midGain: Float) {
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
        eqNode.bands[0].frequency = highPass
        
        // Band 1: Low-pass filter
        eqNode.bands[1].bypass = false
        eqNode.bands[1].filterType = .lowPass
        eqNode.bands[1].frequency = lowPass
        
        // Band 2: Mid boost
        eqNode.bands[2].bypass = false
        eqNode.bands[2].filterType = .parametric
        eqNode.bands[2].frequency = midFreq
        eqNode.bands[2].gain = midGain
        eqNode.bands[2].bandwidth = 1.0
        
        // Subtle high shelf cut for vintage sound
        eqNode.bands[3].bypass = false
        eqNode.bands[3].filterType = .highShelf
        eqNode.bands[3].frequency = 8000.0
        eqNode.bands[3].gain = -3.0
    }
    
    // Configure delay effect
    private func configureDelay(time: Float, feedback: Float) {
        if time > 0.0 {
            delayNode.wetDryMix = min(time * 100.0, 50.0) // Convert to percentage, max 50%
            delayNode.delayTime = TimeInterval(time)
            delayNode.feedback = feedback * 100.0 // Convert 0-0.9 to 0-90%
        } else {
            delayNode.wetDryMix = 0.0 // Turn off if delay time is 0
        }
    }
    
    // MARK: - Audio Processing
    
    // Function to handle player node completion
    private func handlePlaybackCompletion(_ callbackType: AVAudioPlayerNodeCompletionCallbackType) {
        progress = 1.0
        print("✨ Finished playing audio for processing")
    }
    
    // Process audio file with the configured audio engine
    func processAudio(at inputURL: URL, to outputURL: URL, with parameters: ProcessingParameters) async throws {
        // Ensure we have a valid output directory
        try FileManager.default.createDirectory(
            at: outputURL.deletingLastPathComponent(),
            withIntermediateDirectories: true
        )
        
        // Start processing
        isProcessing = true
        progress = 0.0
        framesWrittenValue = 0
        
        print("🎵 Starting audio processing with AVAudioEngine...")
        print("🌙 Processing under \(ProcessingParameters.getMoonPhaseDescription())")
        
        // Add a complete cleanup in case of error
        defer {
            // Make sure we remove any taps on error
            audioEngine.mainMixerNode.removeTap(onBus: 0)
            
            // Stop player and engine if they're running
            if playerNode.isPlaying {
                playerNode.stop()
            }
            
            // Reset state if we're still processing (indicates an error occurred)
            if isProcessing {
                Task { @MainActor in
                    isProcessing = false
                    progress = 0.0
                }
            }
        }
        
        do {
            // 1. First validate the input file to make sure it can be read
            guard FileManager.default.fileExists(atPath: inputURL.path) else {
                throw NSError(
                    domain: "AudioProcessing",
                    code: 4, 
                    userInfo: [NSLocalizedDescriptionKey: "Input file does not exist"]
                )
            }
            
            // Verify file can be opened
            let testAudioFile: AVAudioFile
            do {
                testAudioFile = try AVAudioFile(forReading: inputURL)
            } catch {
                throw NSError(
                    domain: "AudioProcessing",
                    code: 5,
                    userInfo: [NSLocalizedDescriptionKey: "Could not open audio file: \(error.localizedDescription)"]
                )
            }
            
            // Check if file is too large (>10 minutes - ~26MB for stereo 44.1kHz)
            let maxFrames: AVAudioFramePosition = 26_460_000 // Approx 10 minutes at 44.1kHz
            if testAudioFile.length > maxFrames {
                throw NSError(
                    domain: "AudioProcessing",
                    code: 6,
                    userInfo: [NSLocalizedDescriptionKey: "Audio file is too large to process"]
                )
            }
            
            // Apply the processing parameters
            applyParameters(parameters)
            
            // Ensure processing chain is set up
            if !engineConfigured {
                // Wait for audio units to be configured
                for _ in 0..<10 { // Try for up to 1 second
                    if compressorNode1 != nil && compressorNode2 != nil && limiterNode != nil {
                        setupProcessingChain()
                        break
                    }
                    try await Task.sleep(nanoseconds: 100_000_000) // 0.1 second
                }
                
                // If still not configured, throw an error
                guard engineConfigured else {
                    throw NSError(
                        domain: "AudioProcessing",
                        code: 2,
                        userInfo: [NSLocalizedDescriptionKey: "Audio engine not properly configured"]
                    )
                }
            }
            
            // 2. Load audio file for processing
            let audioFile = try AVAudioFile(forReading: inputURL)
            let processingFormat = audioFile.processingFormat
            
            // 3. Stop engine if running and restart it
            if audioEngine.isRunning {
                audioEngine.stop()
            }
            try audioEngine.start()
            
            // 4. Set up output file
            let outputFormat = AVAudioFormat(
                commonFormat: .pcmFormatFloat32,
                sampleRate: processingFormat.sampleRate,
                channels: processingFormat.channelCount,
                interleaved: false
            )!
            
            guard let outputFile = try? AVAudioFile(
                forWriting: outputURL,
                settings: outputFormat.settings,
                commonFormat: .pcmFormatFloat32,
                interleaved: false
            ) else {
                throw NSError(
                    domain: "AudioProcessing",
                    code: 1,
                    userInfo: [NSLocalizedDescriptionKey: "Failed to create output file"]
                )
            }
            
            // 5. Set up tap on the output of the chain to capture processed audio
            // Use smaller buffer size for better stability
            let totalFrames = audioFile.length
            let bufferSize = AVAudioFrameCount(min(4096, totalFrames / 20)) // Use smaller chunks for stability
            let outputNode = audioEngine.mainMixerNode
            
            // Create a class to hold buffer processing state with atomic access
            actor BufferProcessor {
                var framesWritten: AVAudioFramePosition = 0
                
                func processBuffer(_ buffer: AVAudioPCMBuffer, to file: AVAudioFile) throws -> AVAudioFramePosition {
                    try file.write(from: buffer)
                    framesWritten += AVAudioFramePosition(buffer.frameLength)
                    return framesWritten
                }
                
                func getFramesWritten() -> AVAudioFramePosition {
                    return framesWritten
                }
            }
            
            // Create the processor
            let bufferProcessor = BufferProcessor()
            
            // Create a tap 
            outputNode.installTap(onBus: 0, bufferSize: bufferSize, format: outputFormat) { [weak self] buffer, time in
                // Process buffer without updating UI immediately to prevent main thread blocks
                Task.detached {
                    do {
                        let framesWritten = try await bufferProcessor.processBuffer(buffer, to: outputFile)
                        
                        // Update progress less frequently (every ~5% progress)
                        if framesWritten % (totalFrames / 20) < bufferSize {
                            // Update progress asynchronously on the main actor
                            Task { @MainActor [weak self] in
                                guard let self = self else { return }
                                
                                // Calculate and update progress on the main actor
                                let progress = Float(framesWritten) / Float(totalFrames)
                                self.progress = progress
                            }
                        }
                    } catch {
                        print("❌ Error writing buffer to file: \(error)")
                    }
                }
            }
            
            // Schedule the file with the completion handler
            playerNode.scheduleFile(audioFile, at: nil, completionCallbackType: .dataPlayedBack) { [weak self] callbackType in
                self?.handlePlaybackCompletion(callbackType)
            }
            
            // 6. Start playback
            playerNode.play()
            
            // 7. Wait for processing to complete
            try await waitForPlaybackCompletion(totalFrames: totalFrames)
            
            // Get actual frames written to verify completion
            let finalFramesWritten = await bufferProcessor.getFramesWritten()
            guard finalFramesWritten > 0 else {
                throw NSError(
                    domain: "AudioProcessing",
                    code: 7,
                    userInfo: [NSLocalizedDescriptionKey: "No audio data was written to output file"]
                )
            }
            
            // 8. Cleanup
            audioEngine.mainMixerNode.removeTap(onBus: 0)
            
            Task { @MainActor in
                isProcessing = false
                progress = 0.0
            }
            
            print("✅ Audio processing complete: \(outputURL.lastPathComponent)")
            
        } catch {
            print("❌ Audio processing error: \(error.localizedDescription)")
            throw error
        }
    }
    
    // Helper function to wait for playback to complete
    private func waitForPlaybackCompletion(totalFrames: AVAudioFramePosition) async throws {
        // Create a timer on the main actor and monitor the state on the main thread
        try await withCheckedThrowingContinuation { continuation in
            // Need to create and store the timer on the main thread
            Task { @MainActor in
                // Create a local function to check completion status
                // Must be marked @MainActor to access main actor properties
                @MainActor func checkCompletionStatus() -> Bool {
                    return !playerNode.isPlaying && progress >= 0.99 // Use 99% as complete to avoid floating point precision issues
                }
                
                // If already completed, return immediately
                if self.checkCompletionStatus() {
                    continuation.resume()
                    return
                }
                
                // Set up a timeout - max 5 minutes for very long files
                let timeoutSeconds = min(Double(totalFrames) / 44100.0 * 2.0, 300.0) // 2x file duration or 5 min max
                let startTime = Date()
                
                // Create a timer on the main actor
                completionTimer = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { [weak self] timer in
                    guard let self = self else {
                        timer.invalidate()
                        continuation.resume(throwing: NSError(domain: "AudioProcessing", code: 3, userInfo: [NSLocalizedDescriptionKey: "Audio processor was deallocated"]))
                        return
                    }
                    
                    // Check for timeout
                    let elapsed = Date().timeIntervalSince(startTime)
                    if elapsed > timeoutSeconds {
                        timer.invalidate()
                        self.completionTimer = nil
                        
                        // Try to stop processing cleanly
                        if self.playerNode.isPlaying {
                            self.playerNode.stop()
                        }
                        
                        continuation.resume(throwing: NSError(
                            domain: "AudioProcessing", 
                            code: 8, 
                            userInfo: [NSLocalizedDescriptionKey: "Processing timeout after \(Int(elapsed)) seconds"]
                        ))
                        return
                    }
                    
                    // Need to dispatch to main actor for checking properties
                    Task { @MainActor in
                        // Check if we've made progress in the last second
                        if !self.playerNode.isPlaying {
                            // If player stopped but we're still processing, wait for buffers to flush
                            if self.progress < 0.99 {
                                // Give it a little time for buffers to flush
                                if elapsed > 5.0 {
                                    // If it's been more than 5 seconds since player stopped,
                                    // consider processing complete
                                    timer.invalidate()
                                    self.completionTimer = nil
                                    continuation.resume()
                                }
                            } else {
                                // Normal completion
                                timer.invalidate()
                                self.completionTimer = nil
                                continuation.resume()
                            }
                        }
                    }
                }
                
                // Add to the common run loop mode
                RunLoop.main.add(self.completionTimer!, forMode: .common)
            }
        }
    }
    
    // Helper method to check completion status (must be called on main actor)
    @MainActor private func checkCompletionStatus() -> Bool {
        return !playerNode.isPlaying && progress >= 1.0
    }
    
    // MARK: - Cleanup
    
    // Note: This must be called from MainActor or awaited if called from non-main contexts
    @MainActor
    func cleanup() {
        // Remove any installed taps
        audioEngine.mainMixerNode.removeTap(onBus: 0)
        
        // Stop the player node if it's playing
        if playerNode.isPlaying {
            playerNode.stop()
        }
        
        // Stop the engine if it's running
        if audioEngine.isRunning {
            audioEngine.stop()
        }
        
        // Invalidate completion timer if it exists
        completionTimer?.invalidate()
        completionTimer = nil
        
        // Reset processing state
        isProcessing = false
        progress = 0.0
        
        print("🧹 Audio processor cleaned up")
    }
    
    deinit {
        // Call cleanup to ensure resources are properly released
        // We use a synchronous task to call the MainActor-isolated method
        Task { @MainActor in
            cleanup()
        }
    }
}