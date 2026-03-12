import { describe, it, expect } from 'vitest';
import { resolveCombat, checkWinCondition } from '../CombatService';
import { WEAPONS } from '../types';

// Grab specific weapons for readable tests
const torta = WEAPONS.find(w => w.id === 'torta')!;       // damage: 15
const ramon = WEAPONS.find(w => w.id === 'ramon')!;       // damage: 35
const slingshot = WEAPONS.find(w => w.id === 'slingshot')!; // damage: 30
const barriga = WEAPONS.find(w => w.id === 'barriga')!;   // damage: 20

describe('resolveCombat', () => {
  it('both attack: full damage exchange', () => {
    const result = resolveCombat('attack', 'attack', torta, ramon);
    expect(result.player1HPDelta).toBe(-35); // takes ramon's damage
    expect(result.player2HPDelta).toBe(-15); // takes torta's damage
  });

  it('player1 attacks, player2 defends: defender takes half damage', () => {
    const result = resolveCombat('attack', 'defend', ramon, torta);
    expect(result.player1HPDelta).toBe(0);
    expect(result.player2HPDelta).toBe(-Math.floor(35 / 2)); // -17
  });

  it('player1 defends, player2 attacks: defender takes half damage', () => {
    const result = resolveCombat('defend', 'attack', torta, slingshot);
    expect(result.player1HPDelta).toBe(-Math.floor(30 / 2)); // -15
    expect(result.player2HPDelta).toBe(0);
  });

  it('both defend: no damage', () => {
    const result = resolveCombat('defend', 'defend', ramon, slingshot);
    expect(result.player1HPDelta).toBe(0);
    expect(result.player2HPDelta).toBe(0);
  });

  it('half damage floors odd values', () => {
    // torta damage = 15, half = 7.5 → floor to 7
    const result = resolveCombat('attack', 'defend', torta, ramon);
    expect(result.player2HPDelta).toBe(-7);
  });

  it('symmetric weapons produce symmetric full-damage results', () => {
    const result = resolveCombat('attack', 'attack', barriga, barriga);
    expect(result.player1HPDelta).toBe(-20);
    expect(result.player2HPDelta).toBe(-20);
  });
});

describe('checkWinCondition', () => {
  it('returns null when both players alive', () => {
    expect(checkWinCondition(50, 50)).toBeNull();
  });

  it('returns null when both at 1 HP', () => {
    expect(checkWinCondition(1, 1)).toBeNull();
  });

  it('player1 eliminated → player2 wins', () => {
    const result = checkWinCondition(0, 50);
    expect(result).toEqual({ winner: 'player2', loser: 'player1' });
  });

  it('player2 eliminated → player1 wins', () => {
    const result = checkWinCondition(50, 0);
    expect(result).toEqual({ winner: 'player1', loser: 'player2' });
  });

  it('negative HP still triggers win', () => {
    const result = checkWinCondition(30, -10);
    expect(result).toEqual({ winner: 'player1', loser: 'player2' });
  });

  it('both eliminated simultaneously → player2 wins', () => {
    const result = checkWinCondition(0, 0);
    expect(result).toEqual({ winner: 'player2', loser: 'player1' });
  });
});
