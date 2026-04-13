import { Scene } from 'phaser';
import { DeckVisual } from '../../components/GameVisuals/DeckVisual.js';
import { TableLayout } from '../../utils/TableLayout.js';

export class TestDeckScene extends Scene {
    constructor() {
        super('TestDeckScene');
    }

    create() {
        this.layout = new TableLayout(this.scale);
        const { width, height } = this.scale;
        const pos = this.layout.getPositions();

        // Background
        this.add.image(pos.background.x, pos.background.y, 'background')
            .setScale(Math.max(width / 1024, height / 768));

        this.add.text(width / 2, 50, 'Deck Visual Test', {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // 1. Stacked Deck
        this.add.text(pos.deck.x, pos.deck.y - 100, 'Stacked Deck', { fontSize: '18px', color: '#fff' }).setOrigin(0.5);
        const stackedDeck = new DeckVisual(this, pos.deck.x, pos.deck.y);
        stackedDeck.showStack(52);

        // 2. Fanned Deck (Starting Cut)
        const fanY = height - 200;
        this.add.text(width / 2, fanY - 100, 'Fanned Deck (Starting Cut)', { fontSize: '18px', color: '#fff' }).setOrigin(0.5);
        const fannedDeck = new DeckVisual(this, width / 2, fanY);
        
        const localStartX = pos.startingCut.startX - (width / 2);
        const localEndX = pos.startingCut.endX - (width / 2);
        
        fannedDeck.showFan(52, localStartX, localEndX, (card) => {
            console.log('Card clicked:', card.cutIndex);
            card.setFaceDown(!card.isFaceDown);
        });

        // 3. Animation Test
        const animX = width / 2;
        const animY = height / 2;
        const animatedDeck = new DeckVisual(this, animX, animY);
        
        const testAnimBtn = this.add.text(width / 2, height / 2 + 100, 'Animate Fan', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#0066cc',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            animatedDeck.setAlpha(0);
            this.tweens.add({
                targets: animatedDeck,
                alpha: 1,
                duration: 500,
                onComplete: () => {
                    animatedDeck.animateFan(52, localStartX, localEndX, (card) => {
                        card.setFaceDown(!card.isFaceDown);
                    });
                }
            });
        });

        // 4. Stack Animation Test
        this.add.text(width / 2, height / 2 + 180, 'Animate Stack', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#cc6600',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            animatedDeck.animateStack(500, () => {
                console.log('Stack animation complete');
            });
        });

        // 5. Pop Card Test
        this.add.text(width / 2, height / 2 + 260, 'Pop & Make Interactive', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#6600cc',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            const card = animatedDeck.popCard();
            if (card) {
                this.add.existing(card);
                card.setPosition(width / 2, height / 2);
                card.setInteractive();
                card.on('pointerdown', () => {
                    console.log('Popped card clicked!');
                    card.setFaceDown(!card.isFaceDown);
                });
                this.tweens.add({
                    targets: card,
                    y: height / 2 - 100,
                    alpha: 0,
                    delay: 2000,
                    duration: 1000,
                    onComplete: () => card.destroy()
                });
            }
        });

        // Back button
        const backBtn = this.add.text(width - 100, 50, 'Back', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.scene.start('TestListScene'));
    }
}
