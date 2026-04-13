export class BackgroundVisual {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} alpha
     */
    constructor(scene, alpha = 1) {
        const { width, height } = scene.scale;
        
        this.scene = scene;
        this.bg = scene.add.tileSprite(width / 2, height / 2, width, height, 'background');
        this.bg.setScrollFactor(0);
        this.bg.setAlpha(alpha);

        // Update loop for background movement
        this.scene.events.on('update', this.update, this);
        this.scene.events.once('shutdown', this.destroy, this);
    }

    update() {
        if (this.bg && this.bg.active) {
            this.bg.tilePositionX -= 0.5;
            this.bg.tilePositionY -= 0.5;
        }
    }

    /**
     * Resizes the background to match new dimensions.
     * @param {number} width 
     * @param {number} height 
     */
    resize(width, height) {
        if (this.bg && this.bg.active) {
            this.bg.setSize(width, height);
            this.bg.setPosition(width / 2, height / 2);
        }
    }

    destroy() {
        if (this.scene) {
            this.scene.events.off('update', this.update, this);
        }
        if (this.bg) {
            this.bg.destroy();
        }
    }
}
