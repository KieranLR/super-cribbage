import { Player } from '../game/Player.js';
import { GameState } from '../game/GameState.js';
import { GameFlow } from '../game/GameFlow.js';
import { PHASES } from '../game/Constants.js';
import { jest } from '@jest/globals';

describe('GameState', () => {
    let players;
    let gameState;
    let gameFlow;

    beforeEach(() => {
        jest.useFakeTimers();
        players = [
            new Player('1', 'Alice'),
            new Player('2', 'Bob')
        ];
        gameState = new GameState(players, { isHeadless: true });
        gameFlow = new GameFlow(gameState);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('Initial state', () => {
        expect(gameState.players.length).toBe(2);
        expect(gameState.phase).toBe(PHASES.STARTING_CUT);
        expect(gameState.dealerIndex).toBe(-1);
    });

    test('Dealing phase', () => {
        // Skip Starting Cut
        gameState.dealerIndex = 0;
        gameState.updateDealer();
        gameState.phase = PHASES.DEALING;
        
        gameFlow.dealCards();
        expect(players[0].hand.cards.length).toBe(6);
        expect(players[1].hand.cards.length).toBe(6);
        // Transition to DISCARDING
        gameFlow.nextPhase();
        expect(gameState.phase).toBe(PHASES.DISCARDING);
    });

    test('Discarding phase', () => {
        // Skip Starting Cut
        gameState.dealerIndex = 0;
        gameState.updateDealer();
        gameState.phase = PHASES.DEALING;
        
        gameFlow.dealCards(); 
        gameFlow.nextPhase(); // Now in DISCARDING phase
        
        const aliceCards = [players[0].hand.cards[0], players[0].hand.cards[1]];
        const bobCards = [players[1].hand.cards[0], players[1].hand.cards[1]];

        gameFlow.discardToCrib(players[0], aliceCards);
        console.log(gameState.discardedToCrib);
        console.log(gameState.getPublicState());
        expect(gameState.discardedToCrib[0]).toBe(true);
        expect(gameState.crib.cards.length).toBe(2);
        expect(gameState.phase).toBe(PHASES.DISCARDING);

        gameFlow.discardToCrib(players[1], bobCards);
        expect(gameState.discardedToCrib[1]).toBe(true);
        expect(gameState.crib.cards.length).toBe(4);
        gameFlow.nextPhase();
        expect(gameState.phase).toBe(PHASES.CUTTING); // nextPhase for DISCARDING sets phase to CUTTING
    });

    test('Cutting phase (via nextPhase)', () => {
        gameState.dealerIndex = 0;
        gameState.updateDealer();
        gameState.phase = PHASES.DISCARDING;
        gameState.discardedToCrib = [true, true];
        gameFlow.nextPhase(); // Should go to CUTTING, then CUTTING logic calls nextPhase if automated? 
        // Wait, my nextPhase for DISCARDING sets phase to CUTTING and calls cutStarterCard.
        // But cutStarterCard doesn't call nextPhase.
        
        expect(gameState.phase).toBe(PHASES.CUTTING);
        expect(gameState.starterCard).not.toBeNull();
    });

    test('Pegging initialization', () => {
        gameState.dealerIndex = 0;
        gameState.updateDealer();
        gameState.phase = PHASES.CUTTING;
        gameFlow.nextPhase(); // Move to PEGGING
        
        expect(gameState.phase).toBe(PHASES.PEGGING);
        expect(gameState.pegging).not.toBeNull();
        // Alice is dealer (index 0), so Bob (index 1) should start pegging
        expect(gameState.pegging.turnIndex).toBe(1);
    });

    test('Win condition', () => {
        players[0].score = 120;
        players[0].addPoints(1);
        const hasWon = gameState.checkWin();
        expect(hasWon).toBe(true);
        expect(gameState.winner).toBe(players[0]);
        expect(gameState.phase).toBe(PHASES.GAME_OVER);
    });

    test('Starting Cut transition to first dealer', () => {
        // Mock starting cuts
        gameState.startingCuts = [
            { getRank: () => 5 }, // Alice cuts 5
            { getRank: () => 10 } // Bob cuts 10
        ];
        
        gameFlow.phases[PHASES.STARTING_CUT].determineFirstDealer();
        
        // Wait for 2000ms timeout in determineFirstDealer
        jest.advanceTimersByTime(2000);
        
        expect(gameState.dealerIndex).toBe(0); // Alice has lower card
        expect(players[0].isDealer).toBe(true);
        // Start DEALING phase
        gameFlow.nextPhase();
        expect(gameState.phase).toBe(PHASES.DEALING); 
        expect(players[0].hand.cards.length).toBe(6);
    });

    test('Starting Cut tie', () => {
        // Mock starting cuts with same rank
        gameState.startingCuts = [
            { getRank: () => 7 },
            { getRank: () => 7 }
        ];
        
        const emitSpy = jest.spyOn(gameFlow.eventEmitter, 'emit');
        
        gameFlow.phases[PHASES.STARTING_CUT].determineFirstDealer();
        
        // Advance timers by the new 1000ms delay in determineFirstDealer
        jest.advanceTimersByTime(1000);
        
        expect(gameState.startingCuts.every(c => c === null)).toBe(true);
        expect(emitSpy).toHaveBeenCalledWith('startingCutTie', {});
        expect(gameState.phase).toBe(PHASES.STARTING_CUT);
        
        // Ensure bots aren't triggered immediately after the tie event
        // (Wait another 1500ms for the bot delay)
        jest.advanceTimersByTime(1500);
    });

    test('New round rotation', () => {
        gameState.dealerIndex = 0;
        gameState.updateDealer();
        gameState.phase = PHASES.COUNTING; // Set to COUNTING so startNewRound rotates
        gameFlow.startNewRound();
        expect(gameState.dealerIndex).toBe(1);
        expect(players[1].isDealer).toBe(true);
        expect(players[0].isDealer).toBe(false);
        expect(gameState.crib.owner).toBe(players[1]);
        expect(gameState.phase).toBe(PHASES.DEALING); // startNewRound calls dealCards which moves to DISCARDING
    });
});
