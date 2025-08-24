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
    mergeWithDefaults 
} = require('../shared/settings-schema');

class PreferencesManager {
    constructor() {
        this.userDataPath = app.getPath('userData');
        this.settingsPath = path.join(this.userDataPath, 'hexbloop-settings.json');
        this.backupPath = path.join(this.userDataPath, 'hexbloop-settings.backup.json');
        this.currentSettings = null;
        
        // Initialize settings on startup
        this.initializeSettings();
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
            this.currentSettings = mergeWithDefaults(userSettings);
            
            // Validate settings
            const errors = validateSettings(this.currentSettings);
            if (errors.length > 0) {
                console.warn('⚠️ Settings validation errors:', errors);
                // Auto-fix by merging with defaults again
                this.currentSettings = mergeWithDefaults(DEFAULT_SETTINGS);
                await this.saveSettings();
            }
            
            return this.currentSettings;
        } catch (error) {
            // If settings file doesn't exist or is corrupted, try backup
            if (await this.fileExists(this.backupPath)) {
                console.log('🔄 Attempting to restore from backup...');
                const backupData = await fs.readFile(this.backupPath, 'utf8');
                const backupSettings = JSON.parse(backupData);
                this.currentSettings = mergeWithDefaults(backupSettings);
                await this.saveSettings();
                return this.currentSettings;
            }
            throw error;
        }
    }
    
    /**
     * Save current settings to disk with backup
     */
    async saveSettings() {
        try {
            // Create backup of current settings
            if (await this.fileExists(this.settingsPath)) {
                await fs.copyFile(this.settingsPath, this.backupPath);
            }
            
            // Validate before saving
            const errors = validateSettings(this.currentSettings);
            if (errors.length > 0) {
                throw new Error(`Settings validation failed: ${errors.join(', ')}`);
            }
            
            // Save to disk with pretty formatting
            const settingsJson = JSON.stringify(this.currentSettings, null, 2);
            await fs.writeFile(this.settingsPath, settingsJson, 'utf8');
            
            console.log('💾 Mystical preferences saved successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to save mystical preferences:', error);
            throw error;
        }
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
        const pathParts = settingPath.split('.');
        const settings = { ...this.getSettings() };
        
        // Navigate to the parent object
        let current = settings;
        for (let i = 0; i < pathParts.length - 1; i++) {
            if (!(pathParts[i] in current)) {
                current[pathParts[i]] = {};
            }
            current = current[pathParts[i]];
        }
        
        // Set the value
        current[pathParts[pathParts.length - 1]] = value;
        
        return this.updateSettings(settings);
    }
    
    /**
     * Update multiple settings at once
     */
    async updateSettings(newSettings) {
        try {
            // Merge new settings with current settings
            this.currentSettings = mergeWithDefaults({
                ...this.currentSettings,
                ...newSettings
            });
            
            await this.saveSettings();
            return this.currentSettings;
        } catch (error) {
            console.error('❌ Failed to update mystical preferences:', error);
            throw error;
        }
    }
    
    /**
     * Reset to default settings
     */
    async resetToDefaults() {
        this.currentSettings = { ...DEFAULT_SETTINGS };
        await this.saveSettings();
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
                naming: settings.processing.naming
            },
            metadata: settings.processing.naming === 'custom' ? {
                artist: settings.metadata.artist || 'Unknown Artist',
                album: settings.metadata.album || 'Unknown Album',
                year: settings.metadata.year || new Date().getFullYear(),
                genre: settings.metadata.genre || 'Mystical Audio'
            } : null,
            options: {
                lunarInfluence: settings.advanced.lunarInfluence,
                debugMode: settings.advanced.debugMode,
                preserveTempFiles: settings.advanced.preserveTempFiles,
                outputFolder: settings.ui.outputFolder
            }
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
            version: '1.0.0',
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
        
        const mergedSettings = mergeWithDefaults(importData.settings);
        const errors = validateSettings(mergedSettings);
        
        if (errors.length > 0) {
            throw new Error(`Import validation failed: ${errors.join(', ')}`);
        }
        
        this.currentSettings = mergedSettings;
        await this.saveSettings();
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