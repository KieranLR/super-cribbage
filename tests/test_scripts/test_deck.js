import { Deck } from '../game/Deck.js';

const deck = new Deck();
console.log('Deck initialized. Remaining cards:', deck.remaining());

deck.shuffle();
console.log('Deck shuffled.');

const hand = deck.dealMany(6);
console.log('Dealt 6 cards:');
hand.forEach(card => console.log(' - ' + card.toString() + ' (Rank: ' + card.getRank() + ')'));

console.log('Remaining cards:', deck.remaining());

deck.reset();
console.log('Deck reset. Remaining cards:', deck.remaining());
