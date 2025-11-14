/**
 * @fileoverview Enhanced batch naming engine for Hexbloop
 * @author Hexbloop Audio Labs
 * @description Provides flexible naming schemes for batch processing
 */

const path = require('path');
const NameGenerator = require('../name-generator');
const LunarProcessor = require('../lunar-processor');

class BatchNamingEngine {
    constructor(settings = {}) {
        this.settings = {
            namingScheme: settings.namingScheme || 'mystical',
            prefix: settings.prefix || '',
            suffix: settings.suffix || '',
            numberingStyle: settings.numberingStyle || 'none',
            numberingPadding: settings.numberingPadding || 3,
            separator: settings.separator || '_',
            preserveOriginal: settings.preserveOriginal || false,
            ...settings
        };
        
        this.fileCounter = 0;
        this.sessionTimestamp = new Date();
        this.moonPhase = null;
        
        // Initialize moon phase for consistent lunar naming
        try {
            this.moonPhase = LunarProcessor.getMoonPhase();
        } catch (e) {
            console.log('🌙 Could not get moon phase for naming');
        }
    }
    
    /**
     * Generate name for a file in the batch
     * @param {string} originalPath - Original file path
     * @param {number} index - Position in batch (0-based)
     * @param {number} total - Total files in batch
     * @returns {string} Generated filename (without path)
     */
    generateName(originalPath, index = 0, total = 1) {
        const originalName = path.parse(originalPath).name;
        let baseName = '';
        
        // Generate base name based on scheme
        switch (this.settings.namingScheme) {
            case 'mystical':
                baseName = this.generateMysticalName(index);
                break;
                
            case 'sequential':
                baseName = this.generateSequentialName(index);
                break;
                
            case 'timestamp':
                baseName = this.generateTimestampName(index);
                break;
                
            case 'hybrid':
                baseName = this.generateHybridName(index);
                break;
                
            case 'preserve':
                baseName = this.preserveOriginalName(originalName);
                break;
                
            default:
                baseName = NameGenerator.generateMystical({ moonPhase: this.moonPhase });
        }
        
        // Build final name with optional elements
        const parts = [];
        
        // Add prefix if specified
        if (this.settings.prefix) {
            parts.push(this.settings.prefix);
        }
        
        // Add base name
        parts.push(baseName);
        
        // Add numbering if enabled and not already in name
        if (this.settings.numberingStyle !== 'none' && 
            this.settings.namingScheme !== 'sequential') {
            const number = this.generateNumber(index);
            if (number) {
                parts.push(number);
            }
        }
        
        // Add suffix if specified
        if (this.settings.suffix) {
            parts.push(this.settings.suffix);
        }
        
        // Join with separator
        let finalName = parts.join(this.settings.separator);
        
        // Clean up any double separators or invalid characters
        finalName = this.sanitizeFilename(finalName);
        
        return finalName;
    }
    
    /**
     * Generate mystical name using lunar/temporal influences
     */
    generateMysticalName(index) {
        return NameGenerator.generateMystical({ 
            moonPhase: this.moonPhase,
            batchIndex: index 
        });
    }
    
    /**
     * Generate sequential name (track_001, track_002, etc.)
     */
    generateSequentialName(index) {
        const number = this.generateNumber(index);
        return `track${this.settings.separator}${number}`;
    }
    
    /**
     * Generate timestamp-based name
     */
    generateTimestampName(index) {
        const date = this.sessionTimestamp;
        const dateStr = [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, '0'),
            String(date.getDate()).padStart(2, '0')
        ].join('');
        
        const timeStr = [
            String(date.getHours()).padStart(2, '0'),
            String(date.getMinutes()).padStart(2, '0'),
            String(date.getSeconds()).padStart(2, '0')
        ].join('');
        
