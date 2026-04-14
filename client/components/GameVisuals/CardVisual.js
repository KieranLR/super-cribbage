import * as phaser from "phaser"
window.Phaser = phaser;
import { Suits } from '../../../game/Card.js';
import { TIMINGS } from '../../utils/flow/timings.js';
import { settingsManager } from '../../utils/SettingsManager.js';
import { CARD_DECKS } from '../../utils/CardDeckConfigs.js';

// Get current deck config
const getActiveDeck = () => {
    const deckId = settingsManager.get('cardDeck') || 'default';
    return Object.values(CARD_DECKS).find(d => d.id === deckId) || CARD_DECKS.DEFAULT;
};

let activeDeck = getActiveDeck();
let CARD_COLORS = activeDeck.colors;
let CARD_STYLE = activeDeck.style;
let CARD_DIMENSIONS = activeDeck.dimensions;

export class CardVisual extends Phaser.GameObjects.Container {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     * @param {import('../../game/Card.js').Card} card
     */
    constructor(scene, x, y, card, isFaceDown = false) {
        super(scene, x, y);

        // Always refresh active deck in constructor to ensure new cards use current settings
        activeDeck = getActiveDeck();
        CARD_COLORS = activeDeck.colors;
        CARD_STYLE = activeDeck.style;
        CARD_DIMENSIONS = activeDeck.dimensions;

        this.cardData = card;
        this.isSelected = false;
        this.isFaceDown = isFaceDown;
        this.isLocked = false;
        this.baseY = y; // Initialize to 0, matching HandVisual default
        this.originalParent = null; // Track original parent for world position calculations during transitions

        // Card Dimensions
        const { WIDTH: width, HEIGHT: height } = CARD_DIMENSIONS;

        // Background (Card Body)
        this.bg = scene.add.graphics();
        this.drawBackground(CARD_COLORS.FACE_UP_BG, CARD_COLORS.FACE_UP_STROKE, CARD_STYLE.STROKE_WIDTH_FACE_UP);
        this.add(this.bg);

        // Card Back Pattern Container
        this.backPattern = scene.add.container(0, 0);
        this.add(this.backPattern);

        if (activeDeck.imageBack) {
            this.backImage = scene.add.image(0, 0, activeDeck.imageBack);
            this.backImage.setDisplaySize(width, height);
            this.backPattern.add(this.backImage);
        } else {
            const { GRID_SIZE: gridSize } = CARD_DIMENSIONS;
            for (let ix = -width / 2 + gridSize / 2; ix < width / 2; ix += gridSize) {
                for (let iy = -height / 2 + gridSize / 2; iy < height / 2; iy += gridSize) {
                    // Only add pattern if it's within the rounded rectangle bounds (roughly)
                    const diamond = scene.add.rectangle(ix, iy, 4, 4, CARD_COLORS.FACE_DOWN_PATTERN, 0.4)
                        .setAngle(45);
                    this.backPattern.add(diamond);
                }
            }
        }
        this.backPattern.setVisible(false);

        // Suit Color
        const color = CARD_COLORS.SUITS[card.suit] || CARD_COLORS.TEXT_DEFAULT;

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
            this.drawBackground(CARD_COLORS.FACE_DOWN_BG, this.isSelected ? CARD_COLORS.SELECTED_STROKE : CARD_COLORS.FACE_DOWN_STROKE, this.isSelected ? CARD_STYLE.STROKE_WIDTH_SELECTED : CARD_STYLE.STROKE_WIDTH_FACE_DOWN);
            this.backPattern.setVisible(true);
        }

        // Make interactive
        this.setSize(width, height);
        // We set interactive by default, but we may want to disable it based on context
        this.setInteractive();

        this.on('pointerover', () => {
            console.log('bointer over');
            if (this.isLocked) return;
            if (!this.input || !this.input.enabled) return;

            if (this.isInHoverTween()) {
                return;
            }

            if (this.parentContainer && this.parentContainer.isAnyDragging && this.parentContainer.isAnyDragging()) return;
            if (this.parentContainer && this.parentContainer.isAnyHovered && this.parentContainer.isAnyHovered()) return;
            this.isHovered = true;
            if (!this.isSelected) this.drawBackground(this.isFaceDown ? CARD_COLORS.FACE_DOWN_BG : CARD_COLORS.FACE_UP_BG, CARD_COLORS.HOVER_STROKE, CARD_STYLE.STROKE_WIDTH_HOVER);
            
            const animator = this.scene.animator || (this.parentContainer && this.parentContainer.animator);
            if (animator) {
                animator.hoverCard(this, (this.baseY ?? this.y) - CARD_STYLE.HOVER_OFFSET);
            } else {
                this.scene.tweens.add({
                    targets: this,
                    y: (this.baseY ?? this.y) - CARD_STYLE.HOVER_OFFSET,
                    duration: TIMINGS.ANIMATIONS.CARD_HOVER,
                    ease: 'Power2',
                    overwrite: true
                });
            }
        });

