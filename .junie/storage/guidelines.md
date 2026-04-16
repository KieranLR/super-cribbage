# Project Guidelines: Super Cribbage (Godot 4)

These guidelines are tailored for the "Super Cribbage" project, a Godot-based implementation of the classic card game Cribbage.

## 1. Project Structure

- **`res://src/`**: All source code and GDScript files.
    - `res://src/autoload/`: Global singletons (e.g., `GameManager.gd`, `SoundManager.gd`).
    - `res://src/classes/`: Pure logic classes that don't inherit from Node (e.g., `Card.gd`, `Deck.gd`, `Scoring.gd`).
- **`res://scenes/`**: All `.tscn` files.
    - `res://scenes/ui/`: UI-specific scenes (menus, HUD).
    - `res://scenes/game/`: Main game logic scenes.
- **`res://assets/`**: Non-code assets.
    - `res://assets/sprites/`: Images and textures.
    - `res://assets/audio/`: SFX and music.
    - `res://assets/fonts/`: Font files.

## 2. Coding Standards (GDScript)

- **PascalCase** for Class names and Scene names.
- **snake_case** for variables, functions, and file names.
- **SCREAMING_SNAKE_CASE** for constants.
- **Type Hinting**: Always use static typing.
    ```gdscript
    var score: int = 0
    func add_points(amount: int) -> void:
        score += amount
    ```
- **Node Referencing**: Use `@onready` with unique names or explicit paths.
    ```gdscript
    @onready var label: Label = %ScoreLabel
    ```

## 3. Game Logic: Cribbage Specifics

- **Deck Representation**: Represent cards as an array of 52 objects. Each card should have a `suit` (int/enum) and a `rank` (1-13).
- **Scoring Engine**: Keep the scoring logic in a dedicated pure GDScript class (`Scoring.gd`) to allow for easy unit testing without needing the scene tree.
- **Game State Machine**: Use a State pattern or a simple Enum-based state machine to manage phases: `DEAL`, `DISCARD_TO_CRIB`, `PEGGING`, `COUNTING_HANDS`.

## 4. UI and UX

- **Responsive Design**: Use `Control` nodes with `Anchors` and `Containers` to ensure the game works on different resolutions.
- **Animations**: Use `Tween` for card movements and UI transitions.
- **Input**: Use Godot's Input Map for actions (e.g., `select_card`, `play_card`).

## 5. Assets

- **Card Sprites**: Use a consistent naming convention like `card_heart_01.png`.
- **Placeholder**: Use built-in Godot shapes or the default icon for prototyping before final assets are ready.
