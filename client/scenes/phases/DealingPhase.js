import { PHASES } from '../../../game/Constants.js';
import { Phase } from './Phase.js';

export class DealingPhase extends Phase {
    start() {
        this.updatePhaseView(PHASES.DEALING, 'Dealing cards...');
        this.view.visuals.table.crib.setLabel('');
        this.view.updateScores(); // Ensure dealer mark is updated at start of round
    }

    onCardsDealt(data) {
        this.view.flow.waitForAnimations(() => {
            this.view.dealCardsAnimated(data);
        });
    }
}
