import { Scene } from 'phaser';
import { GameState } from '../../game/GameState.js';
import { GameFlow } from '../../game/GameFlow.js';
import { Player } from '../../game/Player.js';
import { BotPlayer } from '../../game/BotPlayer.js';
import { CribbageGameView } from './CribbageGameView.js';
import { HumanVsBotController } from './HumanVsBotController.js';
import { TableAnimator } from '../utils/TableAnimator.js';
import { TableLayout } from '../utils/TableLayout.js';

export class CribbageGameScene extends Scene {
    constructor(config) {
        super(config);
    }

    create() {
        this.initializeGame();
        this.setupResize();
    }

    initializeGame() {
        // Initialize Layout
        this.layout = new TableLayout(this.scale);

        // Initialize Animator
        this.animator = new TableAnimator(this);

        // Initialize Players
        this.humanPlayer = new Player('human', 'You');
        this.botPlayer = new BotPlayer('bot', 'Stanley');
        this.players = [this.humanPlayer, this.botPlayer];

        // Initialize GameState
        this.gameState = new GameState(this.players);

        // Initialize GameFlow
        this.gameFlow = new GameFlow(this.gameState);

        // Initialize View
        this.view = new CribbageGameView(this, this.animator, this.layout);
        this.view.initializeScoreboard(this.players);

        // Initialize Controller
        this.controller = new HumanVsBotController(this.gameState, this.gameFlow, this.view, this.humanPlayer, this.botPlayer, this.animator);
    }

    setupResize() {
        // Resizing
        this.scale.on('resize', (gameSize) => {
            if (!this.scene.isActive()) return;
            const { width, height } = gameSize;
            if (this.view && typeof this.view.resize === 'function') {
                this.view.resize(width, height);
            }
        });
    }

    startNewGame() {
        // Start Game
        // For Starting Cut, we don't call startNewRound yet, we just trigger the check for bots
        this.controller.onPhaseChanged({ phase: this.gameState.phase, oldPhase: null });
    }
}
