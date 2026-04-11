import { Player } from '../game/Player.js';
import { BotPlayer } from '../game/BotPlayer.js';
import { GameState } from '../game/GameState.js';
import { WINNING_SCORE } from '../game/Constants.js';

describe('TestGameOverScene Initialization Logic', () => {
    test('Player score can be initialized to 100', () => {
        const humanPlayer = new Player('human', 'You');
        const botPlayer = new BotPlayer('bot', 'Bot');
        
        humanPlayer.score = 100;
        botPlayer.score = 100;
        
        expect(humanPlayer.score).toBe(100);
        expect(botPlayer.score).toBe(100);
        
        const gameState = new GameState([humanPlayer, botPlayer]);
        expect(gameState.players[0].score).toBe(100);
        expect(gameState.players[1].score).toBe(100);
    });

    test('Game correctly detects win when score reaches WINNING_SCORE', () => {
        const humanPlayer = new Player('human', 'You');
        const botPlayer = new BotPlayer('bot', 'Bot');
        const gameState = new GameState([humanPlayer, botPlayer]);
        
        humanPlayer.score = WINNING_SCORE;
        const isWin = gameState.checkWin();
        
        expect(isWin).toBe(true);
        expect(gameState.winner).toBe(humanPlayer);
        expect(gameState.phase).toBe('GAME_OVER');
    });
});
