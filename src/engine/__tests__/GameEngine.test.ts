import { describe, it, expect } from 'vitest';
import {
  initializeGame,
  processMove,
  processCombatAction,
  getValidMoves,
  getAIMove,
  getAICombatAction,
} from '../GameEngine';
import {
  GameState,
  BoardState,
  PlayerState,
  Tile,
  WEAPONS,
  GRID_SIZE,
} from '../types';

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
    weapon: WEAPONS[0], // torta, damage 15
    combatAction: null,
  };
}

function makeState(overrides: Partial<GameState> & { board: BoardState; players: GameState['players'] }): GameState {
  return {
    activePlayer: 'player1',
    phase: 'movement',
    winner: null,
    validMoves: [],
    ...overrides,
  };
}

/** Build a game state with players placed on the board and valid moves computed */
function buildMovementState(
  p1x: number, p1y: number,
  p2x: number, p2y: number,
  extraSetup?: (board: BoardState) => void,
): GameState {
  const board = createEmptyBoard();
  board.tiles[p1y][p1x].content = { type: 'player', playerId: 'player1' };
  board.tiles[p2y][p2x].content = { type: 'player', playerId: 'player2' };
  if (extraSetup) extraSetup(board);

  const p1 = makePlayer('player1', p1x, p1y);
  const p2 = makePlayer('player2', p2x, p2y);

  const state = makeState({
    board,
    players: { player1: p1, player2: p2 },
    phase: 'movement',
    activePlayer: 'player1',
  });

  // Compute valid moves
  return { ...state, validMoves: getValidMoves(state) };
}

// ---- initializeGame -----------------------------------------

describe('GameEngine.initializeGame', () => {
  it('returns a valid initial game state', () => {
    const state = initializeGame();
    expect(state.phase).toBe('movement');
    expect(state.activePlayer).toBe('player1');
    expect(state.winner).toBeNull();
    expect(state.board.gridSize).toBe(GRID_SIZE);
    expect(state.players.player1.hp).toBe(100);
    expect(state.players.player2.hp).toBe(100);
  });

  it('computes valid moves for player1', () => {
    const state = initializeGame();
    expect(state.validMoves.length).toBeGreaterThan(0);
  });

  it('does not mutate across calls', () => {
    const s1 = initializeGame();
    const s2 = initializeGame();
    // Different objects
    expect(s1).not.toBe(s2);
  });
});

// ---- processMove --------------------------------------------

describe('GameEngine.processMove', () => {
  it('returns state unchanged for invalid move', () => {
    const state = buildMovementState(0, 0, 9, 9);
    const result = processMove(state, { x: 8, y: 8 }); // not a valid move
    expect(result).toBe(state);
  });

  it('updates player position on valid move', () => {
    const state = buildMovementState(5, 5, 0, 0);
    // (6,5) should be a valid move (one step right)
    expect(state.validMoves).toContainEqual({ x: 6, y: 5 });

    const result = processMove(state, { x: 6, y: 5 });
    expect(result.players.player1.position).toEqual({ x: 6, y: 5 });
  });

  it('clears old tile and sets new tile', () => {
    const state = buildMovementState(5, 5, 0, 0);
    const result = processMove(state, { x: 6, y: 5 });

    expect(result.board.tiles[5][5].content.type).toBe('empty');
    expect(result.board.tiles[5][6].content).toEqual({ type: 'player', playerId: 'player1' });
  });

  it('switches active player when not adjacent', () => {
    const state = buildMovementState(5, 5, 0, 0);
    const result = processMove(state, { x: 6, y: 5 });
    expect(result.activePlayer).toBe('player2');
    expect(result.phase).toBe('movement');
  });

  it('computes valid moves for next player after move', () => {
    const state = buildMovementState(5, 5, 0, 0);
    const result = processMove(state, { x: 6, y: 5 });
    expect(result.validMoves.length).toBeGreaterThan(0);
  });

  it('handles weapon pickup: replaces player weapon and clears tile', () => {
    const weaponOnTile = WEAPONS[3]; // ramon, damage 35
    const state = buildMovementState(5, 5, 0, 0, (board) => {
      board.tiles[5][6].content = { type: 'weapon', weapon: weaponOnTile };
    });

    const result = processMove(state, { x: 6, y: 5 });
    expect(result.players.player1.weapon.id).toBe('ramon');
    expect(result.board.tiles[5][6].content).toEqual({ type: 'player', playerId: 'player1' });
  });

  it('enters combat when move results in adjacency', () => {
    // Place players 2 apart so moving 1 step makes them adjacent
    const state = buildMovementState(5, 5, 7, 5);
    const result = processMove(state, { x: 6, y: 5 });
    expect(result.phase).toBe('combat');
    expect(result.validMoves).toEqual([]);
  });

  it('does not mutate the original state', () => {
    const state = buildMovementState(5, 5, 0, 0);
    const originalPos = { ...state.players.player1.position };
    processMove(state, { x: 6, y: 5 });
    expect(state.players.player1.position).toEqual(originalPos);
  });
});

