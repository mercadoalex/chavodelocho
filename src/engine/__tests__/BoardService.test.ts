import { describe, it, expect } from 'vitest';
import {
  generateBoard,
  getValidMovesForPlayer,
  areAdjacent,
  getTileAt,
} from '../BoardService';
import { BoardState, Position, GRID_SIZE, OBSTACLE_COUNT, WEAPONS } from '../types';

describe('BoardService', () => {
  // ---- generateBoard ----------------------------------------

  describe('generateBoard', () => {
    it('returns a 10×10 grid', () => {
      const { board } = generateBoard();
      expect(board.gridSize).toBe(GRID_SIZE);
      expect(board.tiles.length).toBe(GRID_SIZE);
      board.tiles.forEach((row) => expect(row.length).toBe(GRID_SIZE));
    });

    it('places exactly 12 obstacles', () => {
      const { board } = generateBoard();
      const obstacles = board.tiles.flat().filter((t) => t.content.type === 'obstacle');
      expect(obstacles.length).toBe(OBSTACLE_COUNT);
    });

    it('places exactly 5 weapons (one of each type)', () => {
      const { board } = generateBoard();
      const weaponTiles = board.tiles.flat().filter((t) => t.content.type === 'weapon');
      expect(weaponTiles.length).toBe(WEAPONS.length);

      const weaponIds = weaponTiles.map((t) =>
        t.content.type === 'weapon' ? t.content.weapon.id : '',
      );
      for (const w of WEAPONS) {
        expect(weaponIds).toContain(w.id);
      }
    });

    it('places 2 players at distinct positions', () => {
      const { board, player1, player2 } = generateBoard();
      // Players on the board
      const playerTiles = board.tiles.flat().filter((t) => t.content.type === 'player');
      expect(playerTiles.length).toBe(2);

      // Distinct positions
      expect(
        player1.position.x === player2.position.x && player1.position.y === player2.position.y,
      ).toBe(false);
    });

    it('assigns each player a valid weapon', () => {
      const { player1, player2 } = generateBoard();
      const validIds = WEAPONS.map((w) => w.id);
      expect(validIds).toContain(player1.weapon.id);
      expect(validIds).toContain(player2.weapon.id);
    });

    it('has no two entities sharing a tile', () => {
      const { board } = generateBoard();
      const occupied = board.tiles.flat().filter((t) => t.content.type !== 'empty');
      const positions = occupied.map((t) => `${t.position.x},${t.position.y}`);
      const unique = new Set(positions);
      expect(unique.size).toBe(positions.length);
    });

    it('sets players to 100 HP with null combatAction', () => {
      const { player1, player2 } = generateBoard();
      expect(player1.hp).toBe(100);
      expect(player2.hp).toBe(100);
      expect(player1.combatAction).toBeNull();
      expect(player2.combatAction).toBeNull();
    });
  });

  // ---- getValidMovesForPlayer --------------------------------

  describe('getValidMovesForPlayer', () => {
    /** Helper: create a minimal board with specific content placements */
    function makeBoard(
      placements: Array<{ pos: Position; content: import('../types').TileContent }>,
    ): BoardState {
      const tiles: import('../types').Tile[][] = Array.from({ length: GRID_SIZE }, (_, y) =>
        Array.from({ length: GRID_SIZE }, (_, x) => ({
          position: { x, y },
          content: { type: 'empty' as const },
        })),
      );
      for (const { pos, content } of placements) {
        tiles[pos.y][pos.x] = { position: pos, content };
      }
      return { gridSize: GRID_SIZE, tiles };
    }

    it('returns up to 3 tiles in each cardinal direction on an empty board', () => {
      const board = makeBoard([]);
      const moves = getValidMovesForPlayer(board, { x: 5, y: 5 }, { x: 0, y: 0 });
      // 3 up + 3 down + 3 left + 3 right = 12
      expect(moves.length).toBe(12);
    });

    it('stops at board edges', () => {
      const board = makeBoard([]);
      // Player at corner (0,0), other player far away
      const moves = getValidMovesForPlayer(board, { x: 0, y: 0 }, { x: 9, y: 9 });
      // right: (1,0),(2,0),(3,0) = 3; down: (0,1),(0,2),(0,3) = 3; up/left: 0
      expect(moves.length).toBe(6);
    });

    it('is blocked by obstacles', () => {
      const board = makeBoard([
        { pos: { x: 5, y: 3 }, content: { type: 'obstacle' } }, // blocks up at step 2
      ]);
      const moves = getValidMovesForPlayer(board, { x: 5, y: 5 }, { x: 0, y: 0 });
      // up: (5,4) only — (5,3) is obstacle, blocked
      const upMoves = moves.filter((m) => m.x === 5 && m.y < 5);
      expect(upMoves.length).toBe(1);
      expect(upMoves[0]).toEqual({ x: 5, y: 4 });
    });

    it('is blocked by the other player (cannot pass through)', () => {
      const board = makeBoard([]);
      // Other player at (5,4), one step up from (5,5)
      const moves = getValidMovesForPlayer(board, { x: 5, y: 5 }, { x: 5, y: 4 });
      const upMoves = moves.filter((m) => m.x === 5 && m.y < 5);
      // Cannot move up at all — other player blocks at step 1
      expect(upMoves.length).toBe(0);
    });

    it('includes weapon tiles as valid moves', () => {
      const board = makeBoard([
        { pos: { x: 6, y: 5 }, content: { type: 'weapon', weapon: WEAPONS[0] } },
      ]);
      const moves = getValidMovesForPlayer(board, { x: 5, y: 5 }, { x: 0, y: 0 });
      expect(moves).toContainEqual({ x: 6, y: 5 });
    });

    it('respects custom maxRange', () => {
      const board = makeBoard([]);
      const moves = getValidMovesForPlayer(board, { x: 5, y: 5 }, { x: 0, y: 0 }, 1);
      // 1 in each direction = 4
      expect(moves.length).toBe(4);
    });
  });

  // ---- areAdjacent -------------------------------------------

  describe('areAdjacent', () => {
    it('returns true for horizontally adjacent tiles', () => {
      expect(areAdjacent({ x: 3, y: 5 }, { x: 4, y: 5 })).toBe(true);
      expect(areAdjacent({ x: 4, y: 5 }, { x: 3, y: 5 })).toBe(true);
    });

    it('returns true for vertically adjacent tiles', () => {
      expect(areAdjacent({ x: 3, y: 5 }, { x: 3, y: 6 })).toBe(true);
      expect(areAdjacent({ x: 3, y: 6 }, { x: 3, y: 5 })).toBe(true);
    });

    it('returns false for diagonal tiles', () => {
      expect(areAdjacent({ x: 3, y: 5 }, { x: 4, y: 6 })).toBe(false);
    });

    it('returns false for the same tile', () => {
      expect(areAdjacent({ x: 3, y: 5 }, { x: 3, y: 5 })).toBe(false);
    });

    it('returns false for tiles more than 1 apart', () => {
      expect(areAdjacent({ x: 3, y: 5 }, { x: 5, y: 5 })).toBe(false);
    });
  });

  // ---- getTileAt ---------------------------------------------

  describe('getTileAt', () => {
    it('returns the correct tile', () => {
      const { board } = generateBoard();
      const tile = getTileAt(board, { x: 0, y: 0 });
      expect(tile.position).toEqual({ x: 0, y: 0 });
    });

    it('returns obstacle tile when obstacle is placed', () => {
      const tiles: import('../types').Tile[][] = Array.from({ length: GRID_SIZE }, (_, y) =>
        Array.from({ length: GRID_SIZE }, (_, x) => ({
          position: { x, y },
          content: { type: 'empty' as const },
        })),
      );
      tiles[3][4] = { position: { x: 4, y: 3 }, content: { type: 'obstacle' } };
      const board: BoardState = { gridSize: GRID_SIZE, tiles };
      const tile = getTileAt(board, { x: 4, y: 3 });
      expect(tile.content.type).toBe('obstacle');
    });
  });
});
