import { PHASES } from '../../../game/Constants.js';
import { Phase } from './Phase.js';

export class DiscardingPhase extends Phase {
    start() {
        const isDealer = this.humanPlayer.isDealer;
        const cribLabel = isDealer ? 'To Your Crib' : 'To Opponents Crib';
        this.view.cribVisual.setLabel(cribLabel);
        this.view.updatePhase(PHASES.DISCARDING, 'Select 2 cards for the crib');
        this.updateDiscardButton();
    }

    onCardClicked(cardVisual) {
        console.log(cardVisual);
        if (this.isAlreadyInCrib(cardVisual)) {
            console.log('card was already in crib');
            cardVisual.setSelected(false);
            cardVisual.baseY = 0;
            this.updateCardPositions();
        } else {
            const selectedCount = this.view.humanHandVisual.getSelectedCards().length;
            if (!cardVisual.isSelected && selectedCount >= 2) return;
            cardVisual.setSelected(!cardVisual.isSelected);
            this.updateCardPositions();
        }
        this.updateDiscardButton();
    }

    onCardDropped(cardVisual, x, y) {
        console.log('card dropped', cardVisual);
        if (this.view.cribVisual.isPointInside(x, y)) {
            const selectedCount = this.view.humanHandVisual.getSelectedCards().length;
            if (cardVisual.isSelected || selectedCount < 2) {
                // If it wasn't already selected, this is a change
                const selectionChanged = !cardVisual.isSelected;
                cardVisual.setSelected(true);
                this.updateDiscardButton();
                this.updateCardPositions();
                return true;
            }
        } else {
            // Dragged outside of drop zone - deselect if it was selected
            if (cardVisual.isSelected) {
                cardVisual.setSelected(false);
                cardVisual.baseY = 0;
                this.updateDiscardButton();
                this.updateCardPositions();
                return true; // We handled it by returning to hand
            }
            else {
                cardVisual.baseY = 0;
                this.updateDiscardButton();
                this.updateCardPositions();
            }
        }

        // We only call these if there's a chance something changed, 
        // but for normal hand reordering (not selected, not in crib zone), 
        // we might not need them.
        // However, to be safe and match user's previous state where it "worked" but was annoying,
        // we can just return false here and let HandVisual.reorderCards() handle the hand.
        return false;
    }

    isAlreadyInCrib(cardVisual) {
        // This is a helper to check if we should treat it as "in the zone"
        // For now, we use selection state to represent "in the zone"
        return cardVisual.isSelected;
    }

    updateCardPositions() {
        const selectedCards = this.view.humanHandVisual.getSelectedCards();
        const cribPos = { x: this.view.cribVisual.x, y: this.view.cribVisual.y };
        const handPos = { x: this.view.humanHandVisual.x, y: this.view.humanHandVisual.y };

        selectedCards.forEach((visual, index) => {
            // Calculate position relative to HandVisual
            // Increased spacing for the second card (further right)
            const spacing = 30;
            const targetX = cribPos.x - handPos.x + (index * spacing - spacing / 2);
            const targetY = cribPos.y - handPos.y;
            
            this.view.scene.tweens.add({
                targets: visual,
                x: targetX,
                y: targetY,
                duration: 200,
                ease: 'Power2',
                overwrite: true,
                onStart: () => {
                    visual.baseY = targetY; // Set it immediately so hover tweens use the new value
                }
            });
        });

        // Cards not selected should be in the hand
        this.view.humanHandVisual.cardVisuals.forEach(visual => {
            if (!visual.isSelected) {
                visual.baseY = 0;
            }
        });
        this.view.humanHandVisual.reorderCards();
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
        this.view.cribVisual.setLabel('Crib');
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
