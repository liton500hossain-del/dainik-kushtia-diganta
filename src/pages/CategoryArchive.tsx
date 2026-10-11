import React, { useEffect, useState } from 'react';
import { Article, Category } from '../types/news';
import { api } from '../services/api';
import { NewsCard } from '../components/NewsCard';
import { toBengaliNumber } from '../utils/bengali';
import { Folder, ChevronLeft, ChevronRight } from 'lucide-react';

interface CategoryArchiveProps {
  categorySlug: string;
  categories: Category[];
  onNavigateArticle: (slug: string) => void;
}

export const CategoryArchive: React.FC<CategoryArchiveProps> = ({
  categorySlug,
  categories,
  onNavigateArticle,
}) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const currentCategory = categories.find((c) => c.slug === categorySlug);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api
      .getArticles({ category: categorySlug, page, limit: 12 })
      .then((res) => {
        if (!isMounted) return;
        setArticles(res.articles || []);
        setTotalPages(res.pagination.totalPages || 1);
        setTotalCount(res.pagination.total || 0);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Category load error:', err);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [categorySlug, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 font-bangla">
      {/* Category Header */}
      <div className="bg-white border-b-4 border-red-700 p-6 rounded-t-lg shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Folder className="w-3.5 h-3.5 text-red-700" />
              <span>সংবাদ বিভাগ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-headline font-bold text-slate-900">
              {currentCategory ? currentCategory.name_bn : 'বিভাগীয় সংবাদ'}
            </h1>
            {currentCategory?.description && (
              <p className="text-xs sm:text-sm text-slate-600 mt-1">{currentCategory.description}</p>
            )}
          </div>
          <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded self-start sm:self-auto">
            মোট সংবাদ: <strong className="text-slate-800">{toBengaliNumber(totalCount)}</strong> টি
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block w-8 h-8 border-3 border-red-700 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-slate-600">বিভাগের সংবাদ লোড হচ্ছে...</p>
        </div>
      ) : articles.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((art) => (
              <NewsCard
                key={art.id}
                article={art}
                variant="standard"
                showCategory={false}
                onNavigate={onNavigateArticle}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-10 pt-6 border-t border-slate-200">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 px-4 py-2 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> পূর্ববর্তী
              </button>
              <span className="text-xs text-slate-600 font-medium">
                পাতা {toBengaliNumber(page)} এর {toBengaliNumber(totalPages)}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex items-center gap-1 px-4 py-2 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                পরবর্তী <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-slate-500">
          <p className="text-base mb-2">এই বিভাগে বর্তমানে কোনো প্রকাশিত সংবাদ নেই।</p>
          <a href="#/" className="text-xs text-red-700 font-semibold hover:underline">
            প্রচ্ছদে ফিরে যান →
          </a>
        </div>
      )}
    </div>
  );
};
