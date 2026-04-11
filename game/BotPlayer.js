import { Player } from './Player.js';
import { Scoring } from './Scoring.js';

export class BotPlayer extends Player {
    /**
     * @param {string} id - Unique identifier
     * @param {string} name - Display name
     */
    constructor(id, name) {
        super(id, name);
        this.isBot = true;
    }

    /**
     * Randomly selects 2 cards to discard to the crib.
     * @returns {import('./Card.js').Card[]}
     */
    makeDiscardDecision() {
        const cards = [...this.hand.cards];
        const discards = [];
        
        // Pick 2 random cards
        for (let i = 0; i < 2; i++) {
            const index = Math.floor(Math.random() * cards.length);
            discards.push(cards.splice(index, 1)[0]);
        }
        
        return discards;
    }

    /**
     * Randomly selects a valid card to play during pegging, or returns null for "Go".
     * @param {number} currentTotal - Current running total in pegging.
     * @returns {import('./Card.js').Card|null}
     */
    makePeggingDecision(currentTotal) {
        const validCards = this.hand.cards.filter(card => 
            currentTotal + Scoring.getCardValue(card) <= 31
        );

        if (validCards.length === 0) {
            return null;
        }

        const randomIndex = Math.floor(Math.random() * validCards.length);
        return validCards[randomIndex];
    }
}
