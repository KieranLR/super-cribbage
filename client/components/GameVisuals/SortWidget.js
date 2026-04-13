import { TableLayout } from '../../utils/TableLayout.js';
import { createMenuButton } from '../../ui/buttons/menuButton.js';

export class SortWidget extends Phaser.GameObjects.Container {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     * @param {Object} config
     * @param {Function} onSortRank
     * @param {Function} onSortSuit
     */
    constructor(scene, x, y, config, onSortRank, onSortSuit) {
        super(scene, x, y);

        this.config = config || TableLayout.REL.SORT_WIDGET;
        
        // Main background box
        this.bg = scene.add.rectangle(0, 0, this.config.WIDTH, this.config.HEIGHT, 0x000000, 0.6)
            .setStrokeStyle(2, 0xffffff);
        this.add(this.bg);

        // "Sort Hand" Label
        this.label = scene.add.text(-this.config.WIDTH / 2 + 15, 0, 'Sort Hand:', {
            fontFamily: 'Arial',
            fontSize: this.config.WIDTH < 300 ? '14px' : '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        this.add(this.label);

        // Rank Button
        this.rankBtn = createMenuButton(scene, 'Rank', onSortRank, {
            width: this.config.BUTTON_WIDTH,
            height: this.config.BUTTON_HEIGHT,
            fontSize: this.config.WIDTH < 300 ? '12px' : '16px'
        });
        this.rankBtn.setPosition(this.config.WIDTH < 300 ? 5 : 25, 0);
        this.add(this.rankBtn);

        // Suit Button
        this.suitBtn = createMenuButton(scene, 'Suit', onSortSuit, {
            width: this.config.BUTTON_WIDTH,
            height: this.config.BUTTON_HEIGHT,
            fontSize: this.config.WIDTH < 300 ? '12px' : '16px'
        });
        this.suitBtn.setPosition((this.config.WIDTH < 300 ? 5 : 25) + this.config.BUTTON_WIDTH + (this.config.WIDTH < 300 ? 10 : 15), 0);
        this.add(this.suitBtn);

        scene.add.existing(this);
    }

    updateConfig(config) {
        this.config = config;
        this.bg.setSize(config.WIDTH, config.HEIGHT);
        this.label.setX(-config.WIDTH / 2 + 15);
        this.label.setFontSize(config.WIDTH < 300 ? '14px' : '18px');
        
        const btnXStart = config.WIDTH < 300 ? 5 : 25;
        this.rankBtn.setPosition(btnXStart, 0);
        this.rankBtn.updateSize(config.BUTTON_WIDTH, config.BUTTON_HEIGHT);
        
        this.suitBtn.setPosition(btnXStart + config.BUTTON_WIDTH + (config.WIDTH < 300 ? 10 : 15), 0);
        this.suitBtn.updateSize(config.BUTTON_WIDTH, config.BUTTON_HEIGHT);
    }
}
