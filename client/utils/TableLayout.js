/**
 * Centralized layout constants and methods for the Cribbage game table.
 * Helps maintain consistent positioning across different scenes and phases.
 */
export const TableLayout = {
    // Relative positions (fractions of screen width/height)
    REL: {
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
        BOT_REVEAL_Y: 300,
        HUMAN_REVEAL_Y: -300, // offset from bottom
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
    },

    /**
     * @param {Phaser.Scale.ScaleManager} scale 
     */
    getPositions(scale) {
        const { width, height } = scale;
        const centerX = width / 2;
        const centerY = height / 2;

        return {
            background: { x: centerX, y: centerY },
            playerHand: { x: centerX, y: height - this.REL.PLAYER_HAND_Y },
            botHand: { x: centerX, y: this.REL.BOT_HAND_Y },
            peggingArea: { x: centerX, y: centerY + this.REL.PEGGING_AREA_Y_OFFSET },
            cribCenter: { x: centerX, y: centerY + this.REL.CRIB_AREA_Y_OFFSET },
            cribParked: { x: width - this.REL.CRIB_PARKED_X_OFFSET, y: centerY + this.REL.CRIB_AREA_Y_OFFSET },
            starterCard: { x: this.REL.STARTER_CARD_X, y: centerY },
            scoreboard: { x: this.REL.SCOREBOARD_X, y: this.REL.SCOREBOARD_Y },
            phaseIndicator: { x: centerX, y: this.REL.PHASE_INDICATOR_Y },
            actionButtons: { x: centerX, y: height + this.REL.ACTION_BUTTONS_Y_OFFSET },
            sortWidget: { x: centerX, y: height - this.REL.SORT_WIDGET_Y_OFFSET },
            exitButton: { x: width - this.REL.EXIT_BUTTON.WIDTH / 2 - this.REL.EXIT_BUTTON.MARGIN, y: this.REL.EXIT_BUTTON.MARGIN + this.REL.EXIT_BUTTON.HEIGHT / 2 },
            deck: { x: this.REL.DECK.X, y: centerY + this.REL.DECK.Y_OFFSET },
            
            // Starting Cut Phase
            startingCut: {
                startX: this.REL.STARTING_CUT_MARGIN,
                endX: width - this.REL.STARTING_CUT_MARGIN,
                y: centerY + 150, // Moved slightly lower as requested
                botRevealY: this.REL.BOT_REVEAL_Y,
                humanRevealY: height + this.REL.HUMAN_REVEAL_Y
            }
        };
    },

    /**
     * Gets the target position for the crib based on the current game phase.
     * @param {Phaser.Scale.ScaleManager} scale 
     * @param {string} phase 
     * @param {Object} PHASES 
     */
    getCribPosition(scale, phase, PHASES) {
        const pos = this.getPositions(scale);
        const isParked = (phase === PHASES.PEGGING || phase === PHASES.COUNTING || phase === PHASES.CUTTING);
        return isParked ? pos.cribParked : pos.cribCenter;
    },

    /**
     * Gets coordinates for floating text based on the player.
     * @param {Phaser.Scale.ScaleManager} scale 
     * @param {import('../../game/Player.js').Player} player 
     * @param {boolean} isHuman 
     */
    getFloatingTextPosition(scale, isHuman) {
        const { width, height } = scale;
        const config = this.REL.FLOATING_TEXT;
        return {
            x: width / 2,
            y: isHuman ? height + config.HUMAN_SCORE_Y_OFFSET : config.BOT_SCORE_Y_OFFSET
        };
    }
};
