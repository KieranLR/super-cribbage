import { GameLogicPhase } from './GameLogicPhase.js';

export class DiscardingLogic extends GameLogicPhase {
    start() {
    }

    checkBotTurns() {
        if (this.gameState.winner) return;
        this.gameState.players.forEach((player, index) => {
            if (player.isBot && !this.gameState.discardedToCrib[index]) {
                const discards = player.makeDiscardDecision();
                this.discardToCrib(player, discards);
            }
        });
    }

    discardToCrib(player, cards) {
        const playerIndex = this.gameState.players.indexOf(player);
        if (playerIndex === -1 || this.gameState.discardedToCrib[playerIndex]) return;

        if (cards.length !== 2) {
            throw new Error("Each player must discard 2 cards to the crib.");
        }

        cards.forEach(card => {
            const removed = player.hand.removeCard(card);
            if (removed) {
                this.gameState.crib.addCard(removed);
            }
        });

        // Store the remaining 4 cards for final counting after pegging removes them
        player.handForCounting = [...player.hand.cards];

        this.gameState.discardedToCrib[playerIndex] = true;
        this.gameState.emit('cardDiscarded', { player, cards });

        // If everyone has discarded, move to next phase
        if (this.gameState.discardedToCrib.every(d => d)) {
            this.gameState.emit('allDiscarded', {});
        }
    }
}
