import { useGame } from '../state/GameContext';
import { useI18n } from '../i18n/index';
import { startGame } from '../state/actions';
import AudioController from './AudioController';
import LanguageSelector from './LanguageSelector';
import styles from './GameControls.module.css';

export default function GameControls() {
  const { state, dispatch } = useGame();
  const { t } = useI18n();

  return (
    <div className={styles.gameControls} data-testid="game-controls">
      {state.phase === 'idle' && (
        <button
          className={styles.startButton}
          onClick={() => dispatch(startGame())}
          data-testid="start-game-button"
        >
          {t('game.start')}
        </button>
      )}
      <AudioController />
      <LanguageSelector />
    </div>
  );
}
