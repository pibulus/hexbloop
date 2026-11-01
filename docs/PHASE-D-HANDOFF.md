# Phase D — local implementation handoff

Commercial readiness BLOCKED. Phase A binaries/legal/Monterey and private paid delivery remain unresolved. No commit, push, deployment, release, credentials change or production purchase.

## Change inventory

- `src/shared/discover-audio.js:14`: main-process stable folder discovery; canonical deduplication; symlinks skipped; 200-file, eight-level, 4000-entry bounds; unreadable/empty/unsupported entries get receipt reasons.
- `main.js:197`: discovery precedes progress totals and manifest counts; serial processing; removed global GC hint. Explicit Open Output replaces automatic Finder opening.
- `main.js:38,417,424,436`: folder picker, Open Output, current-pair preview authorization; two-path allowlist, 24 MB limit per on-demand side, path/symlink checks. Absolute renderer load path fixes alternate Electron entrypoints.
- `preload.js`: narrowly scoped folder, output and selected-pair IPC.
- `src/menu/menu-builder.js`: Cmd+O stays file selection; separate folder action.
- `src/renderer/batch-receipt.js`: ready/skipped summary independent of playback.
- `src/renderer/app.js:102,190,542,701,723`: grouped transport, skipped popover, one Blob at a time, stale-load tokens, ambient pause/restore, persistent receipts, frame-throttled wrapper parallax. Breathing/spin transforms stay on inner elements.
- `src/renderer/index.html`: keyboard-accessible glass dock, split Browse action, unified idle rail and single-row loaded rail.
- `src/renderer/style.css:1036`: compact 6–10 px keycap geometry, no gradient-filled HUD controls, glow dots, single-row rail. Reduced motion disables breathing/parallax.
- `test/phase-b-matrix.test.js`: numbered batch now uses two distinct input paths; duplicate paths correctly deduplicate.
- `test/phase-d-*.test.js`, `test/electron-visual*.js`, `test/electron-benchmark.js`: isolated discovery, IPC, UI, actual Electron captures and process-tree resource measurement.

## Commands / evidence

- `npm run test:phase-d`: PASS; nested/mixed discovery, empty/unsupported/duplicate/symlink, injected partial read failure and bounds; discovered manifest totals; 28-ready/2-skipped UI; mouse/keyboard A/B, ambient restoration, rapid loads, 24 MB fallback, Blob release, reduced motion.
- `npm run test:phase-b`: PASS, 96 mask/format cases, three explicit codec choices, custom tags, covered-source paths and main IPC/menu checks.
- `npm run test:phase-c`: PASS, lunar/seeded-art/analyzer/short-MP3/saturation/head-bump/cover-mux fallback.
- `npm run test:e2e`: PASS, 8 passed, 0 failed, including missing-Sox fallback.
- `./node_modules/.bin/electron test/electron-visual.js`: actual Electron renderer captures at 800×600, 1200×800, 1440×900, 1728×1117. Receipt data/preview error are fixtures, not 28 real processed tracks. Idle/progress/loaded screenshots inspected. This is offscreen Electron, not a human physical-screen/Gatekeeper test.
- `npm run benchmark:phase-d:electron`: three sequential full-chain inputs, 1000px artwork: 35s bundled ambient MP3 excerpt, 30s generated stereo 48k/24-bit layered WAV, 18s generated mono tonal/noise FLAC. Actual renderer-load assertion passed; secure IPC and Blob preview creation passed without audible playback. 6.47s batch wall time for about 83s input. Peak sampled summed RSS 386 MB; observed app component peak 382 MB and DSP component peak 120 MB occurred at different samples, so do not add those maxima. 107 samples, 50ms ps sampling. Shared pages counted per process; short peaks can be missed. Not a 30-track benchmark, diverse real-library test, listening judgment or product throughput promise.
- Earlier 343 MB run had a blank renderer and is invalid as full-UI evidence; superseded by the 386 MB renderer-verified run.
- `git diff --check`: PASS. Full `npm test` not run because legacy suites use fixed artifact paths.

## Screenshots

- `docs/screenshots/phase-d-v2-idle-800.png`
- `docs/screenshots/phase-d-v2-loaded-800.png`
- `docs/screenshots/phase-d-v2-progress-800.png`

## Limitations

Preview still uses full-file IPC, now one capped side (24 MB) at a time, not streaming. Oversized tracks retain processing/output and show No preview with an explanatory tooltip. Playback listen quality and native drag gestures require human/device checks. Most benchmark sources are generated; only one excerpt is bundled real audio. No concurrency added. All pre-existing site changes preserved; no new Phase D site edits.

## HQ correction gate — small follow-up

- `src/renderer/style.css:1095–1106`: keep 48px rail; allow a 160px track block with the complete `No preview` state below the selected filename. Progress sits 72px above the window bottom, above utilities; long filenames wrap/clamp to two lines.
- `src/renderer/app.js:750–753`: selected track also supplies its full filename as a title, without relying on that title for the tested normal-length readout.
- `src/shared/discover-audio.js:19–23,39–47`, `main.js:208`: skip canonical configured-output directory/subtrees and dot-prefixed directories during traversal. Explicit file selections from either remain usable. Report exclusions in skipped reasons.
- `test/phase-d-discovery.test.js:43–59`, `test/phase-d-main.test.js:42–60`: nested output/hidden regression, explicit file override, discovered progress/manifest totals.
- `test/electron-visual.js:27–74`: actual Electron viewport, group/no-overlap and readout overflow assertions; both normal and long progress filenames. Wait for compositor frames before capture to avoid stale screenshots.
- `./node_modules/.bin/electron test/electron-visual.js`: PASS at 800×600 and larger windows. Complete `01/28 · track-0.wav` and `No preview` visible; normal/long progress has no overlap with hex or utilities. Offscreen Electron with fixture receipt, not a physical-screen/listening check.
- Regressions rerun after correction: `npm run test:phase-b` PASS (96 + codec/custom + covered-source + IPC/menu), `npm run test:phase-c` PASS, `npm run test:phase-d` PASS, `npm run test:e2e` PASS (8/8). `git diff --check` PASS in both repos.
- New screenshots, superseding v2: `docs/screenshots/phase-d-v3-idle-800.png`, `phase-d-v3-progress-800.png`, `phase-d-v3-progress-long-800.png`, `phase-d-v3-loaded-800.png`.
- Both repos remain on main, all changes uncommitted. App: 23 modified/20 untracked; site: 22 modified/2 existing deletions/10 untracked. No site edits in this correction. Phase A and commercial release remain BLOCKED. Checkout unchanged and paused. Stop after this gate.
