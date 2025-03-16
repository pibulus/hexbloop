import Foundation
import AVFoundation
import GameKit

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
    
    // Process audio file with AVAssetExportSession
    func processAudioFile(
        at sourceURL: URL,
        to destinationURL: URL,
        with parameters: ProcessingParameters,
        progressHandler: @escaping ProgressHandler
    ) async throws -> Bool {
        // 1. Validate input file
        guard FileManager.default.fileExists(atPath: sourceURL.path) else {
            throw AudioProcessingError.inputFileError("Input file does not exist")
        }
        
        // Show initial progress
        progressHandler(0.1)
        
        do {
            // Create directories if needed
            try FileManager.default.createDirectory(
                at: destinationURL.deletingLastPathComponent(),
                withIntermediateDirectories: true
            )
            
            // 2. Create an AVAsset from the input file
            let asset = AVAsset(url: sourceURL)
            
            // Check if the asset is valid and can be exported
            guard asset.isExportable, 
                  asset.tracks(withMediaType: .audio).count > 0 else {
                throw AudioProcessingError.inputFileError("Audio file cannot be processed")
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
            
            // 6. Move the processed file to the destination
            if FileManager.default.fileExists(atPath: destinationURL.path) {
                try FileManager.default.removeItem(at: destinationURL)
            }
            try FileManager.default.moveItem(at: processedAudioURL, to: destinationURL)
            
            // Show final progress
            progressHandler(1.0)
            
            return true
        } catch {
            throw AudioProcessingError.processingError("Error processing audio: \(error.localizedDescription)")
        }
    }
    
    // Convert audio to a standard format with AVAssetExportSession
    private func convertAudio(
        asset: AVAsset,
        to outputURL: URL,
        format: AVFileType,
        with parameters: ProcessingParameters
    ) async throws -> URL {
        // Create an export session
        guard let exportSession = AVAssetExportSession(
            asset: asset,
            presetName: AVAssetExportPresetAppleM4A
        ) else {
            throw AudioProcessingError.conversionFailed("Unable to create export session")
        }
        
        // Configure the export session
        exportSession.outputURL = outputURL
        exportSession.outputFileType = format
        exportSession.shouldOptimizeForNetworkUse = true
        
        // Configure audio mix for adjusting gain if needed
        if parameters.outputGain != 0.0 {
            let audioMix = createGainAudioMix(for: asset, gain: parameters.outputGain)
            exportSession.audioMix = audioMix
        }
        
        // Perform the export
        await exportSession.export()
        
        // Check for export completion
        if exportSession.status == .completed {
            return outputURL
        } else if let error = exportSession.error {
            throw AudioProcessingError.conversionFailed("Export failed: \(error.localizedDescription)")
        } else {
            throw AudioProcessingError.conversionFailed("Export failed with status: \(exportSession.status.rawValue)")
        }
    }
    
    // Create an audio mix to adjust gain
    private func createGainAudioMix(for asset: AVAsset, gain: Float) -> AVAudioMix {
        let audioMix = AVMutableAudioMix()
        var trackMixes: [AVMutableAudioMixInputParameters] = []
        
        // Get audio tracks
        let audioTracks = asset.tracks(withMediaType: .audio)
        
        // Create input parameters for each audio track
        for track in audioTracks {
            let parameters = AVMutableAudioMixInputParameters(track: track)
            parameters.setVolume(pow(10, gain/20), at: CMTime.zero) // Convert dB to linear gain
            trackMixes.append(parameters)
        }
        
        audioMix.inputParameters = trackMixes
        return audioMix
    }
    
    // Apply audio effects using AVAudioEngine
    private func applyAudioEffects(
        at audioURL: URL,
        with parameters: ProcessingParameters,
        progressCallback: @escaping (Float) -> Void
    ) async throws {
        // Read the audio file
        let audioFile = try AVAudioFile(forReading: audioURL)
        
        // Create a temporary output file for processing
        let outputFormat = audioFile.processingFormat
        let tempOutputURL = FileManager.default.temporaryDirectory.appendingPathComponent("hexbloop_effects_\(UUID().uuidString).m4a")
        
        let outputFile = try AVAudioFile(
            forWriting: tempOutputURL,
            settings: audioFile.fileFormat.settings,
            commonFormat: .pcmFormatFloat32,
            interleaved: false
        )
        
        // Set up the audio engine
        let engine = AVAudioEngine()
        let playerNode = AVAudioPlayerNode()
        
        // Add effects nodes
        let eqNode = AVAudioUnitEQ(numberOfBands: 10)
        let distortionNode = AVAudioUnitDistortion()
        let reverbNode = AVAudioUnitReverb()
        let delayNode = AVAudioUnitDelay()
        
        // Configure EQ
        configureEQ(eqNode, with: parameters)
        
        // Configure distortion
        distortionNode.loadFactoryPreset(AVAudioUnitDistortionPreset(rawValue: parameters.distortionPreset.audioUnitPreset)!)
        distortionNode.wetDryMix = parameters.distortionAmount * 100.0
        
        // Configure reverb
        reverbNode.loadFactoryPreset(.mediumHall)
        reverbNode.wetDryMix = parameters.reverbAmount * 100.0
        
        // Configure delay
        delayNode.delayTime = TimeInterval(parameters.delayTime)
        delayNode.feedback = parameters.delayFeedback * 100.0
        delayNode.wetDryMix = parameters.delayTime > 0 ? 50.0 : 0.0
        
        // Add nodes to engine
        engine.attach(playerNode)
        engine.attach(eqNode)
        engine.attach(distortionNode)
        engine.attach(reverbNode)
        engine.attach(delayNode)
        
        // Connect nodes
        engine.connect(playerNode, to: eqNode, format: outputFormat)
        engine.connect(eqNode, to: distortionNode, format: outputFormat)
        engine.connect(distortionNode, to: reverbNode, format: outputFormat)
        engine.connect(reverbNode, to: delayNode, format: outputFormat)
        engine.connect(delayNode, to: engine.mainMixerNode, format: outputFormat)
        
        // Set up the tap to record processed audio
        engine.mainMixerNode.installTap(
            onBus: 0,
            bufferSize: 4096,
            format: outputFormat
        ) { buffer, time in
            do {
                try outputFile.write(from: buffer)
            } catch {
                print("Error writing buffer: \(error)")
            }
        }
        
        // Start the engine
        try engine.start()
        
        // Use continuations to handle completion waiting
        try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Void, Error>) in
            // Set up a completion block to know when playback finishes
            playerNode.scheduleFile(audioFile, at: nil) { 
                DispatchQueue.main.async {
                    continuation.resume()
                }
            }
            
            // Start playback
            playerNode.play()
            
            // Setup progress tracking on a separate timer
            let fileLength = audioFile.length
            let progressUpdateInterval = 0.1
            
            // Create a timer to update progress
            let progressTimer = Timer.scheduledTimer(withTimeInterval: progressUpdateInterval, repeats: true) { timer in
                guard playerNode.isPlaying else {
                    timer.invalidate()
                    return
                }
                
                // Calculate approximate progress
                let elapsedTime = timer.fireDate.timeIntervalSince(Date())
                let estimatedFrame = AVAudioFramePosition(elapsedTime * audioFile.processingFormat.sampleRate)
                let progress = min(Float(estimatedFrame) / Float(fileLength), 1.0)
                
                progressCallback(progress)
            }
            
            // Add the timer to the run loop
            RunLoop.main.add(progressTimer, forMode: .common)
        }
        
        // Ensure all buffers are processed
        try await Task.sleep(nanoseconds: 500_000_000) // 0.5 seconds
        
        // Stop and clean up
        engine.mainMixerNode.removeTap(onBus: 0)
        playerNode.stop()
        engine.stop()
        
        // Replace the original file with the processed one
        if FileManager.default.fileExists(atPath: audioURL.path) {
            try FileManager.default.removeItem(at: audioURL)
        }
        try FileManager.default.moveItem(at: tempOutputURL, to: audioURL)
        
        progressCallback(1.0)
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
    
    // Apply metadata and artwork to audio file
    func applyMetadataAndArtwork(
        to audioURL: URL,
        artistName: String,
        albumName: String,
        trackName: String,
        artworkURL: URL?
    ) async throws {
        // Create an AVAsset from the processed file
        let asset = AVAsset(url: audioURL)
        
        // Create an export session for metadata
        guard let exportSession = AVAssetExportSession(
            asset: asset,
            presetName: AVAssetExportPresetAppleM4A
        ) else {
            throw AudioProcessingError.metadataFailed("Unable to create export session for metadata")
        }
        
        // Create a temporary output file
        let tempOutputURL = FileManager.default.temporaryDirectory.appendingPathComponent("hexbloop_metadata_\(UUID().uuidString).m4a")
        
        // Configure export session
        exportSession.outputURL = tempOutputURL
        exportSession.outputFileType = .m4a
        exportSession.shouldOptimizeForNetworkUse = true
        
        // Create metadata
        let metadata = createMetadata(
            artistName: artistName,
            albumName: albumName,
            trackName: trackName,
            artworkURL: artworkURL
        )
        
        // Apply metadata
        exportSession.metadata = metadata
        
        // Perform export
        await exportSession.export()
        
        // Check export status
        if exportSession.status == .completed {
            // Replace the original file
            if FileManager.default.fileExists(atPath: audioURL.path) {
                try FileManager.default.removeItem(at: audioURL)
            }
            try FileManager.default.moveItem(at: tempOutputURL, to: audioURL)
        } else if let error = exportSession.error {
            throw AudioProcessingError.metadataFailed("Metadata export failed: \(error.localizedDescription)")
        } else {
            throw AudioProcessingError.metadataFailed("Metadata export failed with status: \(exportSession.status.rawValue)")
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