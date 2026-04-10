import { Scene } from 'phaser';
import { GameState } from '../../game/GameState.js';
import { Scoring } from "../../game/Scoring.js";
import { Player } from '../../game/Player.js';
import { BotPlayer } from '../../game/BotPlayer.js';
import { HandVisual } from '../components/GameVisuals/HandVisual.js';
import { CribVisual } from '../components/GameVisuals/CribVisual.js';
import { PeggingAreaVisual } from '../components/GameVisuals/PeggingAreaVisual.js';
import { StarterCardVisual } from '../components/GameVisuals/StarterCardVisual.js';
import { Scoreboard } from '../components/GameVisuals/Scoreboard.js';
import { PhaseIndicator } from '../components/GameVisuals/PhaseIndicator.js';
import { ActionButtons } from '../components/GameVisuals/ActionButtons.js';
import { PHASES } from '../../game/Constants.js';

export class Game extends Scene {
    constructor() {
        super('Game');
    }

    create() {
        const { width, height } = this.scale;

        // Background
        const bg = this.add.image(width / 2, height / 2, 'background');
        const scale = Math.max(width / bg.width + 0.2, height / bg.height + 0.2);
        bg.setScale(scale).setScrollFactor(0);

        // Initialize Players
        this.humanPlayer = new Player('human', 'You');
        this.botPlayer = new BotPlayer('bot', 'Bot');
        this.players = [this.humanPlayer, this.botPlayer];

        // Initialize GameState
        this.gameState = new GameState(this.players, {
            callbacks: {
                phaseChanged: (data) => this.onPhaseChanged(data),
                cardsDealt: (data) => this.onCardsDealt(data),
                cardDiscarded: (data) => this.onCardDiscarded(data),
                starterCardCut: (data) => this.onStarterCardCut(data),
                cardPlayed: (data) => this.onCardPlayed(data),
                pointsEarned: (data) => this.onPointsEarned(data)
            }
        });

        // Create Visual Components
        this.setupVisuals(width, height);

        // Start Game
        this.gameState.startNewRound();
    }

    setupVisuals(width, height) {
        // Hands
        this.humanHandVisual = new HandVisual(this, width / 2, height - 120, [], false, (v) => this.onCardClicked(v));
        this.botHandVisual = new HandVisual(this, width / 2, 100, [], true);

        // Areas
        this.peggingAreaVisual = new PeggingAreaVisual(this, width / 2, height / 2 - 40);
        this.cribVisual = new CribVisual(this, width - 100, height / 2);
        this.starterCardVisual = new StarterCardVisual(this, 100, height / 2);

        // HUD
        this.scoreboard = new Scoreboard(this, 160, 60, this.players);
        this.phaseIndicator = new PhaseIndicator(this, width / 2, 220);
        this.actionButtons = new ActionButtons(this, width / 2, height - 240);
        this.actionButtons.setDepth(100);
    }

    onCardClicked(cardVisual) {
        if (this.gameState.phase === PHASES.DISCARDING) {
            cardVisual.setSelected(!cardVisual.isSelected);
            this.updateDiscardButton();
        } else if (this.gameState.phase === PHASES.PEGGING) {
            // Check if it's player's turn and card is valid
            const pegging = this.gameState.pegging;
            if (pegging && pegging.getCurrentPlayer() === this.humanPlayer) {
                // For simplicity, we just try to play it
                // Logic already checks if it's valid
                this.gameState.playPeggingCard(this.humanPlayer, cardVisual.cardData);
            }
        }
    }

    updateDiscardButton() {
        const selectedCount = this.humanHandVisual.getSelectedCards().length;
        if (selectedCount === 2) {
            // Only add the button if it doesn't exist to avoid recreation issues
            if (!this.actionButtons.buttons['discard']) {
                this.actionButtons.addButton('discard', 'Confirm Discard', () => {
                    const selected = this.humanHandVisual.getSelectedCards().map(v => v.cardData);
                    this.gameState.discardToCrib(this.humanPlayer, selected);
                    this.actionButtons.hideButton('discard');
                });
            } else {
                this.actionButtons.showButton('discard');
            }
        } else {
            this.actionButtons.hideButton('discard');
        }
    }

