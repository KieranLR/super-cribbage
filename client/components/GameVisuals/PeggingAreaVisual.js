import { TableLayout } from '../../utils/TableLayout.js';
import { CardVisual } from './CardVisual.js';
import { TIMINGS } from '../../utils/flow/timings.js';

export class PeggingAreaVisual extends Phaser.GameObjects.Container {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     * @param {Object} config
     */
    constructor(scene, x, y, config) {
        super(scene, x, y);
        this.cardVisuals = [];
        this.config = config || TableLayout.REL.PEGGING_AREA;

        // Label
        this.label = scene.add.text(0, this.config.LABEL_Y, 'Pegging Area: 0', {
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
        this.add(this.label);

        // Play Area background
        const bg = scene.add.rectangle(0, 0, this.config.WIDTH, this.config.HEIGHT, 0x000000, 0.2)
            .setStrokeStyle(2, 0xffffff, 0.3);
        this.add(bg);

        scene.add.existing(this);
    }

    isPointInside(x, y) {
        const config = this.config;
        // The play area background is at (0,0) in the container
        // We need to check if the point is within this rectangle
        const bounds = new Phaser.Geom.Rectangle(this.x - config.WIDTH / 2, this.y - config.HEIGHT / 2, config.WIDTH, config.HEIGHT);
        return bounds.contains(x, y);
    }

    /**
     * @param {import('../../../game/Card.js').Card[]} cards
     * @param {number} total
     */
    update(cards, total) {
        this.cardVisuals.forEach(v => v.destroy());
        this.cardVisuals = [];
        this.label.setText(`Pegging Area: ${total}`);

        const config = this.config;
        const spacing = config.CARD_SPACING;
        const totalWidth = (cards.length - 1) * spacing;

        cards.forEach((card, index) => {
            const posX = (index * spacing) - (totalWidth / 2);
            const visual = new CardVisual(this.scene, posX, 0, card);
            visual.originalParent = this;
            this.add(visual);
            this.cardVisuals.push(visual);
        });
    }

    /**
     * @param {import('../../../game/Card.js').Card} cardData
     */
    addCard(cardData) {
        // The current update logic is simple and replaces everything.
        // For addCard, we calculate its position and add it to the list.
        const currentCount = this.cardVisuals.length + 1;
        const pos = this.getNextCardPosition(currentCount);
        
        // Convert world position back to local position
        const localX = pos.x - this.x;
        const localY = pos.y - this.y;

        const visual = new CardVisual(this.scene, localX, localY, cardData);
        visual.originalParent = this;
        this.add(visual);
        this.cardVisuals.push(visual);
        
        // Shift existing cards to maintain centering
        this.repositionCards();
    }

    /**
     * Repositions all cards in the area to keep them centered as a group.
     */
    repositionCards() {
        const count = this.cardVisuals.length;
        if (count === 0) return;

        const config = this.config;
        const spacing = config.CARD_SPACING;
        const totalWidth = (count - 1) * spacing;

        this.cardVisuals.forEach((visual, index) => {
            const posX = (index * spacing) - (totalWidth / 2);
            visual.setPosition(posX, 0);
        });
    }

    /**
     * Returns the target world coordinates for the next card in the sequence.
     * @param {number} currentCount - The number of cards that will be in the area (including the one about to be played)
     */
    getNextCardPosition(currentCount) {
        if (currentCount <= 0) return { x: this.x, y: this.y };

        const config = this.config;
        const spacing = config.CARD_SPACING;
        const totalWidth = (currentCount - 1) * spacing;
        const index = currentCount - 1; // Last position
        const posX = (index * spacing) - (totalWidth / 2);
        
        // Convert local posX, 0 to world coordinates
        return {
            x: this.x + posX,
            y: this.y
        };
    }

    /**
     * Highlight area for specific events
     */
    flash(color = 0xffffff) {
        const config = this.config;
        const flashRect = this.scene.add.rectangle(this.x, this.y, config.WIDTH, config.HEIGHT, color, 0.5);
        const animator = this.scene.animator;
        if (animator) {
            animator.flashArea(flashRect, color);
        } else {
            this.scene.tweens.add({
                targets: flashRect,
                alpha: 0,
                duration: TIMINGS.ANIMATIONS.PEGGING_UI_MOVE,
                onComplete: () => flashRect.destroy()
            });
        }
    }
}
