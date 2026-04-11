import { GameLogicPhase } from './GameLogicPhase.js';
import { PHASES } from '../Constants.js';

export class StartingCutLogic extends GameLogicPhase {
    start() {
        this.gameState.startingCuts = this.gameState.players.map(() => null);
        this.gameState.deck.reset();
        this.gameState.deck.shuffle();
    }

    checkBotTurns() {
        if (this.gameState.winner) return;
        this.gameState.players.forEach((player, index) => {
            if (player.isBot && !this.gameState.startingCuts[index]) {
                const cardIndex = Math.floor(Math.random() * this.gameState.deck.cards.length);
                this.cutForDealer(player, cardIndex);
            }
        });
    }

    cutForDealer(player, cardIndex) {
        const playerIndex = this.gameState.players.indexOf(player);
        if (playerIndex === -1 || this.gameState.startingCuts[playerIndex]) return;

        // Pick a card from the deck.
        const card = this.gameState.deck.cards.splice(cardIndex % this.gameState.deck.cards.length, 1)[0];
        this.gameState.startingCuts[playerIndex] = card;

        this.gameState.emit('startingCardCut', { player, card, cardIndex });

        // If everyone has cut, determine the dealer
        if (this.gameState.startingCuts.every(c => c !== null)) {
            this.determineFirstDealer();
        }
    }

    determineFirstDealer() {
        // Lowest card deals. Ace is low.
        let lowestRank = 15;
        let dealerIdx = 0;
        let tie = false;

        this.gameState.startingCuts.forEach((card, index) => {
            const rank = card.getRank();
            if (rank < lowestRank) {
                lowestRank = rank;
                dealerIdx = index;
                tie = false;
            } else if (rank === lowestRank) {
                tie = true;
            }
        });

        if (tie) {
            // If there's a tie for lowest, everyone cuts again
            this.gameState.startingCuts = this.gameState.players.map(() => null);
            this.gameState.deck.reset();
            this.gameState.deck.shuffle();
            this.gameState.emit('startingCutTie', {});
        } else {
            this.gameState.dealerIndex = dealerIdx;
            this.gameState.updateDealer();
            this.gameState.emit('firstDealerDetermined', { dealer: this.gameState.players[this.gameState.dealerIndex] });
        }
    }
}
