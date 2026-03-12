import { describe, it, expect } from 'vitest';
import { gameReducer, INITIAL_STATE } from '../gameReducer';
import type { GameState, PlayerState, BoardState, Tile } from '../../engine/types';
import { WEAPONS, GRID_SIZE } from '../../engine/types';
import { getValidMoves } from '../../engine/GameEngine';

// ---- Helpers ------------------------------------------------

function createEmptyBoard(): BoardState {
  const tiles: Tile[][] = Array.from({ length: GRID_SIZE }, (_, y) =>
    Array.from({ length: GRID_SIZE }, (_, x) => ({
      position: { x, y },
      content: { type: 'empty' as const },
    })),
  );
  return { gridSize: GRID_SIZE, tiles };
}

function makePlayer(id: 'player1' | 'player2', x: number, y: number): PlayerState {
  return {
    id,
    position: { x, y },
    hp: 100,
    weapon: WEAPONS[0],
    combatAction: null,
  };
}

function buildMovementState(
  p1x: number, p1y: number,
  p2x: number, p2y: number,
): GameState {
  const board = createEmptyBoard();
  board.tiles[p1y][p1x].content = { type: 'player', playerId: 'player1' };
  board.tiles[p2y][p2x].content = { type: 'player', playerId: 'player2' };

  const state: GameState = {
    board,
    players: {
      player1: makePlayer('player1', p1x, p1y),
      player2: makePlayer('player2', p2x, p2y),
    },
    activePlayer: 'player1',
    phase: 'movement',
    winner: null,
    validMoves: [],
  };
  return { ...state, validMoves: getValidMoves(state) };
}

function buildCombatState(): GameState {
  const board = createEmptyBoard();
  board.tiles[5][5].content = { type: 'player', playerId: 'player1' };
  board.tiles[5][6].content = { type: 'player', playerId: 'player2' };

  return {
    board,
    players: {
      player1: { ...makePlayer('player1', 5, 5), weapon: WEAPONS[0] },
      player2: { ...makePlayer('player2', 6, 5), weapon: WEAPONS[1] },
    },
    activePlayer: 'player1',
    phase: 'combat',
    winner: null,
    validMoves: [],
  };
}

// ---- INITIAL_STATE ------------------------------------------

describe('INITIAL_STATE', () => {
  it('has idle phase with empty board', () => {
    expect(INITIAL_STATE.phase).toBe('idle');
    expect(INITIAL_STATE.winner).toBeNull();
    expect(INITIAL_STATE.validMoves).toEqual([]);
    expect(INITIAL_STATE.board.gridSize).toBe(GRID_SIZE);
  });

  it('has both players with 100 HP', () => {
    expect(INITIAL_STATE.players.player1.hp).toBe(100);
    expect(INITIAL_STATE.players.player2.hp).toBe(100);
  });
});

// ---- START_GAME ---------------------------------------------

describe('gameReducer START_GAME', () => {
  it('initializes a new game from idle state', () => {
    const result = gameReducer(INITIAL_STATE, { type: 'START_GAME' });
    expect(result.phase).toBe('movement');
    expect(result.activePlayer).toBe('player1');
    expect(result.validMoves.length).toBeGreaterThan(0);
  });

  it('ignores START_GAME when not in idle phase', () => {
    const movementState = buildMovementState(5, 5, 0, 0);
    const result = gameReducer(movementState, { type: 'START_GAME' });
    expect(result).toBe(movementState);
  });
});

// ---- MOVE_PLAYER --------------------------------------------

describe('gameReducer MOVE_PLAYER', () => {
  it('processes a valid move during movement phase', () => {
    const state = buildMovementState(5, 5, 0, 0);
    const target = state.validMoves[0];
    const result = gameReducer(state, { type: 'MOVE_PLAYER', position: target });
    expect(result.phase).toBe('movement');
    expect(result.activePlayer).toBe('player2');
  });

  it('ignores MOVE_PLAYER when not in movement phase', () => {
    const combatState = buildCombatState();
    const result = gameReducer(combatState, { type: 'MOVE_PLAYER', position: { x: 0, y: 0 } });
    expect(result).toBe(combatState);
  });

  it('ignores MOVE_PLAYER in idle phase', () => {
    const result = gameReducer(INITIAL_STATE, { type: 'MOVE_PLAYER', position: { x: 1, y: 0 } });
    expect(result).toBe(INITIAL_STATE);
  });
});

