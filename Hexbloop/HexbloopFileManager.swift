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
    
    // Clean up temporary files with improved error handling and logging
    func cleanupTempFiles() {
        do {
            // Check if the temp directory exists
            var isDirectory: ObjCBool = false
            if !FileManager.default.fileExists(atPath: tempDirectory.path, isDirectory: &isDirectory) || !isDirectory.boolValue {
                print("⚠️ Temp directory doesn't exist, creating it")
                try FileManager.default.createDirectory(at: tempDirectory, withIntermediateDirectories: true)
                return
            }
            
            // Get all files in the temp directory
            let fileURLs = try FileManager.default.contentsOfDirectory(
                at: tempDirectory,
                includingPropertiesForKeys: nil
            )
            
            if fileURLs.isEmpty {
                print("ℹ️ No temporary files to clean up")
                return
            }
            
            // Track successful and failed deletions
            var successCount = 0
            var failedFiles: [String] = []
            
            for fileURL in fileURLs {
                do {
                    try FileManager.default.removeItem(at: fileURL)
                    successCount += 1
                } catch {
                    // If we can't delete a file, track it but continue with others
                    failedFiles.append(fileURL.lastPathComponent)
                    print("⚠️ Could not delete temporary file: \(fileURL.lastPathComponent)")
                }
            }
            
            if failedFiles.isEmpty {
                print("🧹 Successfully cleaned up \(successCount) temporary files")
            } else {
                print("⚠️ Cleaned up \(successCount) files, but failed to delete \(failedFiles.count) files")
            }
        } catch {
            print("❌ Error during temp file cleanup: \(error.localizedDescription)")
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
    
    // Reveal a file in Finder with error handling
    func revealInFinder(url: URL) {
        // Check if file exists before attempting to reveal
        var isDirectory: ObjCBool = false
        if FileManager.default.fileExists(atPath: url.path, isDirectory: &isDirectory) {
            // For directories, try to select the directory itself
            if isDirectory.boolValue {
                // Open Finder with this directory as the root
                NSWorkspace.shared.selectFile(url.path, inFileViewerRootedAtPath: url.path)
            } else {
                // For a file, select it in its parent directory
                NSWorkspace.shared.selectFile(url.path, inFileViewerRootedAtPath: url.deletingLastPathComponent().path)
            }
            print("📂 Revealed in Finder: \(url.path)")
        } else {
            // If the file doesn't exist, open the parent directory
            let parentDir = url.deletingLastPathComponent()
            NSWorkspace.shared.selectFile(nil, inFileViewerRootedAtPath: parentDir.path)
            print("⚠️ Could not find file to reveal, opening parent directory: \(parentDir.path)")
        }
    }
    
    // Open a file with the default application
    func openFile(url: URL) {
        NSWorkspace.shared.open(url)
    }
}