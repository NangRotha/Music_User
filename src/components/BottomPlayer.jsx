import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { usePlayer } from '../context/PlayerContext';
import { Play, Pause, Volume2, VolumeX, Send } from 'lucide-react';

export const BottomPlayer = ({ onBuyClick, currencySymbol = "$" }) => {
  const { lang, t } = useLanguage();
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playTrack,
    seek,
    setVolume,
    toggleMute
  } = usePlayer();

  if (!currentTrack) return null;

  const title = lang === 'kh' ? (currentTrack.title_kh || currentTrack.title_en) : currentTrack.title_en;
  const artist = lang === 'kh' ? (currentTrack.artist_kh || currentTrack.artist_en) : currentTrack.artist_en;

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    seek(pos * duration);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border-t border-slate-200 dark:border-slate-800/80 shadow-2xl px-3 py-2.5 sm:px-6 sm:py-3 transition-colors duration-200">
      
      {/* Top Scrubber Line */}
      <div 
        onClick={handleSeek}
        className="absolute top-0 left-0 right-0 h-1 sm:h-1.5 bg-slate-200 dark:bg-slate-800 hover:h-2 transition-all cursor-pointer group"
      >
        <div 
          className="h-full bg-gradient-to-r from-pink-500 to-purple-600 relative group-hover:from-pink-400 group-hover:to-purple-500"
          style={{ width: `${progressPct}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 mt-0.5">
        
        {/* Left: Track Information */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 max-w-[45%] sm:max-w-[30%]">
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 shrink-0 border border-slate-200 dark:border-slate-800">
            {currentTrack.cover_image_url ? (
              <img
                src={currentTrack.cover_image_url}
                alt={title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-pink-500/10">
                <Volume2 className="w-5 h-5 text-pink-500" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
              {title}
            </h4>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {artist}
            </p>
          </div>
        </div>

        {/* Center: Play / Pause & Time */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => playTrack(currentTrack)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-md cursor-pointer"
              title={isPlaying ? t('pause') : t('play_preview')}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Volume & Buy Button */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Volume Control (Tablet / Desktop) */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-1 cursor-pointer"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-500" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 lg:w-20 accent-pink-500 h-1 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Direct Buy CTA */}
          <button
            onClick={() => onBuyClick(currentTrack)}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-md shadow-pink-600/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('buy_now')}</span>
            <span className="sm:hidden">{t('price')}</span>
            <span className="font-mono ml-0.5">
              {currencySymbol}{((currentTrack.sale_price ?? currentTrack.price) || 0).toFixed(2)}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};
