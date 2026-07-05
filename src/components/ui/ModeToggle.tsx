'use client';

import { useCalculatorStore } from '@/store/calculatorStore';
import type { CalculatorMode } from '@/types/calculator.types';

/**
 * Pill-shaped toggle: "Wake Up At" ↔ "Sleep Now"
 * Animated sliding indicator follows the active mode.
 */
export default function ModeToggle() {
  const mode = useCalculatorStore((s) => s.mode);
  const setMode = useCalculatorStore((s) => s.setMode);

  const options: { value: CalculatorMode; label: string; icon: string }[] = [
    { value: 'wake', label: 'Wake Up At', icon: '☀️' },
    { value: 'bedtime', label: 'Sleep Now', icon: '🌙' },
  ];

  return (
    <div
      className="relative flex glass-card p-1 w-full max-w-sm mx-auto"
      role="radiogroup"
      aria-label="Calculator mode"
    >
      {/* Sliding indicator — moves via translateX */}
      <div
        className="absolute top-1 bottom-1 rounded-[var(--radius-pill)] transition-transform"
        style={{
          width: 'calc(50% - 4px)',
          transform: mode === 'wake' ? 'translateX(0)' : 'translateX(calc(100% + 8px))',
          background: 'var(--color-glass-bg-pressed)',
          border: '1px solid var(--color-accent-violet-glow)',
          boxShadow: 'var(--shadow-glow-violet)',
          transitionDuration: 'var(--duration-base)',
          transitionTimingFunction: 'var(--ease-fluid)',
        }}
      />

      {options.map(({ value, label, icon }) => (
        <button
          key={value}
          role="radio"
          aria-checked={mode === value}
          onClick={() => setMode(value)}
          className="relative z-10 flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-[var(--radius-pill)] text-sm font-medium transition-colors cursor-pointer"
          style={{
            color: mode === value
              ? 'var(--color-accent-violet)'
              : 'var(--color-text-secondary)',
            transitionDuration: 'var(--duration-base)',
          }}
        >
          <span aria-hidden="true">{icon}</span>
          {label}
        </button>
      ))}
    </div>
  );
}
