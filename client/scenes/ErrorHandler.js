import { Scene } from 'phaser';

export class ErrorHandler extends Scene {
    constructor() {
        super({ key: 'ErrorHandler', active: false });
    }

    init(data) {
        this.errorMessage = data ? (data.error || 'An unexpected error occurred.') : 'An unexpected error occurred.';
    }

    create() {
        const { width, height } = this.scale;

        // Force a high depth on the whole scene system if possible, but at least on the scene
        this.scene.bringToTop();
        this.scene.setVisible(true);

        // Semi-transparent background overlay
        this.add.rectangle(0, 0, width, height, 0x000000, 0.7)
            .setOrigin(0, 0)
            .setDepth(9998);

        const dialogWidth = Math.min(600, width * 0.9);
        const dialogHeight = 250; // Approximated, layout was automatic

        // Add a shadow rectangle behind the dialog
        const shadow = this.add.rectangle(width / 2 + 10, height / 2 + 10, dialogWidth, dialogHeight, 0x000000, 0.5)
            .setDepth(9999);

        // Background for the dialog
        const background = this.add.rectangle(width / 2, height / 2, dialogWidth, dialogHeight, 0x333333)
            .setStrokeStyle(2, 0xff0000)
            .setDepth(10000);

        // Title background
        const titleBackground = this.add.rectangle(width / 2, height / 2 - dialogHeight / 2 + 20, dialogWidth, 40, 0xaa0000)
            .setDepth(10001);

        // Title text
        const titleText = this.add.text(width / 2, height / 2 - dialogHeight / 2 + 20, 'Game Error', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(10002);

        // Content text
        const contentText = this.add.text(width / 2, height / 2 - 10, this.errorMessage, {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: dialogWidth - 40 }
        }).setOrigin(0.5).setDepth(10001);

        // Button
        const button = this.createButton('Return to Main Menu')
            .setPosition(width / 2, height / 2 + dialogHeight / 2 - 40);

        const updateLayout = () => {
            const { width, height } = this.scale;
            const dialogWidth = Math.min(600, width * 0.9);
            // Height should be based on content, but for error handler we can keep it fixed or calculated
            const dialogHeight = contentText.height + 150;

            shadow.setPosition(width / 2 + 10, height / 2 + 10).setSize(dialogWidth, dialogHeight);
            background.setPosition(width / 2, height / 2).setSize(dialogWidth, dialogHeight);
            titleBackground.setPosition(width / 2, height / 2 - dialogHeight / 2 + 20).setSize(dialogWidth, 40);
            titleText.setPosition(width / 2, height / 2 - dialogHeight / 2 + 20);
            contentText.setPosition(width / 2, height / 2 - 10).setWordWrapWidth(dialogWidth - 40);
            button.setPosition(width / 2, height / 2 + dialogHeight / 2 - 40);
        };

        updateLayout();

        // Handle Resizing
        this.scale.on('resize', (gameSize) => {
            if (!this.scene.isActive()) return;
            updateLayout();
        });

        this.initializeGameLoopRecovery();
    }

    createButton(text) {
        const width = 250;
        const height = 40;
        const background = this.add.rectangle(0, 0, width, height, 0x666666).setStrokeStyle(2, 0xffffff);
        const label = this.add.text(0, 0, text, {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);

        const container = this.add.container(0, 0, [background, label]).setDepth(10001);
        container.setSize(width, height);
        container.setInteractive({ useHandCursor: true });

        container.on('pointerover', () => {
            background.setFillStyle(0x888888);
            background.setStrokeStyle(3, 0xff0000);
            container.setScale(1.05);
        });

        container.on('pointerout', () => {
            background.setFillStyle(0x666666);
            background.setStrokeStyle(2, 0xffffff);
            container.setScale(1);
        });

        container.on('pointerdown', () => {
            container.setScale(0.95);
        });

        container.on('pointerup', () => {
            container.setScale(1.05);
            const sceneManager = this.scene.manager;
            const allScenes = sceneManager.getScenes(false);
            allScenes.forEach(scene => {
                const key = scene.scene.key;
                if (key !== 'ErrorHandler' && key !== 'MainMenu' && key !== 'DebugOverlay') {
                    console.log('Stopping and removing scene:', key);

                    // Advice from wiki: Properly shutdown the broken scene first
                    try {
                        if (scene.sys && typeof scene.sys.shutdown === 'function') {
                            scene.sys.shutdown();
                        }
                    } catch (shutdownErr) {
                        console.error(`Error during shutdown of ${key}:`, shutdownErr);
                    }

                    this.scene.stop(key);

                    // Advice from wiki: Destroy the broken scene completely
                    try {
                        console.log('Removing scene:', key);
                        // this.scene.remove(key);
                    } catch (removeErr) {
                        console.error(`Error during removal of ${key}:`, removeErr);
                    }
                } else if (key !== 'ErrorHandler') {
                    // Just stop critical one, don't remove
                    console.log('Stopping critical scene:', key);
                    this.scene.stop(key);
                }
            });

            this.scene.start('MainMenu');
        });
        return container;
    }

    initializeGameLoopRecovery() {
        this.game.loop.stop();
        this.game.loop.start(this.game.step.bind(this.game));
    }
}
