/**
 * Normalized layout schema definitions and validation/default helpers.
 */

export const ANCHORS = {
    TOP_LEFT: 'topLeft',
    TOP_CENTER: 'topCenter',
    TOP_RIGHT: 'topRight',
    CENTER_LEFT: 'centerLeft',
    CENTER: 'center',
    CENTER_RIGHT: 'centerRight',
    BOTTOM_LEFT: 'bottomLeft',
    BOTTOM_CENTER: 'bottomCenter',
    BOTTOM_RIGHT: 'bottomRight'
};

export const VALUE_MODES = {
    PIXELS: 'px',
    PERCENT: 'percent'
};

export const BREAKPOINTS = {
    DESKTOP: 'desktop',
    TABLET: 'tablet',
    MOBILE: 'mobile'
};

export const createDefaultObjectLayout = () => ({
    anchor: ANCHORS.CENTER,
    x: { mode: VALUE_MODES.PERCENT, value: 0.5 },
    y: { mode: VALUE_MODES.PERCENT, value: 0.5 },
    offsetX: 0,
    offsetY: 0,
    scale: 1,
    visible: true,
    breakpoints: {}
});
