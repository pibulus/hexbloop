#!/bin/bash
# Hexbloop Quick Install Script
# Removes quarantine flags and installs to Applications

set -e

echo "🔮 Hexbloop Quick Installer"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Find the app in current directory
if [ ! -d "Hexbloop.app" ]; then
    echo "❌ Error: Hexbloop.app not found in current directory"
    echo "Please run this script from the directory containing Hexbloop.app"
    exit 1
fi

echo "📦 Found Hexbloop.app"
echo "🧹 Removing quarantine flags..."
xattr -cr Hexbloop.app

echo "📂 Moving to Applications folder..."
if [ -d "/Applications/Hexbloop.app" ]; then
    echo "⚠️  Hexbloop already exists in Applications"
    read -p "   Replace it? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf "/Applications/Hexbloop.app"
    else
        echo "❌ Installation cancelled"
        exit 0
    fi
fi

cp -R Hexbloop.app /Applications/

echo ""
echo "✨ Installation complete!"
echo ""
echo "You can now launch Hexbloop from:"
echo "  • Applications folder"
echo "  • Spotlight (⌘ Space, then type 'hexbloop')"
echo "  • Launchpad"
echo ""
echo "🔮 Transform your audio with mystical chaos magic!"
