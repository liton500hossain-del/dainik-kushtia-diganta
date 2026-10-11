import React, { useEffect, useState } from 'react';
import { Article } from '../types/news';
import { api } from '../services/api';
import { NewsCard } from '../components/NewsCard';
import { toBengaliNumber } from '../utils/bengali';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';

interface LatestNewsProps {
  onNavigateArticle: (slug: string) => void;
}

export const LatestNews: React.FC<LatestNewsProps> = ({ onNavigateArticle }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api
      .getArticles({ page, limit: 15 })
      .then((res) => {
        if (!isMounted) return;
        setArticles(res.articles || []);
        setTotalPages(res.pagination.totalPages || 1);
        setTotalCount(res.pagination.total || 0);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Latest news error:', err);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [page]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 font-bangla">
      <div className="bg-white border-b-4 border-red-700 p-6 rounded-t-lg shadow-xs mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-red-700 font-semibold mb-1">
            <Clock className="w-4 h-4" /> সর্বশেষ সময়রেখা
          </div>
          <h1 className="text-2xl sm:text-3xl font-headline font-bold text-slate-900">
            সর্বশেষ প্রকাশিত সংবাদ
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            কুষ্টিয়া, খোকসা ও জাতীয় সংবাদপত্রের সার্বক্ষণিক তাজা খবর
          </p>
        </div>
        <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded">
          সর্বমোট খবর: <strong className="text-slate-800">{toBengaliNumber(totalCount)}</strong> টি
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block w-8 h-8 border-3 border-red-700 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-slate-600">সংবাদ লোড হচ্ছে...</p>
        </div>
      ) : articles.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((art) => (
              <NewsCard
                key={art.id}
                article={art}
                variant="standard"
                onNavigate={onNavigateArticle}
              />
            ))}
          </div>

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
          <p className="text-base mb-2">কোনো সংবাদ পাওয়া যায়নি।</p>
        </div>
      )}
    </div>
  );
};
