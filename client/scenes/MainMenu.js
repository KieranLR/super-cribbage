import { Scene } from 'phaser';
import {createMenuButton} from "../ui/buttons/menuButton.js";
import { BackgroundVisual } from '../components/GameVisuals/BackgroundVisual.js';
import { ScrollComponent } from '../utils/ScrollComponent.js';

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
        const title = this.add.text(width * 0.5, titleY + 100, 'Super Cribbage', {
            fontFamily: 'Arial Black',
            fontSize: '64px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 10,
            align: 'center'
        })
            .setOrigin(0.5)
            .setShadow(2, 2, '#333333', 2, true, true);

        // Register for Layout Editor (Step 6)
        if (this.registry && this.registry.get('isEditor')) {
            // we could use this flag if we set it in createPreviewGame
        }
        
        // Let's just try to import and use it if it's available
        import('../editor/preview/InspectableRegistry').then(({ inspectableRegistry }) => {
            inspectableRegistry.register({
                id: 'mainMenuTitle',
                label: 'Main Menu Title',
                type: 'text',
                gameObject: title,
                editableLayoutKey: 'mainMenuTitle'
            });
        }).catch(() => {
            // Not in editor mode or file doesn't exist (production)
        });

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

        this.menuContainer = this.add.container(0, 0);
        menuItems.forEach(item => this.menuContainer.add(item));

        this.scroller = new ScrollComponent(this, this.menuContainer);

        const updateMenuLayout = () => {
            const { width, height } = this.scale;
            const isSmall = width < 600 || height < 600;
            
            const startY = height * (isSmall ? 0.3 : 0.45);
            const spacing = isSmall ? 65 : 80;

            let totalContentHeight = 0;

            menuItems.forEach((item, index) => {
                let scale = 1;
                if (width < 500 || height < 600) {
                    scale = Math.min(0.8, Math.max(0.5, width / 600));
                }
                item.baseScale = scale;
                item.setScale(scale);
                const itemY = startY + index * spacing * scale;
                item.setPosition(width / 2, itemY);

                totalContentHeight = Math.max(totalContentHeight, itemY + (spacing * scale / 2));
            });

            this.scroller.updateLayout(totalContentHeight + 50, height);
            
            // Adjust title for small screens
            if (isSmall) {
                title.setFontSize('42px');
                // title.setStrokeThickness(6);
                title.setPosition(width * 0.5, height * 0.15);
            } else {
                title.setFontSize('64px');
                // title.setStrokeThickness(10);
                title.setPosition(width * 0.5, height * 0.22 + 100);
            }
        };

        updateMenuLayout();
        
        this.events.on('shutdown', () => {
            this.scroller.destroy();
            // Clear from editor registry
            import('../editor/preview/InspectableRegistry').then(({ inspectableRegistry }) => {
                inspectableRegistry.unregister('mainMenuTitle');
            }).catch(() => {});
        });

        // Handle Resizing
        this.scale.on('resize', (gameSize) => {
            if (!this.scene.isActive()) return;

            const { width, height } = gameSize;
            if (this.bg) {
                this.bg.resize(width, height);
            }
            
            updateMenuLayout();
        });
    }
}