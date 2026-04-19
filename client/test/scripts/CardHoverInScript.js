
// You can write more code here

/* START OF COMPILED CODE */

import { OnEventScript } from "@phaserjs/editor-scripts-quick";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class CardHoverInScript extends OnEventScript {

	constructor(parent) {
		super(parent);

		/* START-USER-CTR-CODE */
		this.eventName = "pointerover";
		this.eventEmitter = "gameObject";
		/* END-USER-CTR-CODE */
	}

	/* START-USER-CODE */

	awake() {
		if (!this.gameObject) {
			return;
		}

		// Ensure hover events are emitted by the prefab root.
		if (!this.gameObject.input) {
			this.gameObject.setSize(100, 140);
			this.gameObject.setInteractive();
		}

		this._onPointerOver = () => this.execute();
		this.gameObject.on("pointerover", this._onPointerOver);
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
			frontBody.strokeColor = 0x00a2ff;
			frontBody.lineWidth = 4;
		}

		if (backBody) {
			backBody.strokeColor = 0x00a2ff;
			backBody.lineWidth = 4;
		}
	}

	destroy() {
		if (!this.gameObject || !this._onPointerOver) {
			return;
		}

		this.gameObject.off("pointerover", this._onPointerOver);
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
