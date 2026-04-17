
import * as Phaser from 'phaser';

// You can write more code here

/* START OF COMPILED CODE */

class Scene extends Phaser.Scene {

	constructor() {
		super("Scene");

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/** @returns {void} */
	editorCreate() {

		// rectangle_1
		const rectangle_1 = this.add.rectangle(392.9999694824219, 263, 128, 128);
		rectangle_1.scaleX = 3.65;
		rectangle_1.scaleY = 0.5;
		rectangle_1.isFilled = true;

		// rectangle
		const rectangle = this.add.rectangle(389, 180, 128, 128);
		rectangle.scaleX = 3.65;
		rectangle.scaleY = 0.5;
		rectangle.isFilled = true;

		// rectangle_2
		const rectangle_2 = this.add.rectangle(393, 340, 128, 128);
		rectangle_2.scaleX = 3.65;
		rectangle_2.scaleY = 0.5;
		rectangle_2.isFilled = true;

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
