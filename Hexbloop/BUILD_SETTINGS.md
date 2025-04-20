# Build Settings for Mac App Store Submission

This document outlines the build settings required for successful compilation and submission to the Mac App Store.

## Swift Concurrency Settings

To avoid Swift 6 actor isolation warnings and errors, set the following in Xcode:

1. Select the Hexbloop target
2. Go to Build Settings
3. Find "Strict Concurrency Checking" (search for "concurrency")
4. Set value to "Minimal"

This setting is crucial for avoiding issues with the Swift concurrency model, especially with SwiftUI and AVFoundation interactions.

## Audio Framework Settings

1. Go to Signing & Capabilities tab
2. Under App Sandbox, ensure "Audio Input" is checked if your app needs to record audio
3. Ensure "User Selected File" access is enabled for read/write

## Memory Usage

The app has been optimized to use minimal memory, but consider the following additional settings:

1. In Build Settings, set "Optimization Level" to "Fastest, Smallest [-Os]" for release builds
2. Set "Metal API Validation" to "Disabled" for release builds

## Performance Optimizations

Several optimizations have been implemented in the code:

1. Asset caching system to reduce repeated file operations
2. Timeout protection for hanging operations
3. Optimized buffer sizes based on device capabilities
4. Memory usage monitoring with automatic cleanup
5. Hardware-specific detection and workarounds

## AVFoundation Compatibility

The app uses a compatibility layer to handle API differences between macOS versions:

- macOS 13.0+ - Uses load(_:) API for AVAsset properties
- macOS 15.0+ - Uses new AVURLAsset and export(to:as:) APIs
- Earlier versions - Uses legacy APIs with proper fallbacks

## Console Output

For Mac App Store submissions:

1. Disable debug logging by setting `isDebugMode = false` in PerformanceOptimizer.swift
2. Consider removing any NSLog calls and using os_log instead

## Privacy Descriptions

In Info.plist, ensure you have privacy descriptions for:

1. NSMicrophoneUsageDescription (if using microphone input)
2. NSAppleEventsUsageDescription (if sending Apple Events)

## Final Build Checklist

Before submission:

1. Set "Strict Concurrency Checking" to "Minimal"
2. Verify app runs on macOS 13.0, 14.0 and 15.0
3. Test with large audio files to ensure stability
4. Set ENABLE_USER_SCRIPT_SANDBOXING to YES
5. Disable debug logging
6. Test the app on Apple Silicon and Intel Macs if possible
EOF < /dev/null