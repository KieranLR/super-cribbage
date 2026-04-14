import { PHASES } from '../../../game/Constants.js';
import { TIMINGS } from '../../utils/flow/timings.js';
import { TableLayout } from '../../utils/TableLayout.js';
import { Phase } from './Phase.js';

export class StartingCutPhase extends Phase {
    start(onReady = null) {
        // If onReady is provided, we keep isTransitioning true until the fan is ready
        this.isTransitioning = onReady ? true : false;
        this.updatePhaseView(PHASES.STARTING_CUT, 'Choose a card to determine the first dealer');
        this.view.showStartingCutDeck(this.gameState.deck.cards.length, true, onReady);
    }

    cleanup(onComplete = null) {
        // Keep transitioning true if we are in a tie reset flow
        if (!onComplete) {
            this.isTransitioning = false;
        }
        if (this.view.visuals.table.deck) {
            this.view.animateDeckToPlay(onComplete);
        } else if (onComplete) {
            onComplete();
        }
    }

    onCardClicked(cardVisual) {
        if (this.gameState.phase !== PHASES.STARTING_CUT) return;
        if (this.isTransitioning) return;
        if (this.gameState.startingCuts[this.gameState.players.indexOf(this.humanPlayer)]) return;

        // In the UI, cardVisual might be one of the cards in the spread
        if (cardVisual.isStartingCutCard) {
            this.gameState.cutForDealer(this.humanPlayer, cardVisual.cutIndex);
        }
    }

    onStartingCardCut({ player, card, cardIndex }) {
        this.revealStartingCutCard(player, card, cardIndex);
    }

    revealStartingCutCard(player, card, cardIndex, completionCallback) {
        const visual = this.view.visuals.table.deck.getCardByCutIndex(cardIndex);
        if (visual) {
            visual.cardData = card;
            visual.setFaceDown(false);
            visual.isLocked = true;

            const snapshot = this.view.getLayoutSnapshot();
            const sc = snapshot.slots.startingCut;
            const targetY = (player.id === 'human' ? sc.humanRevealY : sc.botRevealY) - this.view.visuals.table.deck.y;
            visual.baseY = targetY;
            // Disable interactivity on both revealed cards to prevent hover/click issues
            visual.disableInteractive();

            this.view.flow.startAnimation();
            this.animator.moveCard(visual, visual.x, targetY, {
                duration: TIMINGS.ANIMATIONS.GENERIC_FADE,
                ease: 'Power2',
                onComplete: () => {
                    visual.isLocked = false;
                    this.view.flow.endAnimation();
                    if (completionCallback) completionCallback();
                }
            });
        } else if (completionCallback) {
            completionCallback();
        }
    }

    onStartingCutTie() {
        this.isTransitioning = true;
        this.view.showFloatingText(this.view.scene.scale.width / 2, this.view.scene.scale.height / 2, 'Tie! Cut again.', 0xffffff);
        
        // Disable interaction during the tie animation
        const cards = this.view.visuals.table.deck.getCards();
        if (cards) {
            cards.forEach(c => {
                if (c.disableInteractive) c.disableInteractive();
                c.isLocked = true;
            });
        }

        // Wait for the message and then the view reset
        this.view.scene.time.delayedCall(TIMINGS.PHASE_TRANSITIONS.STARTING_CUT_TIE_UI, () => {
            // Before starting the phase again, clear the revealed cards
            this.cleanup(() => {
                this.start(() => {
                    this.isTransitioning = false;
                });
            });
        });
    }

    onFirstDealerDetermined({ dealer }) {
        this.view.showFloatingText(this.view.scene.scale.width / 2, this.view.scene.scale.height / 2, `${dealer.name} deals first!`, 0xffffff);
    }
}
