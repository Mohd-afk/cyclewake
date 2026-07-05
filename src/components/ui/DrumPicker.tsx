'use client';

import {
  useRef,
  useEffect,
  useCallback,
  useState,
  type ReactNode,
} from 'react';
import { useCalculatorStore } from '@/store/calculatorStore';

// ── Constants ──────────────────────────────────────────────────

const ITEM_HEIGHT = 56;   // px — matches WCAG min tap target
const VISIBLE_COUNT = 5;  // show 5 rows, center is selected
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_COUNT;
const PAD_ITEMS = Math.floor(VISIBLE_COUNT / 2); // 2 spacer items top+bottom

// ── 12h ↔ 24h conversions ──────────────────────────────────────

function to12h(h24: number): { h12: number; period: 'AM' | 'PM' } {
  const period: 'AM' | 'PM' = h24 >= 12 ? 'PM' : 'AM';
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return { h12, period };
}

function to24h(h12: number, period: 'AM' | 'PM'): number {
  if (period === 'AM') return h12 === 12 ? 0 : h12;
  return h12 === 12 ? 12 : h12 + 12;
}

// ── DrumColumn ─────────────────────────────────────────────────

interface DrumColumnProps {
  items: (string | number)[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  formatItem?: (item: string | number) => ReactNode;
  label: string; // ARIA label
}

function DrumColumn({
  items,
  selectedIndex,
  onSelect,
  formatItem,
  label,
}: DrumColumnProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(false);

  // Scroll to selected item on mount
  useEffect(() => {
    if (scrollRef.current && !mountedRef.current) {
      scrollRef.current.scrollTop = selectedIndex * ITEM_HEIGHT;
      mountedRef.current = true;
    }
  }, [selectedIndex]);

  // Detect which item is centered after scrolling stops
  const detectSelection = useCallback(() => {
    if (!scrollRef.current) return;
    const idx = Math.round(scrollRef.current.scrollTop / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(items.length - 1, idx));
    if (clamped !== selectedIndex) {
      onSelect(clamped);
    }
    isScrollingRef.current = false;
  }, [items.length, selectedIndex, onSelect]);

  // Debounced scroll-end detection
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      isScrollingRef.current = true;
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(detectSelection, 80);
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, [detectSelection]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowUp' && selectedIndex > 0) {
        e.preventDefault();
        const newIdx = selectedIndex - 1;
        onSelect(newIdx);
        scrollRef.current?.scrollTo({
          top: newIdx * ITEM_HEIGHT,
          behavior: 'smooth',
        });
      }
      if (e.key === 'ArrowDown' && selectedIndex < items.length - 1) {
        e.preventDefault();
        const newIdx = selectedIndex + 1;
        onSelect(newIdx);
        scrollRef.current?.scrollTo({
          top: newIdx * ITEM_HEIGHT,
          behavior: 'smooth',
        });
      }
    },
    [selectedIndex, items.length, onSelect],
  );

  // Tap-to-select an item
  const handleItemClick = useCallback(
    (index: number) => {
      if (isScrollingRef.current) return;
      onSelect(index);
      scrollRef.current?.scrollTo({
        top: index * ITEM_HEIGHT,
        behavior: 'smooth',
      });
    },
    [onSelect],
  );

  const defaultFormat = (item: string | number) => String(item);
  const format = formatItem || defaultFormat;

  return (
    <div
      className="drum-column-wrapper relative"
      role="listbox"
      aria-label={label}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="drum-column"
        style={{ height: CONTAINER_HEIGHT }}
      >
        {/* Top spacer — allows first items to scroll to center */}
        <div style={{ height: PAD_ITEMS * ITEM_HEIGHT }} aria-hidden="true" />

        {items.map((item, i) => {
          const isSelected = i === selectedIndex;
          return (
            <div
              key={i}
              role="option"
              aria-selected={isSelected}
              onClick={() => handleItemClick(i)}
              className="flex items-center justify-center cursor-pointer select-none transition-all"
              style={{
                height: ITEM_HEIGHT,
                scrollSnapAlign: 'center',
                fontSize: isSelected
                  ? 'var(--text-drum)'
                  : 'clamp(1.1rem, 3vw, 1.5rem)',
                fontWeight: isSelected ? 600 : 400,
                color: isSelected
                  ? 'var(--color-text-primary)'
                  : 'var(--color-text-muted)',
                transitionDuration: 'var(--duration-fast)',
              }}
            >
              {format(item)}
            </div>
          );
        })}

        {/* Bottom spacer */}
        <div style={{ height: PAD_ITEMS * ITEM_HEIGHT }} aria-hidden="true" />
      </div>

      {/* Selection highlight band — positioned at center */}
      <div
        className="pointer-events-none absolute left-0 right-0"
        style={{
          top: PAD_ITEMS * ITEM_HEIGHT,
          height: ITEM_HEIGHT,
          borderTop: '1px solid var(--color-glass-border-strong)',
          borderBottom: '1px solid var(--color-glass-border-strong)',
          background: 'var(--color-glass-bg)',
        }}
        aria-hidden="true"
      />
    </div>
  );
}

