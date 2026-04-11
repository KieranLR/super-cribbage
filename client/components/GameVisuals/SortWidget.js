import { TableLayout } from '../../utils/TableLayout.js';
import { createMenuButton } from '../../ui/buttons/menuButton.js';

export class SortWidget extends Phaser.GameObjects.Container {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     * @param {Function} onSortRank
     * @param {Function} onSortSuit
     */
    constructor(scene, x, y, onSortRank, onSortSuit) {
        super(scene, x, y);

        const config = TableLayout.REL.SORT_WIDGET;
        
        // Main background box
        this.bg = scene.add.rectangle(0, 0, config.WIDTH, config.HEIGHT, 0x000000, 0.6)
            .setStrokeStyle(2, 0xffffff);
        this.add(this.bg);

        // "Sort Hand" Label
        this.label = scene.add.text(-config.WIDTH / 2 + 15, 0, 'Sort Hand:', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        this.add(this.label);

        // Rank Button
        this.rankBtn = createMenuButton(scene, 'Rank', onSortRank, {
            width: config.BUTTON_WIDTH,
            height: config.BUTTON_HEIGHT,
            fontSize: '16px'
        });
        this.rankBtn.setPosition(25, 0);
        this.add(this.rankBtn);

        // Suit Button
        this.suitBtn = createMenuButton(scene, 'Suit', onSortSuit, {
            width: config.BUTTON_WIDTH,
            height: config.BUTTON_HEIGHT,
            fontSize: '16px'
        });
        this.suitBtn.setPosition(25 + config.BUTTON_WIDTH + 15, 0);
        this.add(this.suitBtn);

        scene.add.existing(this);
    }
}
