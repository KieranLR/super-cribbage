
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import { Suits, Values, Card } from "../../game/Card.js";
import { TIMINGS } from "../utils/flow/timings.js";
import { settingsManager } from "../utils/SettingsManager.js";
import { CARD_DECKS } from "../utils/CardDeckConfigs.js";
/* END-USER-IMPORTS */

export default class CardVisualRefactorScene extends Phaser.Scene {

	constructor() {
		super("CardVisualRefactorScene");

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/** @returns {void} */
	editorCreate() {

		// backgroundRect
		const backgroundRect = this.add.rectangle(640, 360, 1280, 720);
		backgroundRect.isFilled = true;
		backgroundRect.fillColor = 166648;

		// titleText
		const titleText = this.add.text(640, 60, "", {});
		titleText.setOrigin(0.5, 0.5);
		titleText.text = "Card Visual Refactor Scene";
		titleText.setStyle({ "color": "#ffffff", "fontFamily": "Arial Black", "fontSize": "32px" });

		// hintText
		const hintText = this.add.text(640, 660, "", {});
		hintText.setOrigin(0.5, 0.5);
		hintText.text = "Click cards to toggle selection | Right-click to flip";
		hintText.setStyle({ "color": "#ffffff", "fontFamily": "Arial", "fontSize": "20px" });

		this.events.emit("scene-awake");
	}

	/* START-USER-CODE */

	getActiveDeck() {
		const deckId = settingsManager.get("cardDeck") || "default";
		return Object.values(CARD_DECKS).find(deck => deck.id === deckId) || CARD_DECKS.DEFAULT;
	}

	getSuitSymbol(suit) {
		switch (suit) {
			case Suits.HEARTS:
				return "\u2665";
			case Suits.DIAMONDS:
				return "\u2666";
			case Suits.CLUBS:
				return "\u2663";
			case Suits.SPADES:
				return "\u2660";
			default:
				return "?";
		}
	}

	getShortValue(value) {
		const mapping = {
			"Ace": "A",
			"Jack": "J",
			"Queen": "Q",
			"King": "K"
		};
		return mapping[value] || value;
	}

	createCardVisual(x, y, card, isFaceDown = false) {
		const activeDeck = this.getActiveDeck();
		const colors = activeDeck.colors;
		const style = activeDeck.style;
		const dimensions = activeDeck.dimensions;
		const hoverStrokeColor = 0x00ff66;
		const width = dimensions.WIDTH;
		const height = dimensions.HEIGHT;
		const cardContainer = this.add.container(x, y);
		cardContainer.cardData = card;
		cardContainer.baseY = y;
		cardContainer.isFaceDown = isFaceDown;
		cardContainer.isSelected = false;
		cardContainer.isLocked = false;
		cardContainer.isHovered = false;
		cardContainer.originalParent = null;

		const bg = this.add.graphics();
		cardContainer.add(bg);

		const backPattern = this.add.container(0, 0);
		cardContainer.add(backPattern);

		if (activeDeck.imageBack) {
			const backImage = this.add.image(0, 0, activeDeck.imageBack);
			backImage.setDisplaySize(width, height);
			backPattern.add(backImage);
		} else {
			const gridSize = dimensions.GRID_SIZE;
			for (let ix = -width / 2 + gridSize / 2; ix < width / 2; ix += gridSize) {
				for (let iy = -height / 2 + gridSize / 2; iy < height / 2; iy += gridSize) {
					const diamond = this.add.rectangle(ix, iy, 4, 4, colors.FACE_DOWN_PATTERN, 0.4).setAngle(45);
					backPattern.add(diamond);
				}
			}
		}
		backPattern.setVisible(false);

		const suitColor = colors.SUITS[card.suit] || colors.TEXT_DEFAULT;
		const valueText = this.add.text(-width / 2 + 5, -height / 2 + 5, this.getShortValue(card.value), {
			fontSize: "20px",
			fontStyle: "bold",
			color: suitColor
		});
		const smallSuitText = this.add.text(-width / 2 + 5, -height / 2 + 25, this.getSuitSymbol(card.suit), {
			fontSize: "16px",
			color: suitColor
		});
		const valueTextBottom = this.add.text(width / 2 - 5, height / 2 - 5, this.getShortValue(card.value), {
			fontSize: "20px",
			fontStyle: "bold",
			color: suitColor
		}).setOrigin(0, 0).setAngle(180);
		const smallSuitTextBottom = this.add.text(width / 2 - 5, height / 2 - 25, this.getSuitSymbol(card.suit), {
			fontSize: "16px",
			color: suitColor
		}).setOrigin(0, 0).setAngle(180);
		const suitText = this.add.text(0, 0, this.getSuitSymbol(card.suit), {
			fontSize: "48px",
			color: suitColor
		}).setOrigin(0.5);

		cardContainer.add([valueText, smallSuitText, valueTextBottom, smallSuitTextBottom, suitText]);
		cardContainer.backPattern = backPattern;
		cardContainer.bg = bg;
		cardContainer.valueText = valueText;
		cardContainer.smallSuitText = smallSuitText;
		cardContainer.valueTextBottom = valueTextBottom;
		cardContainer.smallSuitTextBottom = smallSuitTextBottom;
		cardContainer.suitText = suitText;
		cardContainer.deckStyle = { colors, style, dimensions };

		cardContainer.drawBackground = (fillColor, strokeColor, strokeWidth) => {
			bg.clear();
			bg.fillStyle(fillColor, 1);
			bg.lineStyle(strokeWidth, strokeColor, 1);
			bg.fillRoundedRect(-width / 2, -height / 2, width, height, dimensions.CORNER_RADIUS);
			bg.strokeRoundedRect(-width / 2, -height / 2, width, height, dimensions.CORNER_RADIUS);
		};

		cardContainer.isInHoverTween = () => {
			if (!this.tweens.isTweening(cardContainer)) {
				return false;
			}

			const activeTweens = this.tweens.getTweensOf(cardContainer);
			return !activeTweens.every(tween => {
				if (!tween.data || !tween.data[0] || tween.data[0].key !== "y") {
					return false;
				}
				const end = tween.data[0].end;
				const baseY = cardContainer.baseY ?? 0;
				return Math.abs(end - (baseY - style.HOVER_OFFSET)) < 1 || Math.abs(end - baseY) < 1;
			});
		};

		cardContainer.setSelected = selected => {
			cardContainer.isSelected = selected;
			if (cardContainer.isSelected) {
				cardContainer.drawBackground(cardContainer.isFaceDown ? colors.FACE_DOWN_BG : colors.FACE_UP_BG, colors.SELECTED_STROKE, style.STROKE_WIDTH_SELECTED);
				return;
			}
			const strokeColor = cardContainer.isFaceDown ? colors.FACE_DOWN_STROKE : colors.FACE_UP_STROKE;
			const strokeWidth = cardContainer.isFaceDown ? style.STROKE_WIDTH_FACE_DOWN : style.STROKE_WIDTH_FACE_UP;
			cardContainer.drawBackground(cardContainer.isFaceDown ? colors.FACE_DOWN_BG : colors.FACE_UP_BG, strokeColor, strokeWidth);
		};

		cardContainer.setFaceDown = faceDown => {
			cardContainer.isFaceDown = faceDown;
			const currentSuitColor = colors.SUITS[cardContainer.cardData.suit] || colors.TEXT_DEFAULT;
			cardContainer.valueText.setColor(currentSuitColor).setText(this.getShortValue(cardContainer.cardData.value));
			cardContainer.smallSuitText.setColor(currentSuitColor).setText(this.getSuitSymbol(cardContainer.cardData.suit));
			cardContainer.valueTextBottom.setColor(currentSuitColor).setText(this.getShortValue(cardContainer.cardData.value));
			cardContainer.smallSuitTextBottom.setColor(currentSuitColor).setText(this.getSuitSymbol(cardContainer.cardData.suit));
			cardContainer.suitText.setColor(currentSuitColor).setText(this.getSuitSymbol(cardContainer.cardData.suit));

			const frontVisible = !faceDown;
			cardContainer.valueText.setVisible(frontVisible);
			cardContainer.smallSuitText.setVisible(frontVisible);
			cardContainer.valueTextBottom.setVisible(frontVisible);
			cardContainer.smallSuitTextBottom.setVisible(frontVisible);
			cardContainer.suitText.setVisible(frontVisible);
			cardContainer.backPattern.setVisible(!frontVisible);

			const bgColor = faceDown ? colors.FACE_DOWN_BG : colors.FACE_UP_BG;
			const normalStroke = faceDown ? colors.FACE_DOWN_STROKE : colors.FACE_UP_STROKE;
			const normalWidth = faceDown ? style.STROKE_WIDTH_FACE_DOWN : style.STROKE_WIDTH_FACE_UP;
			cardContainer.drawBackground(bgColor, cardContainer.isSelected ? colors.SELECTED_STROKE : normalStroke, cardContainer.isSelected ? style.STROKE_WIDTH_SELECTED : normalWidth);
		};

		cardContainer.resetVisualState = (instant = false) => {
			cardContainer.isHovered = false;
			const bgColor = cardContainer.isFaceDown ? colors.FACE_DOWN_BG : colors.FACE_UP_BG;
			if (cardContainer.isSelected) {
				cardContainer.drawBackground(bgColor, colors.SELECTED_STROKE, style.STROKE_WIDTH_SELECTED);
			} else {
				const strokeColor = cardContainer.isFaceDown ? colors.FACE_DOWN_STROKE : colors.FACE_UP_STROKE;
				const strokeWidth = cardContainer.isFaceDown ? style.STROKE_WIDTH_FACE_DOWN : style.STROKE_WIDTH_FACE_UP;
				cardContainer.drawBackground(bgColor, strokeColor, strokeWidth);
			}

			if (instant) {
				cardContainer.y = cardContainer.baseY ?? cardContainer.y;
				return;
			}
			if (cardContainer.isInHoverTween()) {
				return;
			}

			const targetY = cardContainer.baseY ?? cardContainer.y;
			this.tweens.add({
				targets: cardContainer,
				y: targetY,
				duration: TIMINGS.ANIMATIONS.CARD_HOVER,
				ease: "Power2",
				overwrite: true
			});
		};

		cardContainer.setSize(width, height);
		cardContainer.setInteractive();

		cardContainer.on("pointerover", () => {
			if (cardContainer.isLocked || !cardContainer.input || !cardContainer.input.enabled) {
				return;
			}
			if (cardContainer.isInHoverTween()) {
				return;
			}
			cardContainer.isHovered = true;
			if (!cardContainer.isSelected) {
				cardContainer.drawBackground(cardContainer.isFaceDown ? colors.FACE_DOWN_BG : colors.FACE_UP_BG, hoverStrokeColor, style.STROKE_WIDTH_HOVER);
			}
			this.tweens.add({
				targets: cardContainer,
				y: (cardContainer.baseY ?? cardContainer.y) - style.HOVER_OFFSET,
				duration: TIMINGS.ANIMATIONS.CARD_HOVER,
				ease: "Power2",
				overwrite: true
			});
		});

		cardContainer.on("pointerout", () => {
			if (!cardContainer.input || !cardContainer.input.enabled || cardContainer.isLocked) {
				return;
			}
			cardContainer.resetVisualState();
		});

		cardContainer.setFaceDown(isFaceDown);
		return cardContainer;
	}

	create() {
		this.editorCreate();
		this.input.mouse?.disableContextMenu();

		const { width, height } = this.scale;
		const cards = [
			new Card(Suits.HEARTS, Values.ACE),
			new Card(Suits.SPADES, Values.KING),
			new Card(Suits.DIAMONDS, Values.JACK),
			new Card(Suits.CLUBS, Values.EIGHT)
		];

		cards.forEach((card, index) => {
			const cardVisual = this.createCardVisual((width / 2) - 225 + (index * 150), height / 2, card, false);
			cardVisual.on("pointerdown", pointer => {
				if (pointer.rightButtonDown()) {
					cardVisual.setFaceDown(!cardVisual.isFaceDown);
					return;
				}
				cardVisual.setSelected(!cardVisual.isSelected);
			});
		});

		const backBtn = this.add.text(width * 0.5, height - 40, "Back to Test List", {
			fontSize: "24px",
			color: "#ffffff",
			backgroundColor: "#000000",
			padding: { x: 10, y: 5 }
		}).setOrigin(0.5).setInteractive();

		backBtn.on("pointerdown", () => this.scene.start("TestListScene"));
		backBtn.on("pointerover", () => backBtn.setStyle({ color: "#ff0" }));
		backBtn.on("pointerout", () => backBtn.setStyle({ color: "#fff" }));
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
