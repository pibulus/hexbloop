/**
 * @fileoverview Settings schema for Hexbloop preferences
 * @author Hexbloop Audio Labs
 * @description Shared settings structure and validation for the mystical construct
 */

const os = require('os');
const path = require('path');

/**
 * Default settings for the mystical construct
 */
const SETTINGS_VERSION = 2;
const DEFAULT_SETTINGS = {
    settingsVersion: SETTINGS_VERSION,
    processing: {
        compressing: true,      // Sox effects (lunar-influenced distortion, filters)
        mastering: true,        // FFmpeg mastering (EQ, compression, limiting)
        coverArt: true,         // Procedural artwork generation
        metadata: true,
        renaming: true
    },
    metadata: {
        mode: 'generated',     // 'generated' | 'custom' — independent of renaming
        artist: '',
        album: '',             // Custom album name
        year: new Date().getFullYear(),  // Custom year
        genre: 'Mystical Audio'  // Custom genre
    },
    batch: {
        namingScheme: 'mystical',    // 'mystical' | 'sequential' | 'timestamp' | 'hybrid' | 'preserve'
        prefix: '',                   // Optional prefix for all files
        suffix: '',                   // Optional suffix (before extension)
        numberingStyle: 'none',       // 'none' | 'numeric' | 'alpha' | 'roman'
        numberingPadding: 3,          // Digits for numeric padding (001, 002, etc.)
        separator: '_',               // Character between naming elements
        preserveOriginal: false,      // Include original filename in output
        sessionFolders: false,        // Organize into session folders
        folderScheme: 'date',         // 'date' | 'lunar' | 'counter' | 'none'
        customWords: ''               // Newline/comma separated words for generated names
    },
    output: {
        format: 'source',             // 'source' = keep container; other choices are explicit conversion
        quality: 'high',              // 'low' | 'medium' | 'high' | 'maximum'
        mp3Bitrate: 192,              // kbps for MP3 (192k = high quality compressed)
        sampleRate: 0                 // 0 = preserve original, or 44100, 48000, etc.
    },
    artwork: {
        defaultStyle: 'auto',         // 'auto' | one of the generator's concrete styles
        energySensitivity: 50,        // 0-100: How much audio energy affects visuals
        tempoInfluence: 50,           // 0-100: How much tempo affects animation
        colorVariation: 50,           // 0-100: Color palette variation range
        useAudioFeatures: true,       // Use audio analysis for artwork generation
        useMoonPhase: true,           // Include lunar influence in artwork
        useFileNames: true,           // Use filename for style hints
        compressionLevel: 6,          // PNG compression 0-9 (6 = balanced)
        imageFormat: 'png',           // 'png' | 'jpg'
        resolution: 1000              // Artwork size in pixels
    },
    ui: {
        outputFolder: path.join(os.homedir(), 'Documents', 'HexbloopOutput'),
        ambientAudio: true        // Ambient soundscape in the main window
    }
};

/**
 * Settings validation schema
 */
const SETTINGS_SCHEMA = {
    settingsVersion: 'number',
    processing: {
        compressing: 'boolean',
        mastering: 'boolean',
        coverArt: 'boolean',
        metadata: 'boolean',
        renaming: 'boolean'
    },
    metadata: {
        mode: ['generated', 'custom'],
        artist: 'string',
        album: 'string',
        year: 'number',
        genre: 'string'
    },
    batch: {
        namingScheme: ['mystical', 'sequential', 'timestamp', 'hybrid', 'preserve'],
        prefix: 'string',
        suffix: 'string',
        numberingStyle: ['none', 'numeric', 'alpha', 'roman'],
        numberingPadding: 'number',
        separator: 'string',
        preserveOriginal: 'boolean',
        sessionFolders: 'boolean',
        folderScheme: ['date', 'lunar', 'counter', 'none'],
        customWords: 'string'
    },
    output: {
        // Only formats supported end-to-end (mastering + tagging + artwork);
        // matches the preferences UI dropdown and AudioProcessor.SUPPORTED_OUTPUT_FORMATS
        format: ['source', 'mp3', 'wav', 'flac'],
        quality: ['low', 'medium', 'high', 'maximum'],
        mp3Bitrate: 'number',
        sampleRate: 'number'
    },
    artwork: {
        defaultStyle: ['auto', 'neon-plasma', 'cosmic-flow', 'vapor-dream', 'cyber-matrix', 'sunset-liquid', 'electric-storm', 'crystal-prism', 'ocean-aurora'],
        energySensitivity: 'number',
        tempoInfluence: 'number',
        colorVariation: 'number',
        useAudioFeatures: 'boolean',
        useMoonPhase: 'boolean',
        useFileNames: 'boolean',
        compressionLevel: 'number',
        imageFormat: ['png', 'jpg'],
        resolution: 'number'
    },
    ui: {
        outputFolder: 'string',
        ambientAudio: 'boolean'
    }
};

/**
 * Validate settings object against schema
 */
