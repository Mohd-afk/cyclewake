'use client';

import { useCallback } from 'react';
import { useCalculatorStore } from '@/store/calculatorStore';
import { calculateBedtimes, calculateWakeTimes } from '@/lib/calculator';

/**
 * Hook that bridges the Zustand store and the pure calculator logic.
 * Components call `calculate()` — the hook reads mode + time from
 * the store, runs the right function, and pushes results back.
 */
export function useCalculator() {
  const mode = useCalculatorStore((s) => s.mode);
  const hour = useCalculatorStore((s) => s.hour);
  const minute = useCalculatorStore((s) => s.minute);
  const results = useCalculatorStore((s) => s.results);
  const view = useCalculatorStore((s) => s.view);
  const setResults = useCalculatorStore((s) => s.setResults);
  const setView = useCalculatorStore((s) => s.setView);

  const calculate = useCallback(() => {
    const fn = mode === 'wake' ? calculateBedtimes : calculateWakeTimes;
    const options = fn(hour, minute);
    setResults(options);
    setView('results');
  }, [mode, hour, minute, setResults, setView]);

  const goBack = useCallback(() => {
    setView('input');
  }, [setView]);

  return { results, view, calculate, goBack, mode };
}
