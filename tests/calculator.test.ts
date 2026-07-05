/**
 * CycleWake — Calculator Unit Tests
 *
 * These tests verify every edge case documented in
 * docs/features/sleep-cycle-calculator.md:
 *   - Standard wake/bedtime calculations
 *   - Midnight rollover (both directions)
 *   - Fall-asleep buffer always subtracted/added
 *   - Recommended flag on 5–6 cycle options
 *   - Too-short flag on ≤3 cycle options
 *   - Custom config overrides
 *   - Invalid/NaN input graceful handling
 *   - formatTime correctness at boundary times
 */

import { describe, it, expect } from 'vitest';
import {
  calculateBedtimes,
  calculateWakeTimes,
  formatTime,
  DEFAULT_CONFIG,
} from '@/lib/calculator';

// ── Helper to extract just the time strings for quick assertions ──

function times(options: ReturnType<typeof calculateBedtimes>): string[] {
  return options.map((o) => o.time);
}

// ================================================================
// formatTime — boundary and edge cases
// ================================================================

describe('formatTime', () => {
  it('formats midnight (0 min) as 12:00 AM', () => {
    expect(formatTime(0)).toBe('12:00 AM');
  });

  it('formats noon (720 min) as 12:00 PM', () => {
    expect(formatTime(720)).toBe('12:00 PM');
  });

  it('formats 1:00 AM (60 min) correctly', () => {
    expect(formatTime(60)).toBe('1:00 AM');
  });

  it('formats 1:00 PM (780 min) correctly', () => {
    expect(formatTime(780)).toBe('1:00 PM');
  });

  it('formats 11:59 PM (1439 min) correctly', () => {
    expect(formatTime(1439)).toBe('11:59 PM');
  });

  it('formats 12:01 AM (1 min) correctly', () => {
    expect(formatTime(1)).toBe('12:01 AM');
  });

  it('normalizes negative minutes via modulo', () => {
    // -135 → 1440 - 135 = 1305 → 21:45 → 9:45 PM
    expect(formatTime(-135)).toBe('9:45 PM');
  });

  it('normalizes values exceeding 1440', () => {
    // 1500 → 1500 - 1440 = 60 → 1:00 AM
    expect(formatTime(1500)).toBe('1:00 AM');
  });
});

// ================================================================
// calculateBedtimes — "I want to wake up at ___"
// ================================================================

