import { Scene } from 'phaser';
import { Card, Suits, Values } from '../../game/Card.js';
import { CardVisual } from '../components/GameVisuals/CardVisual.js';

export class HowToPlay extends Scene {
    constructor() {
        super('HowToPlay');
        this.currentSlide = 0;
        this.slides = [
            {
                title: 'Welcome to Cribbage',
                text: 'Cribbage is a classic card game for two players. The goal is to be the first to reach 121 points by forming combinations of cards.',
                createVisual: (scene, x, y) => {
                    // Show a few cards
                    const cards = [
                        new Card(Suits.HEARTS, Values.FIVE),
                        new Card(Suits.DIAMONDS, Values.JACK),
                        new Card(Suits.CLUBS, Values.FIVE)
                    ];
                    cards.forEach((card, i) => {
                        new CardVisual(scene, x - 120 + i * 120, y, card);
                    });
                }
            },
            {
                title: 'The Deal & The Crib',
                text: 'Each player is dealt 6 cards. Each player discards 2 cards into a special "Crib" that belongs to the dealer. This leaves each player with a 4-card hand.',
                createVisual: (scene, x, y) => {
                    // Show two cards for the crib
                    const cribCards = [
                        new Card(Suits.SPADES, Values.ACE),
                        new Card(Suits.HEARTS, Values.KING)
                    ];
                    cribCards.forEach((card, i) => {
                        const cv = new CardVisual(scene, x - 60 + i * 120, y, card);
                        cv.setScale(0.8);
                    });
                    scene.add.text(x, y + 80, 'The Crib', { fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);
                }
            },
            {
                title: 'The Starter Card',
                text: 'After discarding, the non-dealer "cuts" the deck, and a single card is turned over. This is the "Starter Card" and is used by both players to form hands later.',
                createVisual: (scene, x, y) => {
                    const starter = new Card(Suits.DIAMONDS, Values.EIGHT);
                    new CardVisual(scene, x, y, starter);
                    scene.add.text(x, y + 90, 'Starter Card', { fontSize: '24px', color: '#ffd700' }).setOrigin(0.5);
                }
            },
            {
                title: 'The Pegging Phase',
                text: 'Players take turns playing cards from their hands. The total count cannot exceed 31. Points are scored for reaching 15, 31, making pairs, or sequences.',
                createVisual: (scene, x, y) => {
                    const cards = [
                        new Card(Suits.CLUBS, Values.SEVEN),
                        new Card(Suits.HEARTS, Values.EIGHT)
                    ];
                    cards.forEach((card, i) => {
                        new CardVisual(scene, x - 60 + i * 120, y, card);
                    });
                    scene.add.text(x, y + 80, '7 + 8 = 15! (2 points)', { fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);
                }
            },
            {
                title: 'Counting Hands',
                text: 'After pegging, players count their 4-card hands plus the starter card. Common combinations:\n• 15s (2 pts)\n• Pairs (2 pts)\n• Runs of 3+ (1 pt per card)\n• Flushes (4-5 pts)',
                createVisual: (scene, x, y) => {
                    const hand = [
                        new Card(Suits.HEARTS, Values.FIVE),
                        new Card(Suits.CLUBS, Values.FIVE),
                        new Card(Suits.DIAMONDS, Values.FIVE)
                    ];
                    hand.forEach((card, i) => {
                        const cv = new CardVisual(scene, x - 120 + i * 120, y, card);
                        cv.setScale(0.9);
                    });
                    scene.add.text(x, y + 80, 'Three 5s = 3 Pairs + multiple 15s!', { fontSize: '20px', color: '#ffffff' }).setOrigin(0.5);
                }
            },
            {
                title: 'The Crib Score',
                text: 'Finally, the dealer counts the cards in the Crib (also using the starter card). These points are added to the dealer\'s score.',
                createVisual: (scene, x, y) => {
                    scene.add.rectangle(x, y, 120, 160, 0x000000, 0.3).setStrokeStyle(2, 0xffffff);
                    scene.add.text(x, y, 'Crib', { fontSize: '32px', color: '#ffffff' }).setOrigin(0.5);
                }
            },
            {
                title: 'Winning the Game',
                text: 'The first player to reach 121 points wins immediately! Points are tracked on a pegboard.',
                createVisual: (scene, x, y) => {
                    scene.add.text(x, y, '121', { fontSize: '80px', color: '#ffd700', fontStyle: 'bold' }).setOrigin(0.5);
                }
            }
        ];
    }

    create() {
        const { width, height } = this.scale;

        // Background
        const bg = this.add.image(width / 2, height / 2, 'background');
        const scale = Math.max(width / bg.width + 0.2, height / bg.height + 0.2);
        bg.setScale(scale).setScrollFactor(0).setAlpha(0.6);

        // Main Panel
        this.panel = this.add.rectangle(width / 2, height / 2, width * 0.8, height * 0.8, 0x000000, 0.8)
            .setStrokeStyle(4, 0xffffff);

        // Title
        this.titleText = this.add.text(width / 2, height * 0.2, '', {
            fontSize: '42px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Content Text
        this.contentText = this.add.text(width / 2, height * 0.4, '', {
            fontSize: '24px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: width * 0.7 }
        }).setOrigin(0.5);

        // Buttons
        const buttonY = height * 0.85;

        this.backButton = this.createButton(width * 0.3, buttonY, 'Back', () => this.prevSlide());
        this.nextButton = this.createButton(width * 0.7, buttonY, 'Next', () => this.nextSlide());
        this.closeButton = this.createButton(width * 0.5, buttonY, 'Close', () => this.scene.start('MainMenu'));

        this.updateSlide();
    }

    createButton(x, y, label, callback) {
        const btn = this.add.container(x, y);
        const bg = this.add.rectangle(0, 0, 150, 50, 0x333333).setStrokeStyle(2, 0xffffff);
        const txt = this.add.text(0, 0, label, { fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);
        btn.add([bg, txt]);
        btn.setSize(150, 50);
        btn.setInteractive({ useHandCursor: true })
            .on('pointerover', () => bg.setFillStyle(0x555555))
            .on('pointerout', () => bg.setFillStyle(0x333333))
            .on('pointerdown', () => callback());
        return btn;
    }

    updateSlide() {
        const slide = this.slides[this.currentSlide];
        this.titleText.setText(slide.title);
        this.contentText.setText(slide.text);

        // Clear previous visuals
        this.children.list.filter(child => child.isVisualAid).forEach(child => child.destroy());

        if (slide.createVisual) {
            const visualStartIdx = this.children.list.length;
            slide.createVisual(this, this.scale.width / 2, this.scale.height * 0.65);
            for (let i = visualStartIdx; i < this.children.list.length; i++) {
                this.children.list[i].isVisualAid = true;
            }
        }

        // Visibility of buttons
        this.backButton.setVisible(this.currentSlide > 0);
        this.nextButton.setVisible(this.currentSlide < this.slides.length - 1);
        this.closeButton.setVisible(this.currentSlide === this.slides.length - 1);
    }

    nextSlide() {
        if (this.currentSlide < this.slides.length - 1) {
            this.currentSlide++;
            this.updateSlide();
        }
    }

    prevSlide() {
        if (this.currentSlide > 0) {
            this.currentSlide--;
            this.updateSlide();
        }
    }
}
