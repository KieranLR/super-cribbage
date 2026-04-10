# Super Cribbage - Game Logic Architecture Outline

This document outlines the current structure for the core logic of the Cribbage game. These classes handle the state and rules of the game, independent of the Phaser frontend.

## Directory Structure
```text
game/
├── Card.js        - Represents a single playing card.
├── Deck.js        - Manages a standard 52-card deck.
├── Player.js      - Base class for participants (Human or Bot).
├── BotPlayer.js   - Automated player with decision-making logic.
├── Hand.js        - Manages a collection of cards for a player.
├── Crib.js        - Specialized hand for the crib belonging to the dealer.
├── Scoring.js     - Utility class for calculating Cribbage points.
├── Pegging.js     - Manages the "play" phase (pegging to 31).
├── GameState.js   - Main orchestrator for a single game instance (event-driven).
└── Constants.js   - Game-specific constants (scoring values, phase names).
```

## Class/File Details

### 1. `Player.js`
- **Purpose:** Represents an individual participant in the game.
- **Properties:**
    - `id`: Unique identifier (e.g. Discord User ID).
    - `name`: Display name.
    - `score`: Total points accumulated.
    - `isDealer`: Boolean indicating if they are the dealer for the current round.
    - `hand`: An instance of `Hand`.
- **Methods:**
    - `addPoints(amount)`: Updates the player's total score.
    - `clearHand()`: Clears the cards in the player's hand.

### 2. `BotPlayer.js` (Extends `Player`)
- **Purpose:** An automated participant that makes random decisions for game phases.
- **Properties:**
    - `isBot`: Set to `true`.
- **Methods:**
    - `makeDiscardDecision()`: Selects 2 cards to discard to the crib.
    - `makePeggingDecision(currentTotal)`: Selects a valid card to play or returns `null` for "Go".

### 3. `Hand.js`
- **Purpose:** Manages a collection of cards for a player.
- **Properties:**
    - `cards`: Array of `Card` objects.
- **Methods:**
    - `addCard(card)`: Adds a card to the hand.
    - `removeCard(card)`: Removes a specific card (for discarding or pegging).
    - `clear()`: Empties the hand.

### 4. `Crib.js` (Extends `Hand`)
- **Purpose:** A specialized version of `Hand` belonging to the dealer for the round.
- **Properties:**
    - `owner`: Reference to the `Player` who is currently dealing.

### 5. `Scoring.js`
- **Purpose:** Contains static methods to calculate scores based on Cribbage rules.
- **Methods:**
    - `countHand(cards, starterCard, isCrib)`: Calculates points for 15s, pairs, runs, flushes, and "nobs".
    - `countPegging(playedCards, currentTotal)`: Calculates immediate points earned during the play phase.
    - `getCardValue(card)`: Returns the numeric value (1-10) for scoring 15s.

### 6. `Pegging.js`
- **Purpose:** Manages the state and turns of the "Play" (Pegging) phase.
- **Properties:**
    - `currentTotal`: Current running total (up to 31).
    - `playedCards`: Cards in the current "Go" cycle.
    - `turnIndex`: Index of the player whose turn it is.
- **Methods:**
    - `playCard(player, card)`: Validates and processes a card play, updating score and turn.
    - `sayGo(player)`: Processes a player's "Go" action.
    - `resetCycle()`: Resets for a new "Go" cycle.

### 7. `GameState.js`
- **Purpose:** The main engine that manages the game loop, transitions between phases, and emits state updates via callbacks.
- **Phases:**
    - `DEALING`: Cards are shuffled and dealt (6 cards each).
    - `DISCARDING`: Players choose 2 cards for the crib.
    - `CUTTING`: The deck is cut to reveal the starter card.
    - `PEGGING`: The play phase where players reach 31.
    - `COUNTING`: Scoring the hands and the crib.
    - `GAME_OVER`: Final state when a player reaches 121 points.
- **Event Callbacks:**
    - `phaseChanged`, `cardsDealt`, `cardDiscarded`, `cardPlayed`, `pointsEarned`, `starterCardCut`.
- **Key Methods:**
    - `nextPhase()`: Handles phase transition logic.
    - `checkBotTurns()`: Automatically triggers `BotPlayer` decisions when applicable.
    - `discardToCrib(player, cards)` / `playPeggingCard(player, card)`: User interaction entry points.

### 8. `Constants.js`
- **Values:**
    - `WINNING_SCORE`: 121.
    - `MAX_PEGGING_TOTAL`: 31.
    - `PHASES`: Object mapping phase names to strings.

---

## Frontend Component Overview
Visual components located in `client/components/GameVisuals/` are used to render the game state in Phaser:
- `CardVisual.js`: Represents an individual card with selection states.
- `HandVisual.js`: Displays a player's hand and handles card selection.
- `CribVisual.js`: Displays the crib area.
- `PeggingAreaVisual.js`: Renders cards played during the pegging phase and the running total.
- `StarterCardVisual.js`: Renders the cut starter card.
