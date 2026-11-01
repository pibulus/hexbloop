const fs = require('fs');
const path = require('path');

const SUPPORTED_EXTENSIONS = new Set([
    '.mp3', '.wav', '.m4a', '.aiff', '.aif', '.flac', '.ogg', '.aac',
    '.ape', '.alac', '.wv', '.opus', '.wma', '.mka', '.au', '.snd',
    '.voc', '.8svx', '.amb', '.caf'
]);
const MAX_FILES = 200;
const MAX_DEPTH = 8;
const MAX_ENTRIES = 4000;

/** Stable, bounded discovery. Never follows symlinks or hands a folder to DSP. */
async function discoverAudioPaths(inputs, options = {}) {
    const io = options.io || fs.promises;
    const maxFiles = options.maxFiles || MAX_FILES;
    const maxDepth = options.maxDepth ?? MAX_DEPTH;
    const maxEntries = options.maxEntries || MAX_ENTRIES;
    let outputDirectory = options.outputDirectory ? path.resolve(options.outputDirectory) : null;
    if (outputDirectory) {
        try { outputDirectory = await io.realpath(outputDirectory); }
        catch { /* A not-yet-created output directory cannot be traversed. */ }
    }
    const files = [], skipped = [], seen = new Set();
    let entries = 0, stopped = false;
    const skip = (filePath, reason) => skipped.push({ success: false, skipped: true,
        originalFile: filePath, fileName: path.basename(filePath), reason });

    async function visit(filePath, depth) {
        if (stopped) return;
        const resolved = path.resolve(filePath);
        let stats;
        try { stats = await io.lstat(resolved); }
        catch { skip(resolved, 'Unreadable entry'); return; }
        if (stats.isSymbolicLink()) { skip(resolved, 'Symlink not followed'); return; }
        let canonical;
        try { canonical = await io.realpath(resolved); }
        catch { skip(resolved, 'Unreadable entry'); return; }
        // Exclude directories, not explicitly selected files. An export can
        // still be deliberately reopened without recursively ingesting it.
        if (stats.isDirectory()) {
            if (path.basename(resolved).startsWith('.')) { skip(resolved, 'Hidden folder excluded'); return; }
            if (outputDirectory && (canonical === outputDirectory ||
                canonical.startsWith(outputDirectory + path.sep))) {
                skip(resolved, 'Output folder excluded'); return;
            }
        }
        if (seen.has(canonical)) { skip(resolved, 'Duplicate path'); return; }
        seen.add(canonical);
        if (stats.isFile()) {
            if (!SUPPORTED_EXTENSIONS.has(path.extname(resolved).toLowerCase())) {
                skip(resolved, 'Unsupported format'); return;
            }
            if (files.length >= maxFiles) {
                skip(resolved, `Batch limit (${maxFiles} files)`); stopped = true; return;
            }
            files.push(canonical);
            return;
        }
        if (!stats.isDirectory()) { skip(resolved, 'Not a regular file'); return; }
        if (depth >= maxDepth) { skip(resolved, `Folder depth limit (${maxDepth})`); return; }
        let children = [];
        try {
            const directory = await io.opendir(resolved);
            for await (const entry of directory) {
                entries++;
                if (entries > maxEntries) { stopped = true; break; }
                children.push(entry.name);
            }
        } catch { skip(resolved, 'Unreadable folder'); return; }
        if (stopped) { skip(resolved, `Discovery entry limit (${maxEntries})`); return; }
        if (!children.length) { skip(resolved, 'Empty folder'); return; }
        children.sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }) || a.localeCompare(b));
        for (const child of children) await visit(path.join(resolved, child), depth + 1);
    }

    if (!Array.isArray(inputs)) return { files, skipped: [{ success: false, skipped: true,
        fileName: 'Drop', reason: 'No files or folders supplied' }] };
    for (const input of inputs) {
        if (stopped) break;
        if (typeof input !== 'string' || !input.trim()) { skip('Unknown', 'Invalid path'); continue; }
        await visit(input, 0);
    }
    return { files, skipped };
}

module.exports = { discoverAudioPaths, SUPPORTED_EXTENSIONS, MAX_FILES, MAX_DEPTH };
