import { CardVisual } from './CardVisual.js';

export class HandVisual extends Phaser.GameObjects.Container {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     * @param {import('../../../game/Card.js').Card[]} cards
     * @param {boolean} isBot
     */
    constructor(scene, x, y, cards = [], isBot = false, onCardClick = null) {
        super(scene, x, y);
        this.isBot = isBot;
        this.cardVisuals = [];
        this.onCardClick = onCardClick;
        this.setCards(cards);
        scene.add.existing(this);
    }

    setCards(cards) {
        // Clear existing visuals
        this.cardVisuals.forEach(v => v.destroy());
        this.cardVisuals = [];

        const spacing = 40;
        const totalWidth = (cards.length - 1) * spacing;

        cards.forEach((card, index) => {
            const posX = (index * spacing) - (totalWidth / 2);
            const visual = new CardVisual(this.scene, posX, 0, card);
            
            if (this.isBot) {
                // If it's a bot, we might want to hide the cards normally, 
                // but for testing/visualizing we'll just show them or grey them out
                visual.setAlpha(0.7);
            } else {
                // For human players, make cards interactive if onCardClick is provided
                if (this.onCardClick) {
                    visual.on('pointerdown', () => {
                        this.onCardClick(visual);
                    });
                }
            }

            this.add(visual);
            this.cardVisuals.push(visual);
        });
    }

    /**
     * @returns {import('../CardVisual.js').CardVisual[]}
     */
    getSelectedCards() {
        return this.cardVisuals.filter(v => v.isSelected);
    }
}
