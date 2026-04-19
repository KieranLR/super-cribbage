
// You can write more code here

/* START OF COMPILED CODE */

import MoveX from "./MoveX";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class Extends2 extends MoveX {

	constructor(gameObject) {
		super(gameObject);

		this.gameObject = gameObject;
		gameObject["__Extends2"] = this;

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/** @returns {Extends2} */
	static getComponent(gameObject) {
		return gameObject["__Extends2"];
	}


	/* START-USER-CODE */

	// Write your code here.

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
