import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Sparkles, Zap, Tag, BadgePercent, Check, Copy } from 'lucide-react';

export const HeroBanner = ({ settings, onPromoSelect }) => {
  const { lang, t } = useLanguage();
  const [promos, setPromos] = useState([]);
  const [copiedCode, setCopiedCode] = useState(null);

  const fetchPromos = useCallback(async () => {
    try {
      const res = await fetch('/api/promos/public');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setPromos(data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch public promos:', err);
    }
  }, []);

  useEffect(() => {
    fetchPromos();

    // Listen to real-time updates from Admin CMS
    let channel;
    try {
      channel = new BroadcastChannel('khmer_beats_sync');
      channel.onmessage = (event) => {
        if (!event.data?.type || event.data?.type === 'PROMOS_UPDATED' || event.data?.type === 'SETTINGS_UPDATED') {
          fetchPromos();
        }
      };
    } catch (e) {}

    // Polling fallback every 4s for multi-device/tab real-time sync
    const interval = setInterval(fetchPromos, 4000);

    return () => {
      if (channel) channel.close();
      clearInterval(interval);
    };
  }, [fetchPromos]);

  const handlePromoClick = (code) => {
    if (onPromoSelect) {
      onPromoSelect(code);
    }
    // Copy to clipboard for convenience
    try {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2500);
    } catch (e) {}
  };

  const title = lang === 'kh'
    ? (settings?.banner_title_kh || t('hero_title'))
    : (settings?.banner_title_en || t('hero_title'));

  const subtitle = lang === 'kh'
    ? (settings?.banner_sub_kh || t('hero_subtitle'))
    : (settings?.banner_sub_en || t('hero_subtitle'));

  return (
    <div className="relative overflow-hidden pt-6 pb-10 sm:pt-10 sm:pb-14 transition-colors duration-200">
      {/* Subtle background glow meshes */}
      <div className="absolute top-0 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-pink-500/10 dark:bg-pink-600/15 rounded-full blur-3xl pointer-events-none -z-10 animate-glow" />
      <div className="absolute top-10 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-purple-500/10 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none -z-10 animate-glow" style={{ animationDelay: '2s' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-600 dark:text-pink-400 text-xs sm:text-sm font-semibold mb-4 sm:mb-6 shadow-sm shadow-pink-500/10">
          <Zap className="w-3.5 h-3.5 text-pink-500 dark:text-pink-400 animate-pulse" />
          <span>{t('hero_badge')}</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight max-w-4xl mx-auto px-2">
          {title}
        </h1>

        {/* Subtitle */}
        <p className="mt-3 sm:mt-4 text-xs sm:text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed px-2">
          {subtitle}
        </p>

        {/* Dynamic Promo Codes from Backend */}
        {promos.length > 0 && (
          <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <BadgePercent className="w-4 h-4 text-pink-500 dark:text-pink-400" />
              <span>{lang === 'kh' ? 'កូដបញ្ចុះតម្លៃពេញនិយម៖' : 'Hot Promo Codes:'}</span>
            </span>
            
            {promos.map((promo) => {
              const isCopied = copiedCode === promo.code;
              const discountText = promo.discount_type === 'percent'
                ? `-${promo.discount_value}% OFF`
                : `-$${promo.discount_value} OFF`;

              return (
                <button
                  key={promo.id || promo.code}
                  onClick={() => handlePromoClick(promo.code)}
                  className="group px-3 py-1.5 bg-white dark:bg-slate-900/90 hover:bg-pink-50/50 dark:hover:bg-slate-800 border border-pink-400/40 hover:border-pink-500 rounded-xl text-xs font-mono font-bold text-pink-600 dark:text-pink-300 transition-all flex items-center gap-2 shadow-sm hover:shadow-md cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                  title={lang === 'kh' ? `ចុចដើម្បីប្រើ ឬចម្លងកូដ ${promo.code}` : `Click to apply/copy code ${promo.code}`}
                >
                  <span className="tracking-wide">{promo.code}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-pink-500/15 dark:bg-pink-500/25 text-pink-700 dark:text-pink-300 font-sans font-extrabold">
                    {discountText}
                  </span>
                  {isCopied ? (
                    <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-sans font-semibold">
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span>{lang === 'kh' ? 'បានចម្លង!' : 'Copied!'}</span>
                    </span>
                  ) : (
                    <Copy className="w-3 h-3 text-slate-400 group-hover:text-pink-500 transition-colors opacity-0 group-hover:opacity-100" />
                  )}
                </button>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
