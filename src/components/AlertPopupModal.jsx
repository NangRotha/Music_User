import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Bell,
  Calendar,
  Clock,
  Sparkles,
  X,
  ArrowRight
} from 'lucide-react';

export const AlertPopupModal = ({ currentPage = 'home' }) => {
  const { lang } = useLanguage();
  const [activeAlert, setActiveAlert] = useState(null);
  const [isVisible, setIsVisible] = useState(false); // Controls DOM rendering
  const [isAnimated, setIsAnimated] = useState(false); // Controls CSS transition states

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

  // Show popup when page refreshes or changes
  useEffect(() => {
    setDismissedPage(null);
    dismissedPageRef.current = null;

    const timer = setTimeout(() => {
      fetchActiveAlerts(true);
    }, 450);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Cross-tab real-time sync (updates silently, does not reopen closed alert)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleCloseInstant = () => {
    setIsAnimated(false);
    setIsVisible(false);
    setActiveAlert(null);
  };

  // Smooth exit transition before unmounting
  const handleClose = () => {
    setIsAnimated(false);
    setDismissedPage(currentPage);
    dismissedPageRef.current = currentPage;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      className={`fixed inset-0 z-[60] flex items-center justify-center p-4 transition-all duration-300 ease-out sm:p-6 ${
        isAnimated
          ? 'bg-zinc-950/60 opacity-100 backdrop-blur-sm'
          : 'pointer-events-none bg-transparent opacity-0'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-dialog-title"
    >
      {/* Modal container */}
      <div
        className={`relative w-full max-w-lg transform overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl transition-all duration-300 ease-out dark:border-white/10 dark:bg-zinc-900 ${
          isAnimated
            ? 'translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none translate-y-4 scale-95 opacity-0'
        }`}
      >
        {/* Accent line */}
        <div className="h-1 w-full bg-pink-600 dark:bg-pink-500" />

        {/* Image banner (if provided) */}
        {activeAlert.image_url ? (
          <div className="relative h-44 w-full overflow-hidden bg-zinc-100 sm:h-52 dark:bg-zinc-950">
            <img
              src={activeAlert.image_url}
              alt={title}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent" />

            {badge && (
              <div className="absolute bottom-3 left-4 inline-flex items-center gap-1.5 rounded-full bg-zinc-950/70 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/15 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-pink-400" />
                <span>{badge}</span>
              </div>
            )}

            <button
              onClick={handleClose}
              className="absolute right-3 top-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-zinc-950/60 text-white ring-1 ring-white/20 transition-colors hover:bg-zinc-950"
              aria-label="Close alert"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          /* Header when no image */
          <div className="flex items-start justify-between gap-4 px-6 pt-6">
            {badge ? (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-pink-600/15 bg-pink-600/[0.06] px-3 py-1 text-xs font-semibold text-pink-700 dark:border-pink-400/20 dark:bg-pink-400/10 dark:text-pink-300">
                <Sparkles className="h-3.5 w-3.5 text-pink-600 dark:text-pink-400" />
                <span>{badge}</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-600/15 bg-purple-600/[0.06] px-3 py-1 text-xs font-semibold text-purple-700 dark:border-purple-400/20 dark:bg-purple-400/10 dark:text-purple-300">
                <Bell className="h-3.5 w-3.5" />
                <span>{lang === 'kh' ? 'ដំណឹងពិសេស' : 'Announcement'}</span>
              </div>
            )}

            <button
              onClick={handleClose}
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Close alert"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Content body */}
        <div className="space-y-4 px-6 pb-6 pt-5 sm:px-7 sm:pb-7">
          <div className="space-y-2.5">
            <h3
              id="alert-dialog-title"
              className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl dark:text-white"
            >
              {title}
            </h3>

            <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              {message}
            </p>
          </div>

          {(formattedStartDate || formattedEndDate) && (
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              {formattedStartDate && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
                  <Calendar className="h-3.5 w-3.5 text-pink-600 dark:text-pink-400" />
                  <strong className="font-semibold">{lang === 'kh' ? 'ចាប់ផ្ដើម' : 'Starts'}:</strong>
                  <span>{formattedStartDate}</span>
                </span>
              )}
              {formattedEndDate && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-pink-600/20 bg-pink-600/[0.05] px-2.5 py-1.5 font-medium text-pink-700 dark:border-pink-400/20 dark:bg-pink-400/10 dark:text-pink-300">
                  <Clock className="h-3.5 w-3.5 text-pink-600 dark:text-pink-400" />
                  <strong className="font-semibold">{lang === 'kh' ? 'ផុតកំណត់' : 'Expires'}:</strong>
                  <span>{formattedEndDate}</span>
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 border-t border-zinc-100 pt-4 dark:border-white/10">
            <button
              onClick={handleClose}
              className="inline-flex h-10 cursor-pointer items-center rounded-lg px-4 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
            >
              {lang === 'kh' ? 'បិទ' : 'Dismiss'}
            </button>

            {activeAlert.link_url && (
              <button
                onClick={handleActionClick}
                className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-pink-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-pink-500"
              >
                <span>{actionText}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
