# 🔮 HEXBLOOP - TECHNICAL GRIMOIRE FOR AI ASSISTANTS

## 🚀 QUICK START (For Immediate Context)

```bash
# Launch the mystical construct
cd hexbloop-electron && npm start

# Key files for common tasks:
src/renderer/app.js:105      # Hexagonal phrase generation algorithm
src/audio-processor.js:85    # Sox/FFmpeg pipeline configuration
src/lunar-processor.js:42    # Moon phase → audio parameter mapping
src/renderer/style.css:196   # Hexagon breathing animations
main.js:91                   # IPC audio processing handler
```

**What This Is**: Electron app that transforms audio files using moon phase calculations. Users drag audio files onto a breathing hexagonal interface, which processes them with lunar-influenced effects and outputs mystically-named MP3s with procedural artwork.

## 📊 TECHNICAL ARCHITECTURE

### Data Flow Diagram
```
User Drags Audio File
    ↓
Hexagon UI (app.js) → IPC → Main Process (main.js)
    ↓                              ↓
Mystical Phrases            Audio Processing Pipeline:
    ↓                              ↓
Visual Feedback             1. Lunar Calculations (lunar-processor.js)
                           2. Sox Effects (audio-processor.js:85-122)
                           3. FFmpeg Mastering (audio-processor.js:155-192)
                           4. Artwork Generation (artwork-generator.js)
                           5. Metadata Embedding (metadata-embedder.js)
                                  ↓
                           Output: ~/Documents/HexbloopOutput/mystical_name.mp3
```

### Component Relationships
- **main.js**: Electron main process, handles file I/O and spawns processing
- **preload.js**: Secure IPC bridge between renderer and main
- **app.js**: UI controller, hexagon animations, drag/drop handling
- **audio-processor.js**: Orchestrates the transformation pipeline
- **lunar-processor.js**: Moon phase calculations → audio parameters
- **name-generator.js**: Hexagonal vertex-based mystical naming
- **style.css**: Critical animations (breathing, parallax, vignette)

## 🔧 KEY IMPLEMENTATION DETAILS

### 1. Lunar Audio Processing Algorithm
```javascript
// lunar-processor.js:42-124
// Moon phase (0-1) maps to audio effects:
- New Moon (0.0): overdrive=6.0, bass=+4.0, treble=-0.5
- Full Moon (0.5): overdrive=2.0, bass=+1.0, treble=+2.5
- Time modifiers layer on top (deep_night=1.3x, morning=0.8x)
```

### 2. Hexagonal Communication System
```javascript
// app.js:22-29 - Six vertices of mystical language
vertex1: ["weaving", "flowing", "merging", "dissolving", "threading"]
vertex2: ["frequencies", "patterns", "echoes", "whispers", "signals"]
// ... etc

// app.js:105-147 - Phrase generation uses:
- Time-seeded vertex selection
- Progress-based movement patterns (opposite/clockwise/diamond)
- 2-4 word phrases based on processing stage
```

### 3. Critical Animation Timings
```css
/* style.css:196-242 - Breathing animations */
.hexagon { animation: breathe 4.2s ease-in-out infinite; }
/* 70-75 BPM to match human heartbeat */

/* style.css:441-464 - Processing states */
.feeding { animation: feeding-pulse 1.4s ease-in-out infinite; }
```

### 4. Audio Processing Pipeline
```javascript
// audio-processor.js:85-122 - Sox command construction
sox input output \
  gain -n -1.5 \                          # Normalize
  overdrive ${lunar.overdrive} 2.5 \     # Mystical distortion
  bass +${lunar.bass} \                  # Low frequency boost
  echo ${lunar.echo.delay} ${lunar.echo.decay} 6.5 0.045 \
  compand ${lunar.compand.attack},0.6 6:-70,-60,-20 -2 -90 0.25
```

## 🛠️ COMMON DEVELOPMENT TASKS

### Adding New Lunar Phases
1. Modify `lunar-processor.js:42-124` phase mappings
2. Test with `LunarProcessor.getMoonPhase()` in console
3. Verify audio output matches intended mystical feeling

### Adjusting Visual Feedback
1. Hexagon animations: `style.css:196-242`
2. Color schemes: `style.css:288-332` 
3. Parallax depth: `app.js:183-192` (max 30px movement)

### Modifying Audio Pipeline
1. Sox effects: `audio-processor.js:88-99`
2. FFmpeg filters: `audio-processor.js:158-166`
3. Fallback processing: `audio-processor.js:124-153`

