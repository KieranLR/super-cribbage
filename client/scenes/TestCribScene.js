import { Scene } from 'phaser';
import { CribVisual } from '../components/GameVisuals/CribVisual.js';
import { Card, Suits, Values } from '../../game/Card.js';

export class TestCribScene extends Scene {
    constructor() {
        super('TestCribScene');
    }

    create() {
        const { width, height } = this.scale;
        this.add.rectangle(width / 2, height / 2, width, height, 0x028af8);

        this.add.text(width * 0.5, 50, 'Crib Visual Test', {
            fontFamily: 'Arial Black', fontSize: '32px', color: '#ffffff'
        }).setOrigin(0.5);

        const cards = [
            new Card(Suits.HEARTS, Values.ACE),
            new Card(Suits.SPADES, Values.KING),
            new Card(Suits.DIAMONDS, Values.JACK),
            new Card(Suits.CLUBS, Values.EIGHT)
        ];

        this.add.text(width * 0.5, height * 0.35, 'Full Crib (4 cards)', { fontSize: '20px', color: '#ffffff' }).setOrigin(0.5);
        new CribVisual(this, width * 0.5, height * 0.5, cards);

        const backBtn = this.add.text(width * 0.5, height - 50, 'Back to List', {
            fontSize: '24px', color: '#ffffff', backgroundColor: '#000000', padding: { x: 10, y: 5 }
        })
        .setOrigin(0.5).setInteractive()
        .on('pointerdown', () => this.scene.start('TestListScene'));
    }
}
