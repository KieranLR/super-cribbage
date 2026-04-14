import { TableLayout } from '../../utils/TableLayout.js';
import { CardVisual } from './CardVisual.js';

export class CribVisual extends Phaser.GameObjects.Container {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     * @param {Object} config
     * @param {import('../../../game/Card.js').Card[]} cards
     */
    constructor(scene, x, y, config, cards = []) {
        super(scene, x, y);
        this.cardVisuals = [];
        this.submittedVisuals = [];
        this.config = config;

        // Label
        this.label = scene.add.text(0, this.config.LABEL_Y, 'Crib', {
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 },
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add(this.label);

        // Background Area (Enlarged)
        this.dropZoneBg = scene.add.rectangle(0, 0, this.config.WIDTH, this.config.HEIGHT, 0x000000, 0.3)
            .setStrokeStyle(2, 0xffffff, 0.5);
        this.add(this.dropZoneBg);

        this.setCards(cards);
        scene.add.existing(this);
    }

    setLabel(text) {
        this.label.setText(text);
    }

    isPointInside(x, y) {
        const bounds = this.dropZoneBg.getBounds();
        return bounds.contains(x, y);
    }

    setCards(cards, spread = false, reveal = false) {
        this.cardVisuals.forEach(v => v.destroy());
        this.cardVisuals = [];
        this.submittedVisuals.forEach(v => v.destroy());
        this.submittedVisuals = [];

        const cardScale = this.config.CARD_SCALE || 1.0;
        const spacing = (spread ? this.config.SPREAD_SPACING : this.config.STACK_SPACING) * cardScale;
        const totalWidth = spread ? (cards.length - 1) * spacing : 0;

        cards.forEach((card, index) => {
            const posX = spread ? (index * spacing) - (totalWidth / 2) : index * spacing;
            const posY = spread ? 0 : index * spacing;
            const visual = new CardVisual(this.scene, posX, posY, card, !reveal);
            visual.setScale(cardScale);
            visual.originalParent = this;
            this.add(visual);
            this.cardVisuals.push(visual);
        });
    }

    /**
     * Shows a small stack of submitted cards (e.g. from opponent) away from the center.
     */
    setSubmittedCards(cards) {
        this.submittedVisuals.forEach(v => v.destroy());
        this.submittedVisuals = [];

        const config = this.config;
        const cardScale = config.CARD_SCALE || 0.8;
        cards.forEach((card, index) => {
            // Place to the right of the discard zone, centered vertically
            const posX = (config.CRIB_PARKED_X_OFFSET + index * 2) * cardScale;
            const posY = (0 + index * 2) * cardScale;
            const visual = new CardVisual(this.scene, posX, posY, card, true);
            visual.originalParent = this;
            visual.setScale(cardScale);
            this.add(visual);
            this.submittedVisuals.push(visual);
        });
    }

    updateConfig(config) {
        this.config = config;
        this.dropZoneBg.setSize(config.WIDTH, config.HEIGHT);
        // Refresh visuals to apply new scale/spacing if needed
        // For simplicity, we'll just re-set what's there
        if (this.cardVisuals.length > 0) {
            this.setCards(this.cardVisuals.map(v => v.cardData), true, !this.cardVisuals[0].isFaceDown);
        }
        if (this.submittedVisuals.length > 0) {
            const cardScale = config.CARD_SCALE || 0.8;
            this.submittedVisuals.forEach((visual, index) => {
                visual.setScale(cardScale);
                // If the card was already positioned (e.g. by animation or setSubmittedCards), 
                // we might want to keep its relative position, but setSubmittedCards uses a fixed offset.
                // To keep it simple and consistent with how it's initialized:
                const posX = (config.CRIB_PARKED_X_OFFSET + index * 2) * cardScale;
                const posY = (0 + index * 2) * cardScale;
                visual.setPosition(posX, posY);
            });
        }
        if (this.label) {
            this.label.setY(config.LABEL_Y);
        }
    }

    /**
     * Adds an existing CardVisual to this container while maintaining its world position.
     * Useful for starting animations that end inside this container.
     * @param {CardVisual} visual
     * @param {Phaser.GameObjects.Container} [originalParent] - Optional original parent container to help with coordinate calculation
     */
    addForAnimation(visual, originalParent) {
        // Since we are moving the visual from one container (the hand) to another (the crib),
        // we need to calculate the target position in the crib's coordinate space
        // while preserving its current visual position on screen.

        const parent = originalParent || visual.originalParent || visual.parentContainer;

        let worldX = visual.x;
        let worldY = visual.y;

        if (parent) {
            worldX += parent.x;
            worldY += parent.y;
        }

        // Now calculate what this world position is in terms of THIS container's local space.
        const localX = worldX - this.x;
        const localY = worldY - this.y;

        visual.setPosition(localX, localY);
        visual.originalParent = this;
        this.add(visual);
        this.submittedVisuals.push(visual);
    }
}
