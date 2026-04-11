import { PHASES } from '../../game/Constants.js';
import { TIMINGS } from '../utils/flow/timings.js';
import { RoundFlow } from '../utils/flow/RoundFlow.js';
import { TableLayout } from '../utils/TableLayout.js';
import { HandVisual } from '../components/GameVisuals/HandVisual.js';
import { CribVisual } from '../components/GameVisuals/CribVisual.js';
import { PeggingAreaVisual } from '../components/GameVisuals/PeggingAreaVisual.js';
import { StarterCardVisual } from '../components/GameVisuals/StarterCardVisual.js';
import { Scoreboard } from '../components/GameVisuals/Scoreboard.js';
import { PhaseIndicator } from '../components/GameVisuals/PhaseIndicator.js';
import { ActionButtons } from '../components/GameVisuals/ActionButtons.js';
import { CardVisual } from '../components/GameVisuals/CardVisual.js';
import { DeckVisual } from '../components/GameVisuals/DeckVisual.js';
import { settingsManager } from '../utils/SettingsManager.js';
import { TableAnimator } from '../utils/TableAnimator.js';
import { createMenuButton } from '../ui/buttons/menuButton.js';
import { BackgroundVisual } from '../components/GameVisuals/BackgroundVisual.js';
import { SortWidget } from '../components/GameVisuals/SortWidget.js';

export class CribbageGameView {
    constructor(scene, animator) {
        this.scene = scene;
        this.animator = animator;
        this.flow = new RoundFlow(scene, animator, this);
        const pos = TableLayout.getPositions(scene.scale);

        // Background
        this.bg = new BackgroundVisual(scene);

        this.setupVisuals();
    }


    setupVisuals() {
        const pos = TableLayout.getPositions(this.scene.scale);
        const showBotHand = settingsManager.get('showBotHand');
        // Hands
        this.humanHandVisual = new HandVisual(
            this.scene, 
            pos.playerHand.x, 
            pos.playerHand.y, 
            [], 
            false, 
            this.animator,
            (v) => this.onCardClicked(v),
            (v, x, y) => this.onCardDropped(v, x, y)
        );
        this.botHandVisual = new HandVisual(this.scene, pos.botHand.x, pos.botHand.y, [], !showBotHand, this.animator);

        // Areas
        this.peggingAreaVisual = new PeggingAreaVisual(this.scene, pos.peggingArea.x, pos.peggingArea.y);
        this.peggingAreaVisual.setVisible(false);
        this.cribVisual = new CribVisual(this.scene, pos.cribCenter.x, pos.cribCenter.y);
        this.cribVisual.setVisible(false);
        this.starterCardVisual = new StarterCardVisual(this.scene, pos.starterCard.x, pos.starterCard.y);
        this.starterCardVisual.setVisible(false);
        this.deckVisual = new DeckVisual(this.scene, pos.deck.x, pos.deck.y);

        // HUD
        this.scoreboard = null; // Will be initialized in initializeScoreboard
        this.phaseIndicator = new PhaseIndicator(this.scene, pos.phaseIndicator.x, pos.phaseIndicator.y);
        this.actionButtons = new ActionButtons(this.scene, pos.actionButtons.x, pos.actionButtons.y);
        this.actionButtons.setDepth(100);

        this.sortWidget = new SortWidget(
            this.scene,
            pos.sortWidget.x,
            pos.sortWidget.y,
            () => this.humanHandVisual.sortByRank(),
            () => this.humanHandVisual.sortBySuit()
        );
        this.sortWidget.setDepth(100);
        this.sortWidget.setVisible(false);

        this.setupExitButton();

        // Starting Cut Phase Visuals
        this.startingCutCards = []; // Deprecated, but keeping for compatibility if needed elsewhere

        // Callbacks
        this.cardClickedCallback = null;
        this.cardDroppedCallback = null;
    }

    initializeScoreboard(players) {
        const pos = TableLayout.getPositions(this.scene.scale);
        this.scoreboard = new Scoreboard(this.scene, pos.scoreboard.x, pos.scoreboard.y, players);
    }