        return `hexbloop${this.settings.separator}${dateStr}${this.settings.separator}${timeStr}`;
    }
    
    /**
     * Generate hybrid name (mystical + numbering)
     */
    generateHybridName(index) {
        const mystical = NameGenerator.generateCleanName();
        const number = this.generateNumber(index);
        
        if (number && this.settings.numberingStyle !== 'none') {
            return `${mystical}${this.settings.separator}${number}`;
        }
        
        return mystical;
    }
    
    /**
     * Preserve original filename with optional hexbloop marker
     */
    preserveOriginalName(originalName) {
        if (this.settings.preserveOriginal) {
            return `${originalName}${this.settings.separator}hexblooped`;
        }
        return originalName;
    }
    
    /**
     * Generate number/letter based on style
     */
    generateNumber(index) {
        const position = index + 1; // 1-based for user readability
        
        switch (this.settings.numberingStyle) {
            case 'numeric':
                return String(position).padStart(this.settings.numberingPadding, '0');
                
            case 'alpha':
                // Convert to letters (A, B, C, ... Z, AA, AB, etc.)
                return this.toAlpha(position);
                
            case 'roman':
                // Convert to roman numerals
                return this.toRoman(position);
                
            default:
                return '';
        }
    }
    
    /**
     * Convert number to alphabetic representation
     */
    toAlpha(num) {
        let result = '';
        while (num > 0) {
            num--;
            result = String.fromCharCode(65 + (num % 26)) + result;
            num = Math.floor(num / 26);
        }
        return result;
    }
    
    /**
     * Convert number to roman numerals
     */
    toRoman(num) {
        const romans = [
            ['M', 1000], ['CM', 900], ['D', 500], ['CD', 400],
            ['C', 100], ['XC', 90], ['L', 50], ['XL', 40],
            ['X', 10], ['IX', 9], ['V', 5], ['IV', 4], ['I', 1]
        ];
        
        let result = '';
        for (const [letter, value] of romans) {
            const count = Math.floor(num / value);
            result += letter.repeat(count);
            num -= value * count;
        }
        
        return result.toLowerCase(); // Lowercase for aesthetics
    }
    
    /**
     * Generate session folder name based on scheme
     */
    generateSessionFolder() {
        if (!this.settings.sessionFolders) {
            return null;
        }
        
        const date = this.sessionTimestamp;
        
        switch (this.settings.folderScheme) {
            case 'date':
                // YYYY-MM-DD_session_01
                const dateStr = [
                    date.getFullYear(),
                    String(date.getMonth() + 1).padStart(2, '0'),
                    String(date.getDate()).padStart(2, '0')
                ].join('-');
                return `${dateStr}_session_01`; // TODO: Increment session counter
                
            case 'lunar':
                // lunar_waxing_crescent_2024_12_26
                const phaseName = this.moonPhase ? 
                    this.moonPhase.name.toLowerCase().replace(/ /g, '_') : 
                    'unknown_phase';
                return `lunar_${phaseName}_${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}`;
                
            case 'counter':
                // session_042
                return `session_${String(this.getSessionCounter()).padStart(3, '0')}`;
                
            default:
                return null;
        }
    }
    
    /**
     * Get or increment session counter (persisted)
     */
    getSessionCounter() {
        // TODO: Implement persistent counter
        return 1;
    }
    
    /**
     * Sanitize filename for filesystem safety
     */
    sanitizeFilename(name) {
        // Remove/replace unsafe characters
        name = name.replace(/[<>:"/\\|?*]/g, '');
        
        // Replace multiple separators with single
        const sepRegex = new RegExp(`${this.escapeRegex(this.settings.separator)}+`, 'g');
        name = name.replace(sepRegex, this.settings.separator);
        
        // Trim separators from start/end
        name = name.replace(new RegExp(`^${this.escapeRegex(this.settings.separator)}+|${this.escapeRegex(this.settings.separator)}+$`, 'g'), '');
        
        // Ensure name isn't empty
        if (!name) {
            name = `hexbloop_${Date.now()}`;
        }
        
        // Limit length to 200 chars (leave room for extension)
        if (name.length > 200) {
            name = name.substring(0, 200);
        }
        
        return name;
    }
    
    /**
     * Escape regex special characters
     */
    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    /**
     * Preview names for a batch of files
     * @param {string[]} filePaths - Array of file paths
     * @param {string} outputFormat - Desired output format (mp3, wav, flac, etc.)
     */
    previewBatch(filePaths, outputFormat = 'mp3') {
        return filePaths.map((filePath, index) => {
            const name = this.generateName(filePath, index, filePaths.length);
            return {
                original: path.basename(filePath),
                generated: `${name}.${outputFormat}`,
                folder: this.generateSessionFolder()
            };
        });
    }
}

module.exports = BatchNamingEngine;