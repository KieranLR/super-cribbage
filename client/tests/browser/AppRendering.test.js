import { describe, test, expect, beforeAll } from 'vitest';
import * as Phaser from 'phaser';
import { Boot } from '../../scenes/Boot.js';
import { Preloader } from '../../scenes/Preloader.js';
import { MainMenu } from '../../scenes/MainMenu.js';
import { MainMenuScene } from '../../editor/scenes/MainMenuScene.js';
import { Settings } from '../../scenes/Settings.js';
import { HowToPlay } from '../../scenes/HowToPlay.js';
import { Game } from '../../scenes/Game.js';
import { GameOver } from '../../scenes/GameOver.js';
import { DebugOverlay } from '../../scenes/DebugOverlay.js';
import { ErrorHandler } from '../../scenes/ErrorHandler.js';
import { initiateDiscordSDK } from '../../utils/discordSdk.js';

function waitForScene(game, sceneKey, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        const check = () => {
            const scene = game.scene.getScene(sceneKey);
            if (scene && game.scene.isActive(sceneKey)) {
                // Let it settle for a frame
                setTimeout(() => resolve(scene), 100);
            } else if (Date.now() - start > timeout) {
                reject(new Error(`Timeout waiting for scene ${sceneKey}`));
            } else {
                setTimeout(check, 100);
            }
        };
        check();
    });
}

describe('App Rendering Test', () => {
    let container;

    beforeAll(async () => {
        // Initialize Discord SDK mock
        await initiateDiscordSDK();
    });

    test('should render the game and reach Main Menu visually', async () => {
        // Create a container for the game
        container = document.createElement('div');
        container.id = 'game-container-render';
        container.style.width = '800px';
        container.style.height = '600px';
        document.body.appendChild(container);

        const config = {
            type: Phaser.AUTO, // Real rendering
            parent: 'game-container-render',
            width: 800,
            height: 600,
            backgroundColor: '#028af8',
            scene: [Boot, Preloader, ErrorHandler, MainMenu, MainMenuScene, HowToPlay, Game, GameOver, Settings, DebugOverlay],
        };

        const game = new Phaser.Game(config);

        try {
            // Wait for MainMenuScene
            const mainMenu = await waitForScene(game, 'MainMenuScene');
            expect(mainMenu).toBeDefined();
            expect(game.scene.isActive('MainMenuScene')).toBe(true);

            // Verify some elements are present in the scene
            const title = mainMenu.children.list.find(child => 
                child instanceof Phaser.GameObjects.Text && child.text === 'Super Cribbage'
            );
            expect(title).toBeDefined();
            expect(title.visible).toBe(true);

            // If running in non-headless mode, we should see the game now.
            if (!import.meta.env.VITEST_BROWSER_HEADLESS) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

        } finally {
            game.destroy(true);
            container.remove();
        }
    });

    test('should navigate to Settings and show the settings panel', async () => {
        container = document.createElement('div');
        container.id = 'game-container-settings-render';
        container.style.width = '800px';
        container.style.height = '600px';
        document.body.appendChild(container);

        const config = {
            type: Phaser.AUTO,
            parent: 'game-container-settings-render',
            width: 800,
            height: 600,
            scene: [Boot, Preloader, ErrorHandler, MainMenu, MainMenuScene, Settings, DebugOverlay],
        };

        const game = new Phaser.Game(config);

        try {
            await waitForScene(game, 'MainMenuScene');
            const mainMenu = game.scene.getScene('MainMenuScene');
            
            const settingsButton = mainMenu.children.getByName("settingsButton");
            const settingsBg = settingsButton.getByName("settingsBg");

            expect(settingsBg).toBeDefined();
            settingsBg.emit('pointerdown');

            const settingsScene = await waitForScene(game, 'Settings');
            expect(settingsScene).toBeDefined();
            
            // Check for "Settings" title
            const settingsTitle = settingsScene.children.list.find(child =>
                child instanceof Phaser.GameObjects.Text && child.text === 'Settings'
            );
            expect(settingsTitle).toBeDefined();
            expect(settingsTitle.visible).toBe(true);

            if (!import.meta.env.VITEST_BROWSER_HEADLESS) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        } finally {
            game.destroy(true);
            container.remove();
        }
    });
});