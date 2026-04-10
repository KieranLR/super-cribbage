import { PHASES } from '../../../game/Constants.js';
import { Phase } from './Phase.js';

export class DiscardingPhase extends Phase {
    start() {
        this.view.updatePhase(PHASES.DISCARDING, 'Select 2 cards for the crib');
        this.updateDiscardButton();
    }

    onCardClicked(cardVisual) {
        cardVisual.setSelected(!cardVisual.isSelected);
        this.updateDiscardButton();
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

    onCardDiscarded() {
        this.view.humanHandVisual.setCards(this.humanPlayer.hand.cards);
        this.view.botHandVisual.setCards(this.controller.botPlayer.hand.cards);
        this.view.updateCrib(this.gameState.crib.cards);
    }
}
