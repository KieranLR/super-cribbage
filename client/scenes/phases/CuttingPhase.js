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
        this.view.updateStarterCard(card);
        const visual = this.view.starterCardVisual.cardVisual;
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
