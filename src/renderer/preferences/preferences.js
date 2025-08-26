/**
 * @fileoverview Preferences UI controller
 * @author Hexbloop Audio Labs
 * @description Handles preferences window interactions and settings management
 */

// Constants for UI feedback and styling
const UI_CONSTANTS = {
    VISUAL_FEEDBACK_DURATION: 1000,
    SETTING_GLOW_COLOR: 'rgba(159, 121, 234, 0.6)',
    SETTING_GLOW_TRANSITION: 'box-shadow 0.3s ease',
    DEBOUNCE_DELAY: 300
};

// Input validation constants
const INPUT_VALIDATION = {
    MAX_STRING_LENGTH: 100,
    MIN_YEAR: 1900,
    MAX_YEAR: 2100,
    ALLOWED_GENRE_CHARS: /^[a-zA-Z0-9\s\-&,.']+$/,
    DANGEROUS_CHARS: /[<>\"'`;&|\\]/g
};

// Debug mode from environment
const DEBUG = false; // Set to true for debug logging

/**
 * Simple debounce utility
 * @param {Function} func - Function to debounce
 * @param {number} wait - Delay in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

class PreferencesController {
    constructor() {
        this.currentSettings = null;
        this.settingElements = new Map();
        this.debouncedUpdates = new Map(); // Store debounced update functions
        this.activeTab = 'processing'; // Track active tab
        
        this.init();
    }
    
    async init() {
        if (DEBUG) console.log('Initializing preferences interface...');
        
        // Load current settings
        await this.loadSettings();
        
        // Set up UI elements
        this.setupElements();
        
        // Bind event handlers
        this.bindEvents();
        
        // Set up window focus/blur effects
        this.setupWindowEffects();
        
        // Initial UI state update
        this.updateUI();
        
        if (DEBUG) console.log('Preferences interface ready');
    }
    
    async loadSettings() {
        try {
            this.currentSettings = await window.preferencesAPI.getSettings();
            if (DEBUG) console.log('Settings loaded:', this.currentSettings);
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }
    
    setupElements() {
        // Collect all setting elements
        const settingElements = document.querySelectorAll('[data-setting]');
        settingElements.forEach(element => {
            const settingPath = element.dataset.setting;
            this.settingElements.set(settingPath, element);
        });
        
        // Get action buttons
        this.elements = {
            resetBtn: document.getElementById('reset-btn'),
            exportBtn: document.getElementById('export-btn'),
            importBtn: document.getElementById('import-btn'),
            closeBtn: document.getElementById('close-btn'),
            chooseFolderBtn: document.getElementById('choose-folder-btn'),
            customMetadataSection: document.getElementById('custom-metadata-section'),
            loadingOverlay: document.getElementById('loadingOverlay')
        };
    }
    
    bindEvents() {
        // Tab switching
        this.setupTabSwitching();
        
        // Setting change handlers
        this.settingElements.forEach((element, settingPath) => {
            if (element.type === 'checkbox') {
                element.addEventListener('change', (e) => {
                    this.updateSetting(settingPath, e.target.checked);
                });
            } else if (element.type === 'radio') {
                element.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        this.updateSetting(settingPath, e.target.value);
                    }
                });
            } else if (element.type === 'range') {
                // Handle range sliders with live updates
                element.addEventListener('input', (e) => {
                    const value = parseFloat(e.target.value);
                    
                    // Update display value
                    const displayId = element.id + '-value';
                    const displayElement = document.getElementById(displayId);
                    if (displayElement) {
                        displayElement.textContent = value + '%';
                    }
                    
                    // Update setting
                    this.updateSetting(settingPath, value);
                });
            } else if (element.type === 'text' || element.type === 'number') {
                // Create debounced update function for this specific input
                const debouncedUpdate = debounce((value) => {
                    this.updateSetting(settingPath, value);
                }, UI_CONSTANTS.DEBOUNCE_DELAY);
                
                // Store reference for cleanup
                this.debouncedUpdates.set(settingPath, debouncedUpdate);
                
                // Add both input and blur handlers
                element.addEventListener('input', (e) => {
                    const value = element.type === 'number' ? parseInt(e.target.value) : e.target.value;
                    
                    // Show immediate visual feedback
                    element.style.borderColor = 'rgba(159, 121, 234, 0.4)';
                    
                    // Debounce the actual update
                    debouncedUpdate(value);
                });
                
                // Update immediately on blur (when user leaves field)
                element.addEventListener('blur', (e) => {
                    const value = element.type === 'number' ? parseInt(e.target.value) : e.target.value;
                    
                    // Cancel any pending debounced update
                    if (this.debouncedUpdates.has(settingPath)) {
                        clearTimeout(this.debouncedUpdates.get(settingPath).timeout);
                    }
                    
                    // Update immediately
                    this.updateSetting(settingPath, value);
                    
                    // Reset border color
                    element.style.borderColor = '';
                });
            }
        });
        
        // Action button handlers
        this.elements.resetBtn.addEventListener('click', () => this.resetToDefaults());
        this.elements.exportBtn.addEventListener('click', () => this.exportSettings());
        this.elements.importBtn.addEventListener('click', () => this.importSettings());
        this.elements.closeBtn.addEventListener('click', () => this.closeWindow());
        this.elements.chooseFolderBtn.addEventListener('click', () => this.chooseOutputFolder());
        
        // Custom metadata visibility based on naming mode
        const namingRadios = document.querySelectorAll('input[name="naming"]');
        namingRadios.forEach(radio => {
            radio.addEventListener('change', () => this.updateCustomMetadataVisibility());
        });
    }
    
    setupWindowEffects() {
        // Window blur/focus effects for mystical ambiance
        window.preferencesAPI.onWindowBlur(() => {
            document.body.classList.add('window-blurred');
        });
        
        window.preferencesAPI.onWindowFocus(() => {
            document.body.classList.remove('window-blurred');
        });
    }
    
    updateUI() {
        if (!this.currentSettings) {
            console.warn('⚠️ No current settings available for UI update');
            return;
        }
        
        // Update all form elements with current settings
        this.settingElements.forEach((element, settingPath) => {
            const value = this.getSettingValue(settingPath);
            
            if (element.type === 'checkbox') {
                element.checked = Boolean(value);
            } else if (element.type === 'radio') {
                element.checked = element.value === value;
            } else if (element.type === 'range') {
                element.value = value || 50; // Default to 50 for sliders
                
                // Update display value
                const displayId = element.id + '-value';
                const displayElement = document.getElementById(displayId);
                if (displayElement) {
                    displayElement.textContent = (value || 50) + '%';
                }
            } else if (element.type === 'text' || element.type === 'number') {
                element.value = value || '';
            }
        });
        
        // Update custom metadata section visibility
        this.updateCustomMetadataVisibility();
        
        console.log('🎨 UI updated with current settings');
    }
    
    setupTabSwitching() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabPanels = document.querySelectorAll('.tab-panel');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;
                
                // Update active states
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanels.forEach(panel => panel.classList.remove('active'));
                
                // Activate selected tab
                button.classList.add('active');
                const targetPanel = document.getElementById(`${targetTab}-tab`);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                    targetPanel.classList.add('sliding-in');
                    
                    // Remove animation class after animation completes
                    setTimeout(() => {
                        targetPanel.classList.remove('sliding-in');
                    }, 300);
                }
                
                this.activeTab = targetTab;
                
                // Update custom metadata visibility if on naming tab
                if (targetTab === 'naming') {
                    this.updateCustomMetadataVisibility();
                }
            });
        });
    }
    
    getSettingValue(settingPath) {
        const pathParts = settingPath.split('.');
        let value = this.currentSettings;
        
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
     * Sanitize input based on the setting type
     * @param {string} settingPath - The setting being updated
     * @param {*} value - The raw value to sanitize
     * @returns {*} Sanitized value
     * @throws {Error} If validation fails
     */
    sanitizeInput(settingPath, value) {
        // Handle artwork sliders
        if (settingPath.startsWith('artwork.') && 
            (settingPath.includes('Sensitivity') || 
             settingPath.includes('Influence') || 
             settingPath.includes('Variation'))) {
            const num = parseFloat(value);
            if (isNaN(num)) return 50; // Default to 50
            return Math.min(100, Math.max(0, num)); // Clamp to 0-100
        }
        
        // Handle metadata fields
        if (settingPath.startsWith('metadata.')) {
            if (settingPath === 'metadata.year') {
                const year = parseInt(value);
                if (isNaN(year) || year < INPUT_VALIDATION.MIN_YEAR || year > INPUT_VALIDATION.MAX_YEAR) {
                    throw new Error(`Year must be between ${INPUT_VALIDATION.MIN_YEAR} and ${INPUT_VALIDATION.MAX_YEAR}`);
                }
                return year;
            }
            
            // Text fields (artist, album, genre)
            if (typeof value === 'string') {
                // Remove dangerous characters
                let sanitized = value.replace(INPUT_VALIDATION.DANGEROUS_CHARS, '');
                
                // Trim and limit length
                sanitized = sanitized.trim().substring(0, INPUT_VALIDATION.MAX_STRING_LENGTH);
                
                // Special validation for genre
                if (settingPath === 'metadata.genre' && sanitized && !INPUT_VALIDATION.ALLOWED_GENRE_CHARS.test(sanitized)) {
                    throw new Error('Genre contains invalid characters');
                }
                
                return sanitized;
            }
        }
        
        // File paths
        if (settingPath === 'ui.outputFolder') {
            // Basic path validation - more thorough validation happens in main process
            if (typeof value === 'string' && value.includes('..')) {
                throw new Error('Invalid path - directory traversal not allowed');
            }
            return value;
        }
        
        // Boolean values
        if (typeof value === 'boolean') {
            return value;
        }
        
        // String values (naming mode, etc)
        if (typeof value === 'string') {
            return value.replace(INPUT_VALIDATION.DANGEROUS_CHARS, '').trim();
        }
        
        return value;
    }

    async updateSetting(settingPath, value) {
        try {
            if (DEBUG) console.log(`Updating ${settingPath} to:`, value);
            
            // Sanitize input before sending
            const sanitizedValue = this.sanitizeInput(settingPath, value);
            
            const result = await window.preferencesAPI.updateSetting(settingPath, sanitizedValue);
            
            if (result.success) {
                // Update local settings cache
                this.setSettingValue(settingPath, sanitizedValue);
                
                // Add visual feedback
                this.showSettingUpdated(settingPath);
                
                if (DEBUG) console.log(`Setting ${settingPath} updated successfully`);
            } else {
                console.error(`Failed to update ${settingPath}:`, result.error);
                this.showError(`Failed to update setting: ${result.error}`);
            }
        } catch (error) {
            console.error(`Error updating ${settingPath}:`, error);
            this.showError(`Error updating setting: ${error.message}`);
        }
    }
    
    setSettingValue(settingPath, value) {
        const pathParts = settingPath.split('.');
        let current = this.currentSettings;
        
        // Navigate to parent object
        for (let i = 0; i < pathParts.length - 1; i++) {
            if (!(pathParts[i] in current)) {
                current[pathParts[i]] = {};
            }
            current = current[pathParts[i]];
        }
        
        // Set the value
        current[pathParts[pathParts.length - 1]] = value;
    }
    
    updateCustomMetadataVisibility() {
        const namingMode = this.getSettingValue('processing.naming');
        const isCustomMode = namingMode === 'custom';
        
        if (isCustomMode) {
            this.elements.customMetadataSection.classList.remove('disabled');
        } else {
            this.elements.customMetadataSection.classList.add('disabled');
        }
    }
    
    async resetToDefaults() {
        const confirmed = confirm('Reset all preferences to defaults?\n\nThis action cannot be undone.');
        
        if (confirmed) {
            try {
                this.showLoading('Resetting to defaults...');
                
                const result = await window.preferencesAPI.resetToDefaults();
                
                if (result.success) {
                    await this.loadSettings();
                    this.updateUI();
                    this.hideLoading();
                    this.showSuccess('Preferences reset to defaults');
                    if (DEBUG) console.log('Preferences reset to defaults');
                } else {
                    this.hideLoading();
                    this.showError(`Failed to reset preferences: ${result.error}`);
                }
            } catch (error) {
                this.hideLoading();
                console.error('Error resetting preferences:', error);
                this.showError(`Error resetting preferences: ${error.message}`);
            }
        }
    }
    
    async exportSettings() {
        try {
            this.showLoading('Exporting settings...');
            
            const result = await window.preferencesAPI.exportSettings();
            
            if (result.success) {
                // Create downloadable file
                const dataStr = JSON.stringify(result.data, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                
                // Create download link
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `hexbloop-preferences-${new Date().toISOString().split('T')[0]}.json`;
                
                // Trigger download
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                URL.revokeObjectURL(url);
                
                this.hideLoading();
                this.showSuccess('Settings exported successfully');
                if (DEBUG) console.log('Settings exported');
            } else {
                this.hideLoading();
                this.showError(`Failed to export settings: ${result.error}`);
            }
        } catch (error) {
            this.hideLoading();
            console.error('Error exporting settings:', error);
            this.showError(`Error exporting settings: ${error.message}`);
        }
    }
    
    async importSettings() {
        // Create file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        
        fileInput.onchange = async (event) => {
            const file = event.target.files[0];
            if (!file) return;
            
            // Validate file size (max 1MB)
            const MAX_FILE_SIZE = 1024 * 1024; // 1MB
            if (file.size > MAX_FILE_SIZE) {
                this.showError('Import file is too large (max 1MB)');
                return;
            }
            
            try {
                const text = await file.text();
                let importData;
                
                try {
                    importData = JSON.parse(text);
                } catch (parseError) {
                    throw new Error('Invalid JSON file');
                }
                
                // Validate import data structure
                if (!importData || typeof importData !== 'object') {
                    throw new Error('Invalid settings format');
                }
                
                // Sanitize all imported values
                const sanitizedData = this.sanitizeImportData(importData);
                
                this.showLoading('Importing settings...');
                
                const result = await window.preferencesAPI.importSettings(sanitizedData);
                
                if (result.success) {
                    await this.loadSettings();
                    this.updateUI();
                    this.hideLoading();
                    this.showSuccess('Settings imported successfully');
                    if (DEBUG) console.log('Settings imported');
                } else {
                    this.hideLoading();
                    this.showError(`Failed to import settings: ${result.error}`);
                }
            } catch (error) {
                this.hideLoading();
                console.error('Error importing settings:', error);
                this.showError(`Error importing settings: ${error.message}`);
            }
        };
        
        fileInput.click();
    }
    
    /**
     * Sanitize imported settings data
     * @param {Object} data - Raw imported data
     * @returns {Object} Sanitized data
     */
    sanitizeImportData(data) {
        const sanitized = {};
        
        // Define allowed settings structure
        const allowedPaths = [
            'processing.compressing',
            'processing.mastering', 
            'processing.coverArt',
            'processing.naming',
            'metadata.artist',
            'metadata.album',
            'metadata.year',
            'metadata.genre',
            'ui.outputFolder'
        ];
        
        // Process each allowed path
        for (const path of allowedPaths) {
            const pathParts = path.split('.');
            let sourceValue = data;
            let targetObj = sanitized;
            
            // Navigate to the value in source data
            for (let i = 0; i < pathParts.length; i++) {
                const part = pathParts[i];
                
                if (i === pathParts.length - 1) {
                    // Last part - get and sanitize value
                    if (sourceValue && part in sourceValue) {
                        try {
                            const sanitizedValue = this.sanitizeInput(path, sourceValue[part]);
                            targetObj[part] = sanitizedValue;
                        } catch (error) {
                            if (DEBUG) console.warn(`Skipping invalid value for ${path}:`, error.message);
                        }
                    }
                } else {
                    // Intermediate parts - create structure
                    sourceValue = sourceValue?.[part];
                    if (!targetObj[part]) {
                        targetObj[part] = {};
                    }
                    targetObj = targetObj[part];
                }
            }
        }
        
        return sanitized;
    }
    
    async chooseOutputFolder() {
        try {
            this.showLoading('Selecting folder...');
            
            const result = await window.preferencesAPI.chooseOutputFolder();
            
            this.hideLoading();
            
            if (result.success) {
                const outputFolderInput = this.settingElements.get('ui.outputFolder');
                outputFolderInput.value = result.path;
                
                await this.updateSetting('ui.outputFolder', result.path);
                if (DEBUG) console.log('Output folder updated:', result.path);
            } else if (result.error && result.error !== 'No folder selected') {
                // Only show error if it's not just a user cancellation
                this.showError(`Error selecting folder: ${result.error}`);
            }
        } catch (error) {
            this.hideLoading();
            console.error('Error choosing output folder:', error);
            this.showError(`Error choosing folder: ${error.message}`);
        }
    }
    
    closeWindow() {
        window.preferencesAPI.closeWindow();
    }
    
    // Visual feedback methods
    /**
     * Show visual feedback when a setting is updated
     * @param {string} settingPath - The setting that was updated
     */
    showSettingUpdated(settingPath) {
        const element = this.settingElements.get(settingPath);
        if (element) {
            // Add temporary glow effect
            element.style.boxShadow = `0 0 8px ${UI_CONSTANTS.SETTING_GLOW_COLOR}`;
            element.style.transition = UI_CONSTANTS.SETTING_GLOW_TRANSITION;
            
            setTimeout(() => {
                element.style.boxShadow = '';
            }, UI_CONSTANTS.VISUAL_FEEDBACK_DURATION);
        }
    }
    
    showSuccess(message) {
        if (DEBUG) console.log(`Success: ${message}`);
        // Could implement toast notifications here
    }
    
    showError(message) {
        console.error(`Error: ${message}`);
        // Could implement toast notifications here
        alert(message); // Simple fallback for now
    }
    
    /**
     * Show loading overlay with optional custom message
     * @param {string} message - Loading message to display
     */
    showLoading(message = 'Processing...') {
        if (this.elements.loadingOverlay) {
            const loadingText = this.elements.loadingOverlay.querySelector('.loading-text');
            if (loadingText) {
                loadingText.textContent = message;
            }
            this.elements.loadingOverlay.classList.add('active');
            
            // Disable all interactive elements
            this.setFormEnabled(false);
        }
    }
    
    /**
     * Hide loading overlay
     */
    hideLoading() {
        if (this.elements.loadingOverlay) {
            this.elements.loadingOverlay.classList.remove('active');
            
            // Re-enable all interactive elements
            this.setFormEnabled(true);
        }
    }
    
    /**
     * Enable/disable all form elements
     * @param {boolean} enabled - Whether to enable or disable
     */
    setFormEnabled(enabled) {
        // Disable/enable all inputs
        this.settingElements.forEach(element => {
            element.disabled = !enabled;
        });
        
        // Disable/enable all buttons
        Object.values(this.elements).forEach(element => {
            if (element && element.tagName === 'BUTTON') {
                element.disabled = !enabled;
            }
        });
    }
}

// Initialize preferences UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PreferencesController();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    // Clean up event listeners
    if (window.preferencesAPI) {
        window.preferencesAPI.removeAllListeners('window-blur');
        window.preferencesAPI.removeAllListeners('window-focus');
    }
});