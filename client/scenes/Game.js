import { CribbageGameScene } from './CribbageGameScene.js';

export class Game extends CribbageGameScene {
    constructor() {
        super('Game');
    }

    create() {
        super.create();
        this.startNewGame();
    }
}