// ---- processCombatAction ------------------------------------

describe('GameEngine.processCombatAction', () => {
  function buildCombatState(): GameState {
    const board = createEmptyBoard();
    board.tiles[5][5].content = { type: 'player', playerId: 'player1' };
    board.tiles[5][6].content = { type: 'player', playerId: 'player2' };

    const p1: PlayerState = {
      id: 'player1',
      position: { x: 5, y: 5 },
      hp: 100,
      weapon: WEAPONS[0], // torta, damage 15
      combatAction: null,
    };
    const p2: PlayerState = {
      id: 'player2',
      position: { x: 6, y: 5 },
      hp: 100,
      weapon: WEAPONS[1], // supertorta, damage 25
      combatAction: null,
    };

    return makeState({
      board,
      players: { player1: p1, player2: p2 },
      phase: 'combat',
      activePlayer: 'player1',
      validMoves: [],
    });
  }

  it('sets combatAction and switches to other player when only one has chosen', () => {
    const state = buildCombatState();
    const result = processCombatAction(state, 'attack');
    expect(result.players.player1.combatAction).toBe('attack');
    expect(result.activePlayer).toBe('player2');
  });

  it('resolves combat when both players have chosen (attack/attack)', () => {
    const state = buildCombatState();
    // Player 1 chooses attack
    const afterP1 = processCombatAction(state, 'attack');
    // Player 2 chooses attack
    const result = processCombatAction(afterP1, 'attack');

    // p1 takes p2's weapon damage (25), p2 takes p1's weapon damage (15)
    expect(result.players.player1.hp).toBe(75); // 100 - 25
    expect(result.players.player2.hp).toBe(85); // 100 - 15
    expect(result.players.player1.combatAction).toBeNull();
    expect(result.players.player2.combatAction).toBeNull();
  });

  it('resolves combat (attack/defend): defender takes half damage', () => {
    const state = buildCombatState();
    const afterP1 = processCombatAction(state, 'attack');
    const result = processCombatAction(afterP1, 'defend');

    // p1 attacks (damage 15), p2 defends → p2 takes floor(15/2) = 7
    expect(result.players.player1.hp).toBe(100);
    expect(result.players.player2.hp).toBe(93);
  });

  it('resolves combat (defend/defend): no damage', () => {
    const state = buildCombatState();
    const afterP1 = processCombatAction(state, 'defend');
    const result = processCombatAction(afterP1, 'defend');

    expect(result.players.player1.hp).toBe(100);
    expect(result.players.player2.hp).toBe(100);
  });

  it('continues combat when still adjacent and both alive', () => {
    const state = buildCombatState();
    const afterP1 = processCombatAction(state, 'attack');
    const result = processCombatAction(afterP1, 'attack');

    expect(result.phase).toBe('combat');
    expect(result.winner).toBeNull();
  });

  it('sets gameOver when a player HP reaches 0', () => {
    const state = buildCombatState();
    // Give player2 very low HP
    const lowHpState: GameState = {
      ...state,
      players: {
        ...state.players,
        player2: { ...state.players.player2, hp: 10 },
      },
    };

    const afterP1 = processCombatAction(lowHpState, 'attack');
    const result = processCombatAction(afterP1, 'attack');

    // p2 had 10 HP, takes 15 damage → -5 HP → game over
    expect(result.phase).toBe('gameOver');
    expect(result.winner).toBe('player1');
  });

  it('does not mutate the original state', () => {
    const state = buildCombatState();
    const originalHp = state.players.player1.hp;
    processCombatAction(state, 'attack');
    expect(state.players.player1.hp).toBe(originalHp);
  });
});

// ---- Delegating wrappers ------------------------------------

describe('GameEngine delegating wrappers', () => {
  it('getValidMoves returns moves for the active player', () => {
    const state = initializeGame();
    const moves = getValidMoves(state);
    expect(moves.length).toBeGreaterThan(0);
    // All moves should be within range of player1's position
    for (const m of moves) {
      const dx = Math.abs(m.x - state.players.player1.position.x);
      const dy = Math.abs(m.y - state.players.player1.position.y);
      expect(dx === 0 || dy === 0).toBe(true); // cardinal direction
      expect(dx + dy).toBeLessThanOrEqual(3);
    }
  });

  it('getAIMove returns a position', () => {
    const state = initializeGame();
    // Switch to player2's turn
    const p2State: GameState = { ...state, activePlayer: 'player2' };
    const move = getAIMove(p2State);
    expect(move).toHaveProperty('x');
    expect(move).toHaveProperty('y');
  });

  it('getAICombatAction returns attack or defend', () => {
    const state = initializeGame();
    const action = getAICombatAction(state);
    expect(['attack', 'defend']).toContain(action);
  });
});
