import Foundation
import AVFoundation
import os.log

// MARK: - Audio Processing Optimizer for Mac App Store Compliance
// This class combines various optimizations for audio processing
// to ensure compatibility with macOS 15.0 and App Store guidelines

class AudioProcessingOptimizer {
    // Constants for optimal performance
    enum Constants {
        static let maxCachedAssets = 8            // Number of assets to keep in memory
        static let defaultBufferSize = 4096       // Default audio buffer size
        static let exportTimeout = 300.0          // Maximum export time (5 minutes)
        static let progressUpdateInterval = 0.5   // Progress update frequency
        static let minDiskSpace: UInt64 = 1024 * 1024 * 100 // 100MB minimum free space
    }
    
    // Shared instance for app-wide use
    static let shared = AudioProcessingOptimizer()
    
    // Caching system for assets
    private var assetCache: [URL: AVAsset] = [:]
    private let cacheLock = NSLock()
    
    // Logger for efficient logging
    private let logger: OSLog
    
    // Memory usage monitor
    private var lastMemoryCheck = Date()
    private let memoryCheckInterval: TimeInterval = 60.0 // Check memory usage every minute
    
    // MARK: - Initialization
    
    init() {
        logger = OSLog(subsystem: "com.hexbloop.audio", category: "Optimization")
        prepareAudioSystem()
    }
    
    // MARK: - System Preparation
    
    // Initialize audio system for macOS 15.0 compatibility
    func prepareAudioSystem() {
        os_log("Preparing audio system", log: logger, type: .info)
        
        // Run platform-specific optimizations
        // This will handle model detection and apply fixes only when needed
        fixPlatformUtilitiesIssue()
        
        // Note: initializeAudioEngine is now only called for non-Mac14,15 models
        // to prevent crashes - see fixPlatformUtilitiesIssue method
        
        // Configure buffer sizes for optimal performance
        configureOptimalBufferSizes()
    }
    
    // Fix for PlatformUtilities errors on newer Mac models
    private func fixPlatformUtilitiesIssue() {
        os_log("Applying platform utilities fix", log: logger, type: .debug)
        
        // macOS doesn't have AVAudioSession, so we use different approach
        // Use Process to get hardware model info directly
        let process = Process()
        process.launchPath = "/usr/sbin/sysctl"
        process.arguments = ["-n", "hw.model"]
        
        let pipe = Pipe()
        process.standardOutput = pipe
        
        do {
            try process.run()
            process.waitUntilExit()
            
            // Read hardware model
            let data = pipe.fileHandleForReading.readDataToEndOfFile()
            if let model = String(data: data, encoding: .utf8)?.trimmingCharacters(in: .whitespacesAndNewlines) {
                os_log("Detected hardware model: %{public}s", log: logger, type: .debug, model)
                
                // For Mac14,15 models, we skip special handling as it causes crashes
                if model.contains("Mac14,15") {
                    os_log("Detected Mac14,15 model - skipping audio optimization to prevent crash", log: logger, type: .info)
                    // Skip special audio initialization on this model
                } else {
                    // Only for other models, do the standard initialization
                    os_log("Standard audio initialization for non-Mac14,15 model", log: logger, type: .debug)
                    initializeAudioEngine()
                }
            }
        } catch {
            // Silently ignore errors - this is just a detection mechanism
            os_log("Failed to detect hardware model: %{public}s", log: logger, type: .debug, error.localizedDescription)
        }
    }
    
    // Special initialization for newer Mac models to avoid PlatformUtilities errors
    private func initializeCoreAudioForNewModels() {
        // For macOS, we need to initialize core audio differently than iOS
        // This is just a placeholder - the real work is done in the silent audio initialization
        os_log("Initializing Core Audio for newer Mac models", log: logger, type: .debug)
        
        // Create a minimal audio engine with required nodes to avoid exceptions
        let tempEngine = AVAudioEngine()
        
        // Create a dummy output node - required to prevent "required condition is false" exception
        let mixer = tempEngine.mainMixerNode
        
        // Generate a short silent buffer
        let format = AVAudioFormat(standardFormatWithSampleRate: 44100, channels: 2)!
        let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: 1024)!
        buffer.frameLength = 1024
        
        // Create a player node and add to engine
        let playerNode = AVAudioPlayerNode()
        tempEngine.attach(playerNode)
        tempEngine.connect(playerNode, to: mixer, format: format)
        
        // Now that we have nodes, prepare and start
        tempEngine.prepare()
        
