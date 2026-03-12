# Implementation Plan: Game Modernization

## Overview

Modernize the "Chavo del Ocho" board game from jQuery/Bootstrap 4 to React + Vite + TypeScript. The implementation follows a bottom-up approach: platform-agnostic game engine first, then state management, then React UI components, then styling and polish. Each task builds incrementally so the project compiles and runs at every step.

## Tasks

- [x] 1. Initialize Vite + React + TypeScript project
  - Run `npm create vite@latest` with React + TypeScript template in the project root (or configure manually)
  - Set up `package.json` with `dev`, `build`, and `preview` scripts
  - Install dependencies: `react`, `react-dom`, `typescript`, `vite`, `@vitejs/plugin-react`
  - Install dev dependencies: `vitest`, `fast-check`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`
  - Configure `vite.config.ts` to serve existing `images/` and `assets/` directories as static assets
  - Configure `vitest` in `vite.config.ts` with `jsdom` environment
  - Create `src/main.tsx` entry point and `index.html` (new Vite-based, replacing legacy)
  - Verify the app compiles and runs with a placeholder `<App />` component
  - _Requirements: 1.1, 1.2, 1.4, 1.5_

- [x] 2. Implement platform-agnostic game engine
  - [x] 2.1 Define core types and interfaces (`src/engine/types.ts`)
    - Implement `Position`, `WeaponDefinition`, `TileContent`, `Tile`, `PlayerId`, `PlayerState`, `CombatAction`, `BoardState`, `GamePhase`, `GameState`, `CombatResult`, `WinResult`, and `GameAction` types
    - Define `WEAPONS` constant array with all 5 weapon definitions and correct damage values (Torta:15, Supertorta:25, Slingshot:30, Ramon:35, Barriga:20)
    - Define `GRID_SIZE = 10`, `OBSTACLE_COUNT = 12`, `MAX_MOVE_RANGE = 3` constants
    - _Requirements: 3.1, 4.2, 4.3, 6.3_

  - [x] 2.2 Implement BoardService (`src/engine/BoardService.ts`)
    - Implement `generateBoard()`: create 10×10 grid, randomly place 12 obstacles, 5 weapons (one each), 2 players at distinct unoccupied positions, assign each player a random starting weapon
    - Implement `getValidMovesForPlayer()`: calculate up to 3 tiles in each cardinal direction, blocked by obstacles and other player (cannot pass through)
    - Implement `areAdjacent()`: check horizontal/vertical adjacency (not diagonal)
    - Implement `getTileAt()`: return tile info at a position
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4_

  - [ ]* 2.3 Write property test: Board generation produces a valid initial state (Property 1)
    - **Property 1: Board generation produces a valid initial state**
    - Verify: exactly 100 tiles (10×10), exactly 12 obstacles, exactly 5 weapons (one of each type), 2 players at distinct positions, each player has a valid weapon, no two entities share a tile
    - Create custom `arbPosition()` and `arbWeaponDefinition()` generators in a shared test helpers file
    - **Validates: Requirements 3.1, 3.4, 4.1, 4.2, 4.3, 4.4, 4.5, 6.3**

  - [ ]* 2.4 Write property test: Valid moves are within range and unobstructed (Property 2)
    - **Property 2: Valid moves are within range and unobstructed**
    - Generate arbitrary board states, verify every returned move is 1–3 tiles in a single cardinal direction, not blocked by obstacles or other player, and no valid move is omitted
    - Create custom `arbBoardState()` and `arbPlayerState()` generators
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**

  - [x] 2.5 Implement CombatService (`src/engine/CombatService.ts`)
    - Implement `resolveCombat()`: attack/attack → full damage both; attack/defend → half damage to defender; defend/defend → no damage
    - Implement `checkWinCondition()`: return winner if any player HP ≤ 0
    - _Requirements: 7.3, 7.4, 7.5, 8.1_

  - [ ]* 2.6 Write property test: Combat resolution applies correct HP deltas (Property 5)
    - **Property 5: Combat resolution applies correct HP deltas**
    - Generate arbitrary weapon pairs and all combat action combinations, verify HP deltas match the rules exactly
    - **Validates: Requirements 7.3, 7.4, 7.5**

  - [ ]* 2.7 Write property test: Win condition is correctly detected (Property 7)
    - **Property 7: Win condition is correctly detected**
    - Generate arbitrary HP values, verify winner is declared when HP ≤ 0 and no winner when both HP > 0
    - **Validates: Requirements 8.1**

  - [x] 2.8 Implement AIService (`src/engine/AIService.ts`)
    - Implement `chooseMove()`: select a valid tile for Player 2 (strategy: prefer moving toward weapons or toward Player 1)
    - Implement `chooseCombatAction()`: select attack or defend for Player 2
    - Handle edge case: if no valid moves, return current position and log warning
    - _Requirements: 5.7, 7.2_

  - [ ]* 2.9 Write property test: AI always produces valid actions (Property 8)
    - **Property 8: AI always produces valid actions**
    - Generate arbitrary game states where it is Player 2's turn, verify AI move is within valid moves set, verify AI combat action is 'attack' or 'defend'
    - Create custom `arbGameState()` generator
    - **Validates: Requirements 5.7, 7.2**

  - [x] 2.10 Implement GameEngine (`src/engine/GameEngine.ts`)
    - Implement `initializeGame()`: delegate to BoardService.generateBoard, set phase to 'movement', activePlayer to 'player1', compute validMoves
    - Implement `processMove()`: validate move, update player position, handle weapon pickup (replace player weapon, clear tile), check adjacency → enter combat or switch turn
    - Implement `processCombatAction()`: resolve combat via CombatService, check win condition, continue combat if still adjacent, otherwise switch to movement
    - Implement `getValidMoves()`, `getAIMove()`, `getAICombatAction()` as delegating wrappers
    - _Requirements: 3.1, 3.2, 3.4, 5.5, 5.6, 5.7, 5.8, 6.1, 7.1, 7.6, 7.7, 8.1_

  - [ ]* 2.11 Write property test: Move execution updates position and switches turn (Property 3)
    - **Property 3: Move execution updates position and switches turn**
    - Generate game states in movement phase with valid moves, verify player position updates and active player switches when not adjacent
    - **Validates: Requirements 5.5, 5.6, 5.8**

  - [ ]* 2.12 Write property test: Weapon pickup replaces player weapon and clears tile (Property 4)
    - **Property 4: Weapon pickup replaces player weapon and clears tile**
    - Generate game states where active player moves onto a weapon tile, verify player weapon changes and tile becomes empty
    - **Validates: Requirements 6.1**

  - [ ]* 2.13 Write property test: Adjacency triggers and sustains combat phase (Property 6)
    - **Property 6: Adjacency triggers and sustains combat phase**
    - Generate game states where a move results in adjacent players, verify phase transitions to combat; verify combat phase persists while players remain adjacent and alive
    - **Validates: Requirements 7.1, 7.7**

- [x] 3. Checkpoint - Core engine complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement state management layer
  - [x] 4.1 Define action types (`src/state/actions.ts`)
    - Define `GameAction` union type: `START_GAME`, `MOVE_PLAYER`, `COMBAT_ACTION`, `AI_TURN`, `RESET_GAME`
    - _Requirements: 3.2_

  - [x] 4.2 Implement game reducer (`src/state/gameReducer.ts`)
    - Implement `gameReducer(state, action)` that delegates to GameEngine methods
    - `START_GAME` → `GameEngine.initializeGame()`
    - `MOVE_PLAYER` → `GameEngine.processMove()`
    - `COMBAT_ACTION` → `GameEngine.processCombatAction()`
    - `AI_TURN` → get AI move/combat action, then process it
    - `RESET_GAME` → return to idle state
    - Ignore invalid actions for current phase (return state unchanged)
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ]* 4.3 Write property test: State transitions are immutable (Property 9)
    - **Property 9: State transitions are immutable**
    - Generate arbitrary game states and actions, deep-clone state before dispatch, verify original state object is not mutated after reducer call
    - **Validates: Requirements 3.3**

  - [x] 4.4 Implement GameContext provider (`src/state/GameContext.tsx`)
    - Create `GameContext` with `useReducer` hook wrapping `gameReducer`
    - Expose `state` (read-only) and `dispatch` via context
    - Create `GameProvider` component and `useGame` custom hook
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 5. Implement i18n system
  - [x] 5.1 Create translation resource files (`src/i18n/en.json`, `es.json`, `pt.json`)
    - Define all translation keys: game title, start button, turn indicator, game over messages, player names, weapon names, combat actions, audio controls, language labels
    - Ensure all three locales have identical key sets
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

  - [x] 5.2 Implement i18n module (`src/i18n/index.ts`)
    - Implement `t(key, locale, params?)` function that resolves keys with interpolation (e.g., `{{player}}`)
    - Default to English when no locale is set
    - Create `I18nContext` and `I18nProvider` with `useI18n` hook exposing `t`, `locale`, and `setLocale`
    - _Requirements: 12.2, 12.3, 12.4_

  - [ ]* 5.3 Write property test: All i18n keys resolve for every supported locale (Property 10)
    - **Property 10: All i18n keys resolve for every supported locale**
    - Enumerate all keys used in the app, verify each key returns a non-empty string for en, es, and pt
    - **Validates: Requirements 12.2**

- [x] 6. Checkpoint - Engine, state, and i18n complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement React UI components
  - [x] 7.1 Implement App component (`src/components/App.tsx`, `App.module.css`)
    - Wrap in `GameProvider` and `I18nProvider`
    - Render three-column layout: PlayerPanel (Chavo) | Board | PlayerPanel (Kiko)
    - Render GameHeader above, GameControls below
    - Conditionally render GameOverModal when phase is 'gameOver'
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 10.1, 10.2_

  - [x] 7.2 Implement Board and Tile components (`src/components/Board.tsx`, `Tile.tsx`)
    - Board: render 10×10 CSS Grid of Tile components from board state via context
    - Tile: display appropriate image based on content (player/weapon/obstacle/empty)
    - Tile: apply highlight class when tile is in `validMoves` array
    - Tile: handle click → dispatch `MOVE_PLAYER` action when highlighted
    - Use `onError` handler on `<img>` elements to show fallback placeholder on load failure
    - _Requirements: 2.1, 4.1, 5.1, 5.5, 9.3, 9.4, 9.5, 9.7, 13.1, 13.3_

  - [x] 7.3 Implement PlayerPanel component (`src/components/PlayerPanel.tsx`)
    - Display animated GIF (chavo_anim.gif / kiko_anim.gif), HP bar, current weapon image, damage value
    - For Player 1: show Attack/Defend buttons during combat phase
    - For Player 2: show AI status text during AI turn
    - Visually distinguish active player with border/glow effect
    - _Requirements: 2.2, 6.2, 7.1, 7.6, 9.3, 9.6_

  - [x] 7.4 Implement GameHeader component (`src/components/GameHeader.tsx`)
    - Display translated game title
    - Display turn indicator showing active player name
    - _Requirements: 2.3_

  - [x] 7.5 Implement GameControls, AudioController, and LanguageSelector (`src/components/GameControls.tsx`, `AudioController.tsx`, `LanguageSelector.tsx`)
    - GameControls: render Start Game button, AudioController, LanguageSelector
    - AudioController: manage background music (chavo-del-ocho.mp3) with play/pause/volume via HTML5 Audio API, wrap in try/catch for autoplay blocking
    - LanguageSelector: three buttons (EN/ES/PT) that call `setLocale` from i18n context
    - _Requirements: 2.4, 11.1, 11.2, 11.3, 12.1_

  - [x] 7.6 Implement GameOverModal component (`src/components/GameOverModal.tsx`)
    - Display winner name/image and "Play Again" button
    - "Play Again" dispatches `RESET_GAME` then `START_GAME`
    - _Requirements: 8.2, 8.3_

- [x] 8. Wire AI turn automation and game flow
  - After Player 1 moves (and no combat), trigger AI_TURN dispatch with a short delay for UX
  - During combat, after Player 1 chooses action, trigger AI combat action automatically
  - Handle full game loop: movement → weapon pickup → adjacency check → combat → win check → turn switch
  - _Requirements: 5.6, 5.7, 5.8, 7.2, 7.7_

- [x] 9. Implement CSS Modules styling and responsive layout
  - [x] 9.1 Style Board and Tile components (`Board.module.css`, `Tile.module.css`)
    - CSS Grid for 10×10 layout with square tiles
    - Tile highlight animation for valid moves
    - Smooth transitions for player movement
    - Responsive tile sizing that scales with viewport
    - _Requirements: 9.1, 9.7, 9.8, 10.1, 10.3_

  - [x] 9.2 Style PlayerPanel component (`PlayerPanel.module.css`)
    - HP bar with color gradient (green → red)
    - Active player glow/border effect
    - Combat button styling
    - _Requirements: 9.1, 9.6_

  - [x] 9.3 Style App layout, GameHeader, GameControls, and GameOverModal
    - Three-column responsive layout (PlayerPanel | Board | PlayerPanel)
    - Cohesive "El Chavo del Ocho" color scheme and theme
    - Responsive from 768px to 1920px without horizontal scrolling
    - GameOverModal overlay styling
    - _Requirements: 9.1, 9.2, 10.1, 10.2_

- [x] 10. Checkpoint - Full UI and styling complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Final integration and cleanup
  - [x] 11.1 Verify all existing assets are referenced correctly
    - Confirm all images from `images/` directory are used: chavo.png, kiko.png, chavo_anim.gif, kiko_anim.gif, torta.png, supertorta.png, resortera.png, ramon_static.png, barriga.png, barril2.png
    - Confirm all audio from `assets/` directory is referenced: chavo-del-ocho.mp3, nomesimpatizas.mp3, pipipipi.mp3
    - Ensure image fallback placeholders work on load failure
    - _Requirements: 13.1, 13.2, 13.3_

  - [x] 11.2 Verify legacy dependencies are eliminated
    - Ensure no runtime imports of jQuery, Bootstrap CSS, or Font Awesome
    - Confirm production build produces optimized, minified static assets
    - _Requirements: 1.2, 1.5_

  - [ ]* 11.3 Write unit tests for React components
    - Test Board renders 10×10 grid of tiles
    - Test PlayerPanel renders HP, weapon image, combat buttons conditionally
    - Test GameOverModal shows winner and Play Again button
    - Test AudioController play/pause controls
    - _Requirements: 2.1, 2.2, 8.2, 11.2_

- [x] 12. Final checkpoint - All tests pass and app is complete
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate the 10 universal correctness properties from the design document
- The game engine (tasks 2.x) has zero DOM/React dependencies, enabling future React Native reuse (Req 14)
- Legacy jQuery/Bootstrap/Font Awesome directories are not modified — they are simply not imported by the new app
