/**
 * card sizes
 * standard spacing
 * panel sizes
 * scale limits
 */

export const TOKENS = {
    CARD: {
        WIDTH: 100,
        HEIGHT: 140,
        DEFAULT_SCALE: 1.0,
        MIN_SCALE: 0.6,
        MAX_SCALE: 1.0,
        LABEL_Y: -90
    },
    SPACING: {
        STANDARD: 16,
        TIGHT: 8,
        LOOSE: 32,
        CARD_SPREAD: 40,
        CARD_STACK: 2,
        PEGGING_CARD: 50
    },
    PANEL: {
        SCOREBOARD: {
            WIDTH: 220,
            HEIGHT: 85,
            TEXT_X_OFFSET: 0,
            ROW_SPACING_RATIO: 3,
            ROW_Y_START_RATIO: 6
        },
        PHASE_INDICATOR: {
            WIDTH: 480,
            HEIGHT: 100,
            PHASE_Y: -20,
            INSTRUCTION_Y: 20
        },
        PEGGING_AREA: {
            WIDTH: 450,
            HEIGHT: 160,
            LABEL_Y: -90
        },
        CRIB: {
            WIDTH: 240,
            HEIGHT: 180,
            LABEL_Y: -120
        },
        ACTION_BUTTONS: {
            WIDTH: 420,
            HEIGHT: 60
        },
        SORT_WIDGET: {
            WIDTH: 300,
            HEIGHT: 60,
            BUTTON_WIDTH: 65,
            BUTTON_HEIGHT: 40
        },
        EXIT_BUTTON: {
            WIDTH: 200,
            HEIGHT: 50
        }
    },
    ZONES: {
        TOP_HUD_HEIGHT: 90,
        OPPONENT_HEIGHT_PERCENT: 0.18,
        CENTER_HEIGHT_PERCENT: 0.32,
        CONTROLS_HEIGHT_PERCENT: 0.12,
        PLAYER_HEIGHT_PERCENT: 0.28
    },
    LAYOUT: {
        EXIT_MARGIN: 40,
        STARTING_CUT_MARGIN: 100,
        PEGGING_AREA_OFFSET_Y: 0,
        STARTING_CUT_Y_OFFSET: 120,
        BOT_REVEAL_Y: 150,
        HUMAN_REVEAL_OFFSET_Y: -280,
        PEGGING_GO_Y_OFFSET: -150,
        HUMAN_SCORE_Y_OFFSET: -200,
        BOT_SCORE_Y_OFFSET: 200
    }
};
