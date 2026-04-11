import { Player } from '../game/Player.js';
import { Deck } from '../game/Deck.js';
import { Crib } from '../game/Crib.js';
import { WINNING_SCORE, MAX_PEGGING_TOTAL, PHASES } from '../game/Constants.js';

describe('Cribbage Classes', () => {
    test('Constants', () => {
        expect(WINNING_SCORE).toBeDefined();
        expect(MAX_PEGGING_TOTAL).toBe(31);
        expect(PHASES).toBeDefined();
    });

    test('Player and Hand management', () => {
        const p1 = new Player('123', 'Alice');
        expect(p1.name).toBe('Alice');
        expect(p1.score).toBe(0);

        p1.addPoints(2);
        expect(p1.score).toBe(2);

        const deck = new Deck();
        const cards = deck.dealMany(6);
        cards.forEach(c => p1.hand.addCard(c));
        expect(p1.hand.cards.length).toBe(6);

        p1.clearHand();
        expect(p1.hand.cards.length).toBe(0);
    });

    test('Crib management', () => {
        const p1 = new Player('123', 'Alice');
        const crib = new Crib(p1);
        expect(crib.owner).toBe(p1);

        const deck = new Deck();
        const cards = deck.dealMany(2);
        cards.forEach(c => crib.addCard(c));
        expect(crib.cards.length).toBe(2);
    });
});
