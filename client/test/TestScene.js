
// You can write more code here

/* START OF COMPILED CODE */

import { OnPointerDownScript } from "@phaserjs/editor-scripts-quick";
import { ConsoleLogActionScript } from "@phaserjs/editor-scripts-quick";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class TestScene extends Phaser.Scene {

	constructor() {
		super("TestScene");

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/** @returns {void} */
	editorCreate() {

		// rectangle_1
		const rectangle_1 = this.add.rectangle(654, 154, 128, 128);
		rectangle_1.isFilled = true;

		// ellipse_1
		const ellipse_1 = this.add.ellipse(161, 445, 128, 128);
		ellipse_1.isFilled = true;

		// onPointerDownScript
		const onPointerDownScript = new OnPointerDownScript(ellipse_1);

		// consoleLogActionScript
		const consoleLogActionScript = new ConsoleLogActionScript(onPointerDownScript);

		// helloText
		const helloText = this.add.text(360, 260, "", {});
		helloText.text = "Hello from Codex";
		helloText.setStyle({ "color": "#ffffff", "fontFamily": "Verdana", "fontSize": "32px" });

		// consoleLogActionScript (prefab fields)
		consoleLogActionScript.message = "Big Log";

		this.events.emit("scene-awake");
	}

	/* START-USER-CODE */

	// Write your code here

	create() {

		this.editorCreate();
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
