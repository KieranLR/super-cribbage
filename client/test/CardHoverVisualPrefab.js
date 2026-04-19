
// You can write more code here

/* START OF COMPILED CODE */

import CardVisualPrefab from "./CardVisualPrefab";
/* START-USER-IMPORTS */
import CardHoverOutlineComponent from "./CardHoverOutlineComponent";
import CardHoverOutlineScript from "./CardHoverOutlineScript";
/* END-USER-IMPORTS */

export default class CardHoverVisualPrefab extends CardVisualPrefab {

	constructor(scene, x, y) {
		super(scene, x ?? 0, y ?? 0);

		/* START-USER-CTR-CODE */
		const frontFace = /** @type {Phaser.GameObjects.Container} */ (this.list[0]);
		const backFace = /** @type {Phaser.GameObjects.Container} */ (this.list[1]);
		const frontBody = frontFace ? /** @type {Phaser.GameObjects.Rectangle} */ (frontFace.list[0]) : null;
		const backBody = backFace ? /** @type {Phaser.GameObjects.Rectangle} */ (backFace.list[0]) : null;

		const hoverOutline = new CardHoverOutlineComponent(this);
		hoverOutline.configure({
			frontBody,
			backBody,
			hoverStrokeColor: 0x00a2ff
		});

		new CardHoverOutlineScript(this);
		/* END-USER-CTR-CODE */
	}

	/* START-USER-CODE */

	// Write your code here.

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
