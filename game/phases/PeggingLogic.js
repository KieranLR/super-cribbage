import { GameLogicPhase } from './GameLogicPhase.js';
import { Pegging } from '../Pegging.js';

export class PeggingLogic extends GameLogicPhase {
    start() {
        // Player to the left of dealer starts pegging
        const startingPlayerIndex = (this.gameState.dealerIndex + 1) % this.gameState.players.length;
        this.gameState.pegging = new Pegging(this.gameState.players, startingPlayerIndex);
    }

    checkBotTurns() {
        if (this.gameState.winner || !this.gameState.pegging) return;
        const currentPlayer = this.gameState.pegging.getCurrentPlayer();
        if (currentPlayer && currentPlayer.isBot) {
            const card = currentPlayer.makePeggingDecision(this.gameState.pegging.currentTotal);
            this.playPeggingCard(currentPlayer, card);
        }
    }

    playPeggingCard(player, card) {
        if (!this.gameState.pegging) return;

        let result;
        if (card === null) {
            result = this.gameState.pegging.sayGo(player);
            if (result.points > 0) {
                this.emit('pointsEarned', { player, points: result.points, reason: 'Pegging' });
            }
        } else {
            result = this.gameState.pegging.playCard(player, card);
            result.card = card;
            if (result.points > 0) {
                this.emit('pointsEarned', { player, points: result.points, reason: 'Pegging' });
            }
        }

        this.emit('cardPlayed', result);

        if (result.cyclePoints && result.cyclePoints.points > 0) {
            this.emit('pointsEarned', { 
                player: result.cyclePoints.player, 
                points: result.cyclePoints.points, 
                reason: 'Pegging' 
            });
        }

        this.checkWin();

        if (this.gameState.pegging.isPhaseComplete()) {
            this.emit('peggingComplete', {});
        }
    }
}
