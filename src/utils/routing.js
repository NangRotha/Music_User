// Clean-path routing helpers for the user storefront.
// Valid pages map to clean browser URLs (no hash): '/' | '/products' | '/about'.
export const VALID_PAGES = ['home', 'products', 'about'];

export const PAGE_PATHS = {
  home: '/',
  products: '/products',
  about: '/about',
};

export const PATH_PAGES = {
  '/': 'home',
  '/products': 'products',
  '/about': 'about',
};

// Current location.pathname -> page id ('home' | 'products' | 'about' | 'notfound').
export const pageFromPath = (pathname = window.location.pathname) => {
  const normalized = (pathname || '/').split('?')[0].replace(/\/+$/, '') || '/';
  return PATH_PAGES[normalized] || 'notfound';
};

// Resolve a raw link value (slides / buttons / legacy '#/...' values) into an
// internal page id. Returns null when the link is external or unknown so the
// caller can decide what to do with it.
export const pageFromLink = (linkUrl) => {
  if (!linkUrl) return null;
  const value = String(linkUrl).trim();
  if (!value) return null;
  // External URL (opened in a new tab by the caller).
  if (value.startsWith('http')) return null;

  // Handles legacy '#/', '#/products', '#about', '/products', '/', 'products', 'home', ...
  const route = value
    .replace(/^#\/?/, '') // '#/products' -> 'products', '#/' -> ''
    .replace(/^\//, '')   // '/products' -> 'products'
    .replace(/\/+$/, ''); // strip trailing slashes

  if (route === '' || route === 'home') return 'home';
  return VALID_PAGES.includes(route) ? route : null;
};