        this.on('pointerout', () => {
            if (!this.input || !this.input.enabled) return;
            if (this.isLocked) return;

            this.resetVisualState();
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
                    (Math.abs(t.data[0].end - ((this.baseY ?? 0) - CARD_STYLE.HOVER_OFFSET)) < 1 ||
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
            this.drawBackground(this.isFaceDown ? CARD_COLORS.FACE_DOWN_BG : CARD_COLORS.FACE_UP_BG, CARD_COLORS.SELECTED_STROKE, CARD_STYLE.STROKE_WIDTH_SELECTED); // Gold for selection
        } else {
            const strokeColor = this.isFaceDown ? CARD_COLORS.FACE_DOWN_STROKE : CARD_COLORS.FACE_UP_STROKE;
            const strokeWidth = this.isFaceDown ? CARD_STYLE.STROKE_WIDTH_FACE_DOWN : CARD_STYLE.STROKE_WIDTH_FACE_UP;
            this.drawBackground(this.isFaceDown ? CARD_COLORS.FACE_DOWN_BG : CARD_COLORS.FACE_UP_BG, strokeColor, strokeWidth);
        }
    }

    setFaceDown(isFaceDown) {
        this.isFaceDown = isFaceDown;
        
        // Update colors based on current card data
        const color = CARD_COLORS.SUITS[this.cardData.suit] || CARD_COLORS.TEXT_DEFAULT;
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
            this.drawBackground(CARD_COLORS.FACE_DOWN_BG, this.isSelected ? CARD_COLORS.SELECTED_STROKE : CARD_COLORS.FACE_DOWN_STROKE, this.isSelected ? CARD_STYLE.STROKE_WIDTH_SELECTED : CARD_STYLE.STROKE_WIDTH_FACE_DOWN);
            this.backPattern.setVisible(true);
        } else {
            this.valueText.setVisible(true);
            this.smallSuitText.setVisible(true);
            this.valueTextBottom.setVisible(true);
            this.smallSuitTextBottom.setVisible(true);
            this.suitText.setVisible(true);
            this.drawBackground(CARD_COLORS.FACE_UP_BG, this.isSelected ? CARD_COLORS.SELECTED_STROKE : CARD_COLORS.FACE_UP_STROKE, this.isSelected ? CARD_STYLE.STROKE_WIDTH_SELECTED : CARD_STYLE.STROKE_WIDTH_FACE_UP);
            this.backPattern.setVisible(false);
        }
    }

    /**
     * Resets the visual state of the card, removing hover effects and borders.
     * @param {boolean} instant - If true, sets the position immediately instead of tweening.
     */
    resetVisualState(instant = false) {
        this.isHovered = false;

        console.log(CARD_COLORS);

        if (!this.isSelected) {
            const strokeColor = this.isFaceDown ? CARD_COLORS.FACE_DOWN_STROKE : CARD_COLORS.FACE_UP_STROKE;
            const strokeWidth = this.isFaceDown ? CARD_STYLE.STROKE_WIDTH_FACE_DOWN : CARD_STYLE.STROKE_WIDTH_FACE_UP;
            this.drawBackground(this.isFaceDown ? CARD_COLORS.FACE_DOWN_BG : CARD_COLORS.FACE_UP_BG, strokeColor, strokeWidth);
        } else {
            this.drawBackground(this.isFaceDown ? CARD_COLORS.FACE_DOWN_BG : CARD_COLORS.FACE_UP_BG, CARD_COLORS.SELECTED_STROKE, CARD_STYLE.STROKE_WIDTH_SELECTED);
        }

        if (instant) {
            this.y = this.baseY ?? this.y;
            return;
        }

        if (this.isInHoverTween()) {
            return;
        }

        const animator = this.scene.animator || (this.parentContainer && this.parentContainer.animator);
        const targetY = this.baseY ?? this.y;

        if (animator) {
            animator.hoverCard(this, targetY);
        } else {
            this.scene.tweens.add({
                targets: this,
                y: targetY,
                duration: TIMINGS.ANIMATIONS.CARD_HOVER,
                ease: 'Power2',
                overwrite: true
            });
        }
    }

    /**
     * Draws the rounded background for the card.
     */
    drawBackground(fillColor, strokeColor, strokeWidth) {
        const { WIDTH: width, HEIGHT: height, CORNER_RADIUS: cornerRadius } = CARD_DIMENSIONS;
        
        this.bg.clear();
        this.bg.fillStyle(fillColor, 1);
        this.bg.lineStyle(strokeWidth, strokeColor, 1);
        this.bg.fillRoundedRect(-width / 2, -height / 2, width, height, cornerRadius);
        this.bg.strokeRoundedRect(-width / 2, -height / 2, width, height, cornerRadius);
    }
}
