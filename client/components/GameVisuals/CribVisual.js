import { TableLayout } from '../../utils/TableLayout.js';
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
        console.log('setting crib visuals');
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
            const posX = TableLayout.REL.CRIB_PARKED_X_OFFSET + index * 2;
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
     * @param {Phaser.GameObjects.Container} [originalParent] - Optional original parent container to help with coordinate calculation
     */
    addForAnimation(visual, originalParent) {
        // Since we are moving the visual from one container (the hand) to another (the crib),
        // we need to calculate the target position in the crib's coordinate space
        // while preserving its current visual position on screen.

        const parent = originalParent || visual.parentContainer;
        
        let worldX = visual.x;
        let worldY = visual.y;
        
        if (parent) {
            worldX += parent.x;
            worldY += parent.y;
            
            // If the parent is the bot hand, it is rotated 180 degrees
            // HandVisual uses a container, and TableLayout positions it at the top.
            // Check if it's the bot hand.
            if (parent.y < this.scene.scale.height / 2) {
                // This is likely the bot hand at the top.
                // In this project, bot cards are often flipped/rotated.
                // However, visual.x/y are local to the container.
                // If the container itself is NOT rotated but its children are, we are fine.
                // If the container IS rotated, we'd need to account for it.
            }
        }

        // Now calculate what this world position is in terms of THIS container's local space.
        const localX = worldX - this.x;
        const localY = worldY - this.y;
        
        console.log(`CribVisual.addForAnimation: world(${worldX}, ${worldY}) -> local(${localX}, ${localY}) [Parent was ${parent ? 'found' : 'NULL'}]`);
        
        visual.setPosition(localX, localY);
        this.add(visual);
        this.submittedVisuals.push(visual);
    }
}