describe('calculateBedtimes', () => {
  it('wake_basic: 7:00 AM → correct bedtimes for 3,4,5,6 cycles', () => {
    // Manual math:
    //   wakeMin = 420
    //   6c: 420 - 540 - 15 = -135 → 1305 → 9:45 PM
    //   5c: 420 - 450 - 15 =  -45 → 1395 → 11:15 PM
    //   4c: 420 - 360 - 15 =   45 → 12:45 AM
    //   3c: 420 - 270 - 15 =  135 → 2:15 AM
    const results = calculateBedtimes(7, 0);

    expect(results).toHaveLength(4);
    expect(times(results)).toEqual([
      '2:15 AM',   // 3 cycles
      '12:45 AM',  // 4 cycles
      '11:15 PM',  // 5 cycles
      '9:45 PM',   // 6 cycles
    ]);
  });

  it('returns correct total sleep minutes (buffer excluded from sleep)', () => {
    const results = calculateBedtimes(7, 0);

    // totalMinutes = cycles × 90 (buffer is NOT sleep time)
    expect(results[0].totalMinutes).toBe(270);  // 3 × 90
    expect(results[1].totalMinutes).toBe(360);  // 4 × 90
    expect(results[2].totalMinutes).toBe(450);  // 5 × 90
    expect(results[3].totalMinutes).toBe(540);  // 6 × 90
  });

  it('returns correct decimal hours', () => {
    const results = calculateBedtimes(7, 0);
    expect(results[0].hours).toBe(4.5);   // 270 / 60
    expect(results[1].hours).toBe(6);     // 360 / 60
    expect(results[2].hours).toBe(7.5);   // 450 / 60
    expect(results[3].hours).toBe(9);     // 540 / 60
  });

  it('returns correct labels', () => {
    const results = calculateBedtimes(7, 0);
    expect(results[0].label).toBe('4h 30m · 3 cycles');
    expect(results[1].label).toBe('6h · 4 cycles');
    expect(results[2].label).toBe('7h 30m · 5 cycles');
    expect(results[3].label).toBe('9h · 6 cycles');
  });

  it('midnight_rollover: wake 1:30 AM → bedtimes cross midnight correctly', () => {
    // wakeMin = 90
    //   6c: 90 - 540 - 15 = -465 → 975  → 4:15 PM
    //   5c: 90 - 450 - 15 = -375 → 1065 → 5:45 PM
    //   4c: 90 - 360 - 15 = -285 → 1155 → 7:15 PM
    //   3c: 90 - 270 - 15 = -195 → 1245 → 8:45 PM
    const results = calculateBedtimes(1, 30);

    expect(times(results)).toEqual([
      '8:45 PM',  // 3 cycles
      '7:15 PM',  // 4 cycles
      '5:45 PM',  // 5 cycles
      '4:15 PM',  // 6 cycles
    ]);
  });

  it('wake at midnight (0:00) works', () => {
    // wakeMin = 0
    //   6c: 0 - 540 - 15 = -555 → 885  → 2:45 PM
    //   5c: 0 - 450 - 15 = -465 → 975  → 4:15 PM
    //   4c: 0 - 360 - 15 = -375 → 1065 → 5:45 PM
    //   3c: 0 - 270 - 15 = -285 → 1155 → 7:15 PM
    const results = calculateBedtimes(0, 0);
    expect(results).toHaveLength(4);
    expect(times(results)).toEqual([
      '7:15 PM',
      '5:45 PM',
      '4:15 PM',
      '2:45 PM',
    ]);
  });

  it('wake at noon (12:00) works', () => {
    // wakeMin = 720
    //   6c: 720 - 540 - 15 = 165  → 2:45 AM
    //   5c: 720 - 450 - 15 = 255  → 4:15 AM
    //   4c: 720 - 360 - 15 = 345  → 5:45 AM
    //   3c: 720 - 270 - 15 = 435  → 7:15 AM
    const results = calculateBedtimes(12, 0);
    expect(times(results)).toEqual([
      '7:15 AM',
      '5:45 AM',
      '4:15 AM',
      '2:45 AM',
    ]);
  });
});

// ================================================================
// calculateWakeTimes — "I'm going to bed at ___"
// ================================================================

describe('calculateWakeTimes', () => {
  it('bedtime_basic: 11:00 PM → correct wake times for 3,4,5,6 cycles', () => {
    // bedMin = 1380
    //   3c: 1380 + 15 + 270 = 1665 → 225  → 3:45 AM
    //   4c: 1380 + 15 + 360 = 1755 → 315  → 5:15 AM
    //   5c: 1380 + 15 + 450 = 1845 → 405  → 6:45 AM
    //   6c: 1380 + 15 + 540 = 1935 → 495  → 8:15 AM
    const results = calculateWakeTimes(23, 0);

    expect(results).toHaveLength(4);
    expect(times(results)).toEqual([
      '3:45 AM',   // 3 cycles
      '5:15 AM',   // 4 cycles
      '6:45 AM',   // 5 cycles
      '8:15 AM',   // 6 cycles
    ]);
  });

  it('returns correct total sleep minutes', () => {
    const results = calculateWakeTimes(23, 0);
    expect(results[0].totalMinutes).toBe(270);
    expect(results[3].totalMinutes).toBe(540);
  });

  it('bedtime midnight rollover: bed at 1:00 AM → wake times wrap correctly', () => {
    // bedMin = 60
    //   3c: 60 + 15 + 270 = 345  → 5:45 AM
    //   4c: 60 + 15 + 360 = 435  → 7:15 AM
    //   5c: 60 + 15 + 450 = 525  → 8:45 AM
    //   6c: 60 + 15 + 540 = 615  → 10:15 AM
    const results = calculateWakeTimes(1, 0);

    expect(times(results)).toEqual([
      '5:45 AM',
      '7:15 AM',
      '8:45 AM',
      '10:15 AM',
    ]);
  });

  it('bedtime at noon produces afternoon/evening wake times', () => {
    // bedMin = 720
    //   3c: 720 + 15 + 270 = 1005 → 4:45 PM
    //   4c: 720 + 15 + 360 = 1095 → 6:15 PM
    //   5c: 720 + 15 + 450 = 1185 → 7:45 PM
    //   6c: 720 + 15 + 540 = 1275 → 9:15 PM
    const results = calculateWakeTimes(12, 0);
    expect(times(results)).toEqual([
      '4:45 PM',
      '6:15 PM',
      '7:45 PM',
      '9:15 PM',
    ]);
  });

  it('late bedtime wraps 6-cycle wake past midnight', () => {
    // bedMin = 22 * 60 + 30 = 1350
    //   6c: 1350 + 15 + 540 = 1905 → 465 → 7:45 AM
    const results = calculateWakeTimes(22, 30);
    expect(results[3].time).toBe('7:45 AM');
  });
});

