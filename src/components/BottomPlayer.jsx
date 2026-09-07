import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { usePlayer } from '../context/PlayerContext';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Send,
  X,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  Shuffle,
  ChevronUp,
  ChevronDown,
  ListMusic
} from 'lucide-react';

export const BottomPlayer = ({ onBuyClick, currencySymbol = "$" }) => {
  const { lang, t } = useLanguage();
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackRate,
    loopMode,
    isShuffle,
    queue,
    playTrack,
    seek,
    skip,
    playNext,
    playPrevious,
    setVolume,
    cyclePlaybackRate,
    toggleMute,
    toggleShuffle,
    cycleLoopMode,
    closePlayer
  } = usePlayer();

  // Expanded "Now Playing" sheet
  const [expanded, setExpanded] = useState(false);

  // Close sheet with Escape + lock body scroll while it is open
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [expanded]);

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

  // Keyboard support: ← / → seek by 5 seconds
  const handleSeekKey = (e) => {
    if (e.key === 'ArrowRight') {
      skip(5);
    } else if (e.key === 'ArrowLeft') {
      skip(-5);
    }
  };

  const price = (currentTrack.sale_price ?? currentTrack.price) || 0;
  const priceText = Number.isFinite(price) ? price.toFixed(2) : '0.00';

  const ghostIconBtn =
    'flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-zinc-500 transition-[color,background-color,transform] hover:bg-zinc-100 hover:text-zinc-900 active:scale-90 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white';

  const handleClosePlayer = () => {
    setExpanded(false);
    closePlayer();
  };

  return (
    <>
      {/* Floating dock wrapper (full-width bar on mobile, rounded card on sm+) */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 sm:px-4 sm:pb-4">
        <div className="pointer-events-auto relative mx-auto w-full max-w-4xl overflow-hidden rounded-t-2xl border-t border-zinc-200/80 bg-white/95 shadow-[0_-6px_24px_rgba(0,0,0,0.05)] backdrop-blur-xl sm:rounded-2xl sm:border sm:border-zinc-200/90 sm:shadow-2xl sm:shadow-zinc-950/[0.08] dark:border-white/10 dark:bg-zinc-950/95 dark:sm:border-white/10">
        {/* ===== Scrubber (whole width, hidden tall hit-area for touch) ===== */}
        <div
          onClick={handleSeek}
          onKeyDown={handleSeekKey}
          role="slider"
          tabIndex={0}
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={duration || 0}
          aria-valuenow={currentTime || 0}
          className="group absolute inset-x-0 top-0 z-10 flex h-4 cursor-pointer items-center outline-none"
        >
          <div className="relative mx-2 h-[3px] w-[calc(100%-16px)] overflow-visible rounded-full bg-zinc-200 transition-colors group-hover:bg-zinc-300 dark:bg-white/10 dark:group-hover:bg-white/20">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-pink-600 transition-[width] duration-100 dark:bg-pink-500"
              style={{ width: `${progressPct}%` }}
            >
              <span
                className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white opacity-0 shadow ring-1 ring-black/10 transition-opacity group-hover:opacity-100 dark:ring-white/20"
                style={{ left: '100%', transform: 'translate(-50%, -50%)' }}
              />
            </div>
          </div>
        </div>

        {/* ===== Dock content ===== */}
        <div className="flex h-[68px] items-center gap-2 px-3 sm:h-[76px] sm:gap-3 sm:px-5">
          {/* Left: track info — tap to open the expanded Now Playing panel */}
          <button
            onClick={() => setExpanded(true)}
            className="group flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 text-left sm:gap-3"
            title={lang === 'kh' ? 'បើក Now Playing' : 'Open Now Playing'}
          >
            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-zinc-100 ring-1 ring-zinc-200 sm:h-11 sm:w-11 dark:bg-zinc-900 dark:ring-white/10">
              {currentTrack.cover_image_url ? (
                <img
                  src={currentTrack.cover_image_url}
                  alt={title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-pink-600/10">
                  <Volume2 className="h-5 w-5 text-pink-600" />
                </span>
              )}
              {isPlaying && (
                <>
                  <span className="pointer-events-none absolute inset-0 rounded-lg ring-2 ring-pink-500/70" aria-hidden="true" />
                  <span className="absolute bottom-1 right-1 flex h-[14px] items-end gap-[2px] rounded bg-zinc-950/55 px-[4px] py-[3px]" aria-hidden="true">
                    <span className="eq-bar h-[8px] w-[2px] rounded-full bg-pink-400" style={{ animationDelay: '0ms' }} />
                    <span className="eq-bar h-[8px] w-[2px] rounded-full bg-pink-300" style={{ animationDelay: '220ms' }} />
                    <span className="eq-bar h-[8px] w-[2px] rounded-full bg-pink-400" style={{ animationDelay: '440ms' }} />
                  </span>
                </>
              )}
            </span>

            <span className="min-w-0 flex-1 pr-1">
              <span className="block truncate text-sm font-semibold leading-tight text-zinc-900 group-hover:text-pink-600 dark:text-white dark:group-hover:text-pink-400" title={title}>
                {title}
              </span>
              <span className="mt-0.5 block truncate text-xs leading-tight text-zinc-500 dark:text-zinc-400" title={artist}>
                {artist}
              </span>
            </span>

            <ChevronUp className="h-4 w-4 shrink-0 text-zinc-400 transition-transform group-hover:-translate-y-0.5 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300" />
          </button>

          {/* Center: transport controls */}
          <div className="flex shrink-0 flex-col items-center gap-0.5">
            <div className="flex items-center gap-1 sm:gap-1.5">
              {/* Previous track */}
              <button
                onClick={playPrevious}
                disabled={queue.length <= 1}
                className={`${ghostIconBtn} sm:h-9 sm:w-9 disabled:pointer-events-none disabled:opacity-40`}
                title={lang === 'kh' ? 'បទមុន' : 'Previous track'}
                aria-label={lang === 'kh' ? 'បទមុន' : 'Previous track'}
              >
                <SkipBack className="h-4 w-4 fill-current" />
              </button>

              {/* Rewind 10s (sm and up) */}
              <button
                onClick={() => skip(-10)}
                className={`${ghostIconBtn} hidden sm:flex sm:h-9 sm:w-9`}
                title={lang === 'kh' ? 'ថយក្រោយ 10 វិនាទី' : 'Back 10 seconds'}
                aria-label={lang === 'kh' ? 'ថយក្រោយ 10 វិនាទី' : 'Back 10 seconds'}
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              {/* Play / pause */}
              <button
                onClick={() => playTrack(currentTrack)}
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-zinc-900 text-white shadow-sm transition-transform hover:scale-105 active:scale-95 dark:bg-white dark:text-zinc-950"
                title={isPlaying ? t('pause') : t('play_preview')}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4 fill-current" />
                ) : (
                  <Play className="ml-0.5 h-4 w-4 fill-current" />
                )}
              </button>

              {/* Forward 10s (sm and up) */}
              <button
                onClick={() => skip(10)}
                className={`${ghostIconBtn} hidden sm:flex sm:h-9 sm:w-9`}
                title={lang === 'kh' ? 'ទៅមុខ 10 វិនាទី' : 'Forward 10 seconds'}
                aria-label={lang === 'kh' ? 'ទៅមុខ 10 វិនាទី' : 'Forward 10 seconds'}
              >
                <RotateCw className="h-4 w-4" />
              </button>

              {/* Next track */}
              <button
                onClick={playNext}
                disabled={queue.length <= 1}
                className={`${ghostIconBtn} sm:h-9 sm:w-9 disabled:pointer-events-none disabled:opacity-40`}
                title={lang === 'kh' ? 'បទបន្ទាប់' : 'Next track'}
                aria-label={lang === 'kh' ? 'បទបន្ទាប់' : 'Next track'}
              >
                <SkipForward className="h-4 w-4 fill-current" />
              </button>
            </div>

            <span className="hidden whitespace-nowrap font-mono text-[10px] tabular-nums text-zinc-400 lg:block dark:text-zinc-500">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right: volume + buy + cancel */}
          <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5 sm:gap-2">
            {/* Modes + volume (lg and up) */}
            <div className="hidden items-center gap-1.5 lg:flex">
              {/* Shuffle */}
              <button
                onClick={toggleShuffle}
                aria-pressed={isShuffle}
                className={`flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-[color,background-color,transform] active:scale-90 ${
                  isShuffle
                    ? 'bg-pink-600/10 text-pink-600 dark:bg-pink-400/10 dark:text-pink-400'
                    : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white'
                }`}
                title={lang === 'kh' ? 'លាយបទចម្រៀង (Shuffle)' : isShuffle ? 'Disable shuffle' : 'Enable shuffle'}
                aria-label={isShuffle ? 'Disable shuffle' : 'Enable shuffle'}
              >
                <Shuffle className="h-4 w-4" />
              </button>

              {/* Loop mode: off -> all -> one */}
              <button
                onClick={cycleLoopMode}
                aria-pressed={loopMode !== 'off'}
                className={`flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-[color,background-color,transform] active:scale-90 ${
                  loopMode !== 'off'
                    ? 'bg-pink-600/10 text-pink-600 dark:bg-pink-400/10 dark:text-pink-400'
                    : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white'
                }`}
                title={
                  loopMode === 'one'
                    ? (lang === 'kh' ? 'ចាក់ម្ដងទៀតមួយបទ (Repeat One)' : 'Repeat one')
                    : loopMode === 'all'
                    ? (lang === 'kh' ? 'ចាក់ឡើងវិញទាំងអស់ (Repeat All)' : 'Repeat all')
                    : (lang === 'kh' ? 'បិទ Repeat' : 'Repeat off')
                }
                aria-label={`Loop: ${loopMode}`}
              >
                {loopMode === 'one' ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
              </button>

              {/* Playback speed */}
              <button
                onClick={cyclePlaybackRate}
                className={`inline-flex h-9 shrink-0 cursor-pointer items-center rounded-full px-2.5 font-mono text-[11px] font-semibold transition-[color,background-color,transform] active:scale-90 ${
                  playbackRate !== 1
                    ? 'bg-pink-600/10 text-pink-600 dark:bg-pink-400/10 dark:text-pink-400'
                    : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white'
                }`}
                title={lang === 'kh' ? 'ល្បឿនចាក់បទ' : 'Playback speed'}
                aria-label="Playback speed"
              >
                {playbackRate}x
              </button>

              {/* Mute */}
              <button
                onClick={toggleMute}
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-zinc-500 transition-[color,background-color,transform] hover:bg-zinc-100 hover:text-zinc-900 active:scale-90 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label={isMuted || volume === 0 ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-[18px] w-[18px] text-rose-500" />
                ) : (
                  <Volume2 className="h-[18px] w-[18px]" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="h-1 w-16 cursor-pointer appearance-none rounded-full bg-zinc-200 accent-pink-600 xl:w-20 dark:bg-white/10"
                aria-label="Volume"
              />
            </div>

            {/* Buy */}
            <button
              onClick={() => onBuyClick(currentTrack)}
              className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-pink-600 px-3.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-pink-500 sm:text-sm"
            >
              <Send className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t('buy_now')}</span>
              <span className="font-mono tabular-nums">
                {currencySymbol}{priceText}
              </span>
            </button>

            {/* Divider */}
            <span className="mx-0.5 hidden h-5 w-px bg-zinc-200 sm:block dark:bg-white/10" />

            {/* Cancel / close player */}
            <button
              onClick={handleClosePlayer}
              className={`${ghostIconBtn} group`}
              title={lang === 'kh' ? 'បិទអ្នកចាក់បទ (Cancel)' : 'Close player (Cancel)'}
              aria-label={lang === 'kh' ? 'បិទអ្នកចាក់បទ' : 'Close player'}
            >
              <X className="h-[18px] w-[18px] text-zinc-400 transition-colors group-hover:text-rose-500 dark:text-zinc-500 dark:group-hover:text-rose-400" />
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Expanded Now Playing sheet */}
    {expanded && (
      <NowPlayingPanel
        onClose={() => setExpanded(false)}
        onBuyClick={onBuyClick}
        currencySymbol={currencySymbol}
      />
    )}
  </>
);
};

