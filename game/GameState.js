import { Deck } from './Deck.js';
import { Player } from './Player.js';
import { Crib } from './Crib.js';
import { Pegging } from './Pegging.js';
import { Scoring } from './Scoring.js';
import { PHASES, WINNING_SCORE } from './Constants.js';

export class GameState {
    /**
     * @param {Player[]} players - The players participating in the game.
     * @param {Object} [options] - Configuration options for the game.
     */
    constructor(players, options = {}) {
        this.players = players;
        this.deck = new Deck();
        this.phase = PHASES.STARTING_CUT;
        this.dealerIndex = -1; // No dealer yet
        this.starterCard = null;
        this.crib = null;
        this.pegging = null;
        this.winner = null;
        this.callbacks = options.callbacks || {};

        // Keep track of which players have discarded to the crib
        this.discardedToCrib = players.map(() => false);
        
        // Tracking cuts for the starting cut phase
        this.startingCuts = players.map(() => null);
        
        // Ensure initial dealer is set
        this.updateDealer();
    }

    /**
     * Emits an event by calling a registered callback.
     * @param {string} event 
     * @param {any} data 
     */
    emit(event, data) {
        //console.log(`[GameState] Emitting ${event}:`, data);
        if (this.callbacks[event]) {
            this.callbacks[event](data);
        }
    }

    /**
     * Sets the isDealer flag on each player correctly.
     */
    updateDealer() {
        this.players.forEach((player, index) => {
            player.isDealer = (index === this.dealerIndex);
        });
        // Create a new Crib for the current dealer
        if (this.dealerIndex !== -1) {
            this.crib = new Crib(this.players[this.dealerIndex]);
            this.emit('dealerChanged', { dealerIndex: this.dealerIndex, dealer: this.players[this.dealerIndex] });
        }
    }

    /**
     * Moves to the next phase in the Cribbage game.
     */
    nextPhase() {
        const oldPhase = this.phase;
        switch (this.phase) {
            case PHASES.STARTING_CUT:
                this.startNewRound();
                return; // startNewRound handles its own phase transitions/emits
            case PHASES.DEALING:
                this.phase = PHASES.DISCARDING;
                break;
            case PHASES.DISCARDING:
                this.phase = PHASES.CUTTING;
                this.cutStarterCard();
                break;
            case PHASES.CUTTING:
                this.phase = PHASES.PEGGING;
                this.startPegging();
                break;
            case PHASES.PEGGING:
                this.phase = PHASES.COUNTING;
                // Hand counting is now handled by the controller via countPlayerHand and countCrib
                // this.countHands(); 
                break;
            case PHASES.COUNTING:
                if (this.checkWin()) {
                    this.phase = PHASES.GAME_OVER;
                } else {
                    this.startNewRound();
                    return; // startNewRound handles its own phase transitions/emits
                }
                break;
            case PHASES.GAME_OVER:
                console.log("GAME OVER!!!");
                // No more phases after game over
                break;
        }
        
        this.emit('phaseChanged', { phase: this.phase, oldPhase });
        //console.log(`[GameState] Phase is now ${this.phase}`);
        this.checkBotTurns();
    }

    /**
     * Starts a new round of Cribbage.
     */
    startNewRound() {
        //console.log('[GameState] Starting New Round');
        // Rotate dealer if it's not the very first round after starting cut
        if (this.phase !== PHASES.STARTING_CUT && this.phase !== PHASES.GAME_OVER) {
            this.dealerIndex = (this.dealerIndex + 1) % this.players.length;
        }
        
        if (this.dealerIndex === -1) this.dealerIndex = 0; // Fallback
        
        this.updateDealer();

        // Reset game elements
        this.deck.reset();
        this.deck.shuffle();
        this.starterCard = null;
        this.pegging = null;
        this.discardedToCrib = this.players.map(() => false);

        // Clear player hands
        this.players.forEach(p => p.clearHand());

        const oldPhase = this.phase;
        this.phase = PHASES.DEALING;
        this.emit('phaseChanged', { phase: this.phase, oldPhase });
        
        this.dealCards();
    }

