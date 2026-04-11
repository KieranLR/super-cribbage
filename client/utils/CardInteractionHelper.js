import { TIMINGS } from './flow/timings.js';

export class CardInteractionHelper {
    /**
     * @param {Object} options
     * @param {Phaser.Scene} options.scene
     * @param {import('../components/GameVisuals/HandVisual.js').HandVisual} options.handVisual
     * @param {Object} options.dropZoneVisual - Any visual with isPointInside(x, y) and potentially x, y properties
     * @param {Function} options.onValidateMove - (cardVisual) => boolean
     * @param {Function} options.onMoveApplied - (cardVisual, isClick) => void
     * @param {Object} [options.config]
     * @param {number} [options.config.maxSelected] - Maximum number of selected cards
     * @param {boolean} [options.config.immediateAction] - If true, performs action on valid drop/click immediately
     * @param {number} [options.config.animationDuration] - Duration for move animations
     */
    constructor({ scene, handVisual, dropZoneVisual, onValidateMove, onMoveApplied, config = {} }) {
        this.scene = scene;
        this.handVisual = handVisual;
        this.dropZoneVisual = dropZoneVisual;
        this.onValidateMove = onValidateMove;
        this.onMoveApplied = onMoveApplied;
        
        this.config = {
            maxSelected: 1,
            immediateAction: false,
            animationDuration: TIMINGS.ANIMATIONS.CARD_MOVE_DEFAULT,
            ...config
        };
    }

    /**
     * Handles card click interaction.
     * @param {import('../components/GameVisuals/CardVisual.js').CardVisual} cardVisual 
     */
    handleCardClick(cardVisual) {
        if (this.config.immediateAction) {
            if (this.onValidateMove(cardVisual)) {
                this.onMoveApplied(cardVisual, true);
                return true;
            } else {
                this.playErrorAnimation(cardVisual);
                return false;
            }
        }

        // Selection logic
        const selectedCards = this.handVisual.getSelectedCards();
        const isCurrentlySelected = cardVisual.isSelected;

        if (isCurrentlySelected) {
            cardVisual.setSelected(false);
            cardVisual.baseY = 0;
        } else {
            if (selectedCards.length < this.config.maxSelected) {
                cardVisual.setSelected(true);
            } else if (this.config.maxSelected === 1 && selectedCards.length === 1) {
                // If max is 1, deselect previous and select new
                selectedCards[0].setSelected(false);
                selectedCards[0].baseY = 0;
                cardVisual.setSelected(true);
            }
        }

        this.updateCardPositions();
        return true;
    }

    /**
     * Handles card drop interaction.
     * @param {import('../components/GameVisuals/CardVisual.js').CardVisual} cardVisual 
     * @param {number} x World X
     * @param {number} y World Y
     */
    handleCardDrop(cardVisual, x, y) {
        const isInside = this.dropZoneVisual.isPointInside(x, y);

        if (isInside) {
            if (this.onValidateMove(cardVisual)) {
                if (this.config.immediateAction) {
                    this.onMoveApplied(cardVisual, false);
                    return true;
                } else {
                    // Selection logic for non-immediate action
                    const selectedCards = this.handVisual.getSelectedCards();
                    const isCurrentlySelected = cardVisual.isSelected;

                    if (isCurrentlySelected) {
                        this.updateCardPositions();
                        return true;
                    }

                    if (selectedCards.length < this.config.maxSelected) {
                        cardVisual.setSelected(true);
                        this.updateCardPositions();
                        return true;
                    } else if (this.config.maxSelected === 1 && selectedCards.length === 1) {
                        // If max is 1, deselect previous and select new
                        selectedCards[0].setSelected(false);
                        selectedCards[0].baseY = 0;
                        cardVisual.setSelected(true);
                        this.updateCardPositions();
                        return true;
                    } else {
                        // Max selected reached, don't select and return to hand
                        this.playErrorAnimation(cardVisual);
                        return false;
                    }
                }
            } else {
                this.playErrorAnimation(cardVisual);
                return false;
            }
        } else {
            // Dropped outside - deselect
            if (cardVisual.isSelected) {
                cardVisual.setSelected(false);
                cardVisual.baseY = 0;
                this.updateCardPositions();
                return true;
            }
        }

        return false;
    }

