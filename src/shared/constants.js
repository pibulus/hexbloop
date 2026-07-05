/**
 * @fileoverview Centralized constants for Hexbloop
 * @author Hexbloop Audio Labs
 * @description Shared constants used across processes
 */

// Window Configuration (consumed by preferences-window.js)
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

module.exports = {
    WINDOW_CONFIG
};
