import { MAX_PEGGING_TOTAL } from './Constants.js';
import { Scoring } from './Scoring.js';

export class Pegging {
    /**
     * @param {import('./Player.js').Player[]} players - List of players in turn order.
     * @param {number} startingPlayerIndex - Index of the player who starts the pegging.
     */
    constructor(players, startingPlayerIndex = 0) {
        this.players = players;
        this.turnIndex = startingPlayerIndex;
        this.currentTotal = 0;
        this.playedCards = []; // Cards in the current cycle
        this.allPlayedCards = []; // All cards played in this round
        this.playerCanPlay = players.map(() => true);
        this.playerHasCards = players.map(p => p.hand.cards.length > 0);
        this.lastPlayerToPlay = null;
    }

    /**
     * Attempts to play a card for the current player.
     * @param {import('./Player.js').Player} player
     * @param {import('./Card.js').Card} card
     * @returns {Object|null} Result of the play, or null if invalid.
     */
    playCard(player, card) {
        if (player !== this.getCurrentPlayer()) {
            throw new Error("It is not this player's turn.");
        }

        const cardValue = Scoring.getCardValue(card);
        if (this.currentTotal + cardValue > MAX_PEGGING_TOTAL) {
            throw new Error("Card exceeds maximum pegging total of 31.");
        }

        // Remove card from player's hand
        player.hand.removeCard(card);
        this.playedCards.push(card);
        this.allPlayedCards.push(card);
        this.currentTotal += cardValue;
        this.lastPlayerToPlay = player;

        // Calculate points
        const points = Scoring.countPegging(this.playedCards, this.currentTotal);
        player.addPoints(points);

        // Update player card status
        this.playerHasCards[this.turnIndex] = player.hand.cards.length > 0;

        // Check if cycle is over (e.g. 31)
        if (this.currentTotal === MAX_PEGGING_TOTAL) {
            this.handleCycleEnd();
        } else {
            this.nextTurn();
            // If the next player cannot play and everyone else also cannot, the cycle ends
            if (this.isCycleComplete()) {
                this.handleCycleEnd();
            }
        }

        return {
            points,
            total: this.currentTotal,
            isGo: this.isCycleComplete()
        };
    }

    /**
     * Current player says "Go".
     * @param {import('./Player.js').Player} player
     */
    sayGo(player) {
        if (player !== this.getCurrentPlayer()) {
            throw new Error("It is not this player's turn.");
        }

        if (this.canPlayerPlay(player)) {
            throw new Error("Player has cards they can play.");
        }

        this.playerCanPlay[this.turnIndex] = false;
        
        // If everyone has said "Go", or no one can play anymore
        if (this.isCycleComplete()) {
            // Last player to play gets a point for the "Go" (or 2 for 31)
            // But 31 is already handled by countPegging.
            // A simple "Go" is 1 point.
            this.handleCycleEnd();
        } else {
            this.nextTurn();
        }
    }

    /**
     * Moves to the next player who has cards and hasn't said "Go".
     */
    nextTurn() {
        let nextIndex = (this.turnIndex + 1) % this.players.length;
        let checked = 0;

        while (checked < this.players.length) {
            if (this.playerHasCards[nextIndex] && this.playerCanPlay[nextIndex]) {
                this.turnIndex = nextIndex;
                return;
            }
            nextIndex = (nextIndex + 1) % this.players.length;
            checked++;
        }
    }

    /**
     * Checks if a specific player can play any card from their hand.
     * @param {import('./Player.js').Player} player
     * @returns {boolean}
     */
    canPlayerPlay(player) {
        return player.hand.cards.some(card => 
            this.currentTotal + Scoring.getCardValue(card) <= MAX_PEGGING_TOTAL
        );
    }

    /**
     * Checks if the current cycle (to 31 or Go) is complete.
     * @returns {boolean}
     */
    isCycleComplete() {
        return this.playerCanPlay.every((canPlay, index) => 
            !canPlay || !this.playerHasCards[index] || !this.canPlayerPlay(this.players[index])
        );
    }

    /**
     * Handles the end of a cycle (resetting total and played cards).
     */
    handleCycleEnd() {
        // Last player to play gets a point for the "Go" (or 2 for 31)
        // If the total was exactly 31, they already got 2 points in countPegging.
        // If not, they get 1 point for the "Go".
        if (this.currentTotal !== 31 && this.lastPlayerToPlay) {
            this.lastPlayerToPlay.addPoints(1);
        }
        
        this.resetCycle();
    }

    /**
     * Resets for a new "Go" cycle.
     */
    resetCycle() {
        this.currentTotal = 0;
        this.playedCards = [];
        this.playerCanPlay = this.players.map(() => true);
        this.lastPlayerToPlay = null;
        
        // Update playerHasCards in case someone ran out
        this.playerHasCards = this.players.map(p => p.hand.cards.length > 0);
        
        // The player who would have played next starts the next cycle
        this.nextTurn();
    }

    /**
     * Checks if all cards have been played.
     * @returns {boolean}
     */
    isPhaseComplete() {
        return this.playerHasCards.every(hasCards => !hasCards);
    }

    /**
     * @returns {import('./Player.js').Player}
     */
    getCurrentPlayer() {
        return this.players[this.turnIndex];
    }
}
