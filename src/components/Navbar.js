import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon, MapPin, Globe } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { useTranslation } from 'react-i18next';
import useLocalizedPath from '../utils/useLocalizedPath';

const navLinkKeys = [
  { key: 'home', path: '/' },
  { key: 'about', path: '/about' },
  { key: 'menu', path: '/menu' },
  { key: 'locations', path: '/locations' },
  { key: 'reservations', path: '/reservations' },
  { key: 'catering', path: '/catering' },
  { key: 'contact', path: '/contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const localePath = useLocalizedPath();
  const currentLang = i18n.language;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const switchLanguage = () => {
    const newLang = currentLang === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
    localStorage.setItem('i18nextLng', newLang);

    // Navigate to the equivalent page in the new language
    const currentPath = location.pathname;
    const strippedPath = currentPath.replace(/^\/fr/, '') || '/';

    if (newLang === 'fr') {
      navigate(strippedPath === '/' ? '/fr' : `/fr${strippedPath}`);
    } else {
      navigate(strippedPath);
    }
  };

  // Check if a nav link is active, accounting for language prefix
  const isActive = (path) => {
    const currentPath = location.pathname;
    const strippedCurrent = currentPath.replace(/^\/fr/, '') || '/';
    return strippedCurrent === path;
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'navbar-scrolled' : 'bg-transparent'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to={localePath('/')} className="flex-shrink-0 flex items-center group">
            <img
              src="/logo/Masakali-Indian-Cuisine.svg"
              alt="Masakali"
              className="h-24 xl:h-28 w-auto transition-transform duration-300 group-hover:scale-105"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
            />
            <span className="hidden font-display text-xl text-gold-gradient font-bold">Masakali</span>
          </Link>

          {/* Location Badge — visible on sm+ but hidden below xl when desktop nav is hidden */}
          <div className="hidden sm:flex xl:hidden items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
            <MapPin size={12} className="text-amber-500" />
            <span className="location-badge">{t('navbar.montreal')}</span>
          </div>

          {/* Desktop Nav — xl breakpoint (1280px) for French text accommodation */}
          <div className="hidden xl:flex items-center gap-0.5">
            {/* Location Badge inline with nav links */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mr-1">
              <MapPin size={12} className="text-amber-500" />
              <span className="location-badge">{t('navbar.montreal')}</span>
            </div>

            {navLinkKeys.map((link) => (
              <Link
                key={link.path}
                to={localePath(link.path)}
                className={`nav-link-desktop ${isActive(link.path)
                    ? 'text-amber-600 dark:text-amber-400 bg-amber-400/10'
                    : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5'
                  }`}
              >
                {t(`navbar.${link.key}`)}
              </Link>
            ))}
            {/* Language Toggle */}
            <button
              onClick={switchLanguage}
              className="ml-0.5 flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium rounded-lg transition-all duration-300 text-neutral-600 dark:text-neutral-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-400/10"
              aria-label="Switch language"
            >
              <Globe size={15} />
              <span className="font-semibold">{currentLang === 'fr' ? 'EN' : 'FR'}</span>
            </button>
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="theme-toggle ml-0.5 text-neutral-500 dark:text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link to={localePath('/reservations')} className="ml-2 btn-gold text-xs !px-5 !py-2 whitespace-nowrap">
              {t('navbar.reserveTable')}
            </Link>
          </div>

          {/* Mobile/Tablet Menu Button — visible below xl */}
          <div className="xl:hidden flex items-center gap-2">
            {/* Mobile Language Toggle */}
            <button
              onClick={switchLanguage}
              className="flex items-center gap-1 px-2 py-1.5 text-sm font-semibold rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-400/10 transition-all"
              aria-label="Switch language"
            >
              <Globe size={16} />
              {currentLang === 'fr' ? 'EN' : 'FR'}
            </button>
            <button
              onClick={toggleTheme}
              className="theme-toggle text-neutral-500 dark:text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden mobile-menu-panel"
          >
            <div className="px-4 py-6 space-y-1">
              {navLinkKeys.map((link) => (
                <Link
                  key={link.path}
                  to={localePath(link.path)}
                  className={`block px-4 py-3 rounded-lg text-base transition-all ${isActive(link.path)
                      ? 'text-amber-600 dark:text-amber-400 bg-amber-400/10'
                      : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5'
                    }`}
                >
                  {t(`navbar.${link.key}`)}
                </Link>
              ))}
              <div className="pt-4">
                <Link to={localePath('/reservations')} className="btn-gold w-full text-center block">
                  {t('navbar.reserveTable')}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
