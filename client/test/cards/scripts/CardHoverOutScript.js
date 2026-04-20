
// You can write more code here

/* START OF COMPILED CODE */

import { OnEventScript } from "@phaserjs/editor-scripts-quick";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class CardHoverOutScript extends OnEventScript {

	constructor(parent) {
		super(parent);

		/* START-USER-CTR-CODE */
		this.eventName = "pointerout";
		this.eventEmitter = "gameObject";
		/* END-USER-CTR-CODE */
	}

	/* START-USER-CODE */

	awake() {
		if (!this.gameObject) {
			return;
		}

		this._onPointerOut = () => this.execute();
		this.gameObject.on("pointerout", this._onPointerOut);
	}

	execute() {
		const cardVisual = this.gameObject;
		if (!cardVisual) {
			return;
		}

		if (!cardVisual.input || !cardVisual.input.enabled) {
			return;
		}

		if (cardVisual.isLocked) {
			return;
		}

		if (cardVisual.resetVisualState) {
			cardVisual.resetVisualState(false);
		}
	}

	destroy() {
		if (!this.gameObject || !this._onPointerOut) {
			return;
		}

		this.gameObject.off("pointerout", this._onPointerOut);
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
