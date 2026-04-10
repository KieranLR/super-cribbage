import { PHASES } from '../../../game/Constants.js';
import { Phase } from './Phase.js';

export class StartingCutPhase extends Phase {
    start() {
        console.log('starting');
        this.view.updatePhase(PHASES.STARTING_CUT, 'Choose a card to determine the first dealer');
        this.view.showStartingCutDeck(this.gameState.deck.cards.length);
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
    }

    onStartingCutTie() {
        console.log('on card tie clicked');
        this.view.showFloatingText(this.view.scene.scale.width / 2, this.view.scene.scale.height / 2, 'Tie! Cut again.', 0xffffff);
        setTimeout(() => {
            this.start();
        }, 2000);
    }

    onFirstDealerDetermined({ dealer }) {
        console.log('dealer determined. card clicked');
        this.view.showFloatingText(this.view.scene.scale.width / 2, this.view.scene.scale.height / 2, `${dealer.name} deals first!`, 0xffffff);
    }
}
