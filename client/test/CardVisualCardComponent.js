// You can write more code here

/* START OF COMPILED CODE */

import { UserComponent } from "@phaserjs/editor-scripts-base";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class CardVisualCardComponent extends UserComponent {

	constructor(gameObject) {
		super(gameObject);

		this.gameObject = gameObject;
		gameObject["__CardVisualCardComponent"] = this;

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/** @returns {CardVisualCardComponent} */
	static getComponent(gameObject) {
		return gameObject["__CardVisualCardComponent"];
	}

	/** @type {{ suit: string, value: string }} */
	cardData = null;
	/** @type {boolean} */
	isSelected = false;
	/** @type {boolean} */
	isFaceDown = false;
	/** @type {boolean} */
	isLocked = false;
	/** @type {boolean} */
	isHovered = false;
	/** @type {number} */
	baseY = 0;
	/** @type {number} */
	hoverStrokeColor = 0x00ff66;

	/** @type {Phaser.GameObjects.Graphics} */
	bg = null;
	/** @type {Phaser.GameObjects.Container} */
	backPattern = null;
	/** @type {Phaser.GameObjects.Text} */
	valueText = null;
	/** @type {Phaser.GameObjects.Text} */
	smallSuitText = null;
	/** @type {Phaser.GameObjects.Text} */
	valueTextBottom = null;
	/** @type {Phaser.GameObjects.Text} */
	smallSuitTextBottom = null;
	/** @type {Phaser.GameObjects.Text} */
	suitText = null;

	/** @type {any} */
	colors = null;
	/** @type {any} */
	style = null;
	/** @type {any} */
	dimensions = null;

	/* START-USER-CODE */

	/**
	 * @param {object} config
	 */
	configure(config) {
		this.cardData = config.cardData;
		this.baseY = config.baseY;
		this.colors = config.colors;
		this.style = config.style;
		this.dimensions = config.dimensions;
		this.bg = config.bg;
		this.backPattern = config.backPattern;
		this.valueText = config.valueText;
		this.smallSuitText = config.smallSuitText;
		this.valueTextBottom = config.valueTextBottom;
		this.smallSuitTextBottom = config.smallSuitTextBottom;
		this.suitText = config.suitText;
		if (typeof config.hoverStrokeColor === "number") {
			this.hoverStrokeColor = config.hoverStrokeColor;
		}
	}

	static getSuitSymbol(suit) {
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

	static getShortValue(value) {
		const mapping = {
			"Ace": "A",
			"Jack": "J",
			"Queen": "Q",
			"King": "K"
		};
		return mapping[value] || value;
	}

	drawBackground(fillColor, strokeColor, strokeWidth) {
		if (!this.bg || !this.dimensions) {
			return;
		}

		const width = this.dimensions.WIDTH;
		const height = this.dimensions.HEIGHT;
		const cornerRadius = this.dimensions.CORNER_RADIUS;

		this.bg.clear();
		this.bg.fillStyle(fillColor, 1);
		this.bg.lineStyle(strokeWidth, strokeColor, 1);
		this.bg.fillRoundedRect(-width / 2, -height / 2, width, height, cornerRadius);
		this.bg.strokeRoundedRect(-width / 2, -height / 2, width, height, cornerRadius);
	}

	refreshTextStyle() {
		const color = this.colors.SUITS[this.cardData.suit] || this.colors.TEXT_DEFAULT;
		const shortValue = CardVisualCardComponent.getShortValue(this.cardData.value);
		const suitSymbol = CardVisualCardComponent.getSuitSymbol(this.cardData.suit);

		this.valueText.setColor(color).setText(shortValue);
		this.smallSuitText.setColor(color).setText(suitSymbol);
		this.valueTextBottom.setColor(color).setText(shortValue);
		this.smallSuitTextBottom.setColor(color).setText(suitSymbol);
		this.suitText.setColor(color).setText(suitSymbol);
	}

	setSelected(selected) {
		this.isSelected = selected;
		const bgColor = this.isFaceDown ? this.colors.FACE_DOWN_BG : this.colors.FACE_UP_BG;
		if (this.isSelected) {
			this.drawBackground(bgColor, this.colors.SELECTED_STROKE, this.style.STROKE_WIDTH_SELECTED);
			return;
		}

		const normalStroke = this.isFaceDown ? this.colors.FACE_DOWN_STROKE : this.colors.FACE_UP_STROKE;
		const normalStrokeWidth = this.isFaceDown ? this.style.STROKE_WIDTH_FACE_DOWN : this.style.STROKE_WIDTH_FACE_UP;
		this.drawBackground(bgColor, normalStroke, normalStrokeWidth);
	}

	setFaceDown(faceDown) {
		this.isFaceDown = faceDown;
		this.refreshTextStyle();

		const frontVisible = !this.isFaceDown;
		this.valueText.setVisible(frontVisible);
		this.smallSuitText.setVisible(frontVisible);
		this.valueTextBottom.setVisible(frontVisible);
		this.smallSuitTextBottom.setVisible(frontVisible);
		this.suitText.setVisible(frontVisible);
		this.backPattern.setVisible(!frontVisible);

		const bgColor = this.isFaceDown ? this.colors.FACE_DOWN_BG : this.colors.FACE_UP_BG;
		if (this.isSelected) {
			this.drawBackground(bgColor, this.colors.SELECTED_STROKE, this.style.STROKE_WIDTH_SELECTED);
			return;
		}

		const normalStroke = this.isFaceDown ? this.colors.FACE_DOWN_STROKE : this.colors.FACE_UP_STROKE;
		const normalStrokeWidth = this.isFaceDown ? this.style.STROKE_WIDTH_FACE_DOWN : this.style.STROKE_WIDTH_FACE_UP;
		this.drawBackground(bgColor, normalStroke, normalStrokeWidth);
	}

	applyHoverVisual() {
		if (!this.isSelected) {
			const bgColor = this.isFaceDown ? this.colors.FACE_DOWN_BG : this.colors.FACE_UP_BG;
			this.drawBackground(bgColor, this.hoverStrokeColor, this.style.STROKE_WIDTH_HOVER);
		}
	}

	resetVisualState(instant = false) {
		this.isHovered = false;
		this.setSelected(this.isSelected);

		if (instant) {
			this.gameObject.y = this.baseY ?? this.gameObject.y;
			return;
		}

		this.scene.tweens.add({
			targets: this.gameObject,
			y: this.baseY ?? this.gameObject.y,
			duration: this.scene.cardHoverDuration ?? 100,
			ease: "Power2",
			overwrite: true
		});
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
