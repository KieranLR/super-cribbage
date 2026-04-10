import { Scene } from 'phaser';
import { GameState } from '../../game/GameState.js';
import { Player } from '../../game/Player.js';
import { BotPlayer } from '../../game/BotPlayer.js';
import { CribbageGameView } from './CribbageGameView.js';
import { HumanVsBotController } from './HumanVsBotController.js';

export class Game extends Scene {
    constructor() {
        super('Game');
    }

    create() {
        // Initialize Players
        this.humanPlayer = new Player('human', 'You');
        this.botPlayer = new BotPlayer('bot', 'Bot');
        this.players = [this.humanPlayer, this.botPlayer];

        // Initialize GameState
        this.gameState = new GameState(this.players);

        // Initialize View
        this.view = new CribbageGameView(this);
        this.view.initializeScoreboard(this.players);

        // Initialize Controller
        this.controller = new HumanVsBotController(this.gameState, this.view, this.humanPlayer, this.botPlayer);

        // Start Game
        // For Starting Cut, we don't call startNewRound yet, we just trigger the check for bots
        this.controller.onPhaseChanged({ phase: this.gameState.phase, oldPhase: null });
    }
}