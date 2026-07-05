/**
 * CycleWake — Sleep Cycle Calculator (Pure Logic)
 *
 * This module contains ALL sleep-cycle arithmetic.
 * It is intentionally framework-free — no React, no DOM, no side effects.
 * This makes it trivially unit-testable and reusable across contexts.
 *
 * Formulas (from docs/features/sleep-cycle-calculator.md):
 *   Bedtime  = WakeTime  - (Cycles × CycleDuration) - FallAsleepBuffer
 *   WakeTime = Bedtime   + (Cycles × CycleDuration) + FallAsleepBuffer
 *
 * All time arithmetic uses "minutes since midnight" (0–1439).
 * Midnight rollover is handled via ((n % 1440) + 1440) % 1440
 * to correctly handle negative values from backwards subtraction.
 */

import type { SleepOption, CalculatorConfig } from '@/types/calculator.types';

// ── Constants ──────────────────────────────────────────────────

const MINUTES_IN_DAY = 1440;

export const DEFAULT_CONFIG: CalculatorConfig = {
  cycleMinutes: 90,
  bufferMinutes: 15,
  cycleRange: [3, 4, 5, 6],
};

// ── Internal Helpers ───────────────────────────────────────────

/**
 * Normalize any minute value into the 0–1439 range.
 * Correctly handles negative values (e.g. -135 → 1305).
 */
function normalizeMinutes(minutes: number): number {
  return ((minutes % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY;
}

/**
 * Convert minutes-since-midnight to 12-hour formatted string.
 *
 * Examples:
 *   0    → "12:00 AM"
 *   720  → "12:00 PM"
 *   780  → "1:00 PM"
 *   1305 → "9:45 PM"
 */
export function formatTime(minutesSinceMidnight: number): string {
  const normalized = normalizeMinutes(minutesSinceMidnight);
  const h24 = Math.floor(normalized / 60);
  const m = normalized % 60;
  const period = h24 >= 12 ? 'PM' : 'AM';
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
}

/**
 * Build a human-readable duration label.
 *
 * Examples:
 *   (450, 5) → "7h 30m · 5 cycles"
 *   (540, 6) → "9h · 6 cycles"
 */
function formatLabel(totalMinutes: number, cycles: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const timeStr = m > 0 ? `${h}h ${m}m` : `${h}h`;
  return `${timeStr} · ${cycles} cycle${cycles !== 1 ? 's' : ''}`;
}

/**
 * Build a single SleepOption from computed values.
 */
function buildOption(
  timeMinutes: number,
  totalSleep: number,
  cycles: number,
): SleepOption {
  return {
    time: formatTime(timeMinutes),
    totalMinutes: totalSleep,
    cycles,
    hours: Math.round((totalSleep / 60) * 100) / 100, // 2 decimal places
    label: formatLabel(totalSleep, cycles),
    recommended: cycles >= 5 && cycles <= 6,
    tooShort: cycles <= 3,
  };
}

/**
 * Validate that hour and minute inputs are usable numbers.
 * Returns false for NaN, Infinity, or out-of-range values.
 */
function isValidInput(hour: number, minute: number): boolean {
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return false;
  if (hour < 0 || hour > 23) return false;
  if (minute < 0 || minute > 59) return false;
  return true;
}

/**
 * Merge user-provided partial config with defaults.
 */
function resolveConfig(config?: Partial<CalculatorConfig>): CalculatorConfig {
  return { ...DEFAULT_CONFIG, ...config };
}

// ── Public API ─────────────────────────────────────────────────

/**
 * Calculate ideal bedtimes for a desired wake-up time.
 *
 * The user wants to wake at (wakeHour:wakeMin).
 * For each cycle count, we subtract (cycles × cycleMinutes + buffer)
 * to find when they should go to bed.
 *
 * @param wakeHour  - Hour in 24h format (0–23)
 * @param wakeMin   - Minute (0–59)
 * @param config    - Optional overrides for cycle length, buffer, range
 * @returns Array of SleepOption objects, one per cycle count
 *
 * EXTENSION: When sleep tracker is built, pass personalised
 *            cycleMinutes derived from the user's actual data.
 */
export function calculateBedtimes(
  wakeHour: number,
  wakeMin: number,
  config?: Partial<CalculatorConfig>,
): SleepOption[] {
  if (!isValidInput(wakeHour, wakeMin)) return [];

  const cfg = resolveConfig(config);
  const wakeMinutes = wakeHour * 60 + wakeMin;

  return cfg.cycleRange.map((cycles) => {
    const totalSleep = cycles * cfg.cycleMinutes;
    const bedtimeMinutes = normalizeMinutes(
      wakeMinutes - totalSleep - cfg.bufferMinutes,
    );
    return buildOption(bedtimeMinutes, totalSleep, cycles);
  });
}

/**
 * Calculate ideal wake-up times for a given bedtime.
 *
 * The user is going to bed at (bedHour:bedMin).
 * For each cycle count, we add (buffer + cycles × cycleMinutes)
 * to find when they should set their alarm.
 *
 * @param bedHour  - Hour in 24h format (0–23)
 * @param bedMin   - Minute (0–59)
 * @param config   - Optional overrides for cycle length, buffer, range
 * @returns Array of SleepOption objects, one per cycle count
 *
 * EXTENSION: When smart alarm is built, pass dynamically
 *            adjusted bufferMinutes from wearable data.
 */
export function calculateWakeTimes(
  bedHour: number,
  bedMin: number,
  config?: Partial<CalculatorConfig>,
): SleepOption[] {
  if (!isValidInput(bedHour, bedMin)) return [];

  const cfg = resolveConfig(config);
  const bedMinutes = bedHour * 60 + bedMin;

  return cfg.cycleRange.map((cycles) => {
    const totalSleep = cycles * cfg.cycleMinutes;
    const wakeMinutes = normalizeMinutes(
      bedMinutes + cfg.bufferMinutes + totalSleep,
    );
    return buildOption(wakeMinutes, totalSleep, cycles);
  });
}
