/**
 * Centralized layout constants and methods for the Cribbage game table.
 * Helps maintain consistent positioning across different scenes and phases.
 */
export const LayoutSize = {
    MOBILE_PORTRAIT: 'MobilePortrait',
    MOBILE_LANDSCAPE: 'MobileLandscape',
    TABLET_PORTRAIT: 'TabletPortrait',
    TABLET_LANDSCAPE: 'TabletLandscape',
    DESKTOP: 'Desktop'
};

const LAYOUT_CONFIGS = {
    [LayoutSize.MOBILE_PORTRAIT]: {
        // Future overrides
    },
    [LayoutSize.MOBILE_LANDSCAPE]: {
        // Future overrides
    },
    [LayoutSize.TABLET_PORTRAIT]: {
        // Future overrides
    },
    [LayoutSize.TABLET_LANDSCAPE]: {
        // Future overrides
    },
    [LayoutSize.DESKTOP]: {
        // Future overrides
    }
};

const REL = {
    PLAYER_HAND_Y: 170, // offset from bottom (moved up slightly from 150)
    BOT_HAND_Y: 100, // offset from top
    PEGGING_AREA_Y_OFFSET: -40, // offset from center Y
    CRIB_AREA_Y_OFFSET: 100, // offset from center Y
    CRIB_PARKED_X_OFFSET: 150, // offset from right
    STARTER_CARD_X: 250,
    SCOREBOARD_X: 160,
    SCOREBOARD_Y: 60,
    PHASE_INDICATOR_Y: 220,
    ACTION_BUTTONS_Y_OFFSET: -240, // offset from bottom
    STARTING_CUT_MARGIN: 100,
    BOT_REVEAL_Y: 330,
    HUMAN_REVEAL_Y: -200, // offset from bottom
    SORT_WIDGET_Y_OFFSET: 50, // absolute from bottom
    SORT_WIDGET: {
        WIDTH: 340,
        HEIGHT: 70,
        BUTTON_WIDTH: 80,
        BUTTON_HEIGHT: 40
    },

    // Component specific dimensions/offsets
    SCOREBOARD: {
        WIDTH: 300,
        HEIGHT: 100,
        TEXT_X_OFFSET: -130,
        ROW_SPACING: 40,
        ROW_Y_START: -20
    },
    PEGGING_AREA: {
        WIDTH: 450,
        HEIGHT: 160,
        CARD_SPACING: 50,
        LABEL_Y: -90
    },
    CRIB: {
        WIDTH: 240,
        HEIGHT: 180,
        LABEL_Y: -110,
        SPREAD_SPACING: 40,
        STACK_SPACING: 2
    },
    STARTER_CARD: {
        WIDTH: 100,
        HEIGHT: 140,
        LABEL_Y: -90
    },
    DECK: {
        X: 80,
        Y_OFFSET: 0     // center Y
    },
    PHASE_INDICATOR: {
        WIDTH: 400,
        HEIGHT: 80,
        PHASE_Y: -15,
        INSTRUCTION_Y: 20
    },
    ACTION_BUTTONS: {
        WIDTH: 420,
        HEIGHT: 60
    },
    EXIT_BUTTON: {
        WIDTH: 200,
        HEIGHT: 50,
        MARGIN: 40
    },
    FLOATING_TEXT: {
        PEGGING_GO_Y_OFFSET: -150, // offset from center Y
        HUMAN_SCORE_Y_OFFSET: -200, // offset from bottom
        BOT_SCORE_Y_OFFSET: 200 // absolute Y from top
    }
};

export class TableLayout {
    /**
     * @param {Phaser.Scale.ScaleManager} scale 
     */
    constructor(scale) {
        this.scale = scale;
        this.refresh();
    }

    /**
     * Re-calculates size and config based on current scale dimensions.
     */
    refresh() {
        this.size = this.getScreenSize(this.scale.width, this.scale.height);
        this.config = this.getConfigForSize(this.size);
    }

