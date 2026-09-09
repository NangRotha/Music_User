import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Compass, Home, Disc3, ArrowLeft } from 'lucide-react';

// Bilingual 404 screen for unknown paths/URLs.
export const NotFoundPage = ({ onNavigate }) => {
  const { lang } = useLanguage();

  const requestedPath = window.location.pathname || '/';

  const goTo = (page) => {
    if (onNavigate) onNavigate(page);
  };

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:py-20">
      {/* Floating decorative icon */}
      <div className="animate-float mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-600 to-amber-500 text-white shadow-lg shadow-pink-600/20">
        <Compass className="h-8 w-8" />
      </div>

      <p className="bg-gradient-to-r from-pink-600 to-amber-500 bg-clip-text text-7xl font-black tracking-tight text-transparent sm:text-8xl">
        404
      </p>

      <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl dark:text-white">
        {lang === 'kh' ? 'រកមិនឃើញទំព័រ' : 'Page Not Found'}
      </h1>

      <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-500 sm:text-base dark:text-zinc-400">
        {lang === 'kh'
          ? 'ទំព័រដែលអ្នកកំពុងស្វែងរក មិនមាននៅលើគេហទំព័រនេះទេ។ សូមត្រឡប់ទៅទំព័រដើមវិញ ឬស្វែងរកបទចម្រៀងបន្តទៀត។'
          : 'The page you are looking for doesn’t exist or has been moved. Head back to the homepage or keep browsing the music library.'}
      </p>

      <span className="mt-6 inline-flex max-w-full items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-[11px] font-semibold text-zinc-400 dark:border-white/10 dark:bg-white/5 dark:text-zinc-500">
        <ArrowLeft className="h-3 w-3" />
        <span className="truncate">{requestedPath}</span>
      </span>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => goTo('home')}
          className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-zinc-900 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-zinc-700 active:scale-[0.98] dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          <Home className="h-4 w-4" />
          {lang === 'kh' ? 'ត្រឡប់ទៅទំព័រដើម' : 'Back to Home'}
        </button>
        <button
          onClick={() => goTo('products')}
          className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border border-zinc-200 bg-white px-6 text-sm font-semibold text-zinc-700 shadow-sm transition-colors hover:border-zinc-300 active:scale-[0.98] dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
        >
          <Disc3 className="h-4 w-4 text-pink-600 dark:text-pink-400" />
          {lang === 'kh' ? 'ស្វែងរកបទចម្រៀង' : 'Browse Tracks'}
        </button>
      </div>
    </main>
  );
};
