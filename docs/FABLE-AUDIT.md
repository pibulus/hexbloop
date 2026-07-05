# 🔮 FABLE AUDIT — 2026-07-05

Launch-readiness audit-and-fix pass on the Hexbloop Electron app.
Branch: `fable-audit-2026-07-05` (from `c06ec55`). Pre-audit working tree
preserved in stash `fable-audit-safepoint WIP` — **do not drop it** until
you've confirmed the branch has everything you expect.

Every fix below was verified: all four test suites pass (44 checks), a
real end-to-end harness ran the actual pipeline against the fixture across
the format/stage matrix, and the app boots clean.

---

## 🚨 PRODUCTION-BREAKING — fixed, read these first

**1. The sox "mystical compression" stage had NEVER run — not once.**
The compand transfer curve was malformed (sox: "input values must be
strictly increasing" after soft-knee smoothing) and `gain -h`/`gain -r`
headroom tracking breaks across `overdrive`. Every single file silently
fell back to the FFmpeg emulation while logging the misleading "Sox not
available". The app's headline feature — lunar-influenced tape processing
via sox — was dead on arrival. Fixed with a parametrized transfer curve
(unity below knee, 1/ratio above, 18dB point spacing) and fixed -4dB
headroom + `gain -n -1` normalize. Verified: chain now runs clean across
all lunar extremes, and `test/audio-processing.test.js` now *executes* the
chain instead of just checking `sox --version`. (`src/audio-processor.js`)

**2. WAV and FLAC output hard-failed on the default settings.**
fluent-ffmpeg passes 3+-token option strings as ONE argv entry, so
`-metadata album="Lunar Transmutations"` (every rotating album name has
spaces) made ffmpeg reject the command — the metadata step errored and
took the whole file with it. MP3 was fine (node-id3 path); the other two
formats in the dropdown were broken. Rewrote the embedder with the safe
two-arg `outputOptions(k, v)` form. Artwork-embed failure now retries
tags-only instead of failing the track. (`src/metadata-embedder.js`)

**3. The ambient-audio preference was completely ignored.**
`app.js` defined `initAmbientAudio`, `toggleAmbientAudio`, and
`initSettingsButton` TWICE each — the later, stripped-down copies silently
won (classic JS class-body shadowing), so `ui.ambientAudio` was never
read, auto-start never happened, and the toggle used a CSS class the
settings-aware code didn't. Merged each pair. (`src/renderer/app.js`)

**4. Wrong-format output in mixed stage configs.**
Compression ON + mastering OFF forced MP3 bytes into `.wav`/`.flac`-named
files (FLAC unplayable). All conversion paths now honor the chosen format
via shared `applyOutputFormat`/`convertToFormat`, and
`resolveOutputFormat` guards schema-legacy values (`aac`/`ogg`/`original`
— none supported end-to-end; `original` produced literal `.original`
files) back to mp3. Schema enum shrunk to the truth: mp3/wav/flac.

---

## 🔒 Hardening (fixed)

- **Shell injection + crash on hostile filenames**: the analyzer built an
  `execSync` string with the raw file path — a name containing `"` broke
  it; `$(…)` would have executed. Now `execFileSync` with an arg array
  (verified: `weird "name" $(touch pwned).wav` analyzes cleanly, no
  injection). NaN duration no longer ripples into tempo/artwork math.
  (`src/audio-analyzer.js`)
- **Silent output overwrites**: batch siblings with identical generated
  names (or reruns with "keep original filenames") clobbered each other.
  Output paths are now uniquified (`_2`, `_3`, …) against both the batch
  and the disk. (`main.js`)
- **Settings nuke**: one invalid key in the settings file factory-reset
  ALL preferences. Now per-key coercion — only the bad key falls back to
  its default, and the log says which. (`src/shared/settings-schema.js`,
  `src/menu/preferences.js`)
- **Destroyed-window crashes (macOS)**: the app outlives its window; menu
  items and IPC handlers (`toggle-ambient-audio`, dialogs, fullscreen,
  reload) touched `mainWindow` unguarded and would throw after close.
  Live-window guards everywhere; `mainWindow` nulled on `closed`.
  (`main.js`, `src/menu/menu-builder.js`)
- **Sox double-fallback**: spawn `error` + `close` can both fire — the
  FFmpeg fallback could run twice against the same output. Settled-flag
  guard; sox stderr now logged so failures are diagnosable (this is how
  bug #1 was found). (`src/audio-processor.js`)
- **All-files-failed batch**: renderer ended silently on total failure;
  now flashes the error with the first failure message. (`src/renderer/app.js`)

## 🧹 Dead code removed (proven unused)

- `src/renderer/spectrum-visualizer.js` (266 lines): could never load —
  sandboxed renderer has no `require()` and no script tag included it.
  `this.spectrum` was always null through every recent UX iteration.
- Metadata embedder's `processFileWithMetadata` / `convertArtworkForEmbedding`
  / `isAvailable` / `getStatus`: referenced `this.ffmpegPath` (never set) and
  a `generateMetadata` method that doesn't exist — would crash if ever called.
- `name-generator.js`: duplicate `generateStyledName` — the compat wrapper
  shadowed the real witch-house/vaporwave sub-generator, killing that whole
  naming branch AND its seeded RNG. Renamed to `generateAestheticName`;
  also fixed the failing lunar test (`rng is not a function`).

## 🎛 Menu & UX (fixed)

- **Clear Cache was theatre**: confirm dialog → log line → nothing. Now
  actually removes orphaned `hexbloop-*` temp dirs from the system tmp.
- **Dead links**: Help/Issues pointed at `github.com/hexbloop/hexbloop`
  (doesn't exist) → `github.com/pibulus/hexbloop` (the real remote).
- **About dialog**: version from `app.getVersion()`, © year from the clock
  (was hardcoded 2024).
- **Show Output Folder**: creates the folder first and opens it (was a
  no-op if the folder didn't exist yet).

## 📝 Docs made truthful

- `GLOSSARY.md` was 100% about the archived Swift app (every path dead) —
  rewritten for the Electron architecture.
- `CLAUDE.md` / `README.md`: dropped Swift sections, real moon parameters
  (2.8 not 6.0 overdrive), current naming engine (not the retired
  sparklepop/blackmetal pools), security section matches sandboxed reality
  (docs claimed `webSecurity: false` was required — it's been `true`),
  license now says ISC like package.json.
- `npm test` now runs all FOUR suites — name-generation and artwork tests
  existed but were never wired in (one was failing; fixed).

## ✅ Verification results (honest)

| Check | Result |
|---|---|
| `npm test` (4 suites) | 44/44 pass — audio 7, naming 13, artwork 11, hardening 4* (*pass-lines) |
| E2E pipeline harness (real fixture, stubbed electron) | 6/6: mp3/wav/flac full-chain, flac-no-master, all-stages-off, bad-format fallback — containers, space-containing tags, artwork presence all probed with ffprobe |
| Sox chain, lunar extremes | runs clean (was: 100% failure) |
| Hostile filename (`" $( )`) | analyzed cleanly, no injection |
| App boot (`electron .`, 9s) | clean: binaries resolved, prefs loaded, renderer up, 0 errors |
| Packaging (`npm run dist`) | **NOT run** — audit rule: no builds/signing |

## 🤔 Deliberately left alone (ranked by launch impact)

1. **Vendor binaries not bundled** (`vendor/` empty): packaged builds need
   `npm run vendor:setup` first or users must brew-install sox/ffmpeg.
   INSTALL.md is honest about this. Decision is yours: bundle (bigger DMG,
   self-contained) vs document (status quo).
2. **`style.css` duplicated blocks**: `.ambient-toggle` appears in ~3
   overlapping blocks (both `.active` and `.playing` variants). Last-in-
   cascade wins so it *works*, but it's fragile. Skipped: deduping risks
   changing the look you've been hand-tuning; do it with the app open.
3. **`ambient_loop.mp3` is 13MB** — largest thing in the bundle. Could be
   ~3MB as a lower-bitrate re-encode with no audible difference under the
   0.3-volume playback. Skipped: touching your ambient audio's character
   is a taste call.
4. **Preferences race at boot**: `PreferencesManager` constructor kicks off
   an async load; a file dropped in the first ~50ms could theoretically see
   defaults. Real-world window is negligible; fix (await in `whenReady`)
   touches startup order — not worth the risk tonight.
5. **`render-process-gone` auto-reload** could loop on a persistent
   renderer crash. Never observed; left as-is.
6. **electron/electron-builder major bumps**: out of scope per audit rules
   (dependency bumps are risky without a full regression pass).

## 📊 The numbers

- 8 commits, ~2,000 lines touched
- 3 launch-blocking bugs fixed (sox chain, WAV/FLAC output, ambient pref)
- ~460 lines of provably-dead code removed
- 0 test regressions; 1 pre-existing test failure fixed; sox test upgraded
  from availability-check to real execution
