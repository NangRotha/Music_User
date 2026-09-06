import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Bell,
  Calendar,
  Clock,
  Sparkles,
  X,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ImageIcon
} from 'lucide-react';

export const AlertPopupModal = ({ currentPage = 'home' }) => {
  const { lang } = useLanguage();
  const [activeAlert, setActiveAlert] = useState(null);
  const [isVisible, setIsVisible] = useState(false); // Controls DOM rendering
  const [isAnimated, setIsAnimated] = useState(false); // Controls CSS transition states
  
  // Track on which page the user dismissed the alert so it doesn't repeatedly pop up
  const [dismissedPage, setDismissedPage] = useState(null);
  const dismissedPageRef = useRef(null);

  const fetchActiveAlerts = async (forceShow = false) => {
    try {
      const res = await fetch('/api/alerts');
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const alert = data[0]; // Get current active unexpired alert
        setActiveAlert(alert);

        // Only show if user hasn't dismissed it on this current page (or forceShow is requested)
        if (forceShow || dismissedPageRef.current !== currentPage) {
          setIsVisible(true);
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setIsAnimated(true);
            });
          });
        }
      } else {
        handleCloseInstant();
      }
    } catch (err) {
      console.error('Failed to fetch active alerts:', err);
    }
  };

  // Trigger popup presentation whenever page refreshes or when user changes page!
  useEffect(() => {
    // Reset dismissed state for the new page
    setDismissedPage(null);
    dismissedPageRef.current = null;

    // Small delay for ultra-smooth entrance transition after page load/switch
    const timer = setTimeout(() => {
      fetchActiveAlerts(true);
    }, 450);

    return () => clearTimeout(timer);
  }, [currentPage]);

  // Real-time broadcast sync with Admin CMS (updates data silently without forcing modal to reopen if user closed it)
  useEffect(() => {
    let channel;
    try {
      channel = new BroadcastChannel('khmer_beats_sync');
      channel.onmessage = (e) => {
        if (!e.data?.type || e.data?.type === 'ALERTS_UPDATED' || e.data?.type === 'SETTINGS_UPDATED') {
          fetchActiveAlerts(false);
        }
      };
    } catch (e) {}

    return () => {
      if (channel) channel.close();
    };
  }, [currentPage]);

  const handleCloseInstant = () => {
    setIsAnimated(false);
    setIsVisible(false);
    setActiveAlert(null);
  };

  // Smooth exit transition before unmounting
  const handleClose = () => {
    setIsAnimated(false);
    // Remember that user closed the alert on this current page so it stays closed until next page change or refresh
    setDismissedPage(currentPage);
    dismissedPageRef.current = currentPage;

    // Wait for CSS transition to complete before removing from DOM
    setTimeout(() => {
      setIsVisible(false);
    }, 280);
  };

  const handleActionClick = () => {
    handleClose();
    if (!activeAlert?.link_url) return;

    if (activeAlert.link_url.startsWith('#')) {
      const targetElement = document.querySelector(activeAlert.link_url);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.open(activeAlert.link_url, '_blank');
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isVisible) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, currentPage]);

  if (!isVisible || !activeAlert) return null;

  const title = lang === 'kh' ? (activeAlert.title_kh || activeAlert.title_en) : (activeAlert.title_en || activeAlert.title_kh);
  const message = lang === 'kh' ? (activeAlert.message_kh || activeAlert.message_en) : (activeAlert.message_en || activeAlert.message_kh);
  const badge = lang === 'kh' ? (activeAlert.badge_kh || activeAlert.badge_en) : (activeAlert.badge_en || activeAlert.badge_kh);
  const actionText = lang === 'kh' ? (activeAlert.link_text_kh || 'ស្វែងយល់បន្ថែម') : (activeAlert.link_text_en || 'Learn More');

  const formattedStartDate = activeAlert.start_date
    ? new Date(activeAlert.start_date).toLocaleDateString(lang === 'kh' ? 'km-KH' : 'en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : null;

  const formattedEndDate = activeAlert.end_date
    ? new Date(activeAlert.end_date).toLocaleDateString(lang === 'kh' ? 'km-KH' : 'en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ease-out ${
        isAnimated 
          ? 'bg-slate-950/70 backdrop-blur-md opacity-100' 
          : 'bg-slate-950/0 backdrop-blur-none opacity-0 pointer-events-none'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-dialog-title"
    >
      {/* Modal Container */}
      <div 
        className={`relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl shadow-pink-500/10 overflow-hidden transform transition-all duration-300 ease-out ${
          isAnimated 
            ? 'scale-100 translate-y-0 opacity-100' 
            : 'scale-95 translate-y-4 opacity-0 pointer-events-none'
        }`}
      >
        {/* Glowing Gradient Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />

        {/* IMAGE BANNER (If image_url is provided) */}
        {activeAlert.image_url ? (
          <div className="relative w-full h-44 sm:h-52 overflow-hidden bg-slate-950">
            <img
              src={activeAlert.image_url}
              alt={title}
              className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            {/* Subtle Gradient overlay for contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
            
            {/* Badge on Image */}
            {badge && (
              <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-pink-500/40 text-pink-400 text-xs font-bold shadow-lg">
                <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                <span>{badge}</span>
              </div>
            )}

            {/* Close Button on Image Banner */}
            <button
              onClick={handleClose}
              className="absolute top-3.5 right-3.5 p-2 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white backdrop-blur-md border border-white/20 transition-all duration-150 cursor-pointer shadow-lg hover:scale-110 active:scale-95"
              aria-label="Close alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Header when no image banner */
          <div className="p-6 pb-0 flex items-start justify-between gap-4">
            {badge ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 dark:bg-pink-500/20 border border-pink-500/30 text-pink-600 dark:text-pink-400 text-xs font-bold shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-pink-500 dark:text-pink-400 shrink-0" />
                <span>{badge}</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 text-xs font-semibold">
                <Bell className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span>{lang === 'kh' ? 'ដំណឹងពិសេស' : 'Announcement'}</span>
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close alert"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 sm:p-7 space-y-4">
          <div className="space-y-2">
            <h3 
              id="alert-dialog-title"
              className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-snug"
            >
              {title}
            </h3>
            
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal whitespace-pre-line">
              {message}
            </p>
          </div>

          {/* Dates & Validity Section */}
          {(formattedStartDate || formattedEndDate) && (
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              {formattedStartDate && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
                  <Calendar className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                  <span>
                    <strong className="font-semibold text-slate-700 dark:text-slate-200">{lang === 'kh' ? 'ចាប់ផ្ដើម៖ ' : 'Starts: '}</strong>
                    {formattedStartDate}
                  </span>
                </div>
              )}
              {formattedEndDate && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-50 dark:bg-pink-950/40 border border-pink-200/80 dark:border-pink-800/60 text-pink-700 dark:text-pink-300 font-medium">
                  <Clock className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400 shrink-0" />
                  <span>
                    <strong className="font-semibold">{lang === 'kh' ? 'ផុតកំណត់៖ ' : 'Expires: '}</strong>
                    {formattedEndDate}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Actions Bar */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800/80">
            <button
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {lang === 'kh' ? 'បិទ' : 'Dismiss'}
            </button>

            {activeAlert.link_url && (
              <button
                onClick={handleActionClick}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-pink-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <span>{actionText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
