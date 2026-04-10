import { PHASES } from '../../game/Constants.js';
import { StartingCutPhase } from './phases/StartingCutPhase.js';
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
        this.gameState.callbacks = {
            phaseChanged: (data) => this.onPhaseChanged(data),
            startingCardCut: (data) => this.delegate('onStartingCardCut', data),
            startingCutTie: (data) => this.delegate('onStartingCutTie', data),
            firstDealerDetermined: (data) => this.delegate('onFirstDealerDetermined', data),
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

    onCardDropped(cardVisual, x, y) {
        if (this.isProcessingMove) return false;

        const currentPhase = this.phases[this.gameState.phase];
        if (currentPhase && currentPhase.onCardDropped) {
            return currentPhase.onCardDropped(cardVisual, x, y);
        }
        return false;
    }

    onPhaseChanged({ phase, oldPhase }) {
        console.log(`[Controller] Phase changed from ${oldPhase} to ${phase}`);
        this.view.clearButtons();

        const phaseLogic = this.phases[phase];
        if (phaseLogic && phaseLogic.start) {
            phaseLogic.start();
        }
        
        // Ensure bots take their turn if it's their phase
        this.gameState.checkBotTurns();
    }
}
