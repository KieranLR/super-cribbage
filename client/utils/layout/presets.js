import { TOKENS } from './tokens.js';

/**
 * Mobile Portrait Layout Rules
 */
export const mobilePortrait = {
    playerHand: { zone: 'player', xAlign: 0.5, yAlign: 0.35, offsetX: 0, offsetY: 0 },
    botHand: { zone: 'opponent', xAlign: 0.5, yAlign: 0.0, offsetX: 0, offsetY: -30 },
    peggingArea: { zone: 'center', xAlign: 0.5, yAlign: 0.35, offsetX: 0, offsetY: TOKENS.LAYOUT.PEGGING_AREA_OFFSET_Y },
    crib: {
        zone: 'center', xAlign: 0.5, yAlign: 0.9, offsetX: 0, offsetY: 0,
        parkedAnchor: 'rightCenter', parkedOffsetX: -90, parkedOffsetY: 100
    },
    scoreboard: { anchor: 'topLeft', offsetX: 75, offsetY: 30 },
    phaseIndicator: { anchor: 'topCenter', offsetX: 0, offsetY: 120 },
    actionButtons: { anchor: 'bottomCenter', offsetX: 0, offsetY: -160 },
    starterCard: { anchor: 'leftCenter', offsetX: 110, offsetY: 0 },
    deck: { anchor: 'leftCenter', offsetX: 35, offsetY: 100 },
    sortWidget: { anchor: 'bottomCenter', offsetX: 0, offsetY: -15 },
    sortWidgetSize: { WIDTH: 240, HEIGHT: 50, BUTTON_WIDTH: 55, BUTTON_HEIGHT: 35 },
    cribSize: { WIDTH: 200, HEIGHT: 120, LABEL_Y: -75 },
    exitButton: { anchor: 'topRight', offsetX: -70, offsetY: 15 },
    cardScale: 0.7,
    startingCutMargin: 40,
    scoreboardSize: { WIDTH: 160, HEIGHT: 70 },
    phaseIndicatorSize: { WIDTH: 270, HEIGHT: 80 }
};

/**
 * Mobile Landscape Layout Rules
 */
export const mobileLandscape = {
    playerHand: { zone: 'player', xAlign: 0.5, yAlign: 0.8, offsetX: 0, offsetY: -100 },
    botHand: { zone: 'opponent', xAlign: 0.5, yAlign: 0.0, offsetX: 0, offsetY: -30 },
    peggingArea: { zone: 'center', xAlign: 0.5, yAlign: 0.35, offsetX: 0, offsetY: TOKENS.LAYOUT.PEGGING_AREA_OFFSET_Y },
    crib: {
        zone: 'center', xAlign: 0.5, yAlign: 0.4, offsetX: 0, offsetY: 0,
        parkedAnchor: 'rightCenter', parkedOffsetX: -120, parkedOffsetY: 60
    },
    scoreboard: { anchor: 'topLeft', offsetX: 75, offsetY: 40 },
    phaseIndicator: { anchor: 'topCenter', offsetX: 0, offsetY: 35 },
    actionButtons: { anchor: 'bottomCenter', offsetX: 0, offsetY: -140 },
    starterCard: { anchor: 'leftCenter', offsetX: 110, offsetY: 0 },
    deck: { anchor: 'leftCenter', offsetX: 80, offsetY: 60 },
    sortWidget: { anchor: 'bottomCenter', offsetX: 0, offsetY: -15 },
    sortWidgetSize: { WIDTH: 240, HEIGHT: 50, BUTTON_WIDTH: 55, BUTTON_HEIGHT: 35 },
    cribSize: { WIDTH: 200, HEIGHT: 120, LABEL_Y: -75 },
    exitButton: { anchor: 'topRight', offsetX: -70, offsetY: 30 },
    cardScale: 0.6,
    startingCutMargin: 50,
    scoreboardSize: { WIDTH: 160, HEIGHT: 70 },
    phaseIndicatorSize: { WIDTH: 270, HEIGHT: 80 }
};

/**
 * Desktop Layout Rules (Standard)
 */
export const desktop = {
    playerHand: { zone: 'player', xAlign: 0.5, yAlign: 0.4, offsetX: 0, offsetY: 0 },
    botHand: { zone: 'opponent', xAlign: 0.5, yAlign: 0, offsetX: 0, offsetY: 0 },
    peggingArea: { zone: 'center', xAlign: 0.5, yAlign: 0.5, offsetX: 0, offsetY: TOKENS.LAYOUT.PEGGING_AREA_OFFSET_Y },
    crib: {
        zone: 'center', xAlign: 0.5, yAlign: 0.37, offsetX: 0, offsetY: 60,
        parkedAnchor: 'rightCenter', parkedOffsetX: -170, parkedOffsetY: 60
    },
    cribSize: { WIDTH: 240, HEIGHT: 180, LABEL_Y: -100 },
    scoreboard: { anchor: 'topLeft', offsetX: 90, offsetY: 45 },
    phaseIndicator: { anchor: 'topCenter', offsetX: 0, offsetY: 100 },
    actionButtons: { anchor: 'bottomCenter', offsetX: 0, offsetY: -240 },
    starterCard: { anchor: 'leftCenter', offsetX: 180, offsetY: 0 },
    deck: { anchor: 'leftCenter', offsetX: 180, offsetY: 60 },
    sortWidget: { anchor: 'bottomCenter', yAlign: 0.3, offsetX: 0, offsetY: -15 },
    sortWidgetSize: TOKENS.PANEL.SORT_WIDGET,
    cardScale: 1.0,
    exitButton: { anchor: 'topRight', offsetX: -70, offsetY: 30 },
    scoreboardSize: TOKENS.PANEL.SCOREBOARD,
    phaseIndicatorSize: TOKENS.PANEL.PHASE_INDICATOR
};

export const tabletPortrait = {
    ...desktop,
    phaseIndicator: { anchor: 'topCenter', offsetX: 0, offsetY: 150 },
}

export const tabletLandscape = {
    ...desktop,
}

export const PRESETS = {
    MobilePortrait: mobilePortrait,
    MobileLandscape: mobileLandscape,
    TabletPortrait: tabletPortrait,
    TabletLandscape: tabletLandscape,
    Desktop: desktop
};
