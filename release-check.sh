#!/bin/bash
# Check the exact app and DMG, not a stale first glob match. Never notarizes.
set -uo pipefail
cd "$(dirname "$0")" || exit 1
VERSION=$(node -p 'require("./package.json").version') || exit 1
APP="dist/mac-arm64/Hexbloop.app"
DMG="${1:-dist/Hexbloop-${VERSION}-arm64.dmg}"
FAIL=0
check() {
    if "$@"; then printf 'PASS: %s\n' "$*"; else printf 'FAIL: %s\n' "$*"; FAIL=$((FAIL+1)); fi
}

if [[ ! -d "$APP" || ! -f "$DMG" || "$(basename "$DMG")" != "Hexbloop-${VERSION}-arm64.dmg" ]]; then
    echo "FAIL: expected ${APP} and exact ${DMG} (Hexbloop-${VERSION}-arm64.dmg)" >&2
    exit 1
fi

check python3 scripts/release-binaries.py "$APP/Contents/Resources/vendor/mac" "$APP/Contents/Resources/app.asar.unpacked/node_modules/canvas/build/Release" "$APP"
check codesign --verify --deep --strict "$APP"
SIGNATURE=$(codesign -dvv "$APP" 2>&1)
[[ "$SIGNATURE" == *'Authority=Developer ID Application'* && "$SIGNATURE" == *'flags='*'runtime'* ]] || { echo 'FAIL: Developer ID hardened runtime missing'; FAIL=$((FAIL+1)); }
check xcrun stapler validate "$APP"
check xcrun stapler validate "$DMG"
check spctl -a -vvv -t exec "$APP"

MOUNT=$(mktemp -d "${TMPDIR:-/tmp}/hexbloop-check.XXXXXX") || exit 1
MOUNTED=0
cleanup() {
    if [[ "$MOUNTED" == 1 ]]; then hdiutil detach "$MOUNT" -quiet || true; fi
    rmdir "$MOUNT" 2>/dev/null || true
}
trap cleanup EXIT
if hdiutil attach "$DMG" -mountpoint "$MOUNT" -nobrowse -readonly -quiet; then
    MOUNTED=1
    INNER="$MOUNT/Hexbloop.app"
    if [[ -d "$INNER" ]]; then
        check python3 scripts/release-binaries.py "$INNER/Contents/Resources/vendor/mac" "$INNER/Contents/Resources/app.asar.unpacked/node_modules/canvas/build/Release" "$INNER"
        for relative in Contents/Info.plist Contents/Resources/app.asar Contents/_CodeSignature/CodeResources; do
            check cmp -s "$APP/$relative" "$INNER/$relative"
        done
        check codesign --verify --deep --strict "$INNER"
        check xcrun stapler validate "$INNER"
        check spctl -a -vvv -t exec "$INNER"
    else
        echo 'FAIL: DMG has no Hexbloop.app' >&2
        FAIL=$((FAIL+1))
    fi
else
    echo 'FAIL: DMG could not be mounted' >&2
    FAIL=$((FAIL+1))
fi
echo "Release check: $FAIL failure(s)"
[[ $FAIL -eq 0 ]]
