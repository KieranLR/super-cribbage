import { TableLayout, LayoutSize } from '../../utils/TableLayout';

describe('TableLayout Card Scale Propagation', () => {
    test('should propagate cardScale from presets to all component styles', () => {
        const scale = { width: 1200, height: 800 }; // Desktop
        const layout = new TableLayout(scale);
        const snapshot = layout.getSnapshot();
        
        // Desktop preset has cardScale: 1.0
        expect(snapshot.styles.hand.cardScale).toBe(1.0);
        expect(snapshot.styles.peggingArea.CARD_SCALE).toBe(1.0);
        expect(snapshot.styles.crib.CARD_SCALE).toBe(1.0);
        expect(snapshot.styles.starterCard.CARD_SCALE).toBe(1.0);
        expect(snapshot.styles.deck.cardScale).toBe(1.0);
    });

    test('should propagate cardScale for mobile layouts', () => {
        const scale = { width: 360, height: 640 }; // Mobile Portrait
        const layout = new TableLayout(scale);
        const snapshot = layout.getSnapshot();
        
        // MobilePortrait preset has cardScale: 0.7
        expect(snapshot.styles.hand.cardScale).toBe(0.7);
        expect(snapshot.styles.peggingArea.CARD_SCALE).toBe(0.7);
        expect(snapshot.styles.crib.CARD_SCALE).toBe(0.7);
        expect(snapshot.styles.starterCard.CARD_SCALE).toBe(0.7);
        expect(snapshot.styles.deck.cardScale).toBe(0.7);
    });

    test('should include CARD_SCALE in legacy config sub-objects', () => {
        const scale = { width: 1200, height: 800 };
        const layout = new TableLayout(scale);
        const config = layout.config;

        expect(config.PEGGING_AREA.CARD_SCALE).toBeDefined();
        expect(config.CRIB.CARD_SCALE).toBeDefined();
        expect(config.STARTER_CARD.CARD_SCALE).toBeDefined();
        
        expect(config.PEGGING_AREA.CARD_SCALE).toBe(1.0);
        expect(config.CRIB.CARD_SCALE).toBe(1.0);
        expect(config.STARTER_CARD.CARD_SCALE).toBe(1.0);
    });
});