    // Event Handlers
    onPhaseChanged({ phase, oldPhase }) {
        console.log(`[GameScene] Phase changed from ${oldPhase} to ${phase}`);
        let instruction = '';
        this.actionButtons.clearButtons();

        switch (phase) {
            case PHASES.DEALING:
                instruction = 'Dealing cards...';
                break;
            case PHASES.DISCARDING:
                instruction = 'Select 2 cards for the crib';
                break;
            case PHASES.CUTTING:
                instruction = 'Cutting the deck...';
                break;
            case PHASES.PEGGING:
                instruction = 'Play a card (up to 31)';
                this.updatePeggingInstructions();
                break;
            case PHASES.COUNTING:
                instruction = 'Counting hands...';
                if (!this.actionButtons.buttons['next']) {
                    this.actionButtons.addButton('next', 'Next Round', () => {
                        this.gameState.startNewRound();
                    });
                } else {
                    this.actionButtons.showButton('next');
                }
                break;
            case PHASES.GAME_OVER:
                instruction = 'Game Over!';
                const winner = this.gameState.winner;
                this.add.text(this.scale.width / 2, this.scale.height / 2 + 100, `${winner.name} Wins!`, {
                    fontSize: '48px', color: '#ff0000', stroke: '#000', strokeThickness: 6
                }).setOrigin(0.5);
                this.time.delayedCall(3000, () => this.scene.start('GameOver'));
                break;
        }

        this.phaseIndicator.updatePhase(phase, instruction);
    }

    updatePeggingInstructions() {
        if (this.gameState.phase !== PHASES.PEGGING) return;
        const currentPlayer = this.gameState.pegging.getCurrentPlayer();
        const instruction = currentPlayer === this.humanPlayer ? 'Your Turn' : 'Bot is thinking...';
        this.phaseIndicator.updatePhase(PHASES.PEGGING, instruction);

        if (currentPlayer === this.humanPlayer) {
            // Check if player can play anything
            const canPlay = this.humanPlayer.hand.cards.some(c => 
                this.gameState.pegging.currentTotal + Scoring.getCardValue(c) <= 31
            );
            if (!canPlay && this.humanPlayer.hand.cards.length > 0) {
                if (!this.actionButtons.buttons['go']) {
                    this.actionButtons.addButton('go', 'Say Go', () => {
                        this.gameState.playPeggingCard(this.humanPlayer, null);
                        this.actionButtons.hideButton('go');
                    });
                } else {
                    this.actionButtons.showButton('go');
                }
            } else {
                this.actionButtons.hideButton('go');
            }
        }
    }

    onCardsDealt({ players }) {
        this.humanHandVisual.setCards(this.humanPlayer.hand.cards);
        this.botHandVisual.setCards(this.botPlayer.hand.cards);
    }

    onCardDiscarded({ player, cards }) {
        if (player === this.humanPlayer) {
            this.humanHandVisual.setCards(this.humanPlayer.hand.cards);
        } else {
            this.botHandVisual.setCards(this.botPlayer.hand.cards);
        }
        this.cribVisual.setCards(this.gameState.crib.cards);
    }

    onStarterCardCut({ card }) {
        this.starterCardVisual.setCard(card);
    }

    onCardPlayed(result) {
        // Result: { isGo, player, card, points, ... }
        if (result.isGo) {
            console.log(`${result.player.name} said Go`);
        } else {
            this.peggingAreaVisual.update(this.gameState.pegging.playedCards, this.gameState.pegging.currentTotal);
            if (result.player === this.humanPlayer) {
                this.humanHandVisual.setCards(this.humanPlayer.hand.cards);
            } else {
                // Add a small delay for bot play visuals if needed
                this.botHandVisual.setCards(this.botPlayer.hand.cards);
            }
        }
        
        if (this.gameState.phase === PHASES.PEGGING) {
            this.updatePeggingInstructions();
        }
    }

    onPointsEarned({ player, points, reason }) {
        this.scoreboard.updateScores();
        
        // Visual feedback for points
        const x = player === this.humanPlayer ? this.scale.width / 2 : this.scale.width / 2;
        const y = player === this.humanPlayer ? this.scale.height - 200 : 200;
        
        const floatingText = this.add.text(x, y, `+${points} ${reason}`, {
            fontSize: '32px', color: '#ffff00', fontStyle: 'bold', stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5);

        this.tweens.add({
            targets: floatingText,
            y: y - 100,
            alpha: 0,
            duration: 2000,
            onComplete: () => floatingText.destroy()
        });
    }
}