    /**
     * Allows a player to cut a card to determine the first dealer.
     * @param {Player} player 
     * @param {number} cardIndex - The index of the card in the deck to cut.
     */
    cutForDealer(player, cardIndex) {
        if (this.phase !== PHASES.STARTING_CUT) return;

        const playerIndex = this.players.indexOf(player);
        if (playerIndex === -1 || this.startingCuts[playerIndex]) return;

        // Pick a card from the deck.
        const card = this.deck.cards.splice(cardIndex % this.deck.cards.length, 1)[0];
        this.startingCuts[playerIndex] = card;

        this.emit('startingCardCut', { player, card, cardIndex });

        // If everyone has cut, determine the dealer
        console.log(this.startingCuts);
        if (this.startingCuts.every(c => c !== null)) {
            setTimeout(() => {
                this.determineFirstDealer();
            }, 2000);
        } else {
            this.checkBotTurns();
        }
    }

    /**
     * Determines who the first dealer is based on the starting cuts.
     */
    determineFirstDealer() {
        // Lowest card deals. Ace is low.
        let lowestRank = 15;
        let dealerIdx = 0;
        let tie = false;

        this.startingCuts.forEach((card, index) => {
            const rank = card.getRank();
            if (rank < lowestRank) {
                lowestRank = rank;
                dealerIdx = index;
                tie = false;
            } else if (rank === lowestRank) {
                tie = true;
            }
        });

        if (tie) {
            // If there's a tie for lowest, everyone cuts again
            this.startingCuts = this.players.map(() => null);
            this.deck.reset();
            this.deck.shuffle();
            this.emit('startingCutTie', {});
            this.checkBotTurns();
        } else {
            this.dealerIndex = dealerIdx;
            this.emit('firstDealerDetermined', { dealer: this.players[this.dealerIndex] });
            setTimeout(() => {
                this.nextPhase();
            }, 2000);
        }
    }

    /**
     * Deals 6 cards to each player (standard 2-player Cribbage).
     */
    dealCards() {
        //console.log('[GameState] Dealing cards');
        if (this.phase !== PHASES.DEALING) return;

        // Assuming 2 players for now as per common Cribbage rules.
        // Each player gets 6 cards.
        this.players.forEach(player => {
            for (let i = 0; i < 6; i++) {
                const card = this.deck.deal();
                player.hand.addCard(card);
            }
        });

        this.emit('cardsDealt', { players: this.players });
        this.nextPhase(); // Move to DISCARDING
    }

    /**
     * Allows a player to discard cards to the crib.
     * @param {Player} player 
     * @param {import('./Card.js').Card[]} cards - Cards to discard.
     */
    discardToCrib(player, cards) {
        if (this.phase !== PHASES.DISCARDING) return;

        const playerIndex = this.players.indexOf(player);
        if (playerIndex === -1 || this.discardedToCrib[playerIndex]) return;

        if (cards.length !== 2) {
            throw new Error("Each player must discard 2 cards to the crib.");
        }

        cards.forEach(card => {
            const removed = player.hand.removeCard(card);
            if (removed) {
                this.crib.addCard(removed);
            }
        });

        // Store the remaining 4 cards for final counting after pegging removes them
        player.handForCounting = [...player.hand.cards];

        this.discardedToCrib[playerIndex] = true;
        this.emit('cardDiscarded', { player, cards });

        // If everyone has discarded, move to next phase
        if (this.discardedToCrib.every(d => d)) {
            this.nextPhase();
        } else {
            this.checkBotTurns();
        }
    }

