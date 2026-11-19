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

export const AimsBrandLogo: React.FC<{ className?: string }> = ({ className = 'h-10' }) => (
  <img
    src="/aims-logo.webp"
    alt=""
    width={276}
    height={235}
    className={`w-auto shrink-0 object-contain ${className}`}
  />
);