/* ---------------------------------------------------------------------------
 * Expanded "Now Playing" sheet
 * ------------------------------------------------------------------------- */
function NowPlayingPanel({ onClose, onBuyClick, currencySymbol = "$" }) {
  const { lang, t } = useLanguage();
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackRate,
    loopMode,
    isShuffle,
    queue,
    playTrack,
    seek,
    skip,
    playNext,
    playPrevious,
    playIndex,
    setVolume,
    cyclePlaybackRate,
    toggleMute,
    toggleShuffle,
    cycleLoopMode,
    closePlayer
  } = usePlayer();

  if (!currentTrack) return null;

  const handleClosePlayer = () => {
    onClose();
    closePlayer();
  };

  const title = lang === 'kh' ? (currentTrack.title_kh || currentTrack.title_en) : currentTrack.title_en;
  const artist = lang === 'kh' ? (currentTrack.artist_kh || currentTrack.artist_en) : currentTrack.artist_en;
  const localTitle = (tr) => (lang === 'kh' ? (tr.title_kh || tr.title_en) : (tr.title_en || tr.title_kh));
  const localArtist = (tr) => (lang === 'kh' ? (tr.artist_kh || tr.artist_en) : (tr.artist_en || tr.artist_kh));

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

  const price = (currentTrack.sale_price ?? currentTrack.price) || 0;
  const priceText = Number.isFinite(price) ? price.toFixed(2) : '0.00';

  const ghost =
    'inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-zinc-500 transition-[color,background-color,transform] hover:bg-zinc-100 hover:text-zinc-900 active:scale-90 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white';
  const modeOn = 'bg-pink-600/10 text-pink-600 dark:bg-pink-400/10 dark:text-pink-400';
  const modeOff =
    'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white';

  return (
    <div className="pointer-events-auto fixed inset-0 z-[55] flex items-end justify-center sm:items-center sm:p-4">
      {/* Backdrop */}
      <div
        className="animate-backdrop absolute inset-0 bg-zinc-950/60 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-sheet-up relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border border-zinc-200 bg-white shadow-2xl sm:max-w-xl sm:rounded-3xl dark:border-white/10 dark:bg-zinc-900"
      >
        {/* Grab handle (mobile) */}
        <div className="flex shrink-0 justify-center pt-3">
          <span className="h-1 w-10 rounded-full bg-zinc-200 dark:bg-white/10" />
        </div>

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between px-5 pb-2 pt-3 sm:px-7">
          <p className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.18em] text-pink-600 dark:text-pink-400">
            <span className="eq-bar inline-block h-2 w-0.5 rounded-full bg-pink-500" style={{ animationDelay: '0ms' }} />
            <span className="eq-bar inline-block h-2 w-0.5 rounded-full bg-pink-500" style={{ animationDelay: '200ms' }} />
            <span className="eq-bar inline-block h-2 w-0.5 rounded-full bg-pink-500" style={{ animationDelay: '400ms' }} />
            <span className="ml-1">{t('now_playing')}</span>
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={onClose}
              className={ghost}
              title={lang === 'kh' ? 'បត់បិត (Collapse)' : 'Collapse'}
              aria-label={lang === 'kh' ? 'បត់បិត' : 'Collapse'}
            >
              <ChevronDown className="h-5 w-5" />
            </button>
            <button
              onClick={handleClosePlayer}
              className={`${ghost} group`}
              title={lang === 'kh' ? 'បិទអ្នកចាក់បទ (Cancel)' : 'Close player (Cancel)'}
              aria-label={lang === 'kh' ? 'បិទអ្នកចាក់បទ' : 'Close player'}
            >
              <X className="h-[18px] w-[18px] text-zinc-400 transition-colors group-hover:text-rose-500 dark:text-zinc-500 dark:group-hover:text-rose-400" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-8 pt-2 sm:px-7">
        {/* P1_BODY_INSERT */}
          {/* Cover artwork */}
          <div className="relative mx-auto aspect-square w-full max-w-[230px] overflow-hidden rounded-2xl bg-zinc-100 shadow-xl shadow-zinc-950/10 ring-1 ring-zinc-200 sm:max-w-[250px] dark:bg-zinc-950 dark:ring-white/10">
            {currentTrack.cover_image_url ? (
              <img
                src={currentTrack.cover_image_url}
                alt={title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-pink-600/20 via-purple-600/10 to-zinc-100 dark:from-pink-600/25 dark:via-purple-600/15 dark:to-zinc-950">
                <Volume2 className="h-16 w-16 text-pink-600/60 dark:text-pink-400/60" />
              </div>
            )}
            {isPlaying && (
              <div className="absolute bottom-3 right-3 flex items-end gap-1 rounded-lg bg-zinc-950/60 px-2 py-2 backdrop-blur-sm" aria-hidden="true">
                <span className="eq-bar h-4 w-1 rounded-full bg-pink-400" style={{ animationDelay: '0ms' }} />
                <span className="eq-bar h-4 w-1 rounded-full bg-pink-300" style={{ animationDelay: '180ms' }} />
                <span className="eq-bar h-4 w-1 rounded-full bg-pink-200" style={{ animationDelay: '360ms' }} />
              </div>
            )}
          </div>

          {/* Track meta */}
          <div className="mt-5 text-center">
            <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 sm:text-2xl dark:text-white">{title}</h2>
            <p className="mt-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">{artist}</p>
            <button
              onClick={() => onBuyClick(currentTrack)}
              className="mt-3 inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-pink-600/25 bg-pink-600/[0.06] px-3.5 text-xs font-semibold text-pink-700 transition-colors hover:bg-pink-600/10 dark:border-pink-400/25 dark:bg-pink-400/10 dark:text-pink-300"
            >
              <Send className="h-3.5 w-3.5" />
              {t('buy_now')} · {currencySymbol}{priceText}
            </button>
          </div>

          {/* Large scrubber */}
          <div className="mt-6">
            <div onClick={handleSeek} className="group flex h-5 cursor-pointer items-center">
              <div className="relative h-1.5 w-full rounded-full bg-zinc-200 transition-colors group-hover:bg-zinc-300 dark:bg-white/10 dark:group-hover:bg-white/20">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-pink-600 dark:bg-pink-500"
                  style={{ width: `${progressPct}%` }}
                >
                  <span
                    className="absolute top-1/2 h-3.5 w-3.5 rounded-full bg-white opacity-90 shadow ring-1 ring-black/10 transition-transform group-hover:scale-125 dark:ring-white/20"
                    style={{ left: '100%', transform: 'translate(-50%, -50%)' }}
                  />
                </div>
              </div>
            </div>
            <div className="mt-1 flex items-center justify-between font-mono text-[10px] tabular-nums text-zinc-400 dark:text-zinc-500">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Transport */}
          <div className="mt-4 flex items-center justify-center gap-2 sm:gap-3">
            <button
              onClick={playPrevious}
              disabled={queue.length <= 1}
              className={`${ghost} h-10 w-10 disabled:pointer-events-none disabled:opacity-40`}
              title={lang === 'kh' ? 'បទមុន' : 'Previous track'}
              aria-label={lang === 'kh' ? 'បទមុន' : 'Previous track'}
            >
              <SkipBack className="h-5 w-5 fill-current" />
            </button>

            <button
              onClick={() => skip(-10)}
              className={`${ghost} h-10 w-10 sm:h-11 sm:w-11`}
              title={lang === 'kh' ? 'ថយក្រោយ 10 វិនាទី' : 'Back 10 seconds'}
              aria-label={lang === 'kh' ? 'ថយក្រោយ 10 វិនាទី' : 'Back 10 seconds'}
            >
              <RotateCcw className="h-5 w-5" />
            </button>

            <button
              onClick={() => playTrack(currentTrack)}
              className="flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center rounded-full bg-zinc-900 text-white shadow-lg shadow-zinc-900/20 transition-transform hover:scale-105 active:scale-95 sm:h-16 sm:w-16 dark:bg-white dark:text-zinc-950 dark:shadow-white/10"
              title={isPlaying ? t('pause') : t('play_preview')}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6 fill-current" />
              ) : (
                <Play className="ml-0.5 h-6 w-6 fill-current" />
              )}
            </button>

            <button
              onClick={() => skip(10)}
              className={`${ghost} h-10 w-10 sm:h-11 sm:w-11`}
              title={lang === 'kh' ? 'ទៅមុខ 10 វិនាទី' : 'Forward 10 seconds'}
              aria-label={lang === 'kh' ? 'ទៅមុខ 10 វិនាទី' : 'Forward 10 seconds'}
            >
              <RotateCw className="h-5 w-5" />
            </button>

            <button
              onClick={playNext}
              disabled={queue.length <= 1}
              className={`${ghost} h-10 w-10 disabled:pointer-events-none disabled:opacity-40`}
              title={lang === 'kh' ? 'បទបន្ទាប់' : 'Next track'}
              aria-label={lang === 'kh' ? 'បទបន្ទាប់' : 'Next track'}
            >
              <SkipForward className="h-5 w-5 fill-current" />
            </button>
          </div>

        {/* P2_BODY_INSERT */}
          {/* Modes */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={toggleShuffle}
              aria-pressed={isShuffle}
              className={`inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-[color,background-color,transform] active:scale-95 ${isShuffle ? modeOn : modeOff}`}
              title={lang === 'kh' ? 'លាយបទចម្រៀង (Shuffle)' : isShuffle ? 'Disable shuffle' : 'Enable shuffle'}
            >
              <Shuffle className="h-4 w-4" />
              Shuffle
            </button>

            <button
              onClick={cycleLoopMode}
              aria-pressed={loopMode !== 'off'}
              className={`inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-[color,background-color,transform] active:scale-95 ${loopMode !== 'off' ? modeOn : modeOff}`}
              title={
                loopMode === 'one'
                  ? (lang === 'kh' ? 'ចាក់ម្ដងទៀតមួយបទ' : 'Repeat one')
                  : loopMode === 'all'
                  ? (lang === 'kh' ? 'ចាក់ឡើងវិញទាំងអស់' : 'Repeat all')
                  : (lang === 'kh' ? 'បិទ Repeat' : 'Repeat off')
              }
            >
              {loopMode === 'one' ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
              {loopMode === 'off' ? 'Off' : loopMode === 'all' ? 'All' : 'One'}
            </button>

            <button
              onClick={cyclePlaybackRate}
              className={`inline-flex h-9 cursor-pointer items-center rounded-full px-3 font-mono text-xs font-bold transition-[color,background-color,transform] active:scale-95 ${playbackRate !== 1 ? modeOn : modeOff}`}
              title={lang === 'kh' ? 'ល្បឿនចាក់បទ' : 'Playback speed'}
            >
              {playbackRate}x
            </button>
          </div>

          {/* Volume */}
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={toggleMute}
              className={ghost}
              aria-label={isMuted || volume === 0 ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-[18px] w-[18px] text-rose-500" />
              ) : (
                <Volume2 className="h-[18px] w-[18px]" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 accent-pink-600 dark:bg-white/10"
              aria-label="Volume"
            />
            <span className="w-9 shrink-0 text-right font-mono text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
              {Math.round((isMuted ? 0 : volume) * 100)}%
            </span>
          </div>

        {/* P3_BODY_INSERT */}
          {/* Up next / queue */}
          <div className="mt-7">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white">
                <ListMusic className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                {lang === 'kh' ? 'បន្ទាប់ទៀត (Up Next)' : 'Up Next'}
                {queue.length > 0 && (
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-zinc-500 dark:bg-white/10 dark:text-zinc-400">
                    {queue.length}
                  </span>
                )}
              </h3>
              {isShuffle && (
                <span className="rounded-full bg-pink-600/10 px-2 py-0.5 text-[10px] font-bold text-pink-600 dark:bg-pink-400/10 dark:text-pink-400">
                  Shuffle
                </span>
              )}
            </div>

            {queue.length > 0 ? (
              <div className="max-h-52 space-y-1 overflow-y-auto rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-1.5 dark:border-white/10 dark:bg-white/[0.03]">
                {queue.map((tr, i) => {
                  const isCurrent = currentTrack?.id === tr.id;
                  const trTitle = localTitle(tr);
                  const trArtist = localArtist(tr);
                  const trLen = tr.duration || '';

                  return (
                    <button
                      key={tr.id}
                      onClick={() => {
                        if (isCurrent) {
                          playTrack(currentTrack);
                        } else {
                          playIndex(i);
                        }
                      }}
                      className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors ${
                        isCurrent
                          ? 'bg-pink-600/10 dark:bg-pink-400/10'
                          : 'hover:bg-zinc-200/60 dark:hover:bg-white/5'
                      }`}
                    >
                      <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md bg-zinc-200 dark:bg-zinc-800">
                        {tr.cover_image_url ? (
                          <img src={tr.cover_image_url} alt={trTitle} className="h-full w-full object-cover" />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-zinc-400 dark:text-zinc-500">
                            <Volume2 className="h-4 w-4" />
                          </span>
                        )}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className={`block truncate text-xs font-semibold ${isCurrent ? 'text-pink-700 dark:text-pink-300' : 'text-zinc-800 dark:text-zinc-100'}`}>
                          {trTitle}
                        </span>
                        <span className="block truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                          {trArtist || 'KhmerBeats'}
                        </span>
                      </span>

                      <span className="shrink-0 font-mono text-[10px] text-zinc-400 dark:text-zinc-500">{trLen}</span>

                      {isCurrent && isPlaying && (
                        <span className="flex h-4 shrink-0 items-end gap-[2px]" aria-hidden="true">
                          <span className="eq-bar h-full w-[2px] rounded-full bg-pink-500" style={{ animationDelay: '0ms' }} />
                          <span className="eq-bar h-full w-[2px] rounded-full bg-pink-400" style={{ animationDelay: '200ms' }} />
                          <span className="eq-bar h-full w-[2px] rounded-full bg-pink-500" style={{ animationDelay: '400ms' }} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-zinc-200 py-6 text-center text-xs text-zinc-400 dark:border-white/10 dark:text-zinc-500">
                {lang === 'kh' ? 'មិនមានបទនៅក្នុងបញ្ជីទេ' : 'No tracks in the queue yet'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
