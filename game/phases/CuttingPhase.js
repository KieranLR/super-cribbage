import { GamePhase } from './GamePhase.js';
import { PHASES } from '../Constants.js';

export class CuttingPhase extends GamePhase {
    start() {
        this.cutStarterCard();
    }

    cutStarterCard() {
        this.gameState.starterCard = this.gameState.deck.deal();
        this.gameState.emit('starterCardCut', { card: this.gameState.starterCard });

        // If starter card is a Jack, dealer gets 2 points ("His Heels")
        if (this.gameState.starterCard.rank === 'Jack') {
            const dealer = this.gameState.players[this.gameState.dealerIndex];
            dealer.addPoints(2);
            this.gameState.emit('pointsEarned', { player: dealer, points: 2, reason: 'His Heels' });
            this.gameState.checkWin();
        }

        // Wait a bit for the player to see the starter card before moving to pegging
        setTimeout(() => {
            if (this.gameState.phase === PHASES.CUTTING) {
                this.gameState.nextPhase();
            }
        }, 1500);
    }
}
