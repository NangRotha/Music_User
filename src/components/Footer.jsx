import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Music, ShieldCheck, Zap, Send } from 'lucide-react';

export const Footer = ({ settings }) => {
  const { lang, t } = useLanguage();

  const siteName = lang === 'kh' 
    ? (settings?.site_name_kh || settings?.site_name_en || 'KhmerBeats')
    : (settings?.site_name_en || settings?.site_name_kh || 'KhmerBeats');

  return (
    <footer className="mt-16 sm:mt-20 border-t border-slate-200 dark:border-slate-800/80 bg-slate-100/70 dark:bg-slate-950/60 pb-28 pt-10 sm:pt-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Features row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-12">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-pink-500 dark:text-pink-400" />
            </div>
            <div>
              <h5 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                {lang === 'kh' ? 'គ្មានការ Login ឬ Register' : 'No Account or Registration'}
              </h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {lang === 'kh' ? 'ទិញបទចម្រៀងបានភ្លាមៗ ដោយមិនបាច់ចាំចំណាយពេលបង្កើត account' : 'Buy immediately with zero friction or sign-up hassle'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
              <Send className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <h5 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                {lang === 'kh' ? 'ផ្ញើបញ្ជាទិញតាម Telegram' : 'Direct Telegram Checkout'}
              </h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {lang === 'kh' ? 'ភ្ជាប់ទៅកាន់ Telegram របស់ Admin ផ្ទាល់ ជាមួយវិក្កយបត្រស្វ័យប្រវត្ត' : 'Connect directly to Admin on Telegram with pre-filled details'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h5 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                {lang === 'kh' ? 'ការបញ្ចុះតម្លៃ & Promo Codes' : 'Discounts & Promo Codes'}
              </h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {lang === 'kh' ? 'ផ្ទៀងផ្ទាត់កូដបញ្ចុះតម្លៃពិតៗ រហូតដល់ 30% លើបទចម្រៀងពេញនិយម' : 'Instant automated coupon verification and special discounts'}
              </p>
            </div>
          </div>
        </div>

        {/* Brand and Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-800/80 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-pink-500 dark:text-pink-400" />
            <span className="font-bold text-slate-800 dark:text-slate-300">{siteName}</span>
            <span>• {t('footer_desc')}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>© {new Date().getFullYear()} {siteName}. {t('footer_rights')}</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
