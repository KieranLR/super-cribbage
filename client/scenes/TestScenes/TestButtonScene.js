import { Scene } from 'phaser';
import { ActionButtons } from '../../components/GameVisuals/ActionButtons.js';
import {createMenuButton} from "../../ui/buttons/menuButton.js";

export class TestButtonScene extends Scene {
    constructor() {
        super('TestButtonScene');
    }

    create() {
        const { width, height } = this.scale;

        // Background
        const bg = this.add.image(width / 2, height / 2, 'background');
        const scale = Math.max(width / bg.width + 0.2, height / bg.height + 0.2);
        bg.setScale(scale).setScrollFactor(0);

        this.add.text(width * 0.5, 100, 'Test Button Interaction', {
            fontFamily: 'Arial Black',
            fontSize: '48px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5);

        this.statusText = this.add.text(width / 2, height / 2 + 100, 'Click the button below', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Action Buttons Container
        this.actionButtons = new ActionButtons(this, width / 2, height - 200);

        // Testing Discard Button logic
        this.add.text(width / 2, height / 2 - 100, 'Toggle "Confirm Discard" button', {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);

        let count = 0;
        this.input.on('pointerdown', (pointer) => {
             // Only if we are not clicking the button itself
             // This is just to simulate the card selection logic
             if (pointer.y < height - 300) {
                 count = (count + 1) % 3;
                 this.updateButton(count);
             }
        });

        this.updateButton(0);

        // Back button
        const backBtn = this.add.text(100, 50, 'Back', { fontSize: '24px', color: '#ffffff' })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.scene.start('TestListScene'));
    }

    updateButton(count) {
        if (count === 2) {
            console.log('Adding/Showing button');
            this.actionButtons.addButton('discard', 'Confirm Discard', () => {
                console.log('Button clicked!');
                this.statusText.setText('Button clicked at ' + new Date().toLocaleTimeString());
            });
        } else {
            console.log('Hiding button');
            this.actionButtons.hideButton('discard');
        }
    }
}
