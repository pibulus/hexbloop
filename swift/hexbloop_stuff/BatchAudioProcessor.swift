import Foundation
import AVFoundation
import AppKit

// MARK: - Streamlined Batch Audio Processor
class BatchAudioProcessor {
    
    // Process multiple files quickly without UI overhead
    static func processBatch(
        files: [URL],
        parameters: ProcessingParameters,
        completion: @escaping ([URL]) -> Void
    ) async {
        var processedFiles: [URL] = []
        
        // Process files concurrently for speed
        await withTaskGroup(of: URL?.self) { group in
            for file in files {
                group.addTask {
                    do {
                        return try await processFile(file, parameters: parameters)
                    } catch {
                        print("Failed to process \(file.lastPathComponent): \(error)")
                        return nil
                    }
                }
            }
            
            // Collect results
            for await result in group {
                if let url = result {
                    processedFiles.append(url)
                }
            }
        }
        
        completion(processedFiles)
    }
    
    // Streamlined single file processing
    private static func processFile(_ inputURL: URL, parameters: ProcessingParameters) async throws -> URL {
        // Generate mystical name
        let nameGen = NameGenerator()
        let dateStr = Date().formatted(.dateTime.year().month().day()).replacingOccurrences(of: "/", with: "")
        let mysticalName = "\(dateStr)_\(nameGen.generateGlitchedName())"
        
        // Create output path
        let outputURL = HexbloopFileManager.shared.generateUniqueOutputPath(
            baseName: mysticalName,
            fileExtension: "m4a"
        )
        
        // Quick audio processing without progress tracking
        try await quickProcessAudio(from: inputURL, to: outputURL, parameters: parameters)
        
        // Generate and embed artwork
        let artGen = ArtGenerator()
        let svgContent = artGen.generateProceduralArt(name: mysticalName)
        let artworkImage = try await createPNGFromSVG(svgContent)
        
        // Apply metadata with embedded artwork
        try await applyMetadataQuick(
            to: outputURL,
            trackName: mysticalName,
            artwork: artworkImage
        )
        
        return outputURL
    }
    
    // Fast audio processing without UI callbacks
    private static func quickProcessAudio(
        from sourceURL: URL,
        to destinationURL: URL,
        parameters: ProcessingParameters
    ) async throws {
        // Load the audio file
        let asset = AVAsset(url: sourceURL)
        guard let audioTrack = try await asset.loadTracks(withMediaType: .audio).first else {
            throw HexbloopError.processingFailed("No audio tracks found")
        }
        
        // Create simple processing engine
        let engine = AVAudioEngine()
        let playerNode = AVAudioPlayerNode()
        
        // Add effects matching the script
        let distortion = AVAudioUnitDistortion()
        distortion.loadFactoryPreset(.drumsBitBrush)
        distortion.wetDryMix = parameters.distortionAmount * 100
        
        let eq = AVAudioUnitEQ(numberOfBands: 3)
        eq.bands[0].filterType = .highPass
        eq.bands[0].frequency = parameters.highPassFreq
        eq.bands[1].filterType = .parametric
        eq.bands[1].frequency = parameters.midFreq
        eq.bands[1].gain = parameters.midGain
        eq.bands[2].filterType = .lowPass
        eq.bands[2].frequency = parameters.lowPassFreq
        
        let reverb = AVAudioUnitReverb()
        reverb.loadFactoryPreset(.mediumHall)
        reverb.wetDryMix = parameters.reverbAmount * 100
        
        // Connect nodes
        engine.attach(playerNode)
        engine.attach(distortion)
        engine.attach(eq)
        engine.attach(reverb)
        
        let format = engine.outputNode.inputFormat(forBus: 0)
        engine.connect(playerNode, to: eq, format: format)
        engine.connect(eq, to: distortion, format: format)
        engine.connect(distortion, to: reverb, format: format)
        engine.connect(reverb, to: engine.mainMixerNode, format: format)
        
        // Use offline rendering for speed
        try engine.enableManualRenderingMode(
            .offline,
            format: format,
            maximumFrameCount: 4096
        )
        
        try engine.start()
        
        // Process the audio file
        let file = try AVAudioFile(forReading: sourceURL)
        let buffer = AVAudioPCMBuffer(
            pcmFormat: file.processingFormat,
            frameCapacity: AVAudioFrameCount(file.length)
        )!
        try file.read(into: buffer)
        
        playerNode.scheduleBuffer(buffer, at: nil)
        playerNode.play()
        
        // Render to output file
        let outputFile = try AVAudioFile(
            forWriting: destinationURL,
            settings: [
                AVFormatIDKey: kAudioFormatMPEG4AAC,
                AVSampleRateKey: 44100,
                AVNumberOfChannelsKey: 2,
                AVEncoderBitRateKey: 256000
            ]
        )
        
        let outputBuffer = AVAudioPCMBuffer(
            pcmFormat: engine.manualRenderingFormat,
            frameCapacity: engine.manualRenderingMaximumFrameCount
        )!
        
        while engine.manualRenderingSampleTime < file.length {
            let framesToRender = min(
                outputBuffer.frameCapacity,
                AVAudioFrameCount(file.length - engine.manualRenderingSampleTime)
            )
            
            let status = try engine.renderOffline(framesToRender, to: outputBuffer)
            if status == .success {
                try outputFile.write(from: outputBuffer)
            }
        }
        
        playerNode.stop()
        engine.stop()
    }
    
