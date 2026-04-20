
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
		const cardVisual = this.gameObject;
		if (!cardVisual) {
			return;
		}

		if (cardVisual.isLocked) {
			return;
		}

		if (!cardVisual.input || !cardVisual.input.enabled) {
			return;
		}

		if (cardVisual.isInHoverTween && cardVisual.isInHoverTween()) {
			return;
		}

		if (cardVisual.parentContainer?.isAnyDragging && cardVisual.parentContainer.isAnyDragging()) {
			return;
		}

		if (cardVisual.parentContainer?.isAnyHovered && cardVisual.parentContainer.isAnyHovered()) {
			return;
		}

		if (cardVisual.setHover) {
			cardVisual.setHover(true);
		}

		if (cardVisual.hoverTo) {
			cardVisual.hoverTo((cardVisual.baseY ?? cardVisual.y) - (cardVisual.style?.HOVER_OFFSET ?? 10));
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
