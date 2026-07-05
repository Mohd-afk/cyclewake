'use client';

import { create } from 'zustand';
import type { SleepOption, CalculatorMode } from '@/types/calculator.types';

interface CalculatorState {
  mode: CalculatorMode;
  hour: number;       // 24h format (0-23)
  minute: number;     // 0-59
  results: SleepOption[];
  view: 'input' | 'results';

  setMode: (mode: CalculatorMode) => void;
  setTime: (hour: number, minute: number) => void;
  setResults: (results: SleepOption[]) => void;
  setView: (view: 'input' | 'results') => void;
  reset: () => void;

  // EXTENSION: userId field for linking results to logged-in user
}

export const useCalculatorStore = create<CalculatorState>((set) => ({
  mode: 'wake',
  hour: 7,          // sensible default: 7:00 AM wake time
  minute: 0,
  results: [],
  view: 'input',

  setMode: (mode) => set({ mode, results: [], view: 'input' }),
  setTime: (hour, minute) => set({ hour, minute }),
  setResults: (results) => set({ results }),
  setView: (view) => set({ view }),
  reset: () => set({ results: [], view: 'input' }),
}));
