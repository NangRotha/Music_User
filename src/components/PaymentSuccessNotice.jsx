import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { CheckCircle2, Download, Loader2, X, AlertCircle, Music, FileText } from 'lucide-react';

const MAX_POLLS = 40; // ~2 minutes of 3s polls

/**
 * Shown after the ABA app redirects the customer back to the site with
 * ?payment=success&tx=<transaction_id>. Confirms the payment with the backend
 * and reveals the download link once the order is marked as paid.
 */
export const PaymentSuccessNotice = ({ transactionId, onClose, currencySymbol = '$' }) => {
  const { lang, t } = useLanguage();
  const [state, setState] = useState('checking'); // checking | pending | paid | failed | notfound
  const [info, setInfo] = useState(null);
  const [error, setError] = useState('');
  const attemptsRef = useRef(0);
  const checkStatusRef = useRef(null);

  useEffect(() => {
    if (!transactionId) return;
    let cancelled = false;
    let timer = null;

    const checkStatus = async (manual = false) => {
      try {
        const res = await fetch('/api/payments/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transaction_id: transactionId })
        });
        if (!res.ok) {
          if (res.status === 404) {
            if (!cancelled) setState('notfound');
            return;
          }
          throw new Error('status error');
        }
        const data = await res.json();
        if (cancelled) return;

        if (data.status === 'paid') {
          setInfo(data);
          setState('paid');
          return;
        }
        if (data.status === 'failed') {
          setState('failed');
          return;
        }
        // pending -> poll again
        setState('pending');
        if (manual) attemptsRef.current = 0;
        if (attemptsRef.current < MAX_POLLS) {
          attemptsRef.current += 1;
          timer = setTimeout(() => checkStatus(false), 3000);
        } else if (!cancelled) {
          setError(t('aba_payment_failed'));
        }
      } catch (err) {
        console.error('Payment status check failed:', err);
        if (!cancelled && !manual) {
          timer = setTimeout(() => checkStatus(false), 5000);
        } else if (!cancelled) {
          setError(t('aba_payment_failed'));
        }
      }
    };

    checkStatusRef.current = checkStatus;
    checkStatus(false);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId]);

  // Auto-start the download once confirmed
  useEffect(() => {
    if (state === 'paid' && info?.download_url) {
      const timer = setTimeout(() => {
        const a = document.createElement('a');
        a.href = info.download_url;
        a.setAttribute('download', '');
        document.body.appendChild(a);
        a.click();
        a.remove();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [state, info]);

  const subtitle = `${info?.music_title || ''} — ${currencySymbol}${Number(info?.amount || 0).toFixed(2)}`;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-zinc-950/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-white/10 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3.5 dark:border-white/10">
          <div className="flex items-center gap-2">
            {state === 'paid' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            ) : (
              <Music className="h-5 w-5 text-pink-500" />
            )}
            <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white">
              {lang === 'kh' ? 'ការទូទាត់' : 'Payment'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-4 px-6 py-8 text-center">
          {state === 'paid' && info ? (
            <>
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
                <CheckCircle2 className="h-9 w-9 text-emerald-500 dark:text-emerald-400" />
              </span>
              <div>
                <h4 className="text-lg font-extrabold text-zinc-900 dark:text-white">{t('aba_paid_title')}</h4>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p>
              </div>
              <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{t('aba_download_note')}</p>
              <a
                href={info.download_url}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-transform hover:scale-[1.02]"
              >
                <Download className="h-5 w-5" />
                {t('aba_download_btn')}
              </a>
              {info.invoice_url && (
                <a
                  href={info.invoice_url}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-white/15 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <FileText className="h-4 w-4" />
                  {t('aba_invoice_btn')}
                </a>
              )}
            </>
          ) : state === 'failed' || state === 'notfound' ? (
            <>
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/15">
                <AlertCircle className="h-9 w-9 text-rose-500" />
              </span>
              <div>
                <h4 className="text-base font-extrabold text-zinc-900 dark:text-white">
                  {state === 'notfound'
                    ? (lang === 'kh' ? 'រកមិនឃើញការបញ្ជាទិញនេះទេ' : 'Order not found')
                    : (lang === 'kh' ? 'ការទូទាត់មិនបានបញ្ជាក់ទេ' : 'Payment not confirmed')}
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{t('aba_payment_failed')}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-zinc-100 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-white/10 dark:text-zinc-200 dark:hover:bg-white/15"
              >
                {lang === 'kh' ? 'បិទ' : 'Close'}
              </button>
            </>
          ) : (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-pink-500" />
              <div>
                <h4 className="text-base font-extrabold text-zinc-900 dark:text-white">{t('aba_waiting')}</h4>
                <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{t('aba_scan_instruction')}</p>
              </div>
              {error && <p className="text-xs text-rose-500">{error}</p>}
              <button
                type="button"
                onClick={() => {
                  attemptsRef.current = 0;
                  setError('');
                  checkStatusRef.current && checkStatusRef.current(true);
                }}
                className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-xs font-bold text-white shadow-lg shadow-pink-600/20 transition-colors hover:from-pink-700 hover:to-rose-700"
              >
                {t('aba_check_now')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
