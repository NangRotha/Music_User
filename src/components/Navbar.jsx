import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { CambodiaFlag, EnglishFlag } from './Flags';
import {
  Music,
  Send,
  Search,
  Menu,
  X,
  Sun,
  Moon,
  Disc3,
  BookOpen,
  Sparkles,
  Home,
  Check
} from 'lucide-react';

export const Navbar = ({ settings, searchQuery, setSearchQuery, currentPage = 'home', onNavigate }) => {
  const { lang, setLang, toggleLanguage, t } = useLanguage();
  const { theme, isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

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
    setMobileMenuOpen(false);
    setLangDropdownOpen(false);
    if (onNavigate) {
      onNavigate(pageId);
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/85 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-4">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 shrink-0">
            {settings?.logo_url ? (
              <img 
                src={settings.logo_url} 
                alt="Logo" 
                className="h-8 sm:h-10 w-auto object-contain drop-shadow-[0_0_12px_rgba(236,72,153,0.3)] cursor-pointer"
                onClick={(e) => handleNavClick(e, 'home')}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : null}
            <div>
              <a 
                href="#/" 
                onClick={(e) => handleNavClick(e, 'home')}
                className="flex items-center gap-2 group cursor-pointer"
              >
                {!settings?.logo_url && (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/20 group-hover:scale-105 transition-transform duration-200">
                    <Music className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                )}
                <div>
                  <span className="text-base sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-slate-100 dark:to-slate-400 bg-clip-text text-transparent block truncate max-w-[130px] sm:max-w-none">
                    {siteName}
                  </span>
                  <span className="hidden sm:block text-[10px] tracking-wider uppercase font-semibold text-pink-600 dark:text-pink-400">
                    {t('site_tagline')}
                  </span>
                </div>
              </a>
            </div>
          </div>

          {/* Desktop Multi-Page Navigation Pills: Home, Products, About */}
          <div className="hidden lg:flex items-center gap-1 shrink-0 bg-slate-100/70 dark:bg-slate-900/70 p-1 rounded-full border border-slate-200/80 dark:border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={(e) => handleNavClick(e, item.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-500/25'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-pink-500'}`} />
                  <span>{lang === 'kh' ? item.labelKh : item.labelEn}</span>
                </button>
              );
            })}
          </div>

          {/* Search Bar (Desktop / Tablet) */}
          <div className="hidden md:flex flex-1 max-w-xs lg:max-w-sm mx-2">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (currentPage !== 'products' && e.target.value.trim() && onNavigate) {
                    onNavigate('products');
                  }
                }}
                placeholder={t('search_placeholder')}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/60 rounded-full text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
              />
            </div>
          </div>

          {/* Right Actions (Desktop) */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            {/* Telegram Channel Button */}
            {settings?.telegram_channel && (
              <a
                href={settings.telegram_channel}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Telegram</span>
              </a>
            )}

            {/* Light / Dark Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all text-xs font-semibold cursor-pointer shadow-sm"
              title={isDark ? "Switch to Light mode (ប្ដូរទៅពន្លឺ)" : "Switch to Dark mode (ប្ដូរទៅងងឹត)"}
              aria-label="Toggle Light and Dark Theme"
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden xl:inline text-[11px] font-medium">{lang === 'kh' ? 'ពន្លឺ' : 'Light'}</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden xl:inline text-[11px] font-medium">{lang === 'kh' ? 'ងងឹត' : 'Dark'}</span>
                </>
              )}
            </button>

            {/* Dynamic Flag Language Switcher with Dropdown/Toggle */}
            <div className="relative">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700/80 hover:border-pink-500/50 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all text-xs font-semibold cursor-pointer shadow-sm group"
                title={lang === 'kh' ? 'ប្ដូរទៅភាសាអង់គ្លេស (Switch to English)' : 'Switch to Khmer (ប្ដូរទៅភាសាខ្មែរ)'}
              >
                {/* Authentic Country Flag Badge */}
                {lang === 'kh' ? (
                  <CambodiaFlag className="w-5 h-3.5 shadow-xs" />
                ) : (
                  <EnglishFlag className="w-5 h-3.5 shadow-xs" />
                )}

                <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-pink-600 dark:text-pink-300 font-bold border border-slate-200 dark:border-transparent">
                  {lang === 'kh' ? 'KH' : 'EN'}
                </span>
                
                <span className="hidden lg:inline font-medium text-slate-800 dark:text-slate-200">
                  {lang === 'kh' ? 'ភាសាខ្មែរ' : 'English'}
                </span>
              </button>
            </div>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex sm:hidden items-center gap-1.5">
            {/* Quick Light / Dark Mode Toggle on Mobile */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300"
              title={isDark ? "Light mode" : "Dark mode"}
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* Quick Flag Language Toggle on Mobile */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold"
              title={lang === 'kh' ? 'ប្ដូរភាសា (Switch to English)' : 'Switch Language (ប្ដូរទៅខ្មែរ)'}
            >
              {lang === 'kh' ? (
                <CambodiaFlag className="w-4 h-3" />
              ) : (
                <EnglishFlag className="w-4 h-3" />
              )}
              <span className="text-pink-600 dark:text-pink-300 font-extrabold text-[11px]">{lang === 'kh' ? 'KH' : 'EN'}</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3 pt-1">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (currentPage !== 'products' && e.target.value.trim() && onNavigate) {
                  onNavigate('products');
                }
              }}
              placeholder={t('search_placeholder')}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-100 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/60 rounded-full text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/20"
            />
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-200 dark:border-slate-800/80 py-3 space-y-3 animate-fade-in">
            
            {/* Multi-Page Navigation Links */}
            <div className="grid grid-cols-3 gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={(e) => handleNavClick(e, item.id)}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-1 ${isActive ? 'text-white' : 'text-pink-500'}`} />
                    <span className="truncate w-full text-center text-[11px]">
                      {lang === 'kh' ? item.labelKh : item.labelEn}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Prominent Bilingual Flag Switcher in Drawer */}
            <div className="p-2 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block px-1">
                {lang === 'kh' ? 'ជ្រើសរើសភាសា (Language)' : 'Select Language'}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setLang('kh');
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    lang === 'kh'
                      ? 'bg-pink-500/10 border-pink-500/60 text-pink-600 dark:text-pink-400 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <CambodiaFlag className="w-5 h-3.5" />
                  <span>ភាសាខ្មែរ</span>
                  {lang === 'kh' && <Check className="w-3 h-3 text-pink-500" />}
                </button>
                <button
                  onClick={() => {
                    setLang('en');
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    lang === 'en'
                      ? 'bg-pink-500/10 border-pink-500/60 text-pink-600 dark:text-pink-400 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <EnglishFlag className="w-5 h-3.5" />
                  <span>English</span>
                  {lang === 'en' && <Check className="w-3 h-3 text-pink-500" />}
                </button>
              </div>
            </div>

            {/* Theme Toggle Option in Drawer */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
                <span>{isDark ? (lang === 'kh' ? 'ប្ដូរទៅមុខងារពន្លឺ (Light Mode)' : 'Switch to Light Mode') : (lang === 'kh' ? 'ប្ដូរទៅមុខងារងងឹត (Dark Mode)' : 'Switch to Dark Mode')}</span>
              </span>
              <span className="text-[10px] uppercase font-mono text-pink-500">
                {theme}
              </span>
            </button>

            {settings?.telegram_channel && (
              <a
                href={settings.telegram_channel}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-sky-600 dark:text-sky-400"
              >
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  <span>Telegram Channel</span>
                </span>
              </a>
            )}
          </div>
        )}

      </div>
    </nav>
  );
};
