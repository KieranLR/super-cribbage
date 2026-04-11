import { PHASES } from '../../../game/Constants.js';
import { TIMINGS } from '../../utils/flow/timings.js';
import { Phase } from './Phase.js';

export class StartingCutPhase extends Phase {
    start() {
        console.log('starting');
        this.view.updatePhase(PHASES.STARTING_CUT, 'Choose a card to determine the first dealer');
        this.view.showStartingCutDeck(this.gameState.deck.cards.length);
    }

    cleanup() {
        if (this.view.startingCutCards) {
            this.view.startingCutCards.forEach(c => c.destroy());
            this.view.startingCutCards = [];
        }
    }

    onCardClicked(cardVisual) {
        console.log('on card clicked');
        if (this.gameState.phase !== PHASES.STARTING_CUT) return;
        if (this.gameState.startingCuts[this.gameState.players.indexOf(this.humanPlayer)]) return;

        // In the UI, cardVisual might be one of the cards in the spread
        if (cardVisual.isStartingCutCard) {
            this.gameState.cutForDealer(this.humanPlayer, cardVisual.cutIndex);
        }
    }

    onStartingCardCut({ player, card, cardIndex }) {
        console.log('on starting card clicked');
        this.view.revealStartingCutCard(player, card, cardIndex);
        
        // Lock the card during reveal animation
        const visual = this.view.startingCutCards.find(v => v.cutIndex === cardIndex);
        if (visual) {
            visual.isLocked = true;
            this.view.scene.time.delayedCall(TIMINGS.UI.STARTING_CUT_LOCK, () => {
                visual.isLocked = false;
            });
        }
    }

    onStartingCutTie() {
        console.log('on card tie clicked');
        this.view.showFloatingText(this.view.scene.scale.width / 2, this.view.scene.scale.height / 2, 'Tie! Cut again.', 0xffffff);
        
        // Disable interaction during the tie animation
        if (this.view.startingCutCards) {
            this.view.startingCutCards.forEach(c => {
                if (c.disableInteractive) c.disableInteractive();
            });
        }

        // Wait for the message and then the view reset
        this.view.scene.time.delayedCall(TIMINGS.PHASE_TRANSITIONS.STARTING_CUT_TIE_UI, () => {
            // Before starting the phase again, clear the revealed cards
            this.cleanup();
            this.start();
        });
    }

    onFirstDealerDetermined({ dealer }) {
        console.log('dealer determined. card clicked');
        this.view.showFloatingText(this.view.scene.scale.width / 2, this.view.scene.scale.height / 2, `${dealer.name} deals first!`, 0xffffff);
    }
}
