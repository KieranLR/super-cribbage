import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { Player } from '../../../game/Player.js';
import { GameState } from '../../../game/GameState.js';
import { GameFlow } from '../../../game/GameFlow.js';
import { PHASES } from '../../../game/Constants.js';

describe('GameState', () => {
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

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    test('Initial state', () => {
        expect(gameState.players.length).toBe(2);
        expect(gameState.phase).toBe(PHASES.STARTING_CUT);
        expect(gameState.dealerIndex).toBe(-1);
    });

    test('Dealing phase', () => {
        gameState.dealerIndex = 0;
        gameState.updateDealer();
        gameState.phase = PHASES.DEALING;

        gameFlow.dealCards();

        expect(players[0].hand.cards.length).toBe(6);
        expect(players[1].hand.cards.length).toBe(6);

        gameFlow.nextPhase();
        expect(gameState.phase).toBe(PHASES.DISCARDING);
    });

    test('Discarding phase', () => {
        gameState.dealerIndex = 0;
        gameState.updateDealer();
        gameState.phase = PHASES.DEALING;

        gameFlow.dealCards();
        gameFlow.nextPhase();

        const aliceCards = [players[0].hand.cards[0], players[0].hand.cards[1]];
        const bobCards = [players[1].hand.cards[0], players[1].hand.cards[1]];

        gameFlow.discardToCrib(players[0], aliceCards);

        expect(gameState.discardedToCrib[0]).toBe(true);
        expect(gameState.crib.cards.length).toBe(2);
        expect(gameState.phase).toBe(PHASES.DISCARDING);

        gameFlow.discardToCrib(players[1], bobCards);

        expect(gameState.discardedToCrib[1]).toBe(true);
        expect(gameState.crib.cards.length).toBe(4);

        gameFlow.nextPhase();
        expect(gameState.phase).toBe(PHASES.CUTTING);
    });

    test('Cutting phase (via nextPhase)', () => {
        gameState.dealerIndex = 0;
        gameState.updateDealer();
        gameState.phase = PHASES.DISCARDING;
        gameState.discardedToCrib = [true, true];

        gameFlow.nextPhase();

        expect(gameState.phase).toBe(PHASES.CUTTING);
        expect(gameState.starterCard).not.toBeNull();
    });

    test('Pegging initialization', () => {
        gameState.dealerIndex = 0;
        gameState.updateDealer();
        gameState.phase = PHASES.CUTTING;

        gameFlow.nextPhase();

        expect(gameState.phase).toBe(PHASES.PEGGING);
        expect(gameState.pegging).not.toBeNull();
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
        gameState.startingCuts = [
            { getRank: () => 5 },
            { getRank: () => 10 }
        ];

        gameFlow.phases[PHASES.STARTING_CUT].determineFirstDealer();

        expect(gameState.dealerIndex).toBe(0);
        expect(players[0].isDealer).toBe(true);

        gameFlow.nextPhase();

        expect(gameState.phase).toBe(PHASES.DEALING);
        expect(players[0].hand.cards.length).toBe(6);
    });

    test('Starting Cut tie', () => {
        vi.useFakeTimers();

        gameState.startingCuts = [
            { getRank: () => 7 },
            { getRank: () => 7 }
        ];

        const emitSpy = vi.spyOn(gameFlow.eventEmitter, 'emit');

        gameFlow.phases[PHASES.STARTING_CUT].determineFirstDealer();

        vi.advanceTimersByTime(1000);

        expect(gameState.startingCuts.every(c => c === null)).toBe(true);
        expect(emitSpy).toHaveBeenCalledWith('startingCutTie', {});
        expect(gameState.phase).toBe(PHASES.STARTING_CUT);

        vi.advanceTimersByTime(1500);
    });

    test('New round rotation', () => {
        gameState.dealerIndex = 0;
        gameState.updateDealer();
        gameState.phase = PHASES.COUNTING;

        gameFlow.startNewRound();

        expect(gameState.dealerIndex).toBe(1);
        expect(players[1].isDealer).toBe(true);
        expect(players[0].isDealer).toBe(false);
        expect(gameState.crib.owner).toBe(players[1]);
        expect(gameState.phase).toBe(PHASES.DEALING);
    });
});