    setupExitButton() {
        const pos = TableLayout.getPositions(this.scene.scale);
        const config = TableLayout.REL.EXIT_BUTTON;

        this.exitButton = createMenuButton(this.scene, 'Main Menu', () => this.onExitClicked(), {
            width: config.WIDTH,
            height: config.HEIGHT,
            fontSize: '22px'
        });
        this.exitButton.setPosition(pos.exitButton.x, pos.exitButton.y);
        this.exitButton.setDepth(1000); // Always on top

        // Confirmation dialog (initially hidden)
        this.exitConfirmContainer = this.scene.add.container(this.scene.scale.width / 2, this.scene.scale.height / 2);
        this.exitConfirmContainer.setDepth(2000);
        this.exitConfirmContainer.setVisible(false);

        const overlay = this.scene.add.rectangle(0, 0, this.scene.scale.width, this.scene.scale.height, 0x000000, 0.7)
            .setInteractive(); // Blocks input below

        const bg = this.scene.add.rectangle(0, 0, 500, 300, 0x222222, 1)
            .setStrokeStyle(4, 0xffffff);

        const warningText = this.scene.add.text(0, -60, 'Return to Main Menu?\n\nYour current game will not be saved.', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 450 }
        }).setOrigin(0.5);

        const yesBtn = createMenuButton(this.scene, 'Yes, Exit', () => {
            this.scene.scene.start('MainMenu');
        }, { width: 200, height: 50, fontSize: '20px' });
        yesBtn.setPosition(-110, 80);

        const noBtn = createMenuButton(this.scene, 'No, Stay', () => {
            this.exitConfirmContainer.setVisible(false);
        }, { width: 200, height: 50, fontSize: '20px' });
        noBtn.setPosition(110, 80);

        this.exitConfirmContainer.add([overlay, bg, warningText, yesBtn, noBtn]);
    }

    onExitClicked() {
        this.exitConfirmContainer.setVisible(true);
    }

    onCardClicked(cardVisual) {
        if (this.cardClickedCallback) {
            this.cardClickedCallback(cardVisual);
        }
    }

    onCardDropped(cardVisual, x, y) {
        if (this.cardDroppedCallback) {
            return this.cardDroppedCallback(cardVisual, x, y);
        }
        return false;
    }

    setCardClickedCallback(callback) {
        this.cardClickedCallback = callback;
    }

    setCardDroppedCallback(callback) {
        this.cardDroppedCallback = callback;
    }

    updatePhase(phase, instruction) {
        this.phaseIndicator.updatePhase(phase, instruction);
    }

    clearButtons() {
        this.actionButtons.clearButtons();
    }

    showButton(id, label, callback) {
        if (!this.actionButtons.buttons[id]) {
            this.actionButtons.addButton(id, label, callback);
        } else {
            this.actionButtons.showButton(id);
        }
    }

    hideButton(id) {
        this.actionButtons.hideButton(id);
    }

    updateHands(humanCards, botCards, revealBot = false) {
        this.humanHandVisual.setCards(humanCards);
        const showBotHand = settingsManager.get('showBotHand');
        this.botHandVisual.isBot = !revealBot && !showBotHand;
        this.botHandVisual.setCards(botCards);
    }

    /**
     * Animates the deck from its current position/state (like fanned) 
     * back to a stack at the play position.
     * @param {Function} onComplete 
     */
    animateDeckToPlay(onComplete = null) {
        const pos = TableLayout.getPositions(this.scene.scale);
        
        this.flow.startAnimation();
        this.animator.moveCard(this.deckVisual, pos.deck.x, pos.deck.y, {
            duration: TIMINGS.ANIMATIONS.GENERIC_MOVE,
            onComplete: () => {
                this.deckVisual.animateStack(TIMINGS.ANIMATIONS.GENERIC_MOVE, () => {
                    this.flow.endAnimation();
                    if (onComplete) onComplete();
                });
            }
        });
    }

    /**
     * Animates dealing cards from the deck to the players.
     * @param {Object} data - Contains players and their hands.
     * @param {Function} onComplete 
     */
    dealCardsAnimated(data, onComplete = null) {
        const { players } = data;
        const cardsToDeal = [];
        
        // Reset botHandVisual.isBot at the start of dealing to ensure it's correct for this round
        const showBotHand = settingsManager.get('showBotHand');
        this.botHandVisual.isBot = !showBotHand;
        
        // Cribbage usually deals one by one. 
        // We'll alternate players for each card based on their actual hand size in data.
        const maxHandSize = Math.max(...players.map(p => p.hand.cards.length));
        
        for (let i = 0; i < maxHandSize; i++) {
            players.forEach(player => {
                if (player.hand.cards[i]) {
                    cardsToDeal.push({
                        player: player,
                        cardData: player.hand.cards[i],
                        cardIndexInHand: i
                    });
                }
            });
        }

        let dealIndex = 0;
        const dealNextCard = () => {
            if (dealIndex >= cardsToDeal.length) {
                if (onComplete) onComplete();
                return;
            }

            const { player, cardData, cardIndexInHand } = cardsToDeal[dealIndex];
            const isHuman = player.id === 'human';
            const handVisual = isHuman ? this.humanHandVisual : this.botHandVisual;
            
            const cardVisual = this.deckVisual.popCard();
            if (!cardVisual) {
                console.warn('DeckVisual ran out of cards during deal! Fallback to immediate update.');
                this.updateHands(this.humanHandVisual.isBot ? [] : this.humanHandVisual.cardVisuals.map(v => v.cardData), 
                                this.botHandVisual.isBot ? [] : this.botHandVisual.cardVisuals.map(v => v.cardData));
                if (onComplete) onComplete();
                return;
            }

            // Convert deck local to world, then to hand local
            const worldX = cardVisual.x + this.deckVisual.x;
            const worldY = cardVisual.y + this.deckVisual.y;
            
            cardVisual.x = worldX - handVisual.x;
            cardVisual.y = worldY - handVisual.y;
            handVisual.add(cardVisual);
            handVisual.cardVisuals.push(cardVisual);
            
            cardVisual.cardData = cardData;

            // Re-setup interactivity based on hand's rules
            handVisual.setupCardInteractivity(cardVisual);
            
            // Bot cards are face down, human cards face up (unless setting says otherwise)
            const shouldBeFaceDown = !isHuman && this.botHandVisual.isBot;
            
            if (shouldBeFaceDown) {
                cardVisual.setFaceDown(true);
            }

            // Calculate slot position in hand
            const spacing = 60;
            const totalCardsForThisPlayer = player.hand.cards.length;
            const totalWidth = (totalCardsForThisPlayer - 1) * spacing;
            const targetX = (cardIndexInHand * spacing) - (totalWidth / 2);
            const targetY = 0;

            this.flow.startAnimation();
            this.animator.dealCardToHand(cardVisual, targetX, targetY, 0, () => {
                if (!shouldBeFaceDown) {
                    this.animator.flipCard(cardVisual, false);
                }
                this.flow.endAnimation();
            });

            dealIndex++;
            this.scene.time.delayedCall(TIMINGS.ANIMATIONS.DEAL_INTERVAL || 150, dealNextCard);
        };

        dealNextCard();
    }

    /**
     * Animates returning all cards on the table to the deck.
     * @param {Function} onComplete 
     */
    returnCardsToDeckAnimated(onComplete = null) {
        const cardsToReturn = [];
        
        // Collect cards from hands
        this.humanHandVisual.cardVisuals.forEach(v => {
            cardsToReturn.push(v);
        });
        this.humanHandVisual.cardVisuals = [];

        this.botHandVisual.cardVisuals.forEach(v => {
            cardsToReturn.push(v);
        });
        this.botHandVisual.cardVisuals = [];

        // Collect cards from crib
        this.cribVisual.cardVisuals.forEach(v => {
            cardsToReturn.push(v);
        });
        this.cribVisual.cardVisuals = [];
        this.cribVisual.submittedVisuals.forEach(v => {
            cardsToReturn.push(v);
        });
        this.cribVisual.submittedVisuals = [];

        // Collect from pegging area (if any)
        this.peggingAreaVisual.cardVisuals.forEach(v => {
            cardsToReturn.push(v);
        });
        this.peggingAreaVisual.cardVisuals = [];
        this.peggingAreaVisual.label.setText('Pegging Area: 0');

        // Collect starter card
        if (this.starterCardVisual.cardVisual) {
            const starterCard = this.starterCardVisual.cardVisual;
            cardsToReturn.push(starterCard);
            this.starterCardVisual.cardVisual = null;
            this.starterCardVisual.placeholderPattern.setVisible(true);
        }

        if (cardsToReturn.length === 0) {
            if (onComplete) onComplete();
            return;
        }

        this.flow.startAnimation();
        let finishedCount = 0;

        cardsToReturn.forEach((card, index) => {
            // Get current world position
            const matrix = card.getWorldTransformMatrix();
            const worldX = matrix.tx;
            const worldY = matrix.ty;

            // Remove from old parent if any
            if (card.parentContainer) {
                card.parentContainer.remove(card, false);
            }

            // Put it on the scene (to avoid container clipping)
            this.scene.add.existing(card);
            card.setPosition(worldX, worldY);

            const delay = index * 30;
            if (!card.isFaceDown) {
                this.animator.flipCard(card, true, null, null, delay - 30);
            }
            card.setDepth(100 + index); // Ensure they are on top

            this.animator.moveCard(card, this.deckVisual.x, this.deckVisual.y, {
                duration: TIMINGS.ANIMATIONS.GENERIC_MOVE,
                delay: delay,
                onComplete: () => {
                    card.setFaceDown(true);
                    this.deckVisual.addCard(card);
                    finishedCount++;
                    if (finishedCount === cardsToReturn.length) {
                        this.flow.endAnimation();
                        if (onComplete) onComplete();
                    }
                }
            });
        });
    }

    updateCrib(cards, spread = false, reveal = false) {
        this.cribVisual.setCards(cards, spread, reveal);
    }

    updateStarterCard(card) {
        this.starterCardVisual.setCard(card);
    }

    updatePegging(playedCards, currentTotal) {
        this.peggingAreaVisual.update(playedCards, currentTotal);
    }

    updateScores() {
        if (this.scoreboard) {
            this.scoreboard.updateScores();
        }
    }

    showStartingCutDeck(count, animate = false, onComplete = null) {
        const pos = TableLayout.getPositions(this.scene.scale);
        
        // Use the DeckVisual to show the fan
        // The DeckVisual is positioned at pos.deck.x, pos.deck.y
        // We want the fan to be centered on the screen and span from startX to endX
        // So we need to calculate local coordinates relative to deckVisual.x/y
        
        const localStartX = pos.startingCut.startX - this.deckVisual.x;
        const localEndX = pos.startingCut.endX - this.deckVisual.x;
        const localY = pos.startingCut.y - this.deckVisual.y;

        if (animate) {
            this.deckVisual.setAlpha(1);
            this.deckVisual.animateFan(count, localStartX, localEndX, localY, (v) => this.onCardClicked(v), TIMINGS.ANIMATIONS.DECK_FAN_DURATION, TIMINGS.ANIMATIONS.DECK_FAN_DELAY, onComplete);
        } else {
            this.deckVisual.setAlpha(1);
            this.deckVisual.showFan(count, localStartX, localEndX, localY, (v) => this.onCardClicked(v));
            if (onComplete) onComplete();
        }
    }

    revealStartingCutCard(player, card, cardIndex) {
        // Handled by StartingCutPhase
    }

    showFloatingText(x, y, text, color = '#ffff00') {
        const floatingText = this.scene.add.text(x, y, text, {
            fontSize: '32px', color: typeof color === 'number' ? `#${color.toString(16).padStart(6, '0')}` : color, fontStyle: 'bold', stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5);

        this.animator.showFloatingText(floatingText, y - 100);
    }

    showGameOver(winnerName) {
        const { width, height } = this.scene.scale;
        this.scene.add.text(width / 2, height / 2 + 100, `${winnerName} Wins!`, {
            fontSize: '48px', color: '#ff0000', stroke: '#000', strokeThickness: 6
        }).setOrigin(0.5);
    }
}
