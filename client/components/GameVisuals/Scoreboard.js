import { TableLayout } from '../../utils/TableLayout.js';
export class Scoreboard extends Phaser.GameObjects.Container {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     * @param {import('../../../game/Player.js').Player[]} players
     */
    constructor(scene, x, y, players) {
        super(scene, x, y);
        this.players = players;
        this.scoreLabels = [];

        const config = TableLayout.REL.SCOREBOARD;
        const bg = scene.add.rectangle(0, 0, config.WIDTH, config.HEIGHT, 0x000000, 0.5)
            .setStrokeStyle(2, 0xffffff, 0.8);
        this.add(bg);

        this.updateScores();
        scene.add.existing(this);
    }

    updateScores() {
        this.scoreLabels.forEach(label => label.destroy());
        this.scoreLabels = [];

        const config = TableLayout.REL.SCOREBOARD;
        this.players.forEach((player, index) => {
            const posY = (index * config.ROW_SPACING) + config.ROW_Y_START;
            const dealerMark = player.isDealer ? ' (D)' : '';
            const text = this.scene.add.text(config.TEXT_X_OFFSET, posY, `${player.name}: ${player.score}${dealerMark}`, {
                fontSize: '24px',
                color: '#ffffff',
                fontStyle: 'bold'
            });
            this.add(text);
            this.scoreLabels.push(text);
        });
    }
}