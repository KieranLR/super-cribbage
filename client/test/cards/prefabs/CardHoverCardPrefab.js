
// You can write more code here

/* START OF COMPILED CODE */

import CardVisualPrefab from "./CardVisualPrefab";
import CardHoverInScript from "../scripts/CardHoverInScript";
import CardHoverOutScript from "../scripts/CardHoverOutScript";
/* START-USER-IMPORTS */
import { settingsManager } from "../../../utils/SettingsManager.js";
import { CARD_DECKS } from "../../../utils/CardDeckConfigs.js";
import { TIMINGS } from "../../../utils/flow/timings.js";
/* END-USER-IMPORTS */

export default class CardHoverCardPrefab extends CardVisualPrefab {

	constructor(scene, x, y) {
		super(scene, x ?? 0, y ?? 0);

		// cardHoverInScript
		const cardHoverInScript = new CardHoverInScript(this);

		// cardHoverOutScript
		const cardHoverOutScript = new CardHoverOutScript(this);

		// cardHoverInScript (prefab fields)
		cardHoverInScript.eventName = "pointerover";

		// cardHoverOutScript (prefab fields)
		cardHoverOutScript.eventName = "pointerout";

		/* START-USER-CTR-CODE */
		// CardVisual-compatible runtime state
		this.cardData = arguments[3] ?? { suit: "Hearts", value: "2" };
		this.isFaceDown = arguments[4] ?? false;
			this.isSelected = false;
			this.isHovered = false;
			this.isLocked = false;
			this.baseY = this.y;
			this.originalParent = null;
			this.hoverStrokeColor = 0x00a2ff;

		// Cache prefab children for fast updates.
		this.frontFace = this.list[0];
		this.backFace = this.list[1];
		this.frontBody = this.frontFace?.list?.[0] ?? null;
		this.topValueText = this.frontFace?.list?.[1] ?? null;
		this.topSuitText = this.frontFace?.list?.[2] ?? null;
		this.centerSuitText = this.frontFace?.list?.[3] ?? null;
		this.bottomValueText = this.frontFace?.list?.[4] ?? null;
		this.bottomSuitText = this.frontFace?.list?.[5] ?? null;
		this.backBody = this.backFace?.list?.[0] ?? null;
		this.backPatternCenter = this.backFace?.list?.[1] ?? null;
		this.backLabel = this.backFace?.list?.[2] ?? null;

		this.backPatternGrid = this.scene.add.container(0, 0);
		this.backFace?.addAt(this.backPatternGrid, 1);
		this.backImage = null;

		this.refreshDeckTheme();
		this.refreshBackPattern();
		this.refreshText();
		this.setFaceDown(this.isFaceDown);

		this.setSize(this.dimensions.WIDTH, this.dimensions.HEIGHT);
		this.setInteractive();
		/* END-USER-CTR-CODE */
	}

	/* START-USER-CODE */

	getActiveDeck() {
		const deckId = settingsManager.get("cardDeck") || "default";
		return Object.values(CARD_DECKS).find(deck => deck.id === deckId) || CARD_DECKS.DEFAULT;
	}

	refreshDeckTheme() {
		const deck = this.getActiveDeck();
		this.activeDeck = deck;
		this.colors = deck.colors;
		this.style = deck.style;
		this.dimensions = deck.dimensions;
	}

	refreshBackPattern() {
		if (!this.backPatternGrid) {
			return;
		}

		this.backPatternGrid.removeAll(true);

		if (this.backImage) {
			this.backImage.destroy();
			this.backImage = null;
		}

		const width = this.dimensions.WIDTH;
		const height = this.dimensions.HEIGHT;

		if (this.activeDeck.imageBack) {
			this.backImage = this.scene.add.image(0, 0, this.activeDeck.imageBack);
			this.backImage.setDisplaySize(width, height);
			this.backPatternGrid.add(this.backImage);
			if (this.backPatternCenter) {
				this.backPatternCenter.setVisible(false);
			}
			if (this.backLabel) {
				this.backLabel.setVisible(false);
			}
			return;
		}

		if (this.backPatternCenter) {
			this.backPatternCenter.setVisible(false);
		}
		if (this.backLabel) {
			this.backLabel.setVisible(false);
		}

		const gridSize = this.dimensions.GRID_SIZE;
		for (let ix = -width / 2 + gridSize / 2; ix < width / 2; ix += gridSize) {
			for (let iy = -height / 2 + gridSize / 2; iy < height / 2; iy += gridSize) {
				const diamond = this.scene.add.rectangle(ix, iy, 4, 4, this.colors.FACE_DOWN_PATTERN, 0.4);
				diamond.setAngle(45);
				this.backPatternGrid.add(diamond);
			}
		}
	}

