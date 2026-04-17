 import { PHASES } from '../../game/Constants.js';
import { TIMINGS } from '../utils/flow/timings.js';
import { StartingCutPhase } from './phases/StartingCutPhase.js';
import { DealingPhase } from './phases/DealingPhase.js';
import { DiscardingPhase } from './phases/DiscardingPhase.js';
import { CuttingPhase } from './phases/CuttingPhase.js';
import { PeggingPhase } from './phases/PeggingPhase.js';
import { CountingPhase } from './phases/CountingPhase.js';
import { GameOverPhase } from './phases/GameOverPhase.js';

export class HumanVsBotController {
    constructor(gameState, gameFlow, view, humanPlayer, botPlayer, animator) {
        this.gameState = gameState;
        this.gameFlow = gameFlow;
        this.view = view;
        this.humanPlayer = humanPlayer;
        this.botPlayer = botPlayer;
        this.animator = animator;
        this.isProcessingMove = false;

        this.phases = {
            [PHASES.STARTING_CUT]: new StartingCutPhase(this),
            [PHASES.DEALING]: new DealingPhase(this),
            [PHASES.DISCARDING]: new DiscardingPhase(this),
            [PHASES.CUTTING]: new CuttingPhase(this),
            [PHASES.PEGGING]: new PeggingPhase(this),
            [PHASES.COUNTING]: new CountingPhase(this),
            [PHASES.GAME_OVER]: new GameOverPhase(this)
        };

        this.subscribeToEvents();
        this.view.setCardClickedCallback((v) => this.onCardClicked(v));
        this.view.setCardDroppedCallback((v, x, y) => this.onCardDropped(v, x, y));
    }

    subscribeToEvents() {
        const ee = this.gameFlow.eventEmitter;
        ee.on('phaseChanged', (data) => this.onPhaseChanged(data));
        ee.on('startingCardCut', (data) => this.onStartingCardCut(data));
        ee.on('startingCutTie', (data) => this.onStartingCutTie(data));
        ee.on('firstDealerDetermined', (data) => this.onFirstDealerDetermined(data));
        ee.on('cardsDealt', (data) => this.onCardsDealt(data));
        ee.on('cardDiscarded', (data) => this.onCardDiscarded(data));
        ee.on('allDiscarded', (data) => this.delegate('onAllDiscarded', data));
        ee.on('starterCardCut', (data) => this.delegate('onStarterCardCut', data));
        ee.on('cardPlayed', (data) => this.onCardPlayed(data));
        ee.on('peggingComplete', (data) => this.onPeggingComplete(data));
        ee.on('pointsEarned', (data) => this.delegate('onPointsEarned', data));
        ee.on('dealerChanged', (data) => this.delegate('onDealerChanged', data));
    }

    delegate(methodName, data) {
        const currentPhase = this.phases[this.gameState.phase];
        if (currentPhase && currentPhase[methodName]) {
            currentPhase[methodName](data);
        }
    }

    onCardClicked(cardVisual) {
        if (this.isProcessingMove) return;

        const currentPhase = this.phases[this.gameState.phase];
        if (currentPhase && currentPhase.onCardClicked) {
            currentPhase.onCardClicked(cardVisual);
        }
    }

    onCardDropped(cardVisual, x, y) {
        if (this.isProcessingMove) return false;

        const currentPhase = this.phases[this.gameState.phase];
        if (currentPhase && currentPhase.onCardDropped) {
            return currentPhase.onCardDropped(cardVisual, x, y);
        }
        return false;
    }

    onStartingCardCut(data) {
        this.delegate('onStartingCardCut', data);
        // Only call checkBotTurns if not in STARTING_CUT phase.
        // In STARTING_CUT, the bot turn is already scheduled once at phase start or tie reset.
        if (this.gameState.phase !== PHASES.STARTING_CUT) {
            this.checkBotTurns();
        }
    }

