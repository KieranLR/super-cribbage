
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
		if (!this.gameObject || !this.gameObject.list || this.gameObject.list.length < 2) {
			return;
		}

		const frontFace = this.gameObject.list[0];
		const backFace = this.gameObject.list[1];
		const frontBody = frontFace?.list?.[0];
		const backBody = backFace?.list?.[0];

		if (frontBody) {
			frontBody.strokeColor = 0x888888;
			frontBody.lineWidth = 2;
		}

		if (backBody) {
			backBody.strokeColor = 0x222e50;
			backBody.lineWidth = 2;
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
