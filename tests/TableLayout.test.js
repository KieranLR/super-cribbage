import { TableLayout, LayoutSize } from '../client/utils/TableLayout';

describe('TableLayout', () => {
    describe('getScreenSize', () => {
        test('should identify Mobile Portrait', () => {
            const layout = new TableLayout({ width: 360, height: 640 });
            expect(layout.getScreenSize(360, 640)).toBe(LayoutSize.MOBILE_PORTRAIT);
            expect(layout.getScreenSize(800, 899)).toBe(LayoutSize.MOBILE_PORTRAIT);
        });

        test('should identify Mobile Landscape', () => {
            const layout = new TableLayout({ width: 640, height: 360 });
            expect(layout.getScreenSize(640, 360)).toBe(LayoutSize.MOBILE_LANDSCAPE);
            expect(layout.getScreenSize(899, 800)).toBe(LayoutSize.MOBILE_LANDSCAPE);
        });

        test('should identify Tablet Portrait', () => {
            const layout = new TableLayout({ width: 900, height: 1100 });
            expect(layout.getScreenSize(900, 1100)).toBe(LayoutSize.TABLET_PORTRAIT);
            expect(layout.getScreenSize(1000, 1199)).toBe(LayoutSize.TABLET_PORTRAIT);
        });

        test('should identify Tablet Landscape', () => {
            const layout = new TableLayout({ width: 1100, height: 900 });
            expect(layout.getScreenSize(1100, 900)).toBe(LayoutSize.TABLET_LANDSCAPE);
            expect(layout.getScreenSize(1199, 1000)).toBe(LayoutSize.TABLET_LANDSCAPE);
        });

        test('should identify Desktop', () => {
            const layout = new TableLayout({ width: 1200, height: 800 });
            expect(layout.getScreenSize(1200, 800)).toBe(LayoutSize.DESKTOP);
            expect(layout.getScreenSize(1920, 1080)).toBe(LayoutSize.DESKTOP);
            expect(layout.getScreenSize(800, 1200)).toBe(LayoutSize.DESKTOP);
        });
    });

    describe('getConfigForSize', () => {
        test('should return default REL when no overrides', () => {
            const layout = new TableLayout({ width: 1200, height: 800 });
            const config = layout.getConfigForSize(LayoutSize.DESKTOP);
            expect(config.PLAYER_HAND_Y).toBe(170);
            expect(config.SCOREBOARD.WIDTH).toBe(220);
        });

        test('should apply default config from REL', () => {
            const layout = new TableLayout({ width: 1200, height: 800 });
            expect(layout.config.PLAYER_HAND_Y).toBe(170);
            expect(layout.config.SCOREBOARD.WIDTH).toBe(220);
        });
    });

    describe('getPositions', () => {
        test('should return positions based on scale', () => {
            const scale = { width: 800, height: 600 };
            const layout = new TableLayout(scale);
            const positions = layout.getPositions();

            // context.pad = Math.max(16, 600 * 0.04) = 24
            // 800x600 => maxDim 800 => isLandscape true => MOBILE_LANDSCAPE.
            
            // Expected values for 800x600 MOBILE_LANDSCAPE:
            // topHud: height 90
            // opponent: height 600 * 0.18 = 108, y = 90
            // center: height 600 * 0.32 = 192, y = 90 + 108 = 198
            // controls: height 600 * 0.12 = 72, y = 198 + 192 = 390
            // player: height 600 * 0.28 = 168, y = 390 + 72 = 462

            // playerHand (zone: player, xAlign: 0.5, yAlign: 0.4):
            // x = 400, y = 462 + 168 * 0.4 = 462 + 67.2 = 529.2
            
            // botHand (zone: opponent, xAlign: 0.5, yAlign: 0.45):
            // x = 400, y = 90 + 108 * 0.45 = 90 + 48.6 = 138.6

            expect(positions.background).toEqual({ x: 400, y: 300 });
            expect(positions.playerHand.y).toBeCloseTo(529.2);
            expect(positions.botHand.y).toBeCloseTo(138.6);
        });
    });
});
