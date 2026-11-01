# Phase A: isolated binary replacement feasibility

## Approved scope update (2026-11-01)

Pablo approved route A: Apple Silicon, macOS 15+. The historical Monterey
investigation below is retained as evidence, not the current release target.
No canvas rebuild or Chromium rewrite is required for this scope. A clean
macOS 15 run is still required; execution on the current newer host is not proof.
Candidate build flags/hashes remain unchanged and redistribution review remains
pending. No candidate has been installed into vendor/mac.

The signing-aware gate now verifies raw pre-sign source pins and human approval,
then expected-team Developer ID signatures and signature-stripped payload equality.
Only stripped __LINKEDIT virtual allocation is normalized, because codesign
changes it; all other remaining bytes must match. The DMG check also compares
the exact signed audio binaries/provenance against the local app. Regression
tests use the existing signed pair without signing or mutating either artifact.

`scripts/prepare-release.js` removes the one observed Homebrew JPEG LC_RPATH
from future packaged copies before signing, then audits them. Installed canvas
libraries remain untouched; unknown external paths still fail. Verify with
`python3 -B test/release-provenance.test.py`, `node test/prepare-release.test.js`,
`npm run vendor:setup` (expected failure until reviewed audio is installed), and
ultimately `./release-check.sh` on a newly built signed app/DMG. Nothing here
authorizes signing, notarization, checkout activation, commit, push or deployment.

Commercial release remains **BLOCKED**. No binary in `vendor/mac`, packaged app,
DMG or live site is changed by this investigation. No notarization or deployment.

## Starting checkpoint

App implementation committed as `7f46769` (Phases B–D and fail-closed release
gates). The site contains pre-existing, mixed uncommitted work and was not swept
into that commit. No push.

Recheck: `./release-check.sh` exits 1. Both existing app and mounted DMG still
fail the binary gates despite valid signatures/tickets/Gatekeeper acceptance:

- `vendor/mac/ffmpeg`: arm64, minos 12.0, FFmpeg 6.0, `--enable-gpl --enable-nonfree`,
  reports not legally redistributable. SHA-256
  `a90e3db6a3fd35f6074b013f948b1aa45b31c6375489d39e572bea3f18336584`.
- `vendor/mac/ffprobe`: x86_64. SHA-256
  `5b592e56f87ff754d94dadf99f38b4d0fb7d463eb780b50e0ca061d668d0e3f7`.
- Canvas native dependency set: macOS-15 dylibs. Old packaged Info.plist still
  declares 11.0. Updating package configuration cannot repair existing artifacts.

## Audio source candidate

Build locally from pinned archives, no binary-provider URL guessed:

| Input | Upstream | SHA-256 |
|---|---|---|
| FFmpeg 6.1.6 | https://ffmpeg.org/releases/ffmpeg-6.1.6.tar.xz | `d4fcb164028dd3beee5d92c0ac72e46aac6973c75ea12dc14de07bf8f407370a` |
| LAME 3.100 | https://sourceforge.net/projects/lame/files/lame/3.100/lame-3.100.tar.gz/download | `ddfe36cab873794038ae2c1210557ad34857a4b6bdc515785d1da9e175b1da1e` |

FFmpeg detached signature verified against the fingerprint published at
https://ffmpeg.org/download.html:
`FCF986EA15E6E293A5644F10B4322F04D67658D8`. GPG reports a valid signature;
the downloaded key has no personal web-of-trust certification. LAME was fetched
over HTTPS and hash-pinned, not verified with an upstream signature.

`scripts/build-audio-candidate.sh` builds only into a fresh external workspace.
It verifies source hashes and FFmpeg's signature, extracts fresh sources,
targets arm64/macOS 12.0, disables GPL/nonfree/version3/autodetect/network,
enables static LAME and Apple-system zlib, and treats FFmpeg configure warnings
as errors. No npm installs/uninstalls or release-tree mutations.

Host: arm64 macOS 26.5.1; Apple clang 21.0.0; SDK 26.5. Targeting 12.0 is **not**
proof of execution on 12.0. Exact configuration, dependency paths and binary
hashes belong in the generated candidate provenance, not guessed from flags.

First build was rejected by tests: automatic dependency discovery was disabled
but zlib was not explicitly enabled, so PNG encoding/decoding was absent and
FLAC artwork embedding failed (Phase B and E2E). Its hashes are *not* approved
replacement pins. Revised recipe enables zlib and fails on configure warnings.

## Canvas: rejected downgrade, whole closure still required

Verified upstream asset via GitHub release metadata:
https://github.com/Automattic/node-canvas/releases/download/v3.1.2/canvas-v3.1.2-napi-v7-darwin-arm64.tar.gz

Archive SHA-256 matches the GitHub API digest:
`42abb1aeaf465006eef687dcbd49c6a88f3c425492fa3c57919591798f199bd5`.
Inspected **31** native files: `canvas.node` minos 11.0; **30 dependency dylibs
minos 15.0**, including Cairo and Pango. Rejected. No package downgrade installed.

Upstream's compilation documentation requires Cairo/Pango; JPEG, GIF and SVG
libraries are optional. A viable Monterey rebuild must constrain the *entire*
dependency closure to a private prefix and target, preserve PNG/JPEG/text and
all eight artwork paths, relocate dynamic dependencies, and audit every native
file plus its notices. Merely rebuilding canvas.node or lowering load commands
is not a solution. No compliant whole-set artifact has been supplied here.

