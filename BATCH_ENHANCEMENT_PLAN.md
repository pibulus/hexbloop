# 🔮 HEXBLOOP BATCH PROCESSING ENHANCEMENT PLAN

## Executive Summary
Transform Hexbloop's batch processing from sequential single-format output to a powerful, parallel, multi-format system while maintaining the mystical minimalist aesthetic.

## 🎯 Core Goals
1. **Speed**: Parallel processing for 3-4x faster batch operations
2. **Flexibility**: Multiple output formats, naming schemes, organization options
3. **Intelligence**: Processing profiles, smart defaults, preview capabilities
4. **Simplicity**: Keep the drag-drop magic, hide complexity behind preferences

---

## 📋 IMPLEMENTATION PHASES

### PHASE 1: Enhanced Naming System ✅ (COMPLETED)
- Removed emojis from generated names
- Better lunar integration
- Clean, musical track names
- Safe filesystem characters

### PHASE 2: Batch Naming Options
**Goal**: Give users control over batch file naming while preserving mystical defaults

#### 2.1 Settings Schema Updates
```javascript
// Add to settings-schema.js
batch: {
    namingScheme: 'mystical',  // 'mystical' | 'sequential' | 'timestamp' | 'hybrid'
    prefix: '',                 // Optional prefix for all files
    suffix: '',                 // Optional suffix (before extension)
    numberingStyle: 'none',     // 'none' | 'numeric' | 'alpha' | 'roman'
    numberingPadding: 3,        // 001, 002, etc.
    separator: '_',             // Character between elements
    preserveOriginal: false     // Include original filename in output
}
```

#### 2.2 Naming Patterns
- **Mystical** (current): `lunar_day_15.mp3`
- **Sequential**: `track_001.mp3`, `track_002.mp3`
- **Timestamp**: `hexbloop_20241226_143022.mp3`
- **Hybrid**: `mystical_name_001.mp3`
- **With Prefix/Suffix**: `demo_lunar_echo_v2.mp3`
- **Preserve Original**: `original_name_hexblooped.mp3`

### PHASE 3: Session Organization
**Goal**: Organize outputs into logical folders

#### 3.1 Folder Structure Options
```
HexbloopOutput/
├── 2024-12-26_session_01/     # Date-based sessions
│   ├── manifest.json           # Processing metadata
│   └── *.mp3                   # Processed files
├── lunar_waxing_crescent/      # Moon phase folders
└── quick_exports/              # No organization
```

#### 3.2 Settings
```javascript
organization: {
    folderScheme: 'session',    // 'none' | 'session' | 'date' | 'lunar' | 'project'
    sessionNaming: 'timestamp',  // How to name session folders
    autoIncrement: true,         // Auto-number sessions per day
    includeManifest: true        // Save processing details
}
```

### PHASE 4: Parallel Processing
**Goal**: Process multiple files simultaneously for speed

#### 4.1 Implementation Strategy
- Use Node.js Worker Threads for CPU-bound audio processing
- Default to 2-4 parallel workers (configurable)
- Queue management with priority system
- Progress tracking per file

#### 4.2 Settings
```javascript
performance: {
    parallelProcessing: true,
    maxWorkers: 4,              // Auto-detect CPU cores
    processingPriority: 'speed', // 'speed' | 'quality' | 'balanced'
    memoryLimit: 2048           // MB per worker
}
```

### PHASE 5: Output Format Options
**Goal**: Support multiple output formats beyond MP3

#### 5.1 Supported Formats
- **Lossy**: MP3 (320kbps), AAC (256kbps), OGG Vorbis
- **Lossless**: FLAC, ALAC, WAV
- **Special**: Original format with effects only

#### 5.2 Settings
```javascript
output: {
    format: 'mp3',              // 'mp3' | 'aac' | 'flac' | 'wav' | 'original'
    quality: 'high',            // 'low' | 'medium' | 'high' | 'maximum'
    bitrate: 320,               // For lossy formats
    sampleRate: 44100,          // Override sample rate
    preserveMetadata: true      // Keep original file metadata
}
```

### PHASE 6: Processing Profiles
**Goal**: Save and load different processing configurations

#### 6.1 Profile System
```javascript
profiles: {
    current: 'default',
    saved: {
        'default': { /* current settings */ },
        'quick_demo': {
            processing: { compressing: false, mastering: true },
            output: { format: 'mp3', quality: 'medium' }
        },
        'maximum_mystical': {
            processing: { compressing: true, mastering: true },
            advanced: { lunarInfluence: true }
        },
        'archival': {
            output: { format: 'flac', quality: 'maximum' }
        }
    }
}
```

### PHASE 7: Dry Run Preview
**Goal**: Preview what will happen before processing

#### 7.1 Preview Features
- Show generated filenames before processing
- Estimate processing time
- Display moon phase influence
- Preview folder structure
- Show total output size estimate

#### 7.2 Implementation
- Add preview button to UI
- Modal or panel showing preview details
- "Process" or "Cancel" options

### PHASE 8: Enhanced UI Controls
**Goal**: Add controls without breaking minimalist aesthetic

#### 8.1 Subtle UI Additions
- Small settings gear (⚙) in corner
- Keyboard shortcuts for power users
- Right-click context menu on hexagon
- Tooltip hints on hover
- Processing queue sidebar (hideable)

#### 8.2 Preferences Window Sections
- **General**: Basic processing options
- **Batch**: Naming, organization, numbering
- **Output**: Format, quality, destination
- **Profiles**: Save/load/manage profiles
- **Advanced**: Parallel processing, memory limits

---

## 🔧 TECHNICAL IMPLEMENTATION

### File Structure Changes
```
src/
├── batch/
│   ├── batch-processor.js      # Orchestrates batch operations
│   ├── worker-pool.js          # Manages parallel workers
│   ├── naming-engine.js        # Enhanced naming logic
│   └── session-manager.js      # Folder organization
├── profiles/
│   ├── profile-manager.js      # Profile CRUD operations
│   └── profile-presets.js      # Built-in profiles
└── preview/
    └── dry-run-engine.js        # Preview calculations
```

### Database/Storage
- Use electron-store for profile persistence
- Save session history for recall
- Track processing statistics

### Performance Considerations
- Lazy load workers only when needed
- Implement file size-based priority queue
- Memory-aware processing limits
- Graceful degradation for older systems

---

## 📊 Success Metrics
- Batch processing 3-4x faster with parallel mode
- Zero increase in UI complexity for basic users
- All new features discoverable through preferences
- Maintains sub-100ms UI response time
- Memory usage under 500MB for typical batch

---

## 🚀 Implementation Order
1. **Week 1**: Batch naming options + settings schema
2. **Week 1**: Session organization + folder management
3. **Week 2**: Parallel processing infrastructure
4. **Week 2**: Output format selection
5. **Week 3**: Processing profiles system
6. **Week 3**: Dry run preview
7. **Week 4**: UI enhancements + testing

---

## 🎭 Design Principles to Maintain
- **Hexagon First**: All complexity hidden until needed
- **Mystical Feel**: New features use same language/aesthetic
- **80/20 Rule**: Focus on features that provide maximum value
- **Progressive Disclosure**: Power features revealed gradually
- **Zero Config**: Smart defaults work for most users

---

## 📝 Notes
- Keep backward compatibility with existing processed files
- All new features should be optional/toggleable
- Maintain current single-file drop experience
- Document keyboard shortcuts for power users
- Consider adding export/import for settings backup

---

*This plan maintains Hexbloop's mystical minimalism while adding serious power user features under the hood.*