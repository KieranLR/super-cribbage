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
        this.gameState.dealerIndex = 0; // Set to 1 so startNewRound rotates back to 0
        this.gameState.updateDealer();

        // Initialize View
        this.view = new CribbageGameView(this);
        this.view.initializeScoreboard(this.players);

        // Initialize Controller
        this.controller = new HumanVsBotController(this.gameState, this.view, this.humanPlayer, this.botPlayer);

        // Start Game
        this.gameState.startNewRound();
    }
}