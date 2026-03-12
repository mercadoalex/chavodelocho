import { useGame } from '../state/GameContext';
import { useI18n } from '../i18n/index';
import styles from './GameHeader.module.css';

export default function GameHeader() {
  const { state } = useGame();
  const { t } = useI18n();

  const playerName =
    state.activePlayer === 'player1'
      ? t('player.player1')
      : t('player.player2');

  let turnIndicator: string | null = null;

  if (state.phase === 'movement' || state.phase === 'combat') {
    turnIndicator = t('game.turn', { player: playerName });
  } else if (state.phase === 'idle') {
    turnIndicator = t('game.instructions');
  }
  // gameOver → no turn indicator

  return (
    <div className={styles.header} data-testid="game-header">
      <h1 className={styles.title}>{t('game.title')}</h1>
      {turnIndicator && (
        <p className={styles.turnIndicator} data-testid="turn-indicator">
          {turnIndicator}
        </p>
      )}
    </div>
  );
}