    /**
     * Determines the screen size and orientation category.
     * @param {number} width 
     * @param {number} height 
     * @returns {string} One of LayoutSize constants
     */
    getScreenSize(width, height) {
        const isLandscape = width > height;
        const maxDim = Math.max(width, height);
        // eslint-disable-next-line no-unused-vars
        const minDim = Math.min(width, height);

        // Breakpoints based on standard device dimensions
        if (maxDim < 900) {
            return isLandscape ? LayoutSize.MOBILE_LANDSCAPE : LayoutSize.MOBILE_PORTRAIT;
        } else if (maxDim < 1200) {
            return isLandscape ? LayoutSize.TABLET_LANDSCAPE : LayoutSize.TABLET_PORTRAIT;
        } else {
            return LayoutSize.DESKTOP;
        }
    }

    /**
     * Gets specific configuration for a given layout size.
     * Merges default REL with layout-specific overrides.
     * @param {string} size 
     */
    getConfigForSize(size) {
        const overrides = LAYOUT_CONFIGS[size] || {};
        // Deep merge could be used here if needed, but for now we'll just merge the top level
        return { ...REL, ...overrides };
    }

    /**
     * Gets all calculated positions for the current scale and size.
     */
    getPositions() {
        const { width, height } = this.scale;
        const centerX = width / 2;
        const centerY = height / 2;
        const config = this.config;

        return {
            background: { x: centerX, y: centerY },
            playerHand: { x: centerX, y: height - config.PLAYER_HAND_Y },
            botHand: { x: centerX, y: config.BOT_HAND_Y },
            peggingArea: { x: centerX, y: centerY + config.PEGGING_AREA_Y_OFFSET },
            cribCenter: { x: centerX, y: centerY + config.CRIB_AREA_Y_OFFSET },
            cribParked: { x: width - config.CRIB_PARKED_X_OFFSET, y: centerY + config.CRIB_AREA_Y_OFFSET },
            starterCard: { x: config.STARTER_CARD_X, y: centerY },
            scoreboard: { x: config.SCOREBOARD_X, y: config.SCOREBOARD_Y },
            phaseIndicator: { x: centerX, y: config.PHASE_INDICATOR_Y },
            actionButtons: { x: centerX, y: height + config.ACTION_BUTTONS_Y_OFFSET },
            sortWidget: { x: centerX, y: height - config.SORT_WIDGET_Y_OFFSET },
            exitButton: { x: width - config.EXIT_BUTTON.WIDTH / 2 - config.EXIT_BUTTON.MARGIN, y: config.EXIT_BUTTON.MARGIN + config.EXIT_BUTTON.HEIGHT / 2 },
            deck: { x: config.DECK.X, y: centerY + config.DECK.Y_OFFSET },
            
            // Starting Cut Phase
            startingCut: {
                startX: config.STARTING_CUT_MARGIN,
                endX: width - config.STARTING_CUT_MARGIN,
                y: centerY + 150, // Moved slightly lower as requested
                botRevealY: config.BOT_REVEAL_Y,
                humanRevealY: height + config.HUMAN_REVEAL_Y
            }
        };
    }

    /**
     * Gets the target position for the crib based on the current game phase.
     * @param {string} phase 
     * @param {Object} PHASES 
     */
    getCribPosition(phase, PHASES) {
        const pos = this.getPositions();
        const isParked = (phase === PHASES.PEGGING || phase === PHASES.COUNTING || phase === PHASES.CUTTING);
        return isParked ? pos.cribParked : pos.cribCenter;
    }

    /**
     * Gets coordinates for floating text based on the player.
     * @param {boolean} isHuman 
     */
    getFloatingTextPosition(isHuman) {
        const { width, height } = this.scale;
        const config = this.config.FLOATING_TEXT;
        return {
            x: width / 2,
            y: isHuman ? height + config.HUMAN_SCORE_Y_OFFSET : config.BOT_SCORE_Y_OFFSET
        };
    }
}

// Keeping REL as static property if anyone still needs it, but we prefer using instance.config
TableLayout.REL = REL;
