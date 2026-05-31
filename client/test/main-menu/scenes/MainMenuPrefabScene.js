// You can write more code here

/* START OF COMPILED CODE */

import MenuButtonPrefab from "../prefabs/MenuButtonPrefab";
/* START-USER-IMPORTS */
import { BackgroundVisual } from "../../../components/GameVisuals/BackgroundVisual.js";
import CardHoverCardPrefab from "../../cards/prefabs/CardHoverCardPrefab.js";
import { UserComponent } from "../../../utils/UserComponent.js";
import { AnchorLayoutComponent } from "../../../utils/layout/AnchorLayoutComponent.js";
import { ANCHORS } from "../../../shared/layout/layoutSchema.js";
/* END-USER-IMPORTS */

export default class MainMenuPrefabScene extends Phaser.Scene {

	constructor() {
		super("MainMenuPrefabScene");

		/* START-USER-CTR-CODE */
		this.titleText = null;
		this.bg = null;
		this.leftCard = null;
		this.rightCard = null;
		this.sceneUserComponent = null;
		this.layoutComponents = [];
		/* END-USER-CTR-CODE */
	}

	/** @returns {void} */
	editorCreate() {

		// backgroundRect
		const backgroundRect = this.add.rectangle(640, 360, 1280, 720);
		backgroundRect.isFilled = true;
		backgroundRect.fillColor = 1317404;

		// titleText
		const titleText = this.add.text(640, 200, "", {});
		titleText.setOrigin(0.5, 0.5);
		titleText.text = "Super Cribbage";
		titleText.setStyle({ "align": "center", "color": "#ffffff", "fontFamily": "Arial Black", "fontSize": "64px", "stroke": "#000000", "strokeThickness": 10 });
		titleText.setShadow(2, 2, "#333333", 2, true, true);
		this.titleText = titleText;

		// startGameButton
		const startGameButton = new MenuButtonPrefab(this, 640, 240);
		this.add.existing(startGameButton);

		// howToPlayButton
		const howToPlayButton = new MenuButtonPrefab(this, 640, 320);
		this.add.existing(howToPlayButton);

		// settingsButton
		const settingsButton = new MenuButtonPrefab(this, 640, 400);
		this.add.existing(settingsButton);

		// testVisualsButton
		const testVisualsButton = new MenuButtonPrefab(this, 640, 480);
		this.add.existing(testVisualsButton);

		this.events.emit("scene-awake");
	}

	/* START-USER-CODE */

	create() {
		this.editorCreate();

		const backgroundRect = this.children.list.find(obj => obj && obj.type === "Rectangle");
		if (backgroundRect) {
			backgroundRect.visible = false;
		}

		const menuButtons = this.children.list.filter(obj => obj && obj.constructor && obj.constructor.name === "MenuButtonPrefab");
		const menuConfig = [
			{ label: "Start Easy Bot Game", sceneKey: "Game" },
			{ label: "How to Play", sceneKey: "HowToPlay" },
			{ label: "Settings", sceneKey: "Settings" },
			{ label: "Test Visuals", sceneKey: "TestListScene" }
		];

		menuButtons.forEach((button, index) => {
			const config = menuConfig[index];
			if (!config || !button.setButtonData) {
				return;
			}
			button.setButtonData(config.label, config.sceneKey);
		});

		this.bg = new BackgroundVisual(this);
		this.bg.bg.setDepth(-100);
		this.setupMainMenuLayout(menuButtons, menuConfig);

		this.leftCard = new CardHoverCardPrefab(this, 560, 360);
		this.add.existing(this.leftCard);
		this.leftCard.setCardData({ suit: "Hearts", value: "Ace" });
		this.leftCard.setFaceDown(false);
		this.leftCard.setDepth(-10);

		this.rightCard = new CardHoverCardPrefab(this, 720, 360);
		this.add.existing(this.rightCard);
		this.rightCard.setCardData({ suit: "Spades", value: "King" });
		this.rightCard.setFaceDown(false);
		this.rightCard.setDepth(-10);

		this.sceneUserComponent = new UserComponent({
			id: "mainMenuSceneSettings",
			label: "Main Menu Scene",
			type: "scene",
			supportsLayout: false,
			properties: [
				{ key: "leftCardX", label: "Left Card X", type: "number", defaultValue: 560, step: 1 },
				{ key: "leftCardY", label: "Left Card Y", type: "number", defaultValue: 360, step: 1 },
				{ key: "rightCardX", label: "Right Card X", type: "number", defaultValue: 720, step: 1 },
				{ key: "rightCardY", label: "Right Card Y", type: "number", defaultValue: 360, step: 1 },
				{ key: "backgroundColor", label: "Background Color", type: "color", defaultValue: "#ffffff" }
			],
			onChange: (values) => this.applySceneSettings(values)
		});
		this.sceneUserComponent.register();

		this.events.once("shutdown", () => {
			this.destroyLayoutComponents();

			if (this.sceneUserComponent) {
				this.sceneUserComponent.destroy();
				this.sceneUserComponent = null;
			}
		});
	}

	setupMainMenuLayout(menuButtons, menuConfig) {
		this.destroyLayoutComponents();

		const bindings = [];

		if (this.bg?.bg) {
			bindings.push({
				target: this.bg.bg,
				layout: {
					anchor: ANCHORS.CENTER,
					onLayout: ({ width, height }) => {
						if (this.bg?.resize) {
							this.bg.resize(width, height);
						}
					}
				},
				editor: {
					id: "mainMenuBackground",
					label: "Main Menu Background",
					type: "tileSprite"
				}
			});
		}

		if (this.titleText) {
			bindings.push({
				target: this.titleText,
				layout: {
					anchor: ANCHORS.TOP_CENTER,
					offsetX: 0,
					offsetY: 100,
					percentOffsetX: 0,
					percentOffsetY: 0.22
				},
				editor: {
					id: "mainMenuTitle",
					label: "Main Menu Title",
					type: "text"
				}
			});
		}

		const buttonEditorIds = [
			"mainMenuStartButton",
			"mainMenuHowToPlayButton",
			"mainMenuSettingsButton",
			"mainMenuTestVisualsButton"
		];
		const basePercentY = 0.45;
		const buttonSpacing = 80;
		menuButtons.forEach((button, index) => {
			const label = menuConfig[index]?.label || `Menu Button ${index + 1}`;
			bindings.push({
				target: button,
				layout: {
					anchor: ANCHORS.TOP_CENTER,
					offsetX: 0,
					offsetY: index * buttonSpacing,
					percentOffsetX: 0,
					percentOffsetY: basePercentY
				},
				editor: {
					id: buttonEditorIds[index] || `mainMenuButton${index + 1}`,
					label,
					type: "button"
				}
			});
		});

		this.layoutComponents = AnchorLayoutComponent.bind(this, bindings);
	}

	destroyLayoutComponents() {
		this.layoutComponents.forEach(component => {
			component.destroy();
		});
		this.layoutComponents = [];
	}

	applySceneSettings(values) {
		if (this.leftCard) {
			this.leftCard.setPosition(values.leftCardX, values.leftCardY);
		}

		if (this.rightCard) {
			this.rightCard.setPosition(values.rightCardX, values.rightCardY);
		}

		const tint = this.parseHexColor(values.backgroundColor, 0xffffff);
		if (this.bg?.bg?.setTint) {
			this.bg.bg.setTint(tint);
		}
	}

	parseHexColor(value, fallback) {
		if (typeof value !== "string") {
			return fallback;
		}

		const normalized = value.startsWith("#") ? value.slice(1) : value;
		if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
			return fallback;
		}

		return parseInt(normalized, 16);
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
