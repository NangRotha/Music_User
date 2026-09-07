import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  BookOpen,
  Sparkles,
  Send,
  Headphones,
  HeartHandshake,
  CheckCircle2
} from 'lucide-react';

export const AboutSection = () => {
  const { lang } = useLanguage();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAboutSections = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/about');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setSections(data);
        }
      }
    } catch (err) {
      console.error('Failed to load about sections:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAboutSections();

    let channel;
    try {
      channel = new BroadcastChannel('khmer_beats_sync');
      channel.onmessage = (e) => {
        if (!e.data?.type || e.data?.type === 'ABOUT_UPDATED' || e.data?.type === 'SETTINGS_UPDATED') {
          fetchAboutSections(true);
        }
      };
    } catch (e) {}

    const interval = setInterval(() => {
      fetchAboutSections(true);
    }, 4000);

    return () => {
      if (channel) channel.close();
      clearInterval(interval);
    };
  }, [fetchAboutSections]);

  // If no sections in DB and finished loading, we can hide this page block
  if (!loading && sections.length === 0) {
    return null;
  }

  return (
    <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-600/15 bg-purple-600/[0.06] px-3.5 py-1.5 text-xs font-semibold text-purple-700 dark:border-purple-400/20 dark:bg-purple-400/10 dark:text-purple-300">
            <BookOpen className="h-3.5 w-3.5" />
            <span>{lang === 'kh' ? 'អំពី KhmerBeats' : 'About KhmerBeats'}</span>
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl lg:text-4xl dark:text-white">
            {lang === 'kh'
              ? 'រឿងរ៉ាវ និងបេសកកម្ម តន្ត្រីខ្មែររបស់យើង'
              : 'Our Passion, Heritage & Musical Journey'}
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            {lang === 'kh'
              ? 'វេទិកាចែករំលែក និងទិញបទចម្រៀង Original ខ្មែរប្រកបដោយគុណភាពខ្ពស់ គាំទ្រសិល្បករក្នុងស្រុកដោយផ្ទាល់ មិនចាំបាច់មានការចុះឈ្មោះស្មុគស្មាញ។'
              : 'Empowering independent Cambodian producers and bringing authentic high-fidelity sound directly to music enthusiasts worldwide.'}
          </p>
        </div>

        {/* Dynamic cards grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl bg-zinc-200 dark:bg-white/[0.06]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {sections.map((item, idx) => {
              const title = lang === 'kh' ? (item.title_kh || item.title_en) : (item.title_en || item.title_kh);
              const subtitle = lang === 'kh' ? (item.subtitle_kh || item.subtitle_en) : (item.subtitle_en || item.subtitle_kh);
              const content = lang === 'kh' ? (item.content_kh || item.content_en) : (item.content_en || item.content_kh);
              const badge = lang === 'kh' ? (item.badge_kh || item.badge_en) : (item.badge_en || item.badge_kh);

              return (
                <article
                  key={item.id}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-900/[0.05] dark:border-white/10 dark:bg-zinc-900/70"
                >
                  {item.image_url ? (
                    <div className="relative h-44 w-full shrink-0 overflow-hidden bg-zinc-100 sm:h-48 dark:bg-zinc-950">
                      <img
                        src={item.image_url}
                        alt={title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : null}

                  <div className="flex flex-1 flex-col p-6">
                    {badge && (
                      <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-pink-600/15 bg-pink-600/[0.06] px-2.5 py-1 text-[11px] font-semibold text-pink-700 dark:border-pink-400/20 dark:bg-pink-400/10 dark:text-pink-300">
                        <Sparkles className="h-3 w-3" />
                        {badge}
                      </span>
                    )}

                    <h3 className="text-lg font-bold leading-snug tracking-tight text-zinc-900 transition-colors group-hover:text-pink-600 dark:text-white dark:group-hover:text-pink-400">
                      {title}
                    </h3>

                    {subtitle && (
                      <p className="mt-1 text-xs font-semibold text-purple-600 dark:text-purple-400">{subtitle}</p>
                    )}

                    <p className="mt-2.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{content}</p>

                    <div className="mt-auto flex items-center justify-between border-t border-zinc-100 pt-4 text-[11px] text-zinc-400 dark:border-white/10">
                      <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {lang === 'kh' ? 'បានផ្ទៀងផ្ទាត់' : 'Verified Standard'}
                      </span>
                      <span className="font-mono text-[10px]">0{idx + 1}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Feature highlights */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:mt-16 sm:grid-cols-3">
          <div className="flex items-start gap-3.5 rounded-2xl border border-zinc-200/80 bg-white p-5 dark:border-white/10 dark:bg-zinc-900/70">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-600/10">
              <Headphones className="h-5 w-5 text-pink-600 dark:text-pink-400" />
            </span>
            <div>
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">
                {lang === 'kh' ? 'សំឡេងកម្រិតស្ទូឌីយោ' : 'Studio Master Quality'}
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                {lang === 'kh' ? 'ឯកសារ 320kbps & WAV ច្បាស់ឥតខ្ចោះ' : 'Crystal clear lossless audio formats'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 rounded-2xl border border-zinc-200/80 bg-white p-5 dark:border-white/10 dark:bg-zinc-900/70">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-600/10">
              <HeartHandshake className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </span>
            <div>
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">
                {lang === 'kh' ? 'គាំទ្រសិល្បករផ្ទាល់' : 'Direct Artist Support'}
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                {lang === 'kh' ? 'ថវិកាដល់ដៃអ្នកបង្កើតស្នាដៃពិតៗ' : '100% transparent royalty distribution'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 rounded-2xl border border-zinc-200/80 bg-white p-5 dark:border-white/10 dark:bg-zinc-900/70">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-600/10">
              <Send className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            </span>
            <div>
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">
                {lang === 'kh' ? 'ទិញរហ័សតាម Telegram' : 'Instant Telegram Delivery'}
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                {lang === 'kh' ? 'គ្មានការបង្កើតគណនី ទទួលឯកសារភ្លាមៗ' : 'No password needed, receive files fast'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
