import React, { useState, useEffect, useCallback } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { PlayerProvider } from './context/PlayerContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { MediaSlider } from './components/MediaSlider';
import { HeroBanner } from './components/HeroBanner';
import { MusicCard } from './components/MusicCard';
import { BuyModal } from './components/BuyModal';
import { BottomPlayer } from './components/BottomPlayer';
import { Footer } from './components/Footer';
import { AboutSection } from './components/AboutSection';
import { AlertPopupModal } from './components/AlertPopupModal';
import {
  Sparkles,
  Disc3,
  Music2,
  Filter,
  Loader2,
  ArrowRight,
  Headphones,
  HeartHandshake,
  Send,
  BookOpen,
  Layers
} from 'lucide-react';

const MainStore = () => {
  const { lang, t } = useLanguage();
  
  // Multi-Page Routing state: 'home' | 'products' | 'about'
  const getInitialPage = () => {
    const hash = window.location.hash.replace('#/', '').replace('#', '').trim();
    if (hash === 'products' || hash === 'about') return hash;
    return 'home';
  };

  const [currentPage, setCurrentPage] = useState(getInitialPage);

  const navigateToPage = (page) => {
    const targetPage = (page === 'home' || page === 'products' || page === 'about') ? page : 'home';
    setCurrentPage(targetPage);
    window.location.hash = targetPage === 'home' ? '#/' : `#/${targetPage}`;
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const page = getInitialPage();
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const [settings, setSettings] = useState(null);
  const [musicList, setMusicList] = useState([]);
  const [genres, setGenres] = useState(['All']);
  const [categories, setCategories] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Buy Modal state
  const [selectedTrackForBuy, setSelectedTrackForBuy] = useState(null);
  const [promoCodeToPreload, setPromoCodeToPreload] = useState('');

  // Fetch Settings
  const fetchSettings = useCallback(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && data.id) setSettings(data);
      })
      .catch(err => console.error('Failed to load settings:', err));
  }, []);

  // Fetch Genres
  const fetchGenres = useCallback(() => {
    fetch('/api/genres')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setGenres(data);
      })
      .catch(err => console.error('Failed to load genres:', err));
  }, []);

  // Fetch Categories
  const fetchCategories = useCallback(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(err => console.error('Failed to load categories:', err));
  }, []);

  // Fetch Music Tracks
  const fetchMusic = useCallback((silent = false) => {
    if (!silent) setLoading(true);
    let url = `/api/music?genre=${encodeURIComponent(selectedGenre)}`;
    if (searchQuery.trim()) {
      url += `&search=${encodeURIComponent(searchQuery.trim())}`;
    }
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMusicList(data);
      })
      .catch(err => console.error('Failed to load music:', err))
      .finally(() => {
        if (!silent) setLoading(false);
      });
  }, [selectedGenre, searchQuery]);

  // Sync Browser Title Icon (Favicon) & Page Title from Site Settings Logo
  useEffect(() => {
    if (settings) {
      if (settings.logo_url) {
        const iconLinks = document.querySelectorAll("link[rel*='icon']");
        iconLinks.forEach(link => {
          link.href = settings.logo_url;
        });
      }
      const titleName = lang === 'kh' 
        ? (settings.site_name_kh || settings.site_name_en) 
        : (settings.site_name_en || settings.site_name_kh);
      if (titleName) {
        document.title = `${titleName} - Music Store (ទិញបទចម្រៀងតាម Telegram)`;
      }
    }
  }, [settings, lang]);

  // Initial load
  useEffect(() => {
    fetchSettings();
    fetchGenres();
    fetchCategories();
  }, [fetchSettings, fetchGenres, fetchCategories]);

  useEffect(() => {
    fetchMusic();
  }, [fetchMusic]);

  // Real-time auto-sync logic
  useEffect(() => {
    let syncChannel;
    try {
      syncChannel = new BroadcastChannel('khmer_beats_sync');
      syncChannel.onmessage = (event) => {
        fetchSettings();
        fetchGenres();
        fetchCategories();
        fetchMusic(true);
      };
    } catch (e) {}

    const handleFocus = () => {
      fetchSettings();
      fetchGenres();
      fetchCategories();
      fetchMusic(true);
    };
    window.addEventListener('focus', handleFocus);

    const interval = setInterval(() => {
      fetchSettings();
      fetchGenres();
      fetchCategories();
      fetchMusic(true);
    }, 4000);

    return () => {
      if (syncChannel) syncChannel.close();
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [fetchSettings, fetchGenres, fetchCategories, fetchMusic]);

  const handleBuyClick = (track) => {
    setSelectedTrackForBuy(track);
  };

  const handlePromoSelect = (code) => {
    setPromoCodeToPreload(code);
    if (musicList.length > 0) {
      setSelectedTrackForBuy(musicList[0]);
    }
  };

  const featuredTracks = musicList.filter(m => m.is_featured);
  const currencySymbol = settings?.currency_symbol || '$';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-pink-500 selection:text-white transition-colors duration-200">
      
      {/* Top Multi-Page Navigation */}
      <Navbar
        settings={settings}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currentPage={currentPage}
        onNavigate={navigateToPage}
      />

      {/* ================= PAGE 1: HOME ================= */}
      {currentPage === 'home' && (
        <div className="space-y-8 sm:space-y-12 flex-1 pb-12">
          {/* Media Slider (Images, MP4 Videos, YouTube Embeds) */}
          <MediaSlider onNavigate={navigateToPage} />

          {/* Featured Tracks Showcase on Home Page */}
          {featuredTracks.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-pink-500 dark:text-pink-400" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                      {t('featured_tracks')}
                    </h2>
                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                      {lang === 'kh' ? 'បទចម្រៀងដែលទទួលបានការពេញនិយម និងមានការបញ្ចុះតម្លៃខ្ពស់' : 'Handpicked chart toppers with special discounts'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigateToPage('products')}
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-pink-600 dark:text-pink-400 hover:bg-pink-500/10 border border-pink-500/20 transition-all cursor-pointer"
                >
                  <span>{lang === 'kh' ? 'មើលទាំងអស់' : 'View All Tracks'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {featuredTracks.slice(0, 4).map((track) => (
                  <MusicCard
                    key={`home-feat-${track.id}`}
                    track={track}
                    categories={categories}
                    onBuyClick={handleBuyClick}
                    currencySymbol={currencySymbol}
                  />
                ))}
              </div>

              <div className="sm:hidden mt-4 text-center">
                <button
                  onClick={() => navigateToPage('products')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 text-xs font-bold border border-pink-200 dark:border-pink-800"
                >
                  <span>{lang === 'kh' ? 'មើលបទចម្រៀងទាំងអស់' : 'View All Tracks'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </section>
          )}

          {/* Hot Promo Banners & Telegram CTA */}
          <HeroBanner
            settings={settings}
            onPromoSelect={handlePromoSelect}
          />

          {/* Value Highlights on Home */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center shrink-0">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {lang === 'kh' ? 'សំឡេងកម្រិតស្ទូឌីយោ' : 'Studio Master Quality'}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {lang === 'kh' ? 'ឯកសារ 320kbps & WAV ច្បាស់ឥតខ្ចោះ' : 'Crystal clear lossless audio formats'}
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {lang === 'kh' ? 'គាំទ្រសិល្បករផ្ទាល់' : 'Direct Artist Support'}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {lang === 'kh' ? 'ថវិកាដល់ដៃអ្នកបង្កើតស្នាដៃពិតៗ' : '100% transparent royalty distribution'}
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {lang === 'kh' ? 'ទិញរហ័សតាម Telegram' : 'Instant Telegram Delivery'}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {lang === 'kh' ? 'គ្មានការបង្កើតគណនី ទទួលឯកសារភ្លាមៗ' : 'No password needed, receive files fast'}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ================= PAGE 2: PRODUCTS / MUSIC ================= */}
      {currentPage === 'products' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full py-8 space-y-6 sm:space-y-8">
          
          {/* Products Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center shrink-0">
                <Disc3 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {lang === 'kh' ? 'បណ្ណាល័យបទចម្រៀង (All Music Products)' : 'Music Products Library'}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {lang === 'kh' ? `មានបទចម្រៀងសរុប ${musicList.length} បទ អាចស្ដាប់សាកល្បងដោយឥតគិតថ្លៃ` : `Showing ${musicList.length} tracks. Preview anytime, buy via Telegram.`}
                </p>
              </div>
            </div>

            {/* Quick search input on products page */}
            <div className="w-full md:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search_placeholder')}
                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          {/* Genre Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <Filter className="w-4 h-4 text-slate-400 shrink-0 ml-1 mr-1" />
            {genres.map((g) => {
              const isActive = selectedGenre === g;
              const catObj = categories.find(
                (c) =>
                  c.name_en.toLowerCase() === g.toLowerCase() ||
                  c.slug.toLowerCase() === g.toLowerCase() ||
                  c.name_kh === g
              );
              const label =
                g === 'All'
                  ? t('all_genres')
                  : catObj
                  ? (lang === 'kh' ? (catObj.name_kh || catObj.name_en) : catObj.name_en)
                  : g;

              return (
                <button
                  key={g}
                  onClick={() => setSelectedGenre(g)}
                  className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20'
                      : 'bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 shadow-sm dark:bg-slate-900/80 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-white dark:border-slate-800'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Music Track Cards Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-8 h-8 text-pink-500 animate-spin mb-3" />
              <span className="text-xs sm:text-sm font-medium">Loading music catalog...</span>
            </div>
          ) : musicList.length === 0 ? (
            <div className="text-center py-16 sm:py-20 bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
              <Music2 className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-700 dark:text-slate-300 font-medium text-xs sm:text-sm">
                {t('no_tracks_found')}
              </p>
              <button
                onClick={() => { setSelectedGenre('All'); setSearchQuery(''); }}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs text-pink-600 dark:text-pink-400 font-bold cursor-pointer transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {musicList.map((track) => (
                <MusicCard
                  key={`catalog-${track.id}`}
                  track={track}
                  categories={categories}
                  onBuyClick={handleBuyClick}
                  currencySymbol={currencySymbol}
                />
              ))}
            </div>
          )}

        </main>
      )}

      {/* ================= PAGE 3: ABOUT US ================= */}
      {currentPage === 'about' && (
        <div className="flex-1">
          <AboutSection />
        </div>
      )}

      {/* Footer */}
      <Footer settings={settings} />

      {/* Persistent Audio Bottom Player */}
      <BottomPlayer
        onBuyClick={handleBuyClick}
        currencySymbol={currencySymbol}
      />

      {/* Buy & Promo Checkout Modal */}
      <BuyModal
        track={selectedTrackForBuy}
        isOpen={Boolean(selectedTrackForBuy)}
        onClose={() => {
          setSelectedTrackForBuy(null);
          setPromoCodeToPreload('');
        }}
        currencySymbol={currencySymbol}
        initialPromo={promoCodeToPreload}
      />

      {/* Notice / Announcement Alert Popup Modal (Shows on page refresh or page change) */}
      <AlertPopupModal currentPage={currentPage} />

    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <PlayerProvider>
          <MainStore />
        </PlayerProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
