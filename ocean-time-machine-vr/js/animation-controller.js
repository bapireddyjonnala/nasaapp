/* ==========================================
   Ocean Time Machine VR - Animation Controller
   Manages water level and environmental animations
   ========================================== */

class AnimationController {
    constructor() {
        this.waterElements = {};
        this.isInitialized = false;
        
        this.init();
    }

    /**
     * Initialize animation controller
     */
    init() {
        console.log('[AnimationController] Initializing animations');
        
        // Wait for scene to load
        const scene = document.querySelector('a-scene');
        
        if (scene.hasLoaded) {
            this.setup();
        } else {
            scene.addEventListener('loaded', () => this.setup());
        }
    }

    /**
     * Setup animation elements
     */
    setup() {
        // Get water elements for each scene
        CONFIG.sceneOrder.forEach(year => {
            const waterId = `water-${year}`;
            const waterEl = document.getElementById(waterId);
            
            if (waterEl) {
                this.waterElements[year] = waterEl;
                console.log(`[AnimationController] Registered water element: ${waterId}`);
            }
        });

        this.isInitialized = true;
        console.log('[AnimationController] Animations ready');
    }

    /**
     * Update water level for current scene
     * @param {string} year - Scene year
     */
    updateWaterLevel(year) {
        if (!this.isInitialized) return;

        const sceneConfig = CONFIG.scenes[year];
        if (!sceneConfig) return;

        const waterEl = this.waterElements[year];
        if (!waterEl) return;

        const targetLevel = sceneConfig.waterLevel;
        
        console.log(`[AnimationController] Updating water level for ${year}: ${targetLevel}m`);

        // Animate water level
        waterEl.setAttribute('animation__level', {
            property: 'position',
            to: `0 ${targetLevel} 0`,
            dur: 2000,
            easing: 'easeInOutQuad'
        });
    }

    /**
     * Animate water rising (for dramatic effect)
     * @param {string} year - Scene year
     * @param {number} riseAmount - Amount to rise in meters
     * @param {number} duration - Animation duration in ms
     */
    animateWaterRise(year, riseAmount = 0.5, duration = 3000) {
        const waterEl = this.waterElements[year];
        if (!waterEl) return;

        const currentPos = waterEl.getAttribute('position');
        const newY = currentPos.y + riseAmount;

        console.log(`[AnimationController] Water rising in ${year}: +${riseAmount}m`);

        waterEl.setAttribute('animation__rise', {
            property: 'position',
            to: `${currentPos.x} ${newY} ${currentPos.z}`,
            dur: duration,
            easing: 'easeInOutSine'
        });
    }

    /**
     * Create wave effect on water surface
     * @param {string} year - Scene year
     */
    createWaveEffect(year) {
        const waterEl = this.waterElements[year];
        if (!waterEl) return;

        // Add undulating wave animation
        waterEl.setAttribute('animation__wave', {
            property: 'rotation',
            to: '0 0 5',
            dur: 3000,
            loop: true,
            dir: 'alternate',
            easing: 'easeInOutSine'
        });
    }

    /**
     * Stop wave effect
     * @param {string} year - Scene year
     */
    stopWaveEffect(year) {
        const waterEl = this.waterElements[year];
        if (!waterEl) return;

        waterEl.removeAttribute('animation__wave');
        waterEl.setAttribute('rotation', '0 0 0');
    }

    /**
     * Animate coral bleaching effect
     * @param {Element} coralEl - Coral element
     */
    animateCoralBleaching(coralEl) {
        if (!coralEl) return;

        console.log('[AnimationController] Animating coral bleaching');

        // Gradually change color to white/gray
        coralEl.setAttribute('animation__bleach', {
            property: 'material.color',
            to: '#E0E0E0',
            dur: 5000,
            easing: 'linear'
        });

        // Reduce size slightly
        coralEl.setAttribute('animation__shrink', {
            property: 'scale',
            to: '0.8 0.8 0.8',
            dur: 5000,
            easing: 'easeInQuad'
        });
    }

