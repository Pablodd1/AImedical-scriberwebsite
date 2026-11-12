import React, { useCallback, useRef } from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
}

/**
 * Refractive Clinical Crystal Glass Card with GPU-friendly cursor spotlight tracking.
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  interactive = true,
  onMouseMove,
  ...rest
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);

  const handlePointerMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (interactive && cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        cardRef.current.style.setProperty('--mx', `${x}px`);
        cardRef.current.style.setProperty('--my', `${y}px`);
      }
      onMouseMove?.(e);
    },
    [interactive, onMouseMove]
  );

  return (
    <div
      ref={cardRef}
      onMouseMove={handlePointerMove}
      className={`${interactive ? 'glass-spotlight-card' : 'glass-surface border border-border-subtle'} rounded-2xl ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};

/**
 * Zero-network-error precision SVG clinical wordmark emblem for AIMS.
 */
export const AimsBrandLogo: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className={className}
  >
    <defs>
      <linearGradient id="aimsCrystalGrad" x1="2" y1="2" x2="34" y2="34" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#14b8a6" />
        <stop offset="55%" stopColor="#0d9488" />
        <stop offset="100%" stopColor="#0284c7" />
      </linearGradient>
    </defs>
    <rect
      x="2"
      y="2"
      width="32"
      height="32"
      rx="9"
      fill="url(#aimsCrystalGrad)"
      fillOpacity="0.16"
      stroke="url(#aimsCrystalGrad)"
      strokeWidth="1.6"
    />
    <path
      d="M7.5 18.5H12.2L14.8 11.5L18.4 24.5L21.5 15.2L23.6 18.5H28.5"
      stroke="url(#aimsCrystalGrad)"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="28.5" cy="18.5" r="2" fill="#14b8a6" />
  </svg>
);
