import Foundation
import GameKit

// MARK: - Configuration System
struct Configuration {
    // Import the ProcessingParameters from MacAudioEngine for compatibility
    var processingParameters: ProcessingParameters
    
    // Initialize with default or custom parameters
    init(processingParameters: ProcessingParameters = ProcessingParameters()) {
        self.processingParameters = processingParameters
    }
    
    // Generate configuration with natural influences
    static func generateWithNaturalInfluences() -> Configuration {
        let processingParameters = ProcessingParameters.generateWithMoonPhaseInfluence()
        return Configuration(processingParameters: processingParameters)
    }
}

// Note: The actual ProcessingParameters struct is now defined in MacAudioEngine.swift 
// This file is kept for compatibility with existing code.