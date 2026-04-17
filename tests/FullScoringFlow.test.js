import { Player } from '../game/Player.js';
import { GameState } from '../game/GameState.js';
import { GameFlow } from '../game/GameFlow.js';
import { PHASES } from '../game/Constants.js';
import { Card, Suits, Values } from '../game/Card.js';
import { jest } from '@jest/globals';

describe('Full Game Scoring Flow', () => {
    let players;
    let gameState;
    let gameFlow;

    beforeEach(() => {
        players = [
            new Player('1', 'Alice'),
            new Player('2', 'Bob')
        ];
        gameState = new GameState(players, { isHeadless: true });
        gameFlow = new GameFlow(gameState);
        
        // Start by determining dealer (index 0 - Alice)
        gameState.dealerIndex = 0;
        gameState.updateDealer();
    });

    test('Full scoring flow: Hand -> Crib -> Next Round', () => {
        // 1. Move to COUNTING phase
        gameState.phase = PHASES.COUNTING;

        // 2. Setup hands for counting (Alice is dealer, so Bob is non-dealer)
        // Bob's Hand (Non-dealer): 5, 5, 5, Jack (Nob potential)
        // Alice's Hand (Dealer): 2, 2, 3, 3
        // Crib: 7, 8, 9, 10
        // Starter: 5 of Hearts
        
        const starterCard = new Card(Suits.HEARTS, Values.FIVE);
        gameState.starterCard = starterCard;

        const bobCards = [
            new Card(Suits.CLUBS, Values.FIVE),
            new Card(Suits.DIAMONDS, Values.FIVE),
            new Card(Suits.SPADES, Values.FIVE),
            new Card(Suits.HEARTS, Values.JACK) // Nob!
        ];
        players[1].handForCounting = bobCards;

        const aliceCards = [
            new Card(Suits.CLUBS, Values.TWO),
            new Card(Suits.DIAMONDS, Values.TWO),
            new Card(Suits.CLUBS, Values.THREE),
            new Card(Suits.DIAMONDS, Values.THREE)
        ];
        players[0].handForCounting = aliceCards;

        const cribCards = [
            new Card(Suits.CLUBS, Values.SEVEN),
            new Card(Suits.CLUBS, Values.EIGHT),
            new Card(Suits.DIAMONDS, Values.NINE),
            new Card(Suits.SPADES, Values.TEN)
        ];
        gameState.crib.cards = cribCards;

        // 3. Count Bob's Hand (Non-dealer)
        const bobScoreBefore = players[1].score;
        gameFlow.countPlayerHand(players[1]);
        expect(players[1].score - bobScoreBefore).toBe(29);

        // 4. Count Alice's Hand (Dealer)
        const aliceScoreBefore = players[0].score;
        gameFlow.countPlayerHand(players[0]);
        expect(players[0].score - aliceScoreBefore).toBe(6);

        // 5. Count Crib (Alice's Crib)
        const aliceScoreBeforeCrib = players[0].score;
        gameFlow.countCrib();
        expect(players[0].score - aliceScoreBeforeCrib).toBe(8);

        // 6. Start New Round
        gameFlow.startNewRound();
        
        // Dealer should rotate to Bob (index 1)
        expect(gameState.dealerIndex).toBe(1);
        expect(players[1].isDealer).toBe(true);
        expect(players[0].isDealer).toBe(false);
        
        // Phase should be DEALING
        expect(gameState.phase).toBe(PHASES.DEALING);
        
        // Crib should be initialized for Bob
        expect(gameState.crib).not.toBeNull();
        expect(gameState.crib.owner).toBe(players[1]);
    });
});
