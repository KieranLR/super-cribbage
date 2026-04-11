import { PHASES } from '../../../game/Constants.js';
import { CardInteractionHelper } from '../../utils/CardInteractionHelper.js';
import { Phase } from './Phase.js';

export class DiscardingPhase extends Phase {
    start() {
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
            onValidateMove: () => true, // Any card can be discarded
            onMoveApplied: () => this.updateDiscardButton(),
            config: {
                maxSelected: 2,
                immediateAction: false,
                animationDuration: 200
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
        this.view.humanHandVisual.setCards(this.humanPlayer.hand.cards);
        this.view.botHandVisual.setCards(this.controller.botPlayer.hand.cards);

        // If it was the bot who discarded, we show their cards set aside
        if (data && data.player.id !== this.humanPlayer.id) {
            this.view.cribVisual.setSubmittedCards(data.cards);
        } else {
            // If human discarded, we just update the crib normally (it will contain both if both finished)
            this.view.updateCrib(this.gameState.crib.cards);
        }
    }
}
