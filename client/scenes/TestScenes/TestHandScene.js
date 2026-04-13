import { Scene } from 'phaser';
import { HandVisual } from '../../components/GameVisuals/HandVisual.js';
import { Card, Suits, Values } from '../../../game/Card.js';
import { TableLayout } from '../../utils/TableLayout.js';
import { TableAnimator } from '../../utils/TableAnimator.js';

export class TestHandScene extends Scene {
    constructor() {
        super('TestHandScene');
    }

    create() {
        this.layout = new TableLayout(this.scale);
        this.animator = new TableAnimator(this);
        const { width, height } = this.scale;
        this.add.rectangle(width / 2, height / 2, width, height, 0x028af8);

        this.add.text(width * 0.5, 50, 'Hand Visual Test', {
            fontFamily: 'Arial Black', fontSize: '32px', color: '#ffffff'
        }).setOrigin(0.5);

        const cards = [
            new Card(Suits.HEARTS, Values.ACE),
            new Card(Suits.SPADES, Values.KING),
            new Card(Suits.DIAMONDS, Values.JACK),
            new Card(Suits.CLUBS, Values.EIGHT),
            new Card(Suits.HEARTS, Values.FIVE),
            new Card(Suits.SPADES, Values.TWO)
        ];

        this.add.text(width * 0.5, height * 0.25, 'Human Hand (Click to select)', { fontSize: '20px', color: '#ffffff' }).setOrigin(0.5);
        const humanHand = new HandVisual(this, width * 0.5, height * 0.4, cards, false, this.animator);
        
        humanHand.cardVisuals.forEach(v => {
            v.on('pointerdown', () => v.setSelected(!v.isSelected));
        });

        this.add.text(width * 0.5, height * 0.65, 'Bot Hand (Dimmed for visualization)', { fontSize: '20px', color: '#ffffff' }).setOrigin(0.5);
        new HandVisual(this, width * 0.5, height * 0.8, cards, true, this.animator);

        const backBtn = this.add.text(width * 0.5, height - 50, 'Back to List', {
            fontSize: '24px', color: '#ffffff', backgroundColor: '#000000', padding: { x: 10, y: 5 }
        })
        .setOrigin(0.5).setInteractive()
        .on('pointerdown', () => this.scene.start('TestListScene'));
    }
}
