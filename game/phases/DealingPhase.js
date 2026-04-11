import { GamePhase } from './GamePhase.js';

export class DealingPhase extends GamePhase {
    start() {
        // No auto-rotation here; Dealer rotation is now handled in GameState.nextPhase()
        // or specifically in the transitions leading to DEALING.
        // Or we keep it here but we need to ensure determineFirstDealer doesn't double-rotate.
        
        this.gameState.updateDealer();

        // Reset game elements
        this.gameState.deck.reset();
        this.gameState.deck.shuffle();
        this.gameState.starterCard = null;
        this.gameState.pegging = null;
        this.gameState.discardedToCrib = this.gameState.players.map(() => false);

        // Clear player hands
        this.gameState.players.forEach(p => p.clearHand());
        
        this.dealCards();
    }

    dealCards() {
        // Assuming 2 players for now as per common Cribbage rules.
        // Each player gets 6 cards.
        this.gameState.players.forEach(player => {
            for (let i = 0; i < 6; i++) {
                const card = this.gameState.deck.deal();
                player.hand.addCard(card);
            }
        });

        this.gameState.emit('cardsDealt', { players: this.gameState.players });
        this.gameState.nextPhase(); // Move to DISCARDING
    }
}