        do {
            try tempEngine.start()
            // Stop after a very brief time - just enough to initialize hardware
            Thread.sleep(forTimeInterval: 0.05)
            tempEngine.stop()
        } catch {
            os_log("Core Audio initialization warning: %{public}s", log: logger, type: .error, error.localizedDescription)
        }
    }
    
    // Initialize audio engine with silent audio to warmup the system
    private func initializeAudioEngine() {
        os_log("Initializing audio engine with silent audio warmup", log: logger, type: .debug)
        
        // Audio engine setup - with defensive coding to prevent node exceptions
        let engine = AVAudioEngine()
        
        // Ensure format is compatible across all macOS versions
        guard let format = AVAudioFormat(standardFormatWithSampleRate: 44100, channels: 2) else {
            os_log("Failed to create audio format", log: logger, type: .error)
            return
        }
        
        // Create a short silent buffer - with nil checks
        guard let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: 1024) else {
            os_log("Failed to create audio buffer", log: logger, type: .error)
            return
        }
        buffer.frameLength = 1024
        
        // Get main mixer node and ensure it exists
        let mixer = engine.mainMixerNode
        
        // Create a player node and add to engine
        let playerNode = AVAudioPlayerNode()
        engine.attach(playerNode)
        engine.connect(playerNode, to: mixer, format: format)
        
        // We need to prepare before starting (connects all nodes)
        engine.prepare()
        
        do {
            try engine.start()
            
            // Schedule buffer with completion handler
            playerNode.scheduleBuffer(buffer, at: nil, options: .interrupts) {
                // Ensure we stop the engine when done
                if engine.isRunning {
                    engine.stop()
                }
            }
            
            // Start playback
            playerNode.play()
            
            // Run for a very short time
            Thread.sleep(forTimeInterval: 0.1)
            
            // Make sure everything is stopped
            if playerNode.isPlaying {
                playerNode.stop()
            }
            if engine.isRunning {
                engine.stop()
            }
            
        } catch {
            os_log("Audio engine warmup failed: %{public}s", log: logger, type: .error, error.localizedDescription)
        }
    }
    
    // Configure optimal buffer sizes for current hardware
    func configureOptimalBufferSizes() -> (input: Int, processing: Int) {
        // Default sizes that work well across devices
        var inputSize = Constants.defaultBufferSize
        var processingSize = Constants.defaultBufferSize / 2
        
        // Adjust based on available memory
        let memoryInfo = checkMemoryUsage()
        if memoryInfo.available > 4 * 1024 * 1024 * 1024 {  // More than 4GB free
            inputSize *= 2
            processingSize *= 2
        } else if memoryInfo.available < 1024 * 1024 * 1024 {  // Less than 1GB free
            inputSize /= 2
            processingSize /= 2
        }
        
        os_log("Configured buffer sizes - input: %d, processing: %d", log: logger, type: .debug, inputSize, processingSize)
        return (inputSize, processingSize)
    }
    
    // MARK: - Asset Management
    
    // Get an optimized asset with caching
    func optimizedAsset(for url: URL) -> AVAsset {
        cacheLock.lock()
        defer { cacheLock.unlock() }
        
        // Check if asset is in cache
        if let cachedAsset = assetCache[url] {
            os_log("Using cached asset for %{public}s", log: logger, type: .debug, url.lastPathComponent)
            return cachedAsset
        }
        
        // Create new asset using compatibility helper
        let asset = AVAsset.compatibleAsset(url: url)
        
        // Manage cache size
        if assetCache.count >= Constants.maxCachedAssets {
            // Remove oldest entry
            if let oldestKey = assetCache.keys.first {
                assetCache.removeValue(forKey: oldestKey)
                os_log("Removed oldest asset from cache: %{public}s", log: logger, type: .debug, oldestKey.lastPathComponent)
            }
        }
        
        // Add to cache
        assetCache[url] = asset
        os_log("Added asset to cache: %{public}s", log: logger, type: .debug, url.lastPathComponent)
        
        // Check memory periodically
        let now = Date()
        if now.timeIntervalSince(lastMemoryCheck) > memoryCheckInterval {
            lastMemoryCheck = now
            let memoryInfo = checkMemoryUsage()
            os_log("Memory usage: %lld MB / %lld MB available", log: logger, type: .debug, 
                   memoryInfo.usage / (1024 * 1024), memoryInfo.available / (1024 * 1024))
            
            // If memory is getting tight, clear cache more aggressively
            if memoryInfo.available < 512 * 1024 * 1024 { // Less than 512MB available
                clearCache()
            }
        }
        
        return asset
    }
    
    // Clear the asset cache
    func clearCache() {
        cacheLock.lock()
        defer { cacheLock.unlock() }
        
        assetCache.removeAll()
        os_log("Asset cache cleared", log: logger, type: .info)
    }
    
    // MARK: - Export Session Optimization
    
    // Create an optimized export session with the right configuration
    func createOptimizedExportSession(for asset: AVAsset, preset: String) -> AVAssetExportSession? {
        guard let session = AVAssetExportSession(asset: asset, presetName: preset) else {
            os_log("Failed to create export session", log: logger, type: .error)
            return nil
        }
        
        // Configure export session for optimal performance
        session.timeRange = CMTimeRange(start: .zero, duration: asset.duration)
        session.shouldOptimizeForNetworkUse = false
        
        // Add validation for output path
        if let outputURL = session.outputURL {
            // Ensure we have enough disk space
            ensureSufficientDiskSpace(at: outputURL)
        }
        
        return session
    }
    
    // Export with progress monitoring and timeout
    func exportWithProgress(
        _ session: AVAssetExportSession,
        progressHandler: @escaping (Float) -> Void
    ) async throws {
        let progressUpdateInterval = Constants.progressUpdateInterval
        
        // Use task for progress monitoring
        let progressTask = Task {
            while !Task.isCancelled {
                try? await Task.sleep(nanoseconds: UInt64(progressUpdateInterval * 1_000_000_000))
                progressHandler(session.progress)
                if session.progress >= 1.0 || session.status != .exporting {
                    break
                }
            }
        }
        
        // Use timeout to prevent hanging exports
        try await withTimeout(seconds: Constants.exportTimeout) {
            try await session.compatibleExport()
        }
        
        // Cancel progress updates
        progressTask.cancel()
        
        // Check status
        if session.getExportStatus() != .completed {
            if let error = session.getExportError() {
                throw error
            } else {
                throw NSError(
                    domain: "AudioProcessingOptimizer",
                    code: 1001,
                    userInfo: [NSLocalizedDescriptionKey: "Export failed with status: \(session.getExportStatus().rawValue)"]
                )
            }
        }
    }
    
    // MARK: - System Utilities
    
    // Helper for timeouts
    private func withTimeout<T>(seconds: TimeInterval, operation: @escaping () async throws -> T) async throws -> T {
        return try await withThrowingTaskGroup(of: T.self) { group in
            // Add the main operation
            group.addTask {
                return try await operation()
            }
            
            // Add a timeout task
            group.addTask {
                try await Task.sleep(nanoseconds: UInt64(seconds * 1_000_000_000))
                throw NSError(
                    domain: "AudioProcessingOptimizer",
                    code: 1002,
                    userInfo: [NSLocalizedDescriptionKey: "Operation timed out after \(seconds) seconds"]
                )
            }
            
            // Return the first completed task result
            guard let result = try await group.next() else {
                throw NSError(
                    domain: "AudioProcessingOptimizer",
                    code: 1003,
                    userInfo: [NSLocalizedDescriptionKey: "No task completed"]
                )
            }
            
            // Cancel any remaining tasks
            group.cancelAll()
            
            return result
        }
    }
    
    // Check memory usage
    private func checkMemoryUsage() -> (usage: UInt64, available: UInt64) {
        var info = mach_task_basic_info()
        var count = mach_msg_type_number_t(MemoryLayout<mach_task_basic_info>.size)/4
        
        let kerr: kern_return_t = withUnsafeMutablePointer(to: &info) {
            $0.withMemoryRebound(to: integer_t.self, capacity: Int(count)) {
                task_info(mach_task_self_,
                          task_flavor_t(MACH_TASK_BASIC_INFO),
                          $0,
                          &count)
            }
        }
        
        let memoryUsage = (kerr == KERN_SUCCESS) ? info.resident_size : 0
        
        // Get available memory (simplified)
        var availableMemory: UInt64 = 0
        
        let host = mach_host_self()
        var host_size = mach_msg_type_number_t(MemoryLayout<vm_statistics64_data_t>.size / MemoryLayout<integer_t>.size)
        var host_info_data = vm_statistics64_data_t()
        
        let host_error = withUnsafeMutablePointer(to: &host_info_data) {
            $0.withMemoryRebound(to: integer_t.self, capacity: Int(host_size)) {
                host_statistics64(host, HOST_VM_INFO64, $0, &host_size)
            }
        }
        
        if host_error == KERN_SUCCESS {
            let page_size = vm_kernel_page_size
            availableMemory = UInt64(host_info_data.free_count) * UInt64(page_size)
        }
        
        return (memoryUsage, availableMemory)
    }
    
    // Ensure sufficient disk space
    private func ensureSufficientDiskSpace(at url: URL) {
        do {
            let directory = url.deletingLastPathComponent()
            let values = try directory.resourceValues(forKeys: [.volumeAvailableCapacityKey])
            
            if let availableCapacity = values.volumeAvailableCapacity, UInt64(availableCapacity) < Constants.minDiskSpace {
                os_log("Warning: Low disk space (%lld MB available)", log: logger, type: .error, 
                       UInt64(availableCapacity) / (1024 * 1024))
            }
        } catch {
            os_log("Failed to check disk space: %{public}s", log: logger, type: .error, error.localizedDescription)
        }
    }
}

// MARK: - Convenience Extensions

extension AVAudioFile {
    // Load audio file with retry mechanism
    static func optimizedLoading(at url: URL) throws -> AVAudioFile {
        var attempts = 0
        var lastError: Error? = nil
        
        while attempts < 3 {
            do {
                return try AVAudioFile(forReading: url)
            } catch {
                lastError = error
                attempts += 1
                Thread.sleep(forTimeInterval: 0.1)
            }
        }
        
        throw lastError ?? NSError(
            domain: "AudioProcessingOptimizer",
            code: 1004,
            userInfo: [NSLocalizedDescriptionKey: "Failed to load audio file after multiple attempts"]
        )
    }
}