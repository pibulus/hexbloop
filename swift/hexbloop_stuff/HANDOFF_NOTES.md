# Hexbloop Development Handoff Notes

*Last Updated: January 6, 2025*

## 🎯 Current State Summary

Hey future me! Here's exactly where we left off with Hexbloop. The app is **functionally complete** and ready for beta testing, but needs polish and App Store prep.

### What's Working ✅
- **Core audio processing** with moon phase influence (silent processing, no playback)
- **Drag & drop** AND **file picker** (we added both!)
- **Batch processing** with progress indication
- **Auto-generated mystical names** (5 styles: sparklepop, blackmetal, etc.)
- **Procedural SVG artwork** generation
- **Memory optimization** for Mac14,15 models
- **Cancellation** works properly throughout
- **No force unwrapping** - crash resistant
- **Unit tests** are written and ready

### Recent Fixes Applied
1. Fixed `currentProgress` undefined crash
2. Audio processing is now **silent** (was playing during processing)
3. Fixed getting stuck at 100% 
4. Reduced memory cleanup spam (was cleaning every 10%, now 5% with 30s cooldown)
5. Reduced graphics effects to prevent `CGGStackRestore` errors
6. Added 500MB file size limit
7. All force unwrapping removed (was 13 instances)

## 🚨 Known Issues & Workarounds

