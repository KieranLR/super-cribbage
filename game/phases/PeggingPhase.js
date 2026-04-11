import { GamePhase } from './GamePhase.js';
import { Pegging } from '../Pegging.js';

export class PeggingPhase extends GamePhase {
    start() {
        // Player to the left of dealer starts pegging
        const startingPlayerIndex = (this.gameState.dealerIndex + 1) % this.gameState.players.length;
        this.gameState.pegging = new Pegging(this.gameState.players, startingPlayerIndex);
        this.checkBotTurns();
    }

    checkBotTurns() {
        if (this.gameState.winner || !this.gameState.pegging) return;
        const currentPlayer = this.gameState.pegging.getCurrentPlayer();
        if (currentPlayer && currentPlayer.isBot) {
            // If the total was just reset to 0, or someone said Go, we should wait longer
            // for the UI to display the last card/points.
            const isNewCycle = this.gameState.pegging.currentTotal === 0;
            const delay = isNewCycle ? 2500 : 1500;
            
            setTimeout(() => {
                if (this.gameState.phase !== "PEGGING" || !this.gameState.pegging) return;
                if (this.gameState.pegging.getCurrentPlayer() !== currentPlayer) return;
                const card = currentPlayer.makePeggingDecision(this.gameState.pegging.currentTotal);
                this.playPeggingCard(currentPlayer, card);
            }, delay);
        }
    }

    playPeggingCard(player, card) {
        if (!this.gameState.pegging) return;

        let result;
        if (card === null) {
            result = this.gameState.pegging.sayGo(player);
            if (result.points > 0) {
                this.gameState.emit('pointsEarned', { player, points: result.points, reason: 'Pegging' });
            }
        } else {
            result = this.gameState.pegging.playCard(player, card);
            result.card = card;
            if (result.points > 0) {
                this.gameState.emit('pointsEarned', { player, points: result.points, reason: 'Pegging' });
            }
        }

        this.gameState.emit('cardPlayed', result);

        if (result.cyclePoints && result.cyclePoints.points > 0) {
            this.gameState.emit('pointsEarned', { 
                player: result.cyclePoints.player, 
                points: result.cyclePoints.points, 
                reason: 'Pegging' 
            });
        }

        this.gameState.checkWin();

        if (this.gameState.pegging.isPhaseComplete()) {
            this.gameState.nextPhase(); // Move to COUNTING
        } else {
            this.checkBotTurns();
        }
    }
}
