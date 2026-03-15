/**
 * @fileoverview Resolve paths to bundled or system ffmpeg/sox binaries
 * @author Hexbloop Audio Labs
 * @description Finds bundled binaries in the app package, falling back to system PATH.
 *
 * In development: looks in ./vendor/<platform>/
 * In production (packaged): looks in the extraResources directory
 */

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// Platform key used for vendor directory structure
const PLATFORM_KEY = process.platform === 'win32' ? 'win'
    : process.platform === 'darwin' ? 'mac'
    : 'linux';

/**
 * Determine the base directory for bundled binaries.
 * - Packaged app: process.resourcesPath (set by Electron in production)
 * - Development: project root ./vendor/<platform>/
 */
function vendorDir() {
    // In a packaged Electron app, resourcesPath points to <app>/Contents/Resources (macOS)
    // or <app>/resources (Windows/Linux). extraResources are copied there.
    const isPackaged = !!(process.resourcesPath && !process.resourcesPath.includes('node_modules'));

    if (isPackaged) {
        return path.join(process.resourcesPath, 'vendor', PLATFORM_KEY);
    }

    // Development mode – look in project root
    return path.join(__dirname, '..', 'vendor', PLATFORM_KEY);
}

/**
 * Try to find a binary, checking bundled location first, then system PATH.
 * @param {string} name - Binary name (e.g. 'ffmpeg', 'ffprobe', 'sox')
 * @returns {{ path: string|null, bundled: boolean }}
 */
function resolveBinary(name) {
    const ext = process.platform === 'win32' ? '.exe' : '';
    const bundledPath = path.join(vendorDir(), `${name}${ext}`);

    // 1. Check bundled
    if (fs.existsSync(bundledPath)) {
        return { path: bundledPath, bundled: true };
    }

    // 2. Fall back to system PATH
    try {
        const cmd = process.platform === 'win32' ? `where ${name}` : `which ${name}`;
        const systemPath = execSync(cmd, { encoding: 'utf8', timeout: 3000 }).trim().split('\n')[0];
        if (systemPath) {
            return { path: systemPath, bundled: false };
        }
    } catch {
        // not found on PATH
    }

    return { path: null, bundled: false };
}

// Resolve all three binaries once at require-time
const ffmpeg  = resolveBinary('ffmpeg');
const ffprobe = resolveBinary('ffprobe');
const sox     = resolveBinary('sox');

function logStatus() {
    const fmt = (r, name) => r.path
        ? `✅ ${name}: ${r.bundled ? '(bundled) ' : ''}${r.path}`
        : `⚠️  ${name}: not found`;

    console.log(fmt(ffmpeg,  'ffmpeg'));
    console.log(fmt(ffprobe, 'ffprobe'));
    console.log(fmt(sox,     'sox'));
}

module.exports = {
    ffmpeg,
    ffprobe,
    sox,
    resolveBinary,
    vendorDir,
    logStatus,
    PLATFORM_KEY,
};
