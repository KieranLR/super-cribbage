import { CardVisual } from './CardVisual.js';

export class HandVisual extends Phaser.GameObjects.Container {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     * @param {import('../../../game/Card.js').Card[]} cards
     * @param {boolean} isBot
     */
    constructor(scene, x, y, cards = [], isBot = false, onCardClick = null, onCardDropped = null) {
        super(scene, x, y);
        this.isBot = isBot;
        this.cardVisuals = [];
        this.onCardClick = onCardClick;
        this.onCardDropped = onCardDropped;
        this.setCards(cards);
        scene.add.existing(this);
    }

    setCards(cards) {
        // Clear existing visuals
        this.cardVisuals.forEach(v => v.destroy());
        this.cardVisuals = [];

        const spacing = 60;
        const totalWidth = (cards.length - 1) * spacing;

        cards.forEach((card, index) => {
            const posX = (index * spacing) - (totalWidth / 2);
            const visual = new CardVisual(this.scene, posX, 0, card, this.isBot);
            visual.isDragging = false;
            
            if (this.isBot) {
                // If it's a bot, and we ARE showing the hand (debug), maybe make it look slightly different
                if (!visual.isFaceDown) {
                    visual.setAlpha(0.7);
                }
            } else {
                // For human players, make cards interactive if onCardClick is provided
                visual.setInteractive({ draggable: true });
                this.scene.input.setDraggable(visual);

                if (this.onCardClick) {
                    visual.on('pointerup', () => {
                        if (!visual.isDragging && !visual.hasMovedSignificantly) {
                            this.onCardClick(visual);
                        }
                    });
                }

                // Dragging Logic
                visual.on('dragstart', (pointer, dragX, dragY) => {
                    console.log('dragging');
                    this.bringToTop(visual);
                    visual.setAlpha(0.8);
                    visual.isDragging = true;
                    visual.startX = visual.x;
                    visual.startY = visual.y;
                    visual.hasMovedSignificantly = false;
                });

                visual.on('drag', (pointer, dragX, dragY) => {
                    console.log('dragging');
                    visual.x = dragX;
                    // Keep y near the original position but allow some vertical movement if desired
                    // For now, let's allow free movement as requested "dragged around the screen"
                    visual.y = dragY; 
                    
                    if (!visual.hasMovedSignificantly) {
                        const dist = Phaser.Math.Distance.Between(visual.startX, visual.startY, visual.x, visual.y);
                        if (dist > 10) {
                            visual.hasMovedSignificantly = true;
                        }
                    }
                    
                    // Live reorder (shifting cards around)
                    this.sortCardVisualsByX();
                    this.arrangeCards(visual);
                });

                visual.on('dragend', (pointer, dragX, dragY) => {
                    console.log('dragging');
                    visual.setAlpha(1);
                    visual.isDragging = false;
                    
                    if (this.onCardDropped) {
                        const worldX = visual.x + this.x;
                        const worldY = visual.y + this.y;
                        const handled = this.onCardDropped(visual, worldX, worldY);
                        if (handled) {
                            // The card has been consumed by the drop zone
                            // The handler should probably call setCards or similar to refresh the hand
                            return;
                        }
                    }
                    
                    this.reorderCards();
                });
            }

            this.add(visual);
            this.cardVisuals.push(visual);
        });
    }

    isAnyHovered() {
        return this.cardVisuals.some(v => v.isHovered);
    }

    isAnyDragging() {
        return this.cardVisuals.some(v => v.isDragging);
    }

    sortCardVisualsByX() {
        this.cardVisuals.sort((a, b) => a.x - b.x);
        this.cardVisuals.forEach((v, index) => {
            this.bringToTop(v);
        });
    }

    arrangeCards(activeVisual = null) {
        const spacing = 60;
        const handCards = this.cardVisuals.filter(v => !v.isSelected || v === activeVisual);
        const totalWidth = (handCards.length - 1) * spacing;

        handCards.forEach((visual, index) => {
            if (visual === activeVisual) return;

            const posX = (index * spacing) - (totalWidth / 2);
            
            // Only move if the target position is different enough to avoid jitter
            if (Math.abs(visual.x - posX) > 1) {
                this.scene.tweens.add({
                    targets: visual,
                    x: posX,
                    y: (visual.baseY || 0),
                    duration: 100,
                    ease: 'Power2',
                    overwrite: true,
                    onStart: () => {
                        visual.baseY = 0;
                    }
                });
            }
        });
    }

    reorderCards() {
        // Sort cardVisuals by their current x position
        this.sortCardVisualsByX();

        const spacing = 60;
        const handCards = this.cardVisuals.filter(v => !v.isSelected);
        const totalWidth = (handCards.length - 1) * spacing;

        handCards.forEach((visual, index) => {
            const posX = (index * spacing) - (totalWidth / 2);
            // Animate to new positions
            this.scene.tweens.add({
                targets: visual,
                x: posX,
                y: 0,
                duration: 200,
                ease: 'Power2',
                overwrite: true,
                onStart: () => {
                    visual.baseY = 0;
                }
            });
        });
    }

    /**
     * @returns {import('../CardVisual.js').CardVisual[]}
     */
    getSelectedCards() {
        return this.cardVisuals.filter(v => v.isSelected);
    }
}
