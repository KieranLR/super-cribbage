import { Card, Suits, Values } from './Card.js';

export class Deck {
    constructor() {
        this.cards = [];
        this.reset();
    }

    /**
     * Re-initializes the deck with 52 standard cards.
     */
    reset() {
        this.cards = [];
        for (const suit of Object.values(Suits)) {
            for (const value of Object.values(Values)) {
                this.cards.push(new Card(suit, value));
            }
        }
    }

    /**
     * Shuffles the current deck of cards.
     */
    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    /**
     * Deals (removes and returns) a single card from the deck.
     * @returns {Card|null}
     */
    deal() {
        return this.cards.pop() || null;
    }

    /**
     * Deals multiple cards from the deck.
     * @param {number} count 
     * @returns {Card[]}
     */
    dealMany(count) {
        const dealt = [];
        for (let i = 0; i < count; i++) {
            const card = this.deal();
            if (card) {
                dealt.push(card);
            }
        }
        return dealt;
    }

    /**
     * Returns the current number of cards remaining in the deck.
     * @returns {number}
     */
    remaining() {
        return this.cards.length;
    }
}
