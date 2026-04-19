
// You can write more code here

/* START OF COMPILED CODE */

import CardVisualPrefab from "./CardVisualPrefab";
import CardHoverInScript from "../scripts/CardHoverInScript";
import CardHoverOutScript from "../scripts/CardHoverOutScript";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class CardHoverCardPrefab extends CardVisualPrefab {

	constructor(scene, x, y) {
		super(scene, x ?? 0, y ?? 0);

		// cardHoverInScript
		const cardHoverInScript = new CardHoverInScript(this);

		// cardHoverOutScript
		const cardHoverOutScript = new CardHoverOutScript(this);

		// cardHoverInScript (prefab fields)
		cardHoverInScript.eventName = "pointerover";

		// cardHoverOutScript (prefab fields)
		cardHoverOutScript.eventName = "pointerout";

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/* START-USER-CODE */

	// Write your code here.

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
