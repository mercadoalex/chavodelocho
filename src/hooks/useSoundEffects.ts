// ============================================================
// useSoundEffects — Plays sound effects for game events.
// References: nomesimpatizas.mp3 (combat), pipipipi.mp3 (game over)
// ============================================================

import { useEffect, useRef } from 'react';
import type { GameState } from '../engine/types';

/** Audio asset paths for sound effects */
const SFX = {
  combat: '/assets/nomesimpatizas.mp3',
  gameOver: '/assets/pipipipi.mp3',
} as const;

/**
 * Watches game state transitions and plays sound effects:
 * - Entering combat phase → nomesimpatizas.mp3
 * - Entering gameOver phase → pipipipi.mp3
 */
export function useSoundEffects(state: GameState): void {
  const prevPhaseRef = useRef(state.phase);

  useEffect(() => {
    const prevPhase = prevPhaseRef.current;
    const currPhase = state.phase;
    prevPhaseRef.current = currPhase;

    // Only play on phase transitions
    if (prevPhase === currPhase) return;

    let src: string | null = null;

    if (currPhase === 'combat' && prevPhase !== 'combat') {
      src = SFX.combat;
    } else if (currPhase === 'gameOver') {
      src = SFX.gameOver;
    }

    if (src) {
      try {
        const audio = new Audio(src);
        audio.volume = 0.6;
        audio.play().catch(() => {
          // Browser may block autoplay; silently ignore
        });
      } catch {
        // Audio creation failed; continue without sound
      }
    }
  }, [state.phase]);
}