// ================================================================
// Buffer is always accounted for
// ================================================================

describe('buffer handling', () => {
  it('buffer_always_subtracted: bedtime is 15 min earlier than pure cycle math', () => {
    // Wake at 7:00 AM, 5 cycles, NO buffer
    const noBuf = calculateBedtimes(7, 0, { bufferMinutes: 0 });
    // Wake at 7:00 AM, 5 cycles, WITH buffer (default 15)
    const withBuf = calculateBedtimes(7, 0);

    // The 5-cycle option (index 2):
    // No buffer: 420 - 450 = -30 → 1410 → 11:30 PM
    // With buffer: 420 - 450 - 15 = -45 → 1395 → 11:15 PM
    expect(noBuf[2].time).toBe('11:30 PM');
    expect(withBuf[2].time).toBe('11:15 PM');
  });

  it('buffer_always_added: wake time is 15 min later than pure cycle math', () => {
    // Bed at 11:00 PM, 5 cycles, NO buffer
    const noBuf = calculateWakeTimes(23, 0, { bufferMinutes: 0 });
    // Bed at 11:00 PM, 5 cycles, WITH buffer (default 15)
    const withBuf = calculateWakeTimes(23, 0);

    // 5-cycle (index 2):
    // No buffer: 1380 + 450 = 1830 → 390 → 6:30 AM
    // With buffer: 1380 + 15 + 450 = 1845 → 405 → 6:45 AM
    expect(noBuf[2].time).toBe('6:30 AM');
    expect(withBuf[2].time).toBe('6:45 AM');
  });

  it('zero buffer means sleep total equals exactly cycles × cycleMinutes', () => {
    const results = calculateBedtimes(7, 0, { bufferMinutes: 0 });
    // 5 cycles with 0 buffer → bed at 11:30 PM
    // totalMinutes should still be 450 (buffer doesn't affect totalMinutes)
    expect(results[2].totalMinutes).toBe(450);
  });
});

// ================================================================
// Recommended & tooShort flags
// ================================================================

describe('recommended and tooShort flags', () => {
  it('recommended_flag: 5 and 6 cycles are recommended', () => {
    const results = calculateBedtimes(7, 0);

    expect(results[0].recommended).toBe(false); // 3 cycles
    expect(results[1].recommended).toBe(false); // 4 cycles
    expect(results[2].recommended).toBe(true);  // 5 cycles ✓
    expect(results[3].recommended).toBe(true);  // 6 cycles ✓
  });

  it('tooShort_flag: 3 cycles or fewer are flagged as too short', () => {
    const results = calculateBedtimes(7, 0);

    expect(results[0].tooShort).toBe(true);   // 3 cycles ✓
    expect(results[1].tooShort).toBe(false);  // 4 cycles
    expect(results[2].tooShort).toBe(false);  // 5 cycles
    expect(results[3].tooShort).toBe(false);  // 6 cycles
  });

  it('works the same for wake time calculations', () => {
    const results = calculateWakeTimes(23, 0);

    expect(results[0].tooShort).toBe(true);    // 3 cycles
    expect(results[2].recommended).toBe(true); // 5 cycles
    expect(results[3].recommended).toBe(true); // 6 cycles
  });

  it('2 cycles are also flagged as too short with custom range', () => {
    const results = calculateBedtimes(7, 0, {
      cycleRange: [2, 3, 4, 5, 6],
    });

    expect(results[0].tooShort).toBe(true);  // 2 cycles
    expect(results[1].tooShort).toBe(true);  // 3 cycles
    expect(results[2].tooShort).toBe(false); // 4 cycles
  });
});

