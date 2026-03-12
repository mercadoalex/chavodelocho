import { useGame } from '../state/GameContext';
import { useI18n } from '../i18n/index';
import { resetGame, startGame } from '../state/actions';
import styles from './GameOverModal.module.css';

const WINNER_IMAGES: Record<string, string> = {
  player1: '/images/chavo_anim.gif',
  player2: '/images/kiko_anim.gif',
};

/** SVG data-URI fallback for failed image loads */
const FALLBACK_SRC =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">' +
      '<rect width="120" height="120" rx="8" fill="#555"/>' +
      '<text x="60" y="68" text-anchor="middle" font-size="24" fill="#fff">?</text>' +
    '</svg>',
  );

export default function GameOverModal() {
  const { state, dispatch } = useGame();
  const { t } = useI18n();

  const winnerId = state.winner;
  if (!winnerId) return null;

  const winnerName = t(`player.${winnerId}`);
  const winnerImage = WINNER_IMAGES[winnerId] ?? '';

  const handlePlayAgain = () => {
    dispatch(resetGame());
    dispatch(startGame());
  };

  return (
    <div className={styles.card} data-testid="game-over-modal">
      <img
        className={styles.winnerImage}
        src={winnerImage}
        alt={winnerName}
        onError={(e) => {
          const img = e.currentTarget;
          if (img.src !== FALLBACK_SRC) {
            img.src = FALLBACK_SRC;
          }
        }}
      />
      <p className={styles.winnerText}>
        {t('game.over', { player: winnerName })}
      </p>
      <button className={styles.playAgainBtn} onClick={handlePlayAgain}>
        {t('game.playAgain')}
      </button>
    </div>
  );
}
