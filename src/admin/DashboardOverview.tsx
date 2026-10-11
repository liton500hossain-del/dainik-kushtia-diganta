import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { toBengaliNumber, formatBengaliDateTime } from '../utils/bengali';
import { FileText, Eye, CheckCircle2, Clock, Folder, Plus, Shield, TrendingUp } from 'lucide-react';

interface DashboardOverviewProps {
  onNavigateTab: (tab: string) => void;
  onEditArticle: (id: number) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onNavigateTab,
  onEditArticle,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api
      .getAnalytics()
      .then((res) => {
        if (!isMounted) return;
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Analytics load error:', err);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center font-bangla">
        <div className="inline-block w-8 h-8 border-3 border-red-700 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-slate-400">ড্যাশবোর্ড অ্যানালিটিক্স লোড হচ্ছে...</p>
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalPublished: 0,
    totalDrafts: 0,
    totalPending: 0,
    totalViews: 0,
    totalCategories: 0,
  };

  return (
    <div className="space-y-6 font-bangla">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <div>
          <h2 className="text-xl font-bold text-white">দৈনিক কুষ্টিয়া দিগন্ত নিউজরুম ড্যাশবোর্ড</h2>
          <p className="text-xs text-slate-400 mt-0.5">কুষ্টিয়া, খোকসা ও জাতীয় সংবাদ ডেস্কের লাইভ পরিস্থিতি</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateTab('article_new')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন সংবাদ লিখুন</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('breaking')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <span>ব্রেকিং নিউজ</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total Published */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-[11px] font-sans font-medium uppercase">Published</span>
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">
            {toBengaliNumber(metrics.totalPublished)}
          </div>
          <div className="text-xs text-slate-400 mt-1">প্রকাশিত সংবাদ</div>
        </div>

        {/* Pending Review */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <Clock className="w-5 h-5" />
            <span className="text-[11px] font-sans font-medium uppercase">Pending</span>
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">
            {toBengaliNumber(metrics.totalPending)}
          </div>
          <div className="text-xs text-slate-400 mt-1">যাচাইয়ের অপেক্ষায়</div>
        </div>

        {/* Drafts */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <FileText className="w-5 h-5" />
            <span className="text-[11px] font-sans font-medium uppercase">Drafts</span>
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">
            {toBengaliNumber(metrics.totalDrafts)}
          </div>
          <div className="text-xs text-slate-400 mt-1">খসড়া সংবাদ</div>
        </div>

        {/* Total Views */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-blue-400 mb-2">
            <Eye className="w-5 h-5" />
            <span className="text-[11px] font-sans font-medium uppercase">Total Views</span>
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">
            {toBengaliNumber(metrics.totalViews)}
          </div>
          <div className="text-xs text-slate-400 mt-1">মোট পঠিত সংখ্যা</div>
        </div>

        {/* Total Categories */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-purple-400 mb-2">
            <Folder className="w-5 h-5" />
            <span className="text-[11px] font-sans font-medium uppercase">Categories</span>
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">
            {toBengaliNumber(metrics.totalCategories)}
          </div>
          <div className="text-xs text-slate-400 mt-1">সংবাদ বিভাগ</div>
        </div>
      </div>

      {/* Grid: Top Viewed News & Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Read Articles */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-red-500" />
              <span>সর্বাধিক পঠিত সংবাদ তালিকা</span>
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('articles')}
              className="text-xs text-red-400 hover:underline"
            >
              সকল সংবাদ →
            </button>
          </div>

          <div className="space-y-3">
            {data?.topArticles?.map((art: any) => (
              <div
                key={art.id}
                className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800/60 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <h4
                    onClick={() => onEditArticle(art.id)}
                    className="text-xs font-semibold text-slate-200 hover:text-red-400 truncate cursor-pointer"
                  >
                    {art.title}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-sans">
                    /article/{art.slug}
                  </span>
                </div>
                <div className="shrink-0 text-right">
                  <span className="inline-flex items-center gap-1 text-xs text-blue-400 font-sans tabular-nums font-semibold">
                    <Eye className="w-3 h-3" /> {toBengaliNumber(art.views_count)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audit Logs */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>সম্প্রতি সম্পাদিত কার্যক্রম (Audit Logs)</span>
            </h3>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {data?.recentLogs?.map((log: any) => (
              <div
                key={log.id}
                className="text-xs p-2.5 rounded bg-slate-950/40 border border-slate-800/60"
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-semibold text-slate-300">{log.user_name}</span>
                  <span className="text-[10px] text-slate-500 font-sans">
                    {formatBengaliDateTime(log.created_at)}
                  </span>
                </div>
                <p className="text-slate-400">{log.details}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
