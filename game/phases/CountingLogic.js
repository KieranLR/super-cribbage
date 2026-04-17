import { GameLogicPhase } from './GameLogicPhase.js';
import { Scoring } from '../Scoring.js';

export class CountingLogic extends GameLogicPhase {
    start() {
        // No automatic counting here, the UI will step through it
    }

    /**
     * Scores the hands and the crib at the end of the round.
     */
    countHands() {
        // 1. Non-dealer(s) count their hands first
        const nonDealerIndices = this.gameState.players
            .map((_, index) => index)
            .filter(index => index !== this.gameState.dealerIndex);

        // In 2-player game, there's only one non-dealer.
        // If we want to support more, we'd iterate.
        for (const index of nonDealerIndices) {
            const player = this.gameState.players[index];
            this.countPlayerHand(player);
            if (this.gameState.winner) return;
        }

        // 2. Dealer counts their hand
        const dealer = this.gameState.players[this.gameState.dealerIndex];
        this.countPlayerHand(dealer);
        if (this.gameState.winner) return;

        // 3. Dealer counts the crib
        this.countCrib();
        this.checkWin();
    }

    /**
     * Counts a specific player's hand.
     * @param {Player} player 
     */
    countPlayerHand(player) {
        // Use handForCounting which was stored during DiscardingLogic
        const score = Scoring.countHand(player.handForCounting, this.gameState.starterCard, false);
        player.addPoints(score.total);
        this.emit('pointsEarned', { player, points: score.total, reason: 'Hand Count', breakdown: score });
        this.checkWin();
    }

    /**
     * Counts the crib.
     */
    countCrib() {
        const dealer = this.gameState.players[this.gameState.dealerIndex];
        const cribScore = Scoring.countHand(this.gameState.crib.cards, this.gameState.starterCard, true);
        dealer.addPoints(cribScore.total);
        this.emit('pointsEarned', { player: dealer, points: cribScore.total, reason: 'Crib Count', breakdown: cribScore });
        this.checkWin();
    }
}