// ── DrumPicker (Composite) ─────────────────────────────────────

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);           // 1..12
const MINUTES = Array.from({ length: 60 }, (_, i) => i);             // 0..59
const PERIODS: ('AM' | 'PM')[] = ['AM', 'PM'];

export default function DrumPicker() {
  const hour24 = useCalculatorStore((s) => s.hour);
  const minute = useCalculatorStore((s) => s.minute);
  const setTime = useCalculatorStore((s) => s.setTime);

  // Convert store's 24h to local 12h state
  const { h12: initH12, period: initPeriod } = to12h(hour24);
  const [hour12, setHour12] = useState(initH12);
  const [period, setPeriod] = useState<'AM' | 'PM'>(initPeriod);

  // Push 24h value to store whenever local state changes
  useEffect(() => {
    const h24 = to24h(hour12, period);
    if (h24 !== hour24 || minute !== minute) {
      setTime(h24, minute);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hour12, period]);

  const handleHourSelect = useCallback(
    (index: number) => {
      const newH12 = HOURS[index];
      setHour12(newH12);
      setTime(to24h(newH12, period), minute);
    },
    [period, minute, setTime],
  );

  const handleMinuteSelect = useCallback(
    (index: number) => {
      const newMin = MINUTES[index];
      setTime(to24h(hour12, period), newMin);
    },
    [hour12, period, setTime],
  );

  const handlePeriodSelect = useCallback(
    (index: number) => {
      const newPeriod = PERIODS[index];
      setPeriod(newPeriod);
      setTime(to24h(hour12, newPeriod), minute);
    },
    [hour12, minute, setTime],
  );

  // Indices
  const hourIndex = HOURS.indexOf(hour12);
  const minuteIndex = minute;
  const periodIndex = PERIODS.indexOf(period);

  return (
    <div className="glass-card p-4 w-full max-w-sm mx-auto" role="group" aria-label="Time picker">
      <div className="flex items-center justify-center gap-0">
        {/* Hours column */}
        <div className="flex-1 max-w-[100px]">
          <DrumColumn
            items={HOURS}
            selectedIndex={hourIndex}
            onSelect={handleHourSelect}
            formatItem={(v) => String(v)}
            label="Hour"
          />
        </div>

        {/* Colon separator */}
        <div
          className="flex items-center justify-center font-semibold select-none"
          style={{
            fontSize: 'var(--text-drum)',
            color: 'var(--color-text-secondary)',
            height: CONTAINER_HEIGHT,
          }}
          aria-hidden="true"
        >
          :
        </div>

        {/* Minutes column */}
        <div className="flex-1 max-w-[100px]">
          <DrumColumn
            items={MINUTES}
            selectedIndex={minuteIndex}
            onSelect={handleMinuteSelect}
            formatItem={(v) => String(v).padStart(2, '0')}
            label="Minute"
          />
        </div>

        {/* AM/PM column */}
        <div className="flex-shrink-0 w-[80px]">
          <DrumColumn
            items={PERIODS}
            selectedIndex={periodIndex}
            onSelect={handlePeriodSelect}
            label="AM or PM"
          />
        </div>
      </div>
    </div>
  );
}
