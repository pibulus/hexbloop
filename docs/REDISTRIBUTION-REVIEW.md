# Redistribution review packet — audio pair

**Status: APPROVED 2026-11-02 by Pablo Alvarado.** The vendor provenance record
in `vendor/mac/provenance.json` carries `redistributionReview: "approved"`, the
reviewer and date, and the binary gate passes with zero failures. This page
remains the evidence trail; it is not legal advice. The source/relink material
still needs a public home before the paid DMG is distributed.

## Artifacts under review

| Artifact | Version | SHA-256 | Arch / floor | Linkage |
|---|---|---|---|---|
| `vendor/mac/ffmpeg` | FFmpeg 6.1.6 | `7faf3f9548a9920d0e702a1c680cfca70819b79dd2e9bfb04b507302becf5abd` | arm64 only, minos 12.0 | `/usr/lib/libSystem`, `libz`, Apple frameworks |
| `vendor/mac/ffprobe` | FFmpeg 6.1.6 | `697db624fcbeaa308def6c074df1dca67cea07e8baa5a5e3d845a436cc402b62` | arm64 only, minos 12.0 | same |

Source pins, configure flags, notices and retained build evidence live in
`docs/PHASE-A-AUDIO-CANDIDATE.json` and its candidate workspace.

- FFmpeg 6.1.6 tarball + detached signature, fingerprint
  `FCF986EA15E6E293A5644F10B4322F04D67658D8`.
- LAME 3.100 tarball, hash-pinned over HTTPS (no upstream signature).
- Configure disables GPL and nonfree. `-L` reports LGPL v2.1-or-later.
- LAME is statically linked; its LGPL obligations are the open question.

## What a reviewer is approving

1. That these exact bytes may be redistributed inside the DMG.
2. That the LGPL source/relink obligation is satisfied by the retained source
   archives, build recipe and notices (or that a written offer is required).
3. That the notices shipped in the app are sufficient.

## What the reviewer edits

In `vendor/mac/provenance.json` (gitignored, copied into the bundle):

- `redistributionReview`: `"approved"`
- `reviewer`, `reviewDate`: real values
- keep `sha256` unchanged — the gate compares bytes

Then `python3 scripts/release-binaries.py vendor/mac node_modules/canvas/build/Release`
must print no failures. That script also rejects x86 slices, non-arm64 lipo
output, macOS floors above 15.0, external dylib linkage and nonfree builds.

## Do not ship

The previous `vendor/mac/ffmpeg` reported `--enable-nonfree` and is not legally
redistributable. It has been replaced locally by the pair above; do not restore
it, and do not treat this packet as approval.
