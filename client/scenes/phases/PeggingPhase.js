import { PHASES } from '../../../game/Constants.js';
import { Scoring } from '../../../game/Scoring.js';
import { Phase } from './Phase.js';

export class PeggingPhase extends Phase {
    start() {
        this.updatePeggingInstructions();
    }

    onCardClicked(cardVisual) {
        const pegging = this.gameState.pegging;
        if (pegging && pegging.getCurrentPlayer() === this.humanPlayer) {
            this.controller.isProcessingMove = true;
            this.gameState.playPeggingCard(this.humanPlayer, cardVisual.cardData);
        }
    }

    updatePeggingInstructions() {
        if (this.gameState.phase !== PHASES.PEGGING) return;
        const currentPlayer = this.gameState.pegging.getCurrentPlayer();
        const instruction = currentPlayer === this.humanPlayer ? 'Your Turn' : 'Bot is thinking...';
        this.view.updatePhase(PHASES.PEGGING, instruction);

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
            const x = this.view.scene.scale.width / 2;
            const y = this.view.scene.scale.height / 2 - 150;
            this.view.showFloatingText(x, y, "GO!", 0xffffff);
        }
        
        const isCycleEnd = result.isGo || this.gameState.pegging.currentTotal === 0;
        const isPhaseEnd = this.gameState.phase !== PHASES.PEGGING;

        this.view.updatePegging(result.cardsAtPlay, result.total);

        if (result.card) {
            if (result.player === this.humanPlayer) {
                this.view.humanHandVisual.setCards(this.humanPlayer.hand.cards);
            } else {
                this.view.botHandVisual.setCards(this.botPlayer.hand.cards);
            }
        }

        if (isCycleEnd || isPhaseEnd) {
            this.controller.isProcessingMove = true;
            this.view.scene.time.delayedCall(1500, () => {
                this.controller.isProcessingMove = false;
                this.view.updatePegging(this.gameState.pegging.playedCards, this.gameState.pegging.currentTotal);
                
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
