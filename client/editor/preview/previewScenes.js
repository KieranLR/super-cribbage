import { Game } from '../../scenes/Game';
import { TestCardScene } from '../../scenes/TestScenes/TestCardScene';
import MainMenuPrefabScene from '../../test/main-menu/scenes/MainMenuPrefabScene';

export const PREVIEW_SCENES = [
    {
        id: 'mainMenu',
        label: 'Main Menu Prefab',
        sceneClass: MainMenuPrefabScene,
        phaserKey: 'MainMenuPrefabScene'
    },
    {
        id: 'game',
        label: 'Main Game',
        sceneClass: Game,
        phaserKey: 'Game'
    },
    {
        id: 'testCard',
        label: 'Test Card',
        sceneClass: TestCardScene,
        phaserKey: 'TestCardScene'
    }
];
