# 🔮 FABLE AUDIT — 2026-07-05

Launch-readiness audit-and-fix pass on the Hexbloop Electron app.
Branch: `fable-audit-2026-07-05` (from `c06ec55`). Pre-audit working tree
preserved in stash `fable-audit-safepoint WIP` — **do not drop it** until
you've confirmed the branch has everything you expect.

Every fix below was verified: all test suites pass, a real end-to-end
harness runs the actual pipeline against the fixture across the
format/stage matrix, and the app boots clean.

> **Pass two (2026-07-06)** added: CSS control dedupe (screenshot-verified),
> A/B playback + IPC hardening (path allowlist, size cap, dead-channel
> removal, boot race fix, crash-loop guard, visible errors), and foundation
> work (E2E test + output-path unit tests now IN the repo, constants pruned,
> web assets excluded from the bundle). See the "PASS TWO" section near the
> bottom.

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

## 📊 The numbers (pass one)

- 8 commits, ~2,000 lines touched
- 3 launch-blocking bugs fixed (sox chain, WAV/FLAC output, ambient pref)
- ~460 lines of provably-dead code removed
- 0 test regressions; 1 pre-existing test failure fixed; sox test upgraded
  from availability-check to real execution

---

# 🌙 PASS TWO — 2026-07-06

Second sweep, now with the codebase understood. Focus shifted from
"fix what's broken" to "make it a solid foundation to build on."

## 🎨 CSS control dedupe (screenshot-verified)

`.ambient-toggle` was defined **three times** and `.settings-button` /
`.toggle-icon` / `.settings-icon` twice each — the last-in-cascade block
won, the rest were dead weight that made the file lie about what renders.
Collapsed each to a single definition, preserving the `.playing` state,
`:active` feedback, and `gentle-pulse`; dropped the orphaned `audio-pulse`
keyframe. **Verified** by capturing before/after Electron screenshots with
the `.playing` state forced and comparing — identical layout/controls
(the only pixel delta was the glow's random animation phase, which is
noisier run-to-run than the change itself). 127 lines removed, 930 → 803.

## 🔒 A/B playback + IPC hardening

`read-audio-file` was the softest remaining spot — it read any path the
renderer named, fully into memory, twice:
- **Path allowlist**: the renderer can now only read files THIS session
  processed (inputs + outputs), not arbitrary disk paths.
- **200MB size cap**: both A/B sides load into renderer memory at once, so
  a multi-hour WAV would OOM the tab. Now rejected with a clear message.
- **Dead IPC removed**: `get-file-paths-from-drop` (renderer uses webUtils)
  and the `processing-update` channel + `onProcessingUpdate` listener (no
  sender, no listener) — pure attack surface, gone.

## 🩹 Boot & resilience

- **Prefs boot race fixed** (was "deliberately left" #4): `PreferencesManager`
  now exposes `whenReady()`; `main` awaits it before creating the window, so
  a file dropped in the first tick can't see defaults instead of saved prefs.
- **Renderer crash-loop guard** (was "left as-is" #5): `render-process-gone`
  auto-reload is capped at 3 retries with a 30s recovery reset — a renderer
  that crashes on load can no longer spin forever.
- **Errors are visible**: `showError` writes the reason into the progress
  line instead of only flashing the hexagon red.

## 🧱 Foundation (the "build on it" part)

- **E2E test now lives in the repo** (`test/pipeline-e2e.test.js`,
  `npm run test:e2e`). The harness that caught the sox/WAV/FLAC bugs is no
  longer a throwaway in scratch — it runs the real pipeline across the
  format/stage matrix under a headless electron stub and ffprobes every
  output. Skips cleanly without ffprobe.
- **Output-path uniquifier extracted** to `src/shared/output-path.js` with
  6 unit tests (batch + disk collisions). Was inline in main.js, untested.
- **constants.js pruned**: only `WINDOW_CONFIG` was ever imported; removed
  4 dead export groups.
- **Packaging hygiene**: website-only assets (favicon*, apple-touch-icon,
  icon-192/512, manifest.json — they belong to the Fresh site) excluded
  from the app bundle.

## 📊 The numbers (pass two)

- 4 commits, ~350 lines touched
- 2 new test suites in-repo (E2E pipeline, output-path); `npm test` now
  runs 5 suites + a separate `npm run test:e2e`
- ~130 lines of dead CSS + dead IPC/constants removed
- All suites green, E2E 6/6, boot clean

## 🤔 Still deliberately left (unchanged from pass one)

- **Vendor binaries not bundled** — biggest remaining launch decision.
- **`ambient_loop.mp3` is 13MB** — could be ~3MB re-encoded; taste call.
- **electron/electron-builder major bumps** — need a full regression pass.
