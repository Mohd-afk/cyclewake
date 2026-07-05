import { type ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

/**
 * Reusable glassmorphism card surface.
 * Uses the .glass-card class from globals.css (design tokens).
 * Pass hover={true} for interactive cards (adds glow on hover).
 */
export default function GlassCard({
  children,
  className = '',
  hover = false,
}: GlassCardProps) {
  return (
    <div className={`glass-card ${hover ? 'glass-card-hover' : ''} ${className}`}>
      {children}
    </div>
  );
}