// ================================================================
// Custom config overrides
// ================================================================

describe('custom config', () => {
  it('custom_config: cycleMinutes=100, bufferMinutes=20 produces correct results', () => {
    // Wake at 8:00 AM (480 min)
    // 5 cycles: 480 - (5 × 100) - 20 = 480 - 500 - 20 = -40 → 1400 → 23:20 → 11:20 PM
    const results = calculateBedtimes(8, 0, {
      cycleMinutes: 100,
      bufferMinutes: 20,
    });

    const fiveCycle = results.find((r) => r.cycles === 5)!;
    expect(fiveCycle.time).toBe('11:20 PM');
    expect(fiveCycle.totalMinutes).toBe(500); // 5 × 100
    expect(fiveCycle.hours).toBeCloseTo(8.33, 1);
  });

  it('custom cycleRange: only [5, 6] returns 2 options', () => {
    const results = calculateBedtimes(7, 0, { cycleRange: [5, 6] });
    expect(results).toHaveLength(2);
    expect(results[0].cycles).toBe(5);
    expect(results[1].cycles).toBe(6);
  });

  it('custom bufferMinutes=0 works correctly', () => {
    // Wake 6:00 AM, 5 cycles, buffer=0
    // 360 - 450 - 0 = -90 → 1350 → 10:30 PM
    const results = calculateBedtimes(6, 0, { bufferMinutes: 0 });
    const fiveCycle = results.find((r) => r.cycles === 5)!;
    expect(fiveCycle.time).toBe('10:30 PM');
  });

  it('single-cycle config works', () => {
    const results = calculateWakeTimes(23, 0, { cycleRange: [1] });
    expect(results).toHaveLength(1);
    expect(results[0].cycles).toBe(1);
    // 1380 + 15 + 90 = 1485 → 45 → 12:45 AM
    expect(results[0].time).toBe('12:45 AM');
    expect(results[0].totalMinutes).toBe(90);
  });
});

// ================================================================
// Invalid input handling
// ================================================================

describe('invalid input', () => {
  it('NaN hour returns empty array', () => {
    expect(calculateBedtimes(NaN, 0)).toEqual([]);
    expect(calculateWakeTimes(NaN, 30)).toEqual([]);
  });

  it('NaN minute returns empty array', () => {
    expect(calculateBedtimes(7, NaN)).toEqual([]);
    expect(calculateWakeTimes(23, NaN)).toEqual([]);
  });

  it('Infinity returns empty array', () => {
    expect(calculateBedtimes(Infinity, 0)).toEqual([]);
    expect(calculateWakeTimes(-Infinity, 0)).toEqual([]);
  });

  it('negative hour returns empty array', () => {
    expect(calculateBedtimes(-1, 0)).toEqual([]);
  });

  it('hour > 23 returns empty array', () => {
    expect(calculateBedtimes(24, 0)).toEqual([]);
  });

  it('minute > 59 returns empty array', () => {
    expect(calculateBedtimes(7, 60)).toEqual([]);
  });

  it('negative minute returns empty array', () => {
    expect(calculateWakeTimes(23, -1)).toEqual([]);
  });

  it('does not throw on any invalid input', () => {
    expect(() => calculateBedtimes(NaN, NaN)).not.toThrow();
    expect(() => calculateWakeTimes(NaN, NaN)).not.toThrow();
    expect(() => calculateBedtimes(999, 999)).not.toThrow();
    expect(() => calculateWakeTimes(-100, -100)).not.toThrow();
  });
});

// ================================================================
// DEFAULT_CONFIG export
// ================================================================

describe('DEFAULT_CONFIG', () => {
  it('has the documented default values', () => {
    expect(DEFAULT_CONFIG.cycleMinutes).toBe(90);
    expect(DEFAULT_CONFIG.bufferMinutes).toBe(15);
    expect(DEFAULT_CONFIG.cycleRange).toEqual([3, 4, 5, 6]);
  });
});
