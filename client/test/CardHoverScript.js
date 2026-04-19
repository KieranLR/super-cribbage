// You can write more code here

/* START OF COMPILED CODE */

import { ScriptNode } from "@phaserjs/editor-scripts-base";
import CardVisualCardComponent from "./CardVisualCardComponent";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class CardHoverScript extends ScriptNode {

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

		this.onPointerOver = () => {
			if (cardComp.isLocked || !this.gameObject.input || !this.gameObject.input.enabled) {
				return;
			}
			if (this.isInHoverTween(cardComp)) {
				return;
			}

			cardComp.isHovered = true;
			cardComp.applyHoverVisual();
			this.scene.tweens.add({
				targets: this.gameObject,
				y: (cardComp.baseY ?? this.gameObject.y) - cardComp.style.HOVER_OFFSET,
				duration: this.scene.cardHoverDuration ?? 100,
				ease: "Power2",
				overwrite: true
			});
		};

		this.onPointerOut = () => {
			if (cardComp.isLocked || !this.gameObject.input || !this.gameObject.input.enabled) {
				return;
			}
			if (this.isInHoverTween(cardComp)) {
				return;
			}
			cardComp.resetVisualState(false);
		};

		this.gameObject.on("pointerover", this.onPointerOver);
		this.gameObject.on("pointerout", this.onPointerOut);
	}

	isInHoverTween(cardComp) {
		if (!this.gameObject || !this.scene.tweens.isTweening(this.gameObject)) {
			return false;
		}

		const activeTweens = this.scene.tweens.getTweensOf(this.gameObject);
		return !activeTweens.every(tween => {
			if (!tween.data || !tween.data[0] || tween.data[0].key !== "y") {
				return false;
			}
			const end = tween.data[0].end;
			const baseY = cardComp.baseY ?? 0;
			return Math.abs(end - (baseY - cardComp.style.HOVER_OFFSET)) < 1 || Math.abs(end - baseY) < 1;
		});
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
