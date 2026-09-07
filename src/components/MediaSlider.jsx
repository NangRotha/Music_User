import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ArrowRight,
  Film,
  Video
} from 'lucide-react';

// YouTube embed URL parser
export const getYouTubeEmbedUrl = (url) => {
  if (!url) return '';
  if (url.includes('youtube.com/embed/')) return url;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}?autoplay=1&mute=1&loop=1&playlist=${match[2]}&enablejsapi=1`;
  }
  return url;
};

export const MediaSlider = ({ onNavigate }) => {
  const { lang } = useLanguage();
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const videoRefs = useRef({});

  const fetchSlides = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/slides');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setSlides(data);
        }
      }
    } catch (err) {
      console.error('Failed to load slides:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlides();

    let channel;
    try {
      channel = new BroadcastChannel('khmer_beats_sync');
      channel.onmessage = (e) => {
        if (!e.data?.type || e.data?.type === 'SLIDES_UPDATED' || e.data?.type === 'SETTINGS_UPDATED') {
          fetchSlides(true);
        }
      };
    } catch (e) {}

    const interval = setInterval(() => {
      fetchSlides(true);
    }, 4000);

    return () => {
      if (channel) channel.close();
      clearInterval(interval);
    };
  }, [fetchSlides]);

  useEffect(() => {
    if (slides.length <= 1 || !isAutoPlay || isHovered) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [slides.length, isAutoPlay, isHovered, currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handleActionClick = (linkUrl) => {
    if (!linkUrl) return;
    if (linkUrl.startsWith('#/')) {
      const page = linkUrl.replace('#/', '');
      if (onNavigate) {
        onNavigate(page || 'home');
      } else {
        window.location.hash = linkUrl;
      }
    } else if (linkUrl.startsWith('http')) {
      window.open(linkUrl, '_blank');
    } else if (onNavigate) {
      onNavigate(linkUrl);
    }
  };

  if (loading && slides.length === 0) {
    return (
      <div className="mx-auto my-2 h-72 w-full max-w-7xl animate-pulse rounded-2xl bg-zinc-200 px-4 sm:h-96 sm:px-6 lg:px-8 dark:bg-white/[0.06]" />
    );
  }

  if (slides.length === 0) return null;

  const glassBtn =
    'inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/25 cursor-pointer';

  const currentSlide = slides[currentIndex];
  const title = lang === 'kh' ? (currentSlide.title_kh || currentSlide.title_en) : (currentSlide.title_en || currentSlide.title_kh);
  const subtitle = lang === 'kh' ? (currentSlide.subtitle_kh || currentSlide.subtitle_en) : (currentSlide.subtitle_en || currentSlide.subtitle_kh);
  const badge = lang === 'kh' ? (currentSlide.badge_kh || currentSlide.badge_en) : (currentSlide.badge_en || currentSlide.badge_kh);
  const actionText = lang === 'kh' ? (currentSlide.link_text_kh || 'ស្វែងរកឥឡូវនេះ') : (currentSlide.link_text_en || 'Explore Now');

  return (
    <div
      className="relative mx-auto w-full max-w-7xl px-4 pt-2 sm:px-6 lg:px-8"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="group relative h-[340px] w-full overflow-hidden rounded-2xl bg-zinc-950 shadow-sm ring-1 ring-zinc-200 sm:h-[420px] md:h-[480px] lg:h-[500px] dark:ring-white/10">
        {/* Autoplay progress line */}
        {slides.length > 1 && isAutoPlay && (
          <div className="absolute inset-x-0 top-0 z-30 h-0.5 bg-white/10">
            <div
              key={`progress-${currentIndex}-${isHovered}`}
              className={`h-full bg-pink-500 transition-all ${
                isHovered ? 'w-full opacity-40' : 'w-full animate-[slideProgress_4.5s_linear]'
              }`}
            />
          </div>
        )}

        {/* Slides */}
        {slides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          const isYoutube = slide.media_type === 'youtube';
          const isVideo = slide.media_type === 'video';

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'z-10 opacity-100' : 'pointer-events-none z-0 opacity-0'
              }`}
            >
              {isYoutube ? (
                <div className="relative h-full w-full overflow-hidden bg-zinc-950">
                  <iframe
                    src={isActive ? getYouTubeEmbedUrl(slide.media_url) : ''}
                    title={slide.title_en}
                    className="h-full w-full scale-[1.02] border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950/95 via-zinc-950/20 to-zinc-950/40" />
                </div>
              ) : isVideo ? (
                <div className="relative h-full w-full overflow-hidden bg-zinc-950">
                  <video
                    ref={(el) => (videoRefs.current[slide.id] = el)}
                    src={slide.media_url}
                    poster={slide.thumbnail_url}
                    autoPlay
                    loop
                    muted={isVideoMuted}
                    playsInline
                    className="h-full w-full scale-[1.02] object-cover transition-transform duration-1000"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950/95 via-zinc-950/20 to-zinc-950/40" />
                </div>
              ) : (
                <div className="relative h-full w-full overflow-hidden bg-zinc-900">
                  <img
                    src={slide.media_url}
                    alt={slide.title_en}
                    className="h-full w-full scale-100 object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1600&auto=format&fit=crop&q=80";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/95 via-zinc-950/25 to-zinc-950/30" />
                </div>
              )}
            </div>
          );
        })}

        {/* Top controls */}
        <div className="absolute right-4 top-4 z-20 flex items-center gap-2 sm:right-5 sm:top-5">
          {slides.length > 1 && (
            <button
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className={`${glassBtn} h-9 gap-1.5 px-3 text-xs font-semibold`}
              title={isAutoPlay ? (lang === 'kh' ? 'ផ្អាក Auto Slide' : 'Pause Auto Slide') : (lang === 'kh' ? 'ដំណើរការ Auto Slide' : 'Enable Auto Slide')}
            >
              {isAutoPlay ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">Auto</span>
            </button>
          )}

          <div className="flex h-9 items-center rounded-full border border-white/20 bg-white/10 px-3 font-mono text-[11px] font-semibold text-white backdrop-blur-md">
            <span>0{currentIndex + 1}</span>
            <span className="mx-1 text-zinc-400">/</span>
            <span className="text-zinc-400">0{slides.length}</span>
          </div>

          {currentSlide?.media_type === 'video' && (
            <button
              onClick={() => setIsVideoMuted(!isVideoMuted)}
              className={`${glassBtn} h-9 w-9`}
              title={isVideoMuted ? 'Unmute video' : 'Mute video'}
              aria-label="Toggle video sound"
            >
              {isVideoMuted ? <VolumeX className="h-4 w-4 text-zinc-300" /> : <Volume2 className="h-4 w-4 text-pink-400" />}
            </button>
          )}
        </div>

        {/* Bottom overlay content */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col justify-end p-6 sm:p-10">
          <div className="pointer-events-auto max-w-2xl space-y-3 sm:space-y-4">
            {badge && (
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 py-1 pl-3 pr-3 text-xs font-semibold text-white backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-pink-400" />
                <span>{badge}</span>
                {currentSlide.media_type === 'youtube' && (
                  <span className="inline-flex items-center gap-1 border-l border-white/20 pl-2 text-[10px] font-medium text-red-300">
                    <Video className="h-3 w-3" />
                    YouTube
                  </span>
                )}
                {currentSlide.media_type === 'video' && (
                  <span className="inline-flex items-center gap-1 border-l border-white/20 pl-2 text-[10px] font-medium text-purple-300">
                    <Film className="h-3 w-3" />
                    Video
                  </span>
                )}
              </div>
            )}

            <h1 className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              {title}
            </h1>

            {subtitle && (
              <p className="max-w-xl text-sm font-medium leading-relaxed text-zinc-200 sm:text-base">
                {subtitle}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-1">
              {currentSlide.link_url && (
                <button
                  onClick={() => handleActionClick(currentSlide.link_url)}
                  className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-200"
                >
                  <span>{actionText}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => handleActionClick('#/products')}
                className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20"
              >
                {lang === 'kh' ? 'មើលបទចម្រៀងទាំងអស់' : 'Browse Catalog'}
              </button>
            </div>
          </div>
        </div>

        {/* Arrow buttons */}
        {slides.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className={`${glassBtn} absolute left-5 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100 sm:inline-flex`}
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              className={`${glassBtn} absolute right-5 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100 sm:inline-flex`}
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {slides.length > 1 && (
          <div className="absolute bottom-5 right-6 z-20 flex items-center gap-1.5 sm:right-8">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 cursor-pointer rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
