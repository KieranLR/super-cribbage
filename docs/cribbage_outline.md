# Super Cribbage - Game Logic Architecture Outline

This document outlines the proposed structure for the core logic of the Cribbage game. These classes will handle the state and rules of the game, independent of the Phaser frontend.

## Proposed Directory Structure
```text
game/
├── Card.js        (Existing)
├── Deck.js        (Existing)
├── Player.js      - Represents a player (AI or Human).
├── Hand.js        - Manages a collection of cards for a player.
├── Crib.js        - Specialized hand for the crib.
├── Scoring.js     - Utility class for calculating Cribbage points.
├── Pegging.js     - Manages the "play" phase (pegging to 31).
├── GameState.js   - Main orchestrator for a single game instance.
└── Constants.js   - Game-specific constants (scoring values, phase names).
```

## Class/File Details

### 1. `Player.js`
- **Purpose:** Represents an individual participant in the game.
- **Properties:**
    - `id`: Unique identifier (Discord User ID).
    - `name`: Display name.
    - `score`: Total points accumulated.
    - `isDealer`: Boolean indicating if they are the dealer for the current round.
- **Methods:**
    - `addPoints(amount)`: Updates the player's total score.

### 2. `Hand.js`
- **Purpose:** Extends a generic collection of cards with Cribbage-specific logic.
- **Properties:**
    - `cards`: Array of `Card` objects.
- **Methods:**
    - `addCard(card)`: Adds a card to the hand.
    - `removeCard(card)`: Removes a card (for discarding to the crib or playing during pegging).
    - `clear()`: Empties the hand for the next round.

### 3. `Crib.js`
- **Purpose:** A specialized version of `Hand` belonging to the dealer.
- **Properties:**
    - `owner`: Reference to the `Player` who is currently dealing.
- **Methods:**
    - Inherits from `Hand`.

### 4. `Scoring.js`
- **Purpose:** Contains static methods to calculate scores based on Cribbage rules.
- **Methods:**
    - `countHand(hand, starterCard)`: Calculates total points for 15s, pairs, runs, flushes, and "nobs".
    - `countPegging(currentPlayCards)`: Checks for points earned during the play phase (pairs, 15s, 31, runs).
    - `checkFifteens(cards)`: Helper for finding combinations totaling 15.
    - `checkRuns(cards)`: Helper for finding sequences.
    - `checkPairs(cards)`: Helper for finding matching values.

### 5. `Pegging.js`
- **Purpose:** Manages the state of the "Play" (Pegging) phase.
- **Properties:**
    - `currentTotal`: Current running total (up to 31).
    - `playedCards`: Sequence of cards played in the current "Go" cycle.
    - `turn`: Which player's turn it is to peg.
- **Methods:**
    - `playCard(player, card)`: Validates if a card can be played (total <= 31) and calculates immediate points.
    - `resetCycle()`: Resets the total to 0 when 31 is reached or no one can play.

### 6. `GameState.js`
- **Purpose:** The main engine that manages the game loop and transitions between phases.
- **Phases:**
    - `DEALING`: Shuffling and distributing cards.
    - `DISCARDING`: Players choosing 2 cards for the crib.
    - `CUTTING`: Revealing the starter card.
    - `PEGGING`: The play phase where players reach 31.
    - `COUNTING`: Scoring the hands and the crib.
    - `GAME_OVER`: Checking for a winner (121 points).
- **Methods:**
    - `nextPhase()`: Handles the transition logic.
    - `processMove(action)`: Accepts input from the UI and updates the game state.

### 7. `Constants.js`
- **Purpose:** Centralized configuration.
- **Values:**
    - `WINNING_SCORE`: 121.
    - `MAX_PEGGING_TOTAL`: 31.
    - `PHASES`: Object mapping phase names to strings.
