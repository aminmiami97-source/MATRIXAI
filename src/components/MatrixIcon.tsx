import React, { useState } from 'react';
import iconImg from '../assets/images/matrix_ai_icon_1791624834529.jpg';

interface MatrixIconProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  glow?: boolean;
}

const sizeMap = {
  xs: 'w-4 h-4',
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
  xl: 'w-12 h-12',
  '2xl': 'w-16 h-16',
};

export const MatrixIcon: React.FC<MatrixIconProps> = ({
  size = 'md',
  className = '',
  glow = false,
}) => {
  const [imgError, setImgError] = useState(false);
  const sizeClass = sizeMap[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-xl overflow-hidden ${sizeClass} ${className} ${
        glow ? 'shadow-[0_0_16px_rgba(0,229,255,0.4)]' : ''
      }`}
    >
      {!imgError ? (
        <img
          src={iconImg}
          alt="matrixAI emblem"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover rounded-xl"
        />
      ) : (
        /* Vector SVG recreation matching reference emblem */
        <div className="w-full h-full bg-gradient-to-br from-[#0B0F19] via-[#0F172A] to-[#1E1B4B] p-1 flex items-center justify-center rounded-xl border border-[#00E5FF]/40 shadow-inner">
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]"
          >
            <defs>
              <linearGradient id="cyanFacet" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00E5FF" />
                <stop offset="100%" stopColor="#0284C7" />
              </linearGradient>
              <linearGradient id="violetFacet" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A855F7" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>
              <linearGradient id="roseFacet" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#E11D48" />
              </linearGradient>
            </defs>
            {/* Constellation lines */}
            <path
              d="M50 15 L22 48 L50 82 L78 48 Z"
              stroke="#00E5FF"
              strokeWidth="1.2"
              strokeOpacity="0.6"
            />
            <path
              d="M15 48 L85 48 M50 10 L50 90"
              stroke="#6366F1"
              strokeWidth="0.8"
              strokeOpacity="0.4"
            />
            {/* Left violet diamond star facet */}
            <polygon points="50,50 20,48 36,32" fill="url(#violetFacet)" opacity="0.9" />
            <polygon points="50,50 20,48 36,66" fill="#4338CA" opacity="0.85" />
            {/* Central cyan/teal top and core facets */}
            <polygon points="50,15 36,36 50,50" fill="url(#cyanFacet)" opacity="0.95" />
            <polygon points="50,15 64,36 50,50" fill="#00E5FF" opacity="0.9" />
            <polygon points="50,85 36,64 50,50" fill="#0EA5E9" opacity="0.85" />
            <polygon points="50,85 64,64 50,50" fill="#0284C7" opacity="0.9" />
            {/* Right rose-gold facet */}
            <polygon points="50,50 80,48 64,32" fill="url(#roseFacet)" opacity="0.9" />
            <polygon points="50,50 80,48 64,66" fill="#B45309" opacity="0.85" />
            {/* Starlight constellation nodes */}
            <circle cx="50" cy="15" r="3" fill="#FFFFFF" />
            <circle cx="50" cy="85" r="2.5" fill="#FFFFFF" />
            <circle cx="20" cy="48" r="2.5" fill="#E0E7FF" />
            <circle cx="80" cy="48" r="2.5" fill="#FEF08A" />
            <circle cx="50" cy="50" r="3.5" fill="#FFFFFF" />
            {/* Sparkles */}
            <path d="M50 44 L51 49 L56 50 L51 51 L50 56 L49 51 L44 50 L49 49 Z" fill="#FFFFFF" />
          </svg>
        </div>
      )}
    </div>
  );
};
