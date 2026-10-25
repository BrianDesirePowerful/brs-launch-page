export const Logo = ({ className = "h-9 w-9" }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="brs-gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FFF5C0" />
        <stop offset=".45" stopColor="#D4AF37" />
        <stop offset="1" stopColor="#AA771C" />
      </linearGradient>
    </defs>
    <ellipse cx="32" cy="32" rx="27" ry="14" fill="none" stroke="url(#brs-gold)" strokeWidth="1.6" transform="rotate(-18 32 32)" />
    <path d="M32 14L36.41 25.93L49.12 26.44L39.13 34.32L42.58 46.56L32 39.5L21.42 46.56L24.87 34.32L14.88 26.44L27.59 25.93Z" fill="url(#brs-gold)" />
  </svg>
);
