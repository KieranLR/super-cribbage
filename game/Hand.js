export class Hand {
    constructor() {
        /** @type {import('./Card.js').Card[]} */
        this.cards = [];
    }

    /**
     * Adds a card to the hand.
     * @param {import('./Card.js').Card} card 
     */
    addCard(card) {
        if (card) {
            this.cards.push(card);
        }
    }

    /**
     * Removes a specific card from the hand.
     * @param {import('./Card.js').Card} card 
     * @returns {import('./Card.js').Card|null}
     */
    removeCard(card) {
        const index = this.cards.indexOf(card);
        if (index !== -1) {
            return this.cards.splice(index, 1)[0];
        }
        return null;
    }

    /**
     * Empties the hand for the next round.
     */
    clear() {
        this.cards = [];
    }
}
