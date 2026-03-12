// ============================================================
// useAITurn — Automatically dispatches AI_TURN when it's
// Player 2's turn, with short delays for UX feedback.
// ============================================================

import { useEffect } from 'react';
import type { GameState } from '../engine/types';
import type { GameAction } from '../state/actions';

const AI_MOVE_DELAY = 500;    // ms delay before AI movement
const AI_COMBAT_DELAY = 800;  // ms delay before AI combat action ("AI is thinking...")

/**
 * Watches game state and dispatches AI_TURN automatically
 * when it's Player 2's turn in either movement or combat phase.
 *
 * Uses setTimeout with cleanup to avoid stale dispatches
 * when state changes before the timer fires.
 */
export function useAITurn(
  state: GameState,
  dispatch: React.Dispatch<GameAction>,
): void {
  useEffect(() => {
    // Only act when it's player2's turn
    if (state.activePlayer !== 'player2') return;

    // AI movement phase
    if (state.phase === 'movement') {
      const timer = setTimeout(() => {
        dispatch({ type: 'AI_TURN' });
      }, AI_MOVE_DELAY);
      return () => clearTimeout(timer);
    }

    // AI combat phase
    if (state.phase === 'combat') {
      const timer = setTimeout(() => {
        dispatch({ type: 'AI_TURN' });
      }, AI_COMBAT_DELAY);
      return () => clearTimeout(timer);
    }
  }, [state.activePlayer, state.phase, dispatch]);
}
