import { PHASES } from '../../../game/Constants.js';
import { TIMINGS } from '../../utils/flow/timings.js';
import { Phase } from './Phase.js';

export class CuttingPhase extends Phase {
    start() {
        this.updatePhaseView(PHASES.CUTTING, 'Cutting the deck...');
    }

    onStarterCardCut({ card }) {
        this.animateStarterCardCut(card, () => {
            if (this.gameState.phase === PHASES.CUTTING) {
                this.gameState.nextPhase();
            }
        });
    }

    animateStarterCardCut(card, completionCallback) {
        // Only update visuals if it hasn't been updated yet
        this.view.updateStarterCard(card, true);
        const visual = this.view.visuals.table.deck.starterCardVisual;
        if (visual) {
            visual.isLocked = true;
            this.view.flow.startAnimation();
            this.animator.flipCard(visual, false, null, () => {
                visual.isLocked = false;
                this.view.flow.endAnimation();
                if (completionCallback) completionCallback();
            });
        } else if (completionCallback) {
            completionCallback();
        }
    }
}
