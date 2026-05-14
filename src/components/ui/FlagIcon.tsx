import React from "react";

export const FLAGS: Record<string, React.ReactNode> = {
  BD: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 12" className="w-full h-full">
      <rect width="20" height="12" fill="#006a4e" />
      <circle cx="9" cy="6" r="4" fill="#f42a41" />
    </svg>
  ),
  US: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 12" className="w-full h-full">
      <rect width="20" height="12" fill="#b22234" />
      <path d="M0,2H20M0,4H20M0,6H20M0,8H20M0,10H20" stroke="#fff" strokeWidth="1" />
      <rect width="8" height="6" fill="#3c3b6e" />
      <path d="M1,1h.5M2,1h.5M3,1h.5M4,1h.5M5,1h.5M6,1h.5M7,1h.5M1,2h.5M2,2h.5M3,2h.5M4,2h.5M5,2h.5M6,2h.5M7,2h.5M1,3h.5M2,3h.5M3,3h.5M4,3h.5M5,3h.5M6,3h.5M7,3h.5M1,4h.5M2,4h.5M3,4h.5M4,4h.5M5,4h.5M6,4h.5M7,4h.5M1,5h.5M2,5h.5M3,5h.5M4,5h.5M5,5h.5M6,5h.5M7,5h.5" stroke="#fff" strokeWidth="0.5" strokeLinecap="round" />
    </svg>
  ),
  UK: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className="w-full h-full">
      <clipPath id="t">
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <path d="M0,0 v30 h60 v-30 z" fill="#00247d" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#cf142b" strokeWidth="4" />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#cf142b" strokeWidth="6" />
    </svg>
  ),
  IN: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 12" className="w-full h-full">
      <rect width="20" height="4" y="0" fill="#ff9933" />
      <rect width="20" height="4" y="4" fill="#ffffff" />
      <rect width="20" height="4" y="8" fill="#138808" />
      <circle cx="10" cy="6" r="1.5" fill="none" stroke="#000080" strokeWidth="0.5" />
    </svg>
  ),
  PK: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 12" className="w-full h-full">
      <rect width="20" height="12" fill="#115740" />
      <rect width="5" height="12" fill="#ffffff" />
      <path d="M10,3.5 A2.5,2.5 0 1,1 10,8.5 A3,3 0 1,0 10,3.5 M11.5,5 L12,6.5 L10.5,6.5 L11.5,5" fill="#ffffff" />
    </svg>
  ),
  CN: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 12" className="w-full h-full">
      <rect width="20" height="12" fill="#de2910" />
      <path d="M3,3 l1,0.5 l-1,0.5 l0.5,-1 l0.5,1 z M6,2 l0.5,0.25 l-0.5,0.25 l0.25,-0.5 l0.25,0.5 z M7,4 l0.5,0.25 l-0.5,0.25 l0.25,-0.5 l0.25,0.5 z M7,6 l0.5,0.25 l-0.5,0.25 l0.25,-0.5 l0.25,0.5 z M6,8 l0.5,0.25 l-0.5,0.25 l0.25,-0.5 l0.25,0.5 z" fill="#ffde00" />
    </svg>
  ),
  JP: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 12" className="w-full h-full">
      <rect width="20" height="12" fill="#ffffff" />
      <circle cx="10" cy="6" r="3.5" fill="#bc002d" />
    </svg>
  ),
  TH: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 12" className="w-full h-full">
      <rect width="20" height="12" fill="#f4f5f8" />
      <rect width="20" height="2" y="0" fill="#ed1c24" />
      <rect width="20" height="2" y="10" fill="#ed1c24" />
      <rect width="20" height="4" y="4" fill="#241d4f" />
    </svg>
  ),
  MY: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 14" className="w-full h-full">
      <rect width="28" height="14" fill="#cc0001" />
      <path d="M0,1h28M0,3h28M0,5h28M0,7h28M0,9h28M0,11h28M0,13h28" stroke="#fff" strokeWidth="1" />
      <rect width="14" height="8" fill="#010066" />
      <circle cx="6" cy="4" r="2.5" fill="#fc0" />
      <circle cx="7" cy="4" r="2.2" fill="#010066" />
      <path d="M8.5,4 l-0.5,-0.2 l0.2,-0.5 l-0.5,0.2 l-0.2,-0.5 l-0.2,0.5 l-0.5,-0.2 l0.2,0.5 l-0.5,0.2 l0.5,0.2 l-0.2,0.5 l0.5,-0.2 l0.2,0.5 l0.2,-0.5 l0.5,0.2 l-0.2,-0.5 z" fill="#fc0" transform="translate(-1.5,0) scale(0.8)" />
    </svg>
  ),
  BE: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 12" className="w-full h-full">
      <rect width="5" height="12" x="0" fill="#000000" />
      <rect width="5" height="12" x="5" fill="#fdd216" />
      <rect width="5" height="12" x="10" fill="#ef3340" />
    </svg>
  ),
  BT: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 12" className="w-full h-full">
      <path d="M0,12 L20,0 H20 V12 Z" fill="#ff4e12" />
      <path d="M0,12 L20,0 H0 V0 Z" fill="#ffd520" />
      {/* Simplified Dragon (White) */}
      <path d="M8,8 c1,-1 2,-1 3,0 s1,2 0,3 s-2,1 -3,0" fill="none" stroke="#fff" strokeWidth="1" />
    </svg>
  ),
  DEFAULT: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 12" className="w-full h-full bg-slate-200">
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="6" fill="#94a3b8">?</text>
    </svg>
  )
};

export function FlagIcon({ code, className }: { code: string; className?: string }) {
  const flag = FLAGS[code.toUpperCase()] || FLAGS.DEFAULT;
  return <div className={`overflow-hidden ${className}`}>{flag}</div>;
}
