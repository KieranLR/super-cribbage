import { PHASES } from '../../game/Constants.js';
import { DealingPhase } from './phases/DealingPhase.js';
import { DiscardingPhase } from './phases/DiscardingPhase.js';
import { CuttingPhase } from './phases/CuttingPhase.js';
import { PeggingPhase } from './phases/PeggingPhase.js';
import { CountingPhase } from './phases/CountingPhase.js';
import { GameOverPhase } from './phases/GameOverPhase.js';

export class HumanVsBotController {
    constructor(gameState, view, humanPlayer, botPlayer) {
        this.gameState = gameState;
        this.view = view;
        this.humanPlayer = humanPlayer;
        this.botPlayer = botPlayer;
        this.isProcessingMove = false;

        this.phases = {
            [PHASES.DEALING]: new DealingPhase(this),
            [PHASES.DISCARDING]: new DiscardingPhase(this),
            [PHASES.CUTTING]: new CuttingPhase(this),
            [PHASES.PEGGING]: new PeggingPhase(this),
            [PHASES.COUNTING]: new CountingPhase(this),
            [PHASES.GAME_OVER]: new GameOverPhase(this)
        };

        this.subscribeToEvents();
        this.view.setCardClickedCallback((v) => this.onCardClicked(v));
    }

    subscribeToEvents() {
        this.gameState.callbacks = {
            phaseChanged: (data) => this.onPhaseChanged(data),
            cardsDealt: (data) => this.delegate('onCardsDealt', data),
            cardDiscarded: (data) => this.delegate('onCardDiscarded', data),
            starterCardCut: (data) => this.delegate('onStarterCardCut', data),
            cardPlayed: (data) => this.delegate('onCardPlayed', data),
            pointsEarned: (data) => this.delegate('onPointsEarned', data),
            dealerChanged: (data) => this.delegate('onDealerChanged', data)
        };
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

    onPhaseChanged({ phase, oldPhase }) {
        console.log(`[Controller] Phase changed from ${oldPhase} to ${phase}`);
        this.view.clearButtons();

        const phaseLogic = this.phases[phase];
        if (phaseLogic && phaseLogic.start) {
            phaseLogic.start();
        }
    }
}
