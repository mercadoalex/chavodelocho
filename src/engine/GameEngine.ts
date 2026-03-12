// ============================================================
// GameEngine — Main orchestrator for game state transitions
// Pure TypeScript, zero DOM/React imports
// All functions take a GameState and return a NEW GameState (immutable)
// ============================================================

import type {
  GameState,
  Position,
  CombatAction,
  PlayerId,
  PlayerState,
  Tile,
} from './types';
import {
  generateBoard,
  getValidMovesForPlayer,
  areAdjacent,
} from './BoardService';
import { resolveCombat, checkWinCondition } from './CombatService';
import { chooseMove, chooseCombatAction } from './AIService';

// ---- Helpers ------------------------------------------------

/** Return the other player id */
function otherPlayer(id: PlayerId): PlayerId {
  return id === 'player1' ? 'player2' : 'player1';
}

/** Deep-clone a 2D tile array */
function cloneTiles(tiles: Tile[][]): Tile[][] {
  return tiles.map(row =>
    row.map(tile => ({
      ...tile,
      content: { ...tile.content } as Tile['content'],
    })),
  );
}

// ---- Public API ---------------------------------------------

/**
 * Initialize a new game.
 * Delegates board generation to BoardService, sets phase to 'movement',
 * activePlayer to 'player1', and computes validMoves.
 */
export function initializeGame(): GameState {
  const { board, player1, player2 } = generateBoard();

  const validMoves = getValidMovesForPlayer(
    board,
    player1.position,
    player2.position,
  );

  return {
    board,
    players: { player1, player2 },
    activePlayer: 'player1',
    phase: 'movement',
    winner: null,
    validMoves,
  };
}

/**
 * Process a player move.
 *
 * 1. Validate the move is in validMoves
 * 2. Update the board: clear old player tile, set new player tile
 * 3. Handle weapon pickup: if new tile had a weapon, replace player's weapon, clear weapon from tile
 * 4. Check adjacency with areAdjacent
 * 5. If adjacent → set phase to 'combat', validMoves empty
 * 6. If not adjacent → switch activePlayer, compute new validMoves for next player
 */
export function processMove(state: GameState, target: Position): GameState {
  // 1. Validate move
  const isValid = state.validMoves.some(m => m.x === target.x && m.y === target.y);
  if (!isValid) {
    return state;
  }

  const active = state.activePlayer;
  const currentPlayer = state.players[active];
  const opponent = state.players[otherPlayer(active)];

  // Clone the tiles for immutability
  const newTiles = cloneTiles(state.board.tiles);

  // 2. Clear old player tile
  newTiles[currentPlayer.position.y][currentPlayer.position.x] = {
    position: { ...currentPlayer.position },
    content: { type: 'empty' },
  };

  // 3. Handle weapon pickup
  const targetTile = newTiles[target.y][target.x];
  let newWeapon = currentPlayer.weapon;
  if (targetTile.content.type === 'weapon') {
    newWeapon = targetTile.content.weapon;
  }

  // Set new player tile
  newTiles[target.y][target.x] = {
    position: { ...target },
    content: { type: 'player', playerId: active },
  };

  const newBoard = { gridSize: state.board.gridSize, tiles: newTiles };

  const updatedPlayer: PlayerState = {
    ...currentPlayer,
    position: { ...target },
    weapon: newWeapon,
  };

  const newPlayers = {
    ...state.players,
    [active]: updatedPlayer,
  };

  // 4. Check adjacency
  const adjacent = areAdjacent(updatedPlayer.position, opponent.position);

  if (adjacent) {
    // 5. Adjacent → enter combat
    return {
      board: newBoard,
      players: newPlayers,
      activePlayer: active,
      phase: 'combat',
      winner: null,
      validMoves: [],
    };
  }

  // 6. Not adjacent → switch turn
  const nextPlayer = otherPlayer(active);
  const nextPlayerState = newPlayers[nextPlayer];
  const nextOpponentState = newPlayers[otherPlayer(nextPlayer)];

  const validMoves = getValidMovesForPlayer(
    newBoard,
    nextPlayerState.position,
    nextOpponentState.position,
  );

  return {
    board: newBoard,
    players: newPlayers,
    activePlayer: nextPlayer,
    phase: 'movement',
    winner: null,
    validMoves,
  };
}