    /**
     * Updates positions of all cards in hand, especially selected ones.
     */
    updateCardPositions() {
        const selectedCards = this.handVisual.getSelectedCards();
        const handPos = { x: this.handVisual.x, y: this.handVisual.y };
        const zonePos = { x: this.dropZoneVisual.x, y: this.dropZoneVisual.y };

        selectedCards.forEach((visual, index) => {
            let targetX, targetY;

            if (this.dropZoneVisual.getNextCardPosition) {
                const worldTarget = this.dropZoneVisual.getNextCardPosition(selectedCards.length, index);
                targetX = worldTarget.x - handPos.x;
                targetY = worldTarget.y - handPos.y;
            } else {
                // Default fallback: center of zone with slight offset if multiple
                const spacing = 30;
                const offset = (index * spacing) - ((selectedCards.length - 1) * spacing / 2);
                targetX = zonePos.x - handPos.x + offset;
                targetY = zonePos.y - handPos.y;
            }

            if (visual.parentContainer) {
                visual.parentContainer.bringToTop(visual);
            }

            this.scene.tweens.add({
                targets: visual,
                x: targetX,
                y: targetY,
                duration: this.config.animationDuration,
                ease: 'Power2',
                overwrite: true,
                onStart: () => {
                    visual.baseY = targetY;
                    visual.isLocked = true;
                },
                onComplete: () => {
                    visual.isLocked = false;
                }
            });
        });

        // Ensure non-selected cards return to hand
        this.handVisual.cardVisuals.forEach(visual => {
            if (!visual.isSelected && !visual.isDragging) {
                visual.baseY = 0;
            }
        });
        this.handVisual.reorderCards();
    }

    /**
     * Animates a card to the target zone.
     */
    animateToZone(cardVisual, onComplete) {
        const handPos = { x: this.handVisual.x, y: this.handVisual.y };
        let targetWorldPos;

        if (this.dropZoneVisual.getNextCardPosition) {
            // PeggingAreaVisual uses this
            const currentCount = (this.dropZoneVisual.cardVisuals?.length || 0) + 1;
            targetWorldPos = this.dropZoneVisual.getNextCardPosition(currentCount);
        } else {
            targetWorldPos = { x: this.dropZoneVisual.x, y: this.dropZoneVisual.y };
        }

        const targetX = targetWorldPos.x - handPos.x;
        const targetY = targetWorldPos.y - handPos.y;

        if (cardVisual.parentContainer) {
            cardVisual.parentContainer.bringToTop(cardVisual);
        }

        this.scene.tweens.add({
            targets: cardVisual,
            x: targetX,
            y: targetY,
            duration: this.config.animationDuration,
            ease: 'Power2',
            onStart: () => {
                cardVisual.isLocked = true;
            },
            onComplete: () => {
                cardVisual.isLocked = false;
                if (onComplete) onComplete();
            }
        });
    }

    playErrorAnimation(cardVisual) {
        // Position-independent error animation: Rotate and Flash
        this.scene.tweens.add({
            targets: cardVisual,
            angle: 10,
            duration: 50,
            yoyo: true,
            repeat: 3,
            onStart: () => {
                cardVisual.isLocked = true;
            },
            onComplete: () => {
                // Ensure card is fully visible and upright after animation
                cardVisual.setAngle(0);
                cardVisual.isLocked = false;

                // After effect, return to home position
                this.scene.time.delayedCall(100, () => {
                    if (!cardVisual.isSelected) {
                        cardVisual.baseY = 0;
                        this.handVisual.reorderCards();
                    } else {
                        this.updateCardPositions();
                    }
                });
            }
        });
    }
}
