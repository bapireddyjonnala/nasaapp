/* ==========================================
   Ocean Time Machine VR - Earth Controller
   Handles Earth rotation, year transitions, hotspots
   ========================================== */

class EarthController {
    constructor() {
        this.currentYear = '2000';
        this.autoPlay = True; // DEFAULT: Auto-play OFF
        this.autoPlayTimer = null;
        this.autoPlayInterval = 5000; // 5 seconds
        
        this.earthSpheres = {};
        this.yearButtons = {};
        this.hotspots = [];
        this.infoPopup = null;
        
        // Globe rotation state (separate from camera)
        this.globeRotation = { x: 0, y: 0 };
        this.isRotatingGlobe = false;
        
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

        // Get HTML year buttons (NOT 3D buttons)
        this.yearButtons = document.querySelectorAll('.year-btn');

        // Get hotspots
        this.hotspots = Array.from(document.querySelectorAll('.hotspot'));

        // Get info popup
        this.infoPopup = document.getElementById('info-popup');

        // Setup star field
        this.createStarField();

        // Setup event listeners
        this.setupEventListeners();

        // Hide rotation hint after 4 seconds
        setTimeout(() => {
            const hint = document.getElementById('rotation-hint');
            if (hint) hint.style.display = 'none';
        }, 4000);

        // DON'T start auto-play by default
        // User can click the button to enable it

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
        // HTML Year button clicks
        this.yearButtons.forEach(button => {
            button.addEventListener('click', () => {
                const year = button.getAttribute('data-year');
                console.log('[EarthController] Year button clicked:', year);
                this.switchYear(year);
                this.resetAutoPlay();
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
                const clickSound = document.getElementById('audio-click');
                if (clickSound) {
                    clickSound.currentTime = 0;
                    clickSound.play().catch(() => {});
                }
            });
        });

        // Close popup button
        const closeBtn = document.getElementById('close-popup');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                console.log('[EarthController] Close popup clicked');
                this.hidePopup();
            });
        }

        // Auto-play toggle (HTML button)
        const autoPlayBtn = document.getElementById('autoplay-btn');
        if (autoPlayBtn) {
            autoPlayBtn.addEventListener('click', () => {
                console.log('[EarthController] Auto-play button clicked');
                this.toggleAutoPlay();
            });
        }

        // Enable smooth 360° GLOBE rotation (separate from camera)
        this.setupGlobeRotation();

        console.log('[EarthController] Event listeners ready');
    }

    /**
     * Setup GLOBE rotation (the Earth sphere itself rotates 360°)
     * This is SEPARATE from camera rotation
     */
    setupGlobeRotation() {
        const earthContainer = document.getElementById('earth-container');
        if (!earthContainer) return;

        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        let velocity = { x: 0, y: 0 };
        let lastMoveTime = Date.now();
        
        // Rotation speed multiplier
        const rotationSpeed = 0.5;
        const damping = 0.96; // Inertia damping
        const minVelocity = 0.01; // Stop threshold

        // Inertia animation loop
        let inertiaAnimationId = null;
        
        const applyInertia = () => {
            if (!isDragging && (Math.abs(velocity.x) > minVelocity || Math.abs(velocity.y) > minVelocity)) {
                this.globeRotation.y += velocity.y;
                this.globeRotation.x += velocity.x;
                
                // Apply damping
                velocity.x *= damping;
                velocity.y *= damping;
                
                // Update ALL visible Earth spheres
                Object.values(this.earthSpheres).forEach(sphere => {
                    if (sphere && sphere.getAttribute('visible')) {
                        sphere.setAttribute('rotation', 
                            `${this.globeRotation.x} ${this.globeRotation.y} 0`
                        );
                    }
                });
                
                // Also rotate hotspots with the globe
                this.rotateHotspots();
                
                inertiaAnimationId = requestAnimationFrame(applyInertia);
            } else {
                velocity = { x: 0, y: 0 };
            }
        };

        // Mouse events
        document.addEventListener('mousedown', (e) => {
            // Don't rotate if clicking on UI buttons or panels
            if (e.target.closest('.year-btn') || 
                e.target.closest('.autoplay-btn') || 
                e.target.closest('.ui-panel')) {
                return;
            }
            
            isDragging = true;
            this.isRotatingGlobe = true;
            previousMousePosition = { x: e.clientX, y: e.clientY };
            lastMoveTime = Date.now();
            velocity = { x: 0, y: 0 };
            
            // Cancel inertia
            if (inertiaAnimationId) {
                cancelAnimationFrame(inertiaAnimationId);
            }
            
            document.body.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const now = Date.now();
            const deltaTime = now - lastMoveTime;
            
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;

            // Update globe rotation
            const rotX = -deltaY * rotationSpeed;
            const rotY = deltaX * rotationSpeed;
            
            this.globeRotation.y += rotY;
            this.globeRotation.x += rotX;

            // Calculate velocity for inertia
            if (deltaTime > 0) {
                velocity.x = rotX / Math.max(deltaTime, 1) * 10;
                velocity.y = rotY / Math.max(deltaTime, 1) * 10;
            }

            // Apply rotation to ALL visible Earth spheres
            Object.values(this.earthSpheres).forEach(sphere => {
                if (sphere && sphere.getAttribute('visible')) {
                    sphere.setAttribute('rotation', 
                        `${this.globeRotation.x} ${this.globeRotation.y} 0`
                    );
                }
            });

            // Rotate hotspots with the globe
            this.rotateHotspots();

            previousMousePosition = { x: e.clientX, y: e.clientY };
            lastMoveTime = now;
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                this.isRotatingGlobe = false;
                document.body.style.cursor = 'default';
                
                // Start inertia animation
                applyInertia();
            }
        });

        // Touch events for mobile
        document.addEventListener('touchstart', (e) => {
            if (e.target.closest('.year-btn') || 
                e.target.closest('.autoplay-btn') || 
                e.target.closest('.ui-panel')) {
                return;
            }
            
            if (e.touches.length === 1) {
                isDragging = true;
                this.isRotatingGlobe = true;
                previousMousePosition = { 
                    x: e.touches[0].clientX, 
                    y: e.touches[0].clientY 
                };
                lastMoveTime = Date.now();
                velocity = { x: 0, y: 0 };
                
                if (inertiaAnimationId) {
                    cancelAnimationFrame(inertiaAnimationId);
                }
            }
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!isDragging || e.touches.length !== 1) return;

            const now = Date.now();
            const deltaTime = now - lastMoveTime;
            
            const deltaX = e.touches[0].clientX - previousMousePosition.x;
            const deltaY = e.touches[0].clientY - previousMousePosition.y;

            const rotX = -deltaY * rotationSpeed;
            const rotY = deltaX * rotationSpeed;
            
            this.globeRotation.y += rotY;
            this.globeRotation.x += rotX;

            // Calculate velocity
            if (deltaTime > 0) {
                velocity.x = rotX / Math.max(deltaTime, 1) * 10;
                velocity.y = rotY / Math.max(deltaTime, 1) * 10;
            }

            // Apply rotation to visible spheres
            Object.values(this.earthSpheres).forEach(sphere => {
                if (sphere && sphere.getAttribute('visible')) {
                    sphere.setAttribute('rotation', 
                        `${this.globeRotation.x} ${this.globeRotation.y} 0`
                    );
                }
            });

            // Rotate hotspots
            this.rotateHotspots();

            previousMousePosition = { 
                x: e.touches[0].clientX, 
                y: e.touches[0].clientY 
            };
            lastMoveTime = now;
        }, { passive: true });

        document.addEventListener('touchend', () => {
            if (isDragging) {
                isDragging = false;
                this.isRotatingGlobe = false;
                applyInertia();
            }
        });

        console.log('[EarthController] Globe 360° rotation enabled (separate from camera)');
    }

    /**
     * Rotate hotspots with the globe
     */
    rotateHotspots() {
        // Hotspots rotate with the globe but stay visible
        this.hotspots.forEach(hotspot => {
            if (hotspot) {
                // Get original position
                const pos = hotspot.getAttribute('position');
                // Apply same rotation as globe to keep hotspots on surface
                hotspot.setAttribute('rotation', 
                    `${this.globeRotation.x} ${this.globeRotation.y} 0`
                );
            }
        });
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

        // Show new Earth with current rotation
        if (this.earthSpheres[year]) {
            this.earthSpheres[year].setAttribute('visible', true);
            // Apply current globe rotation to new sphere
            this.earthSpheres[year].setAttribute('rotation', 
                `${this.globeRotation.x} ${this.globeRotation.y} 0`
            );
        }

        // Update HTML button states
        this.yearButtons.forEach(button => {
            const buttonYear = button.getAttribute('data-year');
            if (buttonYear === year) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
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

        // Update HTML button
        const autoPlayBtn = document.getElementById('autoplay-btn');
        if (autoPlayBtn) {
            autoPlayBtn.classList.add('active');
            const textEl = autoPlayBtn.querySelector('.text');
            if (textEl) textEl.textContent = 'Auto-Play ON';
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

        // Update HTML button
        const autoPlayBtn = document.getElementById('autoplay-btn');
        if (autoPlayBtn) {
            autoPlayBtn.classList.remove('active');
            const textEl = autoPlayBtn.querySelector('.text');
            if (textEl) textEl.textContent = 'Auto-Play OFF';
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
