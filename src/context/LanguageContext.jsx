import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    site_tagline: "Original Music & Beats Store",
    nav_explore: "Explore",
    nav_featured: "Featured",
    nav_promos: "Promo Deals",
    nav_admin: "Admin Portal",
    hero_badge: "Instant Music Store • No Account Needed",
    hero_title: "Discover & Buy Original Soundtracks",
    hero_subtitle: "Buy original Khmer & international music with instant Telegram checkout, verified discounts, and promo codes.",
    search_placeholder: "Search songs, artists, or genres...",
    all_genres: "All Genres",
    featured_tracks: "Featured & Trending Tracks",
    all_tracks: "Browse Music Library",
    no_tracks_found: "No music tracks found matching your search.",
    play_preview: "Play Preview",
    pause: "Pause",
    buy_now: "Buy Now",
    instant_buy: "Instant Buy via Telegram",
    discount: "OFF",
    price: "Price",
    sale_price: "Sale Price",
    original_price: "Original Price",
    order_modal_title: "Music Purchase Checkout",
    no_login_banner: "No registration required! Your order will open directly in Admin's Telegram.",
    apply_code: "Apply",
    applying: "Checking...",
    promo_code_label: "Have a Promo Code?",
    promo_code_placeholder: "e.g. KHMER2026",
    promo_discount: "Promo Code Discount",
    track_discount: "Track Special Discount",
    total_amount: "Final Total",
    customer_name_placeholder: "Your Name (Optional)",
    customer_telegram_placeholder: "Your Telegram @username (Optional)",
    checkout_telegram_btn: "Send Order to Telegram Admin",
    checkout_note: "Clicking will open Telegram chat with Admin with your pre-filled music receipt.",
    aba_checkout_btn: "Pay Now with ABA QR (Auto)",
    aba_telegram_alt: "Or send the order to Admin on Telegram instead",
    aba_checkout_title: "ABA QR Auto Checkout",
    aba_scan_instruction: "Open ABA Mobile, tap Scan to Pay, and scan this QR code. As soon as payment is confirmed your music unlocks automatically.",
    aba_amount_to_pay: "Amount to pay",
    aba_waiting: "Waiting for your payment…",
    aba_checking: "Checking payment status…",
    aba_check_now: "I have paid — Check now",
    aba_cancel_pay: "Cancel payment",
    aba_paid_title: "Payment Successful! 🎉",
    aba_download_note: "Thank you for your purchase! Your download starts automatically. If it doesn’t start, tap the button below.",
    aba_download_btn: "Download Music Now",
    aba_invoice_btn: "Download Invoice (PDF)",
    aba_scan_with: "Scan with ABA Mobile",
    aba_pay_to: "Pay to",
    aba_open_larger: "Open QR larger",
    aba_meta_transaction: "Transaction",
    aba_secure_by: "Secured by ABA Pay • Verified by Bakong",
    aba_order_ref: "Order Ref",
    aba_payment_failed: "Payment was not confirmed. If you already paid in ABA, please contact Admin with your Order Ref.",
    now_playing: "Now Playing",
    preview_tag: "Preview Snippet",
    footer_desc: "The direct-to-fan music marketplace for original artists and music lovers.",
    footer_rights: "All Rights Reserved. Direct Telegram Checkout."
  },
  kh: {
    site_tagline: "ហាងលក់បទចម្រៀង និងតន្ត្រី Original",
    nav_explore: "ស្វែងរកបទចម្រៀង",
    nav_featured: "បទល្បីៗ",
    nav_promos: "ប្រូម៉ូសិន",
    nav_admin: "ផ្ទាំងគ្រប់គ្រង Admin",
    hero_badge: "ទិញបទចម្រៀងភ្លាមៗ • មិនចាំបាច់ចុះឈ្មោះ Login ឡើយ",
    hero_title: "ស្វែងរក និងទិញបទចម្រៀងពិរោះៗ",
    hero_subtitle: "ទិញបទចម្រៀង Original និងតន្ត្រីគុណភាពខ្ពស់ តាមរយៈ Telegram ផ្ទាល់ ជាមួយការបញ្ចុះតម្លៃពិសេស និងកូដចំណេញប្រាក់។",
    search_placeholder: "ស្វែងរកតាមចំណងជើងបទចម្រៀង ឈ្មោះតារាចម្រៀង ឬប្រភេទភ្លេង...",
    all_genres: "គ្រប់ប្រភេទភ្លេង",
    featured_tracks: "បទចម្រៀងកំពុងពេញនិយម",
    all_tracks: "បញ្ជីបទចម្រៀងទាំងអស់",
    no_tracks_found: "រកមិនឃើញបទចម្រៀងដែលត្រូវនឹងការស្វែងរករបស់អ្នកទេ។",
    play_preview: "ស្ដាប់សាកល្បង",
    pause: "ផ្អាក",
    buy_now: "ទិញឥឡូវនេះ",
    instant_buy: "ទិញតាម Telegram ភ្លាមៗ",
    discount: "បញ្ចុះតម្លៃ",
    price: "តម្លៃ",
    sale_price: "តម្លៃលក់",
    original_price: "តម្លៃដើម",
    order_modal_title: "ការបញ្ជាទិញបទចម្រៀង",
    no_login_banner: "មិនបាច់ចុះឈ្មោះ! ការបញ្ជាទិញរបស់អ្នកនឹងបើកផ្ទាល់ក្នុង Telegram របស់ Admin។",
    apply_code: "ប្រើកូដ",
    applying: "កំពុងត្រួតពិនិត្យ...",
    promo_code_label: "មានកូដបញ្ចុះតម្លៃ (Promo Code)?",
    promo_code_placeholder: "ឧទាហរណ៍៖ KHMER2026",
    promo_discount: "បញ្ចុះតម្លៃតាមកូដ",
    track_discount: "បញ្ចុះតម្លៃប្រចាំបទ",
    total_amount: "តម្លៃសរុបចុងក្រោយ",
    customer_name_placeholder: "ឈ្មោះរបស់អ្នក (មិនបំពេញក៏បាន)",
    customer_telegram_placeholder: "Telegram @ របស់អ្នក (មិនបំពេញក៏បាន)",
    checkout_telegram_btn: "ផ្ញើការបញ្ជាទិញទៅកាន់ Telegram Admin",
    checkout_note: "នៅពេលចុច វានឹងបើក Telegram Chat ជាមួយ Admin ដោយមានព័ត៌មានបទចម្រៀងស្រាប់។",
    aba_checkout_btn: "ទូទាត់ឥឡូវនេះតាម ABA QR (ស្វ័យប្រវត្តិ)",
    aba_telegram_alt: "ឬផ្ញើការបញ្ជាទិញទៅកាន់ Admin តាម Telegram វិញ",
    aba_checkout_title: "ការទូទាត់តាម ABA QR ស្វ័យប្រវត្តិ",
    aba_scan_instruction: "សូមបើកកម្មវិធី ABA Mobile ចុច Scan to Pay ហើយស្កេន QR នេះ។ នៅពេលការទូទាត់ជោគជ័យ បទចម្រៀងនឹងបើកឲ្យទាញយកដោយស្វ័យប្រវត្តិ។",
    aba_amount_to_pay: "ចំនួនត្រូវទូទាត់",
    aba_waiting: "កំពុងរង់ចាំការទូទាត់របស់អ្នក…",
    aba_checking: "កំពុងពិនិត្យស្ថានភាពការទូទាត់…",
    aba_check_now: "ខ្ញុំបានទូទាត់រួច — ពិនិត្យឥឡូវនេះ",
    aba_cancel_pay: "បោះបង់ការទូទាត់",
    aba_paid_title: "ការទូទាត់បានជោគជ័យ! 🎉",
    aba_download_note: "សូមអរគុណសម្រាប់ការទិញ! ការទាញយកនឹងចាប់ផ្ដើមដោយស្វ័យប្រវត្តិ។ ប្រសិនបើមិនចាប់ផ្ដើមទេ សូមចុចប៊ូតុងខាងក្រោម។",
    aba_download_btn: "ទាញយកបទចម្រៀងឥឡូវនេះ",
    aba_invoice_btn: "ទាញយកវិក្កយបត្រ (PDF)",
    aba_scan_with: "ស្កេនជាមួយកម្មវិធី ABA Mobile",
    aba_pay_to: "ទូទាត់ទៅកាន់",
    aba_open_larger: "មើល QR ទំហំធំ",
    aba_meta_transaction: "លេខប្រតិបត្តិការ",
    aba_secure_by: "សុវត្ថិភាពដោយ ABA Pay • ផ្ទៀងផ្ទាត់ដោយបាគង",
    aba_order_ref: "លេខយោងការបញ្ជាទិញ",
    aba_payment_failed: "ការទូទាត់មិនទាន់បានបញ្ជាក់ទេ។ ប្រសិនបើអ្នកបានទូទាត់រួចហើយ សូមទាក់ទង Admin ជាមួយលេខយោងការបញ្ជាទិញ។",
    now_playing: "កំពុងចាក់",
    preview_tag: "សាកល្បងស្ដាប់",
    footer_desc: "ទីផ្សារតន្ត្រីផ្ទាល់ពីសិល្បករសម្រាប់អ្នកស្រឡាញ់តន្ត្រីទូទាំងប្រទេស។",
    footer_rights: "រក្សាសិទ្ធិគ្រប់យ៉ាង។ ទិញភ្លាមៗតាម Telegram។"
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('app_lang') || 'kh';
  });

  useEffect(() => {
    localStorage.setItem('app_lang', lang);
  }, [lang]);

  const toggleLanguage = () => {
    setLang(prev => (prev === 'kh' ? 'en' : 'kh'));
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
