import { Pegging } from '../game/Pegging.js';
import { Player } from '../game/Player.js';
import { Card, Suits, Values } from '../game/Card.js';

describe('Pegging.js', () => {
    let p1, p2, players;

    beforeEach(() => {
        p1 = new Player("1", "Alice");
        p2 = new Player("2", "Bob");
        players = [p1, p2];
    });

    test('Basic sequence to 31', () => {
        p1.hand.addCard(new Card(Suits.CLUBS, Values.TEN));
        p1.hand.addCard(new Card(Suits.DIAMONDS, Values.FIVE));
        p2.hand.addCard(new Card(Suits.HEARTS, Values.TEN));
        p2.hand.addCard(new Card(Suits.SPADES, Values.SIX));

        const pegging = new Pegging(players, 0);
        
        // Alice plays 10 (Total 10)
        pegging.playCard(p1, p1.hand.cards[0]);
        expect(pegging.currentTotal).toBe(10);

        // Bob plays 10 (Total 20, Pair 2 points)
        pegging.playCard(p2, p2.hand.cards[0]);
        expect(pegging.currentTotal).toBe(20);
        expect(p2.score).toBe(2);

        // Alice plays 5 (Total 25)
        pegging.playCard(p1, p1.hand.cards[0]);
        expect(pegging.currentTotal).toBe(25);

        // Bob plays 6 (Total 31, 2 points)
        pegging.playCard(p2, p2.hand.cards[0]);
        expect(p2.score).toBe(4); // pair + 31
        expect(pegging.currentTotal).toBe(0); // Cycle reset
    });

    test('"Go" logic', () => {
        p1.hand.addCard(new Card(Suits.CLUBS, Values.KING)); // 10
        p2.hand.addCard(new Card(Suits.DIAMONDS, Values.KING)); // 10
        
        const pegging = new Pegging(players, 0);
        pegging.playCard(p1, p1.hand.cards[0]); // Total 10
        pegging.playCard(p2, p2.hand.cards[0]); // Total 20, pair (2 pts)
        
        expect(pegging.isPhaseComplete()).toBe(true);
        expect(p2.score).toBe(3); // 2 for pair, 1 for last card
    });

    test('Multiple cards by one player (Go)', () => {
        p1.hand.addCard(new Card(Suits.CLUBS, Values.TEN));
        p1.hand.addCard(new Card(Suits.CLUBS, Values.FIVE));
        p2.hand.addCard(new Card(Suits.DIAMONDS, Values.KING)); // 10
        
        const pegging = new Pegging(players, 0);
        pegging.playCard(p1, p1.hand.cards[0]); // P1 plays 10. Total 10.
        pegging.playCard(p2, p2.hand.cards[0]); // P2 plays 10. Total 20. Pair(2).
        
        expect(pegging.getCurrentPlayer()).toBe(p1);
        pegging.playCard(p1, p1.hand.cards[0]); // P1 plays 5. Total 25.
        
        expect(p1.score).toBe(1); // last card
        expect(pegging.isPhaseComplete()).toBe(true);
    });
});
