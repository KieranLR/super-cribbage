import { Scene } from 'phaser';
import { BackgroundVisual } from '../components/GameVisuals/BackgroundVisual.js';

export class GameOver extends Scene
{
    constructor ()
    {
        super('GameOver');
    }

    create ()
    {
        const { width, height } = this.scale;

        // Background
        this.bg = new BackgroundVisual(this);

        const title = this.add.text(width * 0.5, 384, 'Game Over', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {

            this.scene.start('MainMenu');

        });

        this.scale.on('resize', (gameSize) => {
            if (!this.scene.isActive()) return;
            const { width, height } = gameSize;
            this.bg.resize(width, height);
            title.setPosition(width * 0.5, 384);
        });
    }

}