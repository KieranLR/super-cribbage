import { Player } from '../game/Player.js';
import { GameState } from '../game/GameState.js';
import { GameFlow } from '../game/GameFlow.js';
import { PHASES } from '../game/Constants.js';

describe('GameState.getPublicState()', () => {
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

    test('Returns correct structure in DEALING phase', () => {
        // Skip Starting Cut
        gameState.dealerIndex = 0;
        gameState.updateDealer();
        gameState.phase = PHASES.DEALING;
        
        const publicState = gameState.getPublicState();
        expect(publicState).toHaveProperty('phase', PHASES.DEALING);
        expect(publicState).toHaveProperty('players');
        expect(publicState.players[0]).toHaveProperty('id', '1');
        expect(publicState.players[0]).toHaveProperty('name', 'Alice');
        expect(publicState.players[0]).toHaveProperty('score', 0);
        expect(publicState.players[0]).toHaveProperty('isDealer', true);
        expect(publicState.players[0]).toHaveProperty('handSize', 0);
        expect(publicState.players[0]).toHaveProperty('hand'); // Empty in DEALING
        expect(publicState.players[0].hand).toEqual([]);

        expect(publicState).toHaveProperty('dealerIndex', 0);
        expect(publicState).toHaveProperty('starterCard', null);
        expect(publicState).toHaveProperty('cribSize', 0);
        expect(publicState).toHaveProperty('crib', []);
        expect(publicState).toHaveProperty('pegging', null);
        expect(publicState).toHaveProperty('winner', null);
    });

    test('Returns correct structure after cards are dealt', () => {
        // Skip Starting Cut
        gameState.dealerIndex = 0;
        gameState.updateDealer();
        gameState.phase = PHASES.DEALING;
        
        gameFlow.dealCards();
        const publicState = gameState.getPublicState();
        expect(publicState.phase).toBe(PHASES.DEALING);
        expect(publicState.players[0].handSize).toBe(6);
        expect(publicState.players[0].hand.length).toBe(6);
        expect(publicState.cribSize).toBe(0);
    });

    test('Returns correct structure in PEGGING phase', () => {
        // Skip Starting Cut
        gameState.dealerIndex = 0;
        gameState.updateDealer();
        gameState.phase = PHASES.DEALING;
        
        gameFlow.dealCards();
        const aliceCards = [players[0].hand.cards[0], players[0].hand.cards[1]];
        const bobCards = [players[1].hand.cards[0], players[1].hand.cards[1]];
        gameFlow.nextPhase();
        gameFlow.discardToCrib(players[0], aliceCards);
        gameFlow.discardToCrib(players[1], bobCards);
        gameFlow.nextPhase(); // Move to CUTTING
        gameFlow.nextPhase(); // Move to PEGGING
        
        const publicState = gameState.getPublicState();
        expect(publicState.phase).toBe(PHASES.PEGGING);
        expect(publicState.starterCard).not.toBeNull();
        expect(publicState.pegging).not.toBeNull();
        expect(publicState.pegging).toHaveProperty('currentTotal');
        expect(publicState.pegging).toHaveProperty('playedCards');
        expect(publicState.pegging).toHaveProperty('turnIndex');
        expect(publicState.pegging).toHaveProperty('lastPlayerToPlay');
        expect(publicState.cribSize).toBe(4);
    });

    test('Returns winner when game is over', () => {
        players[0].score = 121;
        gameState.checkWin();
        const publicState = gameState.getPublicState();
        expect(publicState.phase).toBe(PHASES.GAME_OVER);
        expect(publicState.winner).toHaveProperty('name', 'Alice');
    });
});
