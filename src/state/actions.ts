// ============================================================
// State Layer — Action Types & Action Creators
// ============================================================
//
// The canonical GameAction union lives in the platform-agnostic
// engine (src/engine/types.ts). This module re-exports it and
// provides convenience action creator functions for the React
// state layer.
// ============================================================

export type {
  GameAction,
  CombatAction,
  Position,
} from '../engine/types';

import type { CombatAction, GameAction, Position } from '../engine/types';

// ---- Action Creators ----

export const startGame = (): GameAction => ({ type: 'START_GAME' });

export const movePlayer = (position: Position): GameAction => ({
  type: 'MOVE_PLAYER',
  position,
});

export const combatAction = (action: CombatAction): GameAction => ({
  type: 'COMBAT_ACTION',
  action,
});

export const aiTurn = (): GameAction => ({ type: 'AI_TURN' });

export const resetGame = (): GameAction => ({ type: 'RESET_GAME' });
