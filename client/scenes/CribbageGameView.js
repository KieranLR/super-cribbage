import { PHASES } from '../../game/Constants.js';
import { TIMINGS } from '../utils/flow/timings.js';
import { TableLayout } from '../utils/TableLayout.js';
import { HandVisual } from '../components/GameVisuals/HandVisual.js';
import { CribVisual } from '../components/GameVisuals/CribVisual.js';
import { PeggingAreaVisual } from '../components/GameVisuals/PeggingAreaVisual.js';
import { StarterCardVisual } from '../components/GameVisuals/StarterCardVisual.js';
import { Scoreboard } from '../components/GameVisuals/Scoreboard.js';
import { PhaseIndicator } from '../components/GameVisuals/PhaseIndicator.js';
import { ActionButtons } from '../components/GameVisuals/ActionButtons.js';
import { CardVisual } from '../components/GameVisuals/CardVisual.js';
import { settingsManager } from '../utils/SettingsManager.js';

export class CribbageGameView {
    constructor(scene) {
        this.scene = scene;
        const pos = TableLayout.getPositions(scene.scale);

        // Background
        this.bg = scene.add.image(pos.background.x, pos.background.y, 'background');
        const scale = Math.max(scene.scale.width / this.bg.width + 0.2, scene.scale.height / this.bg.height + 0.2);
        this.bg.setScale(scale).setScrollFactor(0);

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
            (v) => this.onCardClicked(v),
            (v, x, y) => this.onCardDropped(v, x, y)
        );
        this.botHandVisual = new HandVisual(this.scene, pos.botHand.x, pos.botHand.y, [], !showBotHand);

        // Areas
        this.peggingAreaVisual = new PeggingAreaVisual(this.scene, pos.peggingArea.x, pos.peggingArea.y);
        this.peggingAreaVisual.setVisible(false);
        this.cribVisual = new CribVisual(this.scene, pos.cribCenter.x, pos.cribCenter.y);
        this.cribVisual.setVisible(false);
        this.starterCardVisual = new StarterCardVisual(this.scene, pos.starterCard.x, pos.starterCard.y);

        // HUD
        this.scoreboard = null; // Will be initialized in initializeScoreboard
        this.phaseIndicator = new PhaseIndicator(this.scene, pos.phaseIndicator.x, pos.phaseIndicator.y);
        this.actionButtons = new ActionButtons(this.scene, pos.actionButtons.x, pos.actionButtons.y);
        this.actionButtons.setDepth(100);

        // Starting Cut Phase Visuals
        this.startingCutCards = [];

        // Callbacks
        this.cardClickedCallback = null;
        this.cardDroppedCallback = null;
    }

    initializeScoreboard(players) {
        const pos = TableLayout.getPositions(this.scene.scale);
        this.scoreboard = new Scoreboard(this.scene, pos.scoreboard.x, pos.scoreboard.y, players);
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

        // Visibility of Pegging Area
        const isPegging = phase === PHASES.PEGGING;
        this.peggingAreaVisual.setVisible(isPegging);

        // Visibility and Position of Crib Area
        const isVisible = phase === PHASES.PEGGING || phase === PHASES.COUNTING || phase === PHASES.DISCARDING || phase === PHASES.CUTTING || phase === PHASES.DEALING;
        
        // If it's becoming visible, set it immediately
        if (isVisible && !this.cribVisual.visible) {
            this.cribVisual.setVisible(true);
            this.cribVisual.alpha = 0;
            this.scene.tweens.add({
                targets: this.cribVisual,
                alpha: 1,
                duration: TIMINGS.ANIMATIONS.GENERIC_MOVE
            });
        } else if (!isVisible && this.cribVisual.visible) {
            // If it's becoming invisible, fade it out
            this.scene.tweens.add({
                targets: this.cribVisual,
                alpha: 0,
                duration: TIMINGS.ANIMATIONS.GENERIC_MOVE,
                onComplete: () => {
                    this.cribVisual.setVisible(false);
                }
            });
        }

        const targetPos = TableLayout.getCribPosition(this.scene.scale, phase, PHASES);

        if (this.cribVisual.visible) {
            // Don't move the crib if we are still in discarding phase but both players discarded
            // wait for the actual phase change to happen in the game state.
            // Actually, we WANT it to move when the phase changes.
            this.scene.tweens.add({
                targets: this.cribVisual,
                x: targetPos.x,
                y: targetPos.y,
                duration: TIMINGS.ANIMATIONS.PEGGING_UI_MOVE,
                ease: 'Power2',
                overwrite: true
            });
        } else {
            this.cribVisual.setPosition(targetPos.x, targetPos.y);
        }
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

    showStartingCutDeck(count) {
        // Clear existing
        this.startingCutCards.forEach(c => c.destroy());
        this.startingCutCards = [];

        const pos = TableLayout.getPositions(this.scene.scale);
        const availableWidth = pos.startingCut.endX - pos.startingCut.startX;
        const spacing = availableWidth / (count - 1);

        for (let i = 0; i < count; i++) {
            const posX = pos.startingCut.startX + (i * spacing);
            const posY = pos.startingCut.y;
            
            // We'll create a special CardVisual that is face down
            const cardVisual = new CardVisual(this.scene, posX, posY, { suit: 'Hidden', value: '?' }, true);
            cardVisual.isStartingCutCard = true;
            cardVisual.cutIndex = i;
            
            cardVisual.on('pointerdown', () => {
                this.onCardClicked(cardVisual);
            });
            
            this.startingCutCards.push(cardVisual);
        }
    }

    revealStartingCutCard(player, card, cardIndex) {
        const visual = this.startingCutCards.find(v => v.cutIndex === cardIndex);
        if (visual) {
            // Update the visual with real card data
            visual.cardData = card;
            visual.setFaceDown(false);
            
            // Move it towards the player who cut it
            const pos = TableLayout.getPositions(this.scene.scale);
            const targetY = player.id === 'human' ? pos.startingCut.humanRevealY : pos.startingCut.botRevealY;
            visual.baseY = targetY;
            this.scene.tweens.add({
                targets: visual,
                y: targetY,
                duration: TIMINGS.ANIMATIONS.GENERIC_FADE,
                ease: 'Power2'
            });
        }
    }

    showFloatingText(x, y, text, color = '#ffff00') {
        const floatingText = this.scene.add.text(x, y, text, {
            fontSize: '32px', color: typeof color === 'number' ? `#${color.toString(16).padStart(6, '0')}` : color, fontStyle: 'bold', stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5);

        this.scene.tweens.add({
            targets: floatingText,
            y: y - 100,
            alpha: 0,
            duration: TIMINGS.ANIMATIONS.SCOREBOARD_UPDATE,
            onComplete: () => floatingText.destroy()
        });
    }

    showGameOver(winnerName) {
        const { width, height } = this.scene.scale;
        this.scene.add.text(width / 2, height / 2 + 100, `${winnerName} Wins!`, {
            fontSize: '48px', color: '#ff0000', stroke: '#000', strokeThickness: 6
        }).setOrigin(0.5);
    }
}