    /**
     * Animate floating debris
     * @param {Element} debrisEl - Debris element
     */
    animateDebris(debrisEl) {
        if (!debrisEl) return;

        // Floating motion
        debrisEl.setAttribute('animation__float', {
            property: 'position',
            to: `${debrisEl.getAttribute('position').x + 2} ${debrisEl.getAttribute('position').y + 0.5} ${debrisEl.getAttribute('position').z}`,
            dur: 8000,
            loop: true,
            dir: 'alternate',
            easing: 'easeInOutSine'
        });

        // Rotating motion
        debrisEl.setAttribute('animation__rotate', {
            property: 'rotation',
            to: '0 360 0',
            dur: 10000,
            loop: true,
            easing: 'linear'
        });
    }

    /**
     * Animate sky color change (day/storm/apocalyptic)
     * @param {string} year - Scene year
     * @param {string} targetColor - Target sky color
     */
    animateSkyTransition(year, targetColor = '#87CEEB') {
        const skyId = `sky-${year}`;
        const skyEl = document.getElementById(skyId);
        
        if (!skyEl) return;

        console.log(`[AnimationController] Sky transition for ${year}`);

        skyEl.setAttribute('animation__color', {
            property: 'material.color',
            to: targetColor,
            dur: 3000,
            easing: 'easeInOutQuad'
        });
    }

    /**
     * Create particle effect (bubbles, debris, etc.)
     * @param {string} type - Particle type ('bubbles', 'debris')
     * @param {object} position - Starting position
     */
    createParticleEffect(type = 'bubbles', position = { x: 0, y: 0, z: -5 }) {
        if (!CONFIG.performance.particlesEnabled) return;

        console.log(`[AnimationController] Creating ${type} particles`);

        const scene = document.querySelector('a-scene');
        const numParticles = 10;

        for (let i = 0; i < numParticles; i++) {
            const particle = document.createElement('a-sphere');
            
            particle.setAttribute('radius', type === 'bubbles' ? 0.05 : 0.1);
            particle.setAttribute('color', type === 'bubbles' ? '#FFFFFF' : '#8B4513');
            particle.setAttribute('opacity', 0.6);
            particle.setAttribute('position', {
                x: position.x + (Math.random() - 0.5) * 2,
                y: position.y,
                z: position.z + (Math.random() - 0.5) * 2
            });

            // Animate upward movement
            particle.setAttribute('animation', {
                property: 'position',
                to: `${particle.getAttribute('position').x} ${position.y + 3} ${particle.getAttribute('position').z}`,
                dur: 3000 + Math.random() * 2000,
                easing: 'easeOutQuad'
            });

            // Fade out
            particle.setAttribute('animation__fade', {
                property: 'opacity',
                to: 0,
                dur: 3000,
                delay: 1000
            });

            scene.appendChild(particle);

            // Remove after animation
            setTimeout(() => {
                scene.removeChild(particle);
            }, 5000);
        }
    }

    /**
     * Pulse animation for objects (attention grabber)
     * @param {Element} element - Element to pulse
     * @param {number} duration - Pulse duration
     */
    pulseElement(element, duration = 1000) {
        if (!element) return;

        element.setAttribute('animation__pulse', {
            property: 'scale',
            to: '1.2 1.2 1.2',
            dur: duration / 2,
            loop: 2,
            dir: 'alternate',
            easing: 'easeInOutQuad'
        });
    }

    /**
     * Stop all animations for cleanup
     */
    stopAllAnimations() {
        Object.values(this.waterElements).forEach(waterEl => {
            waterEl.removeAttribute('animation__level');
            waterEl.removeAttribute('animation__rise');
            waterEl.removeAttribute('animation__wave');
        });

        console.log('[AnimationController] All animations stopped');
    }

    /**
     * Cleanup animation resources
     */
    cleanup() {
        this.stopAllAnimations();
        this.waterElements = {};
        this.isInitialized = false;
    }
}

// Create global instance
window.animationController = null;