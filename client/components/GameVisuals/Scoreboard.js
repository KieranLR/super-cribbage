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

        const bg = scene.add.rectangle(0, 0, 300, 100, 0x000000, 0.5)
            .setStrokeStyle(2, 0xffffff, 0.8);
        this.add(bg);

        this.updateScores();
        scene.add.existing(this);
    }

    updateScores() {
        this.scoreLabels.forEach(label => label.destroy());
        this.scoreLabels = [];

        this.players.forEach((player, index) => {
            const posY = (index * 40) - 20;
            const dealerMark = player.isDealer ? ' (D)' : '';
            const text = this.scene.add.text(-130, posY, `${player.name}: ${player.score}${dealerMark}`, {
                fontSize: '24px',
                color: '#ffffff',
                fontStyle: 'bold'
            });
            this.add(text);
            this.scoreLabels.push(text);
        });
    }
}