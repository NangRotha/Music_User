import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Sparkles, BadgePercent, Check, Copy } from 'lucide-react';

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

    let channel;
    try {
      channel = new BroadcastChannel('khmer_beats_sync');
      channel.onmessage = (event) => {
        if (!event.data?.type || event.data?.type === 'PROMOS_UPDATED' || event.data?.type === 'SETTINGS_UPDATED') {
          fetchPromos();
        }
      };
    } catch (e) {}

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
    <section className="relative overflow-hidden py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        {/* Eyebrow */}
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-pink-600/15 bg-pink-600/[0.06] px-3.5 py-1.5 text-xs font-semibold text-pink-700 dark:border-pink-400/20 dark:bg-pink-400/10 dark:text-pink-300">
          <Sparkles className="h-3.5 w-3.5 text-pink-600 dark:text-pink-400" />
          <span>{t('hero_badge')}</span>
        </div>

        {/* Title */}
        <h1 className="mx-auto max-w-4xl text-balance text-3xl font-extrabold leading-tight tracking-tight text-zinc-900 sm:text-4xl md:text-5xl dark:text-white">
          {title}
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-zinc-500 sm:text-base dark:text-zinc-400">
          {subtitle}
        </p>

        {/* Promo code chips */}
        {promos.length > 0 && (
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              <BadgePercent className="h-4 w-4 text-pink-600 dark:text-pink-400" />
              {lang === 'kh' ? 'កូដបញ្ចុះតម្លៃ៖' : 'Hot promo codes:'}
            </span>

            {promos.map((promo) => {
              const isCopied = copiedCode === promo.code;
              const discountText = promo.discount_type === 'percent'
                ? `${promo.discount_value}% OFF`
                : `$${promo.discount_value} OFF`;

              return (
                <button
                  key={promo.id || promo.code}
                  onClick={() => handlePromoClick(promo.code)}
                  className="group flex items-center gap-2 rounded-full border border-zinc-200 bg-white py-1.5 pl-3.5 pr-2 text-xs font-semibold text-zinc-700 shadow-sm transition-all hover:border-pink-500/40 hover:text-pink-600 cursor-pointer dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:border-pink-400/40 dark:hover:text-pink-300"
                  title={lang === 'kh' ? `ចុចដើម្បីប្រើ ឬចម្លងកូដ ${promo.code}` : `Click to apply/copy code ${promo.code}`}
                >
                  <span className="font-mono font-bold tracking-wide">{promo.code}</span>
                  <span className="rounded-full bg-pink-600/10 px-2 py-0.5 text-[10px] font-bold text-pink-600 dark:bg-pink-400/10 dark:text-pink-300">
                    {discountText}
                  </span>
                  {isCopied ? (
                    <span className="flex items-center gap-0.5 pl-0.5 text-emerald-600 dark:text-emerald-400">
                      <Check className="h-3.5 w-3.5" />
                      {lang === 'kh' ? 'បានចម្លង' : 'Copied'}
                    </span>
                  ) : (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 transition-colors group-hover:bg-pink-600/10 group-hover:text-pink-600 dark:bg-white/10 dark:group-hover:text-pink-300">
                      <Copy className="h-3 w-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
