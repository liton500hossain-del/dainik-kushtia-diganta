import React, { useEffect, useState } from 'react';
import { Category, SiteSettings, BreakingNewsItem, AdPlacement, User } from './types/news';
import { api, getAuthToken } from './services/api';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { BreakingTicker } from './components/BreakingTicker';
import { Home } from './pages/Home';
import { ArticleDetail } from './pages/ArticleDetail';
import { CategoryArchive } from './pages/CategoryArchive';
import { LatestNews } from './pages/LatestNews';
import { SearchResults } from './pages/SearchResults';
import { InstitutionalPages } from './pages/InstitutionalPages';
import { AdminLogin } from './admin/AdminLogin';
import { AdminLayout } from './admin/AdminLayout';

export default function App() {
  // Public state
  const [settings, setSettings] = useState<SiteSettings>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [breakingNews, setBreakingNews] = useState<BreakingNewsItem[]>([]);
  const [ads, setAds] = useState<Record<string, AdPlacement>>({});
  const [loading, setLoading] = useState(true);

  // Routing state based on hash
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#/');

  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Initialize bootstrap data
  const loadBootstrap = () => {
    api
      .getBootstrap()
      .then((res) => {
        setSettings(res.settings || {});
        setCategories(res.categories || []);
        setBreakingNews(res.breakingNews || []);
        setAds(res.ads || {});
        setLoading(false);
      })
      .catch((err) => {
        console.error('Bootstrap error:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadBootstrap();

    // Check user session
    const token = getAuthToken();
    if (token) {
      api
        .getCurrentUser()
        .then((res) => {
          setCurrentUser(res.user);
          setAuthLoading(false);
        })
        .catch(() => {
          setCurrentUser(null);
          setAuthLoading(false);
        });
    } else {
      setAuthLoading(false);
    }

    const onHashChange = () => {
      setCurrentHash(window.location.hash || '#/');
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Parse routing parameters
  const route = currentHash.replace(/^#\/?/, '').split('?')[0];
  const queryStr = currentHash.includes('?') ? currentHash.split('?')[1] : '';
  const queryParams = new URLSearchParams(queryStr);

  const navigateTo = (hash: string) => {
    window.location.hash = hash;
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    navigateTo('#/');
  };

  // Render Admin Area
  if (route.startsWith('admin')) {
    if (authLoading) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center font-bangla text-slate-300">
          <div className="text-center">
            <div className="w-8 h-8 border-3 border-red-700 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs">নিউজডেস্ক যাচাই করা হচ্ছে...</p>
          </div>
        </div>
      );
    }

    if (!currentUser) {
      return (
        <AdminLogin
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            navigateTo('#/admin');
            loadBootstrap();
          }}
          onBackToSite={() => navigateTo('#/')}
        />
      );
    }

    return (
      <AdminLayout
        currentUser={currentUser}
        categories={categories}
        onLogout={handleLogout}
        onViewLiveSite={() => navigateTo('#/')}
        onViewArticleLive={(slug) => navigateTo(`#/article/${slug}`)}
      />
    );
  }

  // Render Public Newspaper Page Content
  const renderPublicPage = () => {
    if (loading) {
      return (
        <div className="max-w-7xl mx-auto px-4 py-24 text-center font-bangla">
          <div className="inline-block w-9 h-9 border-3 border-red-700 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm text-slate-600">দৈনিক কুষ্টিয়া দিগন্ত লোড হচ্ছে...</p>
        </div>
      );
    }

    // Article detail
    if (route.startsWith('article/')) {
      const slug = route.replace('article/', '');
      return (
        <ArticleDetail
          slug={slug}
          inContentAd={ads.article_in_content}
          bottomAd={ads.article_bottom}
          sidebarAd={ads.sidebar_top}
          onNavigateCategory={(catSlug) => navigateTo(`#/category/${catSlug}`)}
          onNavigateArticle={(artSlug) => navigateTo(`#/article/${artSlug}`)}
        />
      );
    }

    // Category archive
    if (route.startsWith('category/')) {
      const slug = route.replace('category/', '');
      return (
        <CategoryArchive
          categorySlug={slug}
          categories={categories}
          onNavigateArticle={(artSlug) => navigateTo(`#/article/${artSlug}`)}
        />
      );
    }

    // Latest news
    if (route === 'latest') {
      return <LatestNews onNavigateArticle={(artSlug) => navigateTo(`#/article/${artSlug}`)} />;
    }

    // Search results
    if (route === 'search') {
      const q = queryParams.get('q') || '';
      return (
        <SearchResults
          initialQuery={q}
          categories={categories}
          onNavigateArticle={(artSlug) => navigateTo(`#/article/${artSlug}`)}
        />
      );
    }

    // Institutional pages
    const institutionalPages = ['about', 'editorial-policy', 'correction-policy', 'privacy-policy', 'terms', 'advertise', 'contact'];
    if (institutionalPages.includes(route)) {
      return <InstitutionalPages pageType={route as any} settings={settings} />;
    }

    // Default: Home
    return (
      <Home
        ads={ads}
        onNavigateArticle={(slug) => navigateTo(`#/article/${slug}`)}
        onNavigateCategory={(slug) => navigateTo(`#/category/${slug}`)}
        onNavigateLatest={() => navigateTo('#/latest')}
      />
    );
  };

  const activeCategory = route.startsWith('category/') ? route.replace('category/', '') : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 font-bangla selection:bg-red-700 selection:text-white">
      {/* 1. MASTHEAD & HEADER */}
      <Header
        categories={categories}
        settings={settings}
        headerAd={ads.header_banner}
        activeCategory={activeCategory}
        onNavigateCategory={(slug) => navigateTo(`#/category/${slug}`)}
        onNavigateHome={() => navigateTo('#/')}
        onNavigateSearch={(q) => navigateTo(`#/search?q=${encodeURIComponent(q)}`)}
        onNavigateAdmin={() => navigateTo('#/admin')}
        onNavigateLatest={() => navigateTo('#/latest')}
      />

      {/* 2. BREAKING NEWS TICKER */}
      <BreakingTicker
        items={breakingNews}
        onNavigate={(slug) => navigateTo(`#/article/${slug}`)}
      />

      {/* 3. MAIN PAGE BODY */}
      <main className="flex-1">{renderPublicPage()}</main>

      {/* 4. FOOTER */}
      <Footer
        settings={settings}
        onNavigatePage={(page) => navigateTo(`#/${page}`)}
        onNavigateCategory={(slug) => navigateTo(`#/category/${slug}`)}
      />

      {/* 5. ADSTERRA SOCIAL BAR / POPUNDER CONTAINER (if configured) */}
      {ads.adsterra_social_bar && ads.adsterra_social_bar.is_active && ads.adsterra_social_bar.custom_code && (
        <div
          dangerouslySetInnerHTML={{ __html: ads.adsterra_social_bar.custom_code }}
          className="hidden"
        />
      )}
      {ads.adsterra_popunder && ads.adsterra_popunder.is_active && ads.adsterra_popunder.custom_code && (
        <div
          dangerouslySetInnerHTML={{ __html: ads.adsterra_popunder.custom_code }}
          className="hidden"
        />
      )}
    </div>
  );
}
