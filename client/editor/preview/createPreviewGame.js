import * as Phaser from 'phaser';
import { Boot } from '../../scenes/Boot';
import { Preloader } from '../../scenes/Preloader';
import { PREVIEW_SCENES } from './previewScenes';
import { inspectableRegistry } from './InspectableRegistry';

import { workbenchStore } from '../state/workbenchStore';

export function createPreviewGame(containerElement, initialSceneId) {
    const config = {
        type: Phaser.AUTO,
        parent: containerElement,
        backgroundColor: '#1a202c', // Matches Tailwind gray-800
        scale: {
            mode: Phaser.Scale.NONE, // Manual resizing driven by store
            width: 1280,
            height: 720
        },
        scene: [Boot, Preloader, ...PREVIEW_SCENES.map(s => s.sceneClass)]
    };

    const game = new Phaser.Game(config);

    // Click-to-select logic (Step 11)
    game.events.on('ready', () => {
        // We'll listen to the scene manager and add listeners to scenes as they are created/started
        game.scene.scenes.forEach(scene => {
            setupSceneInput(scene);
        });

        // game.scene.on('add', (key, scene) => {
        //     setupSceneInput(scene);
        // });
    });

    function setupSceneInput(scene) {
        scene.events.on('create', () => {
            scene.input.on('gameobjectdown', (pointer, gameObject) => {
                // Find which registered object this is
                const all = inspectableRegistry.objects;
                for (let [id, entry] of all) {
                    if (entry.gameObject === gameObject || 
                        (entry.gameObject.list && entry.gameObject.list.includes(gameObject))) {
                        workbenchStore.setSelectedObject(id);
                        break;
                    }
                }
            });
        });
    }

    // Controller API
    return {
        game,
        destroy: () => {
            game.destroy(true);
        },
        setScene: (sceneId) => {
            if (!sceneId) return;
            
            const sceneDef = PREVIEW_SCENES.find(s => s.id === sceneId);
            if (!sceneDef) return;

            // Stop all current scenes except Boot/Preloader
            game.scene.getScenes(true).forEach(s => {
                if (s.scene.key !== 'Boot' && s.scene.key !== 'Preloader') {
                    game.scene.stop(s.scene.key);
                }
            });

            // Start the requested scene
            game.scene.start(sceneDef.phaserKey);
        },
        setViewport: (width, height) => {
            game.scale.resize(width, height);
        }
    };
}