## Human/legal and release gates (still closed)

- FFmpeg reports LGPL-2.1-or-later when GPL/nonfree features are excluded.
  LAME's archive contains the GNU Library GPL v2 text and source-file notices.
  This is a technical observation, **not legal clearance**.
- Static linkage requires review of corresponding-source/relink obligations,
  exact source archives, object/archive/build inputs and toolchain recipe.
  Preserve FFmpeg `LICENSE.md`, `COPYING.LGPLv2.1`, LAME `COPYING` and notices.
- Complete source/relink delivery, app/About/EULA and download-page notices
  remain human review items. Review patent considerations as applicable.
- System zlib is linked from macOS, not copied from Homebrew. No claim that
  system linkage or a green test removes licensing obligations.
- Required references: https://ffmpeg.org/legal.html and
  https://github.com/Automattic/node-canvas/blob/v3.2.0/Readme.md.
- Clean native Monterey run, complete canvas rebuild/provenance, final app/DMG
  native audit and signing/notary gates remain required. Candidate approval
  stays `pending-human-review`; empty reviewer/date cannot pass `vendor:setup`.

## Tooling added during feasibility

- `test/use-audio-candidate.js`: test-only binary override, arm64 check, disables
  local Sox to exercise the FFmpeg fallback; no production override introduced.
- `scripts/record-audio-candidate.py`: records native audit, exact hashes,
  configure flags, system dependencies, sources and pending legal/Monterey gates.
- `scripts/release-binaries.py`: distinguish `--disable-nonfree` from
  `--enable-nonfree`; the former must not be incorrectly labelled nonfree.
- `python3 -B test/release-provenance.test.py`: parser regression passes;
  does not bypass the separate human-review requirement.

## Revised candidate result

**Technically viable audio pair on the current host; not installed or approved.**

Candidate workspace:
`/private/var/folders/qz/qk7f1ygs4wvgly4_zgwzycmc0000gn/T/opencode/hexbloop-a2-cih6txjb`

- `audio-prefix/bin/ffmpeg`: SHA-256
  `7faf3f9548a9920d0e702a1c680cfca70819b79dd2e9bfb04b507302becf5abd`.
- `audio-prefix/bin/ffprobe`: SHA-256
  `697db624fcbeaa308def6c074df1dca67cea07e8baa5a5e3d845a436cc402b62`.
- Both arm64-only; LC_BUILD_VERSION minos 12.0, SDK 26.5. Runtime links:
  `/usr/lib/libSystem.B.dylib`, `/usr/lib/libz.1.dylib`, and Apple's
  CoreFoundation/CoreVideo/CoreMedia frameworks. No external Homebrew linkage.
- FFmpeg `-L` reports LGPL v2.1-or-later; configure disables GPL/nonfree and
  enables PNG support through system zlib. `otool` checks alone cannot establish
  that the SDK introduced no newer symbol requirements: clean Monterey still needed.
- Exact flags, source pins, binary hashes, dependency paths, toolchain and legal
  status: `docs/PHASE-A-AUDIO-CANDIDATE.json`. Native reports have zero technical
  audit failures for this pair. Review/date deliberately blank and approval pending.
- Source archives, build trees/static archives/objects, signature evidence,
  executed recipe and copied license notices remain in that temporary workspace.
  They are not a published source/relink delivery bundle and may need durable
  archival before any release. No claim of byte-identical builds across SDKs/paths.

Commands run:

```sh
bash scripts/build-audio-candidate.sh <candidate-workspace>
python3 -B scripts/record-audio-candidate.py <candidate-workspace>
HEXBLOOP_AUDIO_CANDIDATE=<candidate-workspace>/audio-prefix/bin \
  node --require ./test/use-audio-candidate.js test/phase-b-matrix.test.js
HEXBLOOP_AUDIO_CANDIDATE=<candidate-workspace>/audio-prefix/bin \
  node --require ./test/use-audio-candidate.js test/phase-c.test.js
HEXBLOOP_AUDIO_CANDIDATE=<candidate-workspace>/audio-prefix/bin \
  node --require ./test/use-audio-candidate.js test/pipeline-e2e.test.js
python3 -B scripts/release-binaries.py \
  <candidate-workspace>/audio-prefix/bin node_modules/canvas/build/Release
```

Results: Phase B **96 mask/format cases + three explicit codec choices + custom
metadata + covered-source + IPC/menu checks PASS**; Phase C **PASS**; E2E
**8 passed, 0 failed**. Candidate preloader disables developer Sox. Native
FFmpeg/ffprobe are used by the runtime pipeline; some fixture-generation/probe
helpers still use local developer tools. Existing macOS-15 canvas is still used
for these current-host tests, so this is not a clean-Monterey or clean-machine proof.

The candidate release gate exits **1**, with **39 failures**: six missing human
review/approval checks across the pair, plus current canvas minima/linkage failures.
It does not falsely call `--disable-nonfree` a nonredistributable build. Original
`vendor/mac` hashes remain unchanged. Old signed artifacts are unchanged and fail
the full release check. The new feasibility tooling/report remain uncommitted
after the initial `7f46769` checkpoint. Site work remains untouched and uncommitted.
