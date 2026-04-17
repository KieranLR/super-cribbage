import { GameLogicPhase } from './GameLogicPhase.js';
import { PHASES } from '../Constants.js';

export class CuttingLogic extends GameLogicPhase {
    start() {
        this.cutStarterCard();
    }

    cutStarterCard() {
        this.gameState.starterCard = this.gameState.deck.deal();
        // Let the controller/client handle nextPhase after showing the card
        this.emit('starterCardCut', { card: this.gameState.starterCard });

        // If starter card is a Jack, dealer gets 2 points ("His Heels")
        if (this.gameState.starterCard.rank === 'Jack') {
            const dealer = this.gameState.players[this.gameState.dealerIndex];
            dealer.addPoints(2);
            this.emit('pointsEarned', { player: dealer, points: 2, reason: 'His Heels' });
            this.checkWin();
        }
    }
}
