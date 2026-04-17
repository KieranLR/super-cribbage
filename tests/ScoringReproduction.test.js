import { Player } from '../game/Player.js';
import { GameState } from '../game/GameState.js';
import { GameFlow } from '../game/GameFlow.js';
import { PHASES } from '../game/Constants.js';
import { jest } from '@jest/globals';

describe('GameState Scoring Reproduction', () => {
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
    });

    test('reproduce crib is null when manually setting phase to COUNTING', () => {
        // Simulating a setup where someone just sets the phase and tries to count
        gameState.phase = PHASES.COUNTING;
        
        // At this point, dealerIndex is -1, and crib is null (from constructor)
        expect(gameState.dealerIndex).toBe(-1);
        expect(gameState.crib).toBeNull();

        // If we try to call countCrib now, it should fail
        expect(() => {
            gameFlow.countCrib();
        }).toThrow();
    });

    test('proper setup for COUNTING phase', () => {
        // Correct way to set up for counting
        gameState.dealerIndex = 0;
        gameState.updateDealer(); // This initializes the crib
        gameState.phase = PHASES.COUNTING;

        expect(gameState.crib).not.toBeNull();
        expect(gameState.crib.owner).toBe(players[0]);

        // Mock cards for counting
        gameState.starterCard = { getRank: () => 5, getSuit: () => 'hearts' };
        gameState.crib.cards = [
            { getRank: () => 5, getSuit: () => 'diamonds' },
            { getRank: () => 5, getSuit: () => 'clubs' },
            { getRank: () => 5, getSuit: () => 'spades' },
            { getRank: () => 11, getSuit: () => 'hearts' }
        ];

        // Should not throw
        expect(() => {
            gameFlow.countCrib();
        }).not.toThrow();
    });
});
