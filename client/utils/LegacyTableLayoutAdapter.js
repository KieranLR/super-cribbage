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
            TEXT_X_OFFSET: TOKENS.PANEL.SCOREBOARD.TEXT_X_OFFSET,
            ROW_SPACING: (preset.scoreboardSize?.HEIGHT || TOKENS.PANEL.SCOREBOARD.HEIGHT) / TOKENS.PANEL.SCOREBOARD.ROW_SPACING_RATIO,
            ROW_Y_START: -(preset.scoreboardSize?.HEIGHT || TOKENS.PANEL.SCOREBOARD.HEIGHT) / TOKENS.PANEL.SCOREBOARD.ROW_Y_START_RATIO
        },
        PHASE_INDICATOR: {
            ...TOKENS.PANEL.PHASE_INDICATOR,
            ...preset.phaseIndicatorSize,
            PHASE_Y: TOKENS.PANEL.PHASE_INDICATOR.PHASE_Y,
            INSTRUCTION_Y: TOKENS.PANEL.PHASE_INDICATOR.INSTRUCTION_Y
        },
        PEGGING_AREA: {
            WIDTH: TOKENS.PANEL.PEGGING_AREA.WIDTH,
            HEIGHT: TOKENS.PANEL.PEGGING_AREA.HEIGHT,
            CARD_SPACING: TOKENS.SPACING.PEGGING_CARD,
            LABEL_Y: TOKENS.PANEL.PEGGING_AREA.LABEL_Y,
            CARD_SCALE: preset.cardScale || ctx.scale
        },
        CRIB: {
            ...TOKENS.PANEL.CRIB,
            ...preset.cribSize,
            SPREAD_SPACING: TOKENS.SPACING.CARD_SPREAD,
            STACK_SPACING: TOKENS.SPACING.CARD_STACK,
            CRIB_AREA_Y_OFFSET: preset.crib.offsetY,
            CRIB_PARKED_X_OFFSET: Math.abs(preset.crib.parkedOffsetX),
            CARD_SCALE: preset.cardScale || ctx.scale
        },
        STARTER_CARD: {
            WIDTH: TOKENS.CARD.WIDTH,
            HEIGHT: TOKENS.CARD.HEIGHT,
            LABEL_Y: TOKENS.CARD.LABEL_Y,
            CARD_SCALE: preset.cardScale || ctx.scale
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
            ...preset.sortWidget,
            ...preset.sortWidgetSize,
            ...preset.sortWidgetButtonSize,
        },
        EXIT_BUTTON: {
            ...TOKENS.PANEL.EXIT_BUTTON,
            MARGIN: TOKENS.LAYOUT.EXIT_MARGIN
        },
        FLOATING_TEXT: {
            PEGGING_GO_Y_OFFSET: TOKENS.LAYOUT.PEGGING_GO_Y_OFFSET,
            HUMAN_SCORE_Y_OFFSET: TOKENS.LAYOUT.HUMAN_SCORE_Y_OFFSET,
            BOT_SCORE_Y_OFFSET: TOKENS.LAYOUT.BOT_SCORE_Y_OFFSET
        }
    };
}
