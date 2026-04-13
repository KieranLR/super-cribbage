import { Scene } from 'phaser';
import { Card, Suits, Values } from '../../game/Card.js';
import { CardVisual } from '../components/GameVisuals/CardVisual.js';
import { BackgroundVisual } from '../components/GameVisuals/BackgroundVisual.js';
import { ScrollComponent } from '../utils/ScrollComponent.js';

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
                    const stages = [
                        { name: 'Discard', icons: () => {
                            const c1 = new CardVisual(scene, x - 225, y, new Card(Suits.HEARTS, Values.TEN));
                            const c2 = new CardVisual(scene, x - 225 + 15, y + 10, new Card(Suits.DIAMONDS, Values.FIVE));
                            c1.setScale(0.5);
                            c2.setScale(0.5);
                            scene.add.text(x - 225, y + 50, 'Discard', { fontSize: '18px', color: '#ffffff' }).setOrigin(0.5);
                        }},
                        { name: 'Pegging', icons: () => {
                            const c1 = new CardVisual(scene, x - 75, y, new Card(Suits.CLUBS, Values.SEVEN));
                            const c2 = new CardVisual(scene, x - 75 + 20, y, new Card(Suits.SPADES, Values.EIGHT));
                            c1.setScale(0.5);
                            c2.setScale(0.5);
                            scene.add.text(x - 75, y + 50, 'Pegging', { fontSize: '18px', color: '#ffffff' }).setOrigin(0.5);
                        }},
                        { name: 'Hand', icons: () => {
                            for (let i = 0; i < 4; i++) {
                                const c = new CardVisual(scene, x + 75 - 30 + i * 20, y, new Card(Suits.HEARTS, Values.ACE));
                                c.setScale(0.5);
                            }
                            scene.add.text(x + 75, y + 50, 'Hand', { fontSize: '18px', color: '#ffffff' }).setOrigin(0.5);
                        }},
                        { name: 'Crib', icons: () => {
                            const rect = scene.add.rectangle(x + 225, y, 60, 80, 0x000000, 0.5).setStrokeStyle(1, 0xffffff);
                            scene.add.text(x + 225, y, 'Crib', { fontSize: '16px', color: '#ffffff' }).setOrigin(0.5);
                            scene.add.text(x + 225, y + 50, 'Crib', { fontSize: '18px', color: '#ffffff' }).setOrigin(0.5);
                        }}
                    ];
                    stages.forEach(stage => stage.icons());
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
                    sv.drawBackground(0xffffff, 0xffd700, 4);
                    scene.add.text(x, y + 80, 'Jack = 2 points for Dealer!', { fontSize: '20px', color: '#ffd700' }).setOrigin(0.5);
                }
            },
            {
                title: 'The Pegging Phase',
                text: 'Starting with non-dealer, players lay cards until the sum reaches 31. Points are scored for:\n\n• 15 or 31 (2 pts)\n• Last card (1 pt)\n• Pairs (2, 6, 12 pts)\n• Runs of N (N pts)\n\nExample Play: (8) + (7) = 15! (2 points)\nNext: (7) + (7) = Pair! (2 points)',
                createVisual: (scene, x, y) => {
                    const cards = [
                        new Card(Suits.CLUBS, Values.EIGHT),
                        new Card(Suits.HEARTS, Values.SEVEN),
                        new Card(Suits.SPADES, Values.SEVEN)
                    ];
                    cards.forEach((card, i) => {
                        const cv = new CardVisual(scene, x - 120 + i * 120, y, card);
                        cv.setScale(0.8);
                    });
                    scene.add.text(x - 60, y + 80, '15 for 2!', { fontSize: '18px', color: '#ffffff' }).setOrigin(0.5);
                    scene.add.text(x + 60, y + 80, 'Pair for 2!', { fontSize: '18px', color: '#ffffff' }).setOrigin(0.5);
                    scene.add.text(x, y + 110, 'Total Pegged: 4 points', { fontSize: '20px', color: '#ffd700', fontStyle: 'bold' }).setOrigin(0.5);
                }
            },
            {
                title: 'Counting Your Hand',
                text: 'Count points in your 4-card hand using the shared starter card. Starting with non-dealer.\n\nExample Hand (with Starter):\n5♥, 5♣, 5♦, 10♠, J♥ (Starter)\n\nScore Breakdown:\n• 15s (5+10, 5+10, 5+10, 5+5+5) = 8 pts\n• Three of a Kind (5-5-5) = 6 pts\n• Nobs (Jack of Hearts matches Starter Hearts) = 1 pt\nTotal Score: 15 points',
                createVisual: (scene, x, y) => {
                    const hand = [
                        new Card(Suits.HEARTS, Values.JACK),
                        new Card(Suits.CLUBS, Values.FIVE),
                        new Card(Suits.DIAMONDS, Values.FIVE),
                        new Card(Suits.SPADES, Values.TEN)
                    ];
                    const starter = new Card(Suits.HEARTS, Values.FIVE);
                    hand.forEach((card, i) => {
                        const cv = new CardVisual(scene, x - 180 + i * 80, y, card);
                        cv.setScale(0.7);
                    });
                    const sv = new CardVisual(scene, x + 180, y, starter);
                    sv.setScale(0.7);
                    sv.drawBackground(0xffffff, 0xffd700, 4);
                    scene.add.text(x + 180, y + 65, 'Starter', { fontSize: '16px', color: '#ffd700' }).setOrigin(0.5);
                    scene.add.text(x, y + 100, 'Hand: 14 pts + 1 pt Nobs = 15 Total', { fontSize: '20px', color: '#ffd700', fontStyle: 'bold' }).setOrigin(0.5);
                }
            },
            {
                title: 'Counting the Crib',
                text: 'The dealer counts the crib just like a hand. \n\n*Flush Rule: In the crib, ALL FOUR cards AND the starter must match the suit for points (5 points).\n\nExample Crib:\n2♣, 4♣, 6♣, 8♣ with 10♣ Starter\nFlush (5) + Run (0) + 15s (0) = 5 points',
                createVisual: (scene, x, y) => {
                    const crib = [
                        new Card(Suits.CLUBS, Values.TWO),
                        new Card(Suits.CLUBS, Values.FOUR),
                        new Card(Suits.CLUBS, Values.SIX),
                        new Card(Suits.CLUBS, Values.EIGHT)
                    ];
                    const starter = new Card(Suits.CLUBS, Values.TEN);
                    crib.forEach((card, i) => {
                        const cv = new CardVisual(scene, x - 180 + i * 80, y, card);
                        cv.setScale(0.7);
                    });
                    const sv = new CardVisual(scene, x + 180, y, starter);
                    sv.setScale(0.7);
                    sv.drawBackground(0xffffff, 0xffd700, 4);
                    scene.add.text(x + 180, y + 65, 'Starter', { fontSize: '16px', color: '#ffd700' }).setOrigin(0.5);
                    scene.add.text(x, y + 100, '5-Card Flush = 5 points', { fontSize: '20px', color: '#ffd700', fontStyle: 'bold' }).setOrigin(0.5);
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

        // Visual Aid Container
        this.visualContainer = this.add.container(0, 0);

        // Content Container for Scrolling
        this.contentContainer = this.add.container(0, 0);
        this.contentContainer.add([this.panel, this.titleText, this.contentText, this.visualContainer]);

        this.scroller = new ScrollComponent(this, this.contentContainer);

        // Create Buttons container and children
        this.backButton = this.createButton(0, 0, 'Back', () => this.prevSlide());
        this.nextButton = this.createButton(0, 0, 'Next', () => this.nextSlide());
        this.closeButton = this.createButton(0, 0, 'Close', () => this.scene.start('MainMenu'));

        const updateLayout = () => {
            const { width, height } = this.scale;

            if (this.bg) {
                this.bg.resize(width, height);
            }

            this.panel.setPosition(width / 2, height / 2);
            this.panel.setSize(width * 0.8, height * 0.8);

            this.titleText.setPosition(width / 2, height * 0.2);
            this.contentText.setPosition(width / 2, height * 0.4);
            this.contentText.setWordWrapWidth(width * 0.7);

            const buttonY = height * 0.85;
            this.backButton.setPosition(width * 0.3, buttonY);
            this.nextButton.setPosition(width * 0.7, buttonY);
            this.closeButton.setPosition(width * 0.5, buttonY);

            this.updateSlide();
            
            // Check if content overflows and needs scrolling
            // In HowToPlay, the content height is roughly the panel height + some padding
            const totalContentHeight = height * 0.9; 
            this.scroller.updateLayout(totalContentHeight, height);
        };

        updateLayout();

        this.events.on('shutdown', () => {
            this.scroller.destroy();
        });

        this.scale.on('resize', (gameSize) => {
            if (!this.scene.isActive()) return;
            updateLayout();
        });
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
        this.visualContainer.removeAll(true);

        if (slide.createVisual) {
            slide.createVisual(this, this.scale.width / 2, this.scale.height * 0.65);
            
            // Move newly created objects into the container
            // This is slightly tricky because createVisual adds directly to scene
            // We'll capture them by looking at what was added
            const children = this.children.list;
            const newChildren = [];
            for (let i = children.length - 1; i >= 0; i--) {
                const child = children[i];
                if (child === this.visualContainer || child === this.panel || child === this.titleText || 
                    child === this.contentText || child === this.backButton || child === this.nextButton || 
                    child === this.closeButton || (this.bg && child === this.bg.bg) || child === this.contentContainer ||
                    child === this.scroller.scrollbarTrack || child === this.scroller.scrollbarHandle) continue;
                
                // If it's not one of our persistent UI elements, it must be part of the visual aid
                newChildren.push(child);
            }
            
            newChildren.forEach(child => {
                this.visualContainer.add(child);
            });
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
