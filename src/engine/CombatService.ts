// ============================================================
// CombatService — Pure combat resolution logic (no DOM/React)
// ============================================================

import type { CombatAction, WeaponDefinition, CombatResult, WinResult } from './types';

/**
 * Resolve a single combat round between two players.
 *
 * Rules:
 *  - Both attack → each loses the opponent's full weapon damage
 *  - One attacks, one defends → defender loses half the attacker's damage
 *  - Both defend → no damage
 *
 * Returns HP deltas as negative numbers (or zero).
 */
export function resolveCombat(
  player1Action: CombatAction,
  player2Action: CombatAction,
  player1Weapon: WeaponDefinition,
  player2Weapon: WeaponDefinition,
): CombatResult {
  let player1HPDelta = 0;
  let player2HPDelta = 0;

  if (player1Action === 'attack' && player2Action === 'attack') {
    // Both attack: full damage exchange
    player1HPDelta = -player2Weapon.damage;
    player2HPDelta = -player1Weapon.damage;
  } else if (player1Action === 'attack' && player2Action === 'defend') {
    // Player1 attacks, Player2 defends: defender takes half damage
    player2HPDelta = -Math.floor(player1Weapon.damage / 2);
  } else if (player1Action === 'defend' && player2Action === 'attack') {
    // Player2 attacks, Player1 defends: defender takes half damage
    player1HPDelta = -Math.floor(player2Weapon.damage / 2);
  }
  // Both defend: no damage (deltas stay 0)

  return { player1HPDelta, player2HPDelta };
}

/**
 * Check whether either player has been eliminated (HP ≤ 0).
 * Returns the winner/loser pair, or null if both are still alive.
 */
export function checkWinCondition(
  player1HP: number,
  player2HP: number,
): WinResult | null {
  if (player1HP <= 0 && player2HP <= 0) {
    // Both eliminated simultaneously — player2 wins (attacker advantage)
    // Design doesn't specify this edge case explicitly; default to player2.
    return { winner: 'player2', loser: 'player1' };
  }
  if (player1HP <= 0) {
    return { winner: 'player2', loser: 'player1' };
  }
  if (player2HP <= 0) {
    return { winner: 'player1', loser: 'player2' };
  }
  return null;
}
