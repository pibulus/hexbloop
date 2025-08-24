import Foundation
import Combine

// MARK: - Cancellation Manager

@MainActor
class CancellationManager: ObservableObject {
    @Published var isCancelling = false
    @Published var cancellationRequested = false
    
    private var cancellationToken = UUID()
    private var activeTasks: Set<UUID> = []
    
    func startOperation() -> UUID {
        let token = UUID()
        activeTasks.insert(token)
        cancellationRequested = false
        isCancelling = false
        return token
    }
    
    func endOperation(token: UUID) {
        activeTasks.remove(token)
        if activeTasks.isEmpty {
            isCancelling = false
            cancellationRequested = false
        }
    }
    
    func requestCancellation() {
        cancellationRequested = true
        isCancelling = true
    }
    
    nonisolated func checkCancellation() async throws {
        let cancelled = await self.cancellationRequested
        if cancelled {
            throw HexbloopError.cancelled
        }
    }
    
    nonisolated var shouldCancel: Bool {
        get async {
            await MainActor.run { [weak self] in
                self?.cancellationRequested ?? false
            }
        }
    }
    
    func reset() {
        activeTasks.removeAll()
        isCancelling = false
        cancellationRequested = false
    }
}

// MARK: - Cancellable Task Extension

extension Task where Success == Never, Failure == Never {
    static func checkCancellation() throws {
        if Task.isCancelled {
            throw HexbloopError.cancelled
        }
    }
}

// MARK: - Async Extensions for Cancellation

extension MacAudioEngine {
    func processAudioFileWithCancellation(
        at sourceURL: URL,
        to destinationURL: URL,
        with parameters: ProcessingParameters,
        cancellationManager: CancellationManager,
        progressHandler: @escaping ProgressHandler
    ) async throws -> Bool {
        
        // Check cancellation before starting
        try await cancellationManager.checkCancellation()
        
        // Create a task that can be cancelled
        return try await withTaskCancellationHandler {
            try await processAudioFile(
                at: sourceURL,
                to: destinationURL,
                with: parameters,
                progressHandler: { progress in
                    // Check cancellation during progress updates
                    Task {
                        if await cancellationManager.shouldCancel {
                            // Will be caught by cancellation handler
                            return
                        }
                        progressHandler(progress)
                    }
                }
            )
        } onCancel: {
            // Cleanup when cancelled
            print("Audio processing cancelled")
        }
    }
}

// MARK: - Thread-Safe Counter

actor ProcessedCounter {
    private var _count = 0
    
    var count: Int {
        _count
    }
    
    func increment() {
        _count += 1
    }
}

// MARK: - Cancellable File Operations

class CancellableFileProcessor {
    private let cancellationManager: CancellationManager
    
    init(cancellationManager: CancellationManager) {
        self.cancellationManager = cancellationManager
    }
    
    func processFiles(
        files: [(URL, String)],
        engine: MacAudioEngine,
        parameters: ProcessingParameters,
        progressHandler: @escaping (Int, Float) -> Void,
        completionHandler: @escaping (Int, Error?) -> Void
    ) async {
        let token = await MainActor.run { cancellationManager.startOperation() }
        defer {
            Task { @MainActor in
                cancellationManager.endOperation(token: token)
            }
        }
        
        // Use actor to handle concurrent access
        let counter = ProcessedCounter()
        
        for (index, (inputURL, outputName)) in files.enumerated() {
            // Check cancellation before each file
            if await cancellationManager.shouldCancel {
                let count = await counter.count
                await MainActor.run {
                    completionHandler(count, HexbloopError.cancelled)
                }
                return
            }
            
            do {
                // Process with cancellation support
                try await cancellationManager.checkCancellation()
                
                let outputURL = HexbloopFileManager.shared.generateUniqueOutputPath(
                    baseName: outputName,
                    fileExtension: "m4a"
                )
                
                let success = try await engine.processAudioFileWithCancellation(
                    at: inputURL,
                    to: outputURL,
                    with: parameters,
                    cancellationManager: cancellationManager,
                    progressHandler: { progress in
                        progressHandler(index, progress)
                    }
                )
                
                if success {
                    await counter.increment()
                }
                
            } catch {
                if let hexbloopError = error as? HexbloopError, case .cancelled = hexbloopError {
                    let count = await counter.count
                    await MainActor.run {
                        completionHandler(count, error)
                    }
                    return
                }
                // Continue with next file on other errors
                print("Error processing file: \(error)")
            }
        }
        
        let finalCount = await counter.count
        await MainActor.run {
            completionHandler(finalCount, nil)
        }
    }
}