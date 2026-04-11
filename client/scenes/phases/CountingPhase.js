import { PHASES } from '../../../game/Constants.js';
import { Phase } from './Phase.js';

export class CountingPhase extends Phase {
    constructor(controller) {
        super(controller);
        this.countingStep = 0;
    }

    start() {
        this.countingStep = 0;
        this.nextCountingStep();
    }

    nextCountingStep() {
        this.countingStep++;
        const dealer = this.gameState.players[this.gameState.dealerIndex];
        const nonDealer = this.gameState.players.find(p => p !== dealer);

        switch (this.countingStep) {
            case 1: // Non-dealer's hand
                this.view.updatePhase(PHASES.COUNTING, `${nonDealer.name}'s Hand`);
                this.view.updateHands(
                    this.humanPlayer === nonDealer ? this.humanPlayer.handForCounting : this.humanPlayer.hand.cards,
                    this.botPlayer === nonDealer ? this.botPlayer.handForCounting : this.botPlayer.hand.cards,
                    this.botPlayer === nonDealer
                );
                this.gameState.countPlayerHand(nonDealer);
                if (this.gameState.winner) return;
                this.view.showButton('continue', 'Continue', () => {
                    this.view.hideButton('continue');
                    this.nextCountingStep();
                });
                break;
            case 2: // Dealer's hand
                this.view.updatePhase(PHASES.COUNTING, `${dealer.name}'s Hand`);
                this.view.updateHands(
                    this.humanPlayer.handForCounting,
                    this.botPlayer.handForCounting,
                    this.botPlayer === dealer
                );
                this.gameState.countPlayerHand(dealer);
                if (this.gameState.winner) return;
                this.view.showButton('continue', 'Continue', () => {
                    this.view.hideButton('continue');
                    this.nextCountingStep();
                });
                break;
            case 3: // Crib
                this.view.updatePhase(PHASES.COUNTING, `${dealer.name}'s Crib`);
                this.view.cribVisual.setLabel('Crib');
                this.view.updateCrib(this.gameState.crib.cards, true, true);
                this.gameState.countCrib();
                if (this.gameState.winner) return;
                this.view.showButton('next', 'Next Round', () => {
                    this.gameState.startNewRound();
                });
                break;
        }
    }
}
