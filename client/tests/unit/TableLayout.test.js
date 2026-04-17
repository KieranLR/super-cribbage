import { TableLayout, LayoutSize } from '../../utils/TableLayout';

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

            expect(positions.background).toEqual({ x: 400, y: 300 });
        });

        test('should use custom startingCutMargin from preset if available', () => {
            const layout = new TableLayout({ width: 360, height: 640 }); // Mobile Portrait
            const positions = layout.getPositions();
            
            // Mobile Portrait has startingCutMargin: 40
            expect(positions.startingCut.startX).toBe(40);
            expect(positions.startingCut.endX).toBe(320); // 360 - 40
        });

        test('should use default startingCutMargin if not in preset', () => {
            const layout = new TableLayout({ width: 1200, height: 800 }); // Desktop
            const positions = layout.getPositions();
            
            // Desktop (standard) doesn't have startingCutMargin, should use default 100
            expect(positions.startingCut.startX).toBe(100);
            expect(positions.startingCut.endX).toBe(1100); // 1200 - 100
        });
    });
});
