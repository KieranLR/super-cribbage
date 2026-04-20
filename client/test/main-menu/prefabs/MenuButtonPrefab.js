// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class MenuButtonPrefab extends Phaser.GameObjects.Container {

	constructor(scene, x, y) {
		super(scene, x ?? 0, y ?? 0);

		// background
		const background = scene.add.rectangle(0, 0, 420, 60);
		background.isFilled = true;
		background.fillColor = 0;
		background.fillAlpha = 0.65;
		background.isStroked = true;
		background.strokeColor = 16777215;
		background.lineWidth = 2;
		this.add(background);

		// labelText
		const labelText = scene.add.text(0, 0, "", {});
		labelText.setOrigin(0.5, 0.5);
		labelText.text = "Menu Button";
		labelText.setStyle({ "color": "#ffffff", "fontFamily": "Arial", "fontSize": "28px" });
		this.add(labelText);

		/* START-USER-CTR-CODE */
		this.background = background;
		this.labelText = labelText;
		this.targetScene = null;
		this.baseScale = 1;

		this.setSize(420, 60);
		this.setInteractive({ useHandCursor: true });

		this.on("pointerover", this.onPointerOver, this);
		this.on("pointerout", this.onPointerOut, this);
		this.on("pointerdown", this.onPointerDown, this);
		this.on("pointerup", this.onPointerUp, this);
		/* END-USER-CTR-CODE */
	}

	/* START-USER-CODE */

	setButtonData(label, targetScene) {
		this.setLabel(label);
		this.setTargetScene(targetScene);
	}

	setLabel(label) {
		if (typeof label === "string") {
			this.labelText.setText(label);
		}
	}

	setTargetScene(targetScene) {
		this.targetScene = targetScene || null;
	}

	setButtonSize(width, height) {
		this.background.setSize(width, height);
		this.setSize(width, height);
	}

	setButtonFontSize(fontSize) {
		this.labelText.setFontSize(fontSize);
	}

	updateHoverScale(isHovering) {
		const hoverScale = isHovering ? 1.05 : 1;
		this.setScale((this.baseScale || 1) * hoverScale);
	}

	onPointerOver() {
		this.background.setFillStyle(0x333333, 0.85);
		this.background.setStrokeStyle(3, 0x00ff99);
		this.updateHoverScale(true);
	}

	onPointerOut() {
		this.background.setFillStyle(0x000000, 0.65);
		this.background.setStrokeStyle(2, 0xffffff);
		this.updateHoverScale(false);
	}

	onPointerDown() {
		this.setScale((this.baseScale || 1) * 0.95);
	}

	onPointerUp() {
		this.updateHoverScale(true);
		if (this.targetScene) {
			this.scene.scene.start(this.targetScene);
		}
	}

	destroy(fromScene) {
		this.off("pointerover", this.onPointerOver, this);
		this.off("pointerout", this.onPointerOut, this);
		this.off("pointerdown", this.onPointerDown, this);
		this.off("pointerup", this.onPointerUp, this);
		super.destroy(fromScene);
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
