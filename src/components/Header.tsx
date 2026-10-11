import React, { useState } from 'react';
import { Category, SiteSettings, AdPlacement } from '../types/news';
import { getFullHeaderDate } from '../utils/bengali';
import { Search, Menu, X, CloudSun, MapPin, Shield } from 'lucide-react';
import { AdSlot } from './AdSlot';

interface HeaderProps {
  categories: Category[];
  settings: SiteSettings;
  headerAd?: AdPlacement;
  activeCategory?: string;
  onNavigateCategory: (slug: string) => void;
  onNavigateHome: () => void;
  onNavigateSearch: (query: string) => void;
  onNavigateAdmin: () => void;
  onNavigateLatest: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  categories,
  settings,
  headerAd,
  activeCategory,
  onNavigateCategory,
  onNavigateHome,
  onNavigateSearch,
  onNavigateAdmin,
  onNavigateLatest,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentDate = getFullHeaderDate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigateSearch(searchQuery.trim());
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navCategories = categories.filter((c) => c.in_navbar && c.is_active);

  return (
    <header className="bg-white border-b border-slate-200">
      {/* 1. TOP INFORMATION BAR */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 md:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Left: Date & Location */}
          <div className="flex items-center gap-3 font-bangla">
            <span className="text-slate-300">{currentDate}</span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-slate-300">
              <MapPin className="w-3 h-3 text-red-400" /> কুষ্টিয়া ও খোকসা সংস্করণ
            </span>
          </div>

          {/* Right: Weather & Admin Gateway */}
          <div className="flex items-center gap-4 text-[11px]">
            {settings.weather_widget_enabled === '1' && (
              <div className="hidden md:flex items-center gap-1.5 text-slate-300 font-bangla">
                <CloudSun className="w-3.5 h-3.5 text-amber-400" />
                <span>কুষ্টিয়া: ২৯°সে, রৌদ্রোজ্জ্বল</span>
              </div>
            )}

            {/* Social links */}
            <div className="hidden lg:flex items-center gap-2.5 text-slate-400">
              <a
                href={settings.facebook_url || 'https://facebook.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
                title="ফেসবুক"
              >
                Facebook
              </a>
              <span className="text-slate-700">·</span>
              <a
                href={settings.youtube_url || 'https://youtube.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
                title="ইউটিউব"
              >
                YouTube
              </a>
            </div>

            {/* Admin entry point */}
            <button
              type="button"
              onClick={onNavigateAdmin}
              className="inline-flex items-center gap-1 text-slate-300 hover:text-white transition-colors font-medium border border-slate-700 hover:border-slate-500 px-2 py-0.5 rounded cursor-pointer"
            >
              <Shield className="w-3 h-3 text-amber-400" />
              <span>নিউজডেস্ক লগইন</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN MASTHEAD & BRAND AREA */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand Wordmark & Identity */}
          <div className="text-center md:text-left flex-1 cursor-pointer" onClick={onNavigateHome}>
            {settings.logo_url ? (
              <img
                src={settings.logo_url}
                alt="দৈনিক কুষ্টিয়া দিগন্ত"
                className="h-14 md:h-16 max-w-xs object-contain mx-auto md:mx-0"
              />
            ) : (
              <div className="inline-block">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-headline font-black tracking-tight text-slate-950 hover:text-blue-950 transition-colors">
                  দৈনিক কুষ্টিয়া দিগন্ত
                </h1>
                <p className="text-xs sm:text-sm font-bangla text-slate-600 mt-1 tracking-wide">
                  {settings.tagline || 'কুষ্টিয়া, খোকসা ও জাতীয় সংবাদভিত্তিক বাংলা ডিজিটাল সংবাদপত্র'}
                </p>
                <div className="text-[10px] text-slate-500 font-sans tracking-widest uppercase mt-0.5">
                  Dainik Kushtia Diganta · Reg. Kushtia, Bangladesh
                </div>
              </div>
            )}
          </div>

          {/* Header Advertisement Placement */}
          <div className="w-full md:w-auto shrink-0 flex justify-center md:justify-end">
            {headerAd && headerAd.is_active ? (
              <AdSlot slotKey="header_banner" ad={headerAd} className="my-0" />
            ) : (
              /* Fallback house banner */
              <div className="hidden lg:flex items-center justify-center border border-dashed border-slate-300 rounded px-6 py-3 bg-slate-50 text-center text-xs text-slate-600">
                <div>
                  <span className="font-semibold block text-slate-700 font-bangla">কুষ্টিয়া দিগন্তে বিজ্ঞাপন দিন</span>
                  <span className="text-[11px] text-slate-500 font-sans">বিজ্ঞাপন ও সার্কুলেশন: {settings.contact_phone || '+৮৮০ ১৭১২-৩৪৫৬৭৮'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. NAVIGATION MENU BAR */}
      <div className="bg-slate-950 text-white sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden py-3 text-slate-300 hover:text-white flex items-center gap-1.5 text-sm font-bangla"
          >
            <Menu className="w-5 h-5" />
            <span>সকল বিভাগ</span>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center overflow-x-auto no-scrollbar py-1 gap-1 text-sm font-medium font-bangla">
            <button
              type="button"
              onClick={onNavigateHome}
              className={`px-3 py-2 rounded transition-colors whitespace-nowrap cursor-pointer ${
                !activeCategory
                  ? 'bg-red-700 text-white font-bold'
                  : 'text-slate-200 hover:bg-slate-800 hover:text-white'
              }`}
            >
              প্রচ্ছদ
            </button>

            <button
              type="button"
              onClick={onNavigateLatest}
              className="px-3 py-2 rounded text-slate-200 hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
            >
              সর্বশেষ
            </button>

            {navCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => onNavigateCategory(cat.slug)}
                className={`px-3 py-2 rounded transition-colors whitespace-nowrap cursor-pointer ${
                  activeCategory === cat.slug
                    ? 'bg-red-700 text-white font-bold'
                    : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {cat.name_bn}
              </button>
            ))}
          </nav>

          {/* Search Trigger */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
              title="সংবাদ অনুসন্ধান"
            >
              {searchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expandable Search Input Strip */}
        {searchOpen && (
          <div className="bg-slate-900 border-t border-slate-800 px-4 py-3">
            <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto flex items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="কুষ্টিয়া, খোকসা বা যে কোনো সংবাদ বা বিষয় লিখে খুঁজুন..."
                className="flex-1 bg-slate-950 border border-slate-700 text-white placeholder-slate-400 text-sm rounded px-3.5 py-2 focus:outline-hidden focus:border-red-600 font-bangla"
                autoFocus
              />
              <button
                type="submit"
                className="bg-red-700 hover:bg-red-800 text-white text-xs font-semibold px-4 py-2 rounded transition-colors font-bangla cursor-pointer"
              >
                অনুসন্ধান
              </button>
            </form>
          </div>
        )}
      </div>

      {/* 4. MOBILE DRAWER MENU */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative w-4/5 max-w-xs bg-slate-950 text-white h-full flex flex-col z-10 shadow-2xl overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-headline font-bold text-lg text-white">দৈনিক কুষ্টিয়া দিগন্ত</h3>
                <span className="text-xs text-slate-400">{currentDate}</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Categories */}
            <div className="p-4 flex-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-red-500 mb-2 font-bangla">
                সংবাদ বিভাগসমূহ
              </h4>
              <div className="grid grid-cols-1 gap-1 font-bangla">
                <button
                  type="button"
                  onClick={() => {
                    onNavigateHome();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 px-3 rounded text-sm hover:bg-slate-800 text-slate-200"
                >
                  প্রচ্ছদ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onNavigateLatest();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 px-3 rounded text-sm hover:bg-slate-800 text-slate-200"
                >
                  সর্বশেষ সংবাদ
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      onNavigateCategory(cat.slug);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left py-2 px-3 rounded text-sm transition-colors ${
                      activeCategory === cat.slug
                        ? 'bg-red-700 text-white font-bold'
                        : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {cat.name_bn}
                  </button>
                ))}
              </div>

              {/* Admin Gateway on Mobile */}
              <div className="mt-6 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    onNavigateAdmin();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded bg-slate-900 border border-slate-700 text-amber-400 text-xs font-medium"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>নিউজডেস্ক অ্যাডমিন লগইন</span>
                </button>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 font-bangla">
              <div>কুষ্টিয়া ও খোকসা প্রতিনিধি ডেস্ক</div>
              <div>ফোন: {settings.contact_phone || '+৮৮০ ১৭১২-৩৪৫৬৭৮'}</div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
