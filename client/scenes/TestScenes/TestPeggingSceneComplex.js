import { Scene } from 'phaser';
import { GameState } from '../../../game/GameState.js';
import { Player } from '../../../game/Player.js';
import { BotPlayer } from '../../../game/BotPlayer.js';
import { HandVisual } from '../../components/GameVisuals/HandVisual.js';
import { PeggingAreaVisual } from '../../components/GameVisuals/PeggingAreaVisual.js';
import { StarterCardVisual } from '../../components/GameVisuals/StarterCardVisual.js';
import { Scoreboard } from '../../components/GameVisuals/Scoreboard.js';
import { PhaseIndicator } from '../../components/GameVisuals/PhaseIndicator.js';
import { ActionButtons } from '../../components/GameVisuals/ActionButtons.js';
import { PHASES } from '../../../game/Constants.js';
import { Card, Suits, Values } from '../../../game/Card.js';

export class TestPeggingSceneComplex extends Scene {
    constructor() {
        super('TestPeggingSceneComplex');
    }

    create() {
        const { width, height } = this.scale;

        // Background
        const bg = this.add.image(width / 2, height / 2, 'background');
        const scale = Math.max(width / bg.width + 0.2, height / bg.height + 0.2);
        bg.setScale(scale).setScrollFactor(0);

        this.add.text(width * 0.5, 50, 'Pegging Logic Test', {
            fontFamily: 'Arial Black', fontSize: '32px', color: '#ffffff'
        }).setOrigin(0.5);

        // Initialize Players
        this.humanPlayer = new Player('human', 'You');
        this.botPlayer = new BotPlayer('bot', 'Bot');
        this.players = [this.humanPlayer, this.botPlayer];

        // Give them some specific cards for pegging
        this.humanPlayer.hand.addCard(new Card(Suits.HEARTS, Values.FIVE));
        this.humanPlayer.hand.addCard(new Card(Suits.SPADES, Values.SIX));
        this.humanPlayer.hand.addCard(new Card(Suits.DIAMONDS, Values.SEVEN));
        this.humanPlayer.hand.addCard(new Card(Suits.CLUBS, Values.EIGHT));

        this.botPlayer.hand.addCard(new Card(Suits.HEARTS, Values.TEN));
        this.botPlayer.hand.addCard(new Card(Suits.SPADES, Values.JACK));
        this.botPlayer.hand.addCard(new Card(Suits.DIAMONDS, Values.QUEEN));
        this.botPlayer.hand.addCard(new Card(Suits.CLUBS, Values.KING));

        // Initialize GameState
        this.gameState = new GameState(this.players, {
            callbacks: {
                phaseChanged: (data) => this.onPhaseChanged(data),
                cardPlayed: (data) => this.onCardPlayed(data),
                pointsEarned: (data) => this.onPointsEarned(data)
            }
        });

        // Set starter card manually
        this.gameState.starterCard = new Card(Suits.HEARTS, Values.ACE);
        
        // Force phase to PEGGING
        this.gameState.phase = PHASES.PEGGING;
        this.gameState.startPegging();

        // Create Visual Components
        this.setupVisuals(width, height);

        // Back button
        this.add.text(100, 50, 'Back', { fontSize: '24px', color: '#ffffff' })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.scene.start('TestListScene'));

        this.updatePeggingInstructions();
        this.checkBotTurn();
    }

    setupVisuals(width, height) {
        this.humanHandVisual = new HandVisual(this, width / 2, height - 120, this.humanPlayer.hand.cards, false, (v) => this.onCardClicked(v));
        this.botHandVisual = new HandVisual(this, width / 2, 120, this.botPlayer.hand.cards, true);
        this.peggingAreaVisual = new PeggingAreaVisual(this, width / 2, height / 2);
        this.scoreboard = new Scoreboard(this, 160, 60, this.players);
        this.phaseIndicator = new PhaseIndicator(this, width / 2, 220);
        this.actionButtons = new ActionButtons(this, width / 2, height - 240);
        
        this.phaseIndicator.updatePhase(PHASES.PEGGING, 'Testing Pegging...');
    }

    onCardClicked(cardVisual) {
        if (this.gameState.phase !== PHASES.PEGGING) return;
        
        const pegging = this.gameState.pegging;
        if (pegging && pegging.getCurrentPlayer() === this.humanPlayer) {
            try {
                this.gameState.playPeggingCard(this.humanPlayer, cardVisual.cardData);
            } catch (e) {
                console.warn(e.message);
                this.peggingAreaVisual.flash(0xff0000);
            }
        }
    }

    onPhaseChanged({ phase }) {
        this.phaseIndicator.updatePhase(phase, `Phase: ${phase}`);
        if (phase === PHASES.COUNTING) {
             this.add.text(this.scale.width / 2, this.scale.height / 2 + 100, 'Pegging Finished!', {
                fontSize: '32px', color: '#00ff00'
            }).setOrigin(0.5);
        }
    }

    onCardPlayed(result) {
        console.log('Card played:', result);
        this.peggingAreaVisual.update(this.gameState.pegging.playedCards, this.gameState.pegging.currentTotal);
        this.humanHandVisual.setCards(this.humanPlayer.hand.cards);
        this.botHandVisual.setCards(this.botPlayer.hand.cards);
        this.updatePeggingInstructions();
    }

    onPointsEarned({ player, points, reason }) {
        this.scoreboard.updateScores();
        console.log(`Points earned by ${player.name}: ${points} (${reason})`);
    }

    updatePeggingInstructions() {
        if (this.gameState.phase !== PHASES.PEGGING) return;
        const currentPlayer = this.gameState.pegging.getCurrentPlayer();
        const instruction = currentPlayer === this.humanPlayer ? 'Your Turn' : 'Bot is thinking...';
        this.phaseIndicator.updatePhase(PHASES.PEGGING, instruction);

        if (currentPlayer === this.humanPlayer) {
            const canPlay = this.humanPlayer.hand.cards.some(c => 
                this.gameState.pegging.currentTotal + this.gameState.pegging.getCardValue(c) <= 31
            );
            if (!canPlay && this.humanPlayer.hand.cards.length > 0) {
                this.actionButtons.addButton('go', 'Say Go', () => {
                    this.gameState.playPeggingCard(this.humanPlayer, null);
                    this.actionButtons.hideButton('go');
                });
            } else {
                this.actionButtons.hideButton('go');
            }
        } else {
            this.actionButtons.hideButton('go');
        }
    }

    checkBotTurn() {
        this.gameState.checkBotTurns();
    }
}
