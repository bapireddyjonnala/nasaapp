/* ==========================================
   Ocean Time Machine VR - Scene Manager
   Handles scene transitions and state
   ========================================== */

class SceneManager {
    constructor() {
        this.currentScene = '2000';
        this.isTransitioning = false;
        this.sceneElements = {};
        this.fadeOverlay = null;
        
        this.init();
    }

    /**
     * Initialize scene manager
     */
    init() {
        // Get scene elements
        CONFIG.sceneOrder.forEach(year => {
            const sceneConfig = CONFIG.scenes[year];
            this.sceneElements[year] = document.getElementById(sceneConfig.id);
        });

        // Get fade overlay
        this.fadeOverlay = document.getElementById('fade-overlay');
        
        console.log('[SceneManager] Initialized with scenes:', Object.keys(this.sceneElements));
    }

    /**
     * Get current scene year
     * @returns {string} Current scene year
     */
    getCurrentScene() {
        return this.currentScene;
    }

    /**
     * Get current scene configuration
     * @returns {object} Scene config
     */
    getCurrentSceneConfig() {
        return CONFIG.scenes[this.currentScene];
    }

    /**
     * Switch to a new scene with smooth transition
     * @param {string} targetYear - Target scene year (2000, 2020, 2050)
     */
    async switchScene(targetYear) {
        // Prevent multiple transitions
        if (this.isTransitioning) {
            console.warn('[SceneManager] Transition already in progress');
            return;
        }

        // Validate target scene
        if (!CONFIG.scenes[targetYear]) {
            console.error('[SceneManager] Invalid target scene:', targetYear);
            return;
        }

        // Don't switch if already in target scene
        if (this.currentScene === targetYear) {
            console.log('[SceneManager] Already in scene:', targetYear);
            return;
        }

        console.log(`[SceneManager] Transitioning: ${this.currentScene} → ${targetYear}`);
        
        this.isTransitioning = true;

        try {
            // Fade out
            await this.fadeOut();

            // Stop current scene audio
            if (window.audioController) {
                window.audioController.stopSceneAudio(this.currentScene);
            }

            // Hide current scene
            this.hideScene(this.currentScene);

            // Update current scene
            const previousScene = this.currentScene;
            this.currentScene = targetYear;

            // Show new scene
            this.showScene(targetYear);

            // Update UI
            if (window.uiManager) {
                window.uiManager.updateSceneInfo(targetYear);
                window.uiManager.startSubtitles(targetYear);
            }

            // Play transition audio
            if (window.audioController) {
                window.audioController.playTransition();
            }

            // Small delay before fade in
            await this.delay(300);

            // Fade in
            await this.fadeIn();

            // Start new scene audio
            if (window.audioController) {
                window.audioController.playSceneAudio(targetYear);
            }

            // Trigger animation updates
            if (window.animationController) {
                window.animationController.updateWaterLevel(targetYear);
            }

            console.log('[SceneManager] Transition complete:', targetYear);

        } catch (error) {
            console.error('[SceneManager] Transition error:', error);
        } finally {
            this.isTransitioning = false;
        }
    }

    /**
     * Hide a scene
     * @param {string} year - Scene year to hide
     */
    hideScene(year) {
        const sceneEl = this.sceneElements[year];
        if (sceneEl) {
            sceneEl.setAttribute('visible', false);
            console.log(`[SceneManager] Hidden scene: ${year}`);
        }
    }

    /**
     * Show a scene
     * @param {string} year - Scene year to show
     */
    showScene(year) {
        const sceneEl = this.sceneElements[year];
        if (sceneEl) {
            sceneEl.setAttribute('visible', true);
            console.log(`[SceneManager] Showing scene: ${year}`);
        }
    }

    /**
     * Fade out screen to black
     * @returns {Promise}
     */
    fadeOut() {
        return new Promise((resolve) => {
            if (!this.fadeOverlay) {
                resolve();
                return;
            }

            this.fadeOverlay.setAttribute('visible', true);
            this.fadeOverlay.setAttribute('material', 'opacity', 0);

            // Animate opacity to 1
            this.fadeOverlay.setAttribute('animation', {
                property: 'material.opacity',
                to: 1,
                dur: CONFIG.transition.fadeDuration,
                easing: 'easeInOutQuad'
            });

            setTimeout(resolve, CONFIG.transition.fadeDuration);
        });
    }

    /**
     * Fade in from black
     * @returns {Promise}
     */
    fadeIn() {
        return new Promise((resolve) => {
            if (!this.fadeOverlay) {
                resolve();
                return;
            }

            // Animate opacity to 0
            this.fadeOverlay.setAttribute('animation', {
                property: 'material.opacity',
                to: 0,
                dur: CONFIG.transition.fadeDuration,
                easing: 'easeInOutQuad'
            });

            setTimeout(() => {
                this.fadeOverlay.setAttribute('visible', false);
                resolve();
            }, CONFIG.transition.fadeDuration);
        });
    }

    /**
     * Utility delay function
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get next scene in sequence
     * @returns {string} Next scene year
     */
    getNextScene() {
        const currentIndex = CONFIG.sceneOrder.indexOf(this.currentScene);
        const nextIndex = (currentIndex + 1) % CONFIG.sceneOrder.length;
        return CONFIG.sceneOrder[nextIndex];
    }

    /**
     * Get previous scene in sequence
     * @returns {string} Previous scene year
     */
    getPreviousScene() {
        const currentIndex = CONFIG.sceneOrder.indexOf(this.currentScene);
        const prevIndex = (currentIndex - 1 + CONFIG.sceneOrder.length) % CONFIG.sceneOrder.length;
        return CONFIG.sceneOrder[prevIndex];
    }

    /**
     * Reset to first scene
     */
    async reset() {
        await this.switchScene(CONFIG.sceneOrder[0]);
    }
}

// Create global instance
window.sceneManager = null;