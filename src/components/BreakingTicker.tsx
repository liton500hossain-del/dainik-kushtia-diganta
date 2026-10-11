import React, { useState, useEffect } from 'react';
import { BreakingNewsItem } from '../types/news';
import { Flame, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

interface BreakingTickerProps {
  items: BreakingNewsItem[];
  onNavigate?: (slug: string) => void;
}

export const BreakingTicker: React.FC<BreakingTickerProps> = ({ items, onNavigate }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!items || items.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [items, isPaused]);

  if (!items || items.length === 0) return null;

  const currentItem = items[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleItemClick = (e: React.MouseEvent) => {
    if (currentItem.article_slug) {
      e.preventDefault();
      if (onNavigate) {
        onNavigate(currentItem.article_slug);
      } else {
        window.location.hash = `#/article/${currentItem.article_slug}`;
      }
    }
  };

  return (
    <div
      className="breaking-ticker bg-white border-y border-red-100 flex items-center h-10 px-3 md:px-6 shadow-xs overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Kicker badge */}
      <div className="shrink-0 flex items-center gap-1.5 bg-red-700 text-white text-xs font-semibold px-2.5 py-1 rounded-sm uppercase tracking-wide mr-3">
        <Flame className="w-3.5 h-3.5 fill-current text-amber-300" />
        <span className="font-bangla font-bold">শিরোনাম</span>
      </div>

      {/* Headline text */}
      <div className="flex-1 overflow-hidden">
        <a
          href={currentItem.article_slug ? `#/article/${currentItem.article_slug}` : currentItem.external_url || '#'}
          onClick={handleItemClick}
          className="text-xs md:text-sm font-medium text-slate-800 hover:text-red-700 transition-colors truncate block font-bangla"
        >
          {currentItem.title}
        </a>
      </div>

      {/* Control buttons */}
      <div className="shrink-0 flex items-center gap-1 ml-2 text-slate-500">
        <button
          type="button"
          onClick={() => setIsPaused(!isPaused)}
          className="p-1 hover:text-slate-800 transition-colors"
          title={isPaused ? 'চালু করুন' : 'থামান'}
        >
          {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
        </button>
        <button
          type="button"
          onClick={handlePrev}
          className="p-1 hover:text-slate-800 transition-colors"
          title="পূর্ববর্তী"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="p-1 hover:text-slate-800 transition-colors"
          title="পরবর্তী"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
