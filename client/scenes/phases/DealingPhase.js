import { PHASES } from '../../../game/Constants.js';
import { Phase } from './Phase.js';

export class DealingPhase extends Phase {
    start() {
        this.view.updateScores(); // Ensure dealer mark is updated at start of round
        this.view.updatePhase(PHASES.DEALING, 'Dealing cards...');
    }
}
