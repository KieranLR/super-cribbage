import { Scene } from 'phaser';
import { settingsManager } from '../utils/SettingsManager.js';

export class FPSOverlay extends Scene {
    constructor() {
        super('FPSOverlay');
    }

    create() {
        const { width } = this.scale;
        
        this.fpsText = this.add.text(width - 10, 10, 'FPS: 0', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 5, y: 2 }
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(10000);

        this.updateVisibility();

        this.scale.on('resize', (gameSize) => {
            this.fpsText.setPosition(gameSize.width - 10, 10);
        });
    }

    updateVisibility() {
        const showFPS = settingsManager.get('showFPS');
        this.fpsText.setVisible(showFPS);
    }

    update() {
        if (this.fpsText.visible) {
            this.fpsText.setText(`FPS: ${Math.round(this.game.loop.actualFps)}`);
        }
    }
}
