# 🎵 KhmerBeats - User Music Storefront (ទំព័រអ្នកទិញ)

Modern, high-performance, and mobile-responsive digital music e-commerce storefront for **KhmerBeats**. Features instant zero-registration Telegram checkout, live audio preview player, real-time promo code validation, and full bilingual support (Khmer 🇰🇭 & English 🇬🇧).

---

## ✨ Features

- 🎧 **Interactive Audio Player**: Global floating audio player with playback controls, volume slider, track progress seek bar, and live track info.
- 🇰🇭 **Full Bilingual Support**: Instant toggling between Khmer (ភាសាខ្មែរ) and English with localized UI strings, genres, and track titles.
- 📱 **Instant Telegram Checkout**: Customers can buy music tracks directly through Telegram in one click with auto-generated reference invoices — zero registration or account required.
- 🎟️ **Promo Codes Engine**: Real-time coupon validation supporting percentage discounts, fixed dollar discounts, minimum spend thresholds, and expiry checks.
- 🖼️ **Hero Banner Slider**: Dynamic hero carousel featuring trending tracks, video teasers, and promotional banners.
- 📢 **Announcement Popup Modal**: Customizable promotional popups with badges, links, and auto-expiry logic.
- 🔍 **Search & Category Filters**: Real-time track search by title, artist, genre, and categories.
- 🌓 **Modern Dark / Light Theme**: Premium glassmorphism aesthetics, responsive layouts, and Tailwind CSS v4 styling.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Deployment**: [Vercel](https://vercel.com/) (with `vercel.json` API proxy rewrites)
- **Backend API**: [FastAPI on Render](https://music-backend-7273.onrender.com)

---

## 📁 Project Structure

```
frontend-user/
├── public/                 # Static assets & icons
├── src/
│   ├── assets/             # Images and styles
│   ├── components/         # Reusable UI components
│   │   ├── AboutSection.jsx
│   │   ├── AlertPopupModal.jsx
│   │   ├── BuyModal.jsx        # Telegram checkout & promo modal
│   │   ├── Footer.jsx
│   │   ├── Header.jsx          # Search, language & theme switcher
│   │   ├── HeroBanner.jsx
│   │   ├── MediaSlider.jsx     # Banner carousel
│   │   ├── MusicCard.jsx       # Individual song card & preview trigger
│   │   └── Player.jsx          # Persistent global audio player
│   ├── config/
│   │   └── api.js              # Centralized API configuration & media helper
│   ├── context/
│   │   ├── LanguageContext.jsx # Bilingual state management (EN / KH)
│   │   ├── PlayerContext.jsx   # Audio playback state management
│   │   └── ThemeContext.jsx    # Dark/light theme state
│   ├── App.jsx                 # Main application component & catalog
│   ├── index.css               # Tailwind CSS v4 styles
│   └── main.jsx                # React DOM entry point
├── .env.example            # Template for environment variables
├── .env.production         # Production environment settings
├── package.json
├── vercel.json             # Vercel proxy & SPA rewrite configuration
└── vite.config.js          # Vite bundler configuration
```

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)

### 2. Installation
```bash
# Navigate to the frontend-user folder
cd frontend-user

# Install dependencies
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

> 💡 **Tip**: When running locally, Vite automatically proxies `/api` and `/uploads` requests to `http://localhost:8000` (or `VITE_BACKEND_URL`).

---

## ⚙️ Environment Variables

Create a `.env` file in `frontend-user/` (or configure these in Vercel):

```env
# Backend API Base URL (default is /api when using Vercel rewrites)
VITE_API_BASE_URL=/api

# Live Backend Server URL
VITE_BACKEND_URL=https://music-backend-7273.onrender.com

# Default Site Metadata
VITE_SITE_DEFAULT_TITLE=KhmerBeats - Music Store
VITE_DEFAULT_LANGUAGE=kh
```

---

## 🚢 Deploying to Vercel

This storefront is pre-configured with `vercel.json` to automatically proxy all API and media calls directly to your Render backend:

1. Push your code to **GitHub**.
2. In [Vercel Dashboard](https://vercel.com/dashboard), click **Add New...** → **Project**.
3. Import your repository.
4. Set **Root Directory** to:
   ```
   frontend-user
   ```
5. Add the Environment Variables:
   - `VITE_API_BASE_URL`: `/api`
   - `VITE_BACKEND_URL`: `https://music-backend-7273.onrender.com`
   - `VITE_SITE_DEFAULT_TITLE`: `KhmerBeats - Music Store`
   - `VITE_DEFAULT_LANGUAGE`: `kh`
6. Click **Deploy**!

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts Vite local development server on port 5173 |
| `npm run build` | Compiles optimized production bundle into `dist/` |
| `npm run preview` | Previews production build locally |
| `npm run lint` | Runs Oxlint linter check |
