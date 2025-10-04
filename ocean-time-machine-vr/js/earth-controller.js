/* ==========================================
   Ocean Time Machine VR - Earth Controller
   Handles Earth rotation, year transitions, hotspots
   ========================================== */

class EarthController {
    constructor() {
        this.currentYear = '2000';
        this.autoPlay = true;
        this.autoPlayTimer = null;
        this.autoPlayInterval = 5000; // 5 seconds
        
        this.earthSpheres = {};
        this.yearButtons = {};
        this.hotspots = [];
        this.infoPopup = null;
        
        this.init();
    }

    /**
     * Initialize Earth controller
     */
    init() {
        const scene = document.querySelector('a-scene');
        
        if (scene.hasLoaded) {
            this.setup();
        } else {
            scene.addEventListener('loaded', () => this.setup());
        }
    }

    /**
     * Setup Earth elements and interactions
     */
    setup() {
        console.log('[EarthController] Setting up Earth view');

        // Get Earth spheres
        this.earthSpheres = {
            '2000': document.getElementById('earth-2000'),
            '2010': document.getElementById('earth-2010'),
            '2020': document.getElementById('earth-2020'),
            '2050': document.getElementById('earth-2050')
        };

        // Get year buttons
        this.yearButtons = {
            '2000': document.getElementById('btn-2000'),
            '2010': document.getElementById('btn-2010'),
            '2020': document.getElementById('btn-2020'),
            '2050': document.getElementById('btn-2050')
        };

        // Get hotspots
        this.hotspots = Array.from(document.querySelectorAll('.hotspot'));

        // Get info popup
        this.infoPopup = document.getElementById('info-popup');

        // Setup star field
        this.createStarField();

        // Setup event listeners
        this.setupEventListeners();

        // Start auto-play
        if (this.autoPlay) {
            this.startAutoPlay();
        }

        console.log('[EarthController] Ready');
    }

    /**
     * Create star field background
     */
    createStarField() {
        const starField = document.getElementById('star-field');
        if (!starField) return;

        // Create 200 random stars
        for (let i = 0; i < 200; i++) {
            const star = document.createElement('a-sphere');
            
            // Random position on sphere
            const radius = 95;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);
            
            star.setAttribute('position', `${x} ${y} ${z}`);
            star.setAttribute('radius', Math.random() * 0.05 + 0.02);
            star.setAttribute('color', '#FFFFFF');
            star.setAttribute('material', 'shader: flat');
            
            // Random twinkling
            if (Math.random() > 0.7) {
                star.setAttribute('animation', {
                    property: 'material.opacity',
                    from: 1,
                    to: 0.3,
                    dur: 1000 + Math.random() * 2000,
                    loop: true,
                    dir: 'alternate',
                    easing: 'easeInOutSine'
                });
            }
            
            starField.appendChild(star);
        }

