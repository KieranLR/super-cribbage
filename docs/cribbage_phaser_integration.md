# Cribbage Game: Phaser & Logic Integration Overview

This document describes how the `GameState` engine is integrated with the Phaser frontend to create the playable Cribbage game.

## 1. Scene Orchestration (`Game.js`)

The `Game` scene acts as the central coordinator, bridging the game logic with the visual presentation.

### Initialization Workflow:
- **Player Setup:** Creates a `Player` (Human) and a `BotPlayer`.
- **GameState Integration:** Instantiates `GameState` with the players and registers event callbacks.
- **Visual Component Creation:**
    - `HandVisual`: For human (bottom) and bot (top) cards.
    - `CribVisual`: Area for the dealer's crib.
    - `PeggingAreaVisual`: Central area for played cards and running total.
    - `StarterCardVisual`: Slot for the cut starter card.
    - `Scoreboard`: Real-time display of scores and dealer status.
    - `PhaseIndicator`: Shows current game phase and instructions.
    - `ActionButtons`: Managed container for context-sensitive buttons (Discard, Go, Next Round).
- **Game Start:** Calls `gameState.startNewRound()` to begin the first deal.

## 2. Event-Driven Visual Updates

The `GameState` emits events that the scene transforms into visual updates and animations.

### Core Event Handlers:
- **`phaseChanged`**: 
    - Updates `PhaseIndicator` text.
    - Manages `ActionButtons` visibility and state (clearing old buttons, showing new ones).
- **`cardsDealt`**: 
    - Populates `HandVisual` components with the newly dealt cards.
- **`cardDiscarded`**:
    - Updates player `HandVisual` to remove discarded cards.
    - Updates `CribVisual` to reflect the growing crib.
- **`starterCardCut`**:
    - Reveals the starter card in `StarterCardVisual`.
- **`cardPlayed` (Pegging)**:
    - Updates `PeggingAreaVisual` with the latest card and total.
    - Refreshes the playing player's `HandVisual`.
    - Updates instructions (e.g., "Your Turn" or "Bot is thinking...").
- **`pointsEarned`**:
    - Triggers floating text animations (e.g., "+2 Fifteens") over the player.
    - Updates the `Scoreboard`.

## 3. Player Interaction Implementation

Interaction is phase-dependent and restricted to valid game moves.

### Discarding Phase:
- Players click cards in their `HandVisual` to toggle selection.
- The "Confirm Discard" button appears in `ActionButtons` only when exactly 2 cards are selected.
- Confirming calls `gameState.discardToCrib(humanPlayer, selectedCards)`.

### Pegging Phase:
- Interaction is enabled only on the player's turn.
- Clicking a card calls `gameState.playPeggingCard(humanPlayer, card)`. 
- Logic in `Game.js` checks if a player has any valid moves; if not, a "Say Go" button is presented in `ActionButtons`.

### Counting Phase:
- Once hands are counted, a "Next Round" button appears to trigger the next dealer's turn.

## 4. Bot Behavior & Pacing

To ensure a natural experience, bot actions include artificial delays managed within the `GameState` and reflected in the scene.

- **Thinking Time:** The `GameState` uses `setTimeout` (approx. 1 second) before bot decisions (discarding or pegging) are finalized.
- **Async Handling:** The Phaser scene reacts to the `cardPlayed` or `cardDiscarded` events as they occur, providing a rhythmic flow to the game.

## 5. UI and Animation Strategy

- **Floating Text:** Used for immediate scoring feedback.
- **Action Buttons:** A unified system (`ActionButtons.js` using `menuButton.js`) ensures consistent interaction patterns.
- **Depth Management:** Critical UI elements (like action buttons) are assigned high depth values (e.g., `100`) to remain above game components.
- **Responsiveness:** The layout uses scale-relative positioning to adapt to different window sizes.

## 6. Current Visual Components

- **`HandVisual`**: Manages a collection of `CardVisual` objects; supports selection and fan layout.
- **`CardVisual`**: Individual card representation with front/back textures and selection states.
- **`Scoreboard`**: Displays "Dealer" badge and current points.
- **`ActionButtons`**: A container that centers and manages the lifecycle of primary interaction buttons.
