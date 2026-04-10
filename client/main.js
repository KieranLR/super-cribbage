import { initiateDiscordSDK, discordSdk } from './utils/discordSdk';

import { Boot } from './scenes/Boot';
import { Game } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { Settings } from './scenes/Settings';
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
import { Preloader } from './scenes/Preloader';
import UIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.80.0/Phaser.Types.Core.GameConfig
(async () => {
  initiateDiscordSDK();
  // You can use discordSdk to access the Discord SDK and make the requests you need
  
  const config = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: 'game-container',
      backgroundColor: '#028af8',
      plugins: {
          scene: [{
              key: 'rexUI',
              plugin: UIPlugin,
              mapping: 'rexUI'
          }]
      },
      scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH
      },
      scene: [
        Boot,
        Preloader,
        MainMenu,
        HowToPlay,
        Game,
        GameOver,
        Settings,
        TestListScene,
        TestCardScene,
        TestHandScene,
        TestCribScene,
        TestPeggingScene,
        TestStarterScene,
        TestButtonScene,
        TestPeggingSceneComplex,
        TestGameOverScene
      ]
  };

  new Phaser.Game(config);
})();