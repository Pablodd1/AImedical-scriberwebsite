import React from 'react';
import { AnimatePresence, motion } from 'motion/react';

interface FieldCheckmarkProps {
  visible: boolean;
  delayIndex?: number;
  className?: string;
  label?: string;
}

/**
 * Subtle GPU-composited SVG check-mark confirmation indicator
 * for form fields after successful submission.
 */
export const FieldCheckmark: React.FC<FieldCheckmarkProps> = ({
  visible,
  delayIndex = 0,
  className = '',
  label = 'Confirmed',
}) => {
  const baseDelay = Math.min(delayIndex * 0.04, 0.28);

  return (
    <AnimatePresence>
      {visible && (
        <motion.span
          initial={{ opacity: 0, scale: 0.72 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{
            duration: 0.18,
            delay: baseDelay,
            ease: [0.16, 1, 0.3, 1],
          }}
          aria-label={label}
          title={label}
          className={`pointer-events-none inline-flex items-center justify-center w-5 h-5 rounded-full bg-alert-success-subtle border border-alert-success/35 text-alert-success shrink-0 ${className}`}
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            className="w-3.5 h-3.5"
            aria-hidden="true"
          >
            <motion.path
              d="M4.5 10.5L8.2 14.2L15.5 6.5"
              stroke="currentColor"
              strokeWidth="2.1"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0.4 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                duration: 0.22,
                delay: baseDelay + 0.04,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
          </svg>
        </motion.span>
      )}
    </AnimatePresence>
  );
};
