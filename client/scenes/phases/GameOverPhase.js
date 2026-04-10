import { PHASES } from '../../../game/Constants.js';
import { Phase } from './Phase.js';

export class GameOverPhase extends Phase {
    start() {
        this.view.updatePhase(PHASES.GAME_OVER, 'Game Over!');
        const winner = this.gameState.winner;
        this.view.showGameOver(winner.name);
        this.view.scene.time.delayedCall(3000, () => this.view.scene.scene.start('GameOver'));
    }
}
