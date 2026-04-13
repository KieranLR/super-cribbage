import { TableLayout } from '../../utils/TableLayout.js';
export class Scoreboard extends Phaser.GameObjects.Container {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     * @param {import('../../../game/Player.js').Player[]} players
     * @param {Object} config
     */
    constructor(scene, x, y, players, config) {
        super(scene, x, y);
        this.players = players;
        this.scoreLabels = [];
        this.config = config || TableLayout.REL.SCOREBOARD;

        const bg = scene.add.rectangle(0, 0, this.config.WIDTH, this.config.HEIGHT, 0x000000, 0.5)
            .setStrokeStyle(2, 0xffffff, 0.8);
        this.add(bg);

        this.updateScores();
        scene.add.existing(this);
    }

    updateScores() {
        if (!this.scoreLabels) return;
        this.scoreLabels.forEach(label => label.destroy());
        this.scoreLabels = [];

        const config = this.config;
        
        // Update BG size
        if (this.list && this.list[0] instanceof Phaser.GameObjects.Rectangle) {
             this.list[0].setSize(config.WIDTH, config.HEIGHT);
        }

        this.players.forEach((player, index) => {
            const posY = (index * config.ROW_SPACING) + config.ROW_Y_START;
            const dealerMark = player.isDealer ? ' (D)' : '';
            const text = this.scene.add.text(config.TEXT_X_OFFSET, posY, `${player.name}: ${player.score}${dealerMark}`, {
                fontSize: config.WIDTH < 200 ? '18px' : '24px',
                color: '#ffffff',
                fontStyle: 'bold'
            });
            this.add(text);
            this.scoreLabels.push(text);
        });
    }
}