import { Scoreboard } from './Scoreboard.js';
import { createMenuButton } from '../../ui/buttons/menuButton.js';

export class TopBarVisual extends Phaser.GameObjects.Container {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     * @param {import('../../../game/Player.js').Player[]} players
     * @param {Object} config
     * @param {Function} onMenuClicked
     */
    constructor(scene, x, y, players, config, onMenuClicked) {
        super(scene, x, y);
        this.config = config;

        // Background
        this.bg = scene.add.rectangle(0, 0, config.WIDTH, config.HEIGHT, 0x000000, 0.7)
            .setOrigin(0.5, 0);
        this.add(this.bg);

        // Scoreboard (positioned within TopBar)
        this.scoreboard = new Scoreboard(scene, config.SCOREBOARD_X, config.SCOREBOARD_Y, players, config.SCOREBOARD);
        this.add(this.scoreboard);

        // Menu Button (positioned within TopBar)
        this.menuButton = createMenuButton(scene, 'Main Menu', onMenuClicked, {
            width: config.MENU_BUTTON_WIDTH,
            height: config.MENU_BUTTON_HEIGHT,
            fontSize: config.MENU_BUTTON_FONT_SIZE
        });
        this.menuButton.setPosition(config.MENU_BUTTON_X, config.MENU_BUTTON_Y);
        this.add(this.menuButton);

        scene.add.existing(this);
    }

    updateConfig(config) {
        this.config = config;
        this.bg.setSize(config.WIDTH, config.HEIGHT);
        
        this.scoreboard.setPosition(config.SCOREBOARD_X, config.SCOREBOARD_Y);
        this.scoreboard.config = config.SCOREBOARD;
        this.scoreboard.updateScores();

        this.menuButton.setPosition(config.MENU_BUTTON_X, config.MENU_BUTTON_Y);
        this.menuButton.updateSize(config.MENU_BUTTON_WIDTH, config.MENU_BUTTON_HEIGHT);
    }

    updateScores() {
        this.scoreboard.updateScores();
    }
}
