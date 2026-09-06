import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { X, Tag, Send, CheckCircle2, AlertCircle, Sparkles, Music, ShieldCheck } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md transition-colors duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl shadow-pink-500/10 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
              <Music className="w-4 h-4 text-pink-500 dark:text-pink-400" />
            </div>
            <h2 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
              {t('order_modal_title')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable for mobile) */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200">
          
          {/* No Registration Banner (Clean Lucide Icon - No Emoji) */}
          <div className="p-3 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border border-pink-500/20 rounded-xl text-xs text-pink-700 dark:text-pink-300 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500 dark:text-pink-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px] sm:text-xs">
              {t('no_login_banner')}
            </p>
          </div>

          {/* Track Summary Card */}
          <div className="flex items-center gap-3.5 p-3 sm:p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <img
              src={track.cover_image_url || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80"}
              alt={title}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-800"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">{title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{artist}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] px-2 py-0.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent rounded font-medium">
                  {track.genre || 'Music'}
                </span>
                {track.duration && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    {track.duration}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Promo Code Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-pink-500 dark:text-pink-400" />
              <span>{t('promo_code_label')}</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value.toUpperCase());
                  setAppliedPromo(null);
                  setPromoError("");
                }}
                placeholder={t('promo_code_placeholder')}
                className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs sm:text-sm font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-pink-500"
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                disabled={promoLoading || !promoCode.trim()}
                className="px-4 py-2.5 bg-slate-800 dark:bg-slate-800 hover:bg-pink-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
              >
                {promoLoading ? t('applying') : t('apply_code')}
              </button>
            </div>

            {appliedPromo && (
              <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {appliedPromo.discount_percent}% OFF ({currencySymbol}{appliedPromo.discount_amount.toFixed(2)})!
                </span>
              </div>
            )}

            {promoError && (
              <div className="mt-2 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{promoError}</span>
              </div>
            )}
          </div>

          {/* Optional Buyer Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                {lang === 'kh' ? 'ឈ្មោះរបស់អ្នក (ស្រេចចិត្ត)' : 'Your Name (Optional)'}
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Chan Dara"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                {lang === 'kh' ? 'Telegram Username' : 'Telegram @Username'}
              </label>
              <input
                type="text"
                value={customerTelegram}
                onChange={(e) => setCustomerTelegram(e.target.value)}
                placeholder="@username"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          {/* Price Breakdown Calculation */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>{t('price')} (Original)</span>
              <span className="font-mono">{currencySymbol}{originalPrice.toFixed(2)}</span>
            </div>

            {trackDiscountPct > 0 && (
              <div className="flex justify-between text-pink-600 dark:text-pink-400">
                <span>{lang === 'kh' ? 'បញ្ចុះតម្លៃបទចម្រៀង' : 'Track Discount'} (-{trackDiscountPct}%)</span>
                <span className="font-mono">-{currencySymbol}{trackDiscountAmount.toFixed(2)}</span>
              </div>
            )}

            {appliedPromo && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>Promo ({appliedPromo.promo_code})</span>
                <span className="font-mono">-{currencySymbol}{appliedPromo.discount_amount.toFixed(2)}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              <span>{t('final_total')}</span>
              <span className="font-black text-pink-600 dark:text-pink-400 text-lg sm:text-xl font-mono">
                {currencySymbol}{finalPrice.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Order Success State */}
          {orderSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{lang === 'kh' ? 'បានបង្កើតវិក្កយបត្រដោយជោគជ័យ!' : 'Order Inquiry Generated!'}</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Code: <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">#{orderSuccess.reference_code}</span>. {t('open_telegram_msg')}
              </p>
              {orderSuccess.telegram_url && (
                <a
                  href={orderSuccess.telegram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{lang === 'kh' ? 'បើក Telegram ឥឡូវនេះ' : 'Open Telegram Now'}</span>
                </a>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer / Checkout CTA */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-center sm:text-left">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{t('final_total')}</span>
            <span className="text-xl font-black text-pink-600 dark:text-pink-400 font-mono">
              {currencySymbol}{finalPrice.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-200/80 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {lang === 'kh' ? 'បោះបង់' : 'Cancel'}
            </button>

            <button
              type="button"
              onClick={handleTelegramCheckout}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Processing...' : t('checkout_telegram')}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
