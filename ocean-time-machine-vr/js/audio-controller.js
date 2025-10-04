/* ==========================================
   Ocean Time Machine VR - Audio Controller
   Manages spatial audio and scene soundscapes
   ========================================== */

class AudioController {
    constructor() {
        this.audioElements = {};
        this.currentAudio = null;
        this.transitionAudio = null;
        this.masterVolume = CONFIG.audio.masterVolume;
        this.isInitialized = false;
        
        this.init();
    }

    /**
     * Initialize audio controller
     */
    init() {
        console.log('[AudioController] Initializing audio system');
        
        // Wait for scene to load
        const scene = document.querySelector('a-scene');
        
        if (scene.hasLoaded) {
            this.setup();
        } else {
            scene.addEventListener('loaded', () => this.setup());
        }
    }

    /**
     * Setup audio elements
     */
    setup() {
        // Get all scene audio elements
        CONFIG.sceneOrder.forEach(year => {
            const sceneConfig = CONFIG.scenes[year];
            const audioEl = document.getElementById(sceneConfig.audioId);
            
            if (audioEl) {
                this.audioElements[year] = audioEl;
                
                // Set initial volume
                audioEl.volume = 0;
                audioEl.loop = true;
                
                console.log(`[AudioController] Registered audio for scene ${year}`);
            } else {
                console.warn(`[AudioController] Audio element not found: ${sceneConfig.audioId}`);
            }
        });

        // Get transition audio
        this.transitionAudio = document.getElementById('audio-transition');
        if (this.transitionAudio) {
            this.transitionAudio.volume = this.masterVolume * 0.8;
        }

        this.isInitialized = true;
        console.log('[AudioController] Audio system ready');
    }

    /**
     * Play audio for a specific scene
     * @param {string} year - Scene year (2000, 2020, 2050)
     */
    playSceneAudio(year) {
        if (!this.isInitialized) {
            console.warn('[AudioController] Audio system not initialized');
            return;
        }

        const audioEl = this.audioElements[year];
        
        if (!audioEl) {
            console.warn(`[AudioController] No audio for scene: ${year}`);
            return;
        }

        console.log(`[AudioController] Playing audio for scene: ${year}`);

        // Stop current audio if playing
        if (this.currentAudio && this.currentAudio !== audioEl) {
            this.fadeOut(this.currentAudio);
        }

        // Play and fade in new audio
        this.currentAudio = audioEl;
        audioEl.currentTime = 0;
        
        // Start playing
        const playPromise = audioEl.play();
        
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    this.fadeIn(audioEl);
                })
                .catch(error => {
                    console.warn('[AudioController] Playback prevented:', error);
                    // User interaction required - will try again on next interaction
                });
        }
    }

    /**
     * Stop audio for a specific scene
     * @param {string} year - Scene year
     */
    stopSceneAudio(year) {
        const audioEl = this.audioElements[year];
        
        if (!audioEl) return;

        console.log(`[AudioController] Stopping audio for scene: ${year}`);
        
        this.fadeOut(audioEl, () => {
            audioEl.pause();
            audioEl.currentTime = 0;
        });
    }

    /**
     * Play transition sound effect
     */
    playTransition() {
        if (!this.transitionAudio) return;

        console.log('[AudioController] Playing transition sound');
        
        this.transitionAudio.currentTime = 0;
        const playPromise = this.transitionAudio.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn('[AudioController] Transition sound blocked:', error);
            });
        }
    }

    /**
     * Fade in audio element
     * @param {HTMLAudioElement} audioEl - Audio element to fade in
     */
    fadeIn(audioEl) {
        if (!audioEl) return;

        const targetVolume = this.masterVolume;
        const fadeTime = CONFIG.audio.fadeInTime;
        const steps = 20;
        const stepTime = fadeTime / steps;
        const volumeStep = targetVolume / steps;

        let currentStep = 0;
        audioEl.volume = 0;

        const fadeInterval = setInterval(() => {
            currentStep++;
            audioEl.volume = Math.min(volumeStep * currentStep, targetVolume);

            if (currentStep >= steps) {
                clearInterval(fadeInterval);
                audioEl.volume = targetVolume;
            }
        }, stepTime);
    }

    /**
     * Fade out audio element
     * @param {HTMLAudioElement} audioEl - Audio element to fade out
     * @param {Function} callback - Optional callback when fade complete
     */
    fadeOut(audioEl, callback) {
        if (!audioEl) return;

        const startVolume = audioEl.volume;
        const fadeTime = CONFIG.audio.fadeOutTime;
        const steps = 20;
        const stepTime = fadeTime / steps;
        const volumeStep = startVolume / steps;

        let currentStep = 0;

        const fadeInterval = setInterval(() => {
            currentStep++;
            audioEl.volume = Math.max(startVolume - (volumeStep * currentStep), 0);

            if (currentStep >= steps || audioEl.volume <= 0) {
                clearInterval(fadeInterval);
                audioEl.volume = 0;
                if (callback) callback();
            }
        }, stepTime);
    }

    /**
     * Set master volume
     * @param {number} volume - Volume level (0-1)
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        
        // Update current audio if playing
        if (this.currentAudio) {
            this.currentAudio.volume = this.masterVolume;
        }

        console.log('[AudioController] Master volume set to:', this.masterVolume);
    }

    /**
     * Mute all audio
     */
    muteAll() {
        Object.values(this.audioElements).forEach(audioEl => {
            audioEl.volume = 0;
        });
        
        if (this.transitionAudio) {
            this.transitionAudio.volume = 0;
        }

        console.log('[AudioController] All audio muted');
    }

    /**
     * Unmute all audio
     */
    unmuteAll() {
        if (this.currentAudio) {
            this.currentAudio.volume = this.masterVolume;
        }

        if (this.transitionAudio) {
            this.transitionAudio.volume = this.masterVolume * 0.8;
        }

        console.log('[AudioController] Audio unmuted');
    }

    /**
     * Stop all audio
     */
    stopAll() {
        Object.values(this.audioElements).forEach(audioEl => {
            audioEl.pause();
            audioEl.currentTime = 0;
            audioEl.volume = 0;
        });

        this.currentAudio = null;
        console.log('[AudioController] All audio stopped');
    }

    /**
     * Cleanup audio resources
     */
    cleanup() {
        this.stopAll();
        this.audioElements = {};
        this.currentAudio = null;
        this.transitionAudio = null;
        this.isInitialized = false;
    }
}

// Create global instance
window.audioController = null;