#!/usr/bin/env node
/**
 * @fileoverview Download ffmpeg, ffprobe, and sox binaries for bundling
 * @description Run with: npm run vendor:setup
 *
 * Downloads platform-appropriate binaries into vendor/<platform>/
 * These get bundled into the app via electron-builder extraResources.
 *
 * Sources:
 *   ffmpeg/ffprobe: https://github.com/eugeneware/ffmpeg-static (via npm)
 *                   https://www.gyan.dev/ffmpeg/builds/ (Windows)
 *                   https://evermeet.cx/ffmpeg/ (macOS)
 *                   https://johnvansickle.com/ffmpeg/ (Linux)
 *   sox:           https://sourceforge.net/projects/sox/
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

const PLATFORM = process.platform === 'win32' ? 'win'
    : process.platform === 'darwin' ? 'mac'
    : 'linux';

const ARCH = process.arch; // x64, arm64, etc.
const VENDOR_DIR = path.join(__dirname, '..', 'vendor', PLATFORM);

// Binary download URLs by platform
// These point to well-known static build providers
const SOURCES = {
    mac: {
        ffmpeg: `https://evermeet.cx/ffmpeg/getrelease/ffmpeg/zip`,
        ffprobe: `https://evermeet.cx/ffmpeg/getrelease/ffprobe/zip`,
        sox: null // sox must be installed via Homebrew on macOS for now
    },
    win: {
        // Windows builds from gyan.dev (widely used, GPL-licensed)
        ffmpeg: `https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip`,
        ffprobe: null, // Included in ffmpeg zip
        sox: `https://sourceforge.net/projects/sox/files/sox/14.4.2/sox-14.4.2-win32.zip/download`
    },
    linux: {
        ffmpeg: `https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-${ARCH === 'arm64' ? 'arm64' : 'amd64'}-static.tar.xz`,
        ffprobe: null, // Included in ffmpeg archive
        sox: null // sox should be installed via package manager on Linux
    }
};

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

/**
 * Check if we already have the binaries
 */
function checkExisting() {
    const ext = PLATFORM === 'win' ? '.exe' : '';
    const ffmpegPath = path.join(VENDOR_DIR, `ffmpeg${ext}`);
    const ffprobePath = path.join(VENDOR_DIR, `ffprobe${ext}`);

    const haveFFmpeg = fs.existsSync(ffmpegPath);
    const haveFFprobe = fs.existsSync(ffprobePath);

    return { haveFFmpeg, haveFFprobe };
}

async function main() {
    console.log(`\n🔮 Hexbloop Vendor Binary Setup`);
    console.log(`   Platform: ${PLATFORM} (${ARCH})`);
    console.log(`   Target:   ${VENDOR_DIR}\n`);

    ensureDir(VENDOR_DIR);

    const existing = checkExisting();

    if (existing.haveFFmpeg && existing.haveFFprobe) {
        console.log('✅ FFmpeg and FFprobe already present in vendor directory');
        console.log('   Delete vendor/' + PLATFORM + '/ and re-run to force re-download\n');
        return;
    }

    console.log('📦 To set up bundled binaries, download the following:\n');

    if (PLATFORM === 'mac') {
        console.log('   FFmpeg + FFprobe (macOS):');
        console.log('   Option A - Homebrew (development only):');
        console.log('     brew install ffmpeg sox');
        console.log('');
        console.log('   Option B - Static builds (for bundling):');
        console.log('     1. Visit https://evermeet.cx/ffmpeg/');
        console.log('     2. Download ffmpeg and ffprobe ZIP files');
        console.log('     3. Extract and copy binaries to: vendor/mac/');
        console.log('     4. chmod +x vendor/mac/ffmpeg vendor/mac/ffprobe');
        console.log('');
        console.log('   Sox (macOS):');
        console.log('     Sox does not have a static macOS build.');
        console.log('     The app falls back to FFmpeg-only processing if sox is missing.');
        console.log('     For development: brew install sox\n');
    } else if (PLATFORM === 'win') {
        console.log('   FFmpeg + FFprobe (Windows):');
        console.log('     1. Visit https://www.gyan.dev/ffmpeg/builds/');
        console.log('     2. Download "ffmpeg-release-essentials.zip"');
        console.log('     3. Extract ffmpeg.exe and ffprobe.exe to: vendor\\win\\');
        console.log('');
        console.log('   Sox (Windows):');
        console.log('     1. Visit https://sourceforge.net/projects/sox/');
        console.log('     2. Download sox-14.4.2-win32.zip');
        console.log('     3. Extract sox.exe to: vendor\\win\\\n');
    } else {
        console.log('   FFmpeg + FFprobe (Linux):');
        console.log('     1. Visit https://johnvansickle.com/ffmpeg/');
        console.log(`     2. Download the ${ARCH === 'arm64' ? 'arm64' : 'amd64'} static build`);
        console.log('     3. Extract ffmpeg and ffprobe to: vendor/linux/');
        console.log('     4. chmod +x vendor/linux/ffmpeg vendor/linux/ffprobe');
        console.log('');
        console.log('   Sox (Linux):');
        console.log('     Install via package manager: sudo apt install sox\n');
    }

    // Try to auto-download ffmpeg-static from npm as a convenience
    console.log('🔄 Attempting automatic download via ffmpeg-static npm package...\n');

    try {
        // Install ffmpeg-static temporarily to grab the binary
        execSync('npm install --no-save ffmpeg-static', {
            cwd: path.join(__dirname, '..'),
            stdio: 'inherit',
            timeout: 120000
        });

        // ffmpeg-static puts the binary path in its module export
        const ffmpegStaticPath = require('ffmpeg-static');

        if (ffmpegStaticPath && fs.existsSync(ffmpegStaticPath)) {
            const ext = PLATFORM === 'win' ? '.exe' : '';
            const destPath = path.join(VENDOR_DIR, `ffmpeg${ext}`);
            fs.copyFileSync(ffmpegStaticPath, destPath);

            if (PLATFORM !== 'win') {
                fs.chmodSync(destPath, 0o755);
            }

            console.log(`\n✅ FFmpeg copied to ${destPath}`);

            // Try to find ffprobe from the same package
            const ffprobeStaticDir = path.dirname(ffmpegStaticPath);
            const ffprobeSrc = path.join(ffprobeStaticDir, `ffprobe${ext}`);
            if (fs.existsSync(ffprobeSrc)) {
                const ffprobeDest = path.join(VENDOR_DIR, `ffprobe${ext}`);
                fs.copyFileSync(ffprobeSrc, ffprobeDest);
                if (PLATFORM !== 'win') fs.chmodSync(ffprobeDest, 0o755);
                console.log(`✅ FFprobe copied to ${ffprobeDest}`);
            } else {
                console.log('⚠️  FFprobe not found in ffmpeg-static package');
                console.log('   You may need to download it manually (see instructions above)');
            }
        }

        // Clean up the temp install
        execSync('npm uninstall ffmpeg-static', {
            cwd: path.join(__dirname, '..'),
            stdio: 'ignore'
        });
    } catch (error) {
        console.log('⚠️  Auto-download failed:', error.message);
        console.log('   Please download binaries manually using the instructions above.\n');
    }

    console.log('\n📁 After placing binaries, verify with:');
    console.log('   node -e "require(\'./src/binary-resolver\').logStatus()"\n');
}

main().catch(console.error);
