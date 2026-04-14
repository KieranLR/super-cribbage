import { PHASES } from '../../game/Constants.js';
import { TIMINGS } from '../utils/flow/timings.js';
import { RoundFlow } from '../utils/flow/RoundFlow.js';
import { HandVisual } from '../components/GameVisuals/HandVisual.js';
import { CribVisual } from '../components/GameVisuals/CribVisual.js';
import { PeggingAreaVisual } from '../components/GameVisuals/PeggingAreaVisual.js';
import { StarterCardVisual } from '../components/GameVisuals/StarterCardVisual.js';
import { Scoreboard } from '../components/GameVisuals/Scoreboard.js';
import { PhaseIndicator } from '../components/GameVisuals/PhaseIndicator.js';
import { ActionButtons } from '../components/GameVisuals/ActionButtons.js';
import { DeckVisual } from '../components/GameVisuals/DeckVisual.js';
import { settingsManager } from '../utils/SettingsManager.js';
import { createMenuButton } from '../ui/buttons/menuButton.js';
import { BackgroundVisual } from '../components/GameVisuals/BackgroundVisual.js';
import { SortWidget } from '../components/GameVisuals/SortWidget.js';

export class CribbageGameView {
    constructor(scene, animator, layout) {
        this.scene = scene;
        this.animator = animator;
        this.layout = layout;
        this.flow = new RoundFlow(scene, animator, this);

        this.cardClickedCallback = null;
        this.cardDroppedCallback = null;
        this.startingCutCards = [];

        this.visuals = {
            table: {},
            hud: {},
            overlays: {}
        };

        this.setupVisuals();
        this.applyLayout();
    }

    getLayoutSnapshot() {
        return this.layout.getSnapshot(this.scene.gameState?.phase, PHASES);
    }

    setupVisuals() {
        const snapshot = this.getLayoutSnapshot();
        const showBotHand = settingsManager.get('showBotHand');

        this.visuals.table.bg = new BackgroundVisual(this.scene);

        this.visuals.table.humanHand = new HandVisual(
            this.scene,
            snapshot.slots.playerHand.x,
            snapshot.slots.playerHand.y,
            [],
            false,
            this.animator,
            (v) => this.onCardClicked(v),
            (v, x, y) => this.onCardDropped(v, x, y),
            { CARD_SCALE: snapshot.styles.hand.cardScale }
        );

        this.visuals.table.botHand = new HandVisual(
            this.scene,
            snapshot.slots.botHand.x,
            snapshot.slots.botHand.y,
            [],
            !showBotHand,
            this.animator,
            null,
            null,
            { CARD_SCALE: snapshot.styles.hand.cardScale }
        );

        this.visuals.table.peggingArea = new PeggingAreaVisual(
            this.scene,
            snapshot.slots.peggingArea.x,
            snapshot.slots.peggingArea.y,
            snapshot.styles.peggingArea
        );
        this.visuals.table.peggingArea.setVisible(false);

        this.visuals.table.crib = new CribVisual(
            this.scene,
            snapshot.slots.crib.x,
            snapshot.slots.crib.y,
            snapshot.styles.crib
        );
        this.visuals.table.crib.setVisible(false);

        this.visuals.table.starterCard = new StarterCardVisual(
            this.scene,
            snapshot.slots.starterCard.x,
            snapshot.slots.starterCard.y,
            snapshot.styles.starterCard
        );
        this.visuals.table.starterCard.setVisible(false);

        this.visuals.table.deck = new DeckVisual(
            this.scene,
            snapshot.slots.deck.x,
            snapshot.slots.deck.y,
            { CARD_SCALE: snapshot.styles.deck.cardScale }
        );

        this.visuals.hud.scoreboard = null;

        this.visuals.hud.phaseIndicator = new PhaseIndicator(
            this.scene,
            snapshot.slots.phaseIndicator.x,
            snapshot.slots.phaseIndicator.y,
            snapshot.styles.phaseIndicator
        );

        this.visuals.hud.actionButtons = new ActionButtons(
            this.scene,
            snapshot.slots.actionButtons.x,
            snapshot.slots.actionButtons.y,
            snapshot.styles.actionButtons
        );
        this.visuals.hud.actionButtons.setDepth(100);

        this.visuals.hud.sortWidget = new SortWidget(
            this.scene,
            snapshot.slots.sortWidget.x,
            snapshot.slots.sortWidget.y,
            snapshot.styles.sortWidget,
            () => this.visuals.table.humanHand.sortByRank(),
            () => this.visuals.table.humanHand.sortBySuit()
        );
        this.visuals.hud.sortWidget.setDepth(100);
        this.visuals.hud.sortWidget.setVisible(false);

        this.setupExitButton(snapshot);
    }

