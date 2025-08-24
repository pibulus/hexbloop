#!/bin/bash
# Fix Electron app name in development
# This patches the Electron binary's Info.plist to show "Hexbloop" instead of "Electron"

ELECTRON_PATH="node_modules/electron/dist/Electron.app/Contents/Info.plist"

if [ -f "$ELECTRON_PATH" ]; then
    echo "🔧 Patching Electron app name to show 'Hexbloop'..."
    
    # Use PlistBuddy to change the CFBundleName
    /usr/libexec/PlistBuddy -c "Set :CFBundleName Hexbloop" "$ELECTRON_PATH" 2>/dev/null || {
        echo "⚠️  PlistBuddy failed, trying sed approach..."
        # Fallback to sed if PlistBuddy doesn't work
        sed -i '' 's/<string>Electron<\/string>/<string>Hexbloop<\/string>/g' "$ELECTRON_PATH"
    }
    
    echo "✅ App name patched! Restart the app to see 'Hexbloop' in the menu bar."
    echo "⚠️  Note: This change will be lost if you reinstall node_modules."
else
    echo "❌ Electron binary not found at: $ELECTRON_PATH"
    echo "Make sure you've run 'npm install' first."
fi