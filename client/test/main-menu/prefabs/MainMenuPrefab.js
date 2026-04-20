// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import { ScrollComponent } from "../../../utils/ScrollComponent.js";
/* END-USER-IMPORTS */

export default class MainMenuPrefab extends Phaser.GameObjects.Container {

	constructor(scene, x, y) {
		super(scene, x ?? 0, y ?? 0);

		// titleText
		const titleText = scene.add.text(0, 0, "", {});
		titleText.setOrigin(0.5, 0.5);
		titleText.text = "Super Cribbage";
		titleText.setStyle({ "align": "center", "color": "#ffffff", "fontFamily": "Arial Black", "fontSize": "64px", "stroke": "#000000", "strokeThickness": 10 });
		titleText.setShadow(2, 2, "#333333", 2, true, true);
		this.add(titleText);

		// menuContainer
		const menuContainer = scene.add.container(0, 0);
		this.add(menuContainer);

		/* START-USER-CTR-CODE */
		this.titleText = titleText;
		this.menuContainer = menuContainer;
		this.menuItems = [];
		this.backgroundVisual = null;
		this.scroller = null;
		this._onResize = null;
		this._onShutdown = null;

		this.scroller = new ScrollComponent(scene, this.menuContainer);
		this.registerInspectableTitle();
		this.bindSceneEvents();
		/* END-USER-CTR-CODE */
	}

	/* START-USER-CODE */

	setMenuItems(items) {
		this.menuItems = Array.isArray(items) ? items : [];
		this.menuContainer.removeAll(false);
		this.menuItems.forEach(item => this.menuContainer.add(item));
		this.updateLayout();
	}

	registerInspectableTitle() {
		import("../../../editor/preview/InspectableRegistry").then(({ inspectableRegistry }) => {
			inspectableRegistry.register({
				id: "mainMenuTitle",
				label: "Main Menu Title",
				type: "text",
				gameObject: this.titleText,
				editableLayoutKey: "mainMenuTitle"
			});
		}).catch(() => {
			// Ignore outside editor mode.
		});
	}

	unregisterInspectableTitle() {
		import("../../../editor/preview/InspectableRegistry").then(({ inspectableRegistry }) => {
			inspectableRegistry.unregister("mainMenuTitle");
		}).catch(() => {
			// Ignore outside editor mode.
		});
	}

	attachBackground(backgroundVisual) {
		this.backgroundVisual = backgroundVisual;
		const { width, height } = this.scene.scale;
		if (this.backgroundVisual?.resize) {
			this.backgroundVisual.resize(width, height);
		}
	}

	updateLayout(widthArg, heightArg) {
		const width = widthArg ?? this.scene.scale.width;
		const height = heightArg ?? this.scene.scale.height;
		const isSmall = width < 600 || height < 600;

		const startY = height * (isSmall ? 0.3 : 0.45);
		const spacing = isSmall ? 65 : 80;
		let totalContentHeight = 0;

		this.menuItems.forEach((item, index) => {
			let scale = 1;
			if (width < 500 || height < 600) {
				scale = Math.min(0.8, Math.max(0.5, width / 600));
			}

			item.baseScale = scale;
			item.setScale(scale);

			const itemY = startY + index * spacing * scale;
			item.setPosition(width / 2, itemY);
			totalContentHeight = Math.max(totalContentHeight, itemY + (spacing * scale / 2));
		});

		if (this.scroller) {
			this.scroller.updateLayout(totalContentHeight + 50, height);
		}

		if (isSmall) {
			this.titleText.setFontSize("42px");
			this.titleText.setPosition(width * 0.5, height * 0.15);
		} else {
			this.titleText.setFontSize("64px");
			this.titleText.setPosition(width * 0.5, height * 0.22 + 100);
		}

		if (this.backgroundVisual?.resize) {
			this.backgroundVisual.resize(width, height);
		}
	}

	bindSceneEvents() {
		this._onResize = (gameSize) => {
			if (!this.scene.scene.isActive()) {
				return;
			}

			this.updateLayout(gameSize.width, gameSize.height);
		};

		this._onShutdown = () => {
			this.destroy();
		};

		this.scene.scale.on("resize", this._onResize);
		this.scene.events.on("shutdown", this._onShutdown);
	}

	destroy(fromScene) {
		if (this._onResize) {
			this.scene.scale.off("resize", this._onResize);
			this._onResize = null;
		}

		if (this._onShutdown) {
			this.scene.events.off("shutdown", this._onShutdown);
			this._onShutdown = null;
		}

		if (this.scroller) {
			this.scroller.destroy();
			this.scroller = null;
		}

		this.unregisterInspectableTitle();

		super.destroy(fromScene);
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
