//
//  ErrorHandling.swift
//  Hexbloop
//
//  Created by Hexbloop on 1/6/25.
//

import Foundation

// MARK: - Error Types

enum HexbloopError: LocalizedError, Equatable {
    case cancelled
    case fileNotFound(String)
    case unsupportedFormat(String)
    case processingFailed(String)
    case exportFailed(String)
    case memoryPressure
    case invalidInput(String)
    case sandboxViolation(String)
    
    var errorDescription: String? {
        switch self {
        case .cancelled:
            return "Processing was cancelled"
        case .fileNotFound(let path):
            return "File not found: \(path)"
        case .unsupportedFormat(let format):
            return "Unsupported audio format: \(format)"
        case .processingFailed(let reason):
            return "Audio processing failed: \(reason)"
        case .exportFailed(let reason):
            return "Export failed: \(reason)"
        case .memoryPressure:
            return "Insufficient memory available"
        case .invalidInput(let reason):
            return "Invalid input: \(reason)"
        case .sandboxViolation(let path):
            return "Cannot access file outside sandbox: \(path)"
        }
    }
    
    var recoverySuggestion: String? {
        switch self {
        case .cancelled:
            return "Try processing again"
        case .fileNotFound:
            return "Ensure the file exists and try again"
        case .unsupportedFormat:
            return "Use a supported format: MP3, M4A, WAV, AIFF, or FLAC"
        case .processingFailed:
            return "Check the file integrity and try again"
        case .exportFailed:
            return "Ensure you have write permissions and sufficient disk space"
        case .memoryPressure:
            return "Close other applications and try again"
        case .invalidInput:
            return "Check your input and try again"
        case .sandboxViolation:
            return "Use the file picker to grant access to this location"
        }
    }
}

// MARK: - Error Handling Utilities

struct ErrorHandler {
    static func handle(_ error: Error, context: String? = nil) {
        let errorMessage: String
        
        if let hexbloopError = error as? HexbloopError {
            errorMessage = hexbloopError.errorDescription ?? "Unknown error"
            if let recovery = hexbloopError.recoverySuggestion {
                print("Recovery suggestion: \(recovery)")
            }
        } else {
            errorMessage = error.localizedDescription
        }
        
        if let context = context {
            print("Error in \(context): \(errorMessage)")
        } else {
            print("Error: \(errorMessage)")
        }
        
        #if DEBUG
        print("Debug info: \(error)")
        #endif
    }
    
    static func isUserCancellation(_ error: Error) -> Bool {
        if let hexbloopError = error as? HexbloopError {
            switch hexbloopError {
            case .cancelled:
                return true
            default:
                return false
            }
        }
        return (error as NSError).code == NSUserCancelledError
    }
}