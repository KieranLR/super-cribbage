import { Deck } from './Deck.js';
import { Crib } from './Crib.js';
import { PHASES, WINNING_SCORE } from './Constants.js';

export class GameState {
    /**
     * @param {Player[]} players - The players participating in the game.
     * @param {Object} [options] - Configuration options for the game.
     */
    constructor(players, options = {}) {
        this.players = players;
        this.isHeadless = options.isHeadless || false;
        this.deck = new Deck();
        this.phase = PHASES.STARTING_CUT;
        this.dealerIndex = -1; // No dealer yet
        this.starterCard = null;
        this.crib = null;
        this.pegging = null;
        this.winner = null;

        // Keep track of which players have discarded to the crib
        this.discardedToCrib = players.map(() => false);
        
        // Tracking cuts for the starting cut phase
        this.startingCuts = players.map(() => null);
        
        // Ensure initial dealer is set
        this.updateDealer();
    }

    /**
     * Sets the isDealer flag on each player correctly.
     */
    updateDealer() {
        this.players.forEach((player, index) => {
            player.isDealer = (index === this.dealerIndex);
        });
        // Create a new Crib for the current dealer
        if (this.dealerIndex !== -1) {
            this.crib = new Crib(this.players[this.dealerIndex]);
        }
    }

    /**
     * Checks if any player has reached the winning score.
     * @returns {boolean}
     */
    checkWin() {
        for (const player of this.players) {
            if (player.score >= WINNING_SCORE) {
                this.winner = player;
                this.phase = PHASES.GAME_OVER;
                return true;
            }
        }
        return false;
    }

    getPublicState() {
        return {
            phase: this.phase,
            players: this.players.map(player => ({
                id: player.id,
                name: player.name,
                score: player.score,
                isDealer: player.isDealer,
                handSize: player.hand.cards.length,
                hand: [...player.hand.cards] // For now, we'll return the full hand for UI
            })),
            dealerIndex: this.dealerIndex,
            starterCard: this.starterCard,
            cribSize: this.crib ? this.crib.cards.length : 0,
            crib: this.crib ? [...this.crib.cards] : [], // UI might need to see the crib at certain phases
            pegging: (this.pegging && typeof this.pegging.isPhaseComplete === 'function') ? {
                currentTotal: this.pegging.currentTotal,
                playedCards: [...this.pegging.playedCards],
                allPlayedCards: [...this.pegging.allPlayedCards],
                turnIndex: this.pegging.turnIndex,
                lastPlayerToPlay: this.pegging.lastPlayerToPlay ? {
                    id: this.pegging.lastPlayerToPlay.id,
                    name: this.pegging.lastPlayerToPlay.name
                } : null
            } : null,
            winner: this.winner ? {
                id: this.winner.id,
                name: this.winner.name,
                score: this.winner.score
            } : null
        };
    }
}
