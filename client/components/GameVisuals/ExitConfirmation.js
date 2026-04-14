import { createMenuButton } from '../../ui/buttons/menuButton.js';

export class ExitConfirmation {
    constructor(scene, onExitCallback) {
        this.scene = scene;
        this.onExitCallback = onExitCallback;
        this.container = null;
        this.exitButton = null;
        this.setup();
    }

    setup() {
        const { width, height } = this.scene.scale;

        // The button that triggers the confirmation
        this.exitButton = createMenuButton(
            this.scene,
            'Main Menu',
            () => this.show(),
            {
                width: 150, // Default, will be updated by applyConfig
                height: 40,
                fontSize: '22px'
            }
        );
        this.exitButton.setDepth(1000);

        // The confirmation overlay container
        this.container = this.scene.add.container(width / 2, height / 2);
        this.container.setDepth(2000);
        this.container.setVisible(false);

        const overlay = this.scene.add.rectangle(
            0,
            0,
            width,
            height,
            0x000000,
            0.7
        ).setInteractive();

        const bg = this.scene.add.rectangle(0, 0, 500, 300, 0x222222, 1)
            .setStrokeStyle(4, 0xffffff);

        const warningText = this.scene.add.text(
            0,
            -60,
            'Return to Main Menu?\n\nYour current game will not be saved.',
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff',
                align: 'center',
                wordWrap: { width: 450 }
            }
        ).setOrigin(0.5);

        const yesBtn = createMenuButton(this.scene, 'Yes, Exit', () => {
            if (this.onExitCallback) {
                this.onExitCallback();
            } else {
                this.scene.scene.start('MainMenu');
            }
        }, { width: 200, height: 50, fontSize: '20px' });
        yesBtn.setPosition(-110, 80);

        const noBtn = createMenuButton(this.scene, 'No, Stay', () => {
            this.hide();
        }, { width: 200, height: 50, fontSize: '20px' });
        noBtn.setPosition(110, 80);

        this.container.add([overlay, bg, warningText, yesBtn, noBtn]);
    }

    setPosition(x, y) {
        this.exitButton.setPosition(x, y);
    }

    updateConfig(config) {
        if (!config) return;
        // If createMenuButton supports resizing, we'd do it here. 
        // For now, we just update position since CribbageGameView was doing that.
    }

    show() {
        this.container.setVisible(true);
    }

    hide() {
        this.container.setVisible(false);
    }

    resize(width, height) {
        this.container.setPosition(width / 2, height / 2);
        const overlay = this.container.getAt(0);
        if (overlay instanceof Phaser.GameObjects.Rectangle) {
            overlay.setSize(width, height);
        }
    }

    setVisible(visible) {
        this.exitButton.setVisible(visible);
    }
}
