import { TOKENS } from './layout/tokens.js';

/**
 * Isolates legacy-style config object derivation for compatibility.
 */
export function deriveLegacyConfig(context, preset) {
    const ctx = context;
    
    // Base config merged with preset-specific values
    return {
        CARD_SCALE: preset.cardScale || ctx.scale,
        // Approximate mappings for legacy fields that might still be used
        PLAYER_HAND_Y: preset.playerHand.offsetY || 170, 
        BOT_HAND_Y: preset.botHand.offsetY || 100,
        PEGGING_AREA_Y_OFFSET: TOKENS.LAYOUT.PEGGING_AREA_OFFSET_Y, 
        CRIB_AREA_Y_OFFSET: preset.crib.offsetY,
        CRIB_PARKED_X_OFFSET: Math.abs(preset.crib.parkedOffsetX),
        STARTER_CARD_X: preset.starterCard.offsetX,
        SCOREBOARD_X: preset.scoreboard.offsetX,
        SCOREBOARD_Y: preset.scoreboard.offsetY,
        PHASE_INDICATOR_Y: preset.phaseIndicator.offsetY,
        ACTION_BUTTONS_Y_OFFSET: preset.actionButtons.offsetY,
        STARTING_CUT_MARGIN: TOKENS.LAYOUT.STARTING_CUT_MARGIN,
        BOT_REVEAL_Y: TOKENS.LAYOUT.BOT_REVEAL_Y,
        HUMAN_REVEAL_Y: TOKENS.LAYOUT.HUMAN_REVEAL_OFFSET_Y,
        SORT_WIDGET_Y_OFFSET: preset.sortWidget ? Math.abs(preset.sortWidget.offsetY) : 50,
        STARTING_CUT_Y_OFFSET: TOKENS.LAYOUT.STARTING_CUT_Y_OFFSET,

        SCOREBOARD: {
            ...TOKENS.PANEL.SCOREBOARD,
            ...preset.scoreboardSize,
            TEXT_X_OFFSET: -100,
            ROW_SPACING: (preset.scoreboardSize?.HEIGHT || TOKENS.PANEL.SCOREBOARD.HEIGHT) / 2.5,
            ROW_Y_START: -(preset.scoreboardSize?.HEIGHT || TOKENS.PANEL.SCOREBOARD.HEIGHT) / 5
        },
        PHASE_INDICATOR: {
            ...TOKENS.PANEL.PHASE_INDICATOR,
            ...preset.phaseIndicatorSize,
            PHASE_Y: -15,
            INSTRUCTION_Y: 20
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
            LABEL_Y: -50,
            SPREAD_SPACING: 40,
            STACK_SPACING: 2
        },
        STARTER_CARD: {
            WIDTH: 100,
            HEIGHT: 140,
            LABEL_Y: -90
        },
        DECK: {
            X: preset.deck.offsetX,
            Y_OFFSET: preset.deck.offsetY
        },
        ACTION_BUTTONS: {
            ...TOKENS.PANEL.ACTION_BUTTONS,
            ...preset.actionButtonsSize
        },
        SORT_WIDGET: {
            ...TOKENS.PANEL.SORT_WIDGET,
            ...preset.sortWidgetSize
        },
        EXIT_BUTTON: {
            ...TOKENS.PANEL.EXIT_BUTTON,
            MARGIN: TOKENS.LAYOUT.EXIT_MARGIN
        },
        FLOATING_TEXT: {
            PEGGING_GO_Y_OFFSET: -150,
            HUMAN_SCORE_Y_OFFSET: -200,
            BOT_SCORE_Y_OFFSET: 200
        }
    };
}
