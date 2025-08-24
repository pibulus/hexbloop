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
const DEFAULT_SETTINGS = {
    processing: {
        compressing: true,      // Sox effects (lunar-influenced distortion, filters)
        mastering: true,        // FFmpeg mastering (EQ, compression, limiting)
        coverArt: true,         // Procedural artwork generation
        naming: 'mystical'      // 'mystical' | 'custom' | 'original'
    },
    metadata: {
        artist: '',            // Custom artist name (used when naming === 'custom')
        album: '',             // Custom album name
        year: new Date().getFullYear(),  // Custom year
        genre: 'Mystical Audio'  // Custom genre
    },
    ui: {
        ambientAudio: true,     // Background ambient loop
        outputFolder: path.join(os.homedir(), 'Documents', 'HexbloopOutput'),
        showProcessingPhrases: true  // Display hexagonal communication during processing
    },
    advanced: {
        lunarInfluence: true,   // Enable moon phase processing variations
        debugMode: false,       // Show detailed processing logs
        preserveTempFiles: false // Keep intermediate processing files
    }
};

/**
 * Settings validation schema
 */
const SETTINGS_SCHEMA = {
    processing: {
        compressing: 'boolean',
        mastering: 'boolean', 
        coverArt: 'boolean',
        naming: ['mystical', 'custom', 'original']
    },
    metadata: {
        artist: 'string',
        album: 'string',
        year: 'number',
        genre: 'string'
    },
    ui: {
        ambientAudio: 'boolean',
        outputFolder: 'string',
        showProcessingPhrases: 'boolean'
    },
    advanced: {
        lunarInfluence: 'boolean',
        debugMode: 'boolean',
        preserveTempFiles: 'boolean'
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
    if (settings.processing.naming !== 'original') {
        stages.push('metadata');
    }
    
    return stages;
}

module.exports = {
    DEFAULT_SETTINGS,
    SETTINGS_SCHEMA,
    validateSettings,
    mergeWithDefaults,
    getEnabledProcessingStages
};