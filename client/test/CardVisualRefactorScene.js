
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import { Suits, Values, Card } from "../../game/Card.js";
import { TIMINGS } from "../utils/flow/timings.js";
import { settingsManager } from "../utils/SettingsManager.js";
import { CARD_DECKS } from "../utils/CardDeckConfigs.js";
import CardVisualCardComponent from "./CardVisualCardComponent.js";
import CardHoverScript from "./CardHoverScript.js";
import CardPointerControlScript from "./CardPointerControlScript.js";
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

	createCardVisual(x, y, card, isFaceDown = false) {
		const activeDeck = this.getActiveDeck();
		const colors = activeDeck.colors;
		const style = activeDeck.style;
		const dimensions = activeDeck.dimensions;
		const hoverStrokeColor = 0x00ff66;
		const width = dimensions.WIDTH;
		const height = dimensions.HEIGHT;
		const cardContainer = this.add.container(x, y);

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
		const valueText = this.add.text(-width / 2 + 5, -height / 2 + 5, CardVisualCardComponent.getShortValue(card.value), {
			fontSize: "20px",
			fontStyle: "bold",
			color: suitColor
		});
		const smallSuitText = this.add.text(-width / 2 + 5, -height / 2 + 25, CardVisualCardComponent.getSuitSymbol(card.suit), {
			fontSize: "16px",
			color: suitColor
		});
		const valueTextBottom = this.add.text(width / 2 - 5, height / 2 - 5, CardVisualCardComponent.getShortValue(card.value), {
			fontSize: "20px",
			fontStyle: "bold",
			color: suitColor
		}).setOrigin(0, 0).setAngle(180);
		const smallSuitTextBottom = this.add.text(width / 2 - 5, height / 2 - 25, CardVisualCardComponent.getSuitSymbol(card.suit), {
			fontSize: "16px",
			color: suitColor
		}).setOrigin(0, 0).setAngle(180);
		const suitText = this.add.text(0, 0, CardVisualCardComponent.getSuitSymbol(card.suit), {
			fontSize: "48px",
			color: suitColor
		}).setOrigin(0.5);

		cardContainer.add([valueText, smallSuitText, valueTextBottom, smallSuitTextBottom, suitText]);

		cardContainer.setSize(width, height);
		cardContainer.setInteractive();

		const cardComponent = new CardVisualCardComponent(cardContainer);
		cardComponent.configure({
			cardData: card,
			baseY: y,
			colors,
			style,
			dimensions,
			bg,
			backPattern,
			valueText,
			smallSuitText,
			valueTextBottom,
			smallSuitTextBottom,
			suitText,
			hoverStrokeColor
		});
		cardComponent.setFaceDown(isFaceDown);

		new CardHoverScript(cardContainer);
		new CardPointerControlScript(cardContainer);
		return cardContainer;
	}

	create() {
		this.editorCreate();
		this.input.mouse?.disableContextMenu();
		this.cardHoverDuration = TIMINGS.ANIMATIONS.CARD_HOVER;

		const { width, height } = this.scale;
		const cards = [
			new Card(Suits.HEARTS, Values.ACE),
			new Card(Suits.SPADES, Values.KING),
			new Card(Suits.DIAMONDS, Values.JACK),
			new Card(Suits.CLUBS, Values.EIGHT)
		];

		cards.forEach((card, index) => {
			this.createCardVisual((width / 2) - 225 + (index * 150), height / 2, card, false);
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
