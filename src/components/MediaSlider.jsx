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
  Video,
  ImageIcon
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
  const { lang, t } = useLanguage();
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

    // Listen to real-time updates from Admin CMS
    let channel;
    try {
      channel = new BroadcastChannel('khmer_beats_sync');
      channel.onmessage = (e) => {
        if (!e.data?.type || e.data?.type === 'SLIDES_UPDATED' || e.data?.type === 'SETTINGS_UPDATED') {
          fetchSlides(true);
        }
      };
    } catch (e) {}

    // Polling fallback every 4s for real-time sync across tabs/devices
    const interval = setInterval(() => {
      fetchSlides(true);
    }, 4000);

    return () => {
      if (channel) channel.close();
      clearInterval(interval);
    };
  }, [fetchSlides]);

  // Robust Auto-advance timer (every 4.5 seconds when autoplay is active and not hovered)
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
      <div className="w-full h-72 sm:h-96 md:h-[420px] rounded-3xl bg-slate-200 dark:bg-slate-900/60 animate-pulse my-6 max-w-7xl mx-auto px-4 sm:px-6" />
    );
  }

  if (slides.length === 0) return null;

  const currentSlide = slides[currentIndex];
  const title = lang === 'kh' ? (currentSlide.title_kh || currentSlide.title_en) : (currentSlide.title_en || currentSlide.title_kh);
  const subtitle = lang === 'kh' ? (currentSlide.subtitle_kh || currentSlide.subtitle_en) : (currentSlide.subtitle_en || currentSlide.subtitle_kh);
  const badge = lang === 'kh' ? (currentSlide.badge_kh || currentSlide.badge_en) : (currentSlide.badge_en || currentSlide.badge_kh);
  const actionText = lang === 'kh' ? (currentSlide.link_text_kh || 'ស្វែងរកឥឡូវនេះ') : (currentSlide.link_text_en || 'Explore Now');

  return (
    <div 
      className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Outer Slider Wrapper with glowing border */}
      <div className="relative w-full h-[360px] sm:h-[420px] md:h-[480px] lg:h-[500px] rounded-3xl overflow-hidden bg-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-2xl group">
        
        {/* TOP PROGRESS BAR for Auto Slide */}
        {slides.length > 1 && isAutoPlay && (
          <div className="absolute top-0 left-0 right-0 z-30 h-1 bg-white/10 overflow-hidden">
            <div
              key={`progress-${currentIndex}-${isHovered}`}
              className={`h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all ${
                isHovered ? 'w-full opacity-60' : 'w-full animate-[progress_4.5s_linear]'
              }`}
              style={{
                animationDuration: '4.5s',
                animationTimingFunction: 'linear'
              }}
            />
          </div>
        )}

        {/* MEDIA RENDERER */}
        {slides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          const isYoutube = slide.media_type === 'youtube';
          const isVideo = slide.media_type === 'video';

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {isYoutube ? (
                <div className="w-full h-full relative overflow-hidden bg-slate-950">
                  <iframe
                    src={isActive ? getYouTubeEmbedUrl(slide.media_url) : ''}
                    title={slide.title_en}
                    className="w-full h-full object-cover scale-[1.05] border-0 pointer-events-auto"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  {/* Subtle Gradient overlay on YouTube so text stays ultra legible */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-slate-950/20 pointer-events-none" />
                </div>
              ) : isVideo ? (
                <div className="w-full h-full relative overflow-hidden bg-slate-950">
                  <video
                    ref={(el) => (videoRefs.current[slide.id] = el)}
                    src={slide.media_url}
                    poster={slide.thumbnail_url}
                    autoPlay
                    loop
                    muted={isVideoMuted}
                    playsInline
                    className="w-full h-full object-cover scale-[1.02] transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-slate-950/20 pointer-events-none" />
                </div>
              ) : (
                <div className="w-full h-full relative overflow-hidden bg-slate-950">
                  <img
                    src={slide.media_url}
                    alt={slide.title_en}
                    className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1600&auto=format&fit=crop&q=80";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-slate-950/20" />
                </div>
              )}
            </div>
          );
        })}

        {/* TOP CONTROLS BAR: Auto-play Toggle, Slide Counter, Video Mute Toggle */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center gap-2">
          {/* Auto Slide Toggle Button */}
          {slides.length > 1 && (
            <button
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-md border text-[11px] font-semibold transition-all cursor-pointer shadow-md ${
                isAutoPlay
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-slate-900/80 text-slate-300 border-slate-700/60 hover:bg-slate-900'
              }`}
              title={isAutoPlay ? (lang === 'kh' ? 'ផ្អាក Auto Slide' : 'Pause Auto Slide') : (lang === 'kh' ? 'ដំណើរការ Auto Slide' : 'Enable Auto Slide')}
            >
              {isAutoPlay ? (
                <>
                  <Pause className="w-3 h-3 text-emerald-400" />
                  <span className="hidden sm:inline">Auto</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 text-slate-300" />
                  <span className="hidden sm:inline">Auto</span>
                </>
              )}
            </button>
          )}

          {/* Direct Video Mute / Unmute Button */}
          {currentSlide?.media_type === 'video' && (
            <button
              onClick={() => setIsVideoMuted(!isVideoMuted)}
              className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md border border-slate-700/60 shadow-md transition-all cursor-pointer"
              title={isVideoMuted ? "Unmute video" : "Mute video"}
              aria-label="Toggle Video Sound"
            >
              {isVideoMuted ? <VolumeX className="w-4 h-4 text-slate-300" /> : <Volume2 className="w-4 h-4 text-pink-400" />}
            </button>
          )}

          {/* Slide Indicator Badge */}
          <div className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-white text-[11px] font-mono font-bold shadow-md">
            <span>0{currentIndex + 1}</span>
            <span className="text-slate-400 mx-1">/</span>
            <span className="text-slate-400">0{slides.length}</span>
          </div>
        </div>

        {/* SLIDE CONTENT OVERLAY */}
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 sm:p-8 md:p-12 max-w-3xl pointer-events-none">
          <div className="space-y-3 sm:space-y-4 pointer-events-auto">
            
            {/* Badge */}
            {badge && (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-pink-500/40 text-pink-400 text-xs font-bold shadow-lg">
                <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                <span>{badge}</span>
                {currentSlide.media_type === 'youtube' && (
                  <span className="ml-1 pl-1.5 border-l border-slate-700 text-[10px] text-red-400 flex items-center gap-1">
                    <Video className="w-3 h-3" />
                    <span>YouTube</span>
                  </span>
                )}
                {currentSlide.media_type === 'video' && (
                  <span className="ml-1 pl-1.5 border-l border-slate-700 text-[10px] text-purple-400 flex items-center gap-1">
                    <Film className="w-3 h-3" />
                    <span>Video</span>
                  </span>
                )}
              </div>
            )}

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
              {title}
            </h1>

            {/* Subtitle */}
            {subtitle && (
              <p className="text-xs sm:text-sm md:text-base text-slate-200/90 leading-relaxed max-w-2xl font-medium drop-shadow">
                {subtitle}
              </p>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {currentSlide.link_url && (
                <button
                  onClick={() => handleActionClick(currentSlide.link_url)}
                  className="group inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-pink-600/30 transition-all duration-200 transform hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
                >
                  <span>{actionText}</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              {/* View All Music Shortcut */}
              <button
                onClick={() => handleActionClick('#/products')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
              >
                <span>{lang === 'kh' ? 'មើលបទចម្រៀងទាំងអស់' : 'Browse Catalog'}</span>
              </button>
            </div>

          </div>
        </div>

        {/* PREVIOUS / NEXT ARROW BUTTONS */}
        {slides.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white backdrop-blur-md border border-slate-700/50 shadow-lg opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer transform hover:scale-110"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white backdrop-blur-md border border-slate-700/50 shadow-lg opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer transform hover:scale-110"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* BOTTOM DOT INDICATORS WITH ACTIVE HIGHLIGHT */}
        {slides.length > 1 && (
          <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-20 flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentIndex
                    ? 'w-8 bg-gradient-to-r from-pink-500 to-purple-500 shadow-sm'
                    : 'w-2 bg-white/40 hover:bg-white/70'
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
