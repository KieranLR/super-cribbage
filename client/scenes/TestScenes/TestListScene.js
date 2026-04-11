import { Scene } from 'phaser';
import { createMenuButton } from "../../ui/buttons/menuButton.js";

export class TestListScene extends Scene {
    constructor() {
        super('TestListScene');
    }

    create() {
        const { width, height } = this.scale;

        // Background
        const bg = this.add.image(width / 2, height / 2, 'background');
        const scale = Math.max(width / bg.width + 0.2, height / bg.height + 0.2);
        bg.setScale(scale).setScrollFactor(0);

        this.add.text(width * 0.5, 100, 'Test Visuals', {
            fontFamily: 'Arial Black',
            fontSize: '48px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5);

        const menu = this.rexUI.add.sizer({
            x: width / 2,
            y: height * 0.5,
            orientation: 'y',
            space: { item: 20 }
        });

        const testOptions = [
            { name: 'Card Visuals', scene: 'TestCardScene' },
            { name: 'Hand Visuals', scene: 'TestHandScene' },
            { name: 'Crib Visuals', scene: 'TestCribScene' },
            { name: 'Pegging Area', scene: 'TestPeggingScene' },
            { name: 'Pegging Logic', scene: 'TestPeggingSceneComplex' },
            { name: 'Starter Card', scene: 'TestStarterScene' },
            { name: 'Button Interaction', scene: 'TestButtonScene' },
            { name: 'Game Over Screen', scene: 'TestGameOverScene' },
            { name: 'Starting Cut Tie', scene: 'TestStartingCutTieScene' }
        ];

        testOptions.forEach(opt => {
            menu.add(createMenuButton(this, opt.name, () => {
                this.scene.start(opt.scene);
            }), { expand: true });
        });

        menu.add(createMenuButton(this, 'Back to Main Menu', () => {
            this.scene.start('MainMenu');
        }), { expand: true });

        menu.layout();
    }
}
