import { Scene } from 'phaser';
import { createMenuButton } from "../../ui/buttons/menuButton.js";
import { TableLayout } from '../../utils/TableLayout.js';

export class TestListScene extends Scene {
    constructor() {
        super('TestListScene');
    }

    create() {
        this.layout = new TableLayout(this.scale);
        const { width, height } = this.scale;

        // Background
        this.bg = this.add.image(width / 2, height / 2, 'background');
        this.updateBgScale();
        this.bg.setScrollFactor(0);

        this.title = this.add.text(width * 0.5, 100, 'Test Visuals', {
            fontFamily: 'Arial Black',
            fontSize: '48px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5);

        const testOptions = [
            { name: 'Card Visuals', scene: 'TestCardScene' },
            { name: 'Hand Visuals', scene: 'TestHandScene' },
            { name: 'Crib Visuals', scene: 'TestCribScene' },
            { name: 'Pegging Area', scene: 'TestPeggingScene' },
            { name: 'Pegging Logic', scene: 'TestPeggingSceneComplex' },
            { name: 'Starter Card', scene: 'TestStarterScene' },
            { name: 'Button Interaction', scene: 'TestButtonScene' },
            { name: 'Game Over Screen', scene: 'TestGameOverScene' },
            { name: 'Starting Cut Tie', scene: 'TestStartingCutTieScene' },
            { name: 'Deck Visual', scene: 'TestDeckScene' },
            { name: 'Scoring End Animation', scene: 'TestScoringScene' },
            { name: 'Trigger Error', scene: 'TestErrorScene' }
        ];

        this.menuItems = [];

        testOptions.forEach(opt => {
            const btn = createMenuButton(this, opt.name, () => {
                this.scene.start(opt.scene);
            });
            this.menuItems.push(btn);
        });

        const backBtn = createMenuButton(this, 'Back to Main Menu', () => {
            this.scene.start('MainMenu');
        });
        this.menuItems.push(backBtn);

        const updateMenuLayout = () => {
            const { width, height } = this.scale;
            const startY = height * 0.3;
            const spacing = 70;

            this.menuItems.forEach((item, index) => {
                item.setPosition(width / 2, startY + index * spacing);
                // Adjust scale if there are too many items
                if (this.menuItems.length * spacing > height * 0.7) {
                    item.setScale(0.8);
                }
            });
        };

        updateMenuLayout();

        // Handle Resizing
        this.scale.on('resize', (gameSize) => {
            if (!this.scene.isActive()) return;

            const { width, height } = gameSize;

            this.bg.setPosition(width / 2, height / 2);
            this.updateBgScale();

            this.title.setPosition(width * 0.5, 100);

            updateMenuLayout();
        });
    }

    updateBgScale() {
        if (!this.bg) return;
        const { width, height } = this.scale;
        const scale = Math.max(width / this.bg.width + 0.2, height / this.bg.height + 0.2);
        this.bg.setScale(scale);
    }
}
