import { Hand } from './Hand.js';

export class Crib extends Hand {
    /**
     * @param {import('./Player.js').Player} owner - Reference to the player who is dealing.
     */
    constructor(owner) {
        super();
        this.owner = owner;
    }
}
