import { CardVisual } from './CardVisual.js';

export class PeggingAreaVisual extends Phaser.GameObjects.Container {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     */
    constructor(scene, x, y) {
        super(scene, x, y);
        this.cardVisuals = [];

        // Label
        this.label = scene.add.text(0, -90, 'Pegging Area: 0', {
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
        this.add(this.label);

        // Play Area background
        const bg = scene.add.rectangle(0, 0, 450, 160, 0x000000, 0.2)
            .setStrokeStyle(2, 0xffffff, 0.3);
        this.add(bg);

        scene.add.existing(this);
    }

    /**
     * @param {import('../../../game/Card.js').Card[]} cards
     * @param {number} total
     */
    update(cards, total) {
        this.cardVisuals.forEach(v => v.destroy());
        this.cardVisuals = [];
        this.label.setText(`Pegging Area: ${total}`);

        const spacing = 50;
        const totalWidth = (cards.length - 1) * spacing;

        cards.forEach((card, index) => {
            const posX = (index * spacing) - (totalWidth / 2);
            const visual = new CardVisual(this.scene, posX, 0, card);
            this.add(visual);
            this.cardVisuals.push(visual);
        });
    }

    /**
     * Highlight area for specific events
     */
    flash(color = 0xffffff) {
        const flashRect = this.scene.add.rectangle(this.x, this.y, 450, 160, color, 0.5);
        this.scene.tweens.add({
            targets: flashRect,
            alpha: 0,
            duration: 500,
            onComplete: () => flashRect.destroy()
        });
    }
}
