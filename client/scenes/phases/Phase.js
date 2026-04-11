import { PHASES } from '../../../game/Constants.js';
import { TIMINGS } from '../../utils/flow/timings.js';
import { TableLayout } from '../../utils/TableLayout.js';

export class Phase {
    constructor(controller) {
        this.controller = controller;
        this.gameState = controller.gameState;
        this.view = controller.view;
        this.animator = controller.animator;
        this.humanPlayer = controller.humanPlayer;
        this.botPlayer = controller.botPlayer;
    }

    /**
     * Updates the phase indicator and common UI elements.
     */
    updatePhaseView(phase, instruction) {
        this.view.phaseIndicator.updatePhase(phase, instruction);

        // Visibility of Pegging Area
        const isPegging = phase === PHASES.PEGGING;
        this.view.peggingAreaVisual.setVisible(isPegging);

        // Visibility of Starter Card
        const isStarterVisible = [PHASES.CUTTING, PHASES.PEGGING, PHASES.COUNTING].includes(phase);
        this.transitionStarterCard(isStarterVisible);

        const targetPos = TableLayout.getCribPosition(this.view.scene.scale, phase, PHASES);
        this.transitionCrib(phase, targetPos);

        // Visibility of Sort Widget
        const isSortVisible = [PHASES.DISCARDING, PHASES.PEGGING].includes(phase);
        this.transitionSortWidget(isSortVisible);
    }

    /**
     * Fades the sort widget based on visibility.
     */
    transitionSortWidget(isVisible) {
        if (!this.view.sortWidget) return;

        if (isVisible && !this.view.sortWidget.visible) {
            this.view.sortWidget.setVisible(true);
            this.view.sortWidget.alpha = 0;
            this.view.flow.startAnimation();
            this.animator.fade(this.view.sortWidget, 1, TIMINGS.ANIMATIONS.GENERIC_MOVE, () => this.view.flow.endAnimation());
        } else if (!isVisible && this.view.sortWidget.visible) {
            this.view.flow.startAnimation();
            this.animator.fade(this.view.sortWidget, 0, TIMINGS.ANIMATIONS.GENERIC_MOVE, () => {
                this.view.sortWidget.setVisible(false);
                this.view.flow.endAnimation();
            });
        }
    }

    /**
     * Fades the starter card placeholder based on visibility.
     */
    transitionStarterCard(isVisible) {
        if (isVisible && !this.view.starterCardVisual.visible) {
            this.view.starterCardVisual.setVisible(true);
            this.view.starterCardVisual.alpha = 0;
            this.view.flow.startAnimation();
            this.animator.fade(this.view.starterCardVisual, 1, TIMINGS.ANIMATIONS.GENERIC_MOVE, () => this.view.flow.endAnimation());
        } else if (!isVisible && this.view.starterCardVisual.visible) {
            this.view.flow.startAnimation();
            this.animator.fade(this.view.starterCardVisual, 0, TIMINGS.ANIMATIONS.GENERIC_MOVE, () => {
                this.view.starterCardVisual.setVisible(false);
                this.view.flow.endAnimation();
            });
        }
    }



    /**
     * Moves the crib based on the phase and ensures it's visible.
     */
    transitionCrib(phase, targetPos) {
        const isVisible = [
            PHASES.PEGGING, 
            PHASES.COUNTING, 
            PHASES.DISCARDING, 
            PHASES.CUTTING, 
            PHASES.DEALING
        ].includes(phase);

        if (isVisible && !this.view.cribVisual.visible) {
            this.view.cribVisual.setCards([]); // Clear cards from previous round/phase
            this.view.cribVisual.setVisible(true);
            this.view.cribVisual.alpha = 0;
            this.view.flow.startAnimation();
            this.animator.fade(this.view.cribVisual, 1, TIMINGS.ANIMATIONS.GENERIC_MOVE, () => this.view.flow.endAnimation());
        } else if (!isVisible && this.view.cribVisual.visible) {
            this.view.flow.startAnimation();
            this.animator.fade(this.view.cribVisual, 0, TIMINGS.ANIMATIONS.GENERIC_MOVE, () => {
                this.view.cribVisual.setVisible(false);
                this.view.flow.endAnimation();
            });
        }

        if (this.view.cribVisual.visible) {
            this.view.flow.startAnimation();
            this.animator.moveCrib(this.view.cribVisual, targetPos.x, targetPos.y)
                .on('complete', () => this.view.flow.endAnimation());
        } else {
            this.view.cribVisual.setPosition(targetPos.x, targetPos.y);
        }
    }

    /**
     * Called when the phase starts.
     */
    start() {
        // To be implemented by subclasses
    }

    /**
     * Called when the phase ends.
     */
    cleanup() {
        // To be implemented by subclasses
    }

    /**
     * Called when a card is clicked.
     * @param {CardVisual} cardVisual 
     */
    onCardClicked(cardVisual) {
        // Optional implementation by subclasses
    }

    /**
     * Called when points are earned by any player.
     * @param {Object} data { player, points, reason }
     */
    onPointsEarned({ player, points, reason }) {
        this.view.updateScores();
        
        const isHuman = player === this.humanPlayer;
        const { x, y } = TableLayout.getFloatingTextPosition(this.view.scene.scale, isHuman);
        
        const isGoPoint = reason === 'Pegging' && points === 1;
        const is31Point = reason === 'Pegging' && points === 2 && this.gameState.pegging?.currentTotal === 0 && this.gameState.pegging?.playedCards.length === 0;
        
        const displayReason = isGoPoint ? 'Go' : is31Point ? '31' : reason;
        const textColor = (isGoPoint || is31Point) ? 0xffffff : 0xffff00;

        console.log('GIVING ', points, "for: ", reason);
        this.view.showFloatingText(x, y, `+${points} ${displayReason}`, textColor);
    }

    /**
     * Called when a card is played (specifically during pegging).
     * @param {Object} result 
     */
    onCardPlayed(result) {
        // Optional implementation by subclasses
    }

    /**
     * Called when cards are discarded to the crib.
     */
    onCardDiscarded() {
        // Optional implementation by subclasses
    }

    /**
     * Called when the deck is cut and the starter card is revealed.
     * @param {Object} data { card }
     */
    onStarterCardCut({ card }) {
        this.view.flow.animateStarterCardCut(card);
    }

    /**
     * Called when cards are dealt to players.
     * @param {Object} data { hands }
     */
    onCardsDealt(data) {
        this.view.updateHands(this.humanPlayer.hand.cards, this.botPlayer.hand.cards);
    }

    /**
     * Called when the dealer changes.
     */
    onDealerChanged() {
        this.view.updateScores();
    }
}