	getSuitSymbol(suit) {
		switch (suit) {
			case "Hearts":
				return "\u2665";
			case "Diamonds":
				return "\u2666";
			case "Clubs":
				return "\u2663";
			case "Spades":
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

	refreshText() {
		const color = this.colors.SUITS[this.cardData.suit] || this.colors.TEXT_DEFAULT;
		const suitSymbol = this.getSuitSymbol(this.cardData.suit);
		const shortValue = this.getShortValue(this.cardData.value);

		this.topValueText?.setColor(color).setText(shortValue);
		this.bottomValueText?.setColor(color).setText(shortValue);
		this.topSuitText?.setColor(color).setText(suitSymbol);
		this.bottomSuitText?.setColor(color).setText(suitSymbol);
		this.centerSuitText?.setColor(color).setText(suitSymbol);
	}

	setCardData(cardData) {
		this.cardData = cardData;
		this.refreshDeckTheme();
		this.refreshBackPattern();
		this.refreshText();
		this.setFaceDown(this.isFaceDown);
	}

	applyBodyStyle(fillColor, strokeColor, strokeWidth) {
		if (this.frontBody) {
			this.frontBody.fillColor = fillColor;
			this.frontBody.strokeColor = strokeColor;
			this.frontBody.lineWidth = strokeWidth;
			this.frontBody.width = this.dimensions.WIDTH;
			this.frontBody.height = this.dimensions.HEIGHT;
		}

		if (this.backBody) {
			this.backBody.fillColor = this.colors.FACE_DOWN_BG;
			this.backBody.strokeColor = this.isHovered && !this.isSelected ? this.hoverStrokeColor : this.colors.FACE_DOWN_STROKE;
			this.backBody.lineWidth = this.isHovered && !this.isSelected ? this.style.STROKE_WIDTH_HOVER : this.style.STROKE_WIDTH_FACE_DOWN;
			this.backBody.width = this.dimensions.WIDTH;
			this.backBody.height = this.dimensions.HEIGHT;
		}
	}

	setSelected(selected) {
		this.isSelected = selected;
		const faceColor = this.isFaceDown ? this.colors.FACE_DOWN_BG : this.colors.FACE_UP_BG;
		if (this.isSelected) {
			this.applyBodyStyle(faceColor, this.colors.SELECTED_STROKE, this.style.STROKE_WIDTH_SELECTED);
			return;
		}

		const strokeColor = this.isFaceDown ? this.colors.FACE_DOWN_STROKE : this.colors.FACE_UP_STROKE;
		const strokeWidth = this.isFaceDown ? this.style.STROKE_WIDTH_FACE_DOWN : this.style.STROKE_WIDTH_FACE_UP;
		this.applyBodyStyle(faceColor, strokeColor, strokeWidth);
	}

	setFaceDown(isFaceDown) {
		this.isFaceDown = isFaceDown;
		this.refreshText();

		this.frontFace?.setVisible(!this.isFaceDown);
		this.backFace?.setVisible(this.isFaceDown);

		const faceColor = this.isFaceDown ? this.colors.FACE_DOWN_BG : this.colors.FACE_UP_BG;
		const strokeColor = this.isSelected
			? this.colors.SELECTED_STROKE
			: (this.isFaceDown ? this.colors.FACE_DOWN_STROKE : this.colors.FACE_UP_STROKE);
		const strokeWidth = this.isSelected
			? this.style.STROKE_WIDTH_SELECTED
			: (this.isFaceDown ? this.style.STROKE_WIDTH_FACE_DOWN : this.style.STROKE_WIDTH_FACE_UP);

		this.applyBodyStyle(faceColor, strokeColor, strokeWidth);
	}

	setHover(active) {
		this.isHovered = active;
		if (this.isSelected) {
			this.setSelected(true);
			return;
		}

		const faceColor = this.isFaceDown ? this.colors.FACE_DOWN_BG : this.colors.FACE_UP_BG;
		const strokeColor = active ? this.hoverStrokeColor : (this.isFaceDown ? this.colors.FACE_DOWN_STROKE : this.colors.FACE_UP_STROKE);
		const strokeWidth = active ? this.style.STROKE_WIDTH_HOVER : (this.isFaceDown ? this.style.STROKE_WIDTH_FACE_DOWN : this.style.STROKE_WIDTH_FACE_UP);
		this.applyBodyStyle(faceColor, strokeColor, strokeWidth);
	}

	isInHoverTween() {
		if (!this.scene.tweens.isTweening(this)) {
			return false;
		}

		const activeTweens = this.scene.tweens.getTweensOf(this);
		return !activeTweens.every(tween => {
			if (!tween.data || !tween.data[0] || tween.data[0].key !== "y") {
				return false;
			}
			const end = tween.data[0].end;
			return Math.abs(end - ((this.baseY ?? 0) - this.style.HOVER_OFFSET)) < 1 || Math.abs(end - (this.baseY ?? 0)) < 1;
		});
	}

	hoverTo(targetY) {
		const animator = this.scene.animator || (this.parentContainer && this.parentContainer.animator);
		if (animator && typeof animator.hoverCard === "function") {
			animator.hoverCard(this, targetY);
			return;
		}

		this.scene.tweens.add({
			targets: this,
			y: targetY,
			duration: TIMINGS.ANIMATIONS.CARD_HOVER,
			ease: "Power2",
			overwrite: true
		});
	}

	resetVisualState(instant = false) {
		this.setHover(false);
		this.setSelected(this.isSelected);

		if (instant) {
			this.y = this.baseY ?? this.y;
			return;
		}

		if (this.isInHoverTween()) {
			return;
		}

		this.hoverTo(this.baseY ?? this.y);
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
