# Hexbloop Release Readiness Audit

Date: 2026-04-05
Auditor: Codex
Scope: Electron desktop app readiness for local use, DMG release, and Windows EXE release

## Executive Summary

Hexbloop is usable on Pablo's Mac right now.

- `npm start` launches cleanly.
- Local Homebrew dependencies are detected correctly.
- `npm test` passes.
- `npm run dist` produces a macOS DMG and ZIP.

Hexbloop is not fully ready for friend-facing distribution yet.

- The packaged macOS app is not self-contained.
- The Windows path can produce an unpacked `.exe`, but not a validated, friend-ready installer flow.
- Several settings and UI labels over-promise relative to the actual runtime behavior.

## Readiness Score

- Local Mac use: `7/10`
- DMG for friends: `4/10`
- Windows EXE for friends: `3/10`

## Evidence Collected

- Clean launch via `npm start`
- Dependency detection:
  - `ffmpeg`: `/opt/homebrew/bin/ffmpeg`
  - `ffprobe`: `/opt/homebrew/bin/ffprobe`
  - `sox`: `/opt/homebrew/bin/sox`
- Tests:
  - `npm test` passed
  - Current test suite is lightweight and not a full end-to-end transformation proof
- Packaging:
  - `npm run dist` produced `dist/Hexbloop-1.0.0-arm64.dmg`
  - `dist/Hexbloop-1.0.0-arm64-mac.zip` was created
  - Windows unpacked output reached `dist/win-arm64-unpacked/Hexbloop.exe`

## Critical Findings

### 1. Lunar audio behavior is not actually driving the audio chain

The app claims moon-influenced audio processing, but the active audio path uses a fixed compression profile rather than real lunar parameters.

Impact:

- One of the app's core product claims is currently inaccurate.
- Users will hear a stable processing chain, not one that meaningfully changes with moon phase and time.

Relevant files:

- `src/audio-processor.js`
- `src/lunar-processor.js`

### 2. Naming UI does not match runtime behavior

The preferences UI presents `mystical`, `custom`, and `original` as file-naming modes, but the saved output filename is generated from batch settings in the main process.

Impact:

- "Original Filenames" is misleading.
- "Custom Metadata" sounds like a filename mode, but currently behaves as tag metadata.
- Naming modularity feels less trustworthy because the UI and runtime model are split.

Relevant files:

- `src/renderer/preferences/preferences.html`
- `src/menu/preferences.js`
- `main.js`
- `src/batch/batch-naming-engine.js`

### 3. Packaged builds are not self-contained

The build config expects bundled vendor binaries, but `vendor/mac` and `vendor/win` are empty in the current repo state.

Impact:

- Local use works on Pablo's machine because Homebrew dependencies exist.
- A friend-facing DMG will still depend on external `ffmpeg` and `sox` unless binaries are truly bundled or the docs stay explicit about the dependency.

Relevant files:

- `package.json`
- `scripts/download-vendor-binaries.js`
- `INSTALL.md`

## High-Risk Findings

### 4. Artwork controls are only partially wired

The artwork UI exposes style, sliders, and toggles for responsiveness, moon influence, filename seeding, and output configuration, but the runtime only uses a small subset of those values.

Impact:

- The options panel looks more modular than it really is.
- Users can think they are steering the art system when many controls are decorative.

Relevant files:

- `src/shared/settings-schema.js`
- `src/renderer/preferences/preferences.html`
- `src/audio-processor.js`
- `src/artwork-generator-vibrant-refined.js`

### 5. Metadata year is not embedded correctly

Custom metadata passes a `year` field, while the embedder reads `date`.

Impact:

- Custom year values can silently fall back to the current year.
- Metadata mode feels flaky even when the UI accepts the value.

Relevant files:

- `src/menu/preferences.js`
- `src/audio-processor.js`
- `src/metadata-embedder.js`

### 6. Batch naming has real logic bugs

Observed issues:

- "Include Original Name" does not behave globally the way the UI suggests.
- Hybrid naming can duplicate numbering.
- Batch preview generates folder names by incrementing counters per file, which is not a stable preview model.

Impact:

- The naming system has strong potential, but current edge cases undermine trust.

Relevant files:

- `src/batch/batch-naming-engine.js`
- `main.js`

## Packaging Findings

### macOS

What works:

- Native arm64 mac build completes.
- DMG and ZIP are generated.

What is still weak:

- No code signing
- No notarization
- Not self-contained in current repo state

### Windows

What works:

- Cross-build path can at least produce unpacked Windows output from macOS.

What is still weak:

- No validated NSIS installer produced in this audit
- No proof of x64 Windows install path
- Current config points at `assets/icon.ico`, which does not exist in the repo
- Builder falls back to the default Electron icon

## Testing Findings

Current tests are useful as smoke checks, but not enough for release confidence.

Missing confidence checks:

- Real end-to-end transform from fixture input to finished output
- Metadata verification using current app code path
- Artwork generation verification
- Batch processing verification
- Naming mode verification

## Recommendation

Use Hexbloop locally now.

Do not call the current build "friend-ready" until the following are fixed:

1. Wire lunar logic into the real audio processing path.
2. Make naming behavior coherent and truthful in the UI.
3. Turn the top artwork controls into real behavior.
4. Fix metadata year handling.
5. Fix batch naming bugs and preview consistency.
6. Decide whether the DMG is self-contained or dependency-based, then make the build and docs agree.
7. Validate a real Windows release path, ideally x64 plus installer.

## Hardening Priorities

### Pass 1: Product Truth

- Fix lunar audio wiring
- Fix naming truth model
- Fix metadata year mismatch

### Pass 2: Option Trust

- Wire artwork style and responsiveness settings
- Fix batch naming edge cases
- Make preview stable

### Pass 3: Release Hygiene

- Add missing Windows icon
- Make packaging expectations honest
- Add real release smoke tests

## Final Verdict

Hexbloop is close to "real app I can use every day on my own Mac."

It is not yet at "throw the DMG/EXE to friends without caveats."

The good news is that the remaining problems are mostly truth-and-hardening problems, not "the whole architecture is fake" problems. The app is real. It just needs the top claims, top controls, and top packaging expectations to line up with what the code actually does.
