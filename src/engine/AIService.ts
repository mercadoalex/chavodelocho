// ============================================================
// AIService — AI decision-making for Player 2
// Pure TypeScript, zero DOM/React imports
// ============================================================

import { GameState, Position, CombatAction } from './types';
import { getValidMovesForPlayer } from './BoardService';

/**
 * Manhattan distance between two positions.
 */
function manhattanDistance(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/**
 * Find all weapon positions on the board.
 */
function findWeaponPositions(state: GameState): Position[] {
  const positions: Position[] = [];
  const { tiles, gridSize } = state.board;
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (tiles[y][x].content.type === 'weapon') {
        positions.push({ x, y });
      }
    }
  }
  return positions;
}

/**
 * Select a valid movement tile for Player 2.
 *
 * Strategy:
 * - If weapons exist on the board, prefer moving toward the nearest weapon.
 * - Otherwise, move toward Player 1.
 * - If no valid moves exist, return Player 2's current position and log a warning.
 */
export function chooseMove(state: GameState): Position {
  const p2 = state.players.player2;
  const p1 = state.players.player1;

  const validMoves = getValidMovesForPlayer(
    state.board,
    p2.position,
    p1.position,
  );

  if (validMoves.length === 0) {
    console.warn('AIService: No valid moves available for Player 2, returning current position.');
    return p2.position;
  }

  const weaponPositions = findWeaponPositions(state);

  // Determine the target: nearest weapon if any exist, otherwise Player 1
  let target: Position;

  if (weaponPositions.length > 0) {
    // Find the nearest weapon to Player 2's current position
    let nearestWeapon = weaponPositions[0];
    let nearestDist = manhattanDistance(p2.position, nearestWeapon);

    for (let i = 1; i < weaponPositions.length; i++) {
      const dist = manhattanDistance(p2.position, weaponPositions[i]);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestWeapon = weaponPositions[i];
      }
    }
    target = nearestWeapon;
  } else {
    target = p1.position;
  }

  // Pick the valid move that minimizes Manhattan distance to the target
  let bestMove = validMoves[0];
  let bestDist = manhattanDistance(validMoves[0], target);

  for (let i = 1; i < validMoves.length; i++) {
    const dist = manhattanDistance(validMoves[i], target);
    if (dist < bestDist) {
      bestDist = dist;
      bestMove = validMoves[i];
    }
  }

  return bestMove;
}

/**
 * Select a combat action for Player 2.
 *
 * Strategy: weighted random — 70% attack, 30% defend.
 */
export function chooseCombatAction(_state: GameState): CombatAction {
  return Math.random() < 0.7 ? 'attack' : 'defend';
}