function validateSettings(settings) {
    const errors = [];
    
    function validateObject(obj, schema, path = '') {
        for (const [key, expectedType] of Object.entries(schema)) {
            const currentPath = path ? `${path}.${key}` : key;
            const value = obj[key];
            
            if (value === undefined) {
                errors.push(`Missing required setting: ${currentPath}`);
                continue;
            }
            
            if (Array.isArray(expectedType)) {
                // Enum validation
                if (!expectedType.includes(value)) {
                    errors.push(`Invalid value for ${currentPath}: ${value}. Expected one of: ${expectedType.join(', ')}`);
                }
            } else if (typeof expectedType === 'object') {
                // Nested object validation
                if (typeof value !== 'object' || value === null) {
                    errors.push(`Invalid type for ${currentPath}: expected object, got ${typeof value}`);
                } else {
                    validateObject(value, expectedType, currentPath);
                }
            } else {
                // Type validation
                if (typeof value !== expectedType) {
                    errors.push(`Invalid type for ${currentPath}: expected ${expectedType}, got ${typeof value}`);
                }
            }
        }
    }
    
    validateObject(settings, SETTINGS_SCHEMA);
    return errors;
}

/**
 * Coerce settings against the schema: any individual invalid value falls
 * back to ITS default, everything valid is preserved. Returns the list of
 * coerced paths so callers can log/save.
 * (The old behavior — factory-resetting ALL settings because one key was
 *  bad — silently destroyed user preferences.)
 */
function coerceSettings(settings) {
    const coerced = [];

    function coerceObject(obj, schema, defaults, pathPrefix = '') {
        for (const [key, expectedType] of Object.entries(schema)) {
            const currentPath = pathPrefix ? `${pathPrefix}.${key}` : key;
            const value = obj[key];

            if (Array.isArray(expectedType)) {
                if (!expectedType.includes(value)) {
                    obj[key] = defaults[key];
                    coerced.push(currentPath);
                }
            } else if (typeof expectedType === 'object') {
                if (typeof value !== 'object' || value === null) {
                    obj[key] = JSON.parse(JSON.stringify(defaults[key]));
                    coerced.push(currentPath);
                } else {
                    coerceObject(value, expectedType, defaults[key], currentPath);
                }
            } else if (typeof value !== expectedType) {
                obj[key] = defaults[key];
                coerced.push(currentPath);
            }
        }
    }

    coerceObject(settings, SETTINGS_SCHEMA, DEFAULT_SETTINGS);
    return coerced;
}

/**
 * Merge user settings with defaults, ensuring all required fields exist
 */
function mergeWithDefaults(userSettings) {
    function deepMerge(target, source) {
        const result = { ...target };
        
        for (const [key, value] of Object.entries(source)) {
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                result[key] = deepMerge(result[key] || {}, value);
            } else {
                result[key] = value;
            }
        }
        
        return result;
    }
    
    return deepMerge(DEFAULT_SETTINGS, userSettings || {});
}

/** Migrate v1 before merge/coercion. Never override already-valid independent keys. */
function migrateLegacySettings(raw = {}) {
    const settings = JSON.parse(JSON.stringify(raw));
    const legacy = settings.processing?.naming;
    if (settings.settingsVersion !== SETTINGS_VERSION) {
        const mapping = {
            mystical: { renaming: true, metadata: true, mode: 'generated' },
            custom: { renaming: false, metadata: true, mode: 'custom' },
            original: { renaming: false, metadata: false, mode: 'generated' }
        }[legacy] || { renaming: true, metadata: true, mode: 'generated' };
        settings.processing ||= {};
        if (typeof settings.processing.renaming !== 'boolean') {
            settings.processing.renaming = typeof settings.processing.rename === 'boolean'
                ? settings.processing.rename : mapping.renaming;
        }
        if (typeof settings.processing.metadata !== 'boolean') settings.processing.metadata = mapping.metadata;
        settings.metadata ||= {};
        if (!['generated', 'custom'].includes(settings.metadata.mode)) settings.metadata.mode = mapping.mode;
        // Old MP3 was the implicit default. No way to distinguish a chosen MP3
        // from that default: prefer preservation to a surprise transcode.
        if (!settings.output || settings.output.format === 'mp3') {
            settings.output = { ...settings.output, format: 'source' };
        }
        settings.settingsVersion = SETTINGS_VERSION;
    }
    delete settings.processing?.naming;
    delete settings.processing?.rename;
    return settings;
}

/**
 * Get processing stages based on current settings
 */
function getEnabledProcessingStages(settings) {
    const stages = [];
    
    if (settings.processing.compressing) {
        stages.push('sox');
    }
    if (settings.processing.mastering) {
        stages.push('ffmpeg');
    }
    if (settings.processing.coverArt) {
        stages.push('artwork');
    }
    if (settings.processing.metadata) {
        stages.push('metadata');
    }
    if (settings.processing.renaming) stages.push('rename');
    
    return stages;
}

module.exports = {
    SETTINGS_VERSION,
    DEFAULT_SETTINGS,
    SETTINGS_SCHEMA,
    validateSettings,
    coerceSettings,
    mergeWithDefaults,
    migrateLegacySettings,
    getEnabledProcessingStages
};
