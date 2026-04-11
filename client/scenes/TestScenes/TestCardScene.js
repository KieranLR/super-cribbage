import { Scene } from 'phaser';
import { CardVisual } from '../../components/GameVisuals/CardVisual.js';
import { Card, Suits, Values } from '../../../game/Card.js';

export class TestCardScene extends Scene {
    constructor() {
        super('TestCardScene');
    }

    create() {
        const { width, height } = this.scale;

        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0x028af8);

        this.add.text(width * 0.5, 50, 'Card Visual Test Scene', {
            fontFamily: 'Arial Black',
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Display a few different cards
        const testCards = [
            new Card(Suits.HEARTS, Values.ACE),
            new Card(Suits.SPADES, Values.KING),
            new Card(Suits.DIAMONDS, Values.JACK),
            new Card(Suits.CLUBS, Values.EIGHT)
        ];

        testCards.forEach((card, index) => {
            const x = (width / 2) - 225 + (index * 150);
            const y = height / 2;
            const visual = new CardVisual(this, x, y, card);
            
            // Add a click listener to test selection
            visual.on('pointerdown', () => {
                visual.setSelected(!visual.isSelected);
            });
        });

        this.add.text(width * 0.5, height - 100, 'Click cards to toggle selection', {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Back button
        const backBtn = this.add.text(width * 0.5, height - 50, 'Back to Main Menu', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => this.scene.start('MainMenu'));
        
        backBtn.on('pointerover', () => backBtn.setStyle({ color: '#ff0' }));
        backBtn.on('pointerout', () => backBtn.setStyle({ color: '#fff' }));
    }
}
