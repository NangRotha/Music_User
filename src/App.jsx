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
  ArrowRight
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
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900 transition-colors duration-200 dark:bg-zinc-950 dark:text-zinc-50">
      
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
              <div className="mb-5 flex flex-wrap items-end justify-between gap-4 sm:mb-7">
                <div>
                  <p className="mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-pink-600/15 bg-pink-600/[0.06] px-2.5 py-1 text-[11px] font-semibold text-pink-700 dark:border-pink-400/20 dark:bg-pink-400/10 dark:text-pink-300">
                    <Sparkles className="h-3 w-3" />
                    {lang === 'kh' ? 'បទល្បីៗ' : 'Editor’s Picks'}
                  </p>
                  <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 sm:text-2xl dark:text-white">
                    {t('featured_tracks')}
                  </h2>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {lang === 'kh' ? 'បទចម្រៀងដែលទទួលបានការពេញនិយម និងមានការបញ្ចុះតម្លៃខ្ពស់' : 'Handpicked chart toppers with special discounts'}
                  </p>
                </div>

                <button
                  onClick={() => navigateToPage('products')}
                  className="hidden h-10 cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-4 text-xs font-semibold text-zinc-700 shadow-sm transition-colors hover:border-zinc-300 hover:text-zinc-900 sm:inline-flex dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
                >
                  <span>{lang === 'kh' ? 'មើលទាំងអស់' : 'View All Tracks'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
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
                    queue={featuredTracks.slice(0, 4)}
                  />
                ))}
              </div>

              <div className="mt-5 text-center sm:hidden">
                <button
                  onClick={() => navigateToPage('products')}
                  className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-xs font-semibold text-zinc-700 shadow-sm transition-colors hover:border-zinc-300 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
                >
                  <span>{lang === 'kh' ? 'មើលបទចម្រៀងទាំងអស់' : 'View All Tracks'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </section>
          )}

          {/* Hot Promo Banners & Telegram CTA */}
          <HeroBanner
            settings={settings}
            onPromoSelect={handlePromoSelect}
          />
        </div>
      )}

      {/* ================= PAGE 2: PRODUCTS / MUSIC ================= */}
      {currentPage === 'products' && (
        <main className="mx-auto w-full max-w-7xl flex-1 space-y-7 px-4 py-10 sm:px-6 sm:space-y-9 lg:px-8">
          
          {/* Products Page Header */}
          <div className="flex flex-col gap-4 border-b border-zinc-200 pb-5 md:flex-row md:items-center md:justify-between dark:border-white/10">
            <div className="flex items-center gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-600/10">
                <Disc3 className="h-5 w-5 text-pink-600 dark:text-pink-400" />
              </span>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-zinc-900 sm:text-2xl dark:text-white">
                  {lang === 'kh' ? 'បណ្ណាល័យបទចម្រៀង' : 'Music Products Library'}
                </h1>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  {lang === 'kh' ? `មានបទចម្រៀងសរុប ${musicList.length} បទ អាចស្ដាប់សាកល្បងដោយឥតគិតថ្លៃ` : `Showing ${musicList.length} tracks. Preview anytime, buy via Telegram.`}
                </p>
              </div>
            </div>

            {/* Quick search input on products page */}
            <div className="w-full md:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search_placeholder')}
                className="h-10 w-full rounded-full border border-zinc-200 bg-white px-4 text-sm text-zinc-800 shadow-sm placeholder:text-zinc-400 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
            </div>
          </div>

          {/* Genre Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <Filter className="ml-1 mr-1 h-4 w-4 shrink-0 text-zinc-400" />
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
                  className={`inline-flex h-9 shrink-0 cursor-pointer items-center whitespace-nowrap rounded-full px-4 text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950'
                      : 'border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-900 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Music Track Cards Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
              <Loader2 className="mb-3 h-8 w-8 animate-spin text-pink-600 dark:text-pink-400" />
              <span className="text-xs sm:text-sm font-medium">Loading music catalog...</span>
            </div>
          ) : musicList.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 py-16 text-center sm:py-20 dark:border-white/10 dark:bg-white/[0.03]">
              <Music2 className="mx-auto mb-3 h-11 w-11 text-zinc-300 dark:text-zinc-600" />
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                {t('no_tracks_found')}
              </p>
              <button
                onClick={() => { setSelectedGenre('All'); setSearchQuery(''); }}
                className="mt-4 inline-flex h-9 cursor-pointer items-center rounded-lg border border-zinc-200 bg-white px-4 text-xs font-semibold text-zinc-700 transition-colors hover:border-zinc-300 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
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
                  queue={musicList}
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
