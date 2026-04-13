import { Scene } from 'phaser';
import { StarterCardVisual } from '../../components/GameVisuals/StarterCardVisual.js';
import { Card, Suits, Values } from '../../../game/Card.js';
import { TableLayout } from '../../utils/TableLayout.js';

export class TestStarterScene extends Scene {
    constructor() {
        super('TestStarterScene');
    }

    create() {
        this.layout = new TableLayout(this.scale);
        const { width, height } = this.scale;
        this.add.rectangle(width / 2, height / 2, width, height, 0x028af8);

        this.add.text(width * 0.5, 50, 'Starter Card Visual Test', {
            fontFamily: 'Arial Black', fontSize: '32px', color: '#ffffff'
        }).setOrigin(0.5);

        const card = new Card(Suits.HEARTS, Values.ACE);
        const starterVisual = new StarterCardVisual(this, width * 0.5, height * 0.5, this.layout.config.STARTER_CARD, card);

        this.add.text(width * 0.5, height * 0.75, 'Click to Clear/Set Card', {
            fontSize: '20px', color: '#ffffff'
        }).setOrigin(0.5).setInteractive().on('pointerdown', () => {
            if (starterVisual.cardVisual) {
                starterVisual.setCard(null);
            } else {
                starterVisual.setCard(card);
            }
        });

        const backBtn = this.add.text(width * 0.5, height - 50, 'Back to List', {
            fontSize: '24px', color: '#ffffff', backgroundColor: '#000000', padding: { x: 10, y: 5 }
        })
        .setOrigin(0.5).setInteractive()
        .on('pointerdown', () => this.scene.start('TestListScene'));
    }
}
