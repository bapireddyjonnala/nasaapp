/* ==========================================
   Ocean Time Machine VR - Gaze Controller
   Handles gaze-based portal interactions
   ========================================== */

class GazeController {
    constructor() {
        this.gazeTarget = null;
        this.gazeStartTime = 0;
        this.isGazing = false;
        this.cursor = null;
        this.portals = [];
        
        this.init();
    }

    /**
     * Initialize gaze controller
     */
    init() {
        // Wait for scene to be ready
        const scene = document.querySelector('a-scene');
        
        if (scene.hasLoaded) {
            this.setup();
        } else {
            scene.addEventListener('loaded', () => this.setup());
        }
    }

    /**
     * Setup gaze interactions
     */
    setup() {
        console.log('[GazeController] Setting up gaze interactions');

        // Get cursor element
        this.cursor = document.getElementById('gaze-cursor');
        
        if (!this.cursor) {
            console.error('[GazeController] Cursor not found');
            return;
        }

        // Get all portal elements
        this.portals = Array.from(document.querySelectorAll('.portal'));
        console.log(`[GazeController] Found ${this.portals.length} portals`);

        // Setup cursor events
        this.setupCursorEvents();

        // Setup portal events
        this.portals.forEach(portal => this.setupPortalEvents(portal));
    }

    /**
     * Setup cursor event listeners
     */
    setupCursorEvents() {
        // Fuse start (gaze begins)
        this.cursor.addEventListener('fusing', (e) => {
            this.onGazeStart(e.detail.intersectedEl);
        });

        // Fuse complete (2 seconds elapsed)
        this.cursor.addEventListener('click', (e) => {
            if (e.detail.intersectedEl && e.detail.intersectedEl.classList.contains('portal')) {
                this.onGazeComplete(e.detail.intersectedEl);
            }
        });

        // Mouse enter (for desktop)
        this.cursor.addEventListener('mouseenter', (e) => {
            if (e.detail.intersectedEl && e.detail.intersectedEl.classList.contains('portal')) {
                this.onPortalHoverStart(e.detail.intersectedEl);
            }
        });

        // Mouse leave (for desktop)
        this.cursor.addEventListener('mouseleave', (e) => {
            if (e.detail.intersectedEl && e.detail.intersectedEl.classList.contains('portal')) {
                this.onPortalHoverEnd(e.detail.intersectedEl);
            }
        });
    }

    /**
     * Setup individual portal event listeners
     * @param {Element} portal - Portal element
     */
    setupPortalEvents(portal) {
        // Add hover state animation
        portal.addEventListener('mouseenter', () => {
            this.onPortalHoverStart(portal);
        });

        portal.addEventListener('mouseleave', () => {
            this.onPortalHoverEnd(portal);
        });
    }

    /**
     * Handle gaze start on portal
     * @param {Element} portal - Portal being gazed at
     */
    onGazeStart(portal) {
        if (!portal || !portal.classList.contains('portal')) {
            return;
        }

        // Check if transitioning
        if (window.sceneManager && window.sceneManager.isTransitioning) {
            return;
        }

        this.isGazing = true;
        this.gazeTarget = portal;
        this.gazeStartTime = Date.now();

        console.log('[GazeController] Gaze started on:', portal.id);

        // Visual feedback - pulse animation
        portal.setAttribute('animation__pulse', {
            property: 'scale',
            to: '1.1 1.1 1.1',
            dur: CONFIG.gaze.fuseTimeout,
            easing: 'easeInOutQuad'
        });

        // Color feedback
        const currentColor = portal.getAttribute('color');
        portal.setAttribute('animation__color', {
            property: 'material.color',
            from: currentColor,
            to: CONFIG.gaze.activeColor,
            dur: CONFIG.gaze.fuseTimeout,
            easing: 'linear'
        });
    }

    /**
     * Handle gaze complete (portal activated)
     * @param {Element} portal - Portal that was activated
     */
    onGazeComplete(portal) {
        if (!portal || !portal.classList.contains('portal')) {
            return;
        }

        console.log('[GazeController] Gaze complete on:', portal.id);

        // Get target scene from portal ID
        const targetScene = CONFIG.portalMappings[portal.id];

        if (!targetScene) {
            console.error('[GazeController] No mapping found for portal:', portal.id);
            return;
        }

        // Trigger scene transition
        if (window.sceneManager) {
            window.sceneManager.switchScene(targetScene);
        }

        // Reset gaze state
        this.resetGaze(portal);

        // Flash effect on portal
        this.flashPortal(portal);
    }

    /**
     * Handle portal hover start
     * @param {Element} portal - Portal being hovered
     */
    onPortalHoverStart(portal) {
        if (!portal) return;

        // Subtle scale up
        portal.setAttribute('animation__hover', {
            property: 'scale',
            to: '1.05 1.05 1.05',
            dur: 200,
            easing: 'easeOutQuad'
        });

        // Increase opacity
        portal.setAttribute('animation__opacity', {
            property: 'material.opacity',
            to: 0.8,
            dur: 200
        });
    }

    /**
     * Handle portal hover end
     * @param {Element} portal - Portal no longer hovered
     */
    onPortalHoverEnd(portal) {
        if (!portal) return;

        // Reset scale
        portal.setAttribute('animation__hover', {
            property: 'scale',
            to: '1 1 1',
            dur: 200,
            easing: 'easeOutQuad'
        });

        // Reset opacity
        portal.setAttribute('animation__opacity', {
            property: 'material.opacity',
            to: 0.6,
            dur: 200
        });
    }

    /**
     * Flash portal effect on activation
     * @param {Element} portal - Portal to flash
     */
    flashPortal(portal) {
        // Quick bright flash
        portal.setAttribute('animation__flash', {
            property: 'material.opacity',
            from: 1,
            to: 0,
            dur: 500,
            easing: 'easeOutQuad'
        });

        // Reset after flash
        setTimeout(() => {
            portal.setAttribute('material', 'opacity', 0.6);
        }, 500);
    }

    /**
     * Reset gaze state
     * @param {Element} portal - Portal to reset
     */
    resetGaze(portal) {
        this.isGazing = false;
        this.gazeTarget = null;
        this.gazeStartTime = 0;

        if (portal) {
            // Remove animations
            portal.removeAttribute('animation__pulse');
            portal.removeAttribute('animation__color');
            
            // Reset scale
            portal.setAttribute('scale', '1 1 1');
        }
    }

    /**
     * Update portal visibility based on current scene
     * This is called when scenes change
     */
    updatePortalVisibility() {
        // Get current scene
        const currentScene = window.sceneManager ? window.sceneManager.getCurrentScene() : '2000';
        
        console.log('[GazeController] Updating portal visibility for scene:', currentScene);

        // Show/hide portals based on scene
        this.portals.forEach(portal => {
            const portalScene = portal.closest('[id^="scene-"]');
            if (portalScene) {
                const isVisible = portalScene.getAttribute('visible');
                console.log(`Portal ${portal.id} visible:`, isVisible);
            }
        });
    }

    /**
     * Cleanup and reset all portals
     */
    cleanup() {
        this.portals.forEach(portal => {
            this.resetGaze(portal);
        });
    }
}

// Create global instance
window.gazeController = null;