import { MainMenu } from '../../scenes/MainMenu';
import { Game } from '../../scenes/Game';
import { TestCardScene } from '../../scenes/TestScenes/TestCardScene';

export const PREVIEW_SCENES = [
    {
        id: 'mainMenu',
        label: 'Main Menu',
        sceneClass: MainMenu,
        phaserKey: 'MainMenu'
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
