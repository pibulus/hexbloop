/**
 * @fileoverview Preferences manager
 * @author Hexbloop Audio Labs
 * @description Handles settings persistence, validation, and retrieval
 */

const { app } = require('electron');
const fs = require('fs').promises;
const path = require('path');
const {
    DEFAULT_SETTINGS,
    validateSettings,
    coerceSettings,
    mergeWithDefaults,
    migrateLegacySettings,
    SETTINGS_VERSION
} = require('../shared/settings-schema');

class PreferencesManager {
    constructor() {
        this.userDataPath = app.getPath('userData');
        this.settingsPath = path.join(this.userDataPath, 'hexbloop-settings.json');
        this.backupPath = path.join(this.userDataPath, 'hexbloop-settings.backup.json');
        this.currentSettings = null;
        this.listeners = new Set();
        this.writeQueue = Promise.resolve();

        // Initialize settings on startup. Keep the promise so callers can
        // await a guaranteed-loaded state (avoids a boot race where a file
        // dropped in the first tick sees defaults instead of saved prefs).
        this.ready = this.initializeSettings();
    }

    /**
     * Resolves once settings have been loaded from disk (or defaults created).
     */
    async whenReady() {
        try {
            await this.ready;
        } catch {
            // initializeSettings already falls back to defaults on failure
        }
        return this.currentSettings;
    }
    
    /**
     * Initialize settings from disk or create defaults
     */
    async initializeSettings() {
        try {
            await this.loadSettings();
            console.log('Preferences loaded successfully');
        } catch (error) {
            console.log('Creating default preferences...', error.message);
            await this.resetToDefaults();
        }
    }
    
    /**
     * Load settings from disk
     */
    async loadSettings() {
        try {
            const settingsData = await fs.readFile(this.settingsPath, 'utf8');
            const userSettings = JSON.parse(settingsData);
            
            // Merge with defaults to ensure all fields exist
            const migrated = migrateLegacySettings(userSettings);
            this.currentSettings = mergeWithDefaults(migrated);

            // Coerce invalid values back to THEIR defaults (never wipe the
            // user's whole config over one bad key)
            const coerced = coerceSettings(this.currentSettings);
            if (coerced.length > 0 || JSON.stringify(userSettings) !== JSON.stringify(this.currentSettings)) {
                console.warn('⚠️ Reset invalid settings to defaults:', coerced.join(', '));
                await this.saveSettings();
            }
            
            return this.currentSettings;
        } catch (error) {
            // If settings file doesn't exist or is corrupted, try backup
            if (await this.fileExists(this.backupPath)) {
                console.log('🔄 Attempting to restore from backup...');
                const backupData = await fs.readFile(this.backupPath, 'utf8');
                const backupSettings = JSON.parse(backupData);
                this.currentSettings = mergeWithDefaults(migrateLegacySettings(backupSettings));
                coerceSettings(this.currentSettings);
                await this.saveSettings(this.currentSettings, false);
                return this.currentSettings;
            }
            throw error;
        }
    }
    
    /**
     * Save current settings to disk with backup
     */
    async saveSettings(next = this.currentSettings, backup = true) {
        const errors = validateSettings(next);
        if (errors.length) throw new Error(`Settings validation failed: ${errors.join(', ')}`);
        const temporary = `${this.settingsPath}.${process.pid}.${Math.random().toString(36).slice(2)}.tmp`;
        try {
            await fs.mkdir(this.userDataPath, { recursive: true });
            await fs.writeFile(temporary, JSON.stringify(next, null, 2), 'utf8');
            if (backup && await this.fileExists(this.settingsPath)) {
                await fs.copyFile(this.settingsPath, this.backupPath);
            }
            await fs.rename(temporary, this.settingsPath);
            this.currentSettings = next;
            for (const listener of this.listeners) {
                try { listener(next); } catch (error) { console.error('Settings listener failed:', error); }
            }
            console.log('💾 Mystical preferences saved successfully');
            return next;
        } catch (error) {
            await fs.rm(temporary, { force: true }).catch(() => {});
            console.error('❌ Failed to save mystical preferences:', error);
            throw error;
        }
    }

