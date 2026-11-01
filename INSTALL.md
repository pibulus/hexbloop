# 🔮 Hexbloop Installation Guide

## Install

1. Open `Hexbloop-1.0.0-arm64.dmg`
2. Drag `Hexbloop` into Applications
3. Double-click to launch

The DMG is signed with a Developer ID certificate and notarized by Apple, so
Gatekeeper verifies it on first launch. No right-click bypass, no quarantine
script, no "unidentified developer" dance.

Verified with: `spctl -a -vvv -t exec /Applications/Hexbloop.app` and
`xcrun stapler validate /Applications/Hexbloop.app`.

---

## System Requirements

- **macOS:** 15.0 (Sequoia) or later. The bundled canvas libraries are built
  against the macOS 15 SDK, so this is a real floor, not a preference.
- **Architecture:** Apple Silicon only (M1/M2/M3/M4). The app and every binary
  inside it are native `arm64`; Rosetta 2 is never used.
- **Dependencies:** none. `ffmpeg` and `ffprobe` ship inside the app as native
  `arm64` builds (LGPL, no Homebrew linkage).

Optional: if `sox` is installed, Hexbloop uses the full lunar tape chain.
Without it, the FFmpeg tape-saturation chain runs and the app still works.

Check any bundled binary with:

```bash
file /Applications/Hexbloop.app/Contents/Resources/vendor/mac/ffprobe
# Mach-O 64-bit executable arm64
```

---

## Where Output Goes

Finished files land in `~/Documents/HexbloopOutput` unless another destination
is chosen in Settings. Originals are never modified in place.

---

## Troubleshooting

### "App is damaged and can't be opened"

The download is probably incomplete. Verify it against the size and checksum
published with the release, then re-download. Rebuilding from source is not the
fix for a truncated DMG.

### Gatekeeper or notarization questions

```bash
codesign --verify --deep --strict /Applications/Hexbloop.app
spctl -a -vvv -t exec /Applications/Hexbloop.app
```

A notarized build passes both. If they fail, the copy was modified or the
download was corrupted.

### Windows and Linux

Not available. Hexbloop is a macOS app for Apple Silicon.

### Still stuck?

Release support lives at https://hexbloop.app/support. Include the macOS version
and the exact message; that is enough to reproduce most launch problems.

---

## What Hexbloop Does

Five switches decide the batch: Master, Compress, Cover Art, Metadata, Rename.
Any combination is valid, including turning audio stages off so only renaming or
tagging happens.

- Lunar tape color and FFmpeg mastering
- Procedural cover art driven by the audio itself
- Mystical or preserved filenames
- Tags written only when Metadata is on

Drop files or whole folders onto the hexagon, or click it to browse.
