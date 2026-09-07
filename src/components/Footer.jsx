import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Music, ShieldCheck, Zap, Send } from 'lucide-react';

export const Footer = ({ settings }) => {
  const { lang, t } = useLanguage();

  const siteName = lang === 'kh'
    ? (settings?.site_name_kh || settings?.site_name_en || 'KhmerBeats')
    : (settings?.site_name_en || settings?.site_name_kh || 'KhmerBeats');

  const features = [
    {
      icon: Zap,
      iconClass: 'text-pink-600 dark:text-pink-400',
      title: lang === 'kh' ? 'គ្មានការ Login ឬ Register' : 'No Account or Registration',
      desc: lang === 'kh' ? 'ទិញបទចម្រៀងបានភ្លាមៗ ដោយមិនបាច់បង្កើត account' : 'Buy immediately with zero friction or sign-up hassle'
    },
    {
      icon: Send,
      iconClass: 'text-sky-600 dark:text-sky-400',
      title: lang === 'kh' ? 'ផ្ញើបញ្ជាទិញតាម Telegram' : 'Direct Telegram Checkout',
      desc: lang === 'kh' ? 'ភ្ជាប់ទៅកាន់ Telegram របស់ Admin ផ្ទាល់ ជាមួយវិក្កយបត្រស្វ័យប្រវត្ត' : 'Connect directly to Admin on Telegram with pre-filled details'
    },
    {
      icon: ShieldCheck,
      iconClass: 'text-emerald-600 dark:text-emerald-400',
      title: lang === 'kh' ? 'ការបញ្ចុះតម្លៃ & Promo Codes' : 'Discounts & Promo Codes',
      desc: lang === 'kh' ? 'ផ្ទៀងផ្ទាត់កូដបញ្ចុះតម្លៃពិតៗ រហូតដល់ 30% លើបទចម្រៀងពេញនិយម' : 'Instant automated coupon verification and special discounts'
    }
  ];

  return (
    <footer className="mt-16 border-t border-zinc-200/80 bg-white pb-32 pt-12 sm:mt-20 sm:pt-14 dark:border-white/10 dark:bg-zinc-950/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Features */}
        <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="flex items-start gap-3.5 rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-4 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-zinc-200/80 dark:bg-white/5 dark:ring-white/10">
                  <Icon className={`h-5 w-5 ${f.iconClass}`} />
                </span>
                <div>
                  <h5 className="text-sm font-semibold text-zinc-900 dark:text-white">{f.title}</h5>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Brand / copyright */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-zinc-200/80 pt-6 text-xs text-zinc-500 sm:flex-row dark:border-white/10 dark:text-zinc-400">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <Music className="h-4 w-4 shrink-0 text-pink-600 dark:text-pink-400" />
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{siteName}</span>
            <span className="hidden text-zinc-400 sm:inline">• {t('footer_desc')}</span>
          </div>
          <div>
            © {new Date().getFullYear()} {siteName}. {t('footer_rights')}
          </div>
        </div>
      </div>
    </footer>
  );
};
