# Visual Implementation Plan - Super Cribbage

This document outlines the changes and new files required to implement a rudimentary graphics interface for Super Cribbage using Phaser 3, including a basic "bot" opponent.

## 1. Core Logic Enhancements

### `game/BotPlayer.js` (New)
- **Purpose:** Extends `Player.js` to provide automated decision-making.
- **Methods:**
    - `makeDiscardDecision()`: Returns 2 cards to discard to the crib. Initial implementation: random.
    - `makePeggingDecision(currentTotal)`: Returns a valid card to play or `null` for "Go". Initial implementation: random valid card.

### `game/GameState.js` (Modifications)
- Update `processMove` or equivalent to handle transitions when it's the Bot's turn.
- Emit events or provide hooks that the Phaser Scene can listen to for state updates.

## 2. Phaser Frontend Implementation

### Assets (`client/assets/`)
- Need card sprites/images (e.g., a sprite sheet or individual PNGs for all 52 cards and a card back).
- Basic UI elements (buttons for "Discard", "Go", and a pegging board representation).

### `client/scenes/Preloader.js` (Modifications)
- Load card assets and UI sprites.

### `client/scenes/Game.js` (Major Implementation)
- **State Synchronization:** Instantiate `GameState` with a human `Player` and a `BotPlayer`.
- **Card Rendering:** 
    - Create a `CardSprite` class or utility to map `game/Card.js` objects to Phaser images.
    - Implement layouts for:
        - Human Hand (bottom, interactive).
        - Bot Hand (top, hidden cards).
        - The Crib (side, face down).
        - The Pegging Area (center).
        - The Starter Card (side).
- **Input Handling:**
    - `pointerdown` on cards in hand to select for discarding or playing.
    - "Action" button for confirming discards or saying "Go".
- **Animations:**
    - Simple `tweens` for dealing cards, moving cards to the crib, and playing cards to the center.
- **Bot Integration:**
    - Use `scene.time.delayedCall` to simulate "thinking" time before the Bot makes its move.
    - Trigger `GameState.processMove` with the Bot's decision.

### `client/components/` (Optional/Recommended)
- `CardVisual.js`: A helper component to manage the visual state of a card (front/back, highlighted, selected).

## 3. Integration & Testing

### `tests/BotPlayer.test.js` (New)
- Verify that the Bot makes valid decisions (discards 2 cards, plays valid pegging cards).

### Development Flow
1. **Infrastructure:** Add BotPlayer and placeholder card assets.
2. **Phase 1 (Dealing):** Visually represent dealing 6 cards to each player.
3. **Phase 2 (Discarding):** Implement card selection and "Confirm Discard" button.
4. **Phase 3 (Pegging):** Center play area, "Go" button, and automated Bot responses.
5. **Phase 4 (Counting):** Visual breakdown of points at the end of the round.
