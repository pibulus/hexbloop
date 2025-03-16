import Foundation
import AppKit

// MARK: - Hexbloop File Manager
class HexbloopFileManager {
    // Directory URLs
    let tempDirectory: URL
    let outputDirectory: URL
    
    // Singleton instance
    static let shared = HexbloopFileManager()
    
    // MARK: - Initialization
    
    init() {
        // Set up directories in user's Documents folder
        let documentsURL = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        
        tempDirectory = documentsURL.appendingPathComponent("HexbloopTemp", isDirectory: true)
        outputDirectory = documentsURL.appendingPathComponent("HexbloopOutput", isDirectory: true)
        
        // Create directories if they don't exist
        try? setupDirectories()
    }
    
    // MARK: - Directory Management
    
    // Set up required directories
    func setupDirectories() throws {
        try FileManager.default.createDirectory(at: tempDirectory, withIntermediateDirectories: true)
        try FileManager.default.createDirectory(at: outputDirectory, withIntermediateDirectories: true)
        
        print("✨ Directories created successfully:")
        print("   Temp: \(tempDirectory.path)")
        print("   Output: \(outputDirectory.path)")
    }
    
    // Create a new session directory with timestamp
    func createSessionDirectory() -> URL {
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd_HH-mm-ss"
        let timestamp = dateFormatter.string(from: Date())
        
        let sessionDir = outputDirectory.appendingPathComponent("session_\(timestamp)", isDirectory: true)
        
        try? FileManager.default.createDirectory(at: sessionDir, withIntermediateDirectories: true)
        return sessionDir
    }
    
    // Generate a unique output file path
    func generateUniqueOutputPath(baseName: String, fileExtension: String) -> URL {
        // Sanitize base name for file system
        let sanitizedName = baseName
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "\\", with: "_")
            .replacingOccurrences(of: ":", with: "_")
            .replacingOccurrences(of: "*", with: "_")
            .replacingOccurrences(of: "?", with: "_")
            .replacingOccurrences(of: "\"", with: "_")
            .replacingOccurrences(of: "<", with: "_")
            .replacingOccurrences(of: ">", with: "_")
            .replacingOccurrences(of: "|", with: "_")
        
        let fileName = "\(sanitizedName).\(fileExtension)"
        var outputURL = outputDirectory.appendingPathComponent(fileName)
        
        // If file exists, add numeric suffix
        if FileManager.default.fileExists(atPath: outputURL.path) {
            var counter = 1
            repeat {
                outputURL = outputDirectory.appendingPathComponent("\(sanitizedName)_\(counter).\(fileExtension)")
                counter += 1
            } while FileManager.default.fileExists(atPath: outputURL.path)
        }
        
        return outputURL
    }
    
    // Create a temporary file path
    func createTemporaryFilePath(withExtension fileExtension: String) -> URL {
        let uuid = UUID().uuidString
        return tempDirectory.appendingPathComponent("\(uuid).\(fileExtension)")
    }
    
    // Clean up temporary files
    func cleanupTempFiles() {
        do {
            let fileURLs = try FileManager.default.contentsOfDirectory(
                at: tempDirectory,
                includingPropertiesForKeys: nil
            )
            
            for fileURL in fileURLs {
                try FileManager.default.removeItem(at: fileURL)
            }
            
            print("🧹 Cleaned up temporary files")
        } catch {
            print("❌ Error cleaning up temporary files: \(error)")
        }
    }
    
    // Get all processed files in the output directory
    func getProcessedFiles() -> [URL] {
        do {
            let fileURLs = try FileManager.default.contentsOfDirectory(
                at: outputDirectory,
                includingPropertiesForKeys: nil
            )
            return fileURLs.sorted { url1, url2 in
                (try? url1.resourceValues(forKeys: [.contentModificationDateKey]).contentModificationDate) ?? Date() >
                (try? url2.resourceValues(forKeys: [.contentModificationDateKey]).contentModificationDate) ?? Date()
            }
        } catch {
            print("❌ Error getting processed files: \(error)")
            return []
        }
    }
    
    // Reveal a file in Finder
    func revealInFinder(url: URL) {
        NSWorkspace.shared.selectFile(url.path, inFileViewerRootedAtPath: "")
    }
    
    // Open a file with the default application
    func openFile(url: URL) {
        NSWorkspace.shared.open(url)
    }
}