    onStartingCutTie(data) {
        this.delegate('onStartingCutTie', data);
        this.view.scene.time.delayedCall(TIMINGS.PHASE_TRANSITIONS.STARTING_CUT_TIE_UI + TIMINGS.BOT.STARTING_CUT, () => {
            if (this.gameState.phase !== PHASES.STARTING_CUT) return;
            this.checkBotTurns();
        });
    }

    onFirstDealerDetermined(data) {
        this.delegate('onFirstDealerDetermined', data);
        this.view.scene.time.delayedCall(TIMINGS.PHASE_TRANSITIONS.FIRST_DEALER_DETERMINED, () => {
            this.gameFlow.nextPhase();
        });
    }

    onCardsDealt(data) {
        this.delegate('onCardsDealt', data);
        this.view.scene.time.delayedCall(TIMINGS.PHASE_TRANSITIONS.CARDS_DEALT, () => {
            this.gameFlow.nextPhase();
        });
    }

    onCardDiscarded(data) {
        this.delegate('onCardDiscarded', data);
        this.checkBotTurns();
    }

    onAllDiscarded(data) {
        const currentPhase = this.phases[this.gameState.phase];
        if (currentPhase && currentPhase.onAllDiscarded) {
            currentPhase.onAllDiscarded(data);
        } else {
            this.gameFlow.nextPhase();
        }
    }

    onPeggingComplete(data) {
        this.view.scene.time.delayedCall(TIMINGS.PHASE_TRANSITIONS.PEGGING_COMPLETE, () => {
            this.gameFlow.nextPhase();
        });
    }

    onCardPlayed(data) {
        this.delegate('onCardPlayed', data);
        this.checkBotTurns();
    }

    onPhaseChanged({ phase, oldPhase }) {
        console.log(`[Controller] Phase changed from ${oldPhase} to ${phase}`);
        this.view.clearButtons();

        // Cleanup the previous phase UI
        if (oldPhase && this.phases[oldPhase]) {
            this.phases[oldPhase].cleanup();
        }

        const phaseLogic = this.phases[phase];
        if (phaseLogic && phaseLogic.start) {
            phaseLogic.start();
        }
        
        // Ensure bots take their turn if it's their phase
        this.checkBotTurns();
    }

    checkBotTurns() {
        if (this.gameState.winner) return;

        const phase = this.gameState.phase;
        
        if (phase === PHASES.STARTING_CUT) {
            this.gameState.players.forEach((player, index) => {
                if (player.isBot && !this.gameState.startingCuts[index]) {
                    this.view.scene.time.delayedCall(TIMINGS.BOT.STARTING_CUT, () => {
                        if (this.gameState.phase !== PHASES.STARTING_CUT) return;
                        if (this.gameState.startingCuts[index]) return; // Extra guard
                        this.gameFlow.checkBotTurns();
                    });
                }
            });
        } else if (phase === PHASES.DISCARDING) {
            this.gameState.players.forEach((player, index) => {
                if (player.isBot && !this.gameState.discardedToCrib[index]) {
                    this.view.scene.time.delayedCall(TIMINGS.BOT.DISCARDING, () => {
                        if (this.gameState.phase !== PHASES.DISCARDING) return;
                        this.gameFlow.checkBotTurns();
                    });
                }
            });
        } else if (phase === PHASES.PEGGING) {
            const pegging = this.gameState.pegging;
            if (!pegging) return;
            const currentPlayer = pegging.getCurrentPlayer();
            if (currentPlayer && currentPlayer.isBot) {
                const isNewCycle = pegging.currentTotal === 0;
                const delay = isNewCycle ? TIMINGS.BOT.PEGGING_NEW_CYCLE : TIMINGS.BOT.PEGGING;
                
                this.view.scene.time.delayedCall(delay, () => {
                    if (this.gameState.phase !== PHASES.PEGGING || !this.gameState.pegging) return;
                    if (this.gameState.pegging.getCurrentPlayer() !== currentPlayer) return;
                    this.gameFlow.checkBotTurns();
                });
            }
        }
    }
}
