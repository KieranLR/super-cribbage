import { Scene } from 'phaser';
import { GameState } from '../../../game/GameState.js';
import { Player } from '../../../game/Player.js';
import { BotPlayer } from '../../../game/BotPlayer.js';
import { CribbageGameView } from '../CribbageGameView.js';
import { HumanVsBotController } from '../HumanVsBotController.js';

export class TestGameOverScene extends Scene {
    constructor() {
        super('TestGameOverScene');
    }

    create() {
        // Initialize Players
        this.humanPlayer = new Player('human', 'You');
        this.botPlayer = new BotPlayer('bot', 'Bot');
        this.players = [this.humanPlayer, this.botPlayer];

        // STARTING WITH 100 POINTS AS REQUESTED
        this.humanPlayer.score = 100;
        this.botPlayer.score = 120;

        // Initialize GameState
        this.gameState = new GameState(this.players);

        // Initialize View
        this.view = new CribbageGameView(this);
        this.view.initializeScoreboard(this.players);

        // Initialize Controller
        this.controller = new HumanVsBotController(this.gameState, this.view, this.humanPlayer, this.botPlayer);

        // Start Game
        this.controller.onPhaseChanged({ phase: this.gameState.phase, oldPhase: null });
    }
}
