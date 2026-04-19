// You can write more code here

/* START OF COMPILED CODE */

import { ScriptNode } from "@phaserjs/editor-scripts-base";
import CardVisualCardComponent from "./CardVisualCardComponent";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class CardPointerControlScript extends ScriptNode {

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

		const cardComp = CardVisualCardComponent.getComponent(this.gameObject);
		if (!cardComp) {
			return;
		}

		this.onPointerDown = pointer => {
			if (cardComp.isLocked || !this.gameObject.input || !this.gameObject.input.enabled) {
				return;
			}

			if (pointer.rightButtonDown()) {
				cardComp.setFaceDown(!cardComp.isFaceDown);
				return;
			}

			cardComp.setSelected(!cardComp.isSelected);
		};

		this.gameObject.on("pointerdown", this.onPointerDown);
	}

	destroy() {
		if (!this.gameObject || !this.onPointerDown) {
			return;
		}
		this.gameObject.off("pointerdown", this.onPointerDown);
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