### Changing Mystical Language
1. Word arrays: `app.js:22-29`
2. Phrase patterns: `app.js:115-136`
3. Progress-based evolution: `app.js:114`

## ⚠️ CRITICAL CONSTRAINTS (DO NOT VIOLATE)

### Visual Design Rules
- **NO GOLDEN/YELLOW COLORS** - Breaks organic mysticism
- **NO ANTHROPOMORPHIZATION** - Hexagon never "smiles" or "bows"
- **MAINTAIN 70 BPM** - Breathing must match human heartbeat
- **PRESERVE PARALLAX LIMITS** - Max 30px movement prevents nausea

### Technical Boundaries
- **KEEP SOX FIRST** - FFmpeg fallback only if Sox unavailable
- **320KBPS MP3 ONLY** - Quality/size balance for mystical audio
- **NO FRAMEWORK DEPENDENCIES** - Vanilla JS maintains purity
- **PRESERVE IPC SECURITY** - Context isolation must stay enabled

### Mystical Integrity
- **GEOMETRIC TRUTH** - All "randomness" follows mathematical patterns
- **LUNAR ACCURACY** - Use actual astronomical calculations
- **80/20 RULE** - Every feature must enhance mystical experience
- **CEREMONY OVER FUNCTION** - Interactions should feel ritualistic

## 🐛 DEBUGGING HINTS

### Common Issues & Solutions

**Audio processing fails silently**
- Check `checkDependencies()` in main.js:193
- Verify sox/ffmpeg in PATH
- Look for FFmpeg fallback activation in console

**Hexagon not responding to drops**
- Check `will-navigate` handler in main.js:49
- Verify file extensions in regex patterns
- Test with `window.electronAPI.processAudio(['path'])`

**Lunar calculations seem off**
- `LunarProcessor.getMoonPhase()` in console
- Verify system date/time is correct
- Check reference new moon date (2000-01-06)

**Visual glitches/performance**
- Disable Dev Tools (impacts animation performance)
- Check GPU acceleration in Electron
- Verify no conflicting CSS transforms

## 🎭 THE MYSTICAL LAYER (Technical Context)

The app embodies **"Maximum magic, minimal engineering"** through:

1. **Biological Synchronization**: 70 BPM animations create meditative state
2. **Geometric Communication**: 6-vertex system ensures varied but coherent output
3. **Lunar Influence**: Real astronomical data affects actual audio output
4. **Vintage Aesthetic**: Film grain/vignette masks modern UI, enhances immersion
5. **Ceremonial Interactions**: Deliberate delays/animations make actions feel significant

### Philosophy in Code
- **Breathing Hexagon**: Not decoration, but biofeedback for calm interaction
- **No Text UI**: Forces discovery, maintains otherworldly atmosphere  
- **Parallax Depth**: Creates living environment without overwhelming
- **Progress Phrases**: Evolution mirrors user's journey through processing

## 📁 PROJECT STRUCTURE REFERENCE

```
hexbloop-electron/
├── main.js                    # [IPC, file handling, window management]
├── preload.js                 # [Secure context bridge]
├── package.json               # [Minimal deps: electron, ffmpeg, id3]
├── src/
│   ├── renderer/
│   │   ├── index.html        # [Minimal DOM: hexagons + pentagram]
│   │   ├── app.js            # [UI logic, animations, drag/drop]
│   │   └── style.css         # [Critical animations, parallax, colors]
│   ├── audio-processor.js     # [Sox → FFmpeg pipeline orchestration]
│   ├── lunar-processor.js     # [Moon phase → parameter mapping]
│   ├── name-generator.js      # [Hexagonal vertex naming system]
│   ├── artwork-generator.js   # [Procedural SVG → PNG generation]
│   └── metadata-embedder.js   # [ID3 tag + artwork embedding]
└── assets/
    └── ambient_loop.mp3       # [Optional atmospheric audio]
```

## 🔮 FINAL TRANSMISSION

You now possess the technical grimoire. The construct's code is both mystical interface and functional audio processor. Every animation serves biological harmony. Every calculation follows geometric truth. The moon's influence is real, measured, applied.

When you work with this code, remember: **You're not just editing software, you're maintaining a digital mystical experience.**

The hexagon awaits your contributions. Code with ceremony. Test with reverence. Debug with patience.

---
*Generated with maximum technical utility while preserving mystical integrity*