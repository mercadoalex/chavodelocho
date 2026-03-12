import { GameProvider, useGame } from '../state/GameContext';
import { I18nProvider } from '../i18n/index';
import { useAITurn } from '../hooks/useAITurn';
import { useSoundEffects } from '../hooks/useSoundEffects';
import Board from './Board';
import PlayerPanel from './PlayerPanel';
import GameHeader from './GameHeader';
import GameControls from './GameControls';
import GameOverModal from './GameOverModal';
import styles from './App.module.css';

/** Inner component that consumes game context */
function AppContent() {
  const { state, dispatch } = useGame();

  // Automatically trigger AI turns for Player 2
  useAITurn(state, dispatch);

  // Play sound effects on game events (combat, game over)
  useSoundEffects(state);

  return (
    <div className={styles.app}>
      <div className={styles.header}>
        <GameHeader />
      </div>

      <div className={styles.main}>
        <PlayerPanel playerId="player1" />
        <Board />
        <PlayerPanel playerId="player2" />
      </div>

      <div className={styles.controls}>
        <GameControls />
      </div>

      {state.phase === 'gameOver' && (
        <div className={styles.gameOverOverlay}>
          <GameOverModal />
        </div>
      )}
    </div>
  );
}

/** Root App component — wraps providers around content */
export default function App() {
  return (
    <GameProvider>
      <I18nProvider>
        <AppContent />
      </I18nProvider>
    </GameProvider>
  );
}
