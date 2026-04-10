import { Deck } from '../game/Deck.js';

describe('Deck.js', () => {
    test('Deck initialization', () => {
        const deck = new Deck();
        expect(deck.remaining()).toBe(52);
    });

    test('Dealing cards', () => {
        const deck = new Deck();
        const hand = deck.dealMany(6);
        expect(hand.length).toBe(6);
        expect(deck.remaining()).toBe(46);
    });

    test('Deck reset', () => {
        const deck = new Deck();
        deck.dealMany(10);
        deck.reset();
        expect(deck.remaining()).toBe(52);
    });
});
