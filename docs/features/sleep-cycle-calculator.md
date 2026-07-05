# Feature: Sleep Cycle Calculator

## Overview
The core MVP feature of CycleWake. It allows a user to input a desired wake-up time OR current bedtime, and outputs the optimal corresponding times aligned to complete 90-minute sleep cycles.

## Formula
- **Bedtime Mode (User gives Wake Time):**
  `IdealBedtime = WakeTime - (Cycles * CycleDuration) - FallAsleepBuffer`
- **Wake-up Mode (User gives Bedtime):**
  `IdealWakeTime = Bedtime + (Cycles * CycleDuration) + FallAsleepBuffer`

All arithmetic must handle midnight rollovers safely using modulo 1440 (total minutes in a day).

## Default Settings
- **Cycle Length:** 90 minutes.
- **Fall-Asleep Buffer:** 15 minutes.
- **Displayed Options:** 3, 4, 5, and 6 cycles. (3 cycles is flagged as a short sleep option).
- **Recommended Range:** 5 to 6 cycles (7.5 to 9 hours).

## UI Flow
1. **Mode Toggle:** User taps a pill toggle to select "Wake Up At" or "Sleep Now / Bedtime".
2. **Time Selection:** User interacts with a massive, 3-column `DrumPicker` (Hours, Minutes, AM/PM).
3. **Calculate:** User taps the primary 'Calculate' button.
4. **Results View:** The picker slides away, and a vertically scrollable list of `ResultCard` components staggers in.
5. **Card Data:** Each card shows the exact time, the total sleep duration (e.g., "7h 30m"), and the number of cycles. 5 and 6 cycle options are highlighted with a green accent and "Best Pick" badge.
6. **Return:** A back button allows immediate return to the picker to recalculate.

## Edge Cases Handled
- **Midnight Rollover:** Waking up at 1:30 AM means calculating bedtimes in the previous day (e.g., 4:15 PM).
- **Very Short Durations:** If a user calculates a time that results in negative or <3 cycle sleep due to the buffer, flag it as `tooShort: true` so the UI can dim it.
- **Invalid Input:** `NaN` or unselected times must gracefully fall back to returning an empty array without throwing app-breaking errors.

## Component Breakdown
- `ModeToggle.tsx` - Updates global mode state.
- `DrumPicker.tsx` - Emits time changes.
- `calculator.ts` - Pure function isolated in `lib/`.
- `calculatorStore.ts` - Zustand orchestrator bridging inputs and results.
- `ResultList.tsx` & `ResultCard.tsx` - Presentation layer.

## Extension Hooks (For Future Phases)
The `calculator.ts` API takes an optional `config` object. Currently, it defaults to 90m/15m.
- **Hook 1 (Personalized Cycles):** Later, when the Sleep Tracker feature is built, we will read the user's average cycle length from the database and pass `config: { cycleMinutes: 87 }`.
- **Hook 2 (Smart Buffer):** Integration with Apple Health / Google Fit to detect exactly how long a user normally takes to fall asleep, passing `config: { bufferMinutes: 22 }`.
