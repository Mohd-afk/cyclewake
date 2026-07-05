# CycleWake Design System

## Design Language: Glassmorphism
CycleWake utilizes a deep, calming glassmorphism aesthetic inspired by Apple Clock and ColorOS. It relies on multi-layered translucency, soft background blurs, subtle glowing borders, and dark-mode-first gradients to create a premium, night-time feel.

## Color Palette & Tailwind Tokens

**Background (Dark Night Gradient):**
- `bg-night-900`: `#0a0e1a` (deepest base)
- `bg-night-800`: `#12113a` (mid tone)
- `bg-night-700`: `#1a0a2e` (lightest highlight)
- Gradient direction: 135 degrees.

**Glass Layer:**
- Background: `rgba(255, 255, 255, 0.06)` (`bg-glass-bg`)
- Border: `rgba(255, 255, 255, 0.12)` (`border-glass-border`)
- Blur: `20px` (`backdrop-blur-glass`)
- Shadow: `0 8px 32px rgba(0,0,0,0.4)` (`shadow-glass`)

**Accents & Typography:**
- Violet Accent: `#a78bfa` (`text-accent-violet`)
- Recommended Green: `#34d399` (`text-accent-emerald`)
- Text Primary: `rgba(255, 255, 255, 0.95)`
- Text Secondary: `rgba(255, 255, 255, 0.55)`
- Muted/Short Sleep: `rgba(255, 255, 255, 0.3)`

## Typography Scale
**Typeface:** Inter Variable (Self-hosted woff2)

- **Display Time (Drum Picker):** `clamp(3rem, 10vw, 5rem)` - Massive, easily readable numerals.
- **Result Time:** `clamp(1.6rem, 5vw, 2.2rem)` - Clear result times on glass cards.
- **Labels/Badges:** `0.85rem` - Secondary information (cycle count, hours).
- **Body:** `1rem` - Standard UI text.

## Component States
- **Default:** Standard glass background (`0.06` opacity), soft border.
- **Pressed/Active:** Glass opacity increases slightly (`0.09`), scale reduces marginally (`0.98`), border glow intensifies.
- **Disabled:** Opacity drops to `0.4`, interactions disabled, no hover effects.

## Spacing Grid
Based on an 8px modular scale mapping to Tailwind classes:
- `xs`: 4px (`p-1`)
- `sm`: 8px (`p-2`)
- `md`: 16px (`p-4`)
- `lg`: 24px (`p-6`)
- `xl`: 40px (`p-10`)
- `2xl`: 64px (`p-16`)

## Motion & Animation Guidelines
- **Soft Transitions:** Use Web Animations API or native CSS transitions. No jarring snaps.
- **Easing:** Use standard fluid easing (e.g., `cubic-bezier(0.4, 0, 0.2, 1)`).
- **Stagger:** When lists load (ResultCards), stagger their entrance by `80ms` sequentially.
- **Glow Pulse:** The primary 'Calculate' button should have a soft, pulsing violet box-shadow glow when focused or hovered.

## Accessibility Notes
- **Contrast Ratios:** All critical text must meet WCAG AA (4.5:1) against the underlying dark gradient or glass card.
- **Prefers Reduced Motion:** Respect `@media (prefers-reduced-motion)`. Disable slide-ins and pulses; use direct state switching.
- **Prefers Reduced Transparency:** Fallback to solid dark background colors (e.g., `#1e1e2e`) if the user OS requests reduced transparency.
- **Tap Targets:** Minimum tap target of 48x48px for all interactive elements (drum picker segments, toggles).

## Icon Style Guide
- Minimal, rounded line icons (24x24 viewport, 2px stroke weight).
- No filled icons except for active toggle states or success markers.
- Reference: Lucide icons or Heroicons outline.
