import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { usePlayer } from '../context/PlayerContext';
import { Play, Pause, Send, Sparkles, Clock, Volume2 } from 'lucide-react';

export const MusicCard = ({ track, categories = [], onBuyClick, currencySymbol = "$" }) => {
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
    <div className="group relative bg-white hover:bg-slate-50/90 dark:bg-slate-900/70 dark:hover:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800/80 hover:border-pink-500/40 dark:hover:border-pink-500/40 rounded-2xl p-4 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-pink-500/10 flex flex-col justify-between">
      
      {/* Cover Artwork & Audio Play Overlay */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 mb-3 group/cover">
        {track.cover_image_url ? (
          <img
            src={track.cover_image_url}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-pink-100 via-purple-100 to-slate-100 dark:from-pink-900/40 dark:via-purple-900/30 dark:to-slate-900">
            <Volume2 className="w-12 h-12 text-pink-500/50 dark:text-pink-400/50" />
          </div>
        )}

        {/* Gradient Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-pink-600/90 backdrop-blur-md text-white font-extrabold text-xs shadow-md shadow-pink-600/30 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>-{track.discount_percent}%</span>
          </div>
        )}

        {/* Genre Tag */}
        {displayGenre && (
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-white/90 dark:bg-slate-900/80 backdrop-blur-md text-slate-800 dark:text-slate-300 text-[11px] font-semibold border border-slate-200 dark:border-slate-700/50 shadow-sm">
            {displayGenre}
          </div>
        )}

        {/* Play / Pause Overlay Button */}
        <button
          onClick={() => playTrack(track)}
          className={`absolute bottom-3 right-3 w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-lg ${
            isCurrentTrackPlaying
              ? 'bg-pink-500 text-white scale-100 shadow-pink-500/40'
              : 'bg-white/90 hover:bg-pink-500 text-slate-900 hover:text-white dark:bg-slate-900/90 dark:hover:bg-pink-500 dark:text-white opacity-90 hover:scale-110'
          }`}
          title={isCurrentTrackPlaying ? t('pause') : t('play_preview')}
        >
          {isCurrentTrackPlaying ? (
            <div className="flex items-center gap-0.5">
              <span className="w-1 h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </button>

        {/* Duration badge */}
        {track.duration && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] font-mono text-white bg-slate-950/70 px-2 py-0.5 rounded backdrop-blur-sm">
            <Clock className="w-3 h-3 text-slate-300" />
            <span>{track.duration}</span>
          </div>
        )}
      </div>

      {/* Track Info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug line-clamp-1 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors" title={title}>
            {title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
            {artist}
          </p>
        </div>

        {/* Price & Buy CTA */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500">
              {hasDiscount ? t('sale_price') : t('price')}
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-pink-600 dark:text-pink-400">
                {currencySymbol}{salePrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-slate-400 dark:text-slate-500 line-through">
                  {currencySymbol}{originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => onBuyClick(track)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-pink-600/20 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{t('buy_now')}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
