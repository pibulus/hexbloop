#!/bin/bash

# Release gate for Hexbloop's Developer ID DMG. Ported from Spellbreak/RackOff, plus
# the two checks that are specific to how THIS app broke before:
#
#   1. The bundled audio engine. Hexbloop shells out to ffmpeg/ffprobe/sox. If they
#      are not inside the app, it resolves them off the BUILD machine's PATH and dies
#      on every clean Mac — silently, because a missing binary only reaches a
#      console.log. The 2026-07 audit found the shipped DMG had no vendor dir at all.
#   2. Gatekeeper on the app INSIDE the mounted DMG. spctl on the disk image itself
#      mis-assesses and is a known false flag; the app bundle inside is the real test.

set -uo pipefail

APP_NAME="Hexbloop"
BUNDLE_ID="com.hexbloop.audio"
APP_BUNDLE="dist/mac-arm64/${APP_NAME}.app"
DMG_PATH="$(ls dist/${APP_NAME}-*.dmg 2>/dev/null | head -1)"

PASS_COUNT=0
WARN_COUNT=0
FAIL_COUNT=0

pass() { PASS_COUNT=$((PASS_COUNT + 1)); printf "✅ %s\n" "$1"; }
warn() { WARN_COUNT=$((WARN_COUNT + 1)); printf "⚠️  %s\n" "$1"; }
fail() { FAIL_COUNT=$((FAIL_COUNT + 1)); printf "❌ %s\n" "$1"; }

if [[ ! -d "$APP_BUNDLE" ]]; then
    fail "App bundle missing: ${APP_BUNDLE} (run 'npm run dist' first)"
    printf "\nRelease check: %d pass, %d warn, %d fail\n" "$PASS_COUNT" "$WARN_COUNT" "$FAIL_COUNT"
    exit 1
fi
pass "App bundle exists: ${APP_BUNDLE}"

ACTUAL_ID=$(/usr/libexec/PlistBuddy -c "Print CFBundleIdentifier" "${APP_BUNDLE}/Contents/Info.plist" 2>/dev/null)
if [[ "$ACTUAL_ID" == "$BUNDLE_ID" ]]; then
    pass "Bundle identifier is ${BUNDLE_ID}"
else
    # The shipped 2025 build had the literal id "Electron" — the tell that
    # electron-builder never applied the app's own config.
    fail "Bundle identifier is '${ACTUAL_ID}', expected '${BUNDLE_ID}'"
fi

# --- the audio engine has to actually be in the box ---
RESOURCES="${APP_BUNDLE}/Contents/Resources/vendor/mac"
for bin in ffmpeg ffprobe sox; do
    if [[ -x "${RESOURCES}/${bin}" ]]; then
        pass "Bundled ${bin} is present and executable"
    else
        fail "Bundled ${bin} is MISSING — the app will fall back to the build machine's PATH and do nothing on a clean Mac (run: npm run vendor:setup)"
    fi
done

if codesign --verify --deep --strict "$APP_BUNDLE" >/tmp/hexbloop-codesign.log 2>&1; then
    pass "App code signature verifies"
else
    fail "App code signature does not verify"
    sed 's/^/   /' /tmp/hexbloop-codesign.log
fi

codesign -dvv "$APP_BUNDLE" >/tmp/hexbloop-codesign-details.log 2>&1
if grep -q "Authority=Developer ID Application" /tmp/hexbloop-codesign-details.log; then
    pass "App is signed with Developer ID Application"
else
    fail "App is not signed with a Developer ID Application certificate"
fi

if grep -q "flags=.*runtime" /tmp/hexbloop-codesign-details.log; then
    pass "Hardened runtime is enabled"
else
    fail "Hardened runtime is not enabled"
fi

if spctl -a -vvv -t exec "$APP_BUNDLE" >/tmp/hexbloop-spctl-app.log 2>&1; then
    pass "Gatekeeper accepts the app"
else
    warn "Gatekeeper does not accept the app yet"
    sed 's/^/   /' /tmp/hexbloop-spctl-app.log
fi

if [[ -n "$DMG_PATH" && -f "$DMG_PATH" ]]; then
    pass "DMG exists: ${DMG_PATH}"

    if xcrun stapler validate "$DMG_PATH" >/tmp/hexbloop-stapler.log 2>&1; then
        pass "DMG has a valid stapled notarization ticket"
    else
        # electron-builder logs "skipped macOS notarization" and still exits 0, so
        # this is the only thing standing between a green build and a "damaged app"
        # dialog on someone else's Mac.
        fail "DMG has NO stapled notarization ticket (xcrun notarytool submit --keychain-profile AC_PASSWORD, then xcrun stapler staple)"
        sed 's/^/   /' /tmp/hexbloop-stapler.log
    fi

    # Mount and test the app INSIDE — spctl on the image itself is the known false flag.
    MOUNT_POINT=$(mktemp -d)
    if hdiutil attach "$DMG_PATH" -mountpoint "$MOUNT_POINT" -nobrowse -quiet >/dev/null 2>&1; then
        INNER_APP="${MOUNT_POINT}/${APP_NAME}.app"
        if [[ -d "$INNER_APP" ]]; then
            if spctl -a -vvv -t exec "$INNER_APP" >/tmp/hexbloop-spctl-inner.log 2>&1; then
                pass "Gatekeeper accepts the app INSIDE the mounted DMG (the test that matters)"
            else
                fail "Gatekeeper rejects the app inside the DMG — this is what a downloader gets"
                sed 's/^/   /' /tmp/hexbloop-spctl-inner.log
            fi

            if [[ -x "${INNER_APP}/Contents/Resources/vendor/mac/ffmpeg" ]]; then
                pass "The DMG's own copy carries the bundled engine"
            else
                fail "The DMG's copy has NO bundled ffmpeg — the download is inert"
            fi
        else
            fail "No ${APP_NAME}.app found inside the DMG"
        fi
        hdiutil detach "$MOUNT_POINT" -quiet >/dev/null 2>&1
    else
        warn "Could not mount the DMG to test the app inside it"
    fi
    rmdir "$MOUNT_POINT" 2>/dev/null
else
    fail "No DMG found in dist/"
fi

rm -f /tmp/hexbloop-codesign.log \
    /tmp/hexbloop-codesign-details.log \
    /tmp/hexbloop-spctl-app.log \
    /tmp/hexbloop-spctl-inner.log \
    /tmp/hexbloop-stapler.log

printf "\nRelease check: %d pass, %d warn, %d fail\n" "$PASS_COUNT" "$WARN_COUNT" "$FAIL_COUNT"

if [[ "$FAIL_COUNT" -gt 0 ]]; then
    exit 1
fi
