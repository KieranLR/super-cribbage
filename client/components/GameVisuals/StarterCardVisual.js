import { CardVisual } from './CardVisual.js';

export class StarterCardVisual extends Phaser.GameObjects.Container {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     * @param {import('../../../game/Card.js').Card|null} card
     */
    constructor(scene, x, y, card = null) {
        super(scene, x, y);
        this.cardVisual = null;

        // Label
        const label = scene.add.text(0, -90, 'Starter Card', {
            fontSize: '18px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 5, y: 2 }
        }).setOrigin(0.5);
        this.add(label);

        // Placeholder area
        const placeholder = scene.add.rectangle(0, 0, 100, 140, 0x000000, 0.4)
            .setStrokeStyle(2, 0xffffff, 0.5);
        this.add(placeholder);

        if (card) {
            this.setCard(card);
        }

        scene.add.existing(this);
    }

    setCard(card) {
        if (this.cardVisual) {
            this.cardVisual.destroy();
        }

        if (card) {
            this.cardVisual = new CardVisual(this.scene, 0, 0, card);
            this.add(this.cardVisual);
        }
    }
}
