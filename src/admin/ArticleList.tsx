import React, { useEffect, useState } from 'react';
import { Article } from '../types/news';
import { api } from '../services/api';
import { toBengaliNumber, formatBengaliDateTime } from '../utils/bengali';
import { Plus, Search, Edit3, Trash2, Eye, ExternalLink, AlertCircle } from 'lucide-react';

interface ArticleListProps {
  onNewArticle: () => void;
  onEditArticle: (id: number) => void;
  onViewLive: (slug: string) => void;
  userRole: string;
}

export const ArticleList: React.FC<ArticleListProps> = ({
  onNewArticle,
  onEditArticle,
  onViewLive,
  userRole,
}) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const loadArticles = () => {
    setLoading(true);
    api
      .getAdminArticles(statusFilter)
      .then((res) => {
        setArticles(res || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Admin articles error:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadArticles();
  }, [statusFilter]);

  const handleDelete = async (id: number) => {
    if (!confirm('আপনি কি নিশ্চিতভাবে এই সংবাদটি মুছে ফেলতে চান?')) return;
    try {
      await api.deleteArticle(id);
      setActionMsg('সংবাদ সফলভাবে মুছে ফেলা হয়েছে');
      loadArticles();
      setTimeout(() => setActionMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'সংবাদ মুছতে সমস্যা হয়েছে');
    }
  };

  const filteredArticles = articles.filter((art) => {
    if (!searchTerm.trim()) return true;
    return art.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <span className="text-emerald-400 font-semibold text-xs">প্রকাশিত</span>;
      case 'pending_review':
        return <span className="text-amber-400 font-semibold text-xs">যাচাইয়ের অপেক্ষায়</span>;
      case 'draft':
        return <span className="text-slate-400 font-semibold text-xs">খসড়া (Draft)</span>;
      case 'archived':
        return <span className="text-rose-400 font-semibold text-xs">আর্কাইভড</span>;
      default:
        return <span className="text-slate-400 text-xs">{status}</span>;
    }
  };

  return (
    <div className="space-y-4 font-bangla">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div>
          <h2 className="text-lg font-bold text-white">সংবাদ তালিকা ও সম্পাদনা</h2>
          <p className="text-xs text-slate-400">সর্বমোট সংবাদ: {toBengaliNumber(articles.length)} টি</p>
        </div>
        <button
          type="button"
          onClick={onNewArticle}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন সংবাদ তৈরি করুন</span>
        </button>
      </div>

      {actionMsg && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-1 overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'সকল' },
            { id: 'published', label: 'প্রকাশিত' },
            { id: 'pending_review', label: 'পর্যালোচনার অপেক্ষায়' },
            { id: 'draft', label: 'খসড়া' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-red-700 text-white font-semibold'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="শিরোনাম দিয়ে খুঁজুন..."
            className="w-full md:w-64 bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-red-600"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="inline-block w-6 h-6 border-2 border-red-700 border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-xs">সংবাদ লোড হচ্ছে...</p>
          </div>
        ) : filteredArticles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase text-[11px]">
                <tr>
                  <th className="p-3">শিরোনাম ও বিভাগ</th>
                  <th className="p-3">প্রতিবেদক</th>
                  <th className="p-3">অবস্থা</th>
                  <th className="p-3">পঠিত</th>
                  <th className="p-3">তারিখ</th>
                  <th className="p-3 text-right">পদক্ষেপ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredArticles.map((art) => (
                  <tr key={art.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 max-w-xs md:max-w-md">
                      <div className="font-semibold text-slate-100 hover:text-red-400 cursor-pointer line-clamp-2" onClick={() => onEditArticle(art.id)}>
                        {art.title}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5 font-sans">
                        <span className="text-red-400 font-bangla">{art.category_name_bn}</span>
                        {art.is_breaking === 1 && (
                          <span className="text-amber-400 font-bangla font-semibold">· ব্রেকিং</span>
                        )}
                        {art.is_featured === 1 && (
                          <span className="text-blue-400 font-bangla font-semibold">· বিশেষ</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap text-slate-400 font-medium">{art.reporter_name}</td>
                    <td className="p-3 whitespace-nowrap">{getStatusBadge(art.status)}</td>
                    <td className="p-3 whitespace-nowrap font-sans tabular-nums text-slate-400">{toBengaliNumber(art.views_count)}</td>
                    <td className="p-3 whitespace-nowrap font-sans text-slate-400 text-[11px]">
                      {formatBengaliDateTime(art.published_at || art.created_at)}
                    </td>
                    <td className="p-3 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-1">
                        {art.status === 'published' && (
                          <button
                            type="button"
                            onClick={() => onViewLive(art.slug)}
                            className="p-1 text-slate-400 hover:text-white rounded"
                            title="লাইভ দেখুন"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onEditArticle(art.id)}
                          className="p-1 text-slate-400 hover:text-amber-400 rounded"
                          title="সম্পাদনা করুন"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {(userRole === 'super_admin' || userRole === 'editor') && (
                          <button
                            type="button"
                            onClick={() => handleDelete(art.id)}
                            className="p-1 text-slate-400 hover:text-red-400 rounded"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 text-xs">
            কোনো সংবাদ খুঁজে পাওয়া যায়নি।
          </div>
        )}
      </div>
    </div>
  );
};
