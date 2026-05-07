function Logo({ dark = false }) {
  const color = dark ? "#1a1a1a" : "#ffffff";

  return (
    <div className="flex flex-col items-center gap-0.5">
      {/* SVG Icon — T + T monogram with geometric trove chest shape */}
      <svg width="36" height="32" viewBox="0 0 36 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Chest / Trove box shape */}
        <rect x="4" y="12" width="28" height="18" rx="1" stroke={color} strokeWidth="1.4" fill="none"/>
        {/* Lid arc */}
        <path d="M4 12 Q18 2 32 12" stroke={color} strokeWidth="1.4" fill="none"/>
        {/* Center clasp */}
        <rect x="15" y="19" width="6" height="5" rx="0.5" stroke={color} strokeWidth="1.2" fill="none"/>
        {/* Horizontal band */}
        <line x1="4" y1="19" x2="15" y2="19" stroke={color} strokeWidth="1.2"/>
        <line x1="21" y1="19" x2="32" y2="19" stroke={color} strokeWidth="1.2"/>
      </svg>

      {/* Wordmark */}
      <div className="flex flex-col items-center leading-none">
        <span className="font-display text-xl font-light tracking-widest2" style={{color}}> {/* or tracking-[4px] */}
  TrendyTrove
</span>

      </div>
    </div>
  );
}

export default Logo;