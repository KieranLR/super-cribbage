import { PHASES } from '../../../game/Constants.js';
import { Scoring } from '../../../game/Scoring.js';
import { TIMINGS } from '../../utils/flow/timings.js';
import { TableLayout } from '../../utils/TableLayout.js';
import { CardVisual } from '../../components/GameVisuals/CardVisual.js';
import { CardInteractionHelper } from '../../utils/CardInteractionHelper.js';
import { TableAnimator } from '../../utils/TableAnimator.js';
import { Phase } from './Phase.js';

export class PeggingPhase extends Phase {
    start() {
        this.updatePeggingInstructions();

        this.interactionHelper = new CardInteractionHelper({
            scene: this.view.scene,
            handVisual: this.view.visuals.table.humanHand,
            dropZoneVisual: this.view.visuals.table.peggingArea,
            animator: this.animator,
            onValidateMove: (cardVisual) => {
                const pegging = this.gameState.pegging;
                if (!pegging || pegging.getCurrentPlayer() !== this.humanPlayer) return false;
                return pegging.currentTotal + Scoring.getCardValue(cardVisual.cardData) <= 31;
            },
            onMoveApplied: (cardVisual) => {
                this.controller.isProcessingMove = true;
                this.interactionHelper.animateToZone(cardVisual, () => {
                    this.gameState.playPeggingCard(this.humanPlayer, cardVisual.cardData);
                });
            },
            config: {
                maxSelected: 1,
                immediateAction: true,
                animationDuration: TIMINGS.ANIMATIONS.CARD_MOVE_DEFAULT
            }
        });
    }

    onCardClicked(cardVisual) {
        this.interactionHelper.handleCardClick(cardVisual);
    }

    onCardDropped(cardVisual, x, y) {
        return this.interactionHelper.handleCardDrop(cardVisual, x, y);
    }

    updatePeggingInstructions() {
        if (this.gameState.phase !== PHASES.PEGGING || !this.gameState.pegging) return;
        const currentPlayer = this.gameState.pegging.getCurrentPlayer();
        const instruction = currentPlayer === this.humanPlayer ? 'Your Turn' : 'Bot is thinking...';
        this.updatePhaseView(PHASES.PEGGING, instruction);

        if (currentPlayer === this.humanPlayer) {
            const canPlay = this.humanPlayer.hand.cards.some(c => 
                this.gameState.pegging.currentTotal + Scoring.getCardValue(c) <= 31
            );
            if (!canPlay && this.humanPlayer.hand.cards.length > 0) {
                this.view.showButton('go', 'Say Go', () => {
                    this.controller.isProcessingMove = true;
                    this.gameState.playPeggingCard(this.humanPlayer, null);
                    this.view.hideButton('go');
                });
            } else {
                this.view.hideButton('go');
            }
        }
    }

    onCardPlayed(result) {
        if (result.isGo) {
            const {x, y} = this.view.layout.getFloatingTextPosition(result.player === this.humanPlayer);
            this.view.showFloatingText(x, y, "GO!", 0xffffff);
        }
        
        const isCycleEnd = result.isGo || (this.gameState.pegging && this.gameState.pegging.currentTotal === 0);
        const isPhaseEnd = this.gameState.phase !== PHASES.PEGGING;

        if (result.card) {
            if (result.player === this.humanPlayer) {
                // If the player played it, it's already animated in or handled by HandVisual.
                // We refresh the hand visuals after the logic
                this.view.visuals.table.humanHand.setCards(this.humanPlayer.hand.cards);
                this.view.updatePegging(result.cardsAtPlay, result.total);
            } else {
                // For the bot, we animate from its hand position
                this.view.visuals.table.humanHand.cardVisuals.forEach(v => v.isLocked = true);
                this.animateBotCardToPeggingArea(result.card, () => {
                    this.view.visuals.table.humanHand.cardVisuals.forEach(v => v.isLocked = false);
                    this.view.visuals.table.botHand.setCards(this.botPlayer.hand.cards);
                    this.view.updatePegging(result.cardsAtPlay, result.total);
                    this.finalizeCardPlayed(isCycleEnd, isPhaseEnd);
                });
                return; // Wait for animation before proceeding
            }
        } else {
            // It was a "Go" with no card played, just update
            this.view.updatePegging(result.cardsAtPlay, result.total);
        }

        this.finalizeCardPlayed(isCycleEnd, isPhaseEnd);
    }

    animateBotCardToPeggingArea(card, onComplete) {
        // Create a temporary visual at the bot's hand position
        const botHandPos = { x: this.view.visuals.table.botHand.x, y: this.view.visuals.table.botHand.y };
        
        // Calculate target world position for the bot's card
        const currentCount = (this.gameState.pegging?.playedCards.length || 0);
        const targetWorldPos = this.view.visuals.table.peggingArea.getNextCardPosition(currentCount);

        const layout = this.view.getLayoutSnapshot();
        const cardScale = layout.styles.peggingArea.CARD_SCALE || 0.8;

        // Bot cards are usually hidden, so let's show this one as it plays
        const visual = new CardVisual(this.view.scene, botHandPos.x, botHandPos.y, card);
        visual.setScale(cardScale);
        visual.setDepth(1000); // Ensure it's on top of everything

        this.animator.playCardToPegging(visual, targetWorldPos.x, targetWorldPos.y, () => {
            visual.destroy();
            onComplete();
        });
    }

    finalizeCardPlayed(isCycleEnd, isPhaseEnd) {
        if (isCycleEnd || isPhaseEnd) {
            this.controller.isProcessingMove = true;
            this.view.visuals.table.humanHand.cardVisuals.forEach(v => v.isLocked = true);
            this.view.scene.time.delayedCall(TIMINGS.PHASE_TRANSITIONS.PEGGING_COMPLETE, () => {
                this.controller.isProcessingMove = false;
                this.view.visuals.table.humanHand.cardVisuals.forEach(v => v.isLocked = false);
                
                if (this.gameState.pegging) {
                    this.view.updatePegging(this.gameState.pegging.playedCards, this.gameState.pegging.currentTotal);
                }
                
                if (this.gameState.phase === PHASES.PEGGING) {
                    this.updatePeggingInstructions();
                }
            });
        } else {
            this.controller.isProcessingMove = false;
            this.updatePeggingInstructions();
        }
    }
}
