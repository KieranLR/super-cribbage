import { Scene } from 'phaser';
import {createMenuButton} from "../ui/buttons/menuButton.js";
import { BackgroundVisual } from '../components/GameVisuals/BackgroundVisual.js';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        const {width, height} = this.scale;

        // Background
        this.bg = new BackgroundVisual(this);

        // Title
        const titleY = height * 0.22;
        const title = this.add.text(width * 0.5, titleY + 100, 'Super Gribbage', {
            fontFamily: 'Arial Black',
            fontSize: '64px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 10,
            align: 'center'
        })
            .setOrigin(0.5)
            .setShadow(2, 2, '#333333', 2, true, true);

        // Menu items
        const menuItems = [
            createMenuButton(this, 'Start Easy Bot Game', () => {
                this.scene.start('Game');
            }),
            createMenuButton(this, 'How to Play', () => {
                this.scene.start('HowToPlay');
            }),
            createMenuButton(this, 'Settings', () => {
                this.scene.start('Settings');
            }),
            createMenuButton(this, 'Test Visuals', () => {
                this.scene.start('TestListScene');
            }),
        ];

        const updateMenuLayout = () => {
            const { width, height } = this.scale;
            const startY = height * 0.45;
            const spacing = 80;

            menuItems.forEach((item, index) => {
                item.setPosition(width / 2, startY + index * spacing);
            });
        };

        updateMenuLayout();
        
        // Handle Resizing
        this.scale.on('resize', (gameSize) => {
            if (!this.scene.isActive()) return;

            const { width, height } = gameSize;
            if (this.bg) {
                this.bg.resize(width, height);
            }
            
            // Re-center title and menu
            const titleY = height * 0.22;
            title.setPosition(width * 0.5, titleY + 100);
            
            updateMenuLayout();
        });
    }
}