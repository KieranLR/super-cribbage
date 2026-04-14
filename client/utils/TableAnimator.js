import { TIMINGS } from './flow/timings.js';
import { settingsManager } from './SettingsManager.js';
import { Suits } from '../../game/Card.js';

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
     * Animates the deck stack moving to a specific play position.
     */
    animateDeckToPlay(view, onComplete = null) {
        const snapshot = view.getLayoutSnapshot();
        const deckPos = snapshot.slots.deck;

        view.flow.startAnimation();
        this.moveCard(view.visuals.table.deck, deckPos.x, deckPos.y, {
            duration: TIMINGS.ANIMATIONS.GENERIC_MOVE,
            onComplete: () => {
                view.visuals.table.deck.animateStack(TIMINGS.ANIMATIONS.GENERIC_MOVE, () => {
                    view.flow.endAnimation();
                    if (onComplete) onComplete();
                });
            }
        });
    }

    /**
     * Animates dealing cards to players.
     */
    dealCardsAnimated(view, data, onComplete = null) {
        const { players } = data;
        const cardsToDeal = [];
        
        const showBotHand = settingsManager.get('showBotHand');
        view.visuals.table.botHand.isBot = !showBotHand;
        
        const maxHandSize = Math.max(...players.map(p => p.hand.cards.length));
        
        // Pre-sort player hands by rank before generating deal order
        players.forEach(player => {
            player.hand.cards.sort((a, b) => {
                const rankA = a.getRank();
                const rankB = b.getRank();
                if (rankA !== rankB) return rankA - rankB;
                const suitsOrder = [Suits.HEARTS, Suits.DIAMONDS, Suits.CLUBS, Suits.SPADES];
                return suitsOrder.indexOf(a.suit) - suitsOrder.indexOf(b.suit);
            });
        });
        
        for (let i = 0; i < maxHandSize; i++) {
            players.forEach(player => {
                if (player.hand.cards[i]) {
                    cardsToDeal.push({
                        player: player,
                        cardData: player.hand.cards[i],
                        cardIndexInHand: i
                    });
                }
            });
        }

        let dealIndex = 0;
        const dealNextCard = () => {
            if (dealIndex >= cardsToDeal.length) {
                if (onComplete) onComplete();
                return;
            }

            const { player, cardData, cardIndexInHand } = cardsToDeal[dealIndex];
            const isHuman = player.id === 'human';
            const handVisual = isHuman ? view.visuals.table.humanHand : view.visuals.table.botHand;
            
            const cardVisual = view.visuals.table.deck.popCard();
            if (!cardVisual) {
                console.warn('DeckVisual ran out of cards during deal! Fallback to immediate update.');
                view.updateHands(view.visuals.table.humanHand.isBot ? [] : view.visuals.table.humanHand.cardVisuals.map(v => v.cardData), 
                                view.visuals.table.botHand.isBot ? [] : view.visuals.table.botHand.cardVisuals.map(v => v.cardData));
                if (onComplete) onComplete();
                return;
            }

            const worldX = cardVisual.x + view.visuals.table.deck.x;
            const worldY = cardVisual.y + view.visuals.table.deck.y;
            
            cardVisual.x = worldX - handVisual.x;
            cardVisual.y = worldY - handVisual.y;
            handVisual.add(cardVisual);
            handVisual.cardVisuals.push(cardVisual);
            
            cardVisual.cardData = cardData;
            handVisual.setupCardInteractivity(cardVisual);
            
            const shouldBeFaceDown = !isHuman && view.visuals.table.botHand.isBot;
            
            if (shouldBeFaceDown) {
                cardVisual.setFaceDown(true);
            }

            const layout = view.getLayoutSnapshot();
            const handScale = layout.styles.hand.cardScale;
            const spacing = 60 * handScale;
            const totalCardsForThisPlayer = player.hand.handSize || player.hand.cards.length;
            const totalWidth = (totalCardsForThisPlayer - 1) * spacing;
            const targetX = (cardIndexInHand * spacing) - (totalWidth / 2);
            const targetY = 0;

            view.flow.startAnimation();
            this.moveCard(cardVisual, targetX, targetY, {
                duration: TIMINGS.ANIMATIONS.CARD_MOVE_DEFAULT,
                ease: 'Cubic.out',
                scale: handScale,
                onComplete: () => {
                    if (!shouldBeFaceDown) {
                        this.flipCard(cardVisual, false);
                    }
                    view.flow.endAnimation();
                }
            });

            dealIndex++;
            this.scene.time.delayedCall(TIMINGS.ANIMATIONS.DEAL_INTERVAL || 150, dealNextCard);
        };

        dealNextCard();
    }

    /**
     * Animates returning all cards on the table to the deck.
     */
    returnCardsToDeckAnimated(view, onComplete = null) {
        const cardsToReturn = [];
        
        view.visuals.table.humanHand.cardVisuals.forEach(v => {
            cardsToReturn.push(v);
        });
        view.visuals.table.humanHand.cardVisuals = [];

        view.visuals.table.botHand.cardVisuals.forEach(v => {
            cardsToReturn.push(v);
        });
        view.visuals.table.botHand.cardVisuals = [];

        view.visuals.table.crib.cardVisuals.forEach(v => {
            cardsToReturn.push(v);
        });
        view.visuals.table.crib.cardVisuals = [];
        view.visuals.table.crib.submittedVisuals.forEach(v => {
            cardsToReturn.push(v);
        });
        view.visuals.table.crib.submittedVisuals = [];

        view.visuals.table.peggingArea.cardVisuals.forEach(v => {
            cardsToReturn.push(v);
        });
        view.visuals.table.peggingArea.cardVisuals = [];
        view.visuals.table.peggingArea.label.setText('Pegging Area: 0');

        // Reset starter card state on deck - it's already in the deck visual's cardVisuals
        view.visuals.table.deck.setStarterCard(null);

        if (cardsToReturn.length === 0) {
            if (onComplete) onComplete();
            return;
        }

        view.flow.startAnimation();
        let finishedCount = 0;

        cardsToReturn.forEach((card, index) => {
            const matrix = card.getWorldTransformMatrix();
            const worldX = matrix.tx;
            const worldY = matrix.ty;

            if (card.parentContainer) {
                card.parentContainer.remove(card, false);
            }

            this.scene.add.existing(card);
            card.setPosition(worldX, worldY);

            const delay = index * 30;
            if (!card.isFaceDown) {
                this.flipCard(card, true, null, null, delay - 30);
            }
            card.setDepth(100 + index);

            this.moveCard(card, view.visuals.table.deck.x, view.visuals.table.deck.y, {
                duration: TIMINGS.ANIMATIONS.GENERIC_MOVE,
                delay: delay,
                onComplete: () => {
                    card.setFaceDown(true);
                    view.visuals.table.deck.addCard(card);
                    finishedCount++;
                    if (finishedCount === cardsToReturn.length) {
                        view.flow.endAnimation();
                        if (onComplete) onComplete();
                    }
                }
            });
        });
    }

    /**
     * Shows and optionally animates the deck fanning out for the starting cut.
     */
    showStartingCutDeck(view, count, animate = false, onComplete = null) {
        const snapshot = view.getLayoutSnapshot();
        const sc = snapshot.slots.startingCut;
        const deck = view.visuals.table.deck;

        const localStartX = (sc.startX - deck.x) / deck.scaleX;
        const localEndX = (sc.endX - deck.x) / deck.scaleX;
        const localY = (sc.y - deck.y) / deck.scaleY;

        deck.setAlpha(1);

        if (animate) {
            deck.animateFan(
                count,
                localStartX,
                localEndX,
                localY,
                (v) => view.onCardClicked(v),
                TIMINGS.ANIMATIONS.DECK_FAN_DURATION,
                TIMINGS.ANIMATIONS.DECK_FAN_DELAY,
                onComplete
            );
        } else {
            deck.showFan(count, localStartX, localEndX, localY, (v) => view.onCardClicked(v));
            if (onComplete) onComplete();
        }
    }

    /**
     * Shows floating text at a given position.
     */
    showFloatingText(x, y, text, color = '#ffff00') {
        const textColor = typeof color === 'number' ? `#${color.toString(16).padStart(6, '0')}` : color;
        const floatingText = this.scene.add.text(x, y, text, {
            fontSize: '32px',
            color: textColor,
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.showFloatingTextVisual(floatingText, y - 100);
    }

    /**
     * Animates a given text visual as floating text.
     */
    showFloatingTextVisual(textVisual, targetY, duration = TIMINGS.ANIMATIONS.SCOREBOARD_UPDATE) {
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
    reflowHand(cardVisuals, totalWidth, spacing, baseY = 0, scale = null) {
        cardVisuals.forEach((visual, index) => {
            const posX = (index * spacing) - (totalWidth / 2);
            this.moveCard(visual, posX, baseY, {
                duration: TIMINGS.ANIMATIONS.GENERIC_MOVE,
                ease: 'Power2',
                scale: scale !== null ? scale : visual.scale,
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
    moveCardToCrib(cardVisual, x, y, delay, onComplete, scale = 1) {
        return this.moveCard(cardVisual, x, y, {
            scale: scale, // Use provided scale, defaults to 1 for backward compatibility
            duration: TIMINGS.ANIMATIONS.DISCARD_MOVE || 600,
            ease: 'Cubic.out',
            delay: delay,
            onComplete: onComplete
        });
    }

    /**
     * Centers the crib cards during phase transition.
     */
    centerCribCards(visuals, spacing = 2, duration = TIMINGS.ANIMATIONS.PEGGING_UI_MOVE, onComplete = null, scale = 1) {
        let completed = 0;
        visuals.forEach((visual, index) => {
            const targetX = index * spacing * scale;
            const targetY = index * spacing * scale;

            this.scene.tweens.add({
                targets: visual,
                x: targetX,
                y: targetY,
                scale: scale,
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
        const layout = this.scene.view?.getLayoutSnapshot(); // Access layout if available through scene
        const targetScale = dropZoneVisual?.config?.CARD_SCALE || (layout?.styles?.hand?.cardScale ?? 1.0);

        selectedCards.forEach((visual, index) => {
            let targetX, targetY;

            if (dropZoneVisual.getNextCardPosition) {
                const worldTarget = dropZoneVisual.getNextCardPosition(selectedCards.length, index);
                targetX = worldTarget.x - handPos.x;
                targetY = worldTarget.y - handPos.y;
            } else {
                // Default fallback: center of zone with slight offset if multiple
                const spacing = 30 * targetScale;
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
                scale: targetScale,
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
