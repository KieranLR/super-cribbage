import { Scoring } from '../game/Scoring.js';
import { Card, Suits, Values } from '../game/Card.js';

describe('Scoring.js', () => {
    test('fifteens', () => {
        const hand15 = [
            new Card(Suits.HEARTS, Values.FIVE),
            new Card(Suits.DIAMONDS, Values.TEN),
            new Card(Suits.CLUBS, Values.KING),
            new Card(Suits.SPADES, Values.ACE)
        ];
        const starter15 = new Card(Suits.HEARTS, Values.FOUR);
        // Combinations of 15: 5+10, 5+K, 10+4+1, K+4+1
        const score15 = Scoring.checkFifteens([...hand15, starter15]);
        expect(score15).toBe(8);
    });

    test('pairs', () => {
        const handPairs = [
            new Card(Suits.HEARTS, Values.FIVE),
            new Card(Suits.DIAMONDS, Values.FIVE),
            new Card(Suits.CLUBS, Values.FIVE),
            new Card(Suits.SPADES, Values.TWO)
        ];
        const starterPairs = new Card(Suits.HEARTS, Values.FIVE);
        // Four 5s = 6 pairs = 12 points
        const scorePairs = Scoring.checkPairs([...handPairs, starterPairs]);
        expect(scorePairs).toBe(12);
    });

    test('runs', () => {
        // Double run of 3: 3, 4, 5, 5, 10
        const handRun = [
            new Card(Suits.HEARTS, Values.THREE),
            new Card(Suits.DIAMONDS, Values.FOUR),
            new Card(Suits.CLUBS, Values.FIVE),
            new Card(Suits.SPADES, Values.FIVE)
        ];
        const starterRun = new Card(Suits.HEARTS, Values.TEN);
        const scoreRun = Scoring.checkRuns([...handRun, starterRun]);
        expect(scoreRun).toBe(6);

        // Triple run of 3: 3, 4, 5, 5, 5
        const handTripleRun = [
            new Card(Suits.HEARTS, Values.THREE),
            new Card(Suits.DIAMONDS, Values.FOUR),
            new Card(Suits.CLUBS, Values.FIVE),
            new Card(Suits.SPADES, Values.FIVE)
        ];
        const starterTripleRun = new Card(Suits.HEARTS, Values.FIVE);
        const scoreTripleRun = Scoring.checkRuns([...handTripleRun, starterTripleRun]);
        expect(scoreTripleRun).toBe(9);

        // Double-double run of 3: 3, 3, 4, 4, 5
        const handDoubleDouble = [
            new Card(Suits.HEARTS, Values.THREE),
            new Card(Suits.DIAMONDS, Values.THREE),
            new Card(Suits.CLUBS, Values.FOUR),
            new Card(Suits.SPADES, Values.FOUR)
        ];
        const starterDoubleDouble = new Card(Suits.HEARTS, Values.FIVE);
        const scoreDoubleDouble = Scoring.checkRuns([...handDoubleDouble, starterDoubleDouble]);
        expect(scoreDoubleDouble).toBe(12);
    });

    test('flush', () => {
        const flushHand = [
            new Card(Suits.CLUBS, Values.ACE),
            new Card(Suits.CLUBS, Values.THREE),
            new Card(Suits.CLUBS, Values.FIVE),
            new Card(Suits.CLUBS, Values.SEVEN)
        ];
        const starterNotFlush = new Card(Suits.HEARTS, Values.TWO);
        const starterFlush = new Card(Suits.CLUBS, Values.TWO);

        expect(Scoring.checkFlush(flushHand, starterNotFlush, false)).toBe(4);
        expect(Scoring.checkFlush(flushHand, starterFlush, false)).toBe(5);
        expect(Scoring.checkFlush(flushHand, starterNotFlush, true)).toBe(0);
        expect(Scoring.checkFlush(flushHand, starterFlush, true)).toBe(5);
    });

    test('nobs', () => {
        const nobsHand = [new Card(Suits.HEARTS, Values.JACK)];
        const nobsStarter = new Card(Suits.HEARTS, Values.TWO);
        expect(Scoring.checkNobs(nobsHand, nobsStarter)).toBe(1);
    });

    test('pegging', () => {
        // Sequence: 3, 4, 5
        const peggingCards = [
            new Card(Suits.HEARTS, Values.THREE),
            new Card(Suits.DIAMONDS, Values.FOUR),
            new Card(Suits.CLUBS, Values.FIVE)
        ];
        expect(Scoring.countPegging(peggingCards, 12)).toBe(3);

        // Sequence: 5, 4, 3 (out of order run)
        const peggingOutOfOrder = [
            new Card(Suits.HEARTS, Values.FIVE),
            new Card(Suits.DIAMONDS, Values.FOUR),
            new Card(Suits.CLUBS, Values.THREE)
        ];
        expect(Scoring.countPegging(peggingOutOfOrder, 12)).toBe(3);

        // Sequence: 3, 3, 3
        const peggingTrips = [
            new Card(Suits.HEARTS, Values.THREE),
            new Card(Suits.DIAMONDS, Values.THREE),
            new Card(Suits.CLUBS, Values.THREE)
        ];
        expect(Scoring.countPegging(peggingTrips, 9)).toBe(6);

        // Total 15
        const pegging15 = [
            new Card(Suits.HEARTS, Values.SEVEN),
            new Card(Suits.DIAMONDS, Values.EIGHT)
        ];
        expect(Scoring.countPegging(pegging15, 15)).toBe(2);
    });
});
