# Build Settings for Hexbloop

## Important: Swift Concurrency Settings for macOS 15

If you encounter Swift 6 concurrency warnings when compiling for macOS 15, follow these steps in Xcode:

1. Select the Hexbloop target in the project navigator
2. Go to the "Build Settings" tab
3. Search for "concurrency"
4. Set "Strict Concurrency Checking" to "Minimal"

This is important because:
- Swift 6 introduces stricter actor isolation rules
- Some system frameworks may trigger these warnings
- Setting to "Minimal" lets the app build properly while maintaining safety

## Backward and Forward Compatibility

The app maintains compatibility with:
- macOS 13.0+ (primary target)
- macOS 14.0
- macOS 15.0 (with conditional code paths)

## Code Compatibility Notes

We use a compatibility layer (AVFoundationCompat.swift) to handle the deprecated APIs in macOS 15.0:

1. AVAsset(url:) -> AVURLAsset(url:)
2. isExportable -> load(.isExportable)
3. tracks(withMediaType:) -> loadTracks(withMediaType:)
4. export() -> export(to:as:)

The compatibility layer will automatically use the appropriate API based on the OS version.