// ---- COMBAT_ACTION ------------------------------------------

describe('gameReducer COMBAT_ACTION', () => {
  it('processes combat action during combat phase', () => {
    const state = buildCombatState();
    const result = gameReducer(state, { type: 'COMBAT_ACTION', action: 'attack' });
    expect(result.players.player1.combatAction).toBe('attack');
    expect(result.activePlayer).toBe('player2');
  });

  it('ignores COMBAT_ACTION when not in combat phase', () => {
    const state = buildMovementState(5, 5, 0, 0);
    const result = gameReducer(state, { type: 'COMBAT_ACTION', action: 'attack' });
    expect(result).toBe(state);
  });

  it('ignores COMBAT_ACTION in idle phase', () => {
    const result = gameReducer(INITIAL_STATE, { type: 'COMBAT_ACTION', action: 'attack' });
    expect(result).toBe(INITIAL_STATE);
  });
});

// ---- AI_TURN ------------------------------------------------

describe('gameReducer AI_TURN', () => {
  it('processes AI move during movement phase', () => {
    const state = buildMovementState(5, 5, 0, 0);
    // Switch to player2's turn so AI has valid moves
    const p2State: GameState = {
      ...state,
      activePlayer: 'player2',
      validMoves: getValidMoves({ ...state, activePlayer: 'player2' }),
    };
    const result = gameReducer(p2State, { type: 'AI_TURN' });
    // AI should have moved player2
    expect(result.players.player2.position).not.toEqual(p2State.players.player2.position);
  });

  it('processes AI combat action during combat phase', () => {
    const state = buildCombatState();
    // Player 1 has already chosen, now it's player2's turn
    const afterP1: GameState = {
      ...state,
      players: {
        ...state.players,
        player1: { ...state.players.player1, combatAction: 'attack' },
      },
      activePlayer: 'player2',
    };
    const result = gameReducer(afterP1, { type: 'AI_TURN' });
    // Combat should have resolved (both actions chosen)
    expect(result.players.player1.combatAction).toBeNull();
    expect(result.players.player2.combatAction).toBeNull();
  });

  it('ignores AI_TURN in idle phase', () => {
    const result = gameReducer(INITIAL_STATE, { type: 'AI_TURN' });
    expect(result).toBe(INITIAL_STATE);
  });

  it('ignores AI_TURN in gameOver phase', () => {
    const gameOverState: GameState = {
      ...buildCombatState(),
      phase: 'gameOver',
      winner: 'player1',
    };
    const result = gameReducer(gameOverState, { type: 'AI_TURN' });
    expect(result).toBe(gameOverState);
  });
});

// ---- RESET_GAME ---------------------------------------------

describe('gameReducer RESET_GAME', () => {
  it('returns to idle state from any phase', () => {
    const movementState = buildMovementState(5, 5, 0, 0);
    const result = gameReducer(movementState, { type: 'RESET_GAME' });
    expect(result).toBe(INITIAL_STATE);
    expect(result.phase).toBe('idle');
  });

  it('returns to idle state from combat', () => {
    const combatState = buildCombatState();
    const result = gameReducer(combatState, { type: 'RESET_GAME' });
    expect(result).toBe(INITIAL_STATE);
  });

  it('returns to idle state from gameOver', () => {
    const gameOverState: GameState = {
      ...buildCombatState(),
      phase: 'gameOver',
      winner: 'player1',
    };
    const result = gameReducer(gameOverState, { type: 'RESET_GAME' });
    expect(result).toBe(INITIAL_STATE);
  });
});

// ---- Unknown action -----------------------------------------

describe('gameReducer unknown action', () => {
  it('returns state unchanged for unknown action type', () => {
    const result = gameReducer(INITIAL_STATE, { type: 'UNKNOWN' } as any);
    expect(result).toBe(INITIAL_STATE);
  });
});