    /**
     * Cuts the deck to reveal the starter card.
     */
    cutStarterCard() {
        this.starterCard = this.deck.deal();
        //console.log(`[GameState] Starter card cut: ${this.starterCard.rank} of ${this.starterCard.suit}`);
        this.emit('starterCardCut', { card: this.starterCard });

        // If starter card is a Jack, dealer gets 2 points ("His Heels")
        if (this.starterCard.rank === 'Jack') {
            const dealer = this.players[this.dealerIndex];
            dealer.addPoints(2);
            this.emit('pointsEarned', { player: dealer, points: 2, reason: 'His Heels' });
            this.checkWin();
        }

        // Wait a bit for the player to see the starter card before moving to pegging
        setTimeout(() => {
            if (this.phase === PHASES.CUTTING) {
                //console.log('[GameState] Moving from CUTTING to PEGGING');
                this.nextPhase();
            }
        }, 1500);
    }

    /**
     * Initializes the pegging phase.
     */
    startPegging() {
        //console.log('[GameState] Starting Pegging Phase');
        // Player to the left of dealer starts pegging
        const startingPlayerIndex = (this.dealerIndex + 1) % this.players.length;
        this.pegging = new Pegging(this.players, startingPlayerIndex);
        this.checkBotTurns();
    }

    /**
     * Processes a pegging move.
     * @param {Player} player 
     * @param {import('./Card.js').Card|null} card - Card to play, or null for "Go".
     */
    playPeggingCard(player, card) {
        if (this.phase !== PHASES.PEGGING || !this.pegging) return;

        // Store a copy of the card before it's removed from hand if we're counting later
        // Actually, we need to keep track of the original 4 cards each player had after discarding.
        // Let's add a property to the player to hold their hand for counting.
        
        let result;
        if (card === null) {
            result = this.pegging.sayGo(player);
            if (result.points > 0) {
                this.emit('pointsEarned', { player, points: result.points, reason: 'Pegging' });
            }
        } else {
            result = this.pegging.playCard(player, card);
            result.card = card;
            if (result.points > 0) {
                this.emit('pointsEarned', { player, points: result.points, reason: 'Pegging' });
            }
        }

        this.emit('cardPlayed', result);

        if (result.cyclePoints && result.cyclePoints.points > 0) {
            this.emit('pointsEarned', { 
                player: result.cyclePoints.player, 
                points: result.cyclePoints.points, 
                reason: 'Pegging' 
            });
        }

        this.checkWin();

        if (this.pegging.isPhaseComplete()) {
            this.nextPhase(); // Move to COUNTING
        } else {
            this.checkBotTurns();
        }
    }

    /**
     * Scores the hands and the crib at the end of the round.
     */
    countHands() {
        //console.log('[GameState] Counting Hands');
        // 1. Non-dealer(s) count their hands first
        const nonDealerIndices = this.players
            .map((_, index) => index)
            .filter(index => index !== this.dealerIndex);

        // In 2-player game, there's only one non-dealer.
        // If we want to support more, we'd iterate.
        nonDealerIndices.forEach(index => {
            const player = this.players[index];
            this.countPlayerHand(player);
            if (this.winner) return;
        });

        if (this.winner) return;

        // 2. Dealer counts their hand
        const dealer = this.players[this.dealerIndex];
        this.countPlayerHand(dealer);
        if (this.winner) return;

        // 3. Dealer counts the crib
        this.countCrib();
        this.checkWin();
    }

    /**
     * Counts a specific player's hand.
     * @param {Player} player 
     */
    countPlayerHand(player) {
        const score = Scoring.countHand(player.handForCounting, this.starterCard, false);
        player.addPoints(score.total);
        this.emit('pointsEarned', { player, points: score.total, reason: 'Hand Count', breakdown: score });
    }

    /**
     * Counts the crib.
     */
    countCrib() {
        const dealer = this.players[this.dealerIndex];
        const cribScore = Scoring.countHand(this.crib.cards, this.starterCard, true);
        dealer.addPoints(cribScore.total);
        this.emit('pointsEarned', { player: dealer, points: cribScore.total, reason: 'Crib Count', breakdown: cribScore });
    }

