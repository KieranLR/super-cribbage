import { Scene } from 'phaser';
import { Card, Suits, Values } from '../../game/Card.js';
import { CardVisual } from '../components/GameVisuals/CardVisual.js';
import { BackgroundVisual } from '../components/GameVisuals/BackgroundVisual.js';

export class HowToPlay extends Scene {
    constructor() {
        super('HowToPlay');
        this.currentSlide = 0;
        this.slides = [
            {
                title: 'Introduction',
                text: 'Cribbage is a simple two person card game.\nThe game involves scoring points by playing and grouping cards into pairs, runs, and combinations of cards that add up to 15.',
                createVisual: (scene, x, y) => {
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
                title: 'Winning the Game',
                text: 'The winner of a game is the first person to score 121 points.\n\nWe keep track of the score using pegs. Your peg is blue, and the computer\'s peg is red.\n\nEach time you score points, your peg will move forward. There are 120 peg holes for each player, so the first to get to the end of the path wins.',
                createVisual: (scene, x, y) => {
                    // Draw two circles representing pegs
                    scene.add.circle(x - 50, y, 20, 0x0000ff).setStrokeStyle(2, 0xffffff);
                    scene.add.text(x - 50, y + 30, 'You', { fontSize: '20px', color: '#ffffff' }).setOrigin(0.5);
                    scene.add.circle(x + 50, y, 20, 0xff0000).setStrokeStyle(2, 0xffffff);
                    scene.add.text(x + 50, y + 30, 'Computer', { fontSize: '20px', color: '#ffffff' }).setOrigin(0.5);
                    scene.add.text(x, y + 80, 'First to 121 wins!', { fontSize: '24px', color: '#ffd700', fontStyle: 'bold' }).setOrigin(0.5);
                }
            },
            {
                title: 'Stages of a Round',
                text: 'Cribbage is played in rounds, and each round consists of four stages:\n\n1: Discarding into the crib\n2: Pegging\n3: Counting points in hand\n4: Counting points in the crib',
                createVisual: (scene, x, y) => {
                    const stages = ['Discard', 'Pegging', 'Hand', 'Crib'];
                    stages.forEach((stage, i) => {
                        scene.add.rectangle(x - 225 + i * 150, y, 130, 60, 0x333333).setStrokeStyle(2, 0xffffff);
                        scene.add.text(x - 225 + i * 150, y, (i+1) + ': ' + stage, { fontSize: '20px', color: '#ffffff' }).setOrigin(0.5);
                    });
                }
            },
            {
                title: 'The Discard & Strategy',
                text: 'At the beginning of the round, each player is dealt six cards, and must choose two cards to discard into the crib. To discard, click on two cards and then tap the confirm button.\n\nStrategy: Keep cards that are pairs, runs, and groups that sum to 15. All face cards are worth 10, and Aces are worth 1.',
                createVisual: (scene, x, y) => {
                    const hand = [
                        new Card(Suits.HEARTS, Values.FIVE),
                        new Card(Suits.CLUBS, Values.KING),
                        new Card(Suits.DIAMONDS, Values.FIVE)
                    ];
                    hand.forEach((card, i) => {
                        const cv = new CardVisual(scene, x - 120 + i * 120, y, card);
                        if (i === 1) cv.setSelected(true); // Mock selection
                    });
                    scene.add.text(x, y + 90, 'Select 2 to discard', { fontSize: '20px', color: '#ffffff' }).setOrigin(0.5);
                }
            },
            {
                title: 'The Starter Card',
                text: 'After discarding, the deck is cut to reveal the Starter card. This shared card is used later to score hands and the crib.\n\nHis Nibs: If the Starter card is a Jack, the dealer immediately scores 2 points!',
                createVisual: (scene, x, y) => {
                    const starter = new Card(Suits.SPADES, Values.JACK);
                    const sv = new CardVisual(scene, x, y, starter);
                    sv.bg.setStrokeStyle(4, 0xffd700);
                    scene.add.text(x, y + 80, 'Jack = 2 points for Dealer!', { fontSize: '20px', color: '#ffd700' }).setOrigin(0.5);
                }
            },
            {
                title: 'The Pegging Phase',
                text: 'Starting with non-dealer, players lay cards until the sum reaches 31. Points are scored for:\n\n• 15 or 31 (2 pts)\n• Last card (1 pt)\n• Pairs (2, 6, 12 pts)\n• Runs of N (N pts)\n\nTo get credit for a run, the cards do not need to be played in order (e.g., 2, 4, 3 is a run of 3).',
                createVisual: (scene, x, y) => {
                    const cards = [
                        new Card(Suits.CLUBS, Values.TWO),
                        new Card(Suits.HEARTS, Values.FOUR),
                        new Card(Suits.SPADES, Values.THREE)
                    ];
                    cards.forEach((card, i) => {
                        new CardVisual(scene, x - 120 + i * 120, y, card);
                    });
                    scene.add.text(x, y + 85, 'Run of 3! (3 points)', { fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);
                }
            },
            {
                title: 'Counting Your Hand',
                text: 'Starting with non-dealer, players count points in their 4-card hand using the shared starter card.\n\nPoints awarded for:\n• 15s (2 pts)\n• Runs (1 pt/card)\n• Pairs/Sets (2-12 pts)\n• Flush (4-5 pts)\n• Nobs (Jack in hand matching starter suit - 1 pt)',
                createVisual: (scene, x, y) => {
                    const hand = [
                        new Card(Suits.HEARTS, Values.FIVE),
                        new Card(Suits.CLUBS, Values.FIVE),
                        new Card(Suits.DIAMONDS, Values.FIVE),
                        new Card(Suits.SPADES, Values.TEN)
                    ];
                    const starter = new Card(Suits.HEARTS, Values.JACK);
                    hand.forEach((card, i) => {
                        const cv = new CardVisual(scene, x - 180 + i * 90, y, card);
                        cv.setScale(0.8);
                    });
                    const sv = new CardVisual(scene, x + 180, y, starter);
                    sv.setScale(0.8).bg.setStrokeStyle(4, 0xffd700);
                    scene.add.text(x + 180, y + 70, 'Starter', { fontSize: '18px', color: '#ffd700' }).setOrigin(0.5);
                }
            },
            {
                title: 'Counting the Crib',
                text: 'Finally, the dealer counts the points in the crib using the same rules as the hand.\n\n*The only difference: For a flush in the crib, the starter card MUST also match the suit of the crib cards.',
                createVisual: (scene, x, y) => {
                    scene.add.rectangle(x, y, 120, 160, 0x000000, 0.3).setStrokeStyle(2, 0xffffff);
                    scene.add.text(x, y, 'The Crib', { fontSize: '32px', color: '#ffffff' }).setOrigin(0.5);
                }
            }
        ];
    }

    create() {
        const { width, height } = this.scale;

        // Background
        this.bg = new BackgroundVisual(this, 0.6);

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
        this.closeButton.setVisible(this.currentSlide === 0 || this.currentSlide === this.slides.length - 1);
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
