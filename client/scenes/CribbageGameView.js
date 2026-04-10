import { HandVisual } from '../components/GameVisuals/HandVisual.js';
import { CribVisual } from '../components/GameVisuals/CribVisual.js';
import { PeggingAreaVisual } from '../components/GameVisuals/PeggingAreaVisual.js';
import { StarterCardVisual } from '../components/GameVisuals/StarterCardVisual.js';
import { Scoreboard } from '../components/GameVisuals/Scoreboard.js';
import { PhaseIndicator } from '../components/GameVisuals/PhaseIndicator.js';
import { ActionButtons } from '../components/GameVisuals/ActionButtons.js';

export class CribbageGameView {
    constructor(scene) {
        this.scene = scene;
        const { width, height } = scene.scale;

        // Background
        this.bg = scene.add.image(width / 2, height / 2, 'background');
        const scale = Math.max(width / this.bg.width + 0.2, height / this.bg.height + 0.2);
        this.bg.setScale(scale).setScrollFactor(0);

        this.setupVisuals(width, height);
    }

    setupVisuals(width, height) {
        // Hands
        this.humanHandVisual = new HandVisual(this.scene, width / 2, height - 120, [], false, (v) => this.onCardClicked(v));
        this.botHandVisual = new HandVisual(this.scene, width / 2, 100, [], true);

        // Areas
        this.peggingAreaVisual = new PeggingAreaVisual(this.scene, width / 2, height / 2 - 40);
        this.cribVisual = new CribVisual(this.scene, width - 100, height / 2);
        this.starterCardVisual = new StarterCardVisual(this.scene, 100, height / 2);

        // HUD
        this.scoreboard = null; // Will be initialized in initializeScoreboard
        this.phaseIndicator = new PhaseIndicator(this.scene, width / 2, 220);
        this.actionButtons = new ActionButtons(this.scene, width / 2, height - 240);
        this.actionButtons.setDepth(100);

        // Callbacks
        this.cardClickedCallback = null;
    }

    initializeScoreboard(players) {
        this.scoreboard = new Scoreboard(this.scene, 160, 60, players);
    }

    onCardClicked(cardVisual) {
        if (this.cardClickedCallback) {
            this.cardClickedCallback(cardVisual);
        }
    }

    setCardClickedCallback(callback) {
        this.cardClickedCallback = callback;
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
        this.botHandVisual.isBot = !revealBot;
        this.botHandVisual.setCards(botCards);
    }

    updateCrib(cards, spread = false) {
        this.cribVisual.setCards(cards, spread);
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

    showFloatingText(x, y, text, color = '#ffff00') {
        const floatingText = this.scene.add.text(x, y, text, {
            fontSize: '32px', color: typeof color === 'number' ? `#${color.toString(16).padStart(6, '0')}` : color, fontStyle: 'bold', stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5);

        this.scene.tweens.add({
            targets: floatingText,
            y: y - 100,
            alpha: 0,
            duration: 2000,
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
