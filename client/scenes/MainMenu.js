import { Scene } from 'phaser';
import {createMenuButton} from "../ui/buttons/menuButton.js";

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        const {width, height} = this.scale;

        // Background
        const bg = this.add.image(width / 2, height / 2, 'background');
        const scale = Math.max(
            width / bg.width + 0.2,
            height / bg.height + 0.2
        );
        bg.setScale(scale).setScrollFactor(0);

        // Title
        const titleY = height * 0.22;

        this.add.image(width * 0.5, titleY, 'logo').setScale(0.8);

        this.add.text(width * 0.5, titleY + 100, 'Super Cribbage', {
            fontFamily: 'Arial Black',
            fontSize: '64px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 10,
            align: 'center'
        })
            .setOrigin(0.5)
            .setShadow(2, 2, '#333333', 2, true, true);

        // Vertical Menu Layout (RexUI)
        const menu = this.rexUI.add.sizer({
            x: width / 2,
            y: height * 0.55,
            orientation: 'y',
            space: {
                item: 20
            }
        });

        menu.add(createMenuButton(this, 'Start Game', () => {
            this.scene.start('Game');
        }));

        menu.add(createMenuButton(this, 'Join Game', () => {
            console.log('Join Game');
        }));

        menu.add(createMenuButton(this, 'How to Play', () => {
            this.scene.start('HowToPlay');
        }));

        menu.add(createMenuButton(this, 'Settings', () => {
            console.log('Settings');
        }));

        menu.add(createMenuButton(this, 'Test Visuals', () => {
            this.scene.start('TestListScene');
        }));

        menu.layout();
    }
}