import React from 'react';

interface LogoProps {
  size?: number | string;
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 48, className = '', showText = false }) => {
  const dimension = typeof size === 'number' ? `${size}px` : size;

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div 
        style={{ width: dimension, height: dimension }}
        className="relative shrink-0 rounded-full shadow-md hover:scale-105 transition-transform duration-200"
      >
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full drop-shadow-sm select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Curved paths for text */}
            {/* Top text arc: centered along top */}
            <path
              id="top-arc-text"
              d="M 60,200 A 140,140 0 0,1 340,200"
              fill="none"
            />
            {/* Bottom text arc: centered along bottom */}
            <path
              id="bottom-arc-text"
              d="M 342,200 A 142,142 0 0,1 58,200"
              fill="none"
            />
            <radialGradient id="gold-shine" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" />
            </radialGradient>
            <linearGradient id="wood-pillar" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a16207" />
              <stop offset="50%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#854d0e" />
            </linearGradient>
            <filter id="subtle-shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Outer Ring Border */}
          <circle cx="200" cy="200" r="196" fill="#14532d" stroke="#052e16" strokeWidth="4" />
          
          {/* Inner Circle Border separating green rim from inner arena */}
          <circle cx="200" cy="200" r="148" fill="#ffffff" stroke="#166534" strokeWidth="3" />

          {/* Inner Arena Top Half: Green */}
          <path
            d="M 52,200 A 148,148 0 0,1 348,200 Z"
            fill="#166534"
          />
          {/* Inner Arena Bottom Half: Ivory Cream */}
          <path
            d="M 52,200 A 148,148 0 0,0 348,200 Z"
            fill="#fcfbf7"
          />

          {/* Central Hub / Column */}
          <rect x="180" y="115" width="40" height="170" rx="6" fill="url(#wood-pillar)" />
          <rect x="170" y="112" width="60" height="12" rx="4" fill="#854d0e" />
          <rect x="170" y="276" width="60" height="12" rx="4" fill="#854d0e" />

          {/* Hands Reaching and Clasped in Unity (8 Hands / Arms in circle) */}
          <g filter="url(#subtle-shadow)">
            {/* Arm 1 - Top Left */}
            <g transform="translate(200,200) rotate(-45) translate(-200,-200)">
              {/* Sleeve */}
              <path d="M 125,185 L 155,185 L 155,215 L 125,215 Z" fill="#0d9488" rx="2" />
              {/* Arm/Hand */}
              <path d="M 155,188 L 195,192 L 205,200 L 195,208 L 155,212 Z" fill="#fbcfe8" />
              {/* Thumb */}
              <ellipse cx="178" cy="190" rx="7" ry="4" fill="#f472b6" />
            </g>

            {/* Arm 2 - Top Right */}
            <g transform="translate(200,200) rotate(45) translate(-200,-200)">
              <path d="M 125,185 L 155,185 L 155,215 L 125,215 Z" fill="#f43f5e" rx="2" />
              <path d="M 155,188 L 195,192 L 205,200 L 195,208 L 155,212 Z" fill="#fed7aa" />
              <ellipse cx="178" cy="190" rx="7" ry="4" fill="#fb923c" />
            </g>

            {/* Arm 3 - Bottom Left */}
            <g transform="translate(200,200) rotate(-135) translate(-200,-200)">
              <path d="M 125,185 L 155,185 L 155,215 L 125,215 Z" fill="#fbbf24" rx="2" />
              <path d="M 155,188 L 195,192 L 205,200 L 195,208 L 155,212 Z" fill="#fcd34d" />
              <ellipse cx="178" cy="190" rx="7" ry="4" fill="#f59e0b" />
            </g>

            {/* Arm 4 - Bottom Right */}
            <g transform="translate(200,200) rotate(135) translate(-200,-200)">
              <path d="M 125,185 L 155,185 L 155,215 L 125,215 Z" fill="#059669" rx="2" />
              <path d="M 155,188 L 195,192 L 205,200 L 195,208 L 155,212 Z" fill="#fdba74" />
              <ellipse cx="178" cy="190" rx="7" ry="4" fill="#ea580c" />
            </g>

            {/* Arm 5 - Left */}
            <g transform="translate(200,200) rotate(0) translate(-200,-200)">
              <path d="M 115,185 L 145,185 L 145,215 L 115,215 Z" fill="#eab308" rx="2" />
              <path d="M 145,188 L 190,192 L 200,200 L 190,208 L 145,212 Z" fill="#78350f" />
            </g>

            {/* Arm 6 - Right */}
            <g transform="translate(200,200) rotate(180) translate(-200,-200)">
              <path d="M 115,185 L 145,185 L 145,215 L 115,215 Z" fill="#ca8a04" rx="2" />
              <path d="M 145,188 L 190,192 L 200,200 L 190,208 L 145,212 Z" fill="#451a03" />
            </g>

            {/* Hands Center Touchpoint */}
            <circle cx="200" cy="200" r="14" fill="#b45309" opacity="0.85" />
            <circle cx="200" cy="200" r="7" fill="#fef08a" />
          </g>

          {/* 2025 Pill Badge at Bottom Center */}
          <g filter="url(#subtle-shadow)">
            <rect
              x="154"
              y="294"
              width="92"
              height="30"
              rx="15"
              fill="#064e3b"
              stroke="#fbbf24"
              strokeWidth="2"
            />
            <text
              x="200"
              y="314"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="16"
              fontWeight="bold"
              fontFamily="'Hind Siliguri', sans-serif"
              letterSpacing="2"
            >
              ২০২৫
            </text>
          </g>

          {/* Left & Right Gold Star Separators */}
          {/* Left Star */}
          <g transform="translate(38, 200)">
            <path
              d="M 0,-14 L 4,-4 L 14,0 L 4,4 L 0,14 L -4,4 L -14,0 L -4,-4 Z"
              fill="url(#gold-shine)"
              stroke="#78350f"
              strokeWidth="1"
            />
          </g>
          {/* Right Star */}
          <g transform="translate(362, 200)">
            <path
              d="M 0,-14 L 4,-4 L 14,0 L 4,4 L 0,14 L -4,4 L -14,0 L -4,-4 Z"
              fill="url(#gold-shine)"
              stroke="#78350f"
              strokeWidth="1"
            />
          </g>

          {/* Top Arc Text: ভাই বন্ধু সমবায় সমিতি */}
          <text fill="#ffffff" fontSize="23" fontWeight="bold" fontFamily="'Hind Siliguri', sans-serif" letterSpacing="2">
            <textPath href="#top-arc-text" startOffset="50%" textAnchor="middle">
              ভাই বন্ধু সমবায় সমিতি
            </textPath>
          </text>

          {/* Bottom Arc Text: মধ্য মুজির কান্দি, পাঠান বাজার, মতলব উত্তর, চাঁদপুর। */}
          <text fill="#ffffff" fontSize="13.5" fontWeight="600" fontFamily="'Hind Siliguri', sans-serif" letterSpacing="0.5">
            <textPath href="#bottom-arc-text" startOffset="50%" textAnchor="middle">
              মধ্য মুজির কান্দি, পাঠান বাজার, মতলব উত্তর,চাঁদপুর।
            </textPath>
          </text>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-bold text-lg md:text-xl text-emerald-950 tracking-tight leading-none">
            ভাই-বন্ধু সমবায় সমিতি
          </span>
          <span className="text-xs text-emerald-700 font-medium mt-1">
            মধ্য মুজির কান্দি, মতলব উত্তর, চাঁদপুর
          </span>
        </div>
      )}
    </div>
  );
};
