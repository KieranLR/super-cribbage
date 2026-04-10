import { Hand } from './Hand.js';

export class Player {
    /**
     * @param {string} id - Unique identifier (e.g. Discord ID)
     * @param {string} name - Display name
     */
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.score = 0;
        this.isDealer = false;
        this.hand = new Hand();
    }

    /**
     * Updates the player's total score.
     * @param {number} amount 
     */
    addPoints(amount) {
        this.score += amount;
    }

    /**
     * Clears player's hand for the next round.
     */
    clearHand() {
        this.hand.clear();
    }
}
