import { PHASES } from '../../../game/Constants.js';
import { Phase } from './Phase.js';

export class CuttingPhase extends Phase {
    start() {
        this.view.updatePhase(PHASES.CUTTING, 'Cutting the deck...');
    }
}
