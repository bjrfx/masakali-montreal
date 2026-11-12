import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { pageSeo as basePageSeo } from './seoConfig';

const KEY_MAP = {
  home: ['seo.homeTitle', 'seo.homeDesc'],
  about: ['seo.aboutTitle', 'seo.aboutDesc'],
  menu: ['seo.menuTitle', 'seo.menuDesc'],
  locations: ['seo.locationsTitle', 'seo.locationsDesc'],
  reservations: ['seo.reservationsTitle', 'seo.reservationsDesc'],
  catering: ['seo.cateringTitle', 'seo.cateringDesc'],
  cateringByTray: ['seo.cateringTitle', 'seo.cateringDesc'],
  contact: ['seo.contactTitle', 'seo.contactDesc'],
};

export default function usePageSeo(key) {
  const { t } = useTranslation();
  const location = useLocation();
  const fallback = basePageSeo(key);
  const keys = KEY_MAP[key];
  return {
    title: keys ? t(keys[0], { defaultValue: fallback.title }) : fallback.title,
    description: keys ? t(keys[1], { defaultValue: fallback.description }) : fallback.description,
    path: location.pathname || fallback.path,
  };
}
