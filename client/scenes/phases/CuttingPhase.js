import { PHASES } from '../../../game/Constants.js';
import { TIMINGS } from '../../utils/flow/timings.js';
import { Phase } from './Phase.js';

export class CuttingPhase extends Phase {
    start() {
        this.view.updatePhase(PHASES.CUTTING, 'Cutting the deck...');
    }

    onStarterCardCut({ card }) {
        this.view.updateStarterCard(card);
        this.view.scene.time.delayedCall(TIMINGS.PHASE_TRANSITIONS.CUT_FOR_DEALER_UI, () => {
            if (this.gameState.phase === PHASES.CUTTING) {
                this.gameState.nextPhase();
            }
        });
    }
}
