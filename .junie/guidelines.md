# Junie Guidelines - Super Cribbage Discord Activity

This project is a Discord Activity implementing a Cribbage game, built using Phaser for the frontend and Node.js for the backend.

## Project Overview
- **Game Type:** Cribbage (Discord Activity)
- **Frontend Framework:** Phaser 3
- **Backend Framework:** Node.js with Express
- **Build Tool:** Vite
- **Integration:** Discord Embedded App SDK

## Key Technologies & Libraries
- **Jest:** The primary test runner for the project. Place test files in `/tests` with the `.test.js` extension.
- **Phaser:** Handles all game logic, rendering, and UI.
- **Node.js/Express:** Serves the backend, primarily handling OAuth2 token exchange with Discord.
- **Discord Embedded App SDK:** Used for integrating the game into Discord's activity platform.
- **Vite:** Used for client-side bundling and development server.

## Project Structure
- `/client`: Frontend source code.
    - `/client/main.js`: Game entry point and configuration.
    - `/client/scenes/`: Phaser scenes (Boot, Preloader, MainMenu, Game, GameOver).
    - `/client/utils/discordSdk.js`: Discord SDK initialization and mocking for local development.
- `/server`: Backend source code.
    - `/server/server.js`: Express server for handling API requests (e.g., token exchange).
- `/.env`: Environment variables (VITE_CLIENT_ID, DISCORD_CLIENT_SECRET, etc.).
- `/tests`: Tests for making sure the game remains robust, with few bugs.  

## Development Guidelines
- **Consistency:** Maintain the existing Phaser scene structure. Use the `Preloader` for asset loading and `MainMenu` for initial interaction.
- **Discord SDK:** Always use the `initiateDiscordSDK` utility. Be aware of the mocking logic in `client/utils/discordSdk.js` for non-embedded testing.
- **Assets:** Place game assets in `client/assets`. Use Vite's import system or static loading as described in the README.
- **Environment Variables:** Client-side variables must be prefixed with `VITE_` to be accessible via `import.meta.env`.
- **Scaling:** The game uses `Phaser.Scale.FIT` to handle different Discord window sizes. Ensure UI elements are responsive or centered appropriately.
- **Testing:** Tests are located in `/tests` and should be written using **Jest**. Each bug fix, or change should ideally be accompanied by a corresponding Jest test. Use the `.test.js` suffix for test files. Run tests using `npm test`. 

## Key Files to Reference
- `README.md`: Basic setup and asset handling instructions.
- `client/main.js`: Phaser configuration and scene list.
- `server/server.js`: Token exchange logic.
- `client/utils/discordSdk.js`: Discord integration details.
