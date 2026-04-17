import { describe, test, expect } from 'vitest';
import * as Phaser from 'phaser';
import { HandVisual } from '../../components/GameVisuals/HandVisual.js';
import { TableAnimator } from '../../utils/TableAnimator.js';
import { Card, Suits, Values } from '../../../game/Card.js';

function runHandVisualTest(initialCards, assertionFn) {
    return new Promise((resolve, reject) => {
        let game;

        game = new Phaser.Game({
            type: Phaser.HEADLESS,
            width: 800,
            height: 600,
            scene: {
                create() {
                    try {
                        const animator = new TableAnimator(this);
                        const handVisual = new HandVisual(
                            this,
                            0,
                            0,
                            initialCards,
                            false,
                            animator
                        );

                        assertionFn(handVisual);

                        game.destroy(true);
                        resolve();
                    } catch (err) {
                        if (game) {
                            game.destroy(true);
                        }
                        reject(err);
                    }
                }
            }
        });
    });
}

describe('HandVisual Sorting', () => {
    test('sortByRank should sort cards by numeric value', async () => {
        const cards = [
            new Card(Suits.SPADES, Values.KING),
            new Card(Suits.HEARTS, Values.ACE),
            new Card(Suits.CLUBS, Values.FIVE),
            new Card(Suits.DIAMONDS, Values.TEN)
        ];

        await runHandVisualTest(cards, (handVisual) => {
            handVisual.sortByRank();

            const sortedValues = handVisual.cardVisuals.map(v => v.cardData.value);

            expect(sortedValues).toEqual([
                Values.ACE,
                Values.FIVE,
                Values.TEN,
                Values.KING
            ]);
        });
    });

    test('sortBySuit should sort cards by suit order', async () => {
        const cards = [
            new Card(Suits.SPADES, Values.KING),
            new Card(Suits.HEARTS, Values.ACE),
            new Card(Suits.CLUBS, Values.FIVE),
            new Card(Suits.DIAMONDS, Values.TEN)
        ];

        await runHandVisualTest(cards, (handVisual) => {
            handVisual.sortBySuit();

            const sortedSuits = handVisual.cardVisuals.map(v => v.cardData.suit);

            expect(sortedSuits).toEqual([
                Suits.HEARTS,
                Suits.DIAMONDS,
                Suits.CLUBS,
                Suits.SPADES
            ]);
        });
    });

    test('sortByRank should have secondary sort by suit', async () => {
        const cards = [
            new Card(Suits.SPADES, Values.FIVE),
            new Card(Suits.HEARTS, Values.FIVE),
            new Card(Suits.CLUBS, Values.FIVE),
            new Card(Suits.DIAMONDS, Values.FIVE)
        ];

        await runHandVisualTest(cards, (handVisual) => {
            handVisual.sortByRank();

            const sortedSuits = handVisual.cardVisuals.map(v => v.cardData.suit);

            expect(sortedSuits).toEqual([
                Suits.HEARTS,
                Suits.DIAMONDS,
                Suits.CLUBS,
                Suits.SPADES
            ]);
        });
    });

    test('sortBySuit should have secondary sort by rank', async () => {
        const cards = [
            new Card(Suits.HEARTS, Values.KING),
            new Card(Suits.HEARTS, Values.ACE),
            new Card(Suits.HEARTS, Values.TEN),
            new Card(Suits.HEARTS, Values.FIVE)
        ];

        await runHandVisualTest(cards, (handVisual) => {
            handVisual.sortBySuit();

            const sortedValues = handVisual.cardVisuals.map(v => v.cardData.value);

            expect(sortedValues).toEqual([
                Values.ACE,
                Values.FIVE,
                Values.TEN,
                Values.KING
            ]);
        });
    });
});