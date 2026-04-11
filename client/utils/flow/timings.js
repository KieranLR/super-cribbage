import { settingsManager } from '../SettingsManager.js';

/**
 * Centralized timing and duration constants for the game.
 * Used for animations, bot thinking delays, and phase transitions.
 */
const NORMAL_TIMINGS = {
    // Bot decision delays
    BOT: {
        STARTING_CUT: 1000,
        DISCARDING: 1000,
        PEGGING: 1500,
        PEGGING_NEW_CYCLE: 2000,
    },

    // Phase transition delays
    PHASE_TRANSITIONS: {
        STARTING_CUT_TIE_UI: 1500,
        FIRST_DEALER_DETERMINED: 2000,
        CARDS_DEALT: 1000,
        PEGGING_COMPLETE: 1500,
        GAME_OVER: 3000,
        CUT_FOR_DEALER_UI: 1500,
    },

    // UI Feedback & Animations
    UI: {
        STARTING_CUT_LOCK: 500,
        FLOATING_TEXT: 1500,
        PHASE_INDICATOR_DELAY: 500,
        CARD_CLICK_LOCK: 100,
    },

    // Animation Durations
    ANIMATIONS: {
        CARD_MOVE_DEFAULT: 300,
        CARD_FLIP: 150,
        CARD_HOVER: 100,
        CARD_SELECTION: 200,
        PEGGING_CARD_MOVE: 400,
        DISCARD_MOVE: 600,
        PEGGING_UI_MOVE: 500,
        GENERIC_FADE: 500,
        GENERIC_MOVE: 200,
        DECK_FAN_DURATION: 600,
        DECK_FAN_DELAY: 750,
        SCOREBOARD_UPDATE: 2000,
        DEAL_INTERVAL: 150
    }
};

const FAST_TIMINGS = {
    // Bot decision delays
    BOT: {
        STARTING_CUT: 400,
        DISCARDING: 400,
        PEGGING: 500,
        PEGGING_NEW_CYCLE: 700,
    },

    // Phase transition delays
    PHASE_TRANSITIONS: {
        STARTING_CUT_TIE_UI: 600,
        FIRST_DEALER_DETERMINED: 800,
        CARDS_DEALT: 400,
        PEGGING_COMPLETE: 600,
        GAME_OVER: 1500,
        CUT_FOR_DEALER_UI: 600,
    },

    // UI Feedback & Animations
    UI: {
        STARTING_CUT_LOCK: 200,
        FLOATING_TEXT: 700,
        PHASE_INDICATOR_DELAY: 200,
        CARD_CLICK_LOCK: 50,
    },

    // Animation Durations
    ANIMATIONS: {
        CARD_MOVE_DEFAULT: 150,
        CARD_FLIP: 75,
        CARD_HOVER: 50,
        CARD_SELECTION: 100,
        PEGGING_CARD_MOVE: 200,
        DISCARD_MOVE: 250,
        PEGGING_UI_MOVE: 250,
        GENERIC_FADE: 200,
        GENERIC_MOVE: 100,
        DECK_FAN_DURATION: 300,
        DECK_FAN_DELAY: 250,
        SCOREBOARD_UPDATE: 800,
    }
};

/**
 * Proxy that returns values from either NORMAL_TIMINGS or FAST_TIMINGS
 * based on the current value of the 'fastMode' setting in settingsManager.
 */
export const TIMINGS = new Proxy({}, {
    get(target, prop) {
        const isFast = settingsManager.get('fastMode');
        const source = isFast ? FAST_TIMINGS : NORMAL_TIMINGS;
        return source[prop];
    }
});
