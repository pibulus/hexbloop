#!/usr/bin/env node

const express = require('express');
const cors = require('cors');
const path = require('path');
const Hex6EnhancedArtworkGenerator = require('./src/artwork-generator-hex6-enhanced');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Create generator instance
const generator = new Hex6EnhancedArtworkGenerator();

// Test generation endpoint
app.post('/generate-test', async (req, res) => {
    try {
        const params = req.body;
        
        console.log('🎨 Generating artwork with params:', {
            style: params.style,
            density: params.density,
            scale: params.scale,
            turbulence: params.turbulence
        });
        
        // Update generator parameters
        generator.parameters = {
            density: params.density,
            scale: params.scale,
            turbulence: params.turbulence,
            luminosity: params.luminosity,
            saturation: params.saturation,
            symmetry: params.symmetry
        };
        
        generator.inputs = {
            audioEnergy: params.audioEnergy,
            moonPhase: params.moonPhase,
            timeFractal: 0.5,
            systemEntropy: params.chaos,
            generationMemory: 0.5,
            userChaos: params.chaos
        };
        
        // Generate artwork
        const canvas = await generator.generate({
            style: params.style,
            audioFeatures: {
                energy: params.audioEnergy,
                tempo: 120,
                danceability: 0.5
            },
            moonPhase: params.moonPhase,
            seed: Date.now()
        });
        
        // Send as image
        const buffer = canvas.toBuffer('image/png');
        res.set('Content-Type', 'image/png');
        res.send(buffer);
        
    } catch (error) {
        console.error('Generation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get generator info
app.get('/generator-info', (req, res) => {
    res.json({
        styles: generator.styles,
        parameters: Object.keys(generator.parameters),
        inputs: Object.keys(generator.inputs),
        totalCombinations: 'Infinite with continuous parameters',
        description: '6 styles × 6 parameters × 6 inputs = 216 base combinations, infinite with parameter ranges'
    });
});

// Serve the test interface
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'artwork-test-interface.html'));
});

// Start server
const server = app.listen(PORT, () => {
    console.log('━'.repeat(60));
    console.log('🔮 Hexbloop Artwork Test Server');
    console.log('━'.repeat(60));
    console.log(`✨ Server running at http://localhost:${PORT}`);
    console.log(`📊 API endpoint: http://localhost:${PORT}/generate-test`);
    console.log(`🎨 Test interface: http://localhost:${PORT}`);
    console.log('━'.repeat(60));
    console.log('📝 Available styles:', generator.styles.join(', '));
    console.log('🎛️ Parameters: 6 (density, scale, turbulence, luminosity, saturation, symmetry)');
    console.log('🌙 Inputs: 6 (audioEnergy, moonPhase, timeFractal, systemEntropy, generationMemory, userChaos)');
    console.log('━'.repeat(60));
});

// Keep server alive
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down server...');
    server.close(() => {
        process.exit(0);
    });
});

// Handle errors
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});