import { PHASES } from '../../../game/Constants.js';
import { TIMINGS } from '../../utils/flow/timings.js';
import { TableLayout } from '../../utils/TableLayout.js';
import { CardInteractionHelper } from '../../utils/CardInteractionHelper.js';
import { TableAnimator } from '../../utils/TableAnimator.js';
import { Phase } from './Phase.js';

export class DiscardingPhase extends Phase {
    start() {
        this.activeAnimations = 0;
        
        // Clear crib visuals from previous round
        this.view.cribVisual.setCards([]);
        const isDealer = this.humanPlayer.isDealer;
        const cribLabel = isDealer ? 'To Your Crib' : 'To Opponents Crib';
        this.view.cribVisual.setLabel(cribLabel);
        this.view.updatePhase(PHASES.DISCARDING, 'Select 2 cards for the crib');
        this.interactionHelper = new CardInteractionHelper({
            scene: this.view.scene,
            handVisual: this.view.humanHandVisual,
            dropZoneVisual: this.view.cribVisual,
            animator: this.animator,
            onValidateMove: () => true, // Any card can be discarded
            onMoveApplied: () => this.updateDiscardButton(),
            config: {
                maxSelected: 2,
                immediateAction: false,
                animationDuration: TIMINGS.ANIMATIONS.GENERIC_MOVE
            }
        });

        this.updateDiscardButton();
    }

    onCardClicked(cardVisual) {
        this.interactionHelper.handleCardClick(cardVisual);
        this.updateDiscardButton();
    }

    onCardDropped(cardVisual, x, y) {
        const handled = this.interactionHelper.handleCardDrop(cardVisual, x, y);
        this.updateDiscardButton();
        return handled;
    }

    updateDiscardButton() {
        const selectedCount = this.view.humanHandVisual.getSelectedCards().length;
        if (selectedCount === 2) {
            this.view.showButton('discard', 'Confirm Discard', () => {
                const selected = this.view.humanHandVisual.getSelectedCards().map(v => v.cardData);
                this.gameState.discardToCrib(this.humanPlayer, selected);
                this.view.hideButton('discard');
            });
        } else {
            this.view.hideButton('discard');
        }
    }

    onCardDiscarded(data) {
        this.view.humanHandVisual.cardVisuals.forEach(v => {
            v.setSelected(false);
            v.baseY = 0;
        });

        // If it was the bot who discarded, animate their cards
        if (data && data.player.id !== this.humanPlayer.id) {
            this.animateBotDiscard(data.cards);
        } else {
            this.animateHumanDiscard(data.cards);
        }
    }

    animateHumanDiscard(discardedCards) {
        // Find the selected visuals that are being discarded
        const toAnimate = this.view.humanHandVisual.cardVisuals.filter(v => 
            discardedCards.some(c => c.value === v.cardData.value && c.suit === v.cardData.suit)
        );

        if (toAnimate.length === 0) {
            toAnimate.push(...this.view.humanHandVisual.cardVisuals.filter(v => v.isSelected));
        }

        toAnimate.forEach(visual => {
            visual.setFaceDown(true);
            
            // Move from hand to crib container
            this.view.humanHandVisual.remove(visual);
            this.view.cribVisual.addForAnimation(visual);
        });

        let completedCount = 0;
        toAnimate.forEach((visual, index) => {
            // Target coordinates are local to the crib container
            const targetX = TableLayout.REL.CRIB_PARKED_X_OFFSET + index * 2;
            const targetY = 0 + index * 2;

            this.activeAnimations++;
            this.animator.moveCardToCrib(visual, targetX, targetY, index * 100, () => {
                completedCount++;
                this.activeAnimations--;
                if (completedCount === toAnimate.length) {
                    this.view.humanHandVisual.setCards(this.humanPlayer.hand.cards);
                    this.view.botHandVisual.setCards(this.controller.botPlayer.hand.cards);
                    
                    // We do NOT call updateCrib immediately here to avoid destroying 
                    // the animating visuals while they are visible.
                    // Instead we just check for phase transition.
                    this.checkPhaseTransition();
                }
            });
        });
    }

    animateBotDiscard(discardedCards) {
        const cardVisuals = [...this.view.botHandVisual.cardVisuals];
        const toAnimate = cardVisuals.slice(-discardedCards.length);
        
        toAnimate.forEach(visual => {
            // Move from bot hand to crib container
            this.view.botHandVisual.remove(visual);
            this.view.cribVisual.addForAnimation(visual);
        });

        let completedCount = 0;
        toAnimate.forEach((visual, index) => {
            // Target coordinates are local to the crib container
            const targetX = TableLayout.REL.CRIB_PARKED_X_OFFSET + index * 2;
            const targetY = 0 + index * 2;

            this.activeAnimations++;
            this.animator.moveCardToCrib(visual, targetX, targetY, index * 100, () => {
                completedCount++;
                this.activeAnimations--;
                if (completedCount === toAnimate.length) {
                    this.view.botHandVisual.setCards(this.controller.botPlayer.hand.cards);
                    this.view.humanHandVisual.setCards(this.humanPlayer.hand.cards);
                    
                    this.checkPhaseTransition();
                }
            });
        });
    }

    checkPhaseTransition() {
        if (this.activeAnimations === 0 && this.gameState.discardedToCrib.every(d => d)) {
            // ALL discard animations finished. NOW we can safely refresh the crib visual.
            this.view.updateCrib(this.gameState.crib.cards);
            this.view.updatePhase(this.gameState.phase, '');
        }
    }
}
