# Release checklist — Hexbloop 1.0.0, macOS 15+, arm64

Do not publish, upload or open checkout until every line passes. Checkout stays
closed by `ready: false` in `hexbloop-site/src/lib/config/release.ts`.

## 0. Preconditions

- Apple Silicon build host, Xcode command line tools.
- Developer ID Application certificate, Team `V433H655PN`.
- Notary keychain profile `AC_PASSWORD` present
  (`xcrun notarytool store-credentials AC_PASSWORD`).
- `docs/REDISTRIBUTION-REVIEW.md` approved by a human, with the vendor
  provenance record updated.

## 1. Audio pair

```bash
file vendor/mac/ffmpeg vendor/mac/ffprobe     # both: Mach-O 64-bit executable arm64
./vendor/mac/ffmpeg -version | head -1         # 6.1.6, no --enable-nonfree
python3 scripts/release-binaries.py vendor/mac node_modules/canvas/build/Release
```

Any FAIL stops here. The gate checks architecture, macOS floor, linkage,
hashes and recorded approval.

## 2. Tests

```bash
npm ci
npm test
npm run test:phase-c
npm run test:phase-d
npm run test:settings
npm run test:hud
```

`test:local-packaged` needs the packaged directory argument; run it after step 3
against the built app.

## 3. Build, sign, notarize

```bash
npm run dist
```

`afterSign` notarizes and staples the app; `afterAllArtifactBuild` submits the
DMG to `notarytool` with `AC_PASSWORD` and staples it. A failure aborts the
build rather than shipping an unstapled artifact.

## 4. Gate

```bash
./release-check.sh
```

Requires `dist/mac-arm64/Hexbloop.app` and
`dist/Hexbloop-1.0.0-arm64.dmg`. It verifies signatures, hardened runtime,
stapler tickets, Gatekeeper, binary gates and that the DMG contains the same
app as the staging directory. It does not notarize anything.

## 5. Clean-machine test

On a macOS 15 Apple Silicon Mac with **no** Homebrew, no Rosetta and no sox:

1. Install from the DMG, launch, drop a folder of mixed MP3/WAV/FLAC.
2. Confirm output in `~/Documents/HexbloopOutput`, artwork, tags, and A/B.
3. Turn all five switches off; drop again; confirm the clear no-op message.
4. `spctl -a -vvv -t exec /Applications/Hexbloop.app` passes.

## 6. Open the store

Publish `Hexbloop-<version>-source.tar.gz` (FFmpeg/LAME sources, recipe,
hashes, notices) as a release asset and keep `https://hexbloop.app/licenses`
pointing at it. LGPL asks for the source, not just the notices.

Only after 1–5 pass, in `hexbloop-site/src/lib/config/release.ts`:

```ts
ready: true,
dmgUrl: "https://github.com/pibulus/hexbloop/releases/download/v1.0.0/Hexbloop-1.0.0-arm64.dmg",
```

Set `version`, `size`, `dmgFileName`, `minMacOS` if the artifact differs, run
`deno task check && deno task test && deno task build`, then deploy.

## 7. Verify the live flow

- `/` shows the buy button enabled and the DMG size.
- `POST /api/payment/create` returns a Square checkout URL in **sandbox** until
  `SQUARE_ENVIRONMENT=production` is set deliberately.
- A sandbox purchase redirects to `/success` and downloads the DMG.
- `/version.json` reports the deployed commit.
