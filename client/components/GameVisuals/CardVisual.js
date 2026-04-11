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
        this.isLocked = false;
        this.baseY = y; // Initialize to 0, matching HandVisual default

        // Card Dimensions
        const width = 100;
        const height = 140;

        // Background (Card Body)
        this.bg = scene.add.rectangle(0, 0, width, height, 0xffffff)
            .setStrokeStyle(2, 0x000000);
        this.add(this.bg);

        // Card Back Pattern Container
        this.backPattern = scene.add.container(0, 0);
        this.add(this.backPattern);

        const patternColor = 0x4d4dff; // Brighter blue for pattern
        const gridSize = 15;
        for (let ix = -width / 2 + gridSize / 2; ix < width / 2; ix += gridSize) {
            for (let iy = -height / 2 + gridSize / 2; iy < height / 2; iy += gridSize) {
                const diamond = scene.add.rectangle(ix, iy, 4, 4, patternColor, 0.5)
                    .setAngle(45);
                this.backPattern.add(diamond);
            }
        }
        this.backPattern.setVisible(false);

        // Suit Color
        const color = (card.suit === Suits.HEARTS || card.suit === Suits.DIAMONDS) ? '#ff0000' : '#000000';

        // Value Text (Top Left)
        this.valueText = scene.add.text(-width / 2 + 5, -height / 2 + 5, this.getShortValue(card.value), {
            fontSize: '20px',
            fontStyle: 'bold',
            color: color
        });
        this.add(this.valueText);

        // Suit Symbol (Small, Top Left)
        this.smallSuitText = scene.add.text(-width / 2 + 5, -height / 2 + 25, this.getSuitSymbol(card.suit), {
            fontSize: '16px',
            color: color
        });
        this.add(this.smallSuitText);

        // Value Text (Bottom Right, Upside Down)
        this.valueTextBottom = scene.add.text(width / 2 - 5, height / 2 - 5, this.getShortValue(card.value), {
            fontSize: '20px',
            fontStyle: 'bold',
            color: color
        }).setOrigin(0, 0).setAngle(180);
        this.add(this.valueTextBottom);

        // Suit Symbol (Small, Bottom Right, Upside Down)
        this.smallSuitTextBottom = scene.add.text(width / 2 - 5, height / 2 - 25, this.getSuitSymbol(card.suit), {
            fontSize: '16px',
            color: color
        }).setOrigin(0, 0).setAngle(180);
        this.add(this.smallSuitTextBottom);

        // Suit Symbol (Center)
        this.suitText = scene.add.text(0, 0, this.getSuitSymbol(card.suit), {
            fontSize: '48px',
            color: color
        }).setOrigin(0.5);
        this.add(this.suitText);

        if (this.isFaceDown) {
            this.valueText.setVisible(false);
            this.smallSuitText.setVisible(false);
            this.valueTextBottom.setVisible(false);
            this.smallSuitTextBottom.setVisible(false);
            this.suitText.setVisible(false);
            this.bg.setFillStyle(0x3333ff); // Brighter blue back
            this.backPattern.setVisible(true);
        }

        // Make interactive
        this.setSize(width, height);
        this.setInteractive();

        this.on('pointerover', () => {
            if (this.isLocked) return;

            if (this.isInHoverTween()) {
                return;
            }

            if (this.parentContainer && this.parentContainer.isAnyDragging && this.parentContainer.isAnyDragging()) return;
            if (this.parentContainer && this.parentContainer.isAnyHovered && this.parentContainer.isAnyHovered()) return;
            this.isHovered = true;
            if (!this.isSelected) this.bg.setStrokeStyle(4, 0x028af8);
            this.scene.tweens.add({
                targets: this,
                y: (this.baseY ?? this.y) - 10,
                duration: 150,
                ease: 'Power2',
                overwrite: true
            });
        });

        this.on('pointerout', () => {
            this.isHovered = false;

            if (this.isInHoverTween()) {
                return;
            }

            if (this.isLocked) return;
            if (this.parentContainer && this.parentContainer.isAnyDragging && this.parentContainer.isAnyDragging()) return;
            if (!this.isSelected) this.bg.setStrokeStyle(2, 0x000000);
            this.scene.tweens.add({
                targets: this,
                y: (this.baseY ?? this.y),
                duration: 150,
                ease: 'Power2',
                overwrite: true
            });
        });

        scene.add.existing(this);
    }

    isInHoverTween() {
        if (this.scene.tweens.isTweening(this)) {
            // If the only active tween is the "hover" tween, we can still allow the hover
            // But we don't want to restart it if it's already going to the same target
            const activeTweens = this.scene.tweens.getTweensOf(this);
            const isOnlyHoverTween = activeTweens.every(t => {
                // Phaser 3.60+ might have data differently, but typically it's t.data
                // Let's be safer and check if it's a simple y-tween to one of our hover targets
                return t.data && t.data[0] && t.data[0].key === 'y' &&
                    (Math.abs(t.data[0].end - ((this.baseY ?? 0) - 10)) < 1 ||
                        Math.abs(t.data[0].end - (this.baseY ?? 0)) < 1);
            });
            if (!isOnlyHoverTween) return true;
        }
        return false;
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
        } else {
            this.bg.setStrokeStyle(2, 0x000000);
        }
    }

    setFaceDown(isFaceDown) {
        this.isFaceDown = isFaceDown;
        
        // Update colors based on current card data
        const color = (this.cardData.suit === Suits.HEARTS || this.cardData.suit === Suits.DIAMONDS) ? '#ff0000' : '#000000';
        this.valueText.setColor(color).setText(this.getShortValue(this.cardData.value));
        this.smallSuitText.setColor(color).setText(this.getSuitSymbol(this.cardData.suit));
        this.valueTextBottom.setColor(color).setText(this.getShortValue(this.cardData.value));
        this.smallSuitTextBottom.setColor(color).setText(this.getSuitSymbol(this.cardData.suit));
        this.suitText.setColor(color).setText(this.getSuitSymbol(this.cardData.suit));

        if (this.isFaceDown) {
            this.valueText.setVisible(false);
            this.smallSuitText.setVisible(false);
            this.valueTextBottom.setVisible(false);
            this.smallSuitTextBottom.setVisible(false);
            this.suitText.setVisible(false);
            this.bg.setFillStyle(0x3333ff);
            this.backPattern.setVisible(true);
        } else {
            this.valueText.setVisible(true);
            this.smallSuitText.setVisible(true);
            this.valueTextBottom.setVisible(true);
            this.smallSuitTextBottom.setVisible(true);
            this.suitText.setVisible(true);
            this.bg.setFillStyle(0xffffff);
            this.backPattern.setVisible(false);
        }
    }
}
