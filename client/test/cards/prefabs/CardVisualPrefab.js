
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class CardVisualPrefab extends Phaser.GameObjects.Container {

	constructor(scene, x, y) {
		super(scene, x ?? 0, y ?? 0);

		// frontFace
		const frontFace = scene.add.container(0, 0);
		this.add(frontFace);

		// frontBody
		const frontBody = scene.add.rectangle(0, 0, 100, 140);
		frontBody.isFilled = true;
		frontBody.isStroked = true;
		frontBody.strokeColor = 8947848;
		frontBody.lineWidth = 2;
		frontFace.add(frontBody);

		// topValueText
		const topValueText = scene.add.text(-40, -62, "", {});
		topValueText.text = "2";
		topValueText.setStyle({ "color": "#ff0000", "fontFamily": "Verdana", "fontSize": "20px", "fontStyle": "bold" });
		frontFace.add(topValueText);

		// topSuitText
		const topSuitText = scene.add.text(-40, -42, "", {});
		topSuitText.text = "♥";
		topSuitText.setStyle({ "color": "#ff0000", "fontFamily": "Verdana" });
		frontFace.add(topSuitText);

		// centerSuitText
		const centerSuitText = scene.add.text(0, 0, "", {});
		centerSuitText.setOrigin(0.5, 0.5);
		centerSuitText.text = "♥";
		centerSuitText.setStyle({ "color": "#ff0000", "fontFamily": "Verdana", "fontSize": "48px" });
		frontFace.add(centerSuitText);

		// bottomValueText
		const bottomValueText = scene.add.text(40, 62, "", {});
		bottomValueText.angle = 180;
		bottomValueText.text = "2";
		bottomValueText.setStyle({ "color": "#ff0000", "fontFamily": "Verdana", "fontSize": "20px", "fontStyle": "bold" });
		frontFace.add(bottomValueText);

		// bottomSuitText
		const bottomSuitText = scene.add.text(40, 42, "", {});
		bottomSuitText.angle = 180;
		bottomSuitText.text = "♥";
		bottomSuitText.setStyle({ "color": "#ff0000", "fontFamily": "Verdana" });
		frontFace.add(bottomSuitText);

		// backFace
		const backFace = scene.add.container(0, 0);
		backFace.visible = false;
		this.add(backFace);

		// backBody
		const backBody = scene.add.rectangle(0, 0, 100, 140);
		backBody.isFilled = true;
		backBody.fillColor = 10249749;
		backBody.isStroked = true;
		backBody.strokeColor = 2240080;
		backBody.lineWidth = 2;
		backFace.add(backBody);

		// backPatternCenter
		const backPatternCenter = scene.add.rectangle(0, 0, 68, 108);
		backPatternCenter.isFilled = true;
		backPatternCenter.fillColor = 11913869;
		backPatternCenter.isStroked = true;
		backPatternCenter.strokeColor = 14674115;
		backFace.add(backPatternCenter);

		// backLabel
		const backLabel = scene.add.text(0, 0, "", {});
		backLabel.setOrigin(0.5, 0.5);
		backLabel.text = "CARD";
		backLabel.setStyle({ "color": "#222e50", "fontFamily": "Verdana", "fontStyle": "bold" });
		backFace.add(backLabel);

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/* START-USER-CODE */

	// Write your code here.

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
