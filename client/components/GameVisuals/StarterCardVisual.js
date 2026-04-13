import { TableLayout } from '../../utils/TableLayout.js';
import { CardVisual } from './CardVisual.js';

export class StarterCardVisual extends Phaser.GameObjects.Container {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     * @param {Object} config
     * @param {import('../../../game/Card.js').Card|null} card
     */
    constructor(scene, x, y, config, card = null) {
        super(scene, x, y);
        this.cardVisual = null;
        this.config = config || TableLayout.REL.STARTER_CARD;

        const configLocal = this.config;

        // Label
        const label = scene.add.text(0, configLocal.LABEL_Y, 'Starter Card', {
            fontSize: '18px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 5, y: 2 }
        }).setOrigin(0.5);
        this.add(label);

        // Placeholder area
        const width = configLocal.WIDTH;
        const height = configLocal.HEIGHT;
        const placeholder = scene.add.rectangle(0, 0, width, height, 0x3333ff, 0.8)
            .setStrokeStyle(2, 0xffffff, 0.5);
        this.add(placeholder);

        // Add pattern to placeholder
        const patternColor = 0x4d4dff;
        const gridSize = 15;
        this.placeholderPattern = scene.add.container(0, 0);
        this.add(this.placeholderPattern);

        for (let ix = -width / 2 + gridSize / 2; ix < width / 2; ix += gridSize) {
            for (let iy = -height / 2 + gridSize / 2; iy < height / 2; iy += gridSize) {
                const diamond = scene.add.rectangle(ix, iy, 4, 4, patternColor, 0.5)
                    .setAngle(45);
                this.placeholderPattern.add(diamond);
            }
        }

        if (card) {
            this.setCard(card);
        }

        scene.add.existing(this);
    }

    setCard(card) {
        if (this.cardVisual) {
            this.cardVisual.destroy();
        }

        if (card) {
            this.cardVisual = new CardVisual(this.scene, 0, 0, card);
            this.cardVisual.originalParent = this;
            this.add(this.cardVisual);
            this.placeholderPattern.setVisible(false);
        } else {
            this.placeholderPattern.setVisible(true);
        }
    }
}
