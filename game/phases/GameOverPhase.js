import { GamePhase } from './GamePhase.js';

export class GameOverPhase extends GamePhase {
    start() {
        console.log("GAME OVER!!!");
    }
}
