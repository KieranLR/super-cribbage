import { SortWidget } from './SortWidget.js';

export class BottomBarVisual extends Phaser.GameObjects.Container {
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
        this.config = config;

        // Background
        this.bg = scene.add.rectangle(0, 0, config.WIDTH, config.HEIGHT, 0x000000, 0.7)
            .setOrigin(0.5, 1);
        this.add(this.bg);

        // Sort Widget (positioned within BottomBar)
        this.sortWidget = new SortWidget(
            scene, 
            config.SORT_WIDGET_X, 
            config.SORT_WIDGET_Y, 
            config.SORT_WIDGET, 
            onSortRank, 
            onSortSuit
        );
        this.add(this.sortWidget);

        scene.add.existing(this);
    }

    updateConfig(config) {
        this.config = config;
        this.bg.setSize(config.WIDTH, config.HEIGHT);
        
        this.sortWidget.setPosition(config.SORT_WIDGET_X, config.SORT_WIDGET_Y);
        this.sortWidget.updateConfig(config.SORT_WIDGET);
    }
}
