import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  BookOpen,
  Sparkles,
  ShieldCheck,
  Send,
  Headphones,
  Award,
  HeartHandshake,
  CheckCircle2,
  Music2
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

    // Cross-tab real-time sync with Admin CMS
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

  // If no sections in DB and finished loading, we can display default fallbacks or return null
  if (!loading && sections.length === 0) {
    return null;
  }

  return (
    <section id="about" className="py-12 sm:py-16 lg:py-20 relative overflow-hidden">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-72 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-pink-500/10 dark:bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/25 text-xs font-bold mb-4 shadow-sm">
            <BookOpen className="w-3.5 h-3.5 text-purple-500 shrink-0" />
            <span>{lang === 'kh' ? 'អំពី KhmerBeats' : 'About KhmerBeats'}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            {lang === 'kh' ? (
              <>
                រឿងរ៉ាវ និងបេសកកម្ម <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">តន្ត្រីខ្មែររបស់យើង</span>
              </>
            ) : (
              <>
                Our Passion, Heritage & <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">Musical Journey</span>
              </>
            )}
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
            {lang === 'kh'
              ? 'វេទិកាចែករំលែក និងទិញបទចម្រៀង Original ខ្មែរប្រកបដោយគុណភាពខ្ពស់ គាំទ្រសិល្បករក្នុងស្រុកដោយផ្ទាល់ មិនចាំបាច់មានការចុះឈ្មោះស្មុគស្មាញ។'
              : 'Empowering independent Cambodian producers and bringing authentic high-fidelity sound directly to music enthusiasts worldwide.'}
          </p>
        </div>

        {/* Dynamic Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 rounded-3xl bg-slate-200 dark:bg-slate-800/60" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {sections.map((item, idx) => {
              const title = lang === 'kh' ? (item.title_kh || item.title_en) : (item.title_en || item.title_kh);
              const subtitle = lang === 'kh' ? (item.subtitle_kh || item.subtitle_en) : (item.subtitle_en || item.subtitle_kh);
              const content = lang === 'kh' ? (item.content_kh || item.content_en) : (item.content_en || item.content_kh);
              const badge = lang === 'kh' ? (item.badge_kh || item.badge_en) : (item.badge_en || item.badge_kh);

              return (
                <div
                  key={item.id}
                  className="group relative flex flex-col bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/90 dark:border-slate-800/90 overflow-hidden shadow-sm hover:shadow-xl hover:border-purple-500/40 transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Image Container */}
                  {item.image_url ? (
                    <div className="relative w-full h-48 sm:h-52 overflow-hidden bg-slate-950 shrink-0">
                      <img
                        src={item.image_url}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                      
                      {/* Badge Pill on top of Image */}
                      {badge && (
                        <div className="absolute bottom-3 left-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/85 backdrop-blur-md text-pink-400 border border-pink-500/30 text-[11px] font-bold shadow-md">
                            <Sparkles className="w-3 h-3 text-pink-400 shrink-0" />
                            <span>{badge}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 pb-0">
                      {badge && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/25 text-[11px] font-bold">
                          <Sparkles className="w-3 h-3 text-purple-500 shrink-0" />
                          <span>{badge}</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Card Content Area */}
                  <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {title}
                      </h3>

                      {subtitle && (
                        <p className="text-xs font-semibold text-pink-600 dark:text-pink-400">
                          {subtitle}
                        </p>
                      )}

                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                        {content}
                      </p>
                    </div>

                    {/* Footer decoration */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{lang === 'kh' ? 'បានផ្ទៀងផ្ទាត់' : 'Verified Standard'}</span>
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        0{idx + 1}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Feature Highlights Bar below About Cards */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="p-5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {lang === 'kh' ? 'សំឡេងកម្រិតស្ទូឌីយោ' : 'Studio Master Quality'}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {lang === 'kh' ? 'ឯកសារ 320kbps & WAV ច្បាស់ឥតខ្ចោះ' : 'Crystal clear lossless audio formats'}
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {lang === 'kh' ? 'គាំទ្រសិល្បករផ្ទាល់' : 'Direct Artist Support'}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {lang === 'kh' ? 'ថវិកាដល់ដៃអ្នកបង្កើតស្នាដៃពិតៗ' : '100% transparent royalty distribution'}
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {lang === 'kh' ? 'ទិញរហ័សតាម Telegram' : 'Instant Telegram Delivery'}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {lang === 'kh' ? 'គ្មានការបង្កើតគណនី ទទួលឯកសារភ្លាមៗ' : 'No password needed, receive files fast'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
