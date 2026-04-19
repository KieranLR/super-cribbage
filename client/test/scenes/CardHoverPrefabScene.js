
// You can write more code here

/* START OF COMPILED CODE */

import CardHoverCardPrefab from "../prefabs/CardHoverCardPrefab";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class CardHoverPrefabScene extends Phaser.Scene {

	constructor() {
		super("CardHoverPrefabScene");

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/** @returns {void} */
	editorCreate() {

		// backgroundRect
		const backgroundRect = this.add.rectangle(640, 360, 1280, 720);
		backgroundRect.isFilled = true;
		backgroundRect.fillColor = 998743;

		// titleText
		const titleText = this.add.text(640, 70, "", {});
		titleText.setOrigin(0.5, 0.5);
		titleText.text = "Card Hover Prefab Demo";
		titleText.setStyle({ "color": "#ffffff", "fontFamily": "Verdana", "fontSize": "34px", "fontStyle": "bold" });

		// hintText
		const hintText = this.add.text(640, 120, "", {});
		hintText.setOrigin(0.5, 0.5);
		hintText.text = "Hover cards to see outline change";
		hintText.setStyle({ "color": "#d8f3ff", "fontFamily": "Verdana", "fontSize": "20px" });

		// hoverCardA
		const hoverCardA = new CardHoverCardPrefab(this, 560, 360);
		this.add.existing(hoverCardA);

		// hoverCardB
		const hoverCardB = new CardHoverCardPrefab(this, 720, 360);
		this.add.existing(hoverCardB);

		this.events.emit("scene-awake");
	}

	/* START-USER-CODE */

	// Write your code here

	create() {

		this.editorCreate();
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
