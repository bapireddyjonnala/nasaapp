/* ==========================================
   Ocean Time Machine VR - Initialization
   Main entry point and orchestration
   ========================================== */

(function() {
    'use strict';

    console.log('🌊 Ocean Time Machine VR - Initializing...');

    // Application state
    const app = {
        isReady: false,
        loadingProgress: 0,
        assetsLoaded: false
    };

    /**
     * Initialize all controllers and managers
     */
    function initializeControllers() {
        console.log('[Init] Creating controller instances');

        // Create UI Manager
        window.uiManager = new UIManager();

        // Create Audio Controller
        window.audioController = new AudioController();

        // Create Animation Controller
        window.animationController = new AnimationController();

        // Create Earth Controller (handles rotation and year switching)
        window.earthController = new EarthController();

        console.log('[Init] All controllers initialized');
    }

    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        console.log('[Init] Setting up event listeners');

        // Handle visibility change (pause audio when tab hidden)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (window.audioController) {
                    window.audioController.muteAll();
                }
            } else {
                if (window.audioController) {
                    window.audioController.unmuteAll();
                }
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            console.log('[Init] Window resized');
            // Add any responsive adjustments here
        });

        // Handle VR mode enter/exit
        const scene = document.querySelector('a-scene');
        
        scene.addEventListener('enter-vr', () => {
            console.log('[Init] Entered VR mode');
            if (window.uiManager) {
                window.uiManager.showMessage('Welcome to VR Mode', 3000);
            }
        });

        scene.addEventListener('exit-vr', () => {
            console.log('[Init] Exited VR mode');
        });

        // Handle errors
        window.addEventListener('error', (event) => {
            console.error('[Init] Global error:', event.error);
            if (window.uiManager) {
                window.uiManager.showError('An error occurred. Please refresh.');
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            handleKeyboard(event);
        });

        console.log('[Init] Event listeners ready');
    }

    /**
     * Handle keyboard shortcuts
     * @param {KeyboardEvent} event - Keyboard event
     */
    function handleKeyboard(event) {
        // Skip if user is typing in an input
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        switch(event.key.toLowerCase()) {
            case 'm':
                // Toggle mute
                if (window.audioController) {
                    if (window.audioController.masterVolume > 0) {
                        window.audioController.muteAll();
                    } else {
                        window.audioController.unmuteAll();
                    }
                }
                break;

            case 'r':
                // Reset to first scene
                if (window.earthController) {
                    window.earthController.switchYear('2000');
                }
                break;

            case 'h':
                // Toggle high contrast
                if (window.uiManager) {
                    const currentMode = CONFIG.accessibility.highContrast;
                    window.uiManager.toggleHighContrast(!currentMode);
                }
                break;

            case 'i':
                // Toggle instructions
                if (window.uiManager) {
                    const instructions = document.getElementById('instructions');
                    if (instructions) {
                        instructions.style.display = 
                            instructions.style.display === 'none' ? 'block' : 'none';
                    }
                }
                break;

            case '1':
                // Jump to scene 2000
                if (window.earthController) {
                    window.earthController.switchYear('2000');
                }
                break;

            case '2':
                // Jump to scene 2010
                if (window.earthController) {
                    window.earthController.switchYear('2010');
                }
                break;

            case '3':
                // Jump to scene 2020
                if (window.earthController) {
                    window.earthController.switchYear('2020');
                }
                break;

            case '4':
                // Jump to scene 2050
                if (window.earthController) {
                    window.earthController.switchYear('2050');
                }
                break;
        }
    }

    /**
     * Track asset loading progress
     */
    function trackAssetLoading() {
        const scene = document.querySelector('a-scene');
        const assets = document.querySelector('a-assets');

        if (!assets) {
            console.warn('[Init] No assets element found');
            app.assetsLoaded = true;
            return;
        }

        // Get all assets
        const totalAssets = assets.children.length;
        let loadedAssets = 0;

        console.log(`[Init] Loading ${totalAssets} assets`);

        // Track each asset
        Array.from(assets.children).forEach((asset, index) => {
            asset.addEventListener('loaded', () => {
                loadedAssets++;
                app.loadingProgress = (loadedAssets / totalAssets) * 100;
                
                if (window.uiManager) {
                    window.uiManager.updateProgress(app.loadingProgress);
                }

                console.log(`[Init] Asset ${loadedAssets}/${totalAssets} loaded (${Math.round(app.loadingProgress)}%)`);

                if (loadedAssets === totalAssets) {
                    app.assetsLoaded = true;
                    onAssetsLoaded();
                }
            });

            asset.addEventListener('error', (e) => {
                console.error(`[Init] Asset failed to load:`, asset.getAttribute('src'), e);
                loadedAssets++; // Count as loaded to prevent hanging
                
                if (loadedAssets === totalAssets) {
                    app.assetsLoaded = true;
                    onAssetsLoaded();
                }
            });
        });
    }

    /**
     * Called when all assets are loaded
     */
    function onAssetsLoaded() {
        console.log('[Init] All assets loaded');

        // Start the experience
        setTimeout(() => {
            startExperience();
        }, 500);
    }

    /**
     * Start the VR experience
     */
    function startExperience() {
        console.log('[Init] Starting experience');

        // Hide loading screen
        if (window.uiManager) {
            window.uiManager.hideLoadingScreen();
        }

        // Start initial scene audio
        if (window.audioController) {
            window.audioController.playSceneAudio('2000');
        }

        // Start initial subtitles
        if (window.uiManager) {
            window.uiManager.startSubtitles('2000');
        }

        // Show welcome message
        if (window.uiManager) {
            setTimeout(() => {
                window.uiManager.showMessage('Drag to rotate Earth 360°. Click year buttons to time travel!', 5000);
            }, 2000);
        }

        // Mark app as ready
        app.isReady = true;

        console.log('🌊 Ocean Time Machine VR - Ready!');
    }

    /**
     * Main initialization sequence
     */
    function init() {
        console.log('[Init] Starting initialization sequence');

        // Wait for A-Frame to be ready
        const scene = document.querySelector('a-scene');

        if (!scene) {
            console.error('[Init] Scene element not found');
            return;
        }

        // Scene loaded event
        if (scene.hasLoaded) {
            onSceneLoaded();
        } else {
            scene.addEventListener('loaded', onSceneLoaded);
        }
    }

    /**
     * Called when A-Frame scene is loaded
     */
    function onSceneLoaded() {
        console.log('[Init] Scene loaded');

        // Initialize controllers
        initializeControllers();

        // Setup event listeners
        setupEventListeners();

        // Track asset loading
        trackAssetLoading();

        // If assets already loaded (cached), start immediately
        if (app.assetsLoaded) {
            startExperience();
        }
    }

    /**
     * Cleanup function for page unload
     */
    function cleanup() {
        console.log('[Init] Cleaning up');

        if (window.audioController) {
            window.audioController.cleanup();
        }

        if (window.uiManager) {
            window.uiManager.cleanup();
        }

        if (window.animationController) {
            window.animationController.cleanup();
        }

        if (window.earthController) {
            window.earthController.cleanup();
        }
    }

    /**
     * Handle before unload
     */
    window.addEventListener('beforeunload', cleanup);

    /**
     * Debug utilities (only in development)
     */
    window.oceanVR = {
        debug: {
            getState: () => app,
            getConfig: () => CONFIG,
            switchYear: (year) => window.earthController?.switchYear(year),
            playAudio: (year) => window.audioController?.playSceneAudio(year),
            showSubtitle: (text) => window.uiManager?.showSubtitle(text, 5000),
            muteAudio: () => window.audioController?.muteAll(),
            unmuteAudio: () => window.audioController?.unmuteAll(),
            resetExperience: () => window.earthController?.switchYear('2000'),
            getHelp: () => {
                console.log('🌊 Ocean Time Machine VR - Debug Commands:');
                console.log('oceanVR.debug.switchYear("2000" | "2010" | "2020" | "2050")');
                console.log('oceanVR.debug.playAudio("2000" | "2010" | "2020" | "2050")');
                console.log('oceanVR.debug.showSubtitle("Your message")');
                console.log('oceanVR.debug.muteAudio()');
                console.log('oceanVR.debug.unmuteAudio()');
                console.log('oceanVR.debug.resetExperience()');
                console.log('oceanVR.debug.getState()');
                console.log('oceanVR.debug.getConfig()');
                console.log('\nKeyboard Shortcuts:');
                console.log('M - Toggle mute');
                console.log('R - Reset to first scene');
                console.log('H - Toggle high contrast');
                console.log('I - Toggle instructions');
                console.log('1, 2, 3, 4 - Jump to scenes 2000, 2010, 2020, 2050');
            }
        }
    };

    // Start initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Log debug help on startup
    console.log('%c🌊 Ocean Time Machine VR', 'font-size: 20px; color: #00D9FF; font-weight: bold;');
    console.log('%cType oceanVR.debug.getHelp() for debug commands', 'color: #A0E7FF;');

})();
