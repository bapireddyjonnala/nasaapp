/* ==========================================
   Ocean Time Machine VR - UI Manager
   Manages user interface and subtitles
   ========================================== */

class UIManager {
    constructor() {
        this.sceneTitle = null;
        this.sceneDescription = null;
        this.subtitleDisplay = null;
        this.subtitleText = null;
        this.instructions = null;
        
        this.currentSubtitles = [];
        this.subtitleTimers = [];
        this.currentSubtitleIndex = 0;
        
        this.init();
    }

    /**
     * Initialize UI manager
     */
    init() {
        console.log('[UIManager] Initializing UI');

        // Get UI elements
        this.sceneTitle = document.getElementById('scene-title');
        this.sceneDescription = document.getElementById('scene-description');
        this.subtitleDisplay = document.getElementById('subtitle-display');
        this.subtitleText = document.getElementById('subtitle-text');
        this.instructions = document.getElementById('instructions');

        // Set initial scene info
        this.updateSceneInfo('2000');
        
        console.log('[UIManager] UI initialized');
    }

    /**
     * Update scene information display
     * @param {string} year - Scene year
     */
    updateSceneInfo(year) {
        const sceneConfig = CONFIG.scenes[year];
        
        if (!sceneConfig) return;

        console.log('[UIManager] Updating scene info for:', year);

        // Update title
        if (this.sceneTitle) {
            this.sceneTitle.textContent = sceneConfig.title;
            this.animateElement(this.sceneTitle);
        }

        // Update description
        if (this.sceneDescription) {
            this.sceneDescription.textContent = sceneConfig.description;
            this.animateElement(this.sceneDescription);
        }
    }

    /**
     * Start subtitles for a scene
     * @param {string} year - Scene year
     */
    startSubtitles(year) {
        if (!CONFIG.accessibility.subtitlesEnabled) return;

        const sceneConfig = CONFIG.scenes[year];
        
        if (!sceneConfig || !sceneConfig.subtitles) return;

        console.log('[UIManager] Starting subtitles for:', year);

        // Clear any existing subtitle timers
        this.clearSubtitles();

        // Get subtitles for this scene
        this.currentSubtitles = sceneConfig.subtitles;
        this.currentSubtitleIndex = 0;

        // Schedule each subtitle
        this.currentSubtitles.forEach((subtitle, index) => {
            const timer = setTimeout(() => {
                this.showSubtitle(subtitle.text, CONFIG.accessibility.subtitleDuration);
                this.currentSubtitleIndex = index;
            }, subtitle.time);

            this.subtitleTimers.push(timer);
        });
    }

    /**
     * Show a subtitle
     * @param {string} text - Subtitle text
     * @param {number} duration - Display duration in milliseconds
     */
    showSubtitle(text, duration = 5000) {
        if (!this.subtitleText || !this.subtitleDisplay) return;

        console.log('[UIManager] Showing subtitle:', text);

        // Set text
        this.subtitleText.textContent = text;

        // Show subtitle display
        this.subtitleDisplay.classList.remove('hidden');
        this.animateElement(this.subtitleDisplay);

        // Auto-hide after duration
        setTimeout(() => {
            this.hideSubtitle();
        }, duration);
    }

    /**
     * Hide subtitle
     */
    hideSubtitle() {
        if (!this.subtitleDisplay) return;

        this.subtitleDisplay.classList.add('hidden');
    }

    /**
     * Clear all subtitle timers
     */
    clearSubtitles() {
        // Clear all timers
        this.subtitleTimers.forEach(timer => clearTimeout(timer));
        this.subtitleTimers = [];

        // Hide subtitle display
        this.hideSubtitle();

        console.log('[UIManager] Subtitles cleared');
    }

    /**
     * Show instructions
     */
    showInstructions() {
        if (!this.instructions) return;
        this.instructions.style.display = 'block';
    }

    /**
     * Hide instructions
     */
    hideInstructions() {
        if (!this.instructions) return;
        this.instructions.style.display = 'none';
    }

    /**
     * Show a temporary message
     * @param {string} message - Message to display
     * @param {number} duration - Display duration
     */
    showMessage(message, duration = 3000) {
        this.showSubtitle(message, duration);
    }

    /**
     * Animate element (fade in effect)
     * @param {HTMLElement} element - Element to animate
     */
    animateElement(element) {
        if (!element) return;

        // Remove and re-add animation class
        element.classList.remove('fade-in');
        
        // Trigger reflow
        void element.offsetWidth;
        
        element.classList.add('fade-in');
    }

    /**
     * Toggle high contrast mode
     * @param {boolean} enabled - Enable/disable high contrast
     */
    toggleHighContrast(enabled) {
        CONFIG.accessibility.highContrast = enabled;
        
        const body = document.body;
        
        if (enabled) {
            body.classList.add('high-contrast');
        } else {
            body.classList.remove('high-contrast');
        }

        console.log('[UIManager] High contrast:', enabled);
    }

    /**
     * Update progress indicator (for loading)
     * @param {number} progress - Progress percentage (0-100)
     */
    updateProgress(progress) {
        const progressFill = document.getElementById('progress-fill');
        
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
    }

    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        
        if (loadingScreen) {
            console.log('[UIManager] Hiding loading screen');
            
            loadingScreen.classList.add('hidden');
            
            // Remove from DOM after transition
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        console.error('[UIManager] Error:', message);
        
        // Show in subtitle area
        this.showSubtitle(`⚠️ ${message}`, 5000);
    }

    /**
     * Cleanup UI resources
     */
    cleanup() {
        this.clearSubtitles();
        this.currentSubtitles = [];
        this.currentSubtitleIndex = 0;
    }
}

// Create global instance
window.uiManager = null;