    /**
     * Checks if it's a Bot's turn and triggers their move if so.
     */
    checkBotTurns() {
        if (this.winner) return;

        if (this.phase === PHASES.STARTING_CUT) {
            this.players.forEach((player, index) => {
                if (player.isBot && !this.startingCuts[index]) {
                    setTimeout(() => {
                        if (this.phase !== PHASES.STARTING_CUT) return;
                        const cardIndex = Math.floor(Math.random() * this.deck.cards.length);
                        this.cutForDealer(player, cardIndex);
                    }, 1000);
                }
            });
        } else if (this.phase === PHASES.DISCARDING) {
            this.players.forEach((player, index) => {
                if (player.isBot && !this.discardedToCrib[index]) {
                    //console.log(`[GameState] Bot ${player.name} is deciding what to discard`);
                    // Small delay for bot thinking
                    setTimeout(() => {
                        if (this.phase !== PHASES.DISCARDING) return;
                        const discards = player.makeDiscardDecision();
                        //console.log(`[GameState] Bot ${player.name} discarded:`, discards);
                        this.discardToCrib(player, discards);
                    }, 1000);
                }
            });
        } else if (this.phase === PHASES.PEGGING && this.pegging) {
            const currentPlayer = this.pegging.getCurrentPlayer();
            if (currentPlayer && currentPlayer.isBot) {
                // If the total was just reset to 0, or someone said Go, we should wait longer
                // for the UI to display the last card/points.
                const isNewCycle = this.pegging.currentTotal === 0;
                const delay = isNewCycle ? 2500 : 1500;
                
                //console.log(`[GameState] Bot ${currentPlayer.name}'s turn in Pegging. Delay: ${delay}`);
                setTimeout(() => {
                    if (this.phase !== PHASES.PEGGING || !this.pegging) return;
                    if (this.pegging.getCurrentPlayer() !== currentPlayer) return;
                    const card = currentPlayer.makePeggingDecision(this.pegging.currentTotal);
                    //console.log(`[GameState] Bot ${currentPlayer.name} decided to play:`, card ? card.rank + ' of ' + card.suit : 'Go');
                    this.playPeggingCard(currentPlayer, card);
                }, delay);
            }
        }
    }

    /**
     * Checks if any player has reached the winning score.
     * @returns {boolean}
     */
    checkWin() {
        console.log('checking for win');
        for (const player of this.players) {
            if (player.score >= WINNING_SCORE) {
                console.log("WINNNNBER");
                this.winner = player;
                this.emit('phaseChanged', { phase: PHASES.GAME_OVER, oldPhase: this.phase });
                this.phase = PHASES.GAME_OVER;
                return true;
            }
        }
        return false;
    }

    /**
     * Returns a public representation of the game state suitable for UI.
     * @returns {Object}
     */
    getPublicState() {
        return {
            phase: this.phase,
            players: this.players.map(player => ({
                id: player.id,
                name: player.name,
                score: player.score,
                isDealer: player.isDealer,
                handSize: player.hand.cards.length,
                hand: [...player.hand.cards] // For now, we'll return the full hand for UI
            })),
            dealerIndex: this.dealerIndex,
            starterCard: this.starterCard,
            cribSize: this.crib ? this.crib.cards.length : 0,
            crib: this.crib ? [...this.crib.cards] : [], // UI might need to see the crib at certain phases
            pegging: (this.pegging && typeof this.pegging.isPhaseComplete === 'function') ? {
                currentTotal: this.pegging.currentTotal,
                playedCards: [...this.pegging.playedCards],
                allPlayedCards: [...this.pegging.allPlayedCards],
                turnIndex: this.pegging.turnIndex,
                lastPlayerToPlay: this.pegging.lastPlayerToPlay ? {
                    id: this.pegging.lastPlayerToPlay.id,
                    name: this.pegging.lastPlayerToPlay.name
                } : null
            } : null,
            winner: this.winner ? {
                id: this.winner.id,
                name: this.winner.name,
                score: this.winner.score
            } : null
        };
    }
}
