# CycleWake Codebase Rules

These rules act as the constitution for this repository. All code must adhere to these standards.

## Code Style & Conventions
1. **TypeScript Strict Mode:** Always enabled. No implicit `any`. Interfaces must be defined for all component props and function signatures.
2. **Naming:**
   - Components: `PascalCase` (e.g., `DrumPicker.tsx`)
   - Functions/Hooks: `camelCase` (e.g., `calculateBedtimes`, `useCalculator`)
   - Constants/Tokens: `UPPER_SNAKE_CASE` or semantic lowercase in configs.
3. **File Conventions:** Next.js App Router conventions apply strictly (`page.tsx`, `layout.tsx`, `route.ts`). Reusable UI components live in `src/components/ui`.

## UI & UX Rules
1. **Zero-Friction MVP:** The primary calculator screen must load and be interactive in **under 1 tap**.
2. **No Nested Menus:** For the MVP, all interactions happen on a single logical screen (input view <-> results view). Do not hide the calculator behind hamburger menus.
3. **Glassmorphism Enforcement:** **NEVER hardcode raw hex colors or blur values in JSX/TSX**. Always use the design tokens defined in `tailwind.config.ts` (e.g., `bg-glass-bg`, `backdrop-blur-glass`).

## State Management
1. **Zustand for Cross-Component State:** Any state shared between the time picker, toggle, and results list must be in `src/store/calculatorStore.ts`.
2. **Local State:** Use standard React `useState` only for purely internal component state (e.g., drum picker scroll positioning, local animations).

## Documentation
1. **Feature Markdown Files:** Any new major feature added to the app must be preceded by a design document in `docs/features/` formatted similarly to `sleep-cycle-calculator.md`.
2. **Inline Comments:** Document the "why", not the "what". Complex mathematical operations (like modulo time arithmetic) require explicit comments explaining the edge cases they cover.

## Testing
1. **Pure Logic Rule:** Every calculation function (like time arithmetic) must be fully isolated from React and DOM, placed in `src/lib/`.
2. **Test Coverage:** Every function in `src/lib/` must have a comprehensive Vitest test suite covering standard usage, midnight rollovers, edge cases, and invalid inputs. **No PR merges without passing tests.**

## Versioning & Changelog
1. **Semantic Versioning:** Use MAJOR.MINOR.PATCH.
2. **Changelog:** Every user-facing feature, fix, or UI change must be logged in `CHANGELOG.md` under the current unreleased version block before deployment.

## Accessibility (Non-Negotiables)
1. **Semantic HTML:** Use `<main>`, `<section>`, `<button>`, `<output>`.
2. **ARIA Labels:** Every interactive control lacking visible text (or using ambiguous icons) must have an `aria-label`.
3. **Contrast:** All foreground text must achieve at least 4.5:1 contrast ratio against its background.
