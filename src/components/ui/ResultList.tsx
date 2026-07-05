'use client';

import type { SleepOption } from '@/types/calculator.types';
import type { CalculatorMode } from '@/types/calculator.types';
import ResultCard from './ResultCard';

interface ResultListProps {
  results: SleepOption[];
  mode: CalculatorMode;
}

/**
 * Animated list of ResultCards.
 * Cards stagger in from bottom via animation-delay.
 */
export default function ResultList({ results, mode }: ResultListProps) {
  if (results.length === 0) return null;

  const heading =
    mode === 'wake'
      ? 'Go to bed at…'
      : 'Set your alarm for…';

  const subheading =
    mode === 'wake'
      ? 'These bedtimes let you wake up between complete sleep cycles.'
      : 'These alarm times catch you between sleep cycles for easier waking.';

  return (
    <section
      className="flex flex-col gap-3 w-full max-w-sm mx-auto animate-fade-in"
      role="list"
      aria-label="Sleep cycle results"
    >
      {/* Heading */}
      <div className="text-center mb-2">
        <h2
          className="font-semibold text-lg"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {heading}
        </h2>
        <p
          className="text-sm mt-1"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {subheading}
        </p>
      </div>

      {/* Cards — reversed so best options (most cycles) appear first */}
      {[...results].reverse().map((option, i) => (
        <ResultCard key={option.cycles} option={option} index={i} />
      ))}
    </section>
  );
}
