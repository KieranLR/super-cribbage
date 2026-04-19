// You can write more code here

/* START OF COMPILED CODE */

import { UserComponent } from "@phaserjs/editor-scripts-base";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class CardHoverOutlineComponent extends UserComponent {

	constructor(gameObject) {
		super(gameObject);

		this.gameObject = gameObject;
		gameObject["__CardHoverOutlineComponent"] = this;

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/** @returns {CardHoverOutlineComponent} */
	static getComponent(gameObject) {
		return gameObject["__CardHoverOutlineComponent"];
	}

	/** @type {Phaser.GameObjects.Rectangle | null} */
	frontBody = null;
	/** @type {Phaser.GameObjects.Rectangle | null} */
	backBody = null;
	/** @type {number} */
	hoverStrokeColor = 0x028af8;
	/** @type {number} */
	hoverStrokeWidth = 4;
	/** @type {number} */
	frontNormalStroke = 0x888888;
	/** @type {number} */
	frontNormalStrokeWidth = 2;
	/** @type {number} */
	backNormalStroke = 0x222e50;
	/** @type {number} */
	backNormalStrokeWidth = 2;

	/* START-USER-CODE */

	configure(config) {
		this.frontBody = config.frontBody ?? null;
		this.backBody = config.backBody ?? null;

		if (typeof config.hoverStrokeColor === "number") {
			this.hoverStrokeColor = config.hoverStrokeColor;
		}
	}

	setHover(active) {
		if (this.frontBody) {
			this.frontBody.strokeColor = active ? this.hoverStrokeColor : this.frontNormalStroke;
			this.frontBody.lineWidth = active ? this.hoverStrokeWidth : this.frontNormalStrokeWidth;
		}

		if (this.backBody) {
			this.backBody.strokeColor = active ? this.hoverStrokeColor : this.backNormalStroke;
			this.backBody.lineWidth = active ? this.hoverStrokeWidth : this.backNormalStrokeWidth;
		}
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
