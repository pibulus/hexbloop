# Mac App Store Preparation Guide

## Performance Optimization Checklist

To improve the app's performance and prepare it for Mac App Store submission:

### 1. Reduce Console Output
- Set `PerformanceOptimizer.isDebugMode = false` before submission
- Use `PerformanceOptimizer.log()` instead of direct `print()` statements
- Remove any logging with sensitive data

### 2. Memory Management
- Implement proper deallocation of AVFoundation resources
- Use `PerformanceOptimizer.checkMemoryUsage()` to monitor memory usage
- Limit caching of audio assets (already implemented in `PerformanceOptimizer`)

### 3. Loading Speed
- Pre-warm the audio engine only when needed
- Load assets asynchronously to keep UI responsive
- Use the optimized export method `exportWithOptimizedProgress()`

### 4. Resource Usage
- Reduce timer frequency for progress updates
- Release audio resources when not in use
- Properly handle background/foreground transitions

## Mac App Store Submission Requirements

### Privacy Declarations
- Add usage descriptions for any required permissions:
  - `NSMicrophoneUsageDescription` (if app needs microphone)
  - `NSAppleEventsUsageDescription` (if app uses Apple Events)

### Sandbox Entitlements
- Configure these entitlements in Xcode:
  - App Sandbox: Enabled
  - User Selected File: Read/Write
  - Downloads Folder: Read/Write
  - Application Data: Read/Write

### App Icons
- Provide all required icon sizes (16x16 to 1024x1024)
- Ensure icons follow Apple's design guidelines

## Technical Requirements
- Sign the app with your Developer ID
- Use the Hardened Runtime
- Support App Notarization
- Test thoroughly with App Store settings enabled

## Common Rejection Reasons to Avoid
1. Crashing on launch or during normal operation
2. Excessive CPU/memory usage
3. Missing privacy declarations
4. Incomplete functionality
5. Poor user experience

By following this guide, you'll improve the app's performance and increase the chances of a successful Mac App Store submission.