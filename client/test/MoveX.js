
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class MoveX {

	constructor(gameObject) {
		this.gameObject = gameObject;
		gameObject["__MoveX"] = this;

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/** @returns {MoveX} */
	static getComponent(gameObject) {
		return gameObject["__MoveX"];
	}

	/** @type {number} */
	property = 0;
	/** @type {number} */
	property_1 = 0;

	/* START-USER-CODE */

	// Write your code here.

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
