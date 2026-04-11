import { Scene } from 'phaser';
import { GameState } from '../../../game/GameState.js';
import { Player } from '../../../game/Player.js';
import { BotPlayer } from '../../../game/BotPlayer.js';
import { Card, Suits, Values } from '../../../game/Card.js';
import { CribbageGameView } from '../CribbageGameView.js';
import { HumanVsBotController } from '../HumanVsBotController.js';
import {TableAnimator} from "../../utils/TableAnimator.js";

/**
 * Test scene specifically designed to trigger and test the "tie" condition 
 * during the starting cut phase where both players cut the same card rank.
 */
export class TestStartingCutTieScene extends Scene {
    constructor() {
        super('TestStartingCutTieScene');
    }

    create() {
        this.animator = new TableAnimator(this);
        // Initialize Players
        this.humanPlayer = new Player('human', 'You');
        this.botPlayer = new BotPlayer('bot', 'Bot');
        this.players = [this.humanPlayer, this.botPlayer];

        // Initialize GameState
        this.gameState = new GameState(this.players);

        // FORCE A TIE:
        // Fill the deck with only Aces of Spades (or any same-rank card)
        // This ensures that whatever card they "cut" from the deck, it will have the same rank.
        const tieCards = [];
        for (let i = 0; i < 52; i++) {
            tieCards.push(new Card(Suits.SPADES, Values.ACE));
        }
        this.gameState.deck.cards = tieCards;

        // We also need to make sure that when the deck is reset (after a tie), 
        // it stays tied for the next attempt if we want to keep testing the tie.
        // However, GameState.determineFirstDealer calls deck.reset() and deck.shuffle().
        // So we override deck.reset to keep our "tie" cards.
        this.gameState.deck.reset = () => {
            this.gameState.deck.cards = [];
            for (let i = 0; i < 52; i++) {
                this.gameState.deck.cards.push(new Card(Suits.SPADES, Values.ACE));
            }
        };

        // Initialize View
        this.view = new CribbageGameView(this, this.animator);
        this.view.initializeScoreboard(this.players);

        // Initialize Controller
        this.controller = new HumanVsBotController(this.gameState, this.view, this.humanPlayer, this.botPlayer, this.animator);

        // Start Game - this will start in the STARTING_CUT phase
        this.controller.onPhaseChanged({ phase: this.gameState.phase, oldPhase: null });
    }
}
