import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { I18nProvider, useI18n } from '../index';
import type { ReactNode } from 'react';

function wrapper({ children }: { children: ReactNode }) {
  return <I18nProvider>{children}</I18nProvider>;
}

describe('I18nProvider and useI18n', () => {
  it('defaults to English locale', () => {
    const { result } = renderHook(() => useI18n(), { wrapper });
    expect(result.current.locale).toBe('en');
  });

  it('provides a bound t function that uses the current locale', () => {
    const { result } = renderHook(() => useI18n(), { wrapper });
    expect(result.current.t('game.start')).toBe('Start Game');
  });

  it('switches locale via setLocale', () => {
    const { result } = renderHook(() => useI18n(), { wrapper });

    act(() => {
      result.current.setLocale('es');
    });

    expect(result.current.locale).toBe('es');
    expect(result.current.t('game.start')).toBe('Iniciar Juego');
  });

  it('interpolates params through the bound t function', () => {
    const { result } = renderHook(() => useI18n(), { wrapper });

    act(() => {
      result.current.setLocale('pt');
    });

    expect(result.current.t('game.over', { player: 'Chaves' })).toBe('Chaves Venceu!');
  });

  it('throws when useI18n is used outside I18nProvider', () => {
    expect(() => {
      renderHook(() => useI18n());
    }).toThrow('useI18n must be used within an I18nProvider');
  });
});
