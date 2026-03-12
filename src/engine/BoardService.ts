// ============================================================
// BoardService — Board generation and spatial queries
// Pure TypeScript, zero DOM/React imports
// ============================================================

import {
  Position,
  Tile,
  BoardState,
  PlayerState,
  WEAPONS,
  GRID_SIZE,
  OBSTACLE_COUNT,
  MAX_MOVE_RANGE,
} from './types';

// ---- Helpers ------------------------------------------------

/** Create an empty 2D tile grid */
function createEmptyGrid(size: number): Tile[][] {
  const tiles: Tile[][] = [];
  for (let y = 0; y < size; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < size; x++) {
      row.push({ position: { x, y }, content: { type: 'empty' } });
    }
    tiles.push(row);
  }
  return tiles;
}

/** Pick a random unoccupied position from the grid */
function randomUnoccupiedPosition(tiles: Tile[][], size: number): Position {
  for (let attempt = 0; attempt < 1000; attempt++) {
    const x = Math.floor(Math.random() * size);
    const y = Math.floor(Math.random() * size);
    if (tiles[y][x].content.type === 'empty') {
      return { x, y };
    }
  }
  throw new Error('Failed to find an unoccupied tile after 1000 attempts');
}

// ---- Public API ---------------------------------------------

export interface GenerateBoardResult {
  board: BoardState;
  player1: PlayerState;
  player2: PlayerState;
}

/**
 * Generate a fresh board with randomly placed obstacles, weapons, and players.
 * Each player is assigned a random starting weapon.
 */
export function generateBoard(): GenerateBoardResult {
  const tiles = createEmptyGrid(GRID_SIZE);

  // Place obstacles
  for (let i = 0; i < OBSTACLE_COUNT; i++) {
    const pos = randomUnoccupiedPosition(tiles, GRID_SIZE);
    tiles[pos.y][pos.x] = {
      position: pos,
      content: { type: 'obstacle' },
    };
  }

  // Place weapons (one of each type)
  for (const weapon of WEAPONS) {
    const pos = randomUnoccupiedPosition(tiles, GRID_SIZE);
    tiles[pos.y][pos.x] = {
      position: pos,
      content: { type: 'weapon', weapon },
    };
  }

  // Place players at distinct unoccupied positions
  const p1Pos = randomUnoccupiedPosition(tiles, GRID_SIZE);
  tiles[p1Pos.y][p1Pos.x] = {
    position: p1Pos,
    content: { type: 'player', playerId: 'player1' },
  };

  const p2Pos = randomUnoccupiedPosition(tiles, GRID_SIZE);
  tiles[p2Pos.y][p2Pos.x] = {
    position: p2Pos,
    content: { type: 'player', playerId: 'player2' },
  };

  // Assign each player a random starting weapon
  const p1Weapon = WEAPONS[Math.floor(Math.random() * WEAPONS.length)];
  const p2Weapon = WEAPONS[Math.floor(Math.random() * WEAPONS.length)];

  const board: BoardState = { gridSize: GRID_SIZE, tiles };

  const player1: PlayerState = {
    id: 'player1',
    position: p1Pos,
    hp: 100,
    weapon: p1Weapon,
    combatAction: null,
  };

  const player2: PlayerState = {
    id: 'player2',
    position: p2Pos,
    hp: 100,
    weapon: p2Weapon,
    combatAction: null,
  };

  return { board, player1, player2 };
}

/**
 * Calculate valid movement tiles for a player.
 * Movement is up to `maxRange` tiles in each cardinal direction,
 * blocked by obstacles and the other player (cannot pass through either).
 */
export function getValidMovesForPlayer(
  board: BoardState,
  playerPosition: Position,
  otherPlayerPosition: Position,
  maxRange: number = MAX_MOVE_RANGE,
): Position[] {
  const moves: Position[] = [];
  const directions: Position[] = [
    { x: 0, y: -1 }, // up
    { x: 0, y: 1 },  // down
    { x: -1, y: 0 }, // left
    { x: 1, y: 0 },  // right
  ];

  for (const dir of directions) {
    for (let step = 1; step <= maxRange; step++) {
      const nx = playerPosition.x + dir.x * step;
      const ny = playerPosition.y + dir.y * step;

      // Out of bounds — stop in this direction
      if (nx < 0 || nx >= board.gridSize || ny < 0 || ny >= board.gridSize) {
        break;
      }

      const tile = board.tiles[ny][nx];

      // Obstacle — blocked, stop in this direction
      if (tile.content.type === 'obstacle') {
        break;
      }

      // Other player — blocked, cannot pass through
      if (nx === otherPlayerPosition.x && ny === otherPlayerPosition.y) {
        break;
      }

      // Valid tile (empty or weapon)
      moves.push({ x: nx, y: ny });
    }
  }

  return moves;
}

/**
 * Check if two positions are adjacent (share a horizontal or vertical edge).
 * Diagonal positions are NOT adjacent.
 */
export function areAdjacent(a: Position, b: Position): boolean {
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);
  return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
}

/**
 * Return the tile at a given position.
 */
export function getTileAt(board: BoardState, position: Position): Tile {
  return board.tiles[position.y][position.x];
}
