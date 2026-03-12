import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the three-column layout with header, board, panels, and controls', () => {
    render(<App />);

    expect(screen.getByTestId('game-header')).toBeInTheDocument();
    expect(screen.getByTestId('board')).toBeInTheDocument();
    expect(screen.getByTestId('player-panel-player1')).toBeInTheDocument();
    expect(screen.getByTestId('player-panel-player2')).toBeInTheDocument();
    expect(screen.getByTestId('game-controls')).toBeInTheDocument();
  });

  it('does not render GameOverModal when phase is not gameOver', () => {
    render(<App />);
    expect(screen.queryByTestId('game-over-modal')).not.toBeInTheDocument();
  });
});
