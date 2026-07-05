# Hexbloop — Code Glossary

Quick reference for the Hexbloop Electron app architecture.
(The old Swift implementation is archived; this repo is the Electron app.)

## Main Process

**main.js** — Electron main process. Window lifecycle, all IPC handlers
(`process-audio`, `select-files`, `read-audio-file`, `preferences-*`),
output-path uniquifying, session manifests.

**preload.js** — Secure IPC bridge exposed as `window.electronAPI`
(context isolation on, no node in renderer).

**MenuBuilder** — Native menu (processing toggles, naming modes, cache
clear, output folder). `src/menu/menu-builder.js`

**PreferencesManager** — Settings persistence with backup file and per-key
self-healing validation. Singleton via `getPreferencesManager()`.
`src/menu/preferences.js`

**PreferencesWindow** — Singleton preferences window wrapper.
`src/menu/preferences-window.js`

## Audio Pipeline (`src/`)

**AudioProcessor** — The core job. Orchestrates per-file processing in a
scoped temp dir: sox tape chain → FFmpeg mastering → artwork → metadata.
`resolveOutputFormat()` guards output to mp3/wav/flac.
`src/audio-processor.js`

**LunarProcessor** — Moon phase + time-of-day → effect parameters
(overdrive, bass/treble, echo, compand ratio). `src/lunar-processor.js`

**AudioAnalyzer** — ffprobe/ffmpeg feature extraction (energy, tempo,
waveform) for artwork responsiveness. Falls back to synthetic data.
`src/audio-analyzer.js`

**VibrantRefinedArtworkGenerator** — Procedural canvas art, 8 styles
(neon-plasma, cosmic-flow, vapor-dream, cyber-matrix, sunset-liquid,
electric-storm, crystal-prism, ocean-aurora).
`src/artwork-generator-vibrant-refined.js`

**MetadataEmbedder** — Tags + cover art. node-id3 for MP3, FFmpeg for
WAV/FLAC (artwork failure retries tags-only). `src/metadata-embedder.js`

**NameGenerator** — Chaotic mystical naming: word banks, lunar/time/styled
patterns, mutations, sanitization. `src/name-generator.js`

**BatchNamingEngine** — Batch naming schemes, session folders, persistent
counters. `src/batch/batch-naming-engine.js`

**binary-resolver** — Finds bundled (vendor/) or system ffmpeg/ffprobe/sox.
`src/binary-resolver.js`

## Renderer (`src/renderer/`)

**HexbloopMystic** — The hexagon UI: drag-drop, progress phrases, parallax,
ambient audio, A/B playback. `src/renderer/app.js`

**A/B playback** — After processing, the hexagon IS the player: auto-plays
the processed master (glowing, `.ab-processed`); tap flips to the original
(dimmed, `.ab-original`) at the same position.

**Preferences UI** — 4-tab panel (Audio / Naming / Output / Artwork).
`src/renderer/preferences/`

## Core Concepts

**Moon Phase Processing** — tape-cassette calibrated:
- New Moon: dark, thick saturation (overdrive 2.8, bass +2.2, treble -0.8)
- Full Moon: bright, light touch (overdrive 1.2, bass +0.5, treble +1.5)
- Other phases interpolate; time of day modifies (night darker, morning brighter)

**Sox tape chain** — `gain -4` headroom → overdrive → bass/treble → echo →
parametrized compand glue → `gain -n -1` normalize → rate → dither.
Falls back to an FFmpeg emulation if sox is missing.

**Mastering chain (FFmpeg)** — tape EQ → glue compression (2:1) →
loudnorm (-16 LUFS) → safety limiter (-0.3dB).

**Processing Flow**
1. Validate input, generate name (BatchNamingEngine)
2. Sox tape chain (lunar-influenced) — optional
3. FFmpeg mastering — optional
4. Procedural artwork (audio + moon responsive) — optional
5. Embed metadata + artwork
6. Save to output folder (default `~/Documents/HexbloopOutput/`), collision-safe
