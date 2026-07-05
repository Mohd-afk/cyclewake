export interface SleepOption {
  time: string;           // formatted string e.g. "10:30 PM"
  totalMinutes: number;   // total sleep in minutes
  cycles: number;         // complete 90-min cycles
  hours: number;          // decimal hours (e.g. 7.5)
  label: string;          // "7h 30m · 5 cycles"
  recommended: boolean;   // true for 5-6 cycle options
  tooShort: boolean;      // true if < 3 cycles
}

export interface CalculatorConfig {
  cycleMinutes: number;       // default: 90
  bufferMinutes: number;      // default: 15
  cycleRange: number[];       // default: [3, 4, 5, 6]
  // EXTENSION: personalCycleMinutes?: number;  (from sleep tracker)
  // EXTENSION: smartBufferMinutes?: number;    (from wearable data)
}

export type CalculatorMode = 'wake' | 'bedtime';
