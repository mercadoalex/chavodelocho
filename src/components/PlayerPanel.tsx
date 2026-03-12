import { useGame } from '../state/GameContext';
import { useI18n } from '../i18n/index';
import { combatAction } from '../state/actions';
import type { PlayerId } from '../engine/types';
import styles from './PlayerPanel.module.css';

interface PlayerPanelProps {
  playerId: PlayerId;
}

/** SVG data-URI fallback for failed image loads */
const FALLBACK_SRC =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48">' +
      '<rect width="48" height="48" rx="4" fill="#b0855e"/>' +
      '<text x="24" y="30" text-anchor="middle" font-size="14" fill="#fff">?</text>' +
    '</svg>',
  );

function handleImgError(e: React.SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  if (img.src !== FALLBACK_SRC) {
    img.src = FALLBACK_SRC;
  }
}

/** Compute HP bar color: green at 100, yellow around 50, red near 0 */
function hpColor(hp: number): string {
  const clamped = Math.max(0, Math.min(100, hp));
  const red = clamped < 50 ? 255 : Math.round(255 - (clamped - 50) * 5.1);
  const green = clamped > 50 ? 255 : Math.round(clamped * 5.1);
  return `rgb(${red}, ${green}, 0)`;
}

export default function PlayerPanel({ playerId }: PlayerPanelProps) {
  const { state, dispatch } = useGame();
  const { t } = useI18n();

  const player = state.players[playerId];
  const { phase, activePlayer } = state;
  const isActive = activePlayer === playerId;

  const avatarSrc =
    playerId === 'player1' ? '/images/chavo_anim.gif' : '/images/kiko_anim.gif';

  const showCombatButtons =
    playerId === 'player1' && phase === 'combat' && activePlayer === 'player1';

  const showAiThinking =
    playerId === 'player2' && phase === 'combat' && activePlayer === 'player2';

  const panelClass = [styles.panel, isActive ? styles.active : '']
    .filter(Boolean)
    .join(' ');

  const hpPercent = Math.max(0, Math.min(100, player.hp));

  return (
    <div className={panelClass} data-testid={`player-panel-${playerId}`}>
      <img
        className={styles.avatar}
        src={avatarSrc}
        alt={t(`player.${playerId}`)}
        onError={handleImgError}
      />

      {/* HP bar */}
      <div className={styles.hpSection}>
        <div className={styles.hpLabel}>{t('player.life')}</div>
        <div className={styles.hpBarOuter}>
          <div
            className={styles.hpBarInner}
            style={{
              width: `${hpPercent}%`,
              backgroundColor: hpColor(player.hp),
            }}
          />
        </div>
        <div className={styles.hpValue}>{player.hp} / 100</div>
      </div>

      {/* Current weapon */}
      <div className={styles.weaponSection}>
        <div className={styles.weaponLabel}>{t('player.weapon')}</div>
        <img
          className={styles.weaponImage}
          src={player.weapon.image}
          alt={t(player.weapon.name)}
          onError={handleImgError}
        />
        <div className={styles.damageText}>
          {t('player.damage')}: {player.weapon.damage}
        </div>
      </div>

      {/* Combat buttons — Player 1 only */}
      {showCombatButtons && (
        <div className={styles.combatButtons}>
          <button
            className={styles.attackBtn}
            onClick={() => dispatch(combatAction('attack'))}
          >
            {t('combat.attack')}
          </button>
          <button
            className={styles.defendBtn}
            onClick={() => dispatch(combatAction('defend'))}
          >
            {t('combat.defend')}
          </button>
        </div>
      )}

      {/* AI thinking status — Player 2 only */}
      {showAiThinking && (
        <div className={styles.aiStatus}>{t('combat.aiThinking')}</div>
      )}
    </div>
  );
}
