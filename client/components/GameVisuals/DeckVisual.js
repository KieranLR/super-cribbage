import { CardVisual } from './CardVisual.js';
import { TIMINGS } from '../../utils/flow/timings.js';

export class DeckVisual extends Phaser.GameObjects.Container {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     */
    constructor(scene, x, y) {
        super(scene, x, y);
        this.cardVisuals = [];
        scene.add.existing(this);
    }

    /**
     * Clears all cards from the deck visual.
     */
    clear() {
        this.cardVisuals.forEach(v => v.destroy());
        this.cardVisuals = [];
    }

    /**
     * Displays a fanned-out deck of cards.
     * @param {number} count - Number of cards in the deck.
     * @param {number} startX - Local X start of the fan.
     * @param {number} endX - Local X end of the fan.
     * @param {number} y - Local Y position of the fan.
     * @param {Function} onCardClicked - Callback when a card is clicked.
     */
    showFan(count, startX, endX, y = 0, onCardClicked) {
        this.clear();
        
        const availableWidth = endX - startX;
        const spacing = availableWidth / (count - 1);

        for (let i = 0; i < count; i++) {
            // Cards are indexed from bottom (0) to top (count-1)
            // We want the top card to be on the left (startX) and fan out to the right (endX)
            const posX = startX + ((count - 1 - i) * spacing);
            const posY = y;
            
            const cardVisual = new CardVisual(this.scene, posX, posY, { suit: 'Hidden', value: '?' }, true);
            cardVisual.originalParent = this;
            cardVisual.isStartingCutCard = true;
            cardVisual.cutIndex = i;
            cardVisual.baseY = posY;
            
            if (onCardClicked) {
                cardVisual.on('pointerdown', () => onCardClicked(cardVisual));
            }
            
            this.add(cardVisual);
            this.cardVisuals.push(cardVisual);
        }
    }

    /**
     * Animates from a stacked deck to a fanned-out deck.
     * @param {number} count - Number of cards in the deck.
     * @param {number} startX - Local X start of the fan.
     * @param {number} endX - Local X end of the fan.
     * @param {number} y - Local Y position of the fan.
     * @param {Function} onCardClicked - Callback when a card is clicked.
     * @param {number} duration - Animation duration.
     * @param {number} delay - Delay before animation starts.
     * @param {Function} onComplete - Animation complete callback.
     */
    animateFan(count, startX, endX, y = 0, onCardClicked, duration = TIMINGS.ANIMATIONS.GENERIC_MOVE, delay = 0, onComplete = null) {
        // Start as a stack
        this.showStack(count);

        const availableWidth = endX - startX;
        const spacing = availableWidth / (count - 1);

        this.cardVisuals.forEach((card, i) => {
            // Cards are indexed from bottom (0) to top (count-1)
            // We want the top card (count-1) to be on the left (startX) and fan out to the right (endX)
            const posX = startX + ((count - 1 - i) * spacing);
            const posY = y;
            
            card.isStartingCutCard = true;
            card.cutIndex = i;
            card.setInteractive();
            
            if (onCardClicked) {
                card.on('pointerdown', () => onCardClicked(card));
            }

            this.scene.tweens.add({
                targets: card,
                x: posX,
                y: posY,
                duration: duration,
                ease: 'Power2',
                delay: delay + ((count - 1 - i) * 5), // Global delay + ripple from top card
                onComplete: () => {
                    card.baseY = posY;
                    if (i === 0 && onComplete) {
                        onComplete();
                    }
                }
            });
        });
    }

    /**
     * Displays a compact stack of cards.
     * @param {number} count - Number of cards in the stack.
     */
    showStack(count) {
        this.clear();
        for (let i = 0; i < count; i++) {
            // Slight offset for stack effect
            const posX = i * 0.5;
            const posY = -i * 0.5;
            const visual = new CardVisual(this.scene, posX, posY, { suit: 'Hidden', value: '?' }, true);
            visual.originalParent = this;
            visual.baseY = posY;
            // For stacked cards, we disable input so they don't hover
            if (visual.input) visual.input.enabled = false;
            this.add(visual);
            this.cardVisuals.push(visual);
        }
    }

    /**
     * Animates from fanned out cards back into a compact stack.
     * @param {number} duration - Animation duration.
     * @param {Function} onComplete - Animation complete callback.
     */
    animateStack(duration = TIMINGS.ANIMATIONS.GENERIC_MOVE, onComplete = null) {
        this.cardVisuals.forEach((card, i) => {
            const posX = i * 0.5;
            const posY = -i * 0.5;
            
            // Remove starting cut specific data
            card.isStartingCutCard = false;
            card.cutIndex = undefined;

            // Reset visual state and flip face down
            card.resetVisualState();
            card.setFaceDown(true);

            // Disable interaction while in stack
            if (card.input) card.input.enabled = false;
            card.off('pointerdown');

            this.scene.tweens.add({
                targets: card,
                x: posX,
                y: posY,
                duration: duration,
                ease: 'Power2',
                delay: (this.cardVisuals.length - 1 - i) * 5, // Reverse ripple
                onComplete: () => {
                    card.baseY = posY;
                    if (i === 0 && onComplete) {
                        onComplete();
                    }
                }
            });
        });
    }

    /**
     * Returns and removes the top card visual from the deck.
     * @returns {CardVisual|undefined}
     */
    popCard() {
        const visual = this.cardVisuals.pop();
        if (visual) {
            this.remove(visual);
        }
        return visual;
    }

    /**
     * Returns a card visual by its cut index.
     * @param {number} index 
     * @returns {CardVisual|undefined}
     */
    getCardByCutIndex(index) {
        return this.cardVisuals.find(v => v.cutIndex === index);
    }

    /**
     * Returns all card visuals in the deck.
     * @returns {CardVisual[]}
     */
    getCards() {
        return this.cardVisuals;
    }

    /**
     * Adds a card visual to the top of the deck stack.
     * @param {CardVisual} card 
     */
    addCard(card) {
        // Reset visual state and flip face down
        card.resetVisualState();
        card.setFaceDown(true);
        
        // Disable interaction while in stack
        if (card.input) card.input.enabled = false;
        card.off('pointerdown');

        // Target stack position
        const i = this.cardVisuals.length;
        const posX = i * 0.5;
        const posY = -i * 0.5;
        
        card.setPosition(posX, posY);
        card.baseY = posY;
        card.originalParent = this;
        
        this.add(card);
        this.cardVisuals.push(card);
    }
}
