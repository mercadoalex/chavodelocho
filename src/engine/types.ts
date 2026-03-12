// ============================================================
// Core Types and Interfaces — Platform-Agnostic Game Engine
// ============================================================

/** Board position (0-indexed coordinates within the grid) */
export interface Position {
  x: number; // 0–9
  y: number; // 0–9
}

/** Weapon definition with damage value and asset reference */
export interface WeaponDefinition {
  id: string;    // 'torta' | 'supertorta' | 'slingshot' | 'ramon' | 'barriga'
  name: string;  // i18n key (e.g. 'weapon.torta')
  damage: number;
  image: string; // Path to image asset
}

/** Discriminated union for tile contents */
export type TileContent =
  | { type: 'empty' }
  | { type: 'obstacle' }
  | { type: 'weapon'; weapon: WeaponDefinition }
  | { type: 'player'; playerId: PlayerId };

/** A single cell in the grid */
export interface Tile {
  position: Position;
  content: TileContent;
}

/** Player identifier */
export type PlayerId = 'player1' | 'player2';

/** Per-player runtime state */
export interface PlayerState {
  id: PlayerId;
  position: Position;
  hp: number; // 0–100
  weapon: WeaponDefinition;
  combatAction: CombatAction | null;
}

/** Combat action choice */
export type CombatAction = 'attack' | 'defend';

/** The board grid */
export interface BoardState {
  gridSize: number; // 10
  tiles: Tile[][];  // gridSize × gridSize matrix
}

/** Game phase */
export type GamePhase = 'idle' | 'movement' | 'combat' | 'gameOver';

/** Complete game state */
export interface GameState {
  board: BoardState;
  players: Record<PlayerId, PlayerState>;
  activePlayer: PlayerId;
  phase: GamePhase;
  winner: PlayerId | null;
  validMoves: Position[];
}

/** Result of a single combat round */
export interface CombatResult {
  player1HPDelta: number;
  player2HPDelta: number;
}

/** Win-condition check result */
export interface WinResult {
  winner: PlayerId;
  loser: PlayerId;
}

/** Reducer action union */
export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'MOVE_PLAYER'; position: Position }
  | { type: 'COMBAT_ACTION'; action: CombatAction }
  | { type: 'AI_TURN' }
  | { type: 'RESET_GAME' };

// ============================================================
// Constants
// ============================================================

export const GRID_SIZE = 10;
export const OBSTACLE_COUNT = 12;
export const MAX_MOVE_RANGE = 3;

/** All weapon definitions with correct damage values */
export const WEAPONS: WeaponDefinition[] = [
  { id: 'torta',      name: 'weapon.torta',      damage: 15, image: '/images/torta.png' },
  { id: 'supertorta', name: 'weapon.supertorta',  damage: 25, image: '/images/supertorta.png' },
  { id: 'slingshot',  name: 'weapon.slingshot',   damage: 30, image: '/images/resortera.png' },
  { id: 'ramon',      name: 'weapon.ramon',       damage: 35, image: '/images/ramon_static.png' },
  { id: 'barriga',    name: 'weapon.barriga',     damage: 20, image: '/images/barriga.png' },
];
