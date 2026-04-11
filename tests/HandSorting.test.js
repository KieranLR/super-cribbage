import { jest } from '@jest/globals';

// Mock Phaser before importing components that extend it
global.Phaser = {
    GameObjects: {
        Container: class {
            constructor(scene) {
                this.scene = scene;
                this.list = [];
                this.x = 0;
                this.y = 0;
                this.scale = 1;
                this.alpha = 1;
                this.visible = true;
                this.input = { enabled: true };
            }
            add(item) { this.list.push(item); }
            remove(item) {
                const idx = this.list.indexOf(item);
                if (idx > -1) this.list.splice(idx, 1);
            }
            setSize() {}
            setInteractive() {}
            on() {}
            off() {}
            setVisible(v) { this.visible = v; }
            setAlpha(a) { this.alpha = a; }
            destroy() {}
            bringToTop() {}
            exists() { return true; }
        }
    },
    Math: {
        Distance: {
            Between: () => 0
        }
    }
};

const { Card, Suits, Values } = await import('../game/Card.js');
const { HandVisual } = await import('../client/components/GameVisuals/HandVisual.js');
const { TableAnimator } = await import('../client/utils/TableAnimator.js');

// Mock Phaser
const mockScene = {
    add: {
        existing: jest.fn(),
        container: jest.fn(function() { return new global.Phaser.GameObjects.Container(mockScene); }),
        graphics: jest.fn(() => ({
            clear: jest.fn(),
            fillStyle: jest.fn(),
            fillRoundedRect: jest.fn(),
            lineStyle: jest.fn(),
            strokeRoundedRect: jest.fn(),
            setVisible: jest.fn(),
            add: jest.fn(),
            setDepth: jest.fn()
        })),
        text: jest.fn(() => ({
            setOrigin: jest.fn().mockReturnThis(),
            setVisible: jest.fn().mockReturnThis(),
            setColor: jest.fn().mockReturnThis(),
            setText: jest.fn().mockReturnThis(),
            setAngle: jest.fn().mockReturnThis(),
            add: jest.fn()
        })),
        rectangle: jest.fn(() => ({
            setAngle: jest.fn(),
            setVisible: jest.fn(),
            add: jest.fn()
        }))
    },
    input: {
        setDraggable: jest.fn()
    },
    tweens: {
        add: jest.fn(() => ({
            on: jest.fn()
        }))
    }
};
mockScene.scene = mockScene; // Circular for easier access in mock classes

describe('HandVisual Sorting', () => {
    let animator;
    let handVisual;
    let cards;

    beforeEach(() => {
        animator = new TableAnimator(mockScene);
        cards = [
            new Card(Suits.SPADES, Values.KING),
            new Card(Suits.HEARTS, Values.ACE),
            new Card(Suits.CLUBS, Values.FIVE),
            new Card(Suits.DIAMONDS, Values.TEN)
        ];
        handVisual = new HandVisual(mockScene, 0, 0, cards, false, animator);
    });

    test('sortByRank should sort cards by numeric value', () => {
        handVisual.sortByRank();
        
        const sortedValues = handVisual.cardVisuals.map(v => v.cardData.value);
        expect(sortedValues).toEqual([Values.ACE, Values.FIVE, Values.TEN, Values.KING]);
    });

    test('sortBySuit should sort cards by suit order', () => {
        // Order: Hearts, Diamonds, Clubs, Spades
        handVisual.sortBySuit();
        
        const sortedSuits = handVisual.cardVisuals.map(v => v.cardData.suit);
        expect(sortedSuits).toEqual([Suits.HEARTS, Suits.DIAMONDS, Suits.CLUBS, Suits.SPADES]);
    });

    test('sortByRank should have secondary sort by suit', () => {
        const sameRankCards = [
            new Card(Suits.SPADES, Values.FIVE),
            new Card(Suits.HEARTS, Values.FIVE),
            new Card(Suits.CLUBS, Values.FIVE),
            new Card(Suits.DIAMONDS, Values.FIVE)
        ];
        handVisual.setCards(sameRankCards);
        handVisual.sortByRank();

        const sortedSuits = handVisual.cardVisuals.map(v => v.cardData.suit);
        expect(sortedSuits).toEqual([Suits.HEARTS, Suits.DIAMONDS, Suits.CLUBS, Suits.SPADES]);
    });

    test('sortBySuit should have secondary sort by rank', () => {
        const sameSuitCards = [
            new Card(Suits.HEARTS, Values.KING),
            new Card(Suits.HEARTS, Values.ACE),
            new Card(Suits.HEARTS, Values.TEN),
            new Card(Suits.HEARTS, Values.FIVE)
        ];
        handVisual.setCards(sameSuitCards);
        handVisual.sortBySuit();

        const sortedValues = handVisual.cardVisuals.map(v => v.cardData.value);
        expect(sortedValues).toEqual([Values.ACE, Values.FIVE, Values.TEN, Values.KING]);
    });
});
