# Phaser Editor 2D Integration Guide

This document outlines the strategy for integrating Phaser Editor 2D (PE2D) into the Super Cribbage project to manage visuals and game logic more effectively.

## 1. Role Distribution in Phaser Editor 2D

When using Phaser Editor 2D, the logic and visual structure should be distributed across four main concepts:

### A. Scene Files (`.scene`)
**Purpose:** Visual assembly and layout of a specific game screen.
- **What belongs here:**
    - Static background elements.
    - Initial placement of UI containers and Hud elements.
    - The "Big Picture" of how the screen looks.
    - Reference points (empty GameObjects) used as spawn points or layout anchors.
- **Existing Project Match:** Replaces much of the manual positioning logic currently found in `CribbageGameView.setupVisuals()` and static parts of `TableLayout`.

### B. Prefabs
**Purpose:** Reusable, template-based Game Objects.
- **What belongs here:**
    - `CardVisual`: Individual cards with their front/back states.
    - `HandVisual`: A container for cards with its own layout logic.
    - `Scoreboard`: The visual representation of the game score.
    - `ActionButtons`: Reusable button sets.
- **Existing Project Match:** Replaces classes that extend `Phaser.GameObjects.Container` or `Sprite` (e.g., `client/components/GameVisuals/*.js`). In PE2D, you define the visual structure and properties, and it generates the class.

### C. User Components
**Purpose:** Modular, reusable logic behaviors that can be attached to any Game Object.
- **What belongs here:**
    - **Interactivity:** `Draggable`, `Hoverable`, `Clickable`.
    - **Visual Effects:** `FloatAnimation`, `GlowEffect`, `PulseOnTurn`.
    - **Layout Helpers:** `CenterInParent`, `RelativeScale`.
- **Existing Project Match:** Modularizes the "capabilities" of objects. Instead of `CardVisual` having internal drag logic, you attach a `Draggable` component to it in the editor.

### D. Script Nodes
**Purpose:** Event-driven logic and visual scripting.
- **What belongs here:**
    - Handling `pointerdown` or `pointerup` events.
    - Simple state transitions (e.g., "On Game Start" -> "Play Animation").
    - Emitting custom events that the `Controller` listens to.
    - Connecting signals between components (e.g., "Button Clicked" -> "Play Sound").
- **Existing Project Match:** Connects the visuals to the `CribbageGameView` and `HumanVsBotController`.

---

## 2. Recommended Tasks for Migration

To transition to Phaser Editor 2D, follow these steps sequentially:

1.  **Project Setup:**
    - Configure the Phaser Editor 2D project to point to the `client/` directory.
    - Ensure your asset pack (`public/assets/asset-pack.json`) is recognized by the editor.

2.  **Prefab Conversion:**
    - **Card Prefab:** Create a `Card` prefab based on a `Sprite`. Add properties for `suit` and `rank`.
    - **Hand Prefab:** Create a `Hand` prefab based on a `Container`.
    - **Button Prefab:** Create a generic `GameButton` with hover/click states.

3.  **Component Creation:**
    - Create a `Draggable` user component.
    - Create a `CardAnimation` component to handle flipping and sliding.

4.  **Scene Layout:**
    - Design the `MainGame` scene. Place placeholders for the `PlayerHand`, `BotHand`, `Crib`, and `PeggingArea`.
    - Use "Object Lists" or "Containers" to organize layers (Background, Game, HUD).

5.  **Integration:**
    - Update `CribbageGameView` to instantiate the PE2D Scene.
    - Use `this.add.existing(new MyPrefab(this, x, y))` or `scene.create()` to load the visual layout.
    - Bridge the PE2D events (from Script Nodes) to your existing `HumanVsBotController`.

---

## 3. Handling Logic: Where does it go?

| Logic Type | Location | Reason |
| :--- | :--- | :--- |
| **Cribbage Rules** | `game/` (Pure JS) | Must remain independent of the visual framework for testing and portability. |
| **Bot AI** | `game/Bots/` | Pure logic, no visual dependency. |
| **Game Flow** | `game/GameFlow.js` | Manages phases and state transitions. |
| **Visual State** | **User Components** | Components like `CardFaceHandler` manage how a card looks based on its rank/suit. |
| **Input Handling** | **Script Nodes** | Visually mapping a click to a game action (e.g. `playCard`). |
| **Animations** | **TableAnimator / Components** | Use PE2D for defining "Tweens" or simple animations; keep `TableAnimator` for complex, multi-object sequences. |

---

## 4. Responsive Layout Strategy

The current project uses a highly dynamic `TableLayout`. Phaser Editor 2D is primarily coordinate-based. To bridge this:

1.  **Anchor Components:** Create User Components like `LayoutAnchor`. In the editor, you set an object's anchor (e.g., `TOP_RIGHT`).
2.  **Code Bridge:** In the scene's `create` method (or a component's `awake`), use your existing `TableLayout` logic to update the positions of these anchored objects.
3.  **Containers:** Use Containers in the editor for logical groups (e.g., `HUDContainer`). In code, you can move the entire container based on screen size while keeping the relative layout defined in the editor.

## 5. Summary of logic flow
1. **Phaser Scene** (Visuals/Input) -> **Script Node** (Event) -> **CribbageGameView** (Dispatcher).
2. **CribbageGameView** -> **HumanVsBotController** (Game Logic).
3. **HumanVsBotController** -> **GameState/GameFlow** (State Change).
4. **GameState** (Change) -> **CribbageGameView** (Update Visuals).
