import { describe, it, expect, vi } from 'vitest';
import { chooseMove, chooseCombatAction } from '../AIService';
import { GameState, BoardState, PlayerState, Tile, WEAPONS, GRID_SIZE } from '../types';

// ---- Helpers ------------------------------------------------

function createEmptyBoard(): BoardState {
  const tiles: Tile[][] = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      row.push({ position: { x, y }, content: { type: 'empty' } });
    }
    tiles.push(row);
  }
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

function makeState(overrides: Partial<GameState> & { board: BoardState; players: GameState['players'] }): GameState {
  return {
    activePlayer: 'player2',
    phase: 'movement',
    winner: null,
    validMoves: [],
    ...overrides,
  };
}

// ---- chooseMove tests ---------------------------------------

describe('AIService.chooseMove', () => {
  it('returns a valid move that moves toward Player 1 when no weapons on board', () => {
    const board = createEmptyBoard();
    const p1 = makePlayer('player1', 0, 0);
    const p2 = makePlayer('player2', 5, 5);
    board.tiles[0][0].content = { type: 'player', playerId: 'player1' };
    board.tiles[5][5].content = { type: 'player', playerId: 'player2' };

    const state = makeState({ board, players: { player1: p1, player2: p2 } });
    const move = chooseMove(state);

    // Should move closer to Player 1 (0,0)
    const currentDist = Math.abs(5 - 0) + Math.abs(5 - 0); // 10
    const moveDist = Math.abs(move.x - 0) + Math.abs(move.y - 0);
    expect(moveDist).toBeLessThan(currentDist);
  });

  it('prefers moving toward a weapon when weapons exist on the board', () => {
    const board = createEmptyBoard();
    const p1 = makePlayer('player1', 9, 9);
    const p2 = makePlayer('player2', 5, 5);
    board.tiles[9][9].content = { type: 'player', playerId: 'player1' };
    board.tiles[5][5].content = { type: 'player', playerId: 'player2' };

    // Place a weapon close to Player 2
    board.tiles[5][7].content = { type: 'weapon', weapon: WEAPONS[2] };

    const state = makeState({ board, players: { player1: p1, player2: p2 } });
    const move = chooseMove(state);

    // Should move closer to the weapon at (7,5) rather than Player 1 at (9,9)
    const distToWeapon = Math.abs(move.x - 7) + Math.abs(move.y - 5);
    expect(distToWeapon).toBeLessThanOrEqual(2); // weapon is 2 away, should get closer
  });

  it('returns current position and warns when no valid moves exist', () => {
    const board = createEmptyBoard();
    const p2 = makePlayer('player2', 0, 0);
    const p1 = makePlayer('player1', 2, 0);
    board.tiles[0][0].content = { type: 'player', playerId: 'player2' };
    board.tiles[0][2].content = { type: 'player', playerId: 'player1' };

    // Surround Player 2 with obstacles
    board.tiles[0][1].content = { type: 'obstacle' };
    board.tiles[1][0].content = { type: 'obstacle' };

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const state = makeState({ board, players: { player1: p1, player2: p2 } });
    const move = chooseMove(state);

    expect(move).toEqual({ x: 0, y: 0 });
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('No valid moves'),
    );

    warnSpy.mockRestore();
  });

  it('picks the move closest to the nearest weapon among multiple weapons', () => {
    const board = createEmptyBoard();
    const p1 = makePlayer('player1', 0, 0);
    const p2 = makePlayer('player2', 5, 5);
    board.tiles[0][0].content = { type: 'player', playerId: 'player1' };
    board.tiles[5][5].content = { type: 'player', playerId: 'player2' };

    // Far weapon
    board.tiles[0][9].content = { type: 'weapon', weapon: WEAPONS[0] };
    // Near weapon at (5, 3) — distance 2 from p2
    board.tiles[3][5].content = { type: 'weapon', weapon: WEAPONS[1] };

    const state = makeState({ board, players: { player1: p1, player2: p2 } });
    const move = chooseMove(state);

    // Should move toward the nearer weapon at (5, 3)
    const distToNear = Math.abs(move.x - 5) + Math.abs(move.y - 3);
    expect(distToNear).toBeLessThan(2); // should be closer than p2's starting distance of 2
  });
});

// ---- chooseCombatAction tests -------------------------------

describe('AIService.chooseCombatAction', () => {
  it('returns either attack or defend', () => {
    const board = createEmptyBoard();
    const p1 = makePlayer('player1', 0, 0);
    const p2 = makePlayer('player2', 1, 0);
    const state = makeState({
      board,
      players: { player1: p1, player2: p2 },
      phase: 'combat',
    });

    const action = chooseCombatAction(state);
    expect(['attack', 'defend']).toContain(action);
  });

  it('produces both attack and defend over many calls (statistical)', () => {
    const board = createEmptyBoard();
    const p1 = makePlayer('player1', 0, 0);
    const p2 = makePlayer('player2', 1, 0);
    const state = makeState({
      board,
      players: { player1: p1, player2: p2 },
      phase: 'combat',
    });

    const results = new Set<string>();
    for (let i = 0; i < 100; i++) {
      results.add(chooseCombatAction(state));
    }

    expect(results.has('attack')).toBe(true);
    expect(results.has('defend')).toBe(true);
  });
});
