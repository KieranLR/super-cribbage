
import * as Phaser from 'phaser';

// You can write more code here

/* START OF COMPILED CODE */

export class MainMenuScene extends Phaser.Scene {

	constructor() {
		super("MainMenuScene");

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/** @returns {void} */
	editorCreate() {

		// titleText
		const titleText = this.add.text(640, 150, "", {});
		titleText.setOrigin(0.5, 0.5);
		titleText.text = "Super Cribbage";
		titleText.setStyle({ "fontSize": "64px", "fontStyle": "bold" });

		// playButton
		const playButton = this.add.container(640, 300);
		playButton.setName("playButton");

		// playBg
		const playBg = this.add.rectangle(0, 0, 300, 80);
		playBg.setName("playBg");
		playBg.isFilled = true;
		playBg.fillColor = 3046706;
		playButton.add(playBg);

		// playText
		const playText = this.add.text(0, 0, "", {});
		playText.setName("playText");
		playText.setOrigin(0.5, 0.5);
		playText.text = "Play Game";
		playText.setStyle({ "fontSize": "32px" });
		playButton.add(playText);

		// settingsButton
		const settingsButton = this.add.container(640, 420);
		settingsButton.setName("settingsButton");

		// settingsBg
		const settingsBg = this.add.rectangle(0, 0, 300, 80);
		settingsBg.setName("settingsBg");
		settingsBg.isFilled = true;
		settingsBg.fillColor = 1402304;
		settingsButton.add(settingsBg);

		// settingsText
		const settingsText = this.add.text(0, 0, "", {});
		settingsText.setName("settingsText");
		settingsText.setOrigin(0.5, 0.5);
		settingsText.text = "Settings";
		settingsText.setStyle({ "fontSize": "32px" });
		settingsButton.add(settingsText);

		// creditsButton
		const creditsButton = this.add.container(640, 540);
		creditsButton.setName("creditsButton");

		// creditsBg
		const creditsBg = this.add.rectangle(0, 0, 300, 80);
		creditsBg.setName("creditsBg");
		creditsBg.isFilled = true;
		creditsBg.fillColor = 15690752;
		creditsButton.add(creditsBg);

		// creditsText
		const creditsText = this.add.text(0, 0, "", {});
		creditsText.setName("creditsText");
		creditsText.setOrigin(0.5, 0.5);
		creditsText.text = "Credits";
		creditsText.setStyle({ "fontSize": "32px" });
		creditsButton.add(creditsText);

		this.events.emit("scene-awake");
	}

	/* START-USER-CODE */

	// Write your code here

	create() {

		this.editorCreate();
		
		// Add some basic interactivity for the buttons
		const playButton = this.children.getByName("playButton");
		if (playButton) {
			const bg = playButton.getByName("playBg");
			bg.setInteractive({ useHandCursor: true })
				.on('pointerdown', () => this.scene.start('Game'))
				.on('pointerover', () => bg.setAlpha(0.8))
				.on('pointerout', () => bg.setAlpha(1));
		}

		const settingsButton = this.children.getByName("settingsButton");
		if (settingsButton) {
			const bg = settingsButton.getByName("settingsBg");
			bg.setInteractive({ useHandCursor: true })
				.on('pointerdown', () => this.scene.start('Settings'))
				.on('pointerover', () => bg.setAlpha(0.8))
				.on('pointerout', () => bg.setAlpha(1));
		}
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
