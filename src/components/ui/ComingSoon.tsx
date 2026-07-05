import React from 'react';
import Link from 'next/link';
import GlassCard from './GlassCard';

interface ComingSoonProps {
  feature: string;
}

export default function ComingSoon({ feature }: ComingSoonProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-md mx-auto min-h-[80vh]">
      <GlassCard className="p-8 w-full text-center flex flex-col items-center gap-4 relative overflow-hidden" hover={true}>
        {/* Glow effect inside card */}
        <div 
          className="absolute pointer-events-none rounded-full blur-[40px]"
          style={{
            top: '-20%',
            left: '30%',
            width: '40%',
            height: '40%',
            background: 'var(--color-accent-violet-glow)',
          }}
        />

        {/* Feature badge or icon placeholder */}
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-2"
          style={{
            background: 'var(--color-glass-bg-pressed)',
            border: '1px solid var(--color-glass-border-strong)',
          }}
        >
          ✨
        </div>

        <h2 
          className="text-2xl font-bold tracking-tight"
          style={{ color: 'var(--color-accent-violet)' }}
        >
          {feature}
        </h2>
        
        <p 
          className="text-sm leading-relaxed mb-4"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          This feature is planned for a future release. Extension points have been prepared in the codebase.
        </p>

        <Link 
          href="/" 
          className="btn-primary w-3/4 max-w-[240px]"
        >
          Back to Calculator
        </Link>
      </GlassCard>
    </div>
  );
}
