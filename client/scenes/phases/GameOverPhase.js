import { PHASES } from '../../../game/Constants.js';
import { TIMINGS } from '../../utils/flow/timings.js';
import { Phase } from './Phase.js';

export class GameOverPhase extends Phase {
    start() {
        this.updatePhaseView(PHASES.GAME_OVER, 'Game Over!');
        const winner = this.gameState.winner;
        this.view.showGameOver(winner.name);
        this.view.scene.time.delayedCall(TIMINGS.PHASE_TRANSITIONS.GAME_OVER, () => this.view.scene.scene.start('GameOver'));
    }
}
