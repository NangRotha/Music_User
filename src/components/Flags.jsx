import React from 'react';

/**
 * High-quality authentic SVG Flag of Cambodia (ទង់ជាតិកម្ពុជា)
 * Standard proportions: Blue / Red / Blue with white Angkor Wat center
 */
export const CambodiaFlag = ({ className = "w-5 h-3.5" }) => (
  <svg
    viewBox="0 0 640 480"
    className={`inline-block shrink-0 rounded-[2px] shadow-xs overflow-hidden border border-black/10 dark:border-white/10 ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Cambodia Flag"
  >
    {/* Top Blue Stripe (25%) */}
    <rect width="640" height="120" fill="#032ea6" />
    
    {/* Center Red Stripe (50%) */}
    <rect y="120" width="640" height="240" fill="#e00025" />
    
    {/* Bottom Blue Stripe (25%) */}
    <rect y="360" width="640" height="120" fill="#032ea6" />
    
    {/* Angkor Wat White Silhouette */}
    <g fill="#ffffff">
      {/* Base Foundation */}
      <rect x="180" y="325" width="280" height="14" rx="1" />
      <rect x="200" y="305" width="240" height="20" rx="1" />
      <rect x="220" y="275" width="200" height="30" rx="1" />

      {/* Main Central Tower */}
      <path d="M320 150 L334 195 L338 235 L342 275 L298 275 L302 235 L306 195 Z" />
      <polygon points="320,135 315,152 325,152" />
      
      {/* Central Spire Detail */}
      <rect x="316" y="195" width="8" height="80" fill="#e00025" opacity="0.15" />

      {/* Left Tower */}
      <path d="M255 190 L266 220 L270 245 L274 275 L236 275 L240 245 L244 220 Z" />
      <polygon points="255,178 251,192 259,192" />

      {/* Right Tower */}
      <path d="M385 190 L396 220 L400 245 L404 275 L366 275 L370 245 L374 220 Z" />
      <polygon points="385,178 381,192 389,192" />

      {/* Outer Flanking Turrets */}
      <rect x="208" y="245" width="16" height="30" />
      <polygon points="216,233 210,245 222,245" />

      <rect x="416" y="245" width="16" height="30" />
      <polygon points="424,233 418,245 430,245" />

      {/* Pillar colonnade effect on mid base */}
      <rect x="238" y="282" width="6" height="18" fill="#e00025" opacity="0.3" />
      <rect x="268" y="282" width="6" height="18" fill="#e00025" opacity="0.3" />
      <rect x="298" y="282" width="6" height="18" fill="#e00025" opacity="0.3" />
      <rect x="336" y="282" width="6" height="18" fill="#e00025" opacity="0.3" />
      <rect x="366" y="282" width="6" height="18" fill="#e00025" opacity="0.3" />
      <rect x="396" y="282" width="6" height="18" fill="#e00025" opacity="0.3" />
    </g>
  </svg>
);

/**
 * High-quality authentic SVG Flag of United Kingdom / English (Union Jack)
 */
export const EnglishFlag = ({ className = "w-5 h-3.5" }) => (
  <svg
    viewBox="0 0 60 30"
    className={`inline-block shrink-0 rounded-[2px] shadow-xs overflow-hidden border border-black/10 dark:border-white/10 ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    aria-label="English / UK Flag"
  >
    <clipPath id="s">
      <path d="M0,0 v30 h60 v-30 z"/>
    </clipPath>
    <clipPath id="t">
      <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/>
    </clipPath>
    <g clipPath="url(#s)">
      <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
      <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
    </g>
  </svg>
);
