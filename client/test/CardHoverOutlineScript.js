// You can write more code here

/* START OF COMPILED CODE */

import { ScriptNode } from "@phaserjs/editor-scripts-base";
import CardHoverOutlineComponent from "./CardHoverOutlineComponent";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class CardHoverOutlineScript extends ScriptNode {

	constructor(parent) {
		super(parent);

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/* START-USER-CODE */

	awake() {
		if (!this.gameObject) {
			return;
		}

		const cardComp = CardHoverOutlineComponent.getComponent(this.gameObject);
		if (!cardComp) {
			return;
		}

		const target = /** @type {Phaser.GameObjects.Container} */ (this.gameObject);
		target.setSize(100, 140);
		if (!target.input) {
			target.setInteractive();
		}

		this.onPointerOver = () => {
			cardComp.setHover(true);
		};

		this.onPointerOut = () => {
			cardComp.setHover(false);
		};

		target.on("pointerover", this.onPointerOver);
		target.on("pointerout", this.onPointerOut);
	}

	destroy() {
		if (!this.gameObject) {
			return;
		}

		if (this.onPointerOver) {
			this.gameObject.off("pointerover", this.onPointerOver);
		}

		if (this.onPointerOut) {
			this.gameObject.off("pointerout", this.onPointerOut);
		}
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
