import { describe, test, expect } from 'vitest';
import * as Phaser from 'phaser';
import { Boot } from '../../scenes/Boot.js';
import { Preloader } from '../../scenes/Preloader.js';
import { MainMenu } from '../../scenes/MainMenu.js';
import { Settings } from '../../scenes/Settings.js';
import { HowToPlay } from '../../scenes/HowToPlay.js';
import { DebugOverlay } from '../../scenes/DebugOverlay.js';

function createGame() {
    return new Promise((resolve) => {
        const config = {
            type: Phaser.HEADLESS,
            width: 1280,
            height: 720,
            scene: [Boot, Preloader, MainMenu, Settings, HowToPlay, DebugOverlay],
            callbacks: {
                postBoot: (game) => {
                    resolve(game);
                }
            }
        };
        new Phaser.Game(config);
    });
}

function waitForScene(game, sceneKey, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        const check = () => {
            const scene = game.scene.getScene(sceneKey);
            if (scene && game.scene.isActive(sceneKey)) {
                // Also wait for the 'create' method to finish if needed, 
                // but isActive usually means it's running.
                resolve(scene);
            } else if (Date.now() - start > timeout) {
                reject(new Error(`Timeout waiting for scene ${sceneKey}`));
            } else {
                setTimeout(check, 100);
            }
        };
        check();
    });
}

describe('Main Menu Navigation', () => {
    test('should navigate to Main Menu from Boot', async () => {
        const game = await createGame();
        try {
            const mainMenu = await waitForScene(game, 'MainMenu');
            expect(mainMenu).toBeDefined();
            expect(game.scene.isActive('MainMenu')).toBe(true);

            // Check if title exists
            const title = mainMenu.children.list.find(child => 
                child instanceof Phaser.GameObjects.Text && child.text === 'Super Cribbage'
            );
            expect(title).toBeDefined();
            expect(title.text).toBe('Super Cribbage');
        } finally {
            game.destroy(true);
        }
    });

    test('should navigate from Main Menu to Settings', async () => {
        const game = await createGame();
        try {
            const mainMenu = await waitForScene(game, 'MainMenu');
            
            // Find Settings button
            // In MainMenu.js, menu buttons are added to menuContainer
            const settingsButton = mainMenu.menuContainer.list.find(child => {
                const textChild = child.list?.find(c => c instanceof Phaser.GameObjects.Text);
                return textChild && textChild.text === 'Settings';
            });

            expect(settingsButton).toBeDefined();

            // Simulate click on Settings button
            settingsButton.emit('pointerup');

            // Wait for Settings scene
            const settingsScene = await waitForScene(game, 'Settings');
            expect(settingsScene).toBeDefined();
            expect(game.scene.isActive('Settings')).toBe(true);
            expect(game.scene.isActive('MainMenu')).toBe(false);

            // Check if Settings title exists
            const settingsTitle = settingsScene.children.list.find(child =>
                child instanceof Phaser.GameObjects.Text && child.text === 'Settings'
            );
            expect(settingsTitle).toBeDefined();
        } finally {
            game.destroy(true);
        }
    });

    test('should navigate from Main Menu to How To Play', async () => {
        const game = await createGame();
        try {
            const mainMenu = await waitForScene(game, 'MainMenu');
            
            // Find How to Play button
            const howToPlayButton = mainMenu.menuContainer.list.find(child => {
                const textChild = child.list?.find(c => c instanceof Phaser.GameObjects.Text);
                return textChild && textChild.text === 'How to Play';
            });

            expect(howToPlayButton).toBeDefined();

            // Simulate click
            howToPlayButton.emit('pointerup');

            // Wait for HowToPlay scene
            const htpScene = await waitForScene(game, 'HowToPlay');
            expect(htpScene).toBeDefined();
            expect(game.scene.isActive('HowToPlay')).toBe(true);

            // Check if it has a title (The HowToPlay scene might have different structure, 
            // but usually it has a title text in the first slide)
            // Looking at HowToPlay.js, it seems it might use slides.
        } finally {
            game.destroy(true);
        }
    });
});
