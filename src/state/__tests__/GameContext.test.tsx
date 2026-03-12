import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { GameProvider, useGame } from '../GameContext';

describe('GameContext', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <GameProvider>{children}</GameProvider>
  );

  it('useGame throws when used outside GameProvider', () => {
    expect(() => {
      renderHook(() => useGame());
    }).toThrow('useGame must be used within a GameProvider');
  });

  it('provides initial state with idle phase', () => {
    const { result } = renderHook(() => useGame(), { wrapper });
    expect(result.current.state.phase).toBe('idle');
    expect(result.current.state.activePlayer).toBe('player1');
  });

  it('provides a dispatch function', () => {
    const { result } = renderHook(() => useGame(), { wrapper });
    expect(typeof result.current.dispatch).toBe('function');
  });

  it('dispatch START_GAME transitions to movement phase', () => {
    const { result } = renderHook(() => useGame(), { wrapper });

    act(() => {
      result.current.dispatch({ type: 'START_GAME' });
    });

    expect(result.current.state.phase).toBe('movement');
    expect(result.current.state.activePlayer).toBe('player1');
    expect(result.current.state.validMoves.length).toBeGreaterThan(0);
  });
});
