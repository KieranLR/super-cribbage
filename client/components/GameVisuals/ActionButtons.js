import { TableLayout } from '../../utils/TableLayout.js';
import { createMenuButton } from '../../ui/buttons/menuButton.js';

export class ActionButtons extends Phaser.GameObjects.Container {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     */
    constructor(scene, x, y) {
        super(scene, x, y);
        this.buttons = {};
        scene.add.existing(this);
    }

    addButton(key, label, callback) {
        if (this.buttons[key]) {
            this.buttons[key].destroy();
        }

        const btn = createMenuButton(this.scene, label, callback);
        btn.setPosition(0, 0);
        this.add(btn);
        
        const config = TableLayout.REL.ACTION_BUTTONS;
        // Ensure container has a size for interaction if needed
        this.setSize(config.WIDTH, config.HEIGHT); 
        this.buttons[key] = btn;
        return btn;
    }

    showButton(key) {
        if (this.buttons[key]) {
            this.buttons[key].setVisible(true);
        }
    }

    hideButton(key) {
        if (this.buttons[key]) {
            this.buttons[key].setVisible(false);
        }
    }

    clearButtons() {
        for (let key in this.buttons) {
            this.buttons[key].destroy();
        }
        this.buttons = {};
    }
}