    onChange(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    
    /**
     * Get current settings
     */
    getSettings() {
        return this.currentSettings || DEFAULT_SETTINGS;
    }
    
    /**
     * Get specific setting by path (e.g., 'processing.compressing')
     */
    getSetting(settingPath) {
        const pathParts = settingPath.split('.');
        let value = this.getSettings();
        
        for (const part of pathParts) {
            if (value && typeof value === 'object' && part in value) {
                value = value[part];
            } else {
                return undefined;
            }
        }
        
        return value;
    }
    
    /**
     * Update specific setting by path
     */
    async updateSetting(settingPath, value) {
        const write = async () => {
            const parts = settingPath.split('.');
            const settings = structuredClone(this.getSettings());
            let current = settings;
            for (const part of parts.slice(0, -1)) {
                if (!current[part] || typeof current[part] !== 'object') throw new Error('Unknown setting');
                current = current[part];
            }
            if (!(parts.at(-1) in current)) throw new Error('Unknown setting');
            current[parts.at(-1)] = value;
            return this.saveSettings(settings);
        };
        this.writeQueue = this.writeQueue.then(write, write);
        return this.writeQueue;
    }
    
    /**
     * Update multiple settings at once
     */
    async updateSettings(newSettings) {
        const write = async () => {
            const settings = structuredClone(this.getSettings());
            const apply = (target, patch) => {
                for (const [key, value] of Object.entries(patch)) {
                    if (value && typeof value === 'object' && !Array.isArray(value) && target[key] && typeof target[key] === 'object') {
                        apply(target[key], value);
                    } else target[key] = value;
                }
            };
            apply(settings, newSettings);
            return this.saveSettings(settings);
        };
        this.writeQueue = this.writeQueue.then(write, write);
        return this.writeQueue;
    }
    
    /**
     * Reset to default settings
     */
    async resetToDefaults() {
        const write = () => this.saveSettings(structuredClone(DEFAULT_SETTINGS));
        this.writeQueue = this.writeQueue.then(write, write);
        await this.writeQueue;
        console.log('🔄 Mystical preferences reset to defaults');
        return this.currentSettings;
    }
    
    /**
     * Get processing configuration for audio pipeline
     * @returns {Object} Config object with stages, metadata, and options
     */
    getProcessingConfig() {
        const settings = this.getSettings();
        return {
            stages: {
                compressing: settings.processing.compressing,
                mastering: settings.processing.mastering,
                coverArt: settings.processing.coverArt,
                metadata: settings.processing.metadata,
                renaming: settings.processing.renaming
            },
            metadata: settings.metadata.mode === 'custom' ? {
                artist: settings.metadata.artist,
                album: settings.metadata.album,
                year: settings.metadata.year,
                genre: settings.metadata.genre
            } : null
        };
    }
    
    /**
     * Check if file exists
     */
    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }
    
    /**
     * Export settings for backup/sharing
     */
    async exportSettings() {
        return {
            version: `${SETTINGS_VERSION}.0`,
            timestamp: new Date().toISOString(),
            settings: this.getSettings()
        };
    }
    
    /**
     * Import settings from backup/sharing
     */
    async importSettings(importData) {
        if (!importData.settings) {
            throw new Error('Invalid import data: missing settings');
        }
        
        const mergedSettings = mergeWithDefaults(migrateLegacySettings(importData.settings));
        const errors = validateSettings(mergedSettings);
        
        if (errors.length > 0) {
            throw new Error(`Import validation failed: ${errors.join(', ')}`);
        }
        
        const write = () => this.saveSettings(mergedSettings);
        this.writeQueue = this.writeQueue.then(write, write);
        await this.writeQueue;
        console.log('📥 Mystical preferences imported successfully');
        return this.currentSettings;
    }
}

// Singleton instance
let preferencesManager = null;

/**
 * Get singleton preferences manager instance
 */
function getPreferencesManager() {
    if (!preferencesManager) {
        preferencesManager = new PreferencesManager();
    }
    return preferencesManager;
}

module.exports = {
    PreferencesManager,
    getPreferencesManager
};
