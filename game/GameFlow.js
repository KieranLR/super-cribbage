import { StartingCutLogic } from './phases/StartingCutLogic.js';
import { DealingLogic } from './phases/DealingLogic.js';
import { DiscardingLogic } from './phases/DiscardingLogic.js';
import { CuttingLogic } from './phases/CuttingLogic.js';
import { PeggingLogic } from './phases/PeggingLogic.js';
import { CountingLogic } from './phases/CountingLogic.js';
import { GameOverLogic } from './phases/GameOverLogic.js';
import { PHASES } from './Constants.js';
import { EventEmitter } from './EventEmitter.js';

export class GameFlow {
    /**
     * @param {import('./GameState.js').GameState} gameState - The game state to manage.
     * @param {import('./EventEmitter.js').EventEmitter} [eventEmitter] - Optional event emitter.
     */
    constructor(gameState, eventEmitter) {
        this.gameState = gameState;
        this.eventEmitter = eventEmitter || new EventEmitter();
        
        this.phases = {
            [PHASES.STARTING_CUT]: new StartingCutLogic(gameState, this.eventEmitter),
            [PHASES.DEALING]: new DealingLogic(gameState, this.eventEmitter),
            [PHASES.DISCARDING]: new DiscardingLogic(gameState, this.eventEmitter),
            [PHASES.CUTTING]: new CuttingLogic(gameState, this.eventEmitter),
            [PHASES.PEGGING]: new PeggingLogic(gameState, this.eventEmitter),
            [PHASES.COUNTING]: new CountingLogic(gameState, this.eventEmitter),
            [PHASES.GAME_OVER]: new GameOverLogic(gameState, this.eventEmitter)
        };
    }

    /**
     * Helper to call a method on the current phase.
     * @param {string} methodName 
     * @param {...any} args 
     * @returns {any}
     */
    _callPhaseMethod(methodName, ...args) {
        const currentPhase = this.phases[this.gameState.phase];
        if (currentPhase) {
            if (typeof currentPhase[methodName] === 'function') {
                return currentPhase[methodName](...args);
            }
        }
        return null;
    }

    /**
     * Helper to call a method on the current phase and warn if it doesn't exist.
     * @param {string} methodName 
     * @param {...any} args 
     * @returns {any}
     */
    _callPhaseMethodWithWarning(methodName, ...args) {
        const currentPhase = this.phases[this.gameState.phase];
        if (currentPhase) {
            if (typeof currentPhase[methodName] === 'function') {
                return currentPhase[methodName](...args);
            } else {
                console.warn(`[GameFlow] Phase ${this.gameState.phase} does not have method ${methodName}`);
            }
        }
        return null;
    }

    /**
     * Moves to the next phase in the Cribbage game.
     */
    nextPhase() {
        const oldPhase = this.gameState.phase;
        switch (this.gameState.phase) {
            case PHASES.STARTING_CUT:
                this.gameState.phase = PHASES.DEALING;
                break;
            case PHASES.DEALING:
                this.gameState.phase = PHASES.DISCARDING;
                break;
            case PHASES.DISCARDING:
                this.gameState.phase = PHASES.CUTTING;
                break;
            case PHASES.CUTTING:
                this.gameState.phase = PHASES.PEGGING;
                break;
            case PHASES.PEGGING:
                this.gameState.phase = PHASES.COUNTING;
                break;
            case PHASES.COUNTING:
                if (this.gameState.checkWin()) {
                    this.gameState.phase = PHASES.GAME_OVER;
                } else {
                    this.gameState.dealerIndex = (this.gameState.dealerIndex + 1) % this.gameState.players.length;
                    this.gameState.updateDealer();
                    this.eventEmitter.emit('dealerChanged', { dealerIndex: this.gameState.dealerIndex, dealer: this.gameState.players[this.gameState.dealerIndex] });
                    this.gameState.phase = PHASES.DEALING;
                }
                break;
            case PHASES.GAME_OVER:
                console.log("GAME OVER!!!");
                break;
        }
        
        if (this.phases[this.gameState.phase]) {
            this.phases[this.gameState.phase].start();
        }
        
        this.eventEmitter.emit('phaseChanged', { phase: this.gameState.phase, oldPhase });
    }

    /**
     * Starts a new round of Cribbage.
     */
    startNewRound() {
        if (this.gameState.phase !== PHASES.GAME_OVER) {
            this.gameState.dealerIndex = (this.gameState.dealerIndex + 1) % this.gameState.players.length;
            this.gameState.updateDealer();
            this.eventEmitter.emit('dealerChanged', { dealerIndex: this.gameState.dealerIndex, dealer: this.gameState.players[this.gameState.dealerIndex] });
            this.gameState.phase = PHASES.DEALING;
            if (this.phases[this.gameState.phase]) {
                this.phases[this.gameState.phase].start();
            }
            this.eventEmitter.emit('phaseChanged', { phase: this.gameState.phase, oldPhase: PHASES.COUNTING });
        }
    }

    /**
     * Allows a player to cut a card to determine the first dealer.
     * @param {Player} player 
     * @param {number} cardIndex - The index of the card in the deck to cut.
     */
    cutForDealer(player, cardIndex) {
        this._callPhaseMethodWithWarning('cutForDealer', player, cardIndex);
    }

    /**
     * Deals 6 cards to each player (standard 2-player Cribbage).
     */
    dealCards() {
        this._callPhaseMethodWithWarning('dealCards');
    }

    /**
     * Allows a player to discard cards to the crib.
     * @param {Player} player 
     * @param {import('./Card.js').Card[]} cards - Cards to discard.
     */
    discardToCrib(player, cards) {
        this._callPhaseMethodWithWarning('discardToCrib', player, cards);
    }

    /**
     * Cuts the deck to reveal the starter card.
     */
    cutStarterCard() {
        this._callPhaseMethodWithWarning('cutStarterCard');
    }

    /**
     * Initializes the pegging phase.
     */
    startPegging() {
        this._callPhaseMethodWithWarning('startPegging');
    }

    /**
     * Processes a pegging move.
     * @param {Player} player 
     * @param {import('./Card.js').Card|null} card - Card to play, or null for "Go".
     */
    playPeggingCard(player, card) {
        this._callPhaseMethodWithWarning('playPeggingCard', player, card);
    }

    /**
     * Scores the hands and the crib at the end of the round.
     */
    countHands() {
        this._callPhaseMethodWithWarning('countHands');
    }

    /**
     * Counts a specific player's hand.
     * @param {Player} player 
     */
    countPlayerHand(player) {
        this._callPhaseMethodWithWarning('countPlayerHand', player);
    }

    /**
     * Counts the crib.
     */
    countCrib() {
        this._callPhaseMethodWithWarning('countCrib');
    }

    /**
     * Checks if it's a Bot's turn and triggers their move if so.
     */
    checkBotTurns() {
        this._callPhaseMethod('checkBotTurns');
    }
}
