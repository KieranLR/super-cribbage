import { Deck } from './Deck.js';
import { Player } from './Player.js';
import { Crib } from './Crib.js';
import { Pegging } from './Pegging.js';
import { Scoring } from './Scoring.js';
import { PHASES, WINNING_SCORE } from './Constants.js';

import { StartingCutPhase } from './phases/StartingCutPhase.js';
import { DealingPhase } from './phases/DealingPhase.js';
import { DiscardingPhase } from './phases/DiscardingPhase.js';
import { CuttingPhase } from './phases/CuttingPhase.js';
import { PeggingPhase } from './phases/PeggingPhase.js';
import { CountingPhase } from './phases/CountingPhase.js';
import { GameOverPhase } from './phases/GameOverPhase.js';

export class GameState {
    /**
     * @param {Player[]} players - The players participating in the game.
     * @param {Object} [options] - Configuration options for the game.
     */
    constructor(players, options = {}) {
        this.players = players;
        this.deck = new Deck();
        this.phase = PHASES.STARTING_CUT;
        this.dealerIndex = -1; // No dealer yet
        this.starterCard = null;
        this.crib = null;
        this.pegging = null;
        this.winner = null;
        this.callbacks = options.callbacks || {};

        // Keep track of which players have discarded to the crib
        this.discardedToCrib = players.map(() => false);
        
        // Tracking cuts for the starting cut phase
        this.startingCuts = players.map(() => null);
        
        this.phases = {
            [PHASES.STARTING_CUT]: new StartingCutPhase(this),
            [PHASES.DEALING]: new DealingPhase(this),
            [PHASES.DISCARDING]: new DiscardingPhase(this),
            [PHASES.CUTTING]: new CuttingPhase(this),
            [PHASES.PEGGING]: new PeggingPhase(this),
            [PHASES.COUNTING]: new CountingPhase(this),
            [PHASES.GAME_OVER]: new GameOverPhase(this)
        };

        // Ensure initial dealer is set
        this.updateDealer();
    }

    /**
     * Emits an event by calling a registered callback.
     * @param {string} event 
     * @param {any} data 
     */
    emit(event, data) {
        //console.log(`[GameState] Emitting ${event}:`, data);
        if (this.callbacks[event]) {
            this.callbacks[event](data);
        }
    }

    /**
     * Sets the isDealer flag on each player correctly.
     */
    updateDealer() {
        this.players.forEach((player, index) => {
            player.isDealer = (index === this.dealerIndex);
        });
        // Create a new Crib for the current dealer
        if (this.dealerIndex !== -1) {
            this.crib = new Crib(this.players[this.dealerIndex]);
            this.emit('dealerChanged', { dealerIndex: this.dealerIndex, dealer: this.players[this.dealerIndex] });
        }
    }

    /**
     * Moves to the next phase in the Cribbage game.
     */
    nextPhase() {
        const oldPhase = this.phase;
        switch (this.phase) {
            case PHASES.STARTING_CUT:
                this.phase = PHASES.DEALING;
                break;
            case PHASES.DEALING:
                this.phase = PHASES.DISCARDING;
                break;
            case PHASES.DISCARDING:
                this.phase = PHASES.CUTTING;
                break;
            case PHASES.CUTTING:
                this.phase = PHASES.PEGGING;
                break;
            case PHASES.PEGGING:
                this.phase = PHASES.COUNTING;
                break;
            case PHASES.COUNTING:
                if (this.checkWin()) {
                    this.phase = PHASES.GAME_OVER;
                } else {
                    this.dealerIndex = (this.dealerIndex + 1) % this.players.length;
                    this.phase = PHASES.DEALING;
                }
                break;
            case PHASES.GAME_OVER:
                console.log("GAME OVER!!!");
                break;
        }
        
        if (this.phases[this.phase]) {
            this.phases[this.phase].start();
        }
        
        this.emit('phaseChanged', { phase: this.phase, oldPhase });
    }

    /**
     * Starts a new round of Cribbage.
     */
    startNewRound() {
        if (this.phase !== PHASES.GAME_OVER) {
            this.dealerIndex = (this.dealerIndex + 1) % this.players.length;
            this.phase = PHASES.DEALING;
            if (this.phases[this.phase]) {
                this.phases[this.phase].start();
            }
            this.emit('phaseChanged', { phase: this.phase });
        }
    }

    /**
     * Allows a player to cut a card to determine the first dealer.
     * @param {Player} player 
     * @param {number} cardIndex - The index of the card in the deck to cut.
     */
    cutForDealer(player, cardIndex) {
        const currentPhase = this.phases[this.phase];
        if (currentPhase && typeof currentPhase.cutForDealer === 'function') {
            currentPhase.cutForDealer(player, cardIndex);
        }
    }

