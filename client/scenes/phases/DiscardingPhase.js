import { PHASES } from '../../../game/Constants.js';
import { TIMINGS } from '../../utils/flow/timings.js';
import { TableLayout } from '../../utils/TableLayout.js';
import { CardInteractionHelper } from '../../utils/CardInteractionHelper.js';
import { TableAnimator } from '../../utils/TableAnimator.js';
import { Phase } from './Phase.js';

export class DiscardingPhase extends Phase {
    start() {
        const isDealer = this.humanPlayer.isDealer;
        this.view.visuals.table.crib.setCards([]); // Clear cards from previous round/phase
        const cribLabel = isDealer ? 'To Your Crib' : 'To Opponents Crib';
        this.updatePhaseView(PHASES.DISCARDING, 'Select 2 cards for the crib');
        this.view.visuals.table.crib.setLabel(cribLabel);
        this.interactionHelper = new CardInteractionHelper({
            scene: this.view.scene,
            handVisual: this.view.visuals.table.humanHand,
            dropZoneVisual: this.view.visuals.table.crib,
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
        const selectedCount = this.view.visuals.table.humanHand.getSelectedCards().length;
        if (selectedCount === 2) {
            this.view.showButton('discard', 'Confirm Discard', () => {
                const selected = this.view.visuals.table.humanHand.getSelectedCards().map(v => v.cardData);
                this.gameState.discardToCrib(this.humanPlayer, selected);
                this.view.hideButton('discard');
            });
        } else {
            this.view.hideButton('discard');
        }
    }

    onCardDiscarded(data) {
        this.view.visuals.table.humanHand.cardVisuals.forEach(v => {
            v.setSelected(false);
            v.baseY = 0;
        });

        const isBot = data && data.player.id !== this.humanPlayer.id;
        const handVisual = isBot ? this.view.visuals.table.botHand : this.view.visuals.table.humanHand;

        this.animateDiscard(handVisual, data.cards, isBot, () => {
            const remainingCards = data.player.hand.cards;
            if (isBot) {
                this.view.updateHands(this.humanPlayer.hand.cards, remainingCards);
            } else {
                handVisual.setCards(remainingCards);
            }
            this.checkPhaseTransition();
        });
    }

    animateDiscard(playerHand, cards, isBot, completionCallback) {
        const toAnimate = this._prepareDiscardVisuals(playerHand, cards, isBot);
        let completed = 0;

        const layout = this.view.getLayoutSnapshot();
        const config = layout.styles.crib;
        const cardScale = config.CARD_SCALE || 1.0;

        toAnimate.forEach((visual, index) => {
            // Use the same coordinate space logic as CribVisual.setSubmittedCards
            // But we can add it to submittedVisuals and animate it to its parked position
            const targetX = (config.CRIB_PARKED_X_OFFSET + index * 2) * cardScale;
            const targetY = index * 2 * cardScale;

            this.view.flow.startAnimation();
            this.animator.moveCardToCrib(visual, targetX, targetY, index * 100, () => {
                completed++;
                this.view.flow.endAnimation();
                if (completed === toAnimate.length && completionCallback) {
                    completionCallback();
                }
            }, cardScale);
        });
    }

    _prepareDiscardVisuals(playerHand, cards, isBot) {
        let toAnimate = [];
        if (isBot) {
            toAnimate = playerHand.cardVisuals.slice(-cards.length);
        } else {
            toAnimate = playerHand.cardVisuals.filter(v =>
                cards.some(c => c.value === v.cardData.value && c.suit === v.cardData.suit)
            );
            if (toAnimate.length === 0) {
                toAnimate = playerHand.cardVisuals.filter(v => v.isSelected);
            }
        }

        toAnimate.forEach(visual => {
            if (!isBot) visual.setFaceDown(true);
            
            // Remove from hand visual tracking
            const idx = playerHand.cardVisuals.indexOf(visual);
            if (idx > -1) playerHand.cardVisuals.splice(idx, 1);

            // Transition to crib container
            this.view.visuals.table.crib.addForAnimation(visual, playerHand);
            playerHand.remove(visual);
        });

        return toAnimate;
    }

    checkPhaseTransition() {
        // We wait for allDiscarded event now, instead of checking manually.
        // This is handled in onAllDiscarded.
    }

    onAllDiscarded() {
        this.view.flow.waitForAnimations(() => {
            const visuals = this.view.visuals.table.crib.cardVisuals.concat(this.view.visuals.table.crib.submittedVisuals);
            if (visuals.length === 0) {
                this.gameState.nextPhase();
                return;
            }

            // Update label to "Your Crib" or "Opponents Crib" now that it's parked
            const isDealer = this.humanPlayer.isDealer;
            const parkedLabel = isDealer ? 'Your Crib' : 'Opponents Crib';
            this.view.visuals.table.crib.setLabel(parkedLabel);

            // Start the next phase immediately so its transitionCrib runs at the same time
            this.gameState.nextPhase();

            const layout = this.view.getLayoutSnapshot();
            const cardScale = layout.styles.crib.CARD_SCALE || 1.0;

            this.view.flow.startAnimation();
            this.animator.centerCribCards(visuals, 2, TIMINGS.ANIMATIONS.PEGGING_UI_MOVE, () => {
                this.view.flow.endAnimation();
                this.view.updateCrib(this.gameState.crib.cards);
            }, cardScale);
        });
    }
}
