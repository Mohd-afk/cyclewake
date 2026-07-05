/**
 * App header — logo, title, and subtle branding.
 * Always visible on all views.
 */
export default function Header() {
  return (
    <header className="w-full flex items-center justify-center gap-3 pt-8 pb-4 px-4 relative z-10">
      {/* Moon + clock SVG icon — inline for performance */}
      <svg
        width="36"
        height="36"
        viewBox="0 0 512 512"
        fill="none"
        aria-hidden="true"
        className="flex-shrink-0"
      >
        <circle
          cx="256"
          cy="256"
          r="160"
          stroke="var(--color-accent-violet)"
          strokeWidth="4"
          opacity="0.4"
        />
        <path
          d="M290 190 C220 190 180 230 180 300 C180 340 200 370 230 390 C180 380 150 330 150 280 C150 210 200 160 270 160 C290 160 310 170 320 180 C310 185 300 190 290 190 Z"
          fill="var(--color-accent-violet)"
          opacity="0.6"
        />
        <line
          x1="256" y1="256" x2="256" y2="190"
          stroke="white" strokeWidth="6" strokeLinecap="round" opacity="0.8"
        />
        <line
          x1="256" y1="256" x2="305" y2="256"
          stroke="var(--color-accent-violet)" strokeWidth="6" strokeLinecap="round" opacity="0.8"
        />
        <circle cx="256" cy="256" r="7" fill="white" />
      </svg>

      <div className="flex flex-col">
        <h1
          className="text-xl font-bold tracking-tight leading-none"
          style={{ color: 'var(--color-text-primary)' }}
        >
          CycleWake
        </h1>
        <p
          className="text-xs leading-tight"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Sleep cycle calculator
        </p>
      </div>
    </header>
  );
}
