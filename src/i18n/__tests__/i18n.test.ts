import { describe, it, expect } from 'vitest';
import { t } from '../index';
import type { SupportedLocale } from '../index';

describe('t() translation function', () => {
  it('resolves a key in English by default', () => {
    expect(t('game.title', 'en')).toBe('Chavo del Ocho - Board Game');
  });

  it('resolves a key in Spanish', () => {
    expect(t('game.title', 'es')).toBe('Chavo del Ocho - Juego de Mesa');
  });

  it('resolves a key in Portuguese', () => {
    expect(t('game.title', 'pt')).toBe('Chaves - Jogo de Tabuleiro');
  });

  it('defaults to English when no locale is provided', () => {
    expect(t('game.start')).toBe('Start Game');
  });

  it('returns the key itself when the key is not found', () => {
    expect(t('nonexistent.key', 'en')).toBe('nonexistent.key');
  });

  it('interpolates a single parameter', () => {
    expect(t('game.turn', 'en', { player: 'Chavo' })).toBe("Chavo's Turn");
  });

  it('interpolates parameters in Spanish', () => {
    expect(t('game.turn', 'es', { player: 'Chavo' })).toBe('Turno de Chavo');
  });

  it('interpolates parameters in Portuguese', () => {
    expect(t('game.over', 'pt', { player: 'Chaves' })).toBe('Chaves Venceu!');
  });

  it('leaves unmatched placeholders intact when params are missing', () => {
    expect(t('game.turn', 'en')).toBe("{{player}}'s Turn");
  });

  it('handles keys with no placeholders and extra params gracefully', () => {
    expect(t('game.start', 'en', { extra: 'value' })).toBe('Start Game');
  });
});

describe('t() with all supported locales', () => {
  const locales: SupportedLocale[] = ['en', 'es', 'pt'];

  it('resolves weapon names for all locales', () => {
    for (const locale of locales) {
      const result = t('weapon.torta', locale);
      expect(result).toBeTruthy();
      expect(result).not.toBe('weapon.torta');
    }
  });

  it('resolves combat actions for all locales', () => {
    for (const locale of locales) {
      expect(t('combat.attack', locale)).toBeTruthy();
      expect(t('combat.defend', locale)).toBeTruthy();
    }
  });
});
