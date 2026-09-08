import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { X, Send, CheckCircle2, AlertCircle, ShieldCheck, Music, QrCode, Download, Loader2, Banknote, Tag, ExternalLink, FileText } from 'lucide-react';

export const BuyModal = ({ track, isOpen, onClose, currencySymbol = "$", initialPromo = "", storeName = "", storeLogo = "" }) => {
  const { lang, t } = useLanguage();

  const [promoCode, setPromoCode] = useState(initialPromo);
  const [promoLoading, setPromoLoading] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerTelegram, setCustomerTelegram] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // ABA QR payment flow state
  const [paymentStage, setPaymentStage] = useState('idle'); // idle | qr | paid
  const [payment, setPayment] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [invoiceUrl, setInvoiceUrl] = useState('');
  const pollTimerRef = useRef(null);

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

  // Reset ABA flow whenever the modal is opened (or the track changes)
  useEffect(() => {
    if (isOpen) {
      resetAbapay();
    } else {
      stopPolling();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, track?.id]);

  // Auto-start the download once payment is confirmed
  useEffect(() => {
    if (paymentStage === 'paid' && downloadUrl) {
      const timer = setTimeout(() => {
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.setAttribute('download', '');
        document.body.appendChild(a);
        a.click();
        a.remove();
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [paymentStage, downloadUrl]);

  function stopPolling() {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }

  function resetAbapay() {
    stopPolling();
    setPaymentStage('idle');
    setPayment(null);
    setPaymentLoading(false);
    setPaymentError('');
    setDownloadUrl('');
    setInvoiceUrl('');
  }

  if (!isOpen || !track) return null;

  const title = lang === 'kh' ? (track.title_kh || track.title_en) : track.title_en;
  const artist = lang === 'kh' ? (track.artist_kh || track.artist_en) : track.artist_en;
  const merchantName = storeName || (lang === 'kh' ? 'ហាងតន្ត្រី KhmerBeats' : 'KhmerBeats Music Store');

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

  const pollPaymentStatus = (transactionId, isManual = false) => {
    fetch('/api/payments/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transaction_id: transactionId })
    })
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || 'Status check failed');
        return res.json();
      })
      .then((data) => {
        if (data.status === 'paid') {
          stopPolling();
          setDownloadUrl(data.download_url || '');
          setInvoiceUrl(data.invoice_url || '');
          setPaymentStage('paid');
        } else if (data.status === 'failed') {
          stopPolling();
          setPaymentStage('idle');
          setPayment(null);
          setPaymentError(t('aba_payment_failed'));
        } else {
          // still pending -> poll again in ~3s (per KHQRcc recommendation)
          if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
          pollTimerRef.current = setTimeout(() => pollPaymentStatus(transactionId), 3000);
        }
      })
      .catch((err) => {
        console.error('ABA status check error:', err);
        if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
        if (isManual) {
          setPaymentStage('idle');
          setPayment(null);
          setPaymentError(t('aba_payment_failed'));
        } else {
          pollTimerRef.current = setTimeout(() => pollPaymentStatus(transactionId), 5000);
        }
      });
  };

  const startAbapay = async () => {
    stopPolling();
    setPaymentLoading(true);
    setPaymentError('');
    try {
      const payload = {
        music_id: track.id,
        promo_code: appliedPromo
          ? appliedPromo.promo_code
          : (promoCode.trim() ? promoCode.trim().toUpperCase() : null),
        customer_name: customerName.trim() || undefined
      };
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || 'Failed to start ABA payment');
      }
      const data = await res.json();
      setPayment(data);
      setPaymentStage('qr');
      try { sessionStorage.setItem('khmerbeats_aba_tx', data.transaction_id); } catch (e) { /* ignore */ }
      pollPaymentStatus(data.transaction_id);
    } catch (err) {
      console.error(err);
      setPaymentError(err.message);
      setPaymentStage('idle');
    } finally {
      setPaymentLoading(false);
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
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {paymentStage === 'idle' ? (
            <div className="space-y-4">
          {/* No-registration notice */}
          <div className="flex items-start gap-2.5 rounded-xl border border-pink-600/15 bg-pink-600/[0.05] p-3 text-pink-700 dark:border-pink-400/15 dark:bg-pink-400/[0.06] dark:text-pink-300">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="text-xs leading-relaxed">{t('no_login_banner')}</p>
          </div>

          {paymentError && (
            <div className="flex items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{paymentError}</span>
            </div>
          )}

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
          ) : paymentStage === 'paid' ? (
            <div className="flex flex-col items-center gap-4 py-2 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
                <CheckCircle2 className="h-9 w-9 text-emerald-500 dark:text-emerald-400" />
              </span>
              <div>
                <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white">{t('aba_paid_title')}</h3>
                <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {title} — {artist}
                </p>
              </div>
              <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{t('aba_download_note')}</p>
              {payment?.reference_code && (
                <p className="font-mono text-[11px] text-zinc-400">
                  {t('aba_order_ref')}: #{payment.reference_code}
                </p>
              )}
              {downloadUrl && (
                <a
                  href={downloadUrl}
                  className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-transform hover:scale-[1.02]"
                >
                  <Download className="h-5 w-5" />
                  {t('aba_download_btn')}
                </a>
              )}
              {invoiceUrl && (
                <a
                  href={invoiceUrl}
                  className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-white/15 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <FileText className="h-4 w-4" />
                  {t('aba_invoice_btn')}
                </a>
              )}
            </div>
          ) : (
            <div className="space-y-4 text-left">
              {/* Header: title + live status */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-600/25">
                    <QrCode className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-extrabold text-zinc-900 dark:text-white">{t('aba_scan_with')}</h3>
                    <p className="truncate text-[10px] font-bold uppercase tracking-widest text-pink-600 dark:text-pink-400">ABA Pay • KHQR</p>
                  </div>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-500" />
                  </span>
                  {t('aba_waiting')}
                </span>
              </div>

              {/* Payment ticket */}
              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900">
                <div className="flex items-center justify-between gap-2 border-b border-dashed border-zinc-200 bg-gradient-to-r from-pink-600/[0.07] via-rose-600/[0.04] to-transparent px-4 py-2.5 dark:border-white/10">
                  <div className="flex min-w-0 items-center gap-2">
                    {storeLogo ? <img src={storeLogo} alt="" className="h-5 w-5 shrink-0 object-contain" /> : <Music className="h-4 w-4 shrink-0 text-pink-500" />}
                    <span className="truncate text-xs font-bold text-zinc-800 dark:text-zinc-100">{merchantName}</span>
                  </div>
                  <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-zinc-400">{t('aba_pay_to')}</span>
                </div>

                <div className="flex flex-col items-center gap-3 px-4 pt-4 pb-3">
                  <div className="rounded-2xl bg-zinc-50 p-3 ring-1 ring-zinc-200/70 dark:bg-zinc-800/40 dark:ring-white/10">
                    {payment?.qr_url ? (
                      <img src={payment.qr_url} alt="ABA Pay QR" className="h-48 w-48 object-contain sm:h-56 sm:w-56" />
                    ) : (
                      <div className="flex h-48 w-48 items-center justify-center sm:h-56 sm:w-56">
                        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">{t('aba_amount_to_pay')}</p>
                    <p className="font-mono text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                      {currencySymbol}{(payment?.amount ?? finalPrice).toFixed(2)}
                    </p>
                  </div>
                  {payment?.qr_url && (
                    <a href={payment.qr_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-pink-600 transition-colors hover:text-pink-700 dark:text-pink-400">
                      <ExternalLink className="h-3 w-3" />
                      {t('aba_open_larger')}
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-2 divide-x divide-dashed divide-zinc-200 border-t border-dashed border-zinc-200 bg-zinc-50/80 text-center dark:divide-white/10 dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="px-3 py-2.5">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-400">{t('aba_order_ref')}</p>
                    <p className="mt-0.5 font-mono text-[11px] font-bold text-zinc-700 dark:text-zinc-200">#{payment?.reference_code || '—'}</p>
                  </div>
                  <div className="px-3 py-2.5">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-400">{t('aba_meta_transaction')}</p>
                    <p className="mt-0.5 truncate font-mono text-[11px] font-bold text-zinc-700 dark:text-zinc-200">
                      {payment?.transaction_id ? `…${payment.transaction_id.slice(-8)}` : '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* How-to note */}
              <div className="flex items-start gap-2 rounded-xl border border-sky-500/15 bg-sky-500/[0.06] px-3 py-2.5 dark:border-sky-400/10 dark:bg-sky-400/[0.06]">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
                <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-300">{t('aba_scan_instruction')}</p>
              </div>

              {paymentError && (
                <div className="flex items-center gap-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-600 dark:text-rose-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{paymentError}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex w-full gap-2">
                <button
                  type="button"
                  onClick={() => {
                    stopPolling();
                    resetAbapay();
                    try { sessionStorage.removeItem('khmerbeats_aba_tx'); } catch (e) { /* ignore */ }
                  }}
                  className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10"
                >
                  {t('aba_cancel_pay')}
                </button>
                <button
                  type="button"
                  onClick={() => payment && pollPaymentStatus(payment.transaction_id, true)}
                  disabled={!payment}
                  className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 px-3 text-xs font-bold text-white shadow-lg shadow-pink-600/20 transition-colors hover:from-pink-700 hover:to-rose-700 disabled:opacity-50"
                >
                  <Banknote className="h-4 w-4" />
                  {t('aba_check_now')}
                </button>
              </div>

              <p className="flex items-center justify-center gap-1.5 text-center text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                <ShieldCheck className="h-3 w-3" />
                {t('aba_secure_by')}
              </p>
            </div>
          )}
        </div>

        {/* Modal footer / checkout CTA */}
        <div className="flex shrink-0 flex-col gap-3 border-t border-zinc-100 bg-zinc-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-white/[0.02]">
          {paymentStage === 'idle' ? (
            <>
              <div className="flex items-baseline justify-between sm:block">
                <span className="block text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                  {t('final_total')}
                </span>
                <span className="font-mono text-xl font-extrabold text-zinc-900 dark:text-white">
                  {currencySymbol}{finalPrice.toFixed(2)}
                </span>
              </div>

              <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  {lang === 'kh' ? 'បោះបង់' : 'Cancel'}
                </button>

                <button
                  type="button"
                  onClick={startAbapay}
                  disabled={paymentLoading || isSubmitting}
                  className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 px-5 text-xs font-bold text-white shadow-sm transition-colors hover:from-pink-700 hover:to-purple-700 disabled:opacity-60"
                >
                  {paymentLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
                  <span>{t('aba_checkout_btn')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleTelegramCheckout}
                  disabled={isSubmitting}
                  title={t('checkout_telegram_btn')}
                  className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-sky-500/30 bg-sky-500/10 px-4 text-xs font-semibold text-sky-600 transition-colors hover:bg-sky-500/20 dark:text-sky-400"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Telegram</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                {lang === 'kh' ? 'បិទ' : 'Close'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
