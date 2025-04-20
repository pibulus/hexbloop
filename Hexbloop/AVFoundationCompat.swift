import Foundation
import AVFoundation

// MARK: - AVFoundation Compatibility Extensions
// These extensions provide compatibility between older and newer AVFoundation APIs

extension AVAsset {
    // Create an asset from a URL with compatibility across macOS versions
    static func compatibleAsset(url: URL) -> AVAsset {
        if #available(macOS 15.0, *) {
            return AVURLAsset(url: url)
        } else {
            return AVAsset(url: url)
        }
    }
    
    // Check isExportable with compatibility across macOS versions
    func isAssetExportable() async throws -> Bool {
        if #available(macOS 13.0, *) {
            return try await self.load(.isExportable)
        } else {
            return self.isExportable
        }
    }
    
    // Get audio tracks with compatibility across macOS versions
    func getAudioTracks() async throws -> [AVAssetTrack] {
        if #available(macOS 13.0, *) {
            return try await self.loadTracks(withMediaType: .audio)
        } else {
            return self.tracks(withMediaType: .audio)
        }
    }
}

extension AVAssetExportSession {
    // Export with compatibility across macOS versions
    func compatibleExport() async throws {
        if #available(macOS 15.0, *) {
            guard let outputURL = self.outputURL, let outputFileType = self.outputFileType else {
                throw NSError(domain: "AVAssetExportError", code: -1, userInfo: [NSLocalizedDescriptionKey: "Missing output URL or file type"])
            }
            try await self.export(to: outputURL, as: outputFileType)
        } else {
            await self.export()
        }
    }
    
    // Check export status with compatibility across macOS versions
    func getExportStatus() -> AVAssetExportSession.Status {
        // For now, just return the current status
        // In macOS 15+, we would use states(updateInterval:)
        return self.status
    }
    
    // Get export error with compatibility across macOS versions
    func getExportError() -> Error? {
        // For now, just return the current error
        // In macOS 15+, this would be handled differently
        return self.error
    }
}