import { PHASES } from '../../../game/Constants.js';
import { Phase } from './Phase.js';

export class DealingPhase extends Phase {
    start() {
        // Clear starting cut cards if any
        if (this.view.startingCutCards) {
            this.view.startingCutCards.forEach(c => c.destroy());
            this.view.startingCutCards = [];
        }
        // Clear crib visuals from previous round
        this.view.cribVisual.setCards([]);
        this.view.updateScores(); // Ensure dealer mark is updated at start of round
        this.view.updatePhase(PHASES.DEALING, 'Dealing cards...');
    }
}
