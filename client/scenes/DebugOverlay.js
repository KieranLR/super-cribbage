import { Scene } from 'phaser';
import { settingsManager } from '../utils/SettingsManager.js';

export class DebugOverlay extends Scene {
    constructor() {
        super({ key: 'DebugOverlay' });
    }

    create() {
        const { width } = this.scale;
        
        this.fpsText = this.add.text(width - 10, 10, '', {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#00ff00',
            backgroundColor: '#00000088',
            padding: { x: 4, y: 2 }
        }).setOrigin(1, 0).setDepth(1000).setScrollFactor(0);

        // Check initial state
        this.updateVisibility();

        // Listen for resize
        this.scale.on('resize', (gameSize) => {
            this.fpsText.setX(gameSize.width - 10);
        });
    }

    update() {
        // We update visibility every frame or on a timer? 
        // Better to update visibility when settings change, but since we don't have an event system for settings yet, 
        // we can check it periodically or every update. Checking every update is cheap.
        this.updateVisibility();

        if (this.fpsText.visible) {
            this.fpsText.setText(`FPS: ${Math.round(this.game.loop.actualFps)}`);
        }
    }

    updateVisibility() {
        const showFPS = settingsManager.get('showFPS');
        if (this.fpsText.visible !== showFPS) {
            this.fpsText.setVisible(showFPS);
        }
    }
}
