export class Phase {
    constructor(controller) {
        this.controller = controller;
        this.gameState = controller.gameState;
        this.view = controller.view;
        this.humanPlayer = controller.humanPlayer;
        this.botPlayer = controller.botPlayer;
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
        
        const x = this.view.scene.scale.width / 2;
        const y = player === this.humanPlayer ? this.view.scene.scale.height - 200 : 200;
        
        const isGoPoint = reason === 'Pegging' && points === 1;
        const is31Point = reason === 'Pegging' && points === 2 && this.gameState.pegging.currentTotal === 0 && this.gameState.pegging.playedCards.length === 0;
        
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
        const visual = this.view.starterCardVisual.cardVisual;
        if (visual) {
            visual.isLocked = true;
            this.view.scene.time.delayedCall(500, () => {
                visual.isLocked = false;
            });
        }
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
