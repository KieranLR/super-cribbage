import { TIMINGS } from './flow/timings.js';

export class TableAnimator {
    constructor(scene) {
        this.scene = scene;
    }

    /**
     * Animates a card from one position to another.
     */
    moveCard(cardVisual, x, y, options = {}) {
        const {
            duration = TIMINGS.ANIMATIONS.GENERIC_MOVE,
            ease = 'Power2',
            onStart,
            onComplete,
            delay = 0,
            scale,
            alpha,
            overwrite = true
        } = options;

        return this.scene.tweens.add({
            targets: cardVisual,
            x: x,
            y: y,
            scale: scale !== undefined ? scale : cardVisual.scale,
            alpha: alpha !== undefined ? alpha : cardVisual.alpha,
            duration: duration,
            ease: ease,
            delay: delay,
            overwrite: overwrite,
            onStart: (tween) => {
                cardVisual.isLocked = true;
                if (onStart) onStart(tween);
            },
            onComplete: (tween) => {
                cardVisual.isLocked = false;
                if (onComplete) onComplete(tween);
            }
        });
    }

    /**
     * Fades a visual in or out.
     */
    fade(target, alpha, duration = TIMINGS.ANIMATIONS.GENERIC_FADE, onComplete = null) {
        return this.scene.tweens.add({
            targets: target,
            alpha: alpha,
            duration: duration,
            onComplete: onComplete
        });
    }

    /**
     * Specifically for the crib visual transitions between phases.
     */
    moveCrib(cribVisual, x, y) {
        return this.scene.tweens.add({
            targets: cribVisual,
            x: x,
            y: y,
            duration: TIMINGS.ANIMATIONS.PEGGING_UI_MOVE,
            ease: 'Power2',
            overwrite: true
        });
    }

    /**
     * Animates floating text for scores or messages.
     */
    showFloatingText(textVisual, targetY, duration = TIMINGS.ANIMATIONS.SCOREBOARD_UPDATE) {
        return this.scene.tweens.add({
            targets: textVisual,
            y: targetY,
            alpha: 0,
            duration: duration,
            onComplete: () => textVisual.destroy()
        });
    }

    /**
     * Card hover animation.
     */
    hoverCard(cardVisual, targetY) {
        return this.scene.tweens.add({
            targets: cardVisual,
            y: targetY,
            duration: TIMINGS.ANIMATIONS.CARD_HOVER,
            ease: 'Power2',
            overwrite: true
        });
    }

    /**
     * Animates a card being played to the pegging area.
     */
    playCardToPegging(cardVisual, x, y, onComplete) {
        return this.moveCard(cardVisual, x, y, {
            duration: TIMINGS.ANIMATIONS.PEGGING_CARD_MOVE,
            ease: 'Power2',
            onComplete: onComplete
        });
    }

    /**
     * Deals a card to a hand.
     */
    dealCardToHand(cardVisual, slotX, slotY, delay = 0, onComplete = null) {
        return this.moveCard(cardVisual, slotX, slotY, {
            duration: TIMINGS.ANIMATIONS.CARD_MOVE_DEFAULT,
            ease: 'Cubic.out',
            delay: delay,
            onComplete: onComplete
        });
    }

    /**
     * Flips a card.
     */
    flipCard(cardVisual, isFaceDown, onHalfway = null, onComplete = null, delay = 0) {
        // Simple flip: Scale to 0, swap visuals, scale back
        return this.scene.tweens.add({
            targets: cardVisual,
            scaleX: 0,
            duration: TIMINGS.ANIMATIONS.CARD_FLIP / 2,
            delay: delay,
            yoyo: true,
            onYoyo: (tween) => {
                cardVisual.setFaceDown(isFaceDown);
                if (onHalfway) onHalfway(tween);
            },
            onComplete: onComplete
        });
    }

    /**
     * Reflows hand cards to their new positions.
     */
    reflowHand(cardVisuals, totalWidth, spacing, baseY = 0) {
        cardVisuals.forEach((visual, index) => {
            const posX = (index * spacing) - (totalWidth / 2);
            this.moveCard(visual, posX, baseY, {
                duration: TIMINGS.ANIMATIONS.GENERIC_MOVE,
                ease: 'Power2',
                overwrite: true,
                onStart: () => {
                    visual.baseY = baseY;
                }
            });
        });
    }

    /**
     * Animates cards being moved to the crib.
     */
    moveCardToCrib(cardVisual, x, y, delay, onComplete) {
        return this.moveCard(cardVisual, x, y, {
            scale: 1, // Keep scale consistent with HandVisual to avoid jump later
            duration: TIMINGS.ANIMATIONS.DISCARD_MOVE || 600,
            ease: 'Cubic.out',
            delay: delay,
            onComplete: onComplete
        });
    }

    /**
     * Centers the crib cards during phase transition.
     */
    centerCribCards(visuals, spacing = 2, duration = TIMINGS.ANIMATIONS.PEGGING_UI_MOVE, onComplete = null) {
        let completed = 0;
        visuals.forEach((visual, index) => {
            const targetX = index * spacing;
            const targetY = index * spacing;

            this.scene.tweens.add({
                targets: visual,
                x: targetX,
                y: targetY,
                duration: duration,
                ease: 'Power2',
                onComplete: () => {
                    completed++;
                    if (onComplete && completed === visuals.length) {
                        onComplete();
                    }
                }
            });
        });
    }

    /**
     * Updates positions of all cards in hand, especially selected ones.
     */
    updateSelectedCardsPositions(selectedCards, handPos, dropZoneVisual, animationDuration) {
        selectedCards.forEach((visual, index) => {
            let targetX, targetY;

            if (dropZoneVisual.getNextCardPosition) {
                const worldTarget = dropZoneVisual.getNextCardPosition(selectedCards.length, index);
                targetX = worldTarget.x - handPos.x;
                targetY = worldTarget.y - handPos.y;
            } else {
                // Default fallback: center of zone with slight offset if multiple
                const spacing = 30;
                const offset = (index * spacing) - ((selectedCards.length - 1) * spacing / 2);
                targetX = dropZoneVisual.x - handPos.x + offset;
                targetY = dropZoneVisual.y - handPos.y;
            }

            if (visual.parentContainer) {
                visual.parentContainer.bringToTop(visual);
            }

            this.moveCard(visual, targetX, targetY, {
                duration: animationDuration,
                ease: 'Power2',
                overwrite: true,
                onStart: () => {
                    visual.baseY = targetY;
                }
            });
        });
    }

    /**
     * Highlight area for specific events
     */
    flashArea(rect, color = 0xffffff, duration = TIMINGS.ANIMATIONS.PEGGING_UI_MOVE) {
        rect.setFillStyle(color, 0.5);
        rect.setAlpha(0.5);
        return this.scene.tweens.add({
            targets: rect,
            alpha: 0,
            duration: duration,
            onComplete: () => rect.destroy()
        });
    }

    /**
     * Error animation for invalid moves.
     */
    playErrorAnimation(cardVisual, onComplete) {
        return this.scene.tweens.add({
            targets: cardVisual,
            angle: 10,
            duration: 50,
            yoyo: true,
            repeat: 3,
            onStart: () => {
                cardVisual.isLocked = true;
            },
            onComplete: (tween) => {
                cardVisual.setAngle(0);
                cardVisual.isLocked = false;
                if (onComplete) onComplete(tween);
            }
        });
    }
}
