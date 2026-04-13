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
        MAX_SCALE: 1.0
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
            HEIGHT: 80
        },
        PHASE_INDICATOR: {
            WIDTH: 400,
            HEIGHT: 80
        },
        ACTION_BUTTONS: {
            WIDTH: 420,
            HEIGHT: 60
        },
        SORT_WIDGET: {
            WIDTH: 340,
            HEIGHT: 70
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
        PEGGING_AREA_OFFSET_Y: -40,
        STARTING_CUT_Y_OFFSET: 120,
        BOT_REVEAL_Y: 280,
        HUMAN_REVEAL_OFFSET_Y: -220
    }
};
