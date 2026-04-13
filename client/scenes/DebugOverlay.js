import { Scene } from 'phaser';
import { settingsManager } from '../utils/SettingsManager.js';
import { TableLayout } from '../utils/TableLayout.js';

export class DebugOverlay extends Scene {
    constructor() {
        super({ key: 'DebugOverlay' });
    }

    create() {
        const { width } = this.scale;
        
        // Initialize layout to detect current screen size category
        this.layout = new TableLayout(this.scale);

        this.debugText = this.add.text(width - 10, 10, '', {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#00ff00',
            backgroundColor: '#00000088',
            padding: { x: 4, y: 2 },
            align: 'right'
        }).setOrigin(1, 0).setDepth(1000).setScrollFactor(0);

        // Check initial state
        this.updateVisibility();

        // Listen for resize
        this.scale.on('resize', (gameSize) => {
            this.debugText.setX(gameSize.width - 10);
            this.layout.refresh();
        });
    }

    update() {
        // We update visibility every frame or on a timer? 
        // Better to update visibility when settings change, but since we don't have an event system for settings yet, 
        // we can check it periodically or every update. Checking every update is cheap.
        this.updateVisibility();

        if (this.debugText.visible) {
            const fps = Math.round(this.game.loop.actualFps);
            const layout = this.layout.size;
            const height = Math.round(this.scale.height);
            const isSmallHeight = height < 500 ? ' (SmallHeight)' : '';
            this.debugText.setText(`FPS: ${fps}\nLayout: ${layout}${isSmallHeight}\nH: ${height}`);
        }
    }

    updateVisibility() {
        const showFPS = settingsManager.get('showFPS');
        if (this.debugText.visible !== showFPS) {
            this.debugText.setVisible(showFPS);
        }
    }
}
