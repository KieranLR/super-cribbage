import { initiateDiscordSDK, discordSdk } from './utils/discordSdk';
import { Boot } from './scenes/Boot';
import { ErrorHandler } from './scenes/ErrorHandler';
import { Game } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { Settings } from './scenes/Settings';
import { DebugOverlay } from './scenes/DebugOverlay';
import { MainMenu } from './scenes/MainMenu';
import { HowToPlay } from './scenes/HowToPlay';
import { TestListScene } from './scenes/TestScenes/TestListScene';
import { TestCardScene } from './scenes/TestScenes/TestCardScene';
import { TestHandScene } from './scenes/TestScenes/TestHandScene';
import { TestCribScene } from './scenes/TestScenes/TestCribScene';
import { TestPeggingScene } from './scenes/TestScenes/TestPeggingScene';
import { TestStarterScene } from './scenes/TestScenes/TestStarterScene';
import { TestButtonScene } from './scenes/TestScenes/TestButtonScene';
import { TestPeggingSceneComplex } from './scenes/TestScenes/TestPeggingSceneComplex';
import { TestGameOverScene } from './scenes/TestScenes/TestGameOverScene';
import { TestStartingCutTieScene } from './scenes/TestScenes/TestStartingCutTieScene';
import { TestDeckScene } from './scenes/TestScenes/TestDeckScene';
import { TestScoringScene } from './scenes/TestScenes/TestScoringScene';
import { Preloader } from './scenes/Preloader';
import { TestErrorScene } from './scenes/TestScenes/TestErrorScene';
import TestScene from "./test/TestScene.js";
import CardHoverPrefabScene from "./test/cards/scenes/CardHoverPrefabScene.js";
import MainMenuPrefabScene from "./test/main-menu/scenes/MainMenuPrefabScene.js";

function getCappedDPR() {
    const raw = window.devicePixelRatio || 1;
    const isMobile = window.innerWidth < 800;

    return Math.min(raw, isMobile ? 2 : 1.25);
}

function getScale() {
    // return {
    //     mode: Phaser.Scale.FIT,
    //     autoCenter: Phaser.Scale.CENTER_BOTH,
    //     width: 1280,
    //     height: 720
    // }
    //

    return {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: '100%',
        height: '100%'
    }
}

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.80.0/Phaser.Types.Core.GameConfig
(async () => {
    initiateDiscordSDK();
    // You can use discordSdk to access the Discord SDK and make the requests you need
    console.log(getCappedDPR());

    const config = {
        physics: {
            default: "arcade"
        },
        type: Phaser.AUTO,
        parent: 'game-container',
        backgroundColor: '#028af8',
        resolution: 1,
        scale: getScale(),
        scene: [
            Boot,
            Preloader,
            ErrorHandler,
            MainMenu,
            HowToPlay,
            Game,
            GameOver,
            Settings,
            DebugOverlay,
            TestListScene,
            TestCardScene,
            TestHandScene,
            TestCribScene,
            TestPeggingScene,
            TestStarterScene,
            TestButtonScene,
            TestPeggingSceneComplex,
            TestGameOverScene,
            TestStartingCutTieScene,
            TestDeckScene,
            TestScoringScene,
            TestErrorScene,
            TestScene,
            CardHoverPrefabScene,
            MainMenuPrefabScene
        ]
    };

    const game = new Phaser.Game(config);
    window.addEventListener('error', (event) => {
        handleSceneError(event.error, event.filename);
    });

    window.addEventListener('unhandledrejection', (event) => {
        handleSceneError(event.reason, 'Promise');
    });

    function handleSceneError(error, source) {
        if (game && game.scene) {
            const activeScenes = game.scene.getScenes(true);
            let sceneKey = "";
            if (activeScenes.length > 0) {
                const currentScene = activeScenes[0];
                sceneKey = currentScene.sys.settings.key;

                if (sceneKey !== 'ErrorHandler') {
                    // Properly shutdown the failed scene
                    currentScene.sys.shutdown();
                }
            }

            // Start the error scene
            game.scene.start('ErrorHandler', {
                failedSceneKey: sceneKey,
                error: error?.message || error?.toString() || 'Unknown error'
            });
        }
    }

})();
