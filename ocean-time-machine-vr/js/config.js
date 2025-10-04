/* ==========================================
   Ocean Time Machine VR - Configuration
   ========================================== */

const CONFIG = {
    // Scene Definitions
    scenes: {
        '2000': {
            id: 'earth-2000',
            title: 'Year 2000 - Baseline Conditions',
            description: 'Healthy oceans with vibrant ecosystems. This is our baseline before significant climate impact.',
            earthColor: '#2E7D9A', // Blue-green healthy ocean
            audioId: 'audio-ambient',
            narrationId: 'audio-narration-2000',
            subtitles: [
                { time: 0, text: 'Welcome to the year 2000. Our oceans are healthy and vibrant.' },
                { time: 5000, text: 'NASA satellites monitor ocean color, temperature, and sea ice from space.' },
                { time: 10000, text: 'Click the glowing hotspots to explore specific regions.' }
            ]
        },
        '2010': {
            id: 'earth-2010',
            title: 'Year 2010 - Early Warning Signs',
            description: 'First decade of the 21st century shows subtle but measurable ocean changes.',
            earthColor: '#D4894A', // Orange-ish warming
            audioId: 'audio-ambient',
            narrationId: 'audio-narration-2010',
            subtitles: [
                { time: 0, text: 'By 2010, NASA data reveals early signs of ocean warming.' },
                { time: 5000, text: 'Ocean temperatures increased by 0.35°C globally.' },
                { time: 10000, text: 'Coral reefs begin experiencing stress from warming waters.' }
            ]
        },
        '2020': {
            id: 'earth-2020',
            title: 'Year 2020 - Accelerating Change',
            description: 'Two decades of warming show dramatic impacts on marine ecosystems worldwide.',
            earthColor: '#C94A3D', // Red zones appearing
            audioId: 'audio-ambient',
            narrationId: 'audio-narration-2020',
            subtitles: [
                { time: 0, text: 'Welcome to 2020. The pace of change has accelerated.' },
                { time: 5000, text: 'Ocean temperatures rose 0.7°C. Arctic ice declined 13% per decade.' },
                { time: 10000, text: 'Mass coral bleaching events affect reefs globally.' },
                { time: 15000, text: 'But there is still time to act.' }
            ]
        },
        '2050': {
            id: 'earth-2050',
            title: 'Year 2050 - Projected Future',
            description: 'This is what we could face if current trends continue. But change is possible.',
            earthColor: '#8B1A1A', // Deep red critical
            audioId: 'audio-ambient',
            narrationId: 'audio-narration-2050',
            subtitles: [
                { time: 0, text: 'This is a projected future for 2050 based on current trends.' },
                { time: 5000, text: 'Sea levels could rise 50cm, displacing millions.' },
                { time: 10000, text: '85% of coral reefs may be lost forever.' },
                { time: 15000, text: 'But this future is not inevitable. We can still change course.' },
                { time: 20000, text: 'Every action matters. The time to act is now.' }
            ]
        }
    },

    // Earth View Settings
    earth: {
        rotationSpeed: 120000, // 120 seconds for full rotation
        radius: 3,
        atmosphereRadius: 3.15,
        cameraDistance: 8
    },

    // Auto-play Settings
    autoPlay: {
        enabled: true,
        interval: 5000, // 5 seconds between transitions
        loop: true
    },

    // Hotspot Definitions
    hotspots: {
        arctic: {
            id: 'hotspot-arctic',
            position: { x: 0, y: 2.8, z: 0.8 },
            color: '#FF0000',
            label: 'Arctic Ice Loss',
            info: 'Arctic sea ice has declined by 13% per decade since 2000. Summer ice may disappear entirely by 2050.',
            years: ['2010', '2020', '2050']
        },
        pacific: {
            id: 'hotspot-pacific',
            position: { x: -2.5, y: 0, z: 1.5 },
            color: '#FF6B00',
            label: 'Pacific Warming',
            info: 'Pacific Ocean temperatures increased 0.7°C since 2000, affecting marine life and weather patterns.',
            years: ['2010', '2020', '2050']
        },
        coral: {
            id: 'hotspot-coral',
            position: { x: 2.2, y: -0.8, z: 1.8 },
            color: '#FFD93D',
            label: 'Coral Bleaching',
            info: 'Great Barrier Reef lost 50% of coral since 2000. Rising temperatures cause mass bleaching events.',
            years: ['2010', '2020', '2050']
        },
        coastal: {
            id: 'hotspot-coastal',
            position: { x: 1.8, y: -1.5, z: 1.5 },
            color: '#9C27B0',
            label: 'Sea Level Rise',
            info: 'Global sea level rose 9cm since 2000, affecting coastal communities worldwide.',
            years: ['2020', '2050']
        }
    },

    // Transition Settings
    transition: {
        fadeDuration: 1000, // milliseconds
        earthSwitchDuration: 800
    },

    // Audio Settings
    audio: {
        masterVolume: 0.7,
        spatialAudio: false, // Not needed in space view
        fadeInTime: 1000,
        fadeOutTime: 1000,
        ambientLoop: true
    },

    // Accessibility Settings
    accessibility: {
        subtitlesEnabled: true,
        subtitleDuration: 5000,
        highContrast: false,
        colorBlindMode: false
    },

    // Performance Settings
    performance: {
        antialiasing: true,
        shadowsEnabled: true,
        starCount: 200,
        maxHotspots: 4
    },

    // Year sequence for navigation
    yearOrder: ['2000', '2010', '2020', '2050'],

    // Data panel content
    dataPanels: {
        '2000': {
            left: 'YEAR 2000\n\nOcean Health: GOOD\nGlobal Temp: Baseline\nSea Level: Baseline\n\nNASA MODIS\nOcean Color Data',
            right: 'OBSERVATIONS\n\n• Healthy coral reefs\n• Stable ice coverage\n• Rich biodiversity\n• Baseline conditions'
        },
        '2010': {
            left: 'YEAR 2010\n\nOcean Health: FAIR\nTemp: +0.35°C\nSea Level: +3cm\n\nNASA MODIS\nOcean Color Data',
            right: 'OBSERVATIONS\n\n• Early coral bleaching\n• Ice beginning to melt\n• Ocean warming starts\n• pH levels dropping'
        },
        '2020': {
            left: 'YEAR 2020\n\nOcean Health: POOR\nTemp: +0.7°C\nSea Level: +9cm\n\nNASA MODIS\nOcean Color Data',
            right: 'OBSERVATIONS\n\n• Mass coral bleaching\n• Arctic ice decline 13%\n• Marine heatwaves\n• Species migration'
        },
        '2050': {
            left: 'YEAR 2050\n\nOcean Health: CRITICAL\nTemp: +1.5°C (Projected)\nSea Level: +50cm\n\nNASA PROJECTIONS',
            right: 'PROJECTIONS\n\n• Coral reefs 85% lost\n• Arctic ice-free summers\n• Coastal flooding\n• Hope through action'
        }
    }
};

// Freeze config to prevent accidental modifications
Object.freeze(CONFIG);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}