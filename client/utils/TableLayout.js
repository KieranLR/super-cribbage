import { layoutConfigManager } from './layout/LayoutConfigManager.js';
import { getAnchors, resolveAnchor, resolveInZone } from './layout/anchors.js';
import { deriveLegacyConfig } from './LegacyTableLayoutAdapter.js';

export const LayoutSize = {
    MOBILE_PORTRAIT: 'MobilePortrait',
    MOBILE_LANDSCAPE: 'MobileLandscape',
    TABLET_PORTRAIT: 'TabletPortrait',
    TABLET_LANDSCAPE: 'TabletLandscape',
    DESKTOP: 'Desktop'
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
        const { width, height } = this.scale;
        this.context = this.createLayoutContext(width, height);
        this.size = this.getScreenSize(width, height);
        this.preset = layoutConfigManager.getPresets()[this.size];
        
        // Legacy compatibility: some components might expect this.config
        this.config = this.deriveConfig();
    }

    /**
     * Creates a layout context with computed rules.
     */
    createLayoutContext(width, height) {
        const isPortrait = height > width;
        const shortSide = Math.min(width, height);
        const longSide = Math.max(width, height);
        
        return {
            width,
            height,
            isPortrait,
            shortSide,
            longSide,
            scale: Math.max(0.6, Math.min(1, shortSide / 900)),
            pad: Math.max(16, shortSide * 0.04)
        };
    }

    /**
     * Derives a legacy-style config object from tokens, presets, and context.
     * @deprecated Use getPositions() and presets directly
     */
    deriveConfig() {
        return deriveLegacyConfig(this.context, this.preset);
    }

    /**
     * Determines the screen size and orientation category.
     */
    getScreenSize(width, height) {
        const isLandscape = width > height;
        const maxDim = Math.max(width, height);

        if (maxDim < 900 || height < 600 || width < 500) {
            return isLandscape ? LayoutSize.MOBILE_LANDSCAPE : LayoutSize.MOBILE_PORTRAIT;
        } else if (maxDim < 1200) {
            return isLandscape ? LayoutSize.TABLET_LANDSCAPE : LayoutSize.TABLET_PORTRAIT;
        } else {
            return LayoutSize.DESKTOP;
        }
    }

    /**
     * Gets all calculated positions for the current scale and size.
     */
    getPositions() {
        const ctx = this.context;
        const anchors = getAnchors(ctx);
        const preset = this.preset;
        const zones = this.getZones();
        const tokens = layoutConfigManager.getTokens();

        // Helper to resolve either from zone or anchor
        const resolve = (def) => {
            if (def.zone) {
                return resolveInZone(zones, def.zone, def.xAlign, def.yAlign, def.offsetX, def.offsetY);
            }
            return resolveAnchor(anchors, def.anchor, def.offsetX, def.offsetY);
        };

        return {
            background: resolveAnchor(anchors, 'center'),
            playerHand: resolve(preset.playerHand),
            botHand: resolve(preset.botHand),
            peggingArea: resolve(preset.peggingArea),
            cribCenter: resolve(preset.crib),
            cribParked: resolveAnchor(anchors, preset.crib.parkedAnchor, preset.crib.parkedOffsetX, preset.crib.parkedOffsetY),
            starterCard: resolve(preset.starterCard),
            scoreboard: resolve(preset.scoreboard),
            phaseIndicator: resolve(preset.phaseIndicator),
            actionButtons: resolve(preset.actionButtons),
            sortWidget: preset.sortWidget ? resolve(preset.sortWidget) : { x: ctx.width / 2, y: ctx.height - 50 },
            exitButton: preset.exitButton 
                ? resolveAnchor(anchors, preset.exitButton.anchor, preset.exitButton.offsetX, preset.exitButton.offsetY)
                : resolveAnchor(anchors, 'topRight', -tokens.PANEL.EXIT_BUTTON.WIDTH / 2 - tokens.LAYOUT.EXIT_MARGIN, tokens.LAYOUT.EXIT_MARGIN + tokens.PANEL.EXIT_BUTTON.HEIGHT / 2),
            deck: resolve(preset.deck),
            
            // Starting Cut Phase
            startingCut: {
                startX: preset.startingCutMargin !== undefined ? preset.startingCutMargin : tokens.LAYOUT.STARTING_CUT_MARGIN,
                endX: ctx.width - (preset.startingCutMargin !== undefined ? preset.startingCutMargin : tokens.LAYOUT.STARTING_CUT_MARGIN),
                y: ctx.height / 2 + tokens.LAYOUT.STARTING_CUT_Y_OFFSET,
                botRevealY: tokens.LAYOUT.BOT_REVEAL_Y,
                humanRevealY: ctx.height + tokens.LAYOUT.HUMAN_REVEAL_OFFSET_Y
            },
            zones
        };
    }

    /**
     * Computes zone rectangles for the screen.
     */
    getZones() {
        const { width, height } = this.context;
        const z = layoutConfigManager.getTokens().ZONES;

        const topHudHeight = z.TOP_HUD_HEIGHT;
        const opponentHeight = height * z.OPPONENT_HEIGHT_PERCENT;
        const centerHeight = height * z.CENTER_HEIGHT_PERCENT;
        const controlsHeight = height * z.CONTROLS_HEIGHT_PERCENT;
        const playerHeight = height * z.PLAYER_HEIGHT_PERCENT;

        return {
            topHud: { x: 0, y: 0, width, height: topHudHeight },
            opponent: { x: 0, y: topHudHeight, width, height: opponentHeight },
            center: { x: 0, y: topHudHeight + opponentHeight, width, height: centerHeight },
            controls: { x: 0, y: topHudHeight + opponentHeight + centerHeight, width, height: controlsHeight },
            player: { x: 0, y: topHudHeight + opponentHeight + centerHeight + controlsHeight, width, height: playerHeight }
        };
    }

    /**
     * Gets the target position for the crib based on the current game phase.
     */
    getCribPosition(phase, PHASES) {
        const pos = this.getPositions();
        const isParked = (phase === PHASES?.PEGGING || phase === PHASES?.CUTTING || phase === PHASES?.DEALING);
        return isParked ? pos.cribParked : pos.cribCenter;
    }

    /**
     * Gets specific configuration for a given layout size.
     * Merges default REL with layout-specific overrides.
     * @param {string} size 
     * @deprecated Use preset system instead
     */
    getConfigForSize(size) {
        // Compatibility shim for tests
        const oldSize = this.size;
        this.size = size;
        this.preset = layoutConfigManager.getPresets()[size] || layoutConfigManager.getPresets().Desktop;
        const config = this.deriveConfig();
        // Restore
        this.size = oldSize;
        this.preset = layoutConfigManager.getPresets()[oldSize];
        return config;
    }

    /**
     * Gets coordinates for floating text based on the player.
     */
    getFloatingTextPosition(isHuman) {
        const { width, height } = this.context;
        const config = this.config.FLOATING_TEXT;
        return {
            x: width / 2,
            y: isHuman ? height + config.HUMAN_SCORE_Y_OFFSET : config.BOT_SCORE_Y_OFFSET
        };
    }

    getSnapshot(phase = null, PHASES = null) {
        const positions = this.getPositions();
        const zones = positions.zones;

        const crib = (phase && PHASES)
            ? this.getCribPosition(phase, PHASES)
            : positions.cribCenter;

        return {
            size: this.size,
            context: this.context,
            preset: this.preset,
            zones,
            slots: {
                background: positions.background,
                playerHand: positions.playerHand,
                botHand: positions.botHand,
                peggingArea: positions.peggingArea,
                crib,
                cribCenter: positions.cribCenter,
                cribParked: positions.cribParked,
                starterCard: positions.starterCard,
                scoreboard: positions.scoreboard,
                phaseIndicator: positions.phaseIndicator,
                actionButtons: positions.actionButtons,
                sortWidget: positions.sortWidget,
                exitButton: positions.exitButton,
                deck: positions.deck,
                startingCut: positions.startingCut
            },
            styles: {
                hand: {
                    cardScale: this.preset.cardScale ?? this.context.scale
                },
                peggingArea: {
                    ...this.config?.PEGGING_AREA,
                    CARD_SCALE: this.preset.cardScale ?? this.context.scale
                },
                crib: {
                    ...this.config?.CRIB,
                    CARD_SCALE: this.preset.cardScale ?? this.context.scale
                },
                starterCard: {
                    ...this.config?.STARTER_CARD,
                    CARD_SCALE: this.preset.cardScale ?? this.context.scale
                },
                scoreboard: this.config?.SCOREBOARD,
                phaseIndicator: this.config?.PHASE_INDICATOR,
                actionButtons: this.config?.ACTION_BUTTONS,
                sortWidget: this.config?.SORT_WIDGET,
                exitButton: this.config?.EXIT_BUTTON,
                deck: {
                    ...this.config?.DECK,
                    cardScale: this.preset.cardScale ?? this.context.scale
                }
            }
        };
    }
}
