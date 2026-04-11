import { Player } from '../game/Player.js';
import { GameState } from '../game/GameState.js';
import { PHASES } from '../game/Constants.js';
import { Card, Suits, Values } from '../game/Card.js';
import { jest } from '@jest/globals';

describe('Full Game Scoring Flow', () => {
    let players;
    let gameState;

    beforeEach(() => {
        players = [
            new Player('1', 'Alice'),
            new Player('2', 'Bob')
        ];
        gameState = new GameState(players, { isHeadless: true });
        
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
        // 15s: 5+5+5 (2 pts), J+5_c (2 pts), J+5_d (2 pts), J+5_s (2 pts), J+5_h (2 pts)
        // Wait: 5c+5d+5s (2), 5c+5d+5h (2), 5c+5s+5h (2), 5d+5s+5h (2) -> 4 fifteens from 5s = 8 pts
        // Also J + each 5 (4 fifteens) = 8 pts
        // Total 15s = 16 pts
        // Pairs: 4 fives = 6 pairs = 12 pts
        // Nobs: Jack of Hearts matches starter Hearts = 1 pt
        // Total = 16 + 12 + 1 = 29 pts (Max hand!)
        
        const bobScoreBefore = players[1].score;
        gameState.countPlayerHand(players[1]);
        expect(players[1].score - bobScoreBefore).toBe(29);

        // 4. Count Alice's Hand (Dealer)
        // Pairs: 2-2 (2 pts), 3-3 (2 pts) = 4 pts
        // Fifteens: 
        // 2c + 3c + 5h (15)
        // 2d + 3d + 5h (15)
        // (Wait, only 2 combinations if we don't mix them? No, all combinations count)
        // Combinations that sum to 10 from {2, 2, 3, 3}:
        // 2c + 2d + 3c + 3d = 10. NO. 2+2+3+3 = 10.
        // So {2c, 2d, 3c, 3d, 5h}:
        // 2c + 3c + 5h = 10? NO. 2+3+5 = 10.
        // Wait, 15 is what we want!
        // 2+2+3+3+5 = 15. That is ONE fifteen. (2 points)
        // Are there others?
        // 2+3+10? No.
        // So total points = 4 (pairs) + 2 (fifteen) = 6 pts.
        
        const aliceScoreBefore = players[0].score;
        gameState.countPlayerHand(players[0]);
        expect(players[0].score - aliceScoreBefore).toBe(6);

        // 5. Count Crib (Alice's Crib)
        // Crib: 7c, 8c, 9d, 10s. Starter: 5h
        // Runs: 7-8-9-10 (4 pts)
        // Fifteens: 7+8 (2 pts), 10+5 (2 pts)
        // Total = 4 + 2 + 2 = 8 pts
        
        const aliceScoreBeforeCrib = players[0].score;
        gameState.countCrib();
        expect(players[0].score - aliceScoreBeforeCrib).toBe(8);

        // 6. Start New Round
        gameState.startNewRound();
        
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
