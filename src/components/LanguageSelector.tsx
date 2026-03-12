import { useI18n } from '../i18n/index';
import type { SupportedLocale } from '../i18n/index';
import styles from './GameControls.module.css';

const LOCALES: SupportedLocale[] = ['en', 'es', 'pt'];

export default function LanguageSelector() {
  const { t, locale, setLocale } = useI18n();

  return (
    <div className={styles.languageSelector} data-testid="language-selector">
      {LOCALES.map((loc) => (
        <button
          key={loc}
          className={`${styles.langButton} ${loc === locale ? styles.langButtonActive : ''}`}
          onClick={() => setLocale(loc)}
          data-testid={`lang-${loc}`}
        >
          {t(`lang.${loc}`)}
        </button>
      ))}
    </div>
  );
}
