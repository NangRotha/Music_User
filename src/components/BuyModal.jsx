import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { X, Tag, Send, CheckCircle2, AlertCircle, ShieldCheck, Music } from 'lucide-react';

export const BuyModal = ({ track, isOpen, onClose, currencySymbol = "$", initialPromo = "" }) => {
  const { lang, t } = useLanguage();

  const [promoCode, setPromoCode] = useState(initialPromo);
  const [promoLoading, setPromoLoading] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerTelegram, setCustomerTelegram] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Close with Escape + lock body scroll
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !track) return null;

  const title = lang === 'kh' ? (track.title_kh || track.title_en) : track.title_en;
  const artist = lang === 'kh' ? (track.artist_kh || track.artist_en) : track.artist_en;

  const originalPrice = track.price;
  const trackDiscountPct = track.discount_percent || 0;
  const trackDiscountAmount = +(originalPrice * (trackDiscountPct / 100)).toFixed(2);
  const priceAfterTrackDiscount = +(originalPrice - trackDiscountAmount).toFixed(2);

  const promoDiscountAmount = appliedPromo ? appliedPromo.discount_amount : 0;
  const finalPrice = Math.max(0, +(priceAfterTrackDiscount - promoDiscountAmount).toFixed(2));

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError("");
    try {
      const res = await fetch('/api/promos/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promoCode.trim().toUpperCase(),
          music_id: track.id,
          amount: priceAfterTrackDiscount
        })
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedPromo(data);
        setPromoError("");
      } else {
        setAppliedPromo(null);
        setPromoError(lang === 'kh' ? data.message_kh : data.message_en);
      }
    } catch (err) {
      setPromoError(lang === 'kh' ? "មានបញ្ហាក្នុងការត្រួតពិនិត្យកូដ" : "Failed to validate promo code");
    } finally {
      setPromoLoading(false);
    }
  };

  const handleTelegramCheckout = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        music_id: track.id,
        promo_code: appliedPromo ? appliedPromo.promo_code : (promoCode.trim() ? promoCode.trim().toUpperCase() : null),
        customer_name: customerName.trim() || undefined,
        customer_telegram: customerTelegram.trim() || undefined
      };

      const res = await fetch('/api/orders/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || 'Failed to generate order inquiry');
      }

      const data = await res.json();
      setOrderSuccess(data);

      if (data.telegram_url) {
        window.open(data.telegram_url, '_blank');
      }
    } catch (err) {
      console.error(err);
      alert('Checkout error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-sm cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl cursor-default dark:border-white/10 dark:bg-zinc-900"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-zinc-100 px-5 py-4 sm:px-6 dark:border-white/10">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-600/10">
              <Music className="h-4 w-4 text-pink-600 dark:text-pink-400" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 sm:text-base dark:text-white">
                {t('order_modal_title')}
              </h2>
              <p className="text-[11px] text-zinc-400">{t('instant_buy')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal body */}
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
          {/* No-registration notice */}
          <div className="flex items-start gap-2.5 rounded-xl border border-pink-600/15 bg-pink-600/[0.05] p-3 text-pink-700 dark:border-pink-400/15 dark:bg-pink-400/[0.06] dark:text-pink-300">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="text-xs leading-relaxed">{t('no_login_banner')}</p>
          </div>

          {/* Track summary */}
          <div className="flex items-center gap-3.5 rounded-xl border border-zinc-200 bg-zinc-50/70 p-3 dark:border-white/10 dark:bg-white/[0.03]">
            <img
              src={track.cover_image_url || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80"}
              alt={title}
              className="h-14 w-14 shrink-0 rounded-lg object-cover ring-1 ring-zinc-200 sm:h-16 sm:w-16 dark:ring-white/10"
            />
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-sm font-semibold text-zinc-900 dark:text-white">{title}</h4>
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{artist}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="rounded-md border border-zinc-200 bg-white px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
                  {track.genre || 'Music'}
                </span>
                {track.duration && (
                  <span className="font-mono text-[10px] text-zinc-400">{track.duration}</span>
                )}
              </div>
            </div>
          </div>

          {/* Promo code */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200">
              <Tag className="h-3.5 w-3.5 text-pink-600 dark:text-pink-400" />
              {t('promo_code_label')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder={t('promo_code_placeholder')}
                disabled={Boolean(appliedPromo)}
                className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium uppercase text-zinc-800 placeholder:normal-case placeholder:text-zinc-400 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                disabled={promoLoading || !promoCode.trim() || Boolean(appliedPromo)}
                className="inline-flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-zinc-900 px-4 text-xs font-semibold text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                {promoLoading ? t('applying') : t('apply_code')}
              </button>
            </div>

            {appliedPromo && (
              <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>
                  {appliedPromo.discount_percent}% OFF ({currencySymbol}{appliedPromo.discount_amount.toFixed(2)})!
                </span>
              </div>
            )}

            {promoError && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{promoError}</span>
              </div>
            )}
          </div>

          {/* Optional buyer info */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {lang === 'kh' ? 'ឈ្មោះរបស់អ្នក (ស្រេចចិត្ត)' : 'Your Name (Optional)'}
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Chan Dara"
                className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-xs text-zinc-800 placeholder:text-zinc-400 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {lang === 'kh' ? 'Telegram Username' : 'Telegram @Username'}
              </label>
              <input
                type="text"
                value={customerTelegram}
                onChange={(e) => setCustomerTelegram(e.target.value)}
                placeholder="@username"
                className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-xs text-zinc-800 placeholder:text-zinc-400 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
            </div>
          </div>

          {/* Price breakdown */}
          <div className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 text-xs dark:border-white/10 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
              <span>{t('original_price')}</span>
              <span className="font-mono">{currencySymbol}{originalPrice.toFixed(2)}</span>
            </div>

            {trackDiscountPct > 0 && (
              <div className="flex items-center justify-between text-pink-600 dark:text-pink-400">
                <span>{t('track_discount')} (-{trackDiscountPct}%)</span>
                <span className="font-mono">-{currencySymbol}{trackDiscountAmount.toFixed(2)}</span>
              </div>
            )}

            {appliedPromo && (
              <div className="flex items-center justify-between font-medium text-emerald-600 dark:text-emerald-400">
                <span>{t('promo_discount')} ({appliedPromo.promo_code})</span>
                <span className="font-mono">-{currencySymbol}{appliedPromo.discount_amount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex items-baseline justify-between border-t border-zinc-200 pt-2.5 dark:border-white/10">
              <span className="text-sm font-bold text-zinc-900 dark:text-white">{t('final_total')}</span>
              <span className="font-mono text-lg font-extrabold text-zinc-900 dark:text-white">
                {currencySymbol}{finalPrice.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Success state */}
          {orderSuccess && (
            <div className="space-y-2 rounded-xl border border-emerald-600/20 bg-emerald-600/[0.06] p-3.5 text-xs text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>{lang === 'kh' ? 'បានបង្កើតវិក្កយបត្រដោយជោគជ័យ!' : 'Order Inquiry Generated!'}</span>
              </div>
              <p className="leading-relaxed text-emerald-700 dark:text-emerald-300/90">
                Code: <span className="font-mono font-bold">#{orderSuccess.reference_code}</span>. {t('checkout_note')}
              </p>
              {orderSuccess.telegram_url && (
                <a
                  href={orderSuccess.telegram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-sky-600"
                >
                  <Send className="h-3.5 w-3.5" />
                  {lang === 'kh' ? 'បើក Telegram ឥឡូវនេះ' : 'Open Telegram Now'}
                </a>
              )}
            </div>
          )}
        </div>

        {/* Modal footer / checkout CTA */}
        <div className="flex shrink-0 flex-col gap-3 border-t border-zinc-100 bg-zinc-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-white/[0.02]">
          <div className="flex items-baseline justify-between sm:block">
            <span className="block text-[10px] font-medium uppercase tracking-wide text-zinc-400">
              {t('final_total')}
            </span>
            <span className="font-mono text-xl font-extrabold text-zinc-900 dark:text-white">
              {currencySymbol}{finalPrice.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 flex-1 cursor-pointer items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 sm:flex-none dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
            >
              {lang === 'kh' ? 'បោះបង់' : 'Cancel'}
            </button>

            <button
              type="button"
              onClick={handleTelegramCheckout}
              disabled={isSubmitting}
              className="inline-flex h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-sky-500 px-5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-sky-600 disabled:opacity-50 sm:flex-none"
            >
              <Send className="h-4 w-4" />
              <span>{isSubmitting ? 'Processing...' : t('checkout_telegram_btn')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
