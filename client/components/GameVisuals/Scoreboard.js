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
        this.config = config;

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
            const textColor = player.id === 'human' ? '#add8e6' : '#ff4d4d'; // Light blue and light red
            
            let fontSize = '24px';
            if (config.WIDTH < 180) {
                fontSize = '16px';
            } else if (config.WIDTH < 200) {
                fontSize = '18px';
            }

            const text = this.scene.add.text(0, posY, `${player.name}: ${player.score}${dealerMark}`, {
                fontSize: fontSize,
                color: textColor,
                fontStyle: 'bold'
            }).setOrigin(0.5, 0.5);
            this.add(text);
            this.scoreLabels.push(text);
        });
    }
}