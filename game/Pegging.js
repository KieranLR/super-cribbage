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
            throw new Error(`It is not ${player.name}'s turn. Current turn: ${this.getCurrentPlayer().name}`);
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

        // Capture cards for the result BEFORE reset
        const cardsAtPlay = [...this.playedCards];
        const totalAtPlay = this.currentTotal;

        // Check if cycle is over (e.g. 31)
        let isGo = false;
        let cyclePoints = null;
        if (this.currentTotal === MAX_PEGGING_TOTAL) {
            cyclePoints = this.handleCycleEnd();
            isGo = true;
        } else {
            // Check if anyone else can play
            if (this.isCycleComplete()) {
                cyclePoints = this.handleCycleEnd();
                isGo = true;
            } else {
                this.nextTurn();
            }
        }

        return {
            player,
            points,
            total: totalAtPlay,
            isGo,
            cardsAtPlay,
            cyclePoints
        };
    }

    /**
     * Current player says "Go".
     * @param {import('./Player.js').Player} player
     * @returns {Object} Result
     */
    sayGo(player) {
        if (player !== this.getCurrentPlayer()) {
            throw new Error("It is not this player's turn.");
        }

        if (this.canPlayerPlay(player)) {
            throw new Error("Player has cards they can play.");
        }

        this.playerCanPlay[this.turnIndex] = false;
        
        const cardsAtPlay = [...this.playedCards];
        const totalAtPlay = this.currentTotal;

        let isGo = false;
        let cyclePoints = null;
        // If everyone has said "Go", or no one can play anymore
        if (this.isCycleComplete()) {
            cyclePoints = this.handleCycleEnd();
            isGo = true;
        } else {
            this.nextTurn();
        }

        return {
            player,
            points: 0,
            isGo,
            total: totalAtPlay,
            cardsAtPlay,
            cyclePoints
        };
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
     * @returns {Object|null} Info about points earned at cycle end, if any.
     */
    handleCycleEnd() {
        let cyclePoints = null;
        // Last player to play gets a point for the "Go" (or 2 for 31)
        // If the total was exactly 31, they already got 2 points in countPegging.
        // If not, they get 1 point for the "Go".
        if (this.currentTotal !== 31 && this.lastPlayerToPlay) {
            this.lastPlayerToPlay.addPoints(1);
            cyclePoints = {
                player: this.lastPlayerToPlay,
                points: 1
            };
        }
        
        this.resetCycle();
        return cyclePoints;
    }

    /**
     * Resets for a new "Go" cycle.
     */
    resetCycle() {
        this.currentTotal = 0;
        this.playedCards = [];
        this.playerCanPlay = this.players.map(() => true);
        
        // Update playerHasCards in case someone ran out
        this.playerHasCards = this.players.map(p => p.hand.cards.length > 0);
        
        // The player who would have played next starts the next cycle
        // But we MUST use the player who was last to play as the reference.
        // In Cribbage, the person to the left of the last player starts.
        if (this.lastPlayerToPlay) {
            this.turnIndex = this.players.indexOf(this.lastPlayerToPlay);
        }
        this.nextTurn();
        
        this.lastPlayerToPlay = null;
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
