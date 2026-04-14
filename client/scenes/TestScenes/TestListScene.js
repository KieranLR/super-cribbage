import { Scene } from 'phaser';
import { createMenuButton } from "../../ui/buttons/menuButton.js";
import { TableLayout } from '../../utils/TableLayout.js';
import { ScrollComponent } from '../../utils/ScrollComponent.js';

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
            // { name: 'Deck Visual', scene: 'TestDeckScene' },
            { name: 'Scoring End Animation', scene: 'TestScoringScene' },
            { name: 'Error Handler', scene: 'TestErrorScene' }
        ];

        this.menuItems = [];
        this.menuContainer = this.add.container(0, 0);

        testOptions.forEach(opt => {
            const btn = createMenuButton(this, opt.name, () => {
                this.scene.start(opt.scene);
            });
            this.menuItems.push(btn);
            this.menuContainer.add(btn);
        });

        const backBtn = createMenuButton(this, 'Back to Main Menu', () => {
            this.scene.start('MainMenu');
        });
        this.menuItems.push(backBtn);
        this.menuContainer.add(backBtn);

        this.scroller = new ScrollComponent(this, this.menuContainer, { padding: 10 });

        const updateMenuLayout = () => {
            const { width, height } = this.scale;
            const startY = height * 0.3;
            const itemSpacingY = 75;
            const itemSpacingX = 450; // Width of menuButton is 420 by default

            let totalContentHeight = 0;

            this.menuItems.forEach((item, index) => {
                const isTwoColumn = this.menuItems.length > 8 && width > 950; // Switch to two columns if many items AND enough width
                
                let itemX, itemY;
                if (isTwoColumn && index < this.menuItems.length - 1) { 
                    const col = index % 2;
                    const row = Math.floor(index / 2);
                    itemX = width / 2 + (col - 0.5) * itemSpacingX;
                    itemY = startY + row * itemSpacingY;
                } else if (isTwoColumn && index === this.menuItems.length - 1) {
                    // Center the last 'Back' button below the two columns
                    const lastRow = Math.ceil((this.menuItems.length - 1) / 2);
                    itemX = width / 2;
                    itemY = startY + lastRow * itemSpacingY;
                } else {
                    // Center single column
                    itemX = width / 2;
                    itemY = startY + index * itemSpacingY;
                }

                item.setPosition(itemX, itemY);

                // Adjust scale if there are too many items
                let scale = 1;
                const totalRows = isTwoColumn ? Math.ceil((this.menuItems.length - 1) / 2) + 1 : this.menuItems.length;
                
                if (width < 500) {
                    scale = Math.min(scale, width / 500);
                }

                // If content is still going to be too tall even with width scaling, 
                // we don't necessarily need to scale down more since we have scrolling now,
                // but a little bit of scaling helps visibility.
                if (totalRows * itemSpacingY * scale > height * 1.5) {
                    scale *= 0.8;
                }
                
                item.baseScale = scale;
                item.setScale(scale);

                totalContentHeight = Math.max(totalContentHeight, itemY + (itemSpacingY * scale / 2));
            });

            this.scroller.updateLayout(totalContentHeight + 50, height);
        };

        updateMenuLayout();

        this.events.on('shutdown', () => {
            this.scroller.destroy();
        });

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
