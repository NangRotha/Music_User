import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { CambodiaFlag, EnglishFlag } from './Flags';
import {
  Music,
  Send,
  Search,
  Sun,
  Moon,
  Home,
  Disc3,
  BookOpen,
  Globe
} from 'lucide-react';

export const Navbar = ({ settings, searchQuery, setSearchQuery, currentPage = 'home', onNavigate }) => {
  const { lang, toggleLanguage, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  // Mobile drawer phase: 'open' | 'closing' | 'closed'
  const [menuPhase, setMenuPhase] = useState('closed');
  const [scrolled, setScrolled] = useState(false);
  const closeTimer = useRef(null);

  // Elevate the header once the page is scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Clear pending drawer close timer on unmount
  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const openMobileMenu = () => {
    clearTimeout(closeTimer.current);
    setMenuPhase('open');
  };

  const closeMobileMenu = () => {
    if (menuPhase !== 'open') return;
    setMenuPhase('closing');
    closeTimer.current = setTimeout(() => setMenuPhase('closed'), 200);
  };

  const toggleMobileMenu = () => {
    if (menuPhase === 'open') closeMobileMenu();
    else openMobileMenu();
  };

  // Close the drawer with Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && menuPhase !== 'closed') closeMobileMenu();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuPhase]);

  const drawerOpen = menuPhase === 'open';

  const siteName = lang === 'kh'
    ? (settings?.site_name_kh || settings?.site_name_en || 'KhmerBeats')
    : (settings?.site_name_en || settings?.site_name_kh || 'KhmerBeats');

  const navItems = [
    { id: 'home', labelKh: 'ទំព័រដើម', labelEn: 'Home', icon: Home },
    { id: 'products', labelKh: 'បទចម្រៀង', labelEn: 'Products', icon: Disc3 },
    { id: 'about', labelKh: 'អំពីយើង', labelEn: 'About Us', icon: BookOpen }
  ];

  const handleNavClick = (e, pageId) => {
    e.preventDefault();
    closeMobileMenu();
    if (onNavigate) onNavigate(pageId);
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    if (currentPage !== 'products' && value.trim() && onNavigate) {
      onNavigate('products');
    }
  };

  const iconBtn =
    'inline-flex items-center justify-center w-9 h-9 rounded-full text-zinc-600 hover:text-zinc-900 hover:bg-zinc-900/[0.05] active:scale-90 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-white/10 transition-[color,background-color,transform] cursor-pointer';

  return (
    <header
      className={`animate-header-in sticky top-0 z-40 border-b backdrop-blur-xl transition-[background-color,border-color,box-shadow] duration-300 ${
        scrolled
          ? 'border-zinc-200/80 bg-white/95 shadow-lg shadow-zinc-950/[0.04] dark:border-white/10 dark:bg-zinc-950/95 dark:shadow-black/20'
          : 'border-zinc-200/70 bg-zinc-50/85 dark:border-white/[0.06] dark:bg-zinc-950/80'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center gap-3 sm:gap-4">
          {/* Brand */}
          <div className="flex min-w-0 items-center gap-2.5">
            <a
              href="#/"
              onClick={(e) => handleNavClick(e, 'home')}
              className="group flex cursor-pointer items-center gap-2.5 transition-transform active:scale-[0.99]"
              aria-label={siteName}
            >
              {settings?.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt="Logo"
                  className="h-9 w-auto shrink-0 object-contain transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pink-600 text-white shadow-sm transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
                  <Music className="h-[18px] w-[18px]" />
                </span>
              )}
              <span className="min-w-0">
                <span className="block truncate text-[15px] font-bold tracking-tight text-zinc-900 dark:text-white">
                  {siteName}
                </span>
                <span className="hidden text-[11px] font-medium text-zinc-400 sm:block dark:text-zinc-500">
                  {t('site_tagline')}
                </span>
              </span>
            </a>
          </div>

          {/* Desktop navigation */}
          <nav className="ml-6 hidden items-center gap-1 lg:flex" aria-label="Main navigation">
            {navItems.map((item, i) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={(e) => handleNavClick(e, item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  style={{ animationDelay: `${i * 70}ms` }}
                  className={`group animate-rise relative inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-zinc-900 dark:text-white'
                      : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`h-4 w-4 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-pink-600 dark:text-pink-400' : ''}`} />
                  {lang === 'kh' ? item.labelKh : item.labelEn}
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-x-3 bottom-0.5 h-[2px] origin-left scale-x-0 rounded-full bg-pink-600 transition-transform duration-300 ease-out dark:bg-pink-400 ${
                      isActive ? 'scale-x-100' : 'group-hover:scale-x-100'
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          {/* Right cluster */}
          <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
            {/* Desktop search */}
            <div className="relative hidden w-44 lg:block xl:w-56">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={t('search_placeholder')}
                className="h-9 w-full rounded-full border border-zinc-200 bg-white pl-9 pr-3.5 text-sm text-zinc-800 shadow-sm placeholder:text-zinc-400 transition-[border-color,box-shadow] focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
            </div>

            {/* Telegram */}
            {settings?.telegram_channel && (
              <a
                href={settings.telegram_channel}
                target="_blank"
                rel="noreferrer"
                title="Telegram"
                className={`${iconBtn} group hidden sm:inline-flex`}
                aria-label="Open Telegram channel"
              >
                <Send className="h-4 w-4 text-sky-500 transition-transform duration-300 group-hover:-rotate-12" />
              </a>
            )}

            {/* Language */}
            <button
              onClick={toggleLanguage}
              className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 transition-[border-color,background-color,transform] hover:border-zinc-300 active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
              title={lang === 'kh' ? 'Switch to English' : 'ប្ដូរទៅភាសាខ្មែរ'}
            >
              <Globe className="h-3.5 w-3.5 text-zinc-400" />
              {lang === 'kh' ? <CambodiaFlag className="h-3 w-4" /> : <EnglishFlag className="h-3 w-4" />}
              <span className="uppercase">{lang === 'kh' ? 'ខ្មែរ' : 'EN'}</span>
            </button>

            {/* Theme */}
            <button onClick={toggleTheme} className={iconBtn} aria-label="Toggle dark mode">
              <span key={isDark ? 'sun' : 'moon'} className="animate-icon-pop inline-flex">
                {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
              </span>
            </button>

            {/* Mobile menu trigger (animated burger) */}
            <button
              onClick={toggleMobileMenu}
              className={`${iconBtn} lg:hidden`}
              aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={drawerOpen}
              aria-controls="mobile-nav-drawer"
            >
              <span className="burger" data-open={drawerOpen} aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="pb-3 lg:hidden">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={t('search_placeholder')}
              className="h-10 w-full rounded-full border border-zinc-200 bg-white pl-10 pr-4 text-sm text-zinc-800 shadow-sm placeholder:text-zinc-400 transition-[border-color,box-shadow] focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
          </div>
        </div>

        {/* Mobile drawer (kept mounted during exit so it can animate closed) */}
        {menuPhase !== 'closed' && (
          <div
            id="mobile-nav-drawer"
            className={`overflow-hidden border-t border-zinc-200/70 transition-all duration-200 ease-out lg:hidden dark:border-white/10 ${
              drawerOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-1.5 opacity-0'
            }`}
          >
            <div className="py-3 pb-5">
              <nav className="grid gap-1" aria-label="Mobile navigation">
                {navItems.map((item, i) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={(e) => handleNavClick(e, item.id)}
                      aria-current={isActive ? 'page' : undefined}
                      style={{ animationDelay: `${70 + i * 45}ms` }}
                      className={`animate-rise flex cursor-pointer items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors active:scale-[0.99] ${
                        isActive
                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950'
                          : 'text-zinc-600 hover:bg-zinc-900/5 dark:text-zinc-300 dark:hover:bg-white/10'
                      }`}
                    >
                      <Icon className={`h-[18px] w-[18px] ${isActive ? 'text-pink-400 dark:text-pink-500' : ''}`} />
                      {lang === 'kh' ? item.labelKh : item.labelEn}
                    </button>
                  );
                })}
              </nav>

              <div
                className="animate-rise mt-3 grid grid-cols-2 gap-2"
                style={{ animationDelay: `${70 + navItems.length * 45 + 60}ms` }}
              >
                <button
                  onClick={() => { closeMobileMenu(); toggleLanguage(); }}
                  className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white text-xs font-semibold text-zinc-700 transition-colors active:scale-[0.98] dark:border-white/10 dark:bg-white/5 dark:text-zinc-200"
                >
                  {lang === 'kh' ? <EnglishFlag className="h-3 w-4" /> : <CambodiaFlag className="h-3 w-4" />}
                  {lang === 'kh' ? 'English' : 'ភាសាខ្មែរ'}
                </button>

                <button
                  onClick={() => { closeMobileMenu(); toggleTheme(); }}
                  className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white text-xs font-semibold text-zinc-700 transition-colors active:scale-[0.98] dark:border-white/10 dark:bg-white/5 dark:text-zinc-200"
                >
                  <span key={isDark ? 'sun-m' : 'moon-m'} className="animate-icon-pop inline-flex">
                    {isDark ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4" />}
                  </span>
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </button>
              </div>

              {settings?.telegram_channel && (
                <a
                  href={settings.telegram_channel}
                  target="_blank"
                  rel="noreferrer"
                  style={{ animationDelay: `${70 + navItems.length * 45 + 150}ms` }}
                  className="animate-rise mt-2 inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-sky-500 text-sm font-semibold text-white transition-colors hover:bg-sky-600 active:scale-[0.98]"
                >
                  <Send className="h-4 w-4" />
                  Telegram Channel
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