    setupExitButton(snapshot = this.getLayoutSnapshot()) {
        const exitConfig = snapshot.styles.exitButton;

        this.visuals.hud.exitButton = createMenuButton(
            this.scene,
            'Main Menu',
            () => this.onExitClicked(),
            {
                width: exitConfig.WIDTH,
                height: exitConfig.HEIGHT,
                fontSize: '22px'
            }
        );

        this.visuals.hud.exitButton.setPosition(
            snapshot.slots.exitButton.x,
            snapshot.slots.exitButton.y
        );
        this.visuals.hud.exitButton.setDepth(1000);

        const container = this.scene.add.container(
            this.scene.scale.width / 2,
            this.scene.scale.height / 2
        );
        container.setDepth(2000);
        container.setVisible(false);

        const overlay = this.scene.add.rectangle(
            0,
            0,
            this.scene.scale.width,
            this.scene.scale.height,
            0x000000,
            0.7
        ).setInteractive();

        const bg = this.scene.add.rectangle(0, 0, 500, 300, 0x222222, 1)
            .setStrokeStyle(4, 0xffffff);

        const warningText = this.scene.add.text(
            0,
            -60,
            'Return to Main Menu?\\n\\nYour current game will not be saved.',
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff',
                align: 'center',
                wordWrap: { width: 450 }
            }
        ).setOrigin(0.5);

        const yesBtn = createMenuButton(this.scene, 'Yes, Exit', () => {
            this.scene.scene.start('MainMenu');
        }, { width: 200, height: 50, fontSize: '20px' });
        yesBtn.setPosition(-110, 80);

        const noBtn = createMenuButton(this.scene, 'No, Stay', () => {
            container.setVisible(false);
        }, { width: 200, height: 50, fontSize: '20px' });
        noBtn.setPosition(110, 80);

