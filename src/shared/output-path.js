/**
 * @fileoverview Collision-safe output path resolution
 * @author Hexbloop Audio Labs
 * @description Ensures batch siblings and reruns never overwrite each other
 */

const path = require('path');
const fs = require('fs');

/**
 * Resolve a unique output path for a generated name.
 *
 * If `<dir>/<name>.<ext>` is already taken (by a prior file on disk or an
 * earlier file in this same batch), appends `_2`, `_3`, … until free.
 *
 * @param {string} directory - Output directory
 * @param {string} name - Generated base name (no extension)
 * @param {string} ext - Output extension without the dot (e.g. 'mp3')
 * @param {Set<string>} taken - Paths already claimed in this batch (mutated)
 * @param {(p: string) => boolean} [exists] - Disk existence check (injectable for tests)
 * @returns {string} A path not present in `taken` or on disk
 */
function resolveUniqueOutputPath(directory, name, ext, taken, exists = fs.existsSync) {
    let outputPath = path.join(directory, `${name}.${ext}`);
    let suffix = 2;
    while (taken.has(outputPath) || exists(outputPath)) {
        outputPath = path.join(directory, `${name}_${suffix}.${ext}`);
        suffix++;
    }
    taken.add(outputPath);
    return outputPath;
}

module.exports = { resolveUniqueOutputPath };