/**
 * Process a combat action for the active player.
 *
 * 1. Set the active player's combatAction
 * 2. If both players have chosen actions, resolve combat via resolveCombat
 * 3. Apply HP deltas
 * 4. Check win condition
 * 5. If winner → set phase to 'gameOver'
 * 6. If still adjacent → continue combat, switch active player, clear combatActions
 * 7. If not adjacent → switch to movement
 */
export function processCombatAction(state: GameState, action: CombatAction): GameState {
  const active = state.activePlayer;
  const other = otherPlayer(active);

  // 1. Set the active player's combatAction
  const updatedActivePlayer: PlayerState = {
    ...state.players[active],
    combatAction: action,
  };

  const newPlayers = {
    ...state.players,
    [active]: updatedActivePlayer,
  };

  const otherPlayerState = newPlayers[other];

  // 2. If both players have chosen actions, resolve combat
  if (otherPlayerState.combatAction === null) {
    // Other player hasn't chosen yet — switch to them
    return {
      ...state,
      players: newPlayers,
      activePlayer: other,
    };
  }

  // Both have chosen — resolve
  const p1Action = newPlayers.player1.combatAction!;
  const p2Action = newPlayers.player2.combatAction!;

  const result = resolveCombat(
    p1Action,
    p2Action,
    newPlayers.player1.weapon,
    newPlayers.player2.weapon,
  );

  // 3. Apply HP deltas
  const resolvedP1: PlayerState = {
    ...newPlayers.player1,
    hp: newPlayers.player1.hp + result.player1HPDelta,
    combatAction: null,
  };

  const resolvedP2: PlayerState = {
    ...newPlayers.player2,
    hp: newPlayers.player2.hp + result.player2HPDelta,
    combatAction: null,
  };

  const resolvedPlayers = {
    player1: resolvedP1,
    player2: resolvedP2,
  };

  // 4. Check win condition
  const winResult = checkWinCondition(resolvedP1.hp, resolvedP2.hp);

  // 5. If winner → gameOver
  if (winResult) {
    return {
      ...state,
      players: resolvedPlayers,
      phase: 'gameOver',
      winner: winResult.winner,
      validMoves: [],
    };
  }

  // 6. If still adjacent → continue combat, switch active player
  const stillAdjacent = areAdjacent(resolvedP1.position, resolvedP2.position);

  if (stillAdjacent) {
    return {
      ...state,
      players: resolvedPlayers,
      activePlayer: otherPlayer(active),
      phase: 'combat',
      validMoves: [],
    };
  }

  // 7. Not adjacent → switch to movement
  const nextPlayer = otherPlayer(active);
  const nextPlayerState = resolvedPlayers[nextPlayer];
  const nextOpponentState = resolvedPlayers[otherPlayer(nextPlayer)];

  const validMoves = getValidMovesForPlayer(
    state.board,
    nextPlayerState.position,
    nextOpponentState.position,
  );

  return {
    ...state,
    players: resolvedPlayers,
    activePlayer: nextPlayer,
    phase: 'movement',
    winner: null,
    validMoves,
  };
}

/**
 * Get valid moves for the active player in the current state.
 * Delegating wrapper around BoardService.getValidMovesForPlayer.
 */
export function getValidMoves(state: GameState): Position[] {
  const active = state.players[state.activePlayer];
  const opponent = state.players[otherPlayer(state.activePlayer)];
  return getValidMovesForPlayer(state.board, active.position, opponent.position);
}

/**
 * Get the AI's chosen move for Player 2.
 * Delegating wrapper around AIService.chooseMove.
 */
export function getAIMove(state: GameState): Position {
  return chooseMove(state);
}

/**
 * Get the AI's chosen combat action for Player 2.
 * Delegating wrapper around AIService.chooseCombatAction.
 */
export function getAICombatAction(state: GameState): CombatAction {
  return chooseCombatAction(state);
}
