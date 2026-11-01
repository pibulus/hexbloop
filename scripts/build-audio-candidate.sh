#!/bin/bash
# Feasibility build only. No installation into vendor/, signing or legal approval.
# Input archives must be fetched from the documented upstream sources first.
set -euo pipefail
ROOT="${1:?usage: build-audio-candidate.sh ABSOLUTE_CANDIDATE_DIRECTORY}"
[[ "$ROOT" == /* && "$(uname -m)" == arm64 ]] || { echo 'Absolute path and native arm64 host required' >&2; exit 1; }
cd "$ROOT"
echo 'd4fcb164028dd3beee5d92c0ac72e46aac6973c75ea12dc14de07bf8f407370a  ffmpeg-6.1.6.tar.xz' | shasum -a 256 -c -
echo 'ddfe36cab873794038ae2c1210557ad34857a4b6bdc515785d1da9e175b1da1e  lame-3.100.tar.gz' | shasum -a 256 -c -
gpg --homedir "$ROOT/gnupg" --no-autostart --batch --status-fd 1 \
    --verify ffmpeg-6.1.6.tar.xz.asc ffmpeg-6.1.6.tar.xz > signature-verification.txt
grep -q 'VALIDSIG FCF986EA15E6E293A5644F10B4322F04D67658D8' signature-verification.txt
[[ ! -e audio-prefix && ! -e lame-build && ! -e ffmpeg-build && ! -e verified-source ]] || { echo 'Candidate build directories already exist; use a fresh workspace' >&2; exit 1; }
mkdir audio-prefix lame-build ffmpeg-build verified-source
tar -xf ffmpeg-6.1.6.tar.xz -C verified-source
tar -xf lame-3.100.tar.gz -C verified-source
export MACOSX_DEPLOYMENT_TARGET=12.0
SDK="$(xcrun --show-sdk-path)"
export CC=/usr/bin/clang
export CFLAGS="-O2 -arch arm64 -mmacosx-version-min=12.0 -isysroot $SDK -std=gnu99"
export LDFLAGS="-arch arm64 -mmacosx-version-min=12.0 -isysroot $SDK"
export PKG_CONFIG_LIBDIR="$ROOT/audio-prefix/lib/pkgconfig"
export PKG_CONFIG_PATH=""
cd "$ROOT/lame-build"
"$ROOT/verified-source/lame-3.100/configure" --prefix="$ROOT/audio-prefix" --host=aarch64-apple-darwin \
    --disable-shared --enable-static --disable-frontend --disable-dependency-tracking
make -j4
make install
cd "$ROOT/ffmpeg-build"
FLAGS=(--prefix="$ROOT/audio-prefix" --arch=arm64 --target-os=darwin --cc=/usr/bin/clang
    --enable-static --disable-shared --disable-gpl --disable-nonfree --disable-version3
    --disable-autodetect --enable-zlib --fatal-warnings --disable-network --disable-ffplay --disable-doc --disable-debug
    --disable-devices --enable-indev=lavfi --disable-postproc --enable-libmp3lame
    --pkg-config-flags=--static --disable-encoders
    --enable-encoder=libmp3lame,flac,pcm_s16le,pcm_s24le,pcm_f32le,pcm_s16be,pcm_s24be,pcm_s32be,png,mjpeg,rawvideo
    --extra-cflags="-O2 -arch arm64 -mmacosx-version-min=12.0 -isysroot $SDK -I$ROOT/audio-prefix/include"
    --extra-ldflags="-arch arm64 -mmacosx-version-min=12.0 -isysroot $SDK -L$ROOT/audio-prefix/lib")
printf '%s\n' "${FLAGS[@]}" > "$ROOT/ffmpeg-configure-flags.txt"
"$ROOT/verified-source/ffmpeg-6.1.6/configure" "${FLAGS[@]}"
make -j4
make install
"$ROOT/audio-prefix/bin/ffmpeg" -version > "$ROOT/candidate-version.txt" 2>&1
"$ROOT/audio-prefix/bin/ffmpeg" -L > "$ROOT/candidate-license.txt" 2>&1
shasum -a 256 "$ROOT/audio-prefix/bin/ffmpeg" "$ROOT/audio-prefix/bin/ffprobe" > "$ROOT/candidate-sha256.txt"
echo "Candidate built in $ROOT/audio-prefix/bin (NOT cleared for release)"
