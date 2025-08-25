import Foundation
import SwiftUI
import AVFoundation
import UniformTypeIdentifiers

// MARK: - Audio Processor Service
class AudioProcessorService: ObservableObject {
    // Processing state
    @Published var isProcessing = false
    @Published var progress: Float = 0.0
    
    // Core audio engine
    private let audioEngine = MacAudioEngine()
    
    // File manager
    private let fileManager = HexbloopFileManager.shared
    
    // Error types
    enum AudioProcessingError: Error {
        case processingFailed(String)
        case invalidFile(String)
        case metadataFailed(String)
    }
    
    // Process audio file with progress updates
    func processAudio(at sourceURL: URL, with parameters: ProcessingParameters) async throws -> URL {
        // Set processing state
        await MainActor.run {
            isProcessing = true
            progress = 0.0
        }
        
        // Make sure we always update state properly
        defer {
            Task { @MainActor in
                isProcessing = false
            }
        }
        
        do {
            // Validate file type - simplified approach
            guard FileManager.default.fileExists(atPath: sourceURL.path) else {
                throw AudioProcessingError.invalidFile("The file does not exist")
            }
            
            let pathExtension = sourceURL.pathExtension.lowercased()
            let audioExtensions = ["mp3", "wav", "m4a", "aac", "aif", "aiff", "flac", "caf"]
            
            guard audioExtensions.contains(pathExtension) else {
                throw AudioProcessingError.invalidFile("The file does not appear to be an audio file")
            }
            
            // Create a temporary name for the output
            let outputName = "processed_\(UUID().uuidString)"
            let outputURL = fileManager.generateUniqueOutputPath(
                baseName: outputName,
                fileExtension: "m4a"
            )
            
            // Ensure parent directory exists
            try FileManager.default.createDirectory(
                at: outputURL.deletingLastPathComponent(),
                withIntermediateDirectories: true,
                attributes: nil
            )
            
            // Process the file with our enhanced engine
            let success = try await audioEngine.processAudioFile(
                at: sourceURL,
                to: outputURL,
                with: parameters
            ) { [weak self] newProgress in
                Task { @MainActor [weak self] in
                    self?.progress = newProgress
                }
            }
            
            if success {
                // Check if the file was actually created
                if FileManager.default.fileExists(atPath: outputURL.path) {
                    return outputURL
                } else {
                    throw AudioProcessingError.processingFailed("Output file was not created")
                }
            } else {
                throw AudioProcessingError.processingFailed("Audio processing failed to complete")
            }
        } catch let engineError as MacAudioEngine.AudioProcessingError {
            // Convert engine errors to our service errors
            switch engineError {
            case .inputFileError(let message), 
                 .outputFileError(let message),
                 .processingError(let message),
                 .engineStartError(let message):
                throw AudioProcessingError.processingFailed(message)
                
            case .fileTooLarge(let message):
                throw AudioProcessingError.invalidFile(message)
                
            case .conversionFailed(let message):
                throw AudioProcessingError.processingFailed("Conversion failed: \(message)")
                
            case .metadataFailed(let message):
                throw AudioProcessingError.metadataFailed(message)
            }
        } catch {
            // Pass through other errors with better description
            throw AudioProcessingError.processingFailed("Error: \(error.localizedDescription)")
        }
    }
    
    // Process audio with metadata and artwork
    func processAudioWithMetadata(
        at sourceURL: URL,
        to outputURL: URL,
        with parameters: ProcessingParameters,
        artistName: String,
        albumName: String,
        trackName: String,
        artworkURL: URL?
    ) async throws -> URL {
        // Set processing state
        await MainActor.run {
            isProcessing = true
            progress = 0.0
        }
        
        // Ensure we reset state on exit
        defer {
            Task { @MainActor in
                isProcessing = false
            }
        }
        
        // First process the audio
        let success = try await audioEngine.processAudioFile(
            at: sourceURL,
            to: outputURL,
            with: parameters
        ) { [weak self] newProgress in
            Task { @MainActor [weak self] in
                self?.progress = newProgress * 0.8 // 80% for audio processing
            }
        }
        
        if !success {
            throw AudioProcessingError.processingFailed("Audio processing failed")
        }
        
        // Then apply metadata
        try await audioEngine.applyMetadataAndArtwork(
            to: outputURL,
            artistName: artistName,
            albumName: albumName,
            trackName: trackName,
            artworkURL: artworkURL
        )
        
        // Update progress to 100%
        await MainActor.run {
            progress = 1.0
        }
        
        return outputURL
    }
    
    // Batch process multiple files
    func batchProcessAudio(
        files: [URL],
        with parameters: ProcessingParameters,
        progressCallback: @escaping (String, Float) -> Void
    ) async -> [URL] {
        var processedFiles: [URL] = []
        
        // Process each file sequentially
        for (index, fileURL) in files.enumerated() {
            do {
                // Update overall progress
                let fileProgress = Float(index) / Float(files.count)
                progressCallback("Starting \(fileURL.lastPathComponent)", fileProgress)
                
                // Process this file
                let outputURL = try await processAudio(at: fileURL, with: parameters)
                processedFiles.append(outputURL)
                
                // Update progress for this file
                progressCallback("Completed \(fileURL.lastPathComponent)", (Float(index + 1) / Float(files.count)))
            } catch {
                print("Error processing file \(fileURL.lastPathComponent): \(error.localizedDescription)")
                // Continue with next file
            }
        }
        
        return processedFiles
    }
}