'use client';

import { useCallback, useState } from 'react';
import type { SleepOption } from '@/types/calculator.types';

interface ResultCardProps {
  option: SleepOption;
  index: number; // for staggered animation delay
}

/**
 * Single sleep-cycle result card.
 *
 * Visual tiers based on recommendation:
 *   - recommended (5-6 cycles): emerald accent bar + "Best Pick" badge
 *   - normal (4 cycles): violet accent bar
 *   - tooShort (≤3 cycles): muted accent bar + "Short Sleep" badge
 */
export default function ResultCard({ option, index }: ResultCardProps) {
  const [copied, setCopied] = useState(false);

  const accentColor = option.recommended
    ? 'var(--color-accent-emerald)'
    : option.tooShort
      ? 'var(--color-accent-muted)'
      : 'var(--color-accent-violet)';

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(option.time);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API may fail in some contexts — fail silently
    }
  }, [option.time]);

  return (
    <div
      className="glass-card glass-card-hover animate-slide-up flex overflow-hidden"
      style={{
        animationDelay: `${index * 80}ms`,
        opacity: option.tooShort ? 0.6 : 1,
      }}
      role="listitem"
    >
      {/* Left accent bar */}
      <div
        className="w-1 flex-shrink-0 rounded-l-[var(--radius-glass)]"
        style={{ background: accentColor }}
        aria-hidden="true"
      />

      <div className="flex-1 flex items-center justify-between p-4 gap-3">
        {/* Time + label */}
        <div className="flex flex-col gap-1 min-w-0">
          <span
            className="font-semibold tracking-tight leading-none"
            style={{
              fontSize: 'var(--text-result-time)',
              color: option.tooShort
                ? 'var(--color-text-secondary)'
                : 'var(--color-text-primary)',
            }}
          >
            {option.time}
          </span>
          <span
            className="text-sm leading-none"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {option.label}
          </span>
        </div>

        {/* Badge + copy */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {option.recommended && (
            <span className="badge-recommended">Best Pick</span>
          )}
          {option.tooShort && (
            <span className="badge-short">Short</span>
          )}

          <button
            onClick={handleCopy}
            className="p-2 rounded-full transition-colors cursor-pointer"
            style={{
              color: copied
                ? 'var(--color-accent-emerald)'
                : 'var(--color-text-muted)',
              background: copied
                ? 'rgba(52, 211, 153, 0.1)'
                : 'transparent',
            }}
            aria-label={copied ? 'Copied!' : `Copy ${option.time}`}
            title={copied ? 'Copied!' : 'Copy time'}
          >
            {copied ? (
              /* Checkmark icon */
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              /* Copy icon */
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
