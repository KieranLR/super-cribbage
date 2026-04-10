import { Player } from './Player.js';
import { Deck } from './Deck.js';
import { Crib } from './Crib.js';
import { WINNING_SCORE, MAX_PEGGING_TOTAL, PHASES } from './Constants.js';

console.log('--- Testing Cribbage Classes ---');

// Test Constants
console.log('Constants:', { WINNING_SCORE, MAX_PEGGING_TOTAL, PHASES });

// Test Player and Hand
const p1 = new Player('123', 'Alice');
const p2 = new Player('456', 'Bob');
p1.isDealer = true;

console.log(`Player 1: ${p1.name} (Dealer: ${p1.isDealer})`);
console.log(`Player 2: ${p2.name} (Dealer: ${p2.isDealer})`);

// Test Deck and Dealing
const deck = new Deck();
deck.shuffle();

const cards1 = deck.dealMany(6);
cards1.forEach(c => p1.hand.addCard(c));

console.log(`${p1.name}'s hand size: ${p1.hand.cards.length}`);
console.log(`${p1.name}'s hand: ${p1.hand.cards.map(c => c.toString()).join(', ')}`);

// Test Crib
const crib = new Crib(p1);
console.log(`Crib owner: ${crib.owner.name}`);

// Test Hand management (discarding to crib)
const discard1 = p1.hand.cards[0];
const discard2 = p1.hand.cards[1];

p1.hand.removeCard(discard1);
p1.hand.removeCard(discard2);
crib.addCard(discard1);
crib.addCard(discard2);

console.log(`${p1.name}'s hand size after discard: ${p1.hand.cards.length}`);
console.log(`Crib size: ${crib.cards.length}`);

// Test Scoring
p1.addPoints(2);
console.log(`${p1.name}'s score: ${p1.score}`);

p1.clearHand();
console.log(`${p1.name}'s hand size after clear: ${p1.hand.cards.length}`);

console.log('--- Test Complete ---');
