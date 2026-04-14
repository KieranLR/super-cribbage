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

        this.config = config;
        this.onSortRank = onSortRank;
        this.onSortSuit = onSortSuit;
        
        // Main background box
        this.bg = scene.add.rectangle(0, 0, this.config.WIDTH, this.config.HEIGHT, 0x000000, 0.6)
            .setStrokeStyle(2, 0xffffff);
        this.add(this.bg);

        // "Sort Hand" Label
        this.label = scene.add.text(0, 0, 'Sort:', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0.5);
        this.add(this.label);

        // Rank Button
        this.rankBtn = createMenuButton(scene, 'Rank', onSortRank, {
            width: this.config.BUTTON_WIDTH,
            height: this.config.BUTTON_HEIGHT,
            fontSize: '16px'
        });
        this.add(this.rankBtn);

        // Suit Button
        this.suitBtn = createMenuButton(scene, 'Suit', onSortSuit, {
            width: this.config.BUTTON_WIDTH,
            height: this.config.BUTTON_HEIGHT,
            fontSize: '16px'
        });
        this.add(this.suitBtn);

        this.updateLayout();
        scene.add.existing(this);
    }

    updateConfig(config) {
        this.config = config;
        this.updateLayout();
    }

    updateLayout() {
        const config = this.config;
        this.bg.setSize(config.WIDTH, config.HEIGHT);

        const isSmall = config.WIDTH < 260;
        const fontSize = isSmall ? '14px' : '18px';
        const btnFontSize = isSmall ? '12px' : '16px';
        const spacing = isSmall ? 8 : 12;

        this.label.setFontSize(fontSize);
        this.label.setText(isSmall ? 'Sort:' : 'Sort Hand:');

        // Layout: [Label] [RankBtn] [SuitBtn]
        // Calculate total width of items to center them
        const labelWidth = this.label.width;
        const totalWidth = labelWidth + spacing + config.BUTTON_WIDTH + spacing + config.BUTTON_WIDTH;
        
        const startX = -totalWidth / 2;
        
        this.label.setX(startX + labelWidth / 2);
        
        this.rankBtn.setPosition(startX + labelWidth + spacing + config.BUTTON_WIDTH / 2, 0);
        this.rankBtn.updateSize(config.BUTTON_WIDTH, config.BUTTON_HEIGHT);
        this.rankBtn.updateFontSize(btnFontSize);

        this.suitBtn.setPosition(startX + labelWidth + spacing + config.BUTTON_WIDTH + spacing + config.BUTTON_WIDTH / 2, 0);
        this.suitBtn.updateSize(config.BUTTON_WIDTH, config.BUTTON_HEIGHT);
        this.suitBtn.updateFontSize(btnFontSize);
    }
}
