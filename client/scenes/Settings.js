import { Scene } from 'phaser';
import { createMenuButton } from '../ui/buttons/menuButton.js';
import { CARD_DECKS } from '../utils/CardDeckConfigs.js';
import { settingsManager } from '../utils/SettingsManager.js';
import { BackgroundVisual } from '../components/GameVisuals/BackgroundVisual.js';

export class Settings extends Scene {
    constructor() {
        super('Settings');
    }

    create() {
        const { width, height } = this.scale;

        // Background
        this.bg = new BackgroundVisual(this, 0.6);

        // Main Panel
        this.add.rectangle(width / 2, height / 2, width * 0.8, height * 0.8, 0x000000, 0.8)
            .setStrokeStyle(4, 0xffffff);

        // Title
        this.add.text(width / 2, height * 0.2, 'Settings', {
            fontSize: '48px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Vertical Menu Layout (RexUI)
        const menu = this.rexUI.add.sizer({
            x: width / 2,
            y: height * 0.5,
            orientation: 'y',
            space: {
                item: 40
            }
        });

        // Debug: Show Bot Hand Toggle
        const showBotHand = settingsManager.get('showBotHand');
        this.botHandToggle = createMenuButton(this, this.getBotHandLabel(showBotHand), () => {
            const current = settingsManager.get('showBotHand');
            const newValue = !current;
            settingsManager.set('showBotHand', newValue);
            this.updateLabel(this.botHandToggle, this.getBotHandLabel(newValue));
        });
        menu.add(this.botHandToggle);

        // Fast Mode Toggle
        const fastMode = settingsManager.get('fastMode');
        this.fastModeToggle = createMenuButton(this, this.getFastModeLabel(fastMode), () => {
            const current = settingsManager.get('fastMode');
            const newValue = !current;
            settingsManager.set('fastMode', newValue);
            this.updateLabel(this.fastModeToggle, this.getFastModeLabel(newValue));
        });
        menu.add(this.fastModeToggle);

        // Card Deck Selection
        const currentDeckId = settingsManager.get('cardDeck') || 'default';
        const currentDeck = Object.values(CARD_DECKS).find(d => d.id === currentDeckId) || CARD_DECKS.DEFAULT;
        this.deckToggle = createMenuButton(this, this.getDeckLabel(currentDeck.name), () => {
            const allDecks = Object.values(CARD_DECKS);
            const currentIndex = allDecks.findIndex(d => d.id === settingsManager.get('cardDeck'));
            const nextIndex = (currentIndex + 1) % allDecks.length;
            const nextDeck = allDecks[nextIndex];
            
            settingsManager.set('cardDeck', nextDeck.id);
            this.updateLabel(this.deckToggle, this.getDeckLabel(nextDeck.name));
        });
        menu.add(this.deckToggle);

        // Back Button
        menu.add(createMenuButton(this, 'Back', () => {
            this.scene.start('MainMenu');
        }));

        menu.layout();
    }

    getBotHandLabel(value) {
        return `Show Bot Hand: ${value ? 'ON' : 'OFF'}`;
    }

    getFastModeLabel(value) {
        return `Fast Mode: ${value ? 'ON' : 'OFF'}`;
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
