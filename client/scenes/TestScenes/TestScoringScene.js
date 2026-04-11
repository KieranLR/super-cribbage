import { Scene } from 'phaser';
import { GameState } from '../../../game/GameState.js';
import { Player } from '../../../game/Player.js';
import { BotPlayer } from '../../../game/BotPlayer.js';
import { CribbageGameView } from '../CribbageGameView.js';
import { HumanVsBotController } from '../HumanVsBotController.js';
import { TableAnimator } from '../../utils/TableAnimator.js';
import { PHASES } from '../../../game/Constants.js';

export class TestScoringScene extends Scene {
    constructor() {
        super('TestScoringScene');
    }

    create() {
        const { width, height } = this.scale;

        // 1. Setup Game Environment (similar to Game.js)
        this.animator = new TableAnimator(this);
        this.humanPlayer = new Player('human', 'You');
        this.botPlayer = new BotPlayer('bot', 'Stanley');
        this.players = [this.humanPlayer, this.botPlayer];
        this.gameState = new GameState(this.players);
        this.view = new CribbageGameView(this, this.animator);
        this.view.initializeScoreboard(this.players);
        this.controller = new HumanVsBotController(this.gameState, this.view, this.humanPlayer, this.botPlayer, this.animator);

        // 2. Mock Game State for end of Scoring
        this.setupMockState();

        // 3. UI for Testing
        this.add.text(width / 2, 50, 'Scoring End Test', {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const testBtn = this.add.text(width / 2, height / 2, 'Trigger Return Cards', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#0066cc',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            testBtn.setVisible(false);
            this.view.returnCardsToDeckAnimated(() => {
                this.add.text(width / 2, height / 2 + 100, 'Animation Complete!', {
                    fontSize: '24px',
                    color: '#00ff00'
                }).setOrigin(0.5);
                
                // Show Reset button
                const resetBtn = this.add.text(width / 2, height / 2 + 150, 'Reset Scene', {
                    fontSize: '20px',
                    color: '#ffffff',
                    backgroundColor: '#444444',
                    padding: { x: 10, y: 5 }
                })
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => this.scene.restart());
            });
        });

        // Back button
        this.add.text(width - 100, 50, 'Back', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.scene.start('TestListScene'));
    }

    setupMockState() {
        // Set dealer index so crib is initialized
        this.gameState.dealerIndex = 1; // Bot is dealer
        this.gameState.updateDealer();

        // Set phase to COUNTING
        this.gameState.phase = PHASES.COUNTING;

        // Deal some cards manually
        const deck = this.gameState.deck;
        deck.shuffle();

        // Give cards to players
        const humanCards = deck.dealMany(4);
        const botCards = deck.dealMany(4);
        const cribCards = deck.dealMany(4);
        const starterCard = deck.deal();

        this.humanPlayer.handForCounting = humanCards;
        this.botPlayer.handForCounting = botCards;
        this.gameState.crib.cards = cribCards;
        this.gameState.starterCard = starterCard;

        // Update Visuals
        this.view.updateHands(humanCards, botCards, false);
        this.view.updateCrib(cribCards, true, true);
        this.view.updateStarterCard(starterCard);
        
        // Also add some cards to pegging area just to test they return too
        const peggingCards = deck.dealMany(3);
        // We need to wrap them in the format the pegging area expects if we want to use updatePegging
        // But for returnCardsToDeckAnimated, it just looks at this.peggingAreaVisual.cardVisuals
        // which are populated when cards are played.
        
        peggingCards.forEach((card) => {
            this.view.peggingAreaVisual.addCard(card);
        });
    }
}
