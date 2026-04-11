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
        this.submittedVisuals = [];

        // Label
        this.label = scene.add.text(0, -110, 'Crib', {
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 },
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add(this.label);

        // Background Area (Enlarged)
        this.dropZoneBg = scene.add.rectangle(0, 0, 240, 180, 0x000000, 0.3)
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
        
        const spacing = spread ? 40 : 2;
        const totalWidth = spread ? (cards.length - 1) * spacing : 0;

        cards.forEach((card, index) => {
            const posX = spread ? (index * spacing) - (totalWidth / 2) : index * spacing;
            const posY = spread ? 0 : index * spacing;
            const visual = new CardVisual(this.scene, posX, posY, card, !reveal);
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

        cards.forEach((card, index) => {
            // Place to the right of the discard zone, centered vertically
            const posX = 150 + index * 2;
            const posY = 0 + index * 2;
            const visual = new CardVisual(this.scene, posX, posY, card, true);
            visual.setScale(0.8);
            this.add(visual);
            this.submittedVisuals.push(visual);
        });
    }

    /**
     * Adds an existing CardVisual to this container while maintaining its world position.
     * Useful for starting animations that end inside this container.
     * @param {CardVisual} visual 
     */
    addForAnimation(visual) {
        const worldPos = visual.getWorldTransformMatrix();
        const localPos = this.getLocalPoint(worldPos.tx, worldPos.ty);
        
        visual.setPosition(localPos.x, localPos.y);
        this.add(visual);
        this.submittedVisuals.push(visual);
    }
}