        container.add([overlay, bg, warningText, yesBtn, noBtn]);
        this.visuals.overlays.exitConfirm = container;
    }

    applyLayout() {
        const snapshot = this.getLayoutSnapshot();

        this.visuals.table.bg?.resize(snapshot.context.width, snapshot.context.height);

        this.visuals.table.humanHand?.setPosition(snapshot.slots.playerHand.x, snapshot.slots.playerHand.y);
        this.visuals.table.humanHand?.updateConfig({ CARD_SCALE: snapshot.styles.hand.cardScale });

        this.visuals.table.botHand?.setPosition(snapshot.slots.botHand.x, snapshot.slots.botHand.y);
        this.visuals.table.botHand?.updateConfig({ CARD_SCALE: snapshot.styles.hand.cardScale });

        this.visuals.table.peggingArea?.setPosition(snapshot.slots.peggingArea.x, snapshot.slots.peggingArea.y);
        this.visuals.table.peggingArea?.updateConfig(snapshot.styles.peggingArea);

        this.visuals.table.crib?.setPosition(snapshot.slots.crib.x, snapshot.slots.crib.y);
        this.visuals.table.crib?.updateConfig(snapshot.styles.crib);

        this.visuals.table.starterCard?.setPosition(snapshot.slots.starterCard.x, snapshot.slots.starterCard.y);
        this.visuals.table.starterCard?.updateConfig(snapshot.styles.starterCard);

        this.visuals.table.deck?.setPosition(snapshot.slots.deck.x, snapshot.slots.deck.y);
        this.visuals.table.deck?.updateConfig({ CARD_SCALE: snapshot.styles.deck.cardScale });

        if (this.visuals.hud.scoreboard) {
            this.visuals.hud.scoreboard.setPosition(snapshot.slots.scoreboard.x, snapshot.slots.scoreboard.y);
            this.visuals.hud.scoreboard.config = snapshot.styles.scoreboard;
            this.visuals.hud.scoreboard.updateScores();
        }

        this.visuals.hud.phaseIndicator?.setPosition(snapshot.slots.phaseIndicator.x, snapshot.slots.phaseIndicator.y);
        this.visuals.hud.phaseIndicator?.updateConfig(snapshot.styles.phaseIndicator);

        this.visuals.hud.actionButtons?.setPosition(snapshot.slots.actionButtons.x, snapshot.slots.actionButtons.y);
        this.visuals.hud.actionButtons?.updateConfig(snapshot.styles.actionButtons);

        this.visuals.hud.sortWidget?.setPosition(snapshot.slots.sortWidget.x, snapshot.slots.sortWidget.y);
        this.visuals.hud.sortWidget?.updateConfig(snapshot.styles.sortWidget);

        this.visuals.hud.exitButton?.setPosition(snapshot.slots.exitButton.x, snapshot.slots.exitButton.y);

        this.applyOverlayLayout(snapshot);
    }

    applyOverlayLayout(snapshot) {
        const exitConfirm = this.visuals.overlays.exitConfirm;
        if (!exitConfirm) return;

        exitConfirm.setPosition(snapshot.context.width / 2, snapshot.context.height / 2);

        const overlay = exitConfirm.getAt(0);
        if (overlay instanceof Phaser.GameObjects.Rectangle) {
            overlay.setSize(snapshot.context.width, snapshot.context.height);
        }
    }

    resize(width, height) {
        this.layout.refresh();
        this.applyLayout();
    }

    initializeScoreboard(players) {
        const snapshot = this.getLayoutSnapshot();
        this.visuals.hud.scoreboard = new Scoreboard(
            this.scene,
            snapshot.slots.scoreboard.x,
            snapshot.slots.scoreboard.y,
            players,
            snapshot.styles.scoreboard
        );
    }

    onExitClicked() {
        this.visuals.overlays.exitConfirm?.setVisible(true);
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
        this.visuals.hud.phaseIndicator.updatePhase(phase, instruction);
        this.applyLayout(); // keeps crib position synced if phase affects layout
    }

    clearButtons() {
        this.visuals.hud.actionButtons.clearButtons();
    }

    showButton(id, label, callback) {
        const buttons = this.visuals.hud.actionButtons;
        if (!buttons.buttons[id]) {
            buttons.addButton(id, label, callback);
        } else {
            buttons.showButton(id);
        }
    }

    hideButton(id) {
        this.visuals.hud.actionButtons.hideButton(id);
    }

    updateHands(humanCards, botCards, revealBot = false) {
        this.visuals.table.humanHand.setCards(humanCards);

        const showBotHand = settingsManager.get('showBotHand');
        this.visuals.table.botHand.isBot = !revealBot && !showBotHand;
        this.visuals.table.botHand.setCards(botCards);
    }

    animateDeckToPlay(onComplete = null) {
        const snapshot = this.getLayoutSnapshot();
        const deckPos = snapshot.slots.deck;

        this.flow.startAnimation();
        this.animator.moveCard(this.visuals.table.deck, deckPos.x, deckPos.y, {
            duration: TIMINGS.ANIMATIONS.GENERIC_MOVE,
            onComplete: () => {
                this.visuals.table.deck.animateStack(TIMINGS.ANIMATIONS.GENERIC_MOVE, () => {
                    this.flow.endAnimation();
                    if (onComplete) onComplete();
                });
            }
        });
    }

    showStartingCutDeck(count, animate = false, onComplete = null) {
        const snapshot = this.getLayoutSnapshot();
        const sc = snapshot.slots.startingCut;
        const deck = this.visuals.table.deck;

        const localStartX = sc.startX - deck.x;
        const localEndX = sc.endX - deck.x;
        const localY = sc.y - deck.y;

        deck.setAlpha(1);

        if (animate) {
            deck.animateFan(
                count,
                localStartX,
                localEndX,
                localY,
                (v) => this.onCardClicked(v),
                TIMINGS.ANIMATIONS.DECK_FAN_DURATION,
                TIMINGS.ANIMATIONS.DECK_FAN_DELAY,
                onComplete
            );
        } else {
            deck.showFan(count, localStartX, localEndX, localY, (v) => this.onCardClicked(v));
            if (onComplete) onComplete();
        }
    }
}