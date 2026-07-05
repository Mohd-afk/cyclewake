'use client';

import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import ModeToggle from '@/components/ui/ModeToggle';
import DrumPicker from '@/components/ui/DrumPicker';
import ResultList from '@/components/ui/ResultList';
import { useCalculator } from '@/hooks/useCalculator';

export default function Home() {
  const { view, calculate, goBack, results, mode } = useCalculator();

  // Handle browser back button to return to input view
  useEffect(() => {
    const handlePopState = () => {
      if (view === 'results') {
        goBack();
      }
    };
    
    if (view === 'results') {
      window.history.pushState({ view: 'results' }, '');
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [view, goBack]);

  const handleRecalculate = () => {
    if (window.history.state?.view === 'results') {
      window.history.back();
    } else {
      goBack();
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-start w-full max-w-md mx-auto relative overflow-hidden pb-20 h-[100dvh]">
      <Header />

      <div className="w-full flex-1 relative flex flex-col overflow-hidden">
        {/* Input View */}
        <div 
          className={`absolute inset-0 w-full h-full flex flex-col items-center justify-start px-4 transition-transform duration-500 ease-in-out ${
            view === 'input' ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-[120%] opacity-0 pointer-events-none'
          }`}
          aria-hidden={view !== 'input'}
        >
          <div className="w-full flex flex-col gap-6 mt-4">
            <ModeToggle />
            <DrumPicker />
            <button
              onClick={calculate}
              className="btn-primary btn-primary-pulse mt-4 mx-auto w-3/4 max-w-[280px]"
              aria-label="Calculate sleep cycles"
            >
              Calculate
            </button>
          </div>
        </div>

        {/* Results View */}
        <div 
          className={`absolute inset-0 w-full h-full flex flex-col px-4 transition-transform duration-500 ease-in-out ${
            view === 'results' ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-[120%] opacity-0 pointer-events-none'
          }`}
          aria-hidden={view !== 'results'}
        >
          <div className="w-full flex justify-start mb-4 relative z-10">
            <button
              onClick={handleRecalculate}
              className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-white transition-colors py-2 px-3 rounded-full hover:bg-[rgba(255,255,255,0.05)] cursor-pointer"
              aria-label="Go back and recalculate"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Recalculate
            </button>
          </div>
          
          <div className="w-full flex-1 overflow-y-auto pb-8 mask-image-bottom">
            <ResultList results={results} mode={mode} />
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
