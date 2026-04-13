import { CribbageGameScene } from '../CribbageGameScene.js';
import { Card, Suits, Values } from '../../../game/Card.js';

/**
 * Test scene specifically designed to trigger and test the "tie" condition 
 * during the starting cut phase where both players cut the same card rank.
 */
export class TestStartingCutTieScene extends CribbageGameScene {
    constructor() {
        super('TestStartingCutTieScene');
    }

    create() {
        this.initializeGame();
        this.setupResize();

        // FORCE A TIE:
        // Fill the deck with only Aces of Spades (or any same-rank card)
        // This ensures that whatever card they "cut" from the deck, it will have the same rank.
        const tieCards = [];
        for (let i = 0; i < 52; i++) {
            tieCards.push(new Card(Suits.SPADES, Values.ACE));
        }
        this.gameState.deck.cards = tieCards;

        // We also need to make sure that when the deck is reset (after a tie), 
        // it stays tied for the next attempt if we want to keep testing the tie.
        // However, GameState.determineFirstDealer calls deck.reset() and deck.shuffle().
        // So we override deck.reset to keep our "tie" cards.
        this.gameState.deck.reset = () => {
            this.gameState.deck.cards = [];
            for (let i = 0; i < 52; i++) {
                this.gameState.deck.cards.push(new Card(Suits.SPADES, Values.ACE));
            }
        };

        this.startNewGame();
    }
}
