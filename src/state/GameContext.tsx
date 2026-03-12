// ============================================================
// Game Context — React Context + useReducer wrapper
// Provides read-only state and dispatch to the component tree
// ============================================================

import { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { GameState } from '../engine/types';
import type { GameAction } from './actions';
import { gameReducer, INITIAL_STATE } from './gameReducer';

// ---- Context ------------------------------------------------

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextValue | null>(null);

// ---- Provider -----------------------------------------------

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

// ---- Hook ---------------------------------------------------

export function useGame(): GameContextValue {
  const context = useContext(GameContext);
  if (context === null) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
