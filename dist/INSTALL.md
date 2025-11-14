# 🔮 Hexbloop Installation Guide

## Quick Install

1. **Download** `Hexbloop-1.0.0-macOS.zip`
2. **Extract** the ZIP file (double-click it)
3. **Drag** `Hexbloop.app` to your Applications folder
4. **Important:** On first launch, **right-click** the app and select **Open**

That's it! After the first launch, you can open Hexbloop normally by double-clicking.

---

## Why Right-Click?

Hexbloop is an indie app distributed outside the Mac App Store. macOS shows a security warning on the first launch of any non-App Store app. Right-clicking bypasses this one-time warning.

This is normal for indie software - it's not broken, corrupted, or dangerous. It just means I haven't paid Apple $99/year for a developer certificate 😎

---

## Detailed Instructions

### Method 1: Right-Click (Recommended)

1. Extract `Hexbloop-1.0.0-macOS.zip`
2. Move `Hexbloop.app` to Applications folder
3. **Right-click** (or Control-click) on `Hexbloop.app`
4. Select **Open** from the menu
5. Click **Open** in the security dialog
6. Done! Future launches work normally

### Method 2: Command Line (For Terminal Nerds)

If you prefer the command line, you can remove the quarantine flag:

```bash
# Navigate to where you extracted Hexbloop
cd ~/Downloads  # or wherever you put it

# Remove quarantine flag
xattr -cr Hexbloop.app

# Move to Applications
mv Hexbloop.app /Applications/

# Launch normally
open /Applications/Hexbloop.app
```

---

## System Requirements

- **macOS:** 12.0 (Monterey) or later
- **Architecture:** Apple Silicon (M1/M2/M3) native
- **Dependencies:**
  - `sox` (for audio processing)
  - `ffmpeg` (for audio mastering)

### Installing Dependencies

If you don't have sox and ffmpeg installed:

```bash
brew install sox ffmpeg
```

If you don't have Homebrew, install it from [brew.sh](https://brew.sh)

---

## Troubleshooting

### "App is damaged and can't be opened"

This usually means you double-clicked instead of right-clicking on first launch. Try:
1. Delete the app from Applications
2. Re-extract from the ZIP
3. **Right-click → Open** (don't double-click!)

### "sox" or "ffmpeg" not found

Install via Homebrew:
```bash
brew install sox ffmpeg
```

### Still Having Issues?

The app includes a helper script. Run this in Terminal:

```bash
# Remove quarantine from installed app
xattr -cr /Applications/Hexbloop.app
```

---

## What Hexbloop Does

Hexbloop transforms your audio files using mystical chaos magic influenced by real astronomical data:

- **Moon Phase Processing** - Different audio characteristics based on current lunar cycle
- **Time-Based Variations** - Night vs morning creates different sonic signatures
- **Mystical Naming** - Auto-generates sparklepop/blackmetal/witchhouse style names
- **Procedural Artwork** - Each file gets unique generative cover art

Drop an audio file, let the hexagons breathe, receive your transformed creation.

---

## Support

This is indie software built with love, chaos, and late-night coding sessions. If you find it useful and want to support development:

- Share it with friends who like weird audio tools
- Report bugs on GitHub (if available)
- Send good vibes into the universe

Enjoy your mystical audio adventures! 🔮✨
