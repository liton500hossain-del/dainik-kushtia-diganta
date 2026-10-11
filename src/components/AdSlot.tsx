import React, { useEffect, useRef } from 'react';
import { AdPlacement } from '../types/news';

interface AdSlotProps {
  slotKey: string;
  ad?: AdPlacement;
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ slotKey, ad, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ad || !ad.is_active || ad.ad_type !== 'custom_code' || !ad.custom_code) {
      return;
    }

    if (containerRef.current) {
      // Clear previous content
      containerRef.current.innerHTML = '';
      
      // Inject code safely via range to parse script tags if present
      const range = document.createRange();
      range.selectNode(containerRef.current);
      const documentFragment = range.createContextualFragment(ad.custom_code);
      containerRef.current.appendChild(documentFragment);
    }
  }, [ad]);

  if (!ad || !ad.is_active) {
    return null;
  }

  // Device targeting visibility classes
  const deviceClass =
    ad.device_target === 'desktop'
      ? 'hidden md:block'
      : ad.device_target === 'mobile'
      ? 'block md:hidden'
      : '';

  return (
    <div className={`ad-slot my-4 text-center ${deviceClass} ${className}`}>
      <span className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-sans">
        বিজ্ঞাপন / Advertisement
      </span>

      {ad.ad_type === 'banner' && ad.banner_image ? (
        <a
          href={ad.target_url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block transition-opacity hover:opacity-95"
        >
          <img
            src={ad.banner_image}
            alt={ad.name}
            className="max-h-24 md:max-h-28 w-auto mx-auto object-contain rounded border border-slate-200"
            referrerPolicy="no-referrer"
          />
        </a>
      ) : (
        <div
          ref={containerRef}
          className="min-h-[60px] flex items-center justify-center bg-slate-50/50 rounded border border-slate-200/80 p-2 overflow-hidden text-xs text-slate-500"
        />
      )}
    </div>
  );
};
