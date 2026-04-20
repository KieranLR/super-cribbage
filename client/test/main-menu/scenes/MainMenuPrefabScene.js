// You can write more code here

/* START OF COMPILED CODE */

import MainMenuPrefab from "../prefabs/MainMenuPrefab";
import MenuButtonPrefab from "../prefabs/MenuButtonPrefab";
/* START-USER-IMPORTS */
import { BackgroundVisual } from "../../../components/GameVisuals/BackgroundVisual.js";
/* END-USER-IMPORTS */

export default class MainMenuPrefabScene extends Phaser.Scene {

	constructor() {
		super("MainMenuPrefabScene");

		/* START-USER-CTR-CODE */
		this.mainMenuPrefab = null;
		this.bg = null;
		/* END-USER-CTR-CODE */
	}

	/** @returns {void} */
	editorCreate() {

		// backgroundRect
		const backgroundRect = this.add.rectangle(640, 360, 1280, 720);
		backgroundRect.isFilled = true;
		backgroundRect.fillColor = 1317404;

		// mainMenuPrefab
		const mainMenuPrefab = new MainMenuPrefab(this, 0, 0);
		this.add.existing(mainMenuPrefab);

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

		this.mainMenuPrefab = this.children.list.find(obj => obj && obj.constructor && obj.constructor.name === "MainMenuPrefab") || null;
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

		if (this.mainMenuPrefab?.attachBackground) {
			this.mainMenuPrefab.attachBackground(this.bg);
		}

		if (this.mainMenuPrefab?.setMenuItems) {
			this.mainMenuPrefab.setMenuItems(menuButtons);
		}
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
