import { PHASES } from '../../../game/Constants.js';
import { Phase } from './Phase.js';

export class DealingPhase extends Phase {
    start() {
        this.updatePhaseView(PHASES.DEALING, 'Dealing cards...');
        this.view.cribVisual.setLabel('');
        this.view.updateScores(); // Ensure dealer mark is updated at start of round
    }
}