    /**
     * Deals 6 cards to each player (standard 2-player Cribbage).
     */
    dealCards() {
        const currentPhase = this.phases[this.phase];
        if (currentPhase && typeof currentPhase.dealCards === 'function') {
            currentPhase.dealCards();
        }
    }

    /**
     * Allows a player to discard cards to the crib.
     * @param {Player} player 
     * @param {import('./Card.js').Card[]} cards - Cards to discard.
     */
    discardToCrib(player, cards) {
        const currentPhase = this.phases[this.phase];
        if (currentPhase && typeof currentPhase.discardToCrib === 'function') {
            currentPhase.discardToCrib(player, cards);
        }
    }

    /**
     * Cuts the deck to reveal the starter card.
     */
    cutStarterCard() {
        const currentPhase = this.phases[this.phase];
        if (currentPhase && typeof currentPhase.cutStarterCard === 'function') {
            currentPhase.cutStarterCard();
        }
    }

    /**
     * Initializes the pegging phase.
     */
    startPegging() {
        const currentPhase = this.phases[this.phase];
        if (currentPhase && typeof currentPhase.startPegging === 'function') {
            currentPhase.startPegging();
        }
    }

    /**
     * Processes a pegging move.
     * @param {Player} player 
     * @param {import('./Card.js').Card|null} card - Card to play, or null for "Go".
     */
    playPeggingCard(player, card) {
        const currentPhase = this.phases[this.phase];
        if (currentPhase && typeof currentPhase.playPeggingCard === 'function') {
            currentPhase.playPeggingCard(player, card);
        }
    }

    /**
     * Scores the hands and the crib at the end of the round.
     */
    countHands() {
        const currentPhase = this.phases[this.phase];
        if (currentPhase && typeof currentPhase.countHands === 'function') {
            currentPhase.countHands();
        }
    }

    /**
     * Counts a specific player's hand.
     * @param {Player} player 
     */
    countPlayerHand(player) {
        const currentPhase = this.phases[this.phase];
        if (currentPhase && typeof currentPhase.countPlayerHand === 'function') {
            currentPhase.countPlayerHand(player);
        }
    }

    /**
     * Counts the crib.
     */
    countCrib() {
        const currentPhase = this.phases[this.phase];
        if (currentPhase && typeof currentPhase.countCrib === 'function') {
            currentPhase.countCrib();
        }
    }

    /**
     * Checks if any player has reached the winning score.
     * @returns {boolean}
     */
    checkWin() {
        // console.log('checking for win');
        for (const player of this.players) {
            if (player.score >= WINNING_SCORE) {
                // console.log("WINNNNBER");
                this.winner = player;
                this.emit('phaseChanged', { phase: PHASES.GAME_OVER, oldPhase: this.phase });
                this.phase = PHASES.GAME_OVER;
                return true;
            }
        }
        return false;
    }

    /**
     * Checks if it's a Bot's turn and triggers their move if so.
     */
    checkBotTurns() {
        const currentPhase = this.phases[this.phase];
        if (currentPhase && typeof currentPhase.checkBotTurns === 'function') {
            currentPhase.checkBotTurns();
        }
    }

    getPublicState() {
        return {
            phase: this.phase,
            players: this.players.map(player => ({
                id: player.id,
                name: player.name,
                score: player.score,
                isDealer: player.isDealer,
                handSize: player.hand.cards.length,
                hand: [...player.hand.cards] // For now, we'll return the full hand for UI
            })),
            dealerIndex: this.dealerIndex,
            starterCard: this.starterCard,
            cribSize: this.crib ? this.crib.cards.length : 0,
            crib: this.crib ? [...this.crib.cards] : [], // UI might need to see the crib at certain phases
            pegging: (this.pegging && typeof this.pegging.isPhaseComplete === 'function') ? {
                currentTotal: this.pegging.currentTotal,
                playedCards: [...this.pegging.playedCards],
                allPlayedCards: [...this.pegging.allPlayedCards],
                turnIndex: this.pegging.turnIndex,
                lastPlayerToPlay: this.pegging.lastPlayerToPlay ? {
                    id: this.pegging.lastPlayerToPlay.id,
                    name: this.pegging.lastPlayerToPlay.name
                } : null
            } : null,
            winner: this.winner ? {
                id: this.winner.id,
                name: this.winner.name,
                score: this.winner.score
            } : null
        };
    }
}