### Memory Issues on Mac14,15
- These models (Mac Studio M2 Max) have severe memory pressure
- We detect them with `AudioProcessingOptimizer.isRunningOnMac14_15()`
- In extreme cases (<150MB RAM), we bypass processing entirely
- FFmpeg mastering is skipped in sandbox (that's OK)

### Current Workarounds
```swift
// Look for these patterns in the code:
if AudioProcessingOptimizer.shared.isRunningOnMac14_15() {
    // Simplified processing path
}
```

### Sandboxing
- We removed FFmpeg temporary exceptions (Apple would reject)
- FFmpeg gracefully skips if not found
- All file operations are sandbox-safe

## 📁 Key Files You'll Need

### Core Processing
- `MacAudioEngine.swift` - Main audio processing engine
- `AudioProcessor.swift` - Audio session management  
- `AudioProcessingOptimizer.swift` - Memory/hardware optimizations
- `ProcessingParameters` in `MacAudioEngine.swift` - Moon phase calculations

### UI & UX
- `ContentView.swift` - Main UI (⚠️ large file, needs refactoring)
- `HexbloopApp.swift` - App entry point

### New Production Files (We Created These!)
- `ErrorHandling.swift` - Centralized error management
- `PreferencesManager.swift` - User preferences (needs UI)
- `CancellationManager.swift` - Cancellation system
- `AudioProcessingTests.swift` - Unit tests
- `PRODUCTION_CHECKLIST.md` - Release checklist
- `APP_INFO.plist` - App Store metadata

## 🔧 What's Left To Do

### High Priority (Do These First!)

#### 1. Create App Icon
```bash
# Required sizes for macOS:
16x16, 32x32, 64x64, 128x128, 256x256, 512x512, 1024x1024

# Suggested design:
- Hexagonal shape
- Purple/blue gradient
- Mystical symbols (pentagram?)
- Match the app's aesthetic
```

#### 2. Test on Real Devices
```bash
# Test matrix:
- [ ] macOS 12.0 (Monterey)
- [ ] macOS 13.0 (Ventura)  
- [ ] macOS 14.0 (Sonoma)
- [ ] macOS 15.0 (Sequoia)
- [ ] Intel Mac
- [ ] M1/M2/M3 Mac
- [ ] Low memory conditions
```

#### 3. Add Preferences Window
We have `PreferencesManager.swift` but no UI! Add:
```swift
// In ContentView, add a preferences window:
- Output directory picker
- Default effect sliders
- Auto-open finder checkbox
- Memory optimization toggles
- "Reset to Defaults" button
```

### Medium Priority

#### 4. Polish UX
- [ ] Add keyboard shortcuts:
  ```swift
  .keyboardShortcut("o", modifiers: .command) // Open files
  .keyboardShortcut(",", modifiers: .command) // Preferences
  .keyboardShortcut(".", modifiers: .command) // Cancel
  ```
- [ ] Add tooltips to mysterious UI elements
- [ ] Create onboarding for first launch
- [ ] Add "What's processing?" help

#### 5. Create Support Infrastructure
```markdown
# Hexbloop.app website needs:
- Landing page with screenshots
- Privacy policy (we collect NO data)
- Support email
- App Store link (later)

# Suggested copy:
"Transform your audio with mystical processing influenced by moon phases and natural cycles"
```

#### 6. App Store Assets
- [ ] 5-10 screenshots showing:
  - Main hexagonal UI
  - Processing in progress
  - Generated artwork
  - Batch processing
  - File picker
- [ ] App Store description (4000 chars max)
- [ ] Keywords for discovery
- [ ] Age rating (4+)

### Low Priority (Nice to Have)

#### 7. Additional Features
```swift
// These can wait for v1.1:
- Export format selection (currently M4A only)
- Processing presets (save/load)
- Undo functionality  
- Processing history
- Themes (dark/light/auto)
```

## 🚀 Release Process

### Step 1: Apple Developer Setup
```bash
# You need:
1. Apple Developer account ($99/year)
2. Create App ID: com.yourname.hexbloop
3. Create macOS App certificate
4. Create provisioning profile
```

### Step 2: Xcode Configuration
```swift
// In project settings:
- Bundle ID: com.yourname.hexbloop
- Version: 1.0.0
- Build: 1
- Deployment Target: macOS 12.0
- Category: Music
- Copyright: © 2024 Your Name
```

### Step 3: Build & Notarize
```bash
# Build release version
1. Product > Archive
2. Distribute App > Developer ID
3. Upload for notarization
4. Wait for approval email
5. Staple ticket to app
```

### Step 4: Create DMG
```bash
# Use create-dmg or similar:
- Background image with instructions
- App icon draggable to Applications
- Compressed DMG
```

### Step 5: App Store Submission
1. Create app in App Store Connect
2. Fill in ALL metadata fields
3. Upload screenshots
4. Upload build from Xcode
5. Submit for review
6. Wait 24-48 hours

## 🐛 Debug Tips

### If Processing Fails Silently
1. Check Console.app for "com.hexbloop.audio" logs
2. Look for memory pressure warnings
3. Verify file permissions in sandbox
4. Check `AudioProcessingError` messages

### If UI Gets Stuck
- Progress might not reset - check `audioProcessor.progress`
- Cancellation might not complete - check `cancellationManager`
- Memory cleanup might be too aggressive

### Testing Commands
```bash
# Run tests
cmd+U in Xcode

# Check for memory leaks
Product > Profile > Leaks

# Test sandbox
Build and run from /Applications (not Xcode)
```

## 💡 Architecture Notes

### Processing Pipeline
1. File validation (size, format)
2. Name generation (moon phase influenced)
3. Audio conversion to standard format
4. Effects processing (AVAudioEngine)
5. FFmpeg mastering (if available)
6. Metadata embedding
7. File output with artwork

### Memory Management
- We monitor available RAM constantly
- Cleanup triggers at <5% available (was 10%)
- 30-second cooldown between cleanups
- Special handling for Mac14,15 models

### Cancellation Flow
- `CancellationManager` tracks state
- Check points throughout processing
- Proper cleanup on cancel
- UI updates accordingly

## 📝 Quick Code Snippets

### Add New Processing Parameter
```swift
// In ProcessingParameters struct:
var newEffect: Float = 0.5  // Range: 0.0-1.0

// In generateWithMoonPhaseInfluence():
if moonPhase >= 95 || moonPhase <= 5 {
    params.newEffect = 0.8  // Full moon setting
}
```

### Add New File Format Support
```swift
// In file validation:
let supportedExtensions = ["mp3", "m4a", "wav", "aiff", "flac", "ogg"]

// In ContentView showFilePicker():
.init(filenameExtension: "ogg") ?? .audio
```

### Add Keyboard Shortcut
```swift
// In ContentView body:
.keyboardShortcut("n", modifiers: [.command, .shift])
```

## 🎯 MVP Checklist for 1.0

Must have:
- [x] Core processing works
- [x] File picker works
- [x] Batch processing works
- [x] No crashes
- [ ] App icon
- [ ] Basic help/about
- [ ] Privacy policy URL
- [ ] Support email

Nice to have:
- [ ] Preferences window
- [ ] Keyboard shortcuts
- [ ] Processing presets
- [ ] Themes

## 🔮 Future Ideas (v2.0)

- Real-time preview of effects
- Custom moon phase override
- Share to social media
- Processing profiles/presets
- AppleScript support
- Audio Unit plugin version
- iOS version?

---

**Remember**: The app works! It processes audio with mystical effects. Focus on polish and App Store requirements first. The core functionality is solid.

**Current blockers**: 
1. Need app icon
2. Need Apple Developer account
3. Need website/support email

**Time estimate to release**: 3-5 days of focused work

Good luck, future me! The hard part is done. 🚀✨