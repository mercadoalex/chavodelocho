import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAITurn } from '../useAITurn';
import type { GameState } from '../../engine/types';
import { INITIAL_STATE } from '../../state/gameReducer';

// Helper to create a game state with specific overrides
function makeState(overrides: Partial<GameState>): GameState {
  return { ...INITIAL_STATE, ...overrides };
}

describe('useAITurn', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('dispatches AI_TURN after 500ms when player2 is active in movement phase', () => {
    const dispatch = vi.fn();
    const state = makeState({ activePlayer: 'player2', phase: 'movement' });

    renderHook(() => useAITurn(state, dispatch));

    expect(dispatch).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({ type: 'AI_TURN' });
  });

  it('dispatches AI_TURN after 800ms when player2 is active in combat phase', () => {
    const dispatch = vi.fn();
    const state = makeState({ activePlayer: 'player2', phase: 'combat' });

    renderHook(() => useAITurn(state, dispatch));

    expect(dispatch).not.toHaveBeenCalled();

    vi.advanceTimersByTime(799);
    expect(dispatch).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({ type: 'AI_TURN' });
  });

  it('does not dispatch when it is player1 turn', () => {
    const dispatch = vi.fn();
    const state = makeState({ activePlayer: 'player1', phase: 'movement' });

    renderHook(() => useAITurn(state, dispatch));

    vi.advanceTimersByTime(2000);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('does not dispatch during idle phase', () => {
    const dispatch = vi.fn();
    const state = makeState({ activePlayer: 'player2', phase: 'idle' });

    renderHook(() => useAITurn(state, dispatch));

    vi.advanceTimersByTime(2000);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('does not dispatch during gameOver phase', () => {
    const dispatch = vi.fn();
    const state = makeState({ activePlayer: 'player2', phase: 'gameOver' });

    renderHook(() => useAITurn(state, dispatch));

    vi.advanceTimersByTime(2000);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('cleans up timeout when state changes before timer fires', () => {
    const dispatch = vi.fn();
    const state1 = makeState({ activePlayer: 'player2', phase: 'movement' });
    const state2 = makeState({ activePlayer: 'player1', phase: 'movement' });

    const { rerender } = renderHook(
      ({ state }) => useAITurn(state, dispatch),
      { initialProps: { state: state1 } },
    );

    // Advance partway, then switch to player1
    vi.advanceTimersByTime(300);
    rerender({ state: state2 });

    // Finish the original timer window — should NOT fire
    vi.advanceTimersByTime(500);
    expect(dispatch).not.toHaveBeenCalled();
  });
});