    // Convert SVG to PNG for embedding
    private static func createPNGFromSVG(_ svgContent: String) async throws -> NSImage {
        let data = svgContent.data(using: .utf8)!
        let svgImage = NSImage(data: data) ?? NSImage(size: NSSize(width: 512, height: 512))
        
        // Create bitmap representation
        let targetSize = NSSize(width: 512, height: 512)
        let bitmapRep = NSBitmapImageRep(
            bitmapDataPlanes: nil,
            pixelsWide: Int(targetSize.width),
            pixelsHigh: Int(targetSize.height),
            bitsPerSample: 8,
            samplesPerPixel: 4,
            hasAlpha: true,
            isPlanar: false,
            colorSpaceName: .deviceRGB,
            bytesPerRow: 0,
            bitsPerPixel: 0
        )!
        
        NSGraphicsContext.saveGraphicsState()
        NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: bitmapRep)
        svgImage.draw(in: NSRect(origin: .zero, size: targetSize))
        NSGraphicsContext.restoreGraphicsState()
        
        let image = NSImage(size: targetSize)
        image.addRepresentation(bitmapRep)
        return image
    }
    
    // Quick metadata application
    private static func applyMetadataQuick(
        to fileURL: URL,
        trackName: String,
        artwork: NSImage
    ) async throws {
        let asset = AVMutableAsset(url: fileURL)
        let metadata = AVMutableMetadataItem()
        
        // Create metadata items
        var items: [AVMetadataItem] = []
        
        // Track name
        let titleItem = AVMutableMetadataItem()
        titleItem.identifier = .commonIdentifierTitle
        titleItem.value = trackName as NSString
        items.append(titleItem)
        
        // Artist
        let artistItem = AVMutableMetadataItem()
        artistItem.identifier = .commonIdentifierArtist
        artistItem.value = "HEX_BLOOP_\(Calendar.current.component(.year, from: Date()))" as NSString
        items.append(artistItem)
        
        // Album
        let albumItem = AVMutableMetadataItem()
        albumItem.identifier = .commonIdentifierAlbumName
        albumItem.value = "CYBER_GRIMOIRE_\(Date().formatted(.dateTime.year().month().day()))" as NSString
        items.append(albumItem)
        
        // Artwork
        if let pngData = artwork.tiffRepresentation?.bitmap?.representation(using: .png, properties: [:]) {
            let artworkItem = AVMutableMetadataItem()
            artworkItem.identifier = .commonIdentifierArtwork
            artworkItem.value = pngData as NSData
            artworkItem.dataType = kCMMetadataBaseDataType_PNG as String
            items.append(artworkItem)
        }
        
        // Export with metadata
        guard let exportSession = AVAssetExportSession(
            asset: asset,
            presetName: AVAssetExportPresetPassthrough
        ) else {
            throw HexbloopError.processingFailed("Cannot create export session")
        }
        
        let tempURL = fileURL.appendingPathExtension("tmp")
        exportSession.outputURL = tempURL
        exportSession.outputFileType = .m4a
        exportSession.metadata = items
        
        await exportSession.export()
        
        if exportSession.status == .completed {
            try FileManager.default.removeItem(at: fileURL)
            try FileManager.default.moveItem(at: tempURL, to: fileURL)
        } else {
            throw HexbloopError.processingFailed("Metadata export failed")
        }
    }
}

// Helper extension
extension NSBitmapImageRep {
    var bitmap: NSBitmapImageRep? { return self }
}