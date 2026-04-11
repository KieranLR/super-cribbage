import { Player } from '../game/Player.js';
import { GameState } from '../game/GameState.js';
import { PHASES } from '../game/Constants.js';
import { Card, Suits, Values } from '../game/Card.js';
import { jest } from '@jest/globals';

describe('GameState Counting Integration', () => {
    let players;
    let gameState;

    beforeEach(() => {
        players = [
            new Player('1', 'Alice'),
            new Player('2', 'Bob')
        ];
        gameState = new GameState(players, { isHeadless: true });
        // Alice is dealer (index 0)
        gameState.dealerIndex = 0;
        gameState.updateDealer();
    });

    test('Phase transition from PEGGING to COUNTING does NOT automatically score', () => {
        // Mock non-dealer hand
        players[1].hand.addCard(new Card(Suits.CLUBS, Values.FIVE));
        players[1].hand.addCard(new Card(Suits.DIAMONDS, Values.FIVE));
        players[1].hand.addCard(new Card(Suits.HEARTS, Values.FIVE));
        players[1].hand.addCard(new Card(Suits.SPADES, Values.JACK));
        players[1].handForCounting = [...players[1].hand.cards];

        // Starter card
        gameState.starterCard = new Card(Suits.SPADES, Values.FIVE);

        // Move to PEGGING, then trigger nextPhase to COUNTING
        gameState.phase = PHASES.PEGGING;
        gameState.pegging = { 
            isPhaseComplete: () => true,
            currentTotal: 0,
            playedCards: [],
            allPlayedCards: [],
            turnIndex: 0,
            lastPlayerToPlay: null
        }; // Stub with all expected properties

        const initialScoreAlice = players[0].score;
        const initialScoreBob = players[1].score;

        gameState.nextPhase();

        expect(gameState.phase).toBe(PHASES.COUNTING);
        expect(players[0].score).toBe(initialScoreAlice);
        expect(players[1].score).toBe(initialScoreBob);
    });

    test('Manual counting works correctly and is idempotent (if called once)', () => {
        // Alice is dealer. Bob is non-dealer.
        // Bob's hand: 5, 5, 5, J (Spades). Starter: 5 (Spades).
        // That's 4 fives (12 points for pairs, 8 points for 15s) + Nobs (1) = 29?
        // Actually 15s: 5+5+5=15 (4 ways) = 8. 5+J=15 (4 ways) = 8. Total 16.
        // Pairs: 4C2 = 6 pairs = 12.
        // Nobs: J of Spades, starter 5 of Spades = 1.
        // Total = 16 + 12 + 1 = 29.

        gameState.phase = PHASES.COUNTING;
        players[1].handForCounting = [
            new Card(Suits.CLUBS, Values.FIVE),
            new Card(Suits.DIAMONDS, Values.FIVE),
            new Card(Suits.HEARTS, Values.FIVE),
            new Card(Suits.SPADES, Values.JACK)
        ];
        gameState.starterCard = new Card(Suits.SPADES, Values.FIVE);
        gameState.countPlayerHand(players[1]);

        expect(players[1].score).toBe(29);

        // Calling it again would double the score, which is expected if called twice.
        // The goal is to ensure GameState doesn't call it automatically.
    });
});
