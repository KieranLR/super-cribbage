import { CardVisual } from './CardVisual.js';

export class CribVisual extends Phaser.GameObjects.Container {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     * @param {import('../../../game/Card.js').Card[]} cards
     */
    constructor(scene, x, y, cards = []) {
        super(scene, x, y);
        this.cardVisuals = [];

        // Label
        const label = scene.add.text(0, -90, 'Crib', {
            fontSize: '18px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 5, y: 2 }
        }).setOrigin(0.5);
        this.add(label);

        // Background Area
        const bg = scene.add.rectangle(0, 0, 110, 150, 0x000000, 0.3)
            .setStrokeStyle(1, 0xffffff, 0.5);
        this.add(bg);

        this.setCards(cards);
        scene.add.existing(this);
    }

    setCards(cards, spread = false) {
        this.cardVisuals.forEach(v => v.destroy());
        this.cardVisuals = [];
        
        const spacing = spread ? 40 : 2;
        const totalWidth = spread ? (cards.length - 1) * spacing : 0;

        cards.forEach((card, index) => {
            const posX = spread ? (index * spacing) - (totalWidth / 2) : index * spacing;
            const posY = spread ? 0 : index * spacing;
            const visual = new CardVisual(this.scene, posX, posY, card);
            this.add(visual);
            this.cardVisuals.push(visual);
        });
    }
}
