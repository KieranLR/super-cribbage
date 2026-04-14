import { TableLayout } from '../../utils/TableLayout.js';
import { createMenuButton } from '../../ui/buttons/menuButton.js';

export class ActionButtons extends Phaser.GameObjects.Container {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     * @param {Object} config
     */
    constructor(scene, x, y, config) {
        super(scene, x, y);
        this.buttons = {};
        this.config = config;
        scene.add.existing(this);
    }

    addButton(key, label, callback) {
        if (this.buttons[key]) {
            this.buttons[key].destroy();
        }

        const btn = createMenuButton(this.scene, label, callback, {
            width: this.config.WIDTH,
            height: this.config.HEIGHT,
            fontSize: this.config.HEIGHT < 55 ? '20px' : '28px'
        });
        btn.setPosition(0, 0);
        this.add(btn);
        
        // Ensure container has a size for interaction if needed
        this.setSize(this.config.WIDTH, this.config.HEIGHT); 
        this.buttons[key] = btn;
        return btn;
    }

    updateConfig(config) {
        this.config = config;
        this.setSize(config.WIDTH, config.HEIGHT);
        for (let key in this.buttons) {
            this.buttons[key].updateSize(config.WIDTH, config.HEIGHT);
            this.buttons[key].updateFontSize(config.HEIGHT < 55 ? '20px' : '28px');
        }
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