import { BotPlayer } from '../game/BotPlayer.js';
import { Player } from '../game/Player.js';
import { GameState } from '../game/GameState.js';
import { GameFlow } from '../game/GameFlow.js';
import { PHASES } from '../game/Constants.js';
import { Card, Suits, Values } from '../game/Card.js';
import { jest } from '@jest/globals';

describe('BotPlayer', () => {
    test('BotPlayer is identified as a bot', () => {
        const bot = new BotPlayer('bot1', 'Bot');
        expect(bot.isBot).toBe(true);
    });

    test('makeDiscardDecision returns 2 cards', () => {
        const bot = new BotPlayer('bot1', 'Bot');
        for (let i = 0; i < 6; i++) {
            bot.hand.addCard(new Card(Suits.HEARTS, Values.ACE));
        }
        const discards = bot.makeDiscardDecision();
        expect(discards.length).toBe(2);
        expect(discards[0]).toBeInstanceOf(Card);
    });

    test('makePeggingDecision returns a valid card or null', () => {
        const bot = new BotPlayer('bot1', 'Bot');
        bot.hand.addCard(new Card(Suits.HEARTS, Values.TEN));
        
        // Can play 10 when total is 21
        let decision = bot.makePeggingDecision(21);
        expect(decision).not.toBeNull();
        expect(decision.value).toBe(Values.TEN);

        // Cannot play 10 when total is 22
        decision = bot.makePeggingDecision(22);
        expect(decision).toBeNull();
    });
});

describe('GameState with Bot', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('Bot automatically discards when phase changes to DISCARDING', () => {
        const human = new Player('human', 'Human');
        const bot = new BotPlayer('bot', 'Bot');
        const gameState = new GameState([human, bot], { isHeadless: true });
        const gameFlow = new GameFlow(gameState);
        
        // Skip Starting Cut for this test
        gameState.dealerIndex = 0;
        gameState.updateDealer();
        gameState.phase = PHASES.DEALING;
        
        // Phase is currently DEALING. Calling dealCards will deal, then we must manually move to DISCARDING.
        gameFlow.dealCards();
        gameFlow.nextPhase();
        
        expect(gameState.phase).toBe(PHASES.DISCARDING);

        // Manually trigger bot turn since GameState no longer does it automatically
        gameFlow.checkBotTurns();

        // The bot should have already discarded
        expect(gameState.discardedToCrib[1]).toBe(true);
        expect(gameState.crib.cards.length).toBe(2);
        expect(bot.hand.cards.length).toBe(4);
    });

    test('Bot automatically plays during pegging', () => {
        const human = new Player('human', 'Human');
        const bot = new BotPlayer('bot', 'Bot');
        // Dealer is human (index 0). Bot (index 1) starts pegging.
        const gameState = new GameState([human, bot], { isHeadless: true });
        const gameFlow = new GameFlow(gameState);
        gameState.dealerIndex = 0;
        gameState.updateDealer();
        
        // Setup state for pegging
        gameState.phase = PHASES.CUTTING; // nextPhase will move to PEGGING
        human.hand.addCard(new Card(Suits.HEARTS, Values.FIVE));
        bot.hand.addCard(new Card(Suits.CLUBS, Values.FIVE));

        gameFlow.nextPhase();
        // gameState.startPegging(); // nextPhase already calls start() on the phase logic
        
        // Manually trigger bot turn
        gameFlow.checkBotTurns();

        // Fast-forward timers for bot to play
        jest.runAllTimers();
        
        expect(bot.hand.cards.length).toBe(0);
        expect(gameState.pegging.playedCards.length).toBe(1);
        expect(gameState.pegging.turnIndex).toBe(0); // Back to human
    });

    test('GameState emits events', () => {
        const human = new Player('human', 'Human');
        const bot = new BotPlayer('bot', 'Bot');
        const events = [];
        
        const gameState = new GameState([human, bot]);
        const gameFlow = new GameFlow(gameState);
        const ee = gameFlow.eventEmitter;
        
        ee.on('phaseChanged', (data) => events.push({ name: 'phaseChanged', data }));
        ee.on('cardsDealt', (data) => events.push({ name: 'cardsDealt', data }));
        ee.on('cardDiscarded', (data) => events.push({ name: 'cardDiscarded', data }));

        // Skip Starting Cut for this test
        gameState.dealerIndex = 0;
        gameState.updateDealer();
        gameState.phase = PHASES.DEALING;
        
        gameFlow.dealCards();
        gameFlow.nextPhase();

        // Manually trigger bot turn
        gameFlow.checkBotTurns();

        // Fast-forward timers for bot discard events
        jest.runAllTimers();
        
        expect(events.some(e => e.name === 'cardsDealt')).toBe(true);
        expect(events.some(e => e.name === 'phaseChanged' && e.data.phase === PHASES.DISCARDING)).toBe(true);
        expect(events.some(e => e.name === 'cardDiscarded' && e.data.player === bot)).toBe(true);
    });
});
