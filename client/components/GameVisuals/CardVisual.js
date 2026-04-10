import { Suits } from '../../../game/Card.js';

export class CardVisual extends Phaser.GameObjects.Container {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     * @param {import('../../game/Card.js').Card} card
     */
    constructor(scene, x, y, card, isFaceDown = false) {
        super(scene, x, y);

        this.cardData = card;
        this.isSelected = false;
        this.isFaceDown = isFaceDown;

        // Card Dimensions
        const width = 100;
        const height = 140;

        // Background (Card Body)
        this.bg = scene.add.rectangle(0, 0, width, height, 0xffffff)
            .setStrokeStyle(2, 0x000000);
        this.add(this.bg);

        // Suit Color
        const color = (card.suit === Suits.HEARTS || card.suit === Suits.DIAMONDS) ? '#ff0000' : '#000000';

        // Value Text (Top Left)
        this.valueText = scene.add.text(-width / 2 + 5, -height / 2 + 5, this.getShortValue(card.value), {
            fontSize: '20px',
            fontStyle: 'bold',
            color: color
        });
        this.add(this.valueText);

        // Suit Symbol (Center)
        this.suitText = scene.add.text(0, 0, this.getSuitSymbol(card.suit), {
            fontSize: '48px',
            color: color
        }).setOrigin(0.5);
        this.add(this.suitText);

        if (this.isFaceDown) {
            this.valueText.setVisible(false);
            this.suitText.setVisible(false);
            this.bg.setFillStyle(0x2222aa); // Blue back
        }

        // Make interactive
        this.setSize(width, height);
        this.setInteractive();

        this.on('pointerover', () => {
            if (!this.isSelected) this.bg.setStrokeStyle(4, 0x028af8);
        });

        this.on('pointerout', () => {
            if (!this.isSelected) this.bg.setStrokeStyle(2, 0x000000);
        });

        scene.add.existing(this);
    }

    /**
     * Returns a symbol for the suit.
     * @param {string} suit 
     */
    getSuitSymbol(suit) {
        switch (suit) {
            case Suits.HEARTS: return '♥';
            case Suits.DIAMONDS: return '♦';
            case Suits.CLUBS: return '♣';
            case Suits.SPADES: return '♠';
            default: return '?';
        }
    }

    /**
     * Returns a short string for the card value.
     */
    getShortValue(value) {
        const mapping = {
            'Ace': 'A',
            'Jack': 'J',
            'Queen': 'Q',
            'King': 'K'
        };
        return mapping[value] || value;
    }

    /**
     * Toggles the selection state of the card.
     */
    setSelected(selected) {
        this.isSelected = selected;
        if (this.isSelected) {
            this.bg.setStrokeStyle(4, 0xffd700); // Gold for selection
            this.y -= 20; // Pop up slightly
        } else {
            this.bg.setStrokeStyle(2, 0x000000);
            this.y += 20;
        }
    }

    setFaceDown(isFaceDown) {
        this.isFaceDown = isFaceDown;
        if (this.isFaceDown) {
            this.valueText.setVisible(false);
            this.suitText.setVisible(false);
            this.bg.setFillStyle(0x2222aa);
        } else {
            this.valueText.setVisible(true);
            this.suitText.setVisible(true);
            this.bg.setFillStyle(0xffffff);
        }
    }
}
