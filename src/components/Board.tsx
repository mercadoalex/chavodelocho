import { useGame } from '../state/GameContext';
import { movePlayer } from '../state/actions';
import type { Position } from '../engine/types';
import Tile from './Tile';
import styles from './Board.module.css';

/** Check whether a position is in the valid-moves list */
function isValidMove(validMoves: Position[], pos: Position): boolean {
  return validMoves.some((m) => m.x === pos.x && m.y === pos.y);
}

export default function Board() {
  const { state, dispatch } = useGame();
  const { tiles } = state.board;
  const { validMoves } = state;

  return (
    <div className={styles.board} data-testid="board">
      {tiles.flatMap((row) =>
        row.map((tile) => {
          const highlighted = isValidMove(validMoves, tile.position);
          return (
            <Tile
              key={`${tile.position.x}-${tile.position.y}`}
              tile={tile}
              isHighlighted={highlighted}
              onClick={() => dispatch(movePlayer(tile.position))}
            />
          );
        }),
      )}
    </div>
  );
}
