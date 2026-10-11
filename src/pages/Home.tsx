import React, { useEffect, useState } from 'react';
import { Article, AdPlacement } from '../types/news';
import { api } from '../services/api';
import { NewsCard } from '../components/NewsCard';
import { AdSlot } from '../components/AdSlot';
import { TrendingUp, Sparkles, ChevronRight, Image as ImageIcon, Flame } from 'lucide-react';

interface HomeProps {
  ads: Record<string, AdPlacement>;
  onNavigateArticle: (slug: string) => void;
  onNavigateCategory: (slug: string) => void;
  onNavigateLatest: () => void;
}

export const Home: React.FC<HomeProps> = ({
  ads,
  onNavigateArticle,
  onNavigateCategory,
  onNavigateLatest,
}) => {
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [trending, setTrending] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      api.getArticles({ limit: 25 }),
      api.getTrending(),
    ])
      .then(([articlesRes, trendingRes]) => {
        if (!isMounted) return;
        setAllArticles(articlesRes.articles || []);
        setTrending(trendingRes || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Home load error:', err);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-bangla">
        <div className="inline-block w-8 h-8 border-3 border-red-700 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-slate-600">দৈনিক কুষ্টিয়া দিগন্তের সংবাদ পাতা তৈরি হচ্ছে...</p>
      </div>
    );
  }

  // Filter sections
  const leadArticle = allArticles.find((a) => a.is_featured === 1) || allArticles[0];
  const secondaryLead = allArticles.filter((a) => a.id !== leadArticle?.id).slice(0, 3);

  // Local Kushtia & Khoksa
  const localArticles = allArticles.filter(
    (a) => a.category_slug === 'kushtia' || a.category_slug === 'khoksa'
  );

  // National
  const nationalArticles = allArticles.filter(
    (a) => a.category_slug === 'national' || a.category_slug === 'politics' || a.category_slug === 'economy'
  );

  // Sports & Culture
  const cultureAndSports = allArticles.filter(
    (a) => a.category_slug === 'sports' || a.category_slug === 'features' || a.category_slug === 'entertainment'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-10">
      {/* 1. BELOW NAVIGATION AD */}
      {ads.below_nav && ads.below_nav.is_active && (
        <AdSlot slotKey="below_nav" ad={ads.below_nav} className="my-0" />
      )}

      {/* 2. LEAD STORY & TOP FEATURES SECTION */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Lead Story */}
          <div className="lg:col-span-8">
            {leadArticle && (
              <NewsCard
                article={leadArticle}
                variant="lead"
                onNavigate={onNavigateArticle}
              />
            )}
          </div>

          {/* Secondary Lead Stack */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-slate-900 text-white px-3.5 py-2 rounded-t font-bangla text-xs font-bold uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" /> বিশেষ সংবাদ
              </span>
              <span className="text-[11px] text-slate-400 font-normal">নির্বাচিত বিশ্লেষণ</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-b p-3 space-y-1 shadow-xs">
              {secondaryLead.map((art) => (
                <NewsCard
                  key={art.id}
                  article={art}
                  variant="compact"
                  onNavigate={onNavigateArticle}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. LOCAL SPOTLIGHT: কুষ্টিয়া ও খোকসা সমাচার */}
      <section className="bg-slate-50/70 p-5 rounded-lg border border-slate-200">
        <div className="flex items-center justify-between border-b-2 border-red-700 pb-2.5 mb-5 font-bangla">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-red-700 rounded-full"></span>
            <h2 className="text-xl md:text-2xl font-headline font-bold text-slate-900">
              কুষ্টিয়া ও খোকসা সমাচার
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigateCategory('kushtia')}
            className="text-xs text-red-700 hover:text-red-900 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>জেলা ও উপজেলার সব খবর</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {localArticles.length > 0 ? (
            localArticles.slice(0, 3).map((art) => (
              <NewsCard
                key={art.id}
                article={art}
                variant="standard"
                onNavigate={onNavigateArticle}
              />
            ))
          ) : (
            <p className="text-xs text-slate-500 col-span-3">স্থানীয় সংবাদ শীঘ্রই হালনাগাদ করা হচ্ছে।</p>
          )}
        </div>
      </section>

      {/* 4. MID SECTION ADVERTISEMENT */}
      {ads.home_section_mid && ads.home_section_mid.is_active && (
        <AdSlot slotKey="home_section_mid" ad={ads.home_section_mid} />
      )}

      {/* 5. NATIONAL NEWS & TRENDING / MOST READ SPLIT */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* National News Feed (8 cols) */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2 mb-5 font-bangla">
              <h2 className="text-xl md:text-2xl font-headline font-bold text-slate-900">
                জাতীয় ও রাজনীতি
              </h2>
              <button
                type="button"
                onClick={() => onNavigateCategory('national')}
                className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>আরও দেখুন</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {nationalArticles.length > 0 ? (
                nationalArticles.map((art) => (
                  <NewsCard
                    key={art.id}
                    article={art}
                    variant="standard"
                    onNavigate={onNavigateArticle}
                  />
                ))
              ) : (
                <div className="col-span-2">
                  <p className="text-xs text-slate-500">জাতীয় সংবাদ লোড করা হচ্ছে...</p>
                </div>
              )}
            </div>
          </div>

          {/* Trending / Most Read Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs font-bangla">
              <div className="flex items-center gap-2 border-b border-red-700 pb-2.5 mb-3">
                <TrendingUp className="w-4 h-4 text-red-700" />
                <h3 className="text-base font-bold text-slate-900">সর্বাধিক পঠিত সংবাদ</h3>
              </div>

              <div className="divide-y divide-slate-100">
                {trending.length > 0 ? (
                  trending.slice(0, 5).map((trendArt) => (
                    <NewsCard
                      key={trendArt.id}
                      article={trendArt}
                      variant="minimal"
                      onNavigate={onNavigateArticle}
                    />
                  ))
                ) : (
                  <p className="text-xs text-slate-500 py-2">পঠিত সংবাদের তালিকা তৈরি হচ্ছে...</p>
                )}
              </div>
            </div>

            {/* Sidebar Ad Slot */}
            {ads.sidebar_top && ads.sidebar_top.is_active && (
              <AdSlot slotKey="sidebar_top" ad={ads.sidebar_top} />
            )}
          </div>
        </div>
      </section>

      {/* 6. PHOTO GALLERY & VISUAL JOURNALISM */}
      <section className="bg-slate-950 text-white p-6 rounded-lg font-bangla">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl md:text-2xl font-headline font-bold text-white">
              ছবিতে কুষ্টিয়া ও বাংলাদেশ
            </h2>
          </div>
          <span className="text-xs text-slate-400">দৈনিক কুষ্টিয়া দিগন্তের বিশেষ ফটো ফিচার</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {allArticles
            .filter((a) => a.featured_image)
            .slice(0, 3)
            .map((art) => (
              <div
                key={art.id}
                onClick={() => onNavigateArticle(art.slug)}
                className="group cursor-pointer bg-slate-900 border border-slate-800 rounded overflow-hidden hover:border-slate-700 transition-colors"
              >
                <div className="aspect-16/10 overflow-hidden relative">
                  <img
                    src={art.featured_image}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                    <span className="text-xs font-semibold text-white line-clamp-2">
                      {art.title}
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* 7. SPORTS & CULTURE ROW */}
      <section>
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2 mb-5 font-bangla">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-red-700" />
            <h2 className="text-xl md:text-2xl font-headline font-bold text-slate-900">
              খেলাধুলা ও সাহিত্য-সংস্কৃতি
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cultureAndSports.map((art) => (
            <NewsCard
              key={art.id}
              article={art}
              variant="standard"
              onNavigate={onNavigateArticle}
            />
          ))}
        </div>
      </section>

      {/* 8. LOAD MORE / LATEST NEWS CALLOUT */}
      <div className="text-center pt-4 font-bangla">
        <button
          type="button"
          onClick={onNavigateLatest}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-red-700 text-white rounded text-sm font-semibold transition-colors shadow-xs cursor-pointer"
        >
          <span>সর্বশেষ সকল খবর দেখুন →</span>
        </button>
      </div>
    </div>
  );
};
