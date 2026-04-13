import { Scene } from 'phaser';
import { createMenuButton } from '../ui/buttons/menuButton.js';
import { CARD_DECKS } from '../utils/CardDeckConfigs.js';
import { settingsManager } from '../utils/SettingsManager.js';
import { BackgroundVisual } from '../components/GameVisuals/BackgroundVisual.js';

export class Settings extends Scene {
    constructor() {
        console.log('Settings Scene Created');
        super('Settings');
    }

    create() {
        console.log('Settings Scene Created');
        const { width, height } = this.scale;

        // Background
        this.bg = new BackgroundVisual(this, 0.6);

        // Main Panel
        const panel = this.add.rectangle(width / 2, height / 2, width * 0.8, height * 0.8, 0x000000, 0.8)
            .setStrokeStyle(4, 0xffffff);

        // Title
        const title = this.add.text(width / 2, height * 0.2, 'Settings', {
            fontSize: '48px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Menu items
        const menuItems = [];

        // Debug: Show Bot Hand Toggle
        const showBotHand = settingsManager.get('showBotHand');
        this.botHandToggle = createMenuButton(this, this.getBotHandLabel(showBotHand), () => {
            const current = settingsManager.get('showBotHand');
            const newValue = !current;
            settingsManager.set('showBotHand', newValue);
            this.updateLabel(this.botHandToggle, this.getBotHandLabel(newValue));
        });
        menuItems.push(this.botHandToggle);

        // Fast Mode Toggle
        const fastMode = settingsManager.get('fastMode');
        this.fastModeToggle = createMenuButton(this, this.getFastModeLabel(fastMode), () => {
            const current = settingsManager.get('fastMode');
            const newValue = !current;
            settingsManager.set('fastMode', newValue);
            this.updateLabel(this.fastModeToggle, this.getFastModeLabel(newValue));
        });
        menuItems.push(this.fastModeToggle);

        // FPS Toggle
        const showFPS = settingsManager.get('showFPS');
        this.fpsToggle = createMenuButton(this, this.getFPSLabel(showFPS), () => {
            const current = settingsManager.get('showFPS');
            const newValue = !current;
            settingsManager.set('showFPS', newValue);
            this.updateLabel(this.fpsToggle, this.getFPSLabel(newValue));
            
            // Notify the FPSOverlay scene if it exists
            const fpsScene = this.scene.get('FPSOverlay');
            if (fpsScene) {
                fpsScene.updateVisibility();
            }
        });
        menuItems.push(this.fpsToggle);

        // Card Deck Selection
        const currentDeckId = settingsManager.get('cardDeck') || 'default';
        const currentDeckId_val = settingsManager.get('cardDeck');
        const currentDeckObj = Object.values(CARD_DECKS).find(d => d.id === currentDeckId_val) || CARD_DECKS.DEFAULT;
        this.deckToggle = createMenuButton(this, this.getDeckLabel(currentDeckObj.name), () => {
            const allDecks = Object.values(CARD_DECKS);
            const currentIndex = allDecks.findIndex(d => d.id === settingsManager.get('cardDeck'));
            const nextIndex = (currentIndex + 1) % allDecks.length;
            const nextDeck = allDecks[nextIndex];
            
            settingsManager.set('cardDeck', nextDeck.id);
            this.updateLabel(this.deckToggle, this.getDeckLabel(nextDeck.name));
        });
        menuItems.push(this.deckToggle);

        // Back Button
        menuItems.push(createMenuButton(this, 'Back', () => {
            this.scene.start('MainMenu');
        }));

        const updateMenuLayout = () => {
            const { width, height } = this.scale;
            const startY = height * 0.4;
            const spacing = 70;

            menuItems.forEach((item, index) => {
                item.setPosition(width / 2, startY + index * spacing);
            });
        };

        updateMenuLayout();

        this.scale.on('resize', (gameSize) => {
            if (!this.scene.isActive()) return;
            
            const { width, height } = gameSize;
            this.bg.resize(width, height);
            
            panel.setPosition(width / 2, height / 2);
            panel.setSize(width * 0.8, height * 0.8);
            
            title.setPosition(width / 2, height * 0.2);
            
            updateMenuLayout();
        });
    }

    getBotHandLabel(value) {
        return `Show Bot Hand: ${value ? 'ON' : 'OFF'}`;
    }

    getFastModeLabel(value) {
        return `Fast Mode: ${value ? 'ON' : 'OFF'}`;
    }

    getFPSLabel(value) {
        return `FPS Tracker: ${value ? 'ON' : 'OFF'}`;
    }

    getDeckLabel(name) {
        return `Card Deck: ${name}`;
    }

    updateLabel(button, newLabel) {
        // Since createMenuButton doesn't expose the text object directly in a nice way, 
        // and we want to keep it simple, we'll find the text child.
        const text = button.list.find(child => child.type === 'Text');
        if (text) {
            text.setText(newLabel);
        }
    }

}
