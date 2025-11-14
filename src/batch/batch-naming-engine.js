/**
 * @fileoverview Enhanced batch naming engine for Hexbloop
 * @author Hexbloop Audio Labs
 * @description Provides flexible naming schemes for batch processing
 */

const path = require('path');
const fs = require('fs');
const os = require('os');
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
                // YYYY-MM-DD_session_01, YYYY-MM-DD_session_02, etc.
                const dateStr = [
                    date.getFullYear(),
                    String(date.getMonth() + 1).padStart(2, '0'),
                    String(date.getDate()).padStart(2, '0')
                ].join('-');
                const dailyCounter = this.getAndIncrementDailyCounter(dateStr);
                return `${dateStr}_session_${String(dailyCounter).padStart(2, '0')}`;

            case 'lunar':
                // lunar_waxing_crescent_2024_12_26_01
                const phaseName = this.moonPhase ?
                    this.moonPhase.name.toLowerCase().replace(/ /g, '_') :
                    'unknown_phase';
                const lunarDateStr = `${date.getFullYear()}_${String(date.getMonth() + 1).padStart(2, '0')}_${String(date.getDate()).padStart(2, '0')}`;
                const lunarKey = `lunar_${phaseName}_${lunarDateStr}`;
                const lunarCounter = this.getAndIncrementDailyCounter(lunarKey);
                return `${lunarKey}_${String(lunarCounter).padStart(2, '0')}`;

            case 'counter':
                // session_042
                const globalCounter = this.getAndIncrementGlobalCounter();
                return `session_${String(globalCounter).padStart(3, '0')}`;

            default:
                return null;
        }
    }

    /**
     * Get storage path for session counters
     */
    getCounterStoragePath() {
        const app = require('electron').app;
        const userDataPath = app.getPath('userData');
        return path.join(userDataPath, 'session-counters.json');
    }

    /**
     * Load session counters from persistent storage
     */
    loadCounters() {
        try {
            const storagePath = this.getCounterStoragePath();
            if (fs.existsSync(storagePath)) {
                const data = fs.readFileSync(storagePath, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.log('⚠️  Could not load session counters, starting fresh:', error.message);
        }
        return { daily: {}, global: 0 };
    }

    /**
     * Save session counters to persistent storage
     */
    saveCounters(counters) {
        try {
            const storagePath = this.getCounterStoragePath();
            const dir = path.dirname(storagePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(storagePath, JSON.stringify(counters, null, 2), 'utf8');
        } catch (error) {
            console.log('⚠️  Could not save session counters:', error.message);
        }
    }

    /**
     * Get and increment counter for a specific date/key
     */
    getAndIncrementDailyCounter(key) {
        const counters = this.loadCounters();
        const currentCount = counters.daily[key] || 0;
        const newCount = currentCount + 1;
        counters.daily[key] = newCount;
        this.saveCounters(counters);
        return newCount;
    }

    /**
     * Get and increment global session counter
     */
    getAndIncrementGlobalCounter() {
        const counters = this.loadCounters();
        const newCount = (counters.global || 0) + 1;
        counters.global = newCount;
        this.saveCounters(counters);
        return newCount;
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