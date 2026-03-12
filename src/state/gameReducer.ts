// ============================================================
// Game Reducer — Pure function mapping actions to state transitions
// Delegates all game logic to the platform-agnostic GameEngine
// ============================================================

import type { GameAction } from './actions';
import type { GameState } from '../engine/types';
import { GRID_SIZE } from '../engine/types';
import {
  initializeGame,
  processMove,
  processCombatAction,
  getAIMove,
  getAICombatAction,
} from '../engine/GameEngine';

// ---- Initial State ------------------------------------------

/** Empty board for the idle state (before any game starts) */
function createEmptyBoard() {
  const tiles = Array.from({ length: GRID_SIZE }, (_, y) =>
    Array.from({ length: GRID_SIZE }, (_, x) => ({
      position: { x, y },
      content: { type: 'empty' as const },
    })),
  );
  return { gridSize: GRID_SIZE, tiles };
}

const defaultWeapon = {
  id: 'torta',
  name: 'weapon.torta',
  damage: 15,
  image: '/images/torta.png',
};

export const INITIAL_STATE: GameState = {
  board: createEmptyBoard(),
  players: {
    player1: {
      id: 'player1',
      position: { x: 0, y: 0 },
      hp: 100,
      weapon: defaultWeapon,
      combatAction: null,
    },
    player2: {
      id: 'player2',
      position: { x: 9, y: 9 },
      hp: 100,
      weapon: defaultWeapon,
      combatAction: null,
    },
  },
  activePlayer: 'player1',
  phase: 'idle',
  winner: null,
  validMoves: [],
};

// ---- Reducer ------------------------------------------------

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      if (state.phase !== 'idle') return state;
      return initializeGame();
    }

    case 'MOVE_PLAYER': {
      if (state.phase !== 'movement') return state;
      return processMove(state, action.position);
    }

    case 'COMBAT_ACTION': {
      if (state.phase !== 'combat') return state;
      return processCombatAction(state, action.action);
    }

    case 'AI_TURN': {
      if (state.phase === 'movement') {
        const aiMove = getAIMove(state);
        return processMove(state, aiMove);
      }
      if (state.phase === 'combat') {
        const aiCombatAction = getAICombatAction(state);
        return processCombatAction(state, aiCombatAction);
      }
      return state;
    }

    case 'RESET_GAME': {
      return INITIAL_STATE;
    }

    default:
      return state;
  }
}
