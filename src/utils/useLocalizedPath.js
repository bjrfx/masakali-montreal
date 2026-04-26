import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';

/**
 * Returns a function that prefixes paths with the current language
 * when it's not the default language (en).
 *
 * Usage:
 *   const localePath = useLocalizedPath();
 *   <Link to={localePath('/menu')}>Menu</Link>
 *   // en → "/menu"
 *   // fr → "/fr/menu"
 */
export default function useLocalizedPath() {
  const { i18n } = useTranslation();

  return useCallback(
    (path) => {
      const lang = i18n.language;
      if (lang === 'fr') {
        if (path === '/') return '/fr';
        return `/fr${path}`;
      }
      return path;
    },
    [i18n.language]
  );
}

/**
 * Standalone helper (non-hook) for use outside React components.
 * Requires passing the language string directly.
 */
export function localizePathWithLang(path, lang) {
  if (lang === 'fr') {
    if (path === '/') return '/fr';
    return `/fr${path}`;
  }
  return path;
}
