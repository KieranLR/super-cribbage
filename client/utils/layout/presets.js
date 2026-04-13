import { TOKENS } from './tokens.js';

/**
 * Mobile Portrait Layout Rules
 */
export const mobilePortrait = {
    playerHand: { zone: 'player', xAlign: 0.5, yAlign: 0.4, offsetX: 0, offsetY: 0 },
    botHand: { zone: 'opponent', xAlign: 0.5, yAlign: 0.45, offsetX: 0, offsetY: 0 },
    peggingArea: { zone: 'center', xAlign: 0.5, yAlign: 0.35, offsetX: 0, offsetY: TOKENS.LAYOUT.PEGGING_AREA_OFFSET_Y },
    crib: {
        zone: 'center', xAlign: 0.5, yAlign: 0.75, offsetX: 0, offsetY: 60,
        parkedAnchor: 'rightCenter', parkedOffsetX: -90, parkedOffsetY: 60
    },
    scoreboard: { anchor: 'topLeft', offsetX: 95, offsetY: 45 },
    phaseIndicator: { anchor: 'topCenter', offsetX: 0, offsetY: 160 },
    actionButtons: { anchor: 'bottomCenter', offsetX: 0, offsetY: -160 },
    starterCard: { anchor: 'leftCenter', offsetX: 110, offsetY: 0 },
    deck: { anchor: 'leftCenter', offsetX: 55, offsetY: 0 },
    sortWidget: { anchor: 'bottomCenter', offsetX: 0, offsetY: -35 },
    cardScale: 0.7,
    scoreboardSize: { WIDTH: 170, HEIGHT: 75 },
    phaseIndicatorSize: { WIDTH: 280, HEIGHT: 55 }
};

/**
 * Mobile Landscape Layout Rules
 */
export const mobileLandscape = {
    playerHand: { zone: 'player', xAlign: 0.5, yAlign: 0.4, offsetX: 0, offsetY: 0 },
    botHand: { zone: 'opponent', xAlign: 0.5, yAlign: 0.45, offsetX: 0, offsetY: 0 },
    peggingArea: { zone: 'center', xAlign: 0.5, yAlign: 0.35, offsetX: 0, offsetY: TOKENS.LAYOUT.PEGGING_AREA_OFFSET_Y },
    crib: {
        zone: 'center', xAlign: 0.5, yAlign: 0.75, offsetX: 0, offsetY: 60,
        parkedAnchor: 'rightCenter', parkedOffsetX: -150, parkedOffsetY: 60
    },
    scoreboard: { anchor: 'topLeft', offsetX: 95, offsetY: 40 },
    phaseIndicator: { anchor: 'topCenter', offsetX: 0, offsetY: 130 },
    actionButtons: { anchor: 'bottomCenter', offsetX: 0, offsetY: -140 },
    starterCard: { anchor: 'leftCenter', offsetX: 110, offsetY: 0 },
    deck: { anchor: 'leftCenter', offsetX: 45, offsetY: 0 },
    cardScale: 0.6,
    scoreboardSize: { WIDTH: 170, HEIGHT: 65 },
    phaseIndicatorSize: { WIDTH: 260, HEIGHT: 45 }
};

/**
 * Desktop Layout Rules (Standard)
 */
export const desktop = {
    playerHand: { zone: 'player', xAlign: 0.5, yAlign: 0.4, offsetX: 0, offsetY: 0 },
    botHand: { zone: 'opponent', xAlign: 0.5, yAlign: 0.45, offsetX: 0, offsetY: 0 },
    peggingArea: { zone: 'center', xAlign: 0.5, yAlign: 0.35, offsetX: 0, offsetY: TOKENS.LAYOUT.PEGGING_AREA_OFFSET_Y },
    crib: {
        zone: 'center', xAlign: 0.5, yAlign: 0.75, offsetX: 0, offsetY: 60,
        parkedAnchor: 'rightCenter', parkedOffsetX: -150, parkedOffsetY: 60
    },
    scoreboard: { anchor: 'topLeft', offsetX: 120, offsetY: 60 },
    phaseIndicator: { anchor: 'topCenter', offsetX: 0, offsetY: 170 },
    actionButtons: { anchor: 'bottomCenter', offsetX: 0, offsetY: -240 },
    starterCard: { anchor: 'leftCenter', offsetX: 180, offsetY: 0 },
    deck: { anchor: 'leftCenter', offsetX: 80, offsetY: 0 },
    sortWidget: { anchor: 'bottomCenter', offsetX: 0, offsetY: -50 },
    cardScale: 1.0,
    scoreboardSize: TOKENS.PANEL.SCOREBOARD,
    phaseIndicatorSize: TOKENS.PANEL.PHASE_INDICATOR
};

export const PRESETS = {
    MobilePortrait: mobilePortrait,
    MobileLandscape: mobileLandscape,
    TabletPortrait: { ...desktop, scoreboard: { anchor: 'topLeft', offsetX: 130, offsetY: 60 } },
    TabletLandscape: { ...desktop, scoreboard: { anchor: 'topLeft', offsetX: 150, offsetY: 60 } },
    Desktop: desktop
};
