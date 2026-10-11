import React, { useEffect, useState } from 'react';
import { Article, Category } from '../types/news';
import { api } from '../services/api';
import { NewsCard } from '../components/NewsCard';
import { toBengaliNumber } from '../utils/bengali';
import { Search, Filter } from 'lucide-react';

interface SearchResultsProps {
  initialQuery: string;
  categories: Category[];
  onNavigateArticle: (slug: string) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  initialQuery,
  categories,
  onNavigateArticle,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = (queryText: string, categorySlug: string) => {
    setLoading(true);
    setSearched(true);
    api
      .getArticles({
        search: queryText || undefined,
        category: categorySlug || undefined,
        limit: 20,
      })
      .then((res) => {
        setArticles(res.articles || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Search error:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (initialQuery) {
      setSearchTerm(initialQuery);
      doSearch(initialQuery, selectedCategory);
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(searchTerm, selectedCategory);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 font-bangla">
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs mb-8">
        <h1 className="text-2xl font-headline font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Search className="w-6 h-6 text-red-700" />
          <span>সংবাদ অনুসন্ধান</span>
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="সংবাদের শিরোনাম, মূল বিষয় বা শব্দ লিখে খুঁজুন..."
              className="w-full bg-slate-50 border border-slate-300 rounded px-4 py-2.5 text-sm focus:outline-hidden focus:border-red-600 focus:bg-white"
            />
          </div>

          <div className="w-full md:w-60">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2.5 text-sm focus:outline-hidden focus:border-red-600 focus:bg-white"
            >
              <option value="">সকল বিভাগ</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name_bn}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-red-700 hover:bg-red-800 text-white font-semibold rounded text-sm transition-colors cursor-pointer"
          >
            অনুসন্ধান করুন
          </button>
        </form>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block w-8 h-8 border-3 border-red-700 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-slate-600">অনুসন্ধান ফলাফল খোঁজা হচ্ছে...</p>
        </div>
      ) : searched ? (
        <div>
          <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-6 text-xs text-slate-600">
            <span>
              {searchTerm && <span>অনুসন্ধান শব্দ: &ldquo;<strong>{searchTerm}</strong>&rdquo;</span>}
              {selectedCategory && (
                <span className="ml-2 inline-flex items-center gap-1">
                  <Filter className="w-3 h-3 text-red-600" /> বিভাগ: {categories.find((c) => c.slug === selectedCategory)?.name_bn}
                </span>
              )}
            </span>
            <span>
              মোট প্রাপ্ত ফলাফল: <strong className="text-slate-900">{toBengaliNumber(articles.length)}</strong> টি
            </span>
          </div>

          {articles.length > 0 ? (
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
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-12 text-center text-slate-500">
              <p className="text-base text-slate-800 font-semibold mb-1">কোনো সংবাদ পাওয়া যায়নি</p>
              <p className="text-xs">বানান সঠিক আছে কিনা দেখুন অথবা অন্য কোনো কি-ওয়ার্ড দিয়ে আবার চেষ্টা করুন।</p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
