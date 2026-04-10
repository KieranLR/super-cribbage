import { Scene } from 'phaser';
import { PeggingAreaVisual } from '../../components/GameVisuals/PeggingAreaVisual.js';
import { Card, Suits, Values } from '../../../game/Card.js';

export class TestPeggingScene extends Scene {
    constructor() {
        super('TestPeggingScene');
    }

    create() {
        const { width, height } = this.scale;
        this.add.rectangle(width / 2, height / 2, width, height, 0x028af8);

        this.add.text(width * 0.5, 50, 'Pegging Area Test', {
            fontFamily: 'Arial Black', fontSize: '32px', color: '#ffffff'
        }).setOrigin(0.5);

        const peggingArea = new PeggingAreaVisual(this, width * 0.5, height * 0.5);
        
        const testCards = [
            new Card(Suits.HEARTS, Values.ACE),
            new Card(Suits.SPADES, Values.KING),
            new Card(Suits.DIAMONDS, Values.JACK)
        ];

        peggingArea.update(testCards, 21);

        this.add.text(width * 0.5, height * 0.75, 'Click to Flash Area', {
            fontSize: '20px', color: '#ffffff'
        }).setOrigin(0.5).setInteractive().on('pointerdown', () => peggingArea.flash());

        const backBtn = this.add.text(width * 0.5, height - 50, 'Back to List', {
            fontSize: '24px', color: '#ffffff', backgroundColor: '#000000', padding: { x: 10, y: 5 }
        })
        .setOrigin(0.5).setInteractive()
        .on('pointerdown', () => this.scene.start('TestListScene'));
    }
}
