import { jest } from '@jest/globals';

// Mock Phaser
global.Phaser = {
    GameObjects: {
        Container: class {
            constructor(scene) {
                this.scene = scene;
                this.list = [];
                this.x = 0;
                this.y = 0;
                this.scale = 1;
                this.visible = true;
                this.input = { enabled: true };
            }
            add(item) { this.list.push(item); }
            setSize() {}
            setInteractive() {}
            on() {}
            off() {}
            setVisible(v) { this.visible = v; }
            setScale(s) { this.scale = s; return this; }
            destroy() {}
        },
        Graphics: class {
            constructor(scene) {
                this.scene = scene;
            }
            clear() { return this; }
            fillStyle() { return this; }
            lineStyle() { return this; }
            fillRoundedRect() { return this; }
            strokeRoundedRect() { return this; }
            setVisible() { return this; }
            destroy() {}
        },
        Text: class {
            constructor(scene) {
                this.scene = scene;
            }
            setOrigin() { return this; }
            setVisible() { return this; }
            setColor() { return this; }
            setText() { return this; }
            setAngle() { return this; }
            destroy() {}
        },
        Image: class {
            constructor(scene) {
                this.scene = scene;
            }
            setDisplaySize() { return this; }
            setVisible() { return this; }
            destroy() {}
        },
        Rectangle: class {
            constructor(scene) {
                this.scene = scene;
            }
            setStrokeStyle() { return this; }
            setOrigin() { return this; }
            setAngle() { return this; }
            setVisible() { return this; }
            destroy() {}
        }
    }
};

// Mock dependencies
jest.unstable_mockModule('../client/utils/SettingsManager.js', () => ({
    settingsManager: {
        get: jest.fn(() => 'default')
    }
}));

jest.unstable_mockModule('../client/utils/CardDeckConfigs.js', () => ({
    CARD_DECKS: {
        DEFAULT: {
            id: 'default',
            colors: {
                FACE_UP_BG: 0xffffff,
                FACE_UP_STROKE: 0x000000,
                FACE_DOWN_BG: 0x0000ff,
                FACE_DOWN_STROKE: 0xffffff,
                SUITS: { Spades: 0x000000, Hearts: 0xff0000, Diamonds: 0xff0000, Clubs: 0x000000 }
            },
            style: { STROKE_WIDTH_FACE_UP: 2, STROKE_WIDTH_FACE_DOWN: 2 },
            dimensions: { WIDTH: 100, HEIGHT: 140, CORNER_RADIUS: 10, GRID_SIZE: 10 }
        }
    }
}));

const { Card, Suits, Values } = await import('../game/Card.js');
const { CardVisual } = await import('../client/components/GameVisuals/CardVisual.js');

const mockScene = {
    add: {
        existing: jest.fn(),
        container: jest.fn(() => new global.Phaser.GameObjects.Container(mockScene)),
        graphics: jest.fn(() => new global.Phaser.GameObjects.Graphics(mockScene)),
        text: jest.fn(() => new global.Phaser.GameObjects.Text(mockScene)),
        image: jest.fn(() => new global.Phaser.GameObjects.Image(mockScene)),
        rectangle: jest.fn(() => new global.Phaser.GameObjects.Rectangle(mockScene))
    },
    tweens: {
        add: jest.fn(),
        isTweening: jest.fn(() => false),
        getTweensOf: jest.fn(() => [])
    }
};

describe('CardVisual Border Fix', () => {
    test('drawBackground uses lineStyle and strokeRoundedRect', () => {
        const card = new Card(Suits.SPADES, Values.ACE);
        const cv = new CardVisual(mockScene, 0, 0, card);
        
        const graphics = cv.bg;
        const lineStyleSpy = jest.spyOn(graphics, 'lineStyle');
        const strokeRoundedRectSpy = jest.spyOn(graphics, 'strokeRoundedRect');
        
        cv.drawBackground(0xffffff, 0xffd700, 4);
        
        expect(lineStyleSpy).toHaveBeenCalledWith(4, 0xffd700, 1);
        expect(strokeRoundedRectSpy).toHaveBeenCalled();
    });

    test('HowToPlay logic works with drawBackground', () => {
        const card = new Card(Suits.SPADES, Values.JACK);
        const sv = new CardVisual(mockScene, 0, 0, card);
        
        // This is what we changed in HowToPlay.js
        expect(() => {
            sv.drawBackground(0xffffff, 0xffd700, 4);
        }).not.toThrow();
    });
});