        console.log('[EarthController] Star field created');
    }

    /**
     * Setup event listeners for interactions
     */
    setupEventListeners() {
        // Year button clicks - Use mousedown for better VR compatibility
        Object.entries(this.yearButtons).forEach(([year, button]) => {
            if (!button) return;
            
            // Regular click
            button.addEventListener('click', () => {
                console.log('[EarthController] Year button clicked:', year);
                this.switchYear(year);
                this.resetAutoPlay();
            });
            
            // Mouse enter for cursor (desktop)
            button.addEventListener('mouseenter', () => {
                this.switchYear(year);
                this.resetAutoPlay();
            });
            
            // Fusing complete (VR gaze)
            button.addEventListener('fusing', () => {
                console.log('[EarthController] Fusing on button:', year);
            });
        });

        // Hotspot clicks
        this.hotspots.forEach(hotspot => {
            if (!hotspot) return;
            
            hotspot.addEventListener('click', () => {
                const info = hotspot.getAttribute('data-info');
                console.log('[EarthController] Hotspot clicked:', info);
                this.showPopup(info);
                
                // Play click sound
                if (window.audioController) {
                    const clickSound = document.getElementById('audio-click');
                    if (clickSound) {
                        clickSound.currentTime = 0;
                        clickSound.play().catch(() => {});
                    }
                }
            });
            
            // Also on mouseenter for easier interaction
            hotspot.addEventListener('mouseenter', () => {
                const info = hotspot.getAttribute('data-info');
                this.showPopup(info);
            });
        });

        // Close popup button
        const closeBtn = document.getElementById('close-popup');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                console.log('[EarthController] Close popup clicked');
                this.hidePopup();
            });
            
            closeBtn.addEventListener('mouseenter', () => {
                this.hidePopup();
            });
        }

        // Auto-play toggle
        const autoPlayBtn = document.getElementById('btn-autoplay');
        if (autoPlayBtn) {
            autoPlayBtn.addEventListener('click', () => {
                console.log('[EarthController] Auto-play button clicked');
                this.toggleAutoPlay();
            });
            
            autoPlayBtn.addEventListener('mouseenter', () => {
                this.toggleAutoPlay();
            });
        }

        // Add manual Earth rotation with mouse drag
        this.setupEarthRotation();

        console.log('[EarthController] Event listeners ready');
    }

    /**
     * Setup manual Earth rotation with mouse/touch
     */
    setupEarthRotation() {
        const earthContainer = document.getElementById('earth-container');
        if (!earthContainer) return;

        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        let currentRotation = { x: 0, y: 0 };

        // Mouse events
        document.addEventListener('mousedown', (e) => {
            // Only if clicking on empty space (not UI)
            if (e.target.tagName === 'CANVAS' || e.target.tagName === 'A-SCENE') {
                isDragging = true;
                previousMousePosition = { x: e.clientX, y: e.clientY };
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;

            currentRotation.y += deltaX * 0.5;
            currentRotation.x -= deltaY * 0.5;

            // Clamp X rotation to prevent flipping
            currentRotation.x = Math.max(-90, Math.min(90, currentRotation.x));

            earthContainer.setAttribute('rotation', 
                `${currentRotation.x} ${currentRotation.y} 0`
            );

            previousMousePosition = { x: e.clientX, y: e.clientY };
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Touch events for mobile
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                isDragging = true;
                previousMousePosition = { 
                    x: e.touches[0].clientX, 
                    y: e.touches[0].clientY 
                };
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (!isDragging || e.touches.length !== 1) return;

            const deltaX = e.touches[0].clientX - previousMousePosition.x;
            const deltaY = e.touches[0].clientY - previousMousePosition.y;

            currentRotation.y += deltaX * 0.5;
            currentRotation.x -= deltaY * 0.5;

            currentRotation.x = Math.max(-90, Math.min(90, currentRotation.x));

            earthContainer.setAttribute('rotation', 
                `${currentRotation.x} ${currentRotation.y} 0`
            );

            previousMousePosition = { 
                x: e.touches[0].clientX, 
                y: e.touches[0].clientY 
            };

            e.preventDefault();
        });

        document.addEventListener('touchend', () => {
            isDragging = false;
        });

        console.log('[EarthController] Manual rotation enabled');
    }

    /**
     * Switch to a different year
     * @param {string} year - Target year (2000, 2010, 2020, 2050)
     */
    switchYear(year) {
        if (this.currentYear === year) return;

        console.log(`[EarthController] Switching to year ${year}`);

        // Hide current Earth
        if (this.earthSpheres[this.currentYear]) {
            this.earthSpheres[this.currentYear].setAttribute('visible', false);
        }

        // Show new Earth
        if (this.earthSpheres[year]) {
            this.earthSpheres[year].setAttribute('visible', true);
        }

        // Update button states
        Object.entries(this.yearButtons).forEach(([y, button]) => {
            if (y === year) {
                button.setAttribute('color', '#00D9FF');
                button.classList.add('active-year');
            } else {
                button.setAttribute('color', '#003366');
                button.classList.remove('active-year');
            }
        });

        // Update data panels
        this.updateDataPanels(year);

        // Update UI
        if (window.uiManager) {
            window.uiManager.updateSceneInfo(year);
        }

        // Play narration
        this.playNarration(year);

        this.currentYear = year;
    }

    /**
     * Update data panels with year-specific info
     * @param {string} year - Current year
     */
    updateDataPanels(year) {
        const dataTextLeft = document.getElementById('data-text-left');
        const dataTextRight = document.getElementById('data-text-right');

        const dataContent = {
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
        };

        if (dataTextLeft && dataContent[year]) {
            dataTextLeft.setAttribute('value', dataContent[year].left);
        }

        if (dataTextRight && dataContent[year]) {
            dataTextRight.setAttribute('value', dataContent[year].right);
        }
    }

    /**
     * Play narration audio for year
     * @param {string} year - Year to narrate
     */
    playNarration(year) {
        const narrationId = `audio-narration-${year}`;
        const narration = document.getElementById(narrationId);
        
        if (narration) {
            narration.currentTime = 0;
            narration.play().catch(e => {
                console.log('[EarthController] Narration blocked:', e.message);
            });
        }
    }

    /**
     * Show info popup
     * @param {string} info - Information text
     */
    showPopup(info) {
        if (!this.infoPopup) return;

        const popupText = document.getElementById('info-popup-text');
        if (popupText) {
            popupText.setAttribute('value', info);
        }

        this.infoPopup.setAttribute('visible', true);
        console.log('[EarthController] Popup shown:', info);
    }

    /**
     * Hide info popup
     */
    hidePopup() {
        if (this.infoPopup) {
            this.infoPopup.setAttribute('visible', false);
        }
    }

    /**
     * Start auto-play mode
     */
    startAutoPlay() {
        this.autoPlay = true;
        
        this.autoPlayTimer = setInterval(() => {
            this.nextYear();
        }, this.autoPlayInterval);

        // Update button
        const autoPlayText = document.getElementById('autoplay-text');
        if (autoPlayText) {
            autoPlayText.setAttribute('value', 'AUTO-PLAY ON');
        }

        const autoPlayBtn = document.getElementById('btn-autoplay');
        if (autoPlayBtn) {
            autoPlayBtn.setAttribute('color', '#4CAF50');
        }

        console.log('[EarthController] Auto-play started');
    }

    /**
     * Stop auto-play mode
     */
    stopAutoPlay() {
        this.autoPlay = false;
        
        if (this.autoPlayTimer) {
            clearInterval(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }

        // Update button
        const autoPlayText = document.getElementById('autoplay-text');
        if (autoPlayText) {
            autoPlayText.setAttribute('value', 'AUTO-PLAY OFF');
        }

        const autoPlayBtn = document.getElementById('btn-autoplay');
        if (autoPlayBtn) {
            autoPlayBtn.setAttribute('color', '#666666');
        }

        console.log('[EarthController] Auto-play stopped');
    }

    /**
     * Toggle auto-play
     */
    toggleAutoPlay() {
        if (this.autoPlay) {
            this.stopAutoPlay();
        } else {
            this.startAutoPlay();
        }
    }

    /**
     * Reset auto-play timer
     */
    resetAutoPlay() {
        if (this.autoPlay) {
            if (this.autoPlayTimer) {
                clearInterval(this.autoPlayTimer);
            }
            this.startAutoPlay();
        }
    }

    /**
     * Go to next year in sequence
     */
    nextYear() {
        const years = ['2000', '2010', '2020', '2050'];
        const currentIndex = years.indexOf(this.currentYear);
        const nextIndex = (currentIndex + 1) % years.length;
        
        this.switchYear(years[nextIndex]);
    }

    /**
     * Go to previous year in sequence
     */
    previousYear() {
        const years = ['2000', '2010', '2020', '2050'];
        const currentIndex = years.indexOf(this.currentYear);
        const prevIndex = (currentIndex - 1 + years.length) % years.length;
        
        this.switchYear(years[prevIndex]);
    }

    /**
     * Update hotspot visibility based on year
     */
    updateHotspots() {
        // You can show/hide different hotspots based on year
        // For now, all are visible
    }

    /**
     * Cleanup
     */
    cleanup() {
        this.stopAutoPlay();
        this.hotspots = [];
        this.earthSpheres = {};
        this.yearButtons = {};
    }
}

// Create global instance
window.earthController = null;