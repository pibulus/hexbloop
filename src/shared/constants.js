/**
 * @fileoverview Centralized constants for Hexbloop
 * @author Hexbloop Audio Labs
 * @description All application constants in one place
 */

// Window Configuration
const WINDOW_CONFIG = {
    MAIN: {
        WIDTH: 1200,
        HEIGHT: 800,
        MIN_WIDTH: 800,
        MIN_HEIGHT: 600,
        BACKGROUND_COLOR: '#0D0D1A'
    },
    PREFERENCES: {
        WIDTH: 600,
        HEIGHT: 500,
        MIN_WIDTH: 600,
        MIN_HEIGHT: 500,
        MAX_WIDTH: 600,
        MAX_HEIGHT: 500,
        BACKGROUND_COLOR: '#F0F0F0'
    }
};

// UI Timing Constants
const UI_TIMING = {
    VISUAL_FEEDBACK_DURATION: 1000,
    DEBOUNCE_DELAY: 300,
    TRANSITION_DURATION: 200
};

// Colors
const COLORS = {
    PURPLE_ACCENT: 'rgb(159, 121, 234)',
    PURPLE_ACCENT_ALPHA: 'rgba(159, 121, 234, 0.6)',
    DARK_BACKGROUND: '#0D0D1A',
    LIGHT_BACKGROUND: '#F0F0F0',
    WHITE: '#FFFFFF',
    DARK_TEXT: '#333333',
    LIGHT_TEXT: '#666666',
    BORDER_LIGHT: '#E0E0E0',
    BORDER_DARK: '#D0D0D0',
    DISABLED_BACKGROUND: '#F5F5F5',
    PLACEHOLDER_TEXT: '#999999'
};

// Input Validation
const INPUT_VALIDATION = {
    MAX_STRING_LENGTH: 100,
    MIN_YEAR: 1900,
    MAX_YEAR: 2100,
    MAX_FILE_SIZE: 1024 * 1024, // 1MB
    ALLOWED_GENRE_CHARS: /^[a-zA-Z0-9\s\-&,.']+$/,
    DANGEROUS_CHARS: /[<>\"'`;&|\\]/g
};

// File Paths
const FILE_NAMES = {
    SETTINGS_FILE: 'hexbloop-settings.json',
    SETTINGS_BACKUP: 'hexbloop-settings.backup.json'
};

// Debug Mode
const DEBUG = process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true';

module.exports = {
    WINDOW_CONFIG,
    UI_TIMING,
    COLORS,
    INPUT_VALIDATION,
    FILE_NAMES,
    DEBUG
};