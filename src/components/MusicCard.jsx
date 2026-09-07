import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { usePlayer } from '../context/PlayerContext';
import { Play, Send, Sparkles, Clock, Volume2 } from 'lucide-react';

export const MusicCard = ({ track, categories = [], onBuyClick, currencySymbol = "$", queue = [] }) => {
  const { lang, t } = useLanguage();
  const { currentTrack, isPlaying, playTrack } = usePlayer();

  const isCurrentTrackPlaying = currentTrack?.id === track.id && isPlaying;

  const title = lang === 'kh' ? (track.title_kh || track.title_en) : track.title_en;
  const artist = lang === 'kh' ? (track.artist_kh || track.artist_en) : track.artist_en;

  const matchedCategory = categories.find(
    (c) =>
      c.name_en.toLowerCase() === (track.genre || '').toLowerCase() ||
      c.slug.toLowerCase() === (track.genre || '').toLowerCase() ||
      c.name_kh === track.genre
  );
  const displayGenre = matchedCategory
    ? (lang === 'kh' ? (matchedCategory.name_kh || matchedCategory.name_en) : matchedCategory.name_en)
    : track.genre;

  const hasDiscount = (track.discount_percent || 0) > 0;
  const originalPrice = track.price;
  const salePrice = track.sale_price ?? (hasDiscount ? (originalPrice * (1 - track.discount_percent / 100)) : originalPrice);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-900/[0.05] dark:border-white/10 dark:bg-zinc-900/70 dark:hover:border-white/20 dark:hover:bg-zinc-900">
      {/* Cover artwork */}
      <div className="relative aspect-square w-full overflow-hidden bg-zinc-100 dark:bg-zinc-950">
        {track.cover_image_url ? (
          <img
            src={track.cover_image_url}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80";
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-100 dark:bg-zinc-950">
            <Volume2 className="h-12 w-12 text-zinc-300 dark:text-zinc-700" />
          </div>
        )}

        {/* Genre tag */}
        {displayGenre && (
          <span className="absolute left-2.5 top-2.5 rounded-lg bg-white/90 px-2 py-1 text-[11px] font-semibold text-zinc-700 shadow-sm ring-1 ring-zinc-900/5 backdrop-blur-sm dark:bg-zinc-900/80 dark:text-zinc-200 dark:ring-white/10">
            {displayGenre}
          </span>
        )}

        {/* Discount badge */}
        {hasDiscount && (
          <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-lg bg-pink-600 px-2 py-1 text-[11px] font-bold text-white shadow-sm">
            <Sparkles className="h-3 w-3" />
            -{track.discount_percent}%
          </span>
        )}

        {/* Duration */}
        {track.duration && (
          <span className="absolute bottom-2.5 left-2.5 flex items-center gap-1 rounded-md bg-zinc-950/60 px-1.5 py-0.5 font-mono text-[10px] text-white backdrop-blur-sm">
            <Clock className="h-3 w-3 text-zinc-300" />
            {track.duration}
          </span>
        )}

        {/* Play / pause control */}
        <button
          onClick={() => playTrack(track, queue?.length ? queue : undefined)}
          className={`absolute bottom-2.5 right-2.5 flex h-11 w-11 items-center justify-center rounded-full shadow-md transition-all duration-200 cursor-pointer ${
            isCurrentTrackPlaying
              ? 'bg-pink-600 text-white'
              : 'bg-white/95 text-zinc-900 ring-1 ring-zinc-900/10 hover:bg-pink-600 hover:text-white hover:ring-pink-600 dark:bg-zinc-900/90 dark:text-white dark:ring-white/20'
          }`}
          title={isCurrentTrackPlaying ? t('pause') : t('play_preview')}
        >
          {isCurrentTrackPlaying ? (
            <span className="flex items-end gap-[3px]">
              <span className="h-3.5 w-[3px] rounded-full bg-white" />
              <span className="h-[18px] w-[3px] rounded-full bg-white" />
              <span className="h-3 w-[3px] rounded-full bg-white" />
            </span>
          ) : (
            <Play className="ml-0.5 h-5 w-5 fill-current" />
          )}
        </button>
      </div>

      {/* Track info */}
      <div className="flex flex-1 flex-col p-4">
        <h3
          className="line-clamp-1 text-sm font-bold text-zinc-900 transition-colors group-hover:text-pink-600 dark:text-white dark:group-hover:text-pink-400"
          title={title}
        >
          {title}
        </h3>
        <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500 dark:text-zinc-400">
          {artist}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-3.5">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
              {hasDiscount ? t('sale_price') : t('price')}
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-white">
                {currencySymbol}{Number.isFinite(salePrice) ? salePrice.toFixed(2) : '0.00'}
              </span>
              {hasDiscount && (
                <span className="text-xs text-zinc-400 line-through dark:text-zinc-500">
                  {currencySymbol}{originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => onBuyClick(track)}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-pink-600 px-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-pink-500 cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" />
            {t('buy_now')}
          </button>
        </div>
      </div>
    </article>
  );
};
