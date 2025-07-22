# Mac App Store Preparation Guide

This guide outlines the steps needed to prepare Hexbloop for Mac App Store submission.

## Addressing Console Errors

The following errors have been addressed with our optimizations:

1. `AddInstanceForFactory: No factory registered for id`
   - Fixed by proper initialization of the audio system at startup
   - Solution: AudioProcessingOptimizer handles early initialization

2. `HALC_ProxyIOContext::IOWorkLoop: skipping cycle due to overload`
   - Fixed by optimizing buffer sizes and scheduling
   - Solution: Optimized buffer management in AudioProcessingOptimizer

3. `PlatformUtilities::CopyHardwareModelFullName() returns unknown value: Mac14,15`
   - Fixed by adding hardware model detection on startup
   - Solution: Hardware detection mechanism in AudioProcessingOptimizer

## Sandboxing Requirements

The Mac App Store requires apps to be sandboxed:

1. Enable App Sandbox in Signing & Capabilities
2. Add entitlements for:
   - User Selected File (Read/Write)
   - Music Files (Read-Only)
   - Pictures Folder (Read/Write) for cover art

## Privacy Declarations

Update Info.plist with:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>Hexbloop needs access to the microphone if you want to process audio input.</string>

<key>NSAppleEventsUsageDescription</key>
<string>Hexbloop needs to send Apple Events to reveal processed files in Finder.</string>
```

## Performance Considerations

1. **Memory Management**:
   - The app uses a caching system with a limit on cached assets
   - Memory usage is monitored and caches are cleared when memory is low

2. **CPU Usage**:
   - Processing is performed with timeout protection
   - Buffer sizes are optimized based on available system resources
   - Background tasks use proper priorities

3. **Storage**:
   - Free space is checked before starting processing
   - Temporary files are cleaned up after processing

## Testing Requirements

Before submission:

1. Test on:
   - macOS 13.0 Ventura
   - macOS 14.0 Sonoma
   - macOS 15.0 (Beta)
   - Both Apple Silicon and Intel (if possible)

2. Test with:
   - Small audio files (< 1 MB)
   - Medium audio files (10-50 MB)
   - Large audio files (100+ MB)
   - Various audio formats (MP3, WAV, AIFF, M4A)

3. Verify:
   - Processing completes successfully
   - No memory leaks during extended use
   - App remains responsive during processing
   - UI updates correctly with progress
   - Generated files play correctly

## Final Checklist

- [ ] Set build settings according to BUILD_SETTINGS.md
- [ ] Disable debug logging
- [ ] Set ENABLE_USER_SCRIPT_SANDBOXING to YES
- [ ] Test all sandbox-required operations
- [ ] Verify artwork generation and embedding
- [ ] Check CPU usage during processing
- [ ] Ensure memory usage remains reasonable
- [ ] Test with multiple files
- [ ] Create app store screenshots
- [ ] Prepare app store description
EOF < /dev/null