import { CribbageGameScene } from '../CribbageGameScene.js';

export class TestGameOverScene extends CribbageGameScene {
    constructor() {
        super('TestGameOverScene');
    }

    create() {
        this.initializeGame();
        this.setupResize();

        // STARTING WITH 100 POINTS AS REQUESTED
        this.humanPlayer.score = 100;
        this.botPlayer.score = 120;
        
        // Refresh scoreboard after score changes
        this.view.initializeScoreboard(this.players);

        this.startNewGame();
    }
}
