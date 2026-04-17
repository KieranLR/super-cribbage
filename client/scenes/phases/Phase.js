import { PHASES } from '../../../game/Constants.js';
import { TIMINGS } from '../../utils/flow/timings.js';
import { TableLayout } from '../../utils/TableLayout.js';

export class Phase {
    constructor(controller) {
        this.controller = controller;
        this.gameFlow = controller.gameFlow;
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
        this.view.visuals.hud.phaseIndicator.updatePhase(phase, instruction);

        // Visibility of Pegging Area
        const isPegging = phase === PHASES.PEGGING;
        this.view.visuals.table.peggingArea.setVisible(isPegging);

        const targetPos = this.view.layout.getCribPosition(phase, PHASES);
        this.transitionCrib(phase, targetPos);

        // Visibility of Sort Widget
        const isSortVisible = [PHASES.DISCARDING, PHASES.PEGGING].includes(phase);
        this.transitionSortWidget(isSortVisible);
    }

    /**
     * Fades the sort widget based on visibility.
     */
    transitionSortWidget(isVisible) {
        if (!this.view.visuals.hud.sortWidget) return;

        if (isVisible && !this.view.visuals.hud.sortWidget.visible) {
            this.view.visuals.hud.sortWidget.setVisible(true);
            this.view.visuals.hud.sortWidget.alpha = 0;
            this.view.flow.startAnimation();
            this.animator.fade(this.view.visuals.hud.sortWidget, 1, TIMINGS.ANIMATIONS.GENERIC_MOVE, () => this.view.flow.endAnimation());
        } else if (!isVisible && this.view.visuals.hud.sortWidget.visible) {
            this.view.flow.startAnimation();
            this.animator.fade(this.view.visuals.hud.sortWidget, 0, TIMINGS.ANIMATIONS.GENERIC_MOVE, () => {
                this.view.visuals.hud.sortWidget.setVisible(false);
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

        if (isVisible && !this.view.visuals.table.crib.visible) {
            this.view.visuals.table.crib.setCards([]); // Clear cards from previous round/phase
            this.view.visuals.table.crib.setVisible(true);
            this.view.visuals.table.crib.alpha = 0;
            this.view.flow.startAnimation();
            this.animator.fade(this.view.visuals.table.crib, 1, TIMINGS.ANIMATIONS.GENERIC_MOVE, () => this.view.flow.endAnimation());
        } else if (!isVisible && this.view.visuals.table.crib.visible) {
            this.view.flow.startAnimation();
            this.animator.fade(this.view.visuals.table.crib, 0, TIMINGS.ANIMATIONS.GENERIC_MOVE, () => {
                this.view.visuals.table.crib.setVisible(false);
                this.view.flow.endAnimation();
            });
        }

        if (this.view.visuals.table.crib.visible) {
            this.view.flow.startAnimation();
            this.animator.moveCrib(this.view.visuals.table.crib, targetPos.x, targetPos.y)
                .on('complete', () => this.view.flow.endAnimation());
        } else {
            this.view.visuals.table.crib.setPosition(targetPos.x, targetPos.y);
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
        const { x, y } = this.view.layout.getFloatingTextPosition(isHuman);
        
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
        this.view.updateStarterCard(card);
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
