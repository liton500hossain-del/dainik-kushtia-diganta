import React, { useEffect, useState } from 'react';
import { BreakingNewsItem, Article } from '../types/news';
import { api } from '../services/api';
import { Flame, Plus, Trash2, Edit2, AlertCircle, CheckCircle2 } from 'lucide-react';

export const BreakingManager: React.FC = () => {
  const [items, setItems] = useState<BreakingNewsItem[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form
  const [title, setTitle] = useState('');
  const [articleId, setArticleId] = useState<number | undefined>(undefined);
  const [externalUrl, setExternalUrl] = useState('');
  const [priority, setPriority] = useState(1);
  const [isActive, setIsActive] = useState(true);

  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([api.getAdminBreaking(), api.getAdminArticles('published')])
      .then(([breakingRes, articlesRes]) => {
        setItems(breakingRes || []);
        setArticles(articlesRes || []);
        setLoading(false);
      })
      .catch((err) => {
        setMsg({ type: 'error', text: err.message || 'ব্রেকিং নিউজ লোড ব্যর্থ' });
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setArticleId(undefined);
    setExternalUrl('');
    setPriority(items.length + 1);
    setIsActive(true);
  };

  const handleEdit = (item: BreakingNewsItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setArticleId(item.article_id);
    setExternalUrl(item.external_url || '');
    setPriority(item.priority);
    setIsActive(item.is_active === 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setMsg({ type: 'error', text: 'শিরোনাম লিখুন' });
      return;
    }

    try {
      if (editingId) {
        await api.updateBreaking(editingId, {
          title: title.trim(),
          article_id: articleId,
          external_url: externalUrl.trim(),
          priority,
          is_active: isActive ? 1 : 0,
        });
        setMsg({ type: 'success', text: 'ব্রেকিং নিউজ হালনাগাদ হয়েছে' });
      } else {
        await api.createBreaking({
          title: title.trim(),
          article_id: articleId,
          external_url: externalUrl.trim(),
          priority,
          is_active: isActive ? 1 : 0,
        });
        setMsg({ type: 'success', text: 'নতুন ব্রেকিং নিউজ যুক্ত হয়েছে' });
      }
      resetForm();
      loadData();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'সংরক্ষণ ব্যর্থ' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('মুছে ফেলতে চান?')) return;
    try {
      await api.deleteBreaking(id);
      setMsg({ type: 'success', text: 'মুছে ফেলা হয়েছে' });
      loadData();
    } catch (err: any) {
      alert(err.message || 'মুছতে ব্যর্থ');
    }
  };

  return (
    <div className="space-y-6 font-bangla">
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-500" />
            <span>ব্রেকিং নিউজ ও স্ক্রল টিকর ব্যবস্থাপনা</span>
          </h2>
          <p className="text-xs text-slate-400">
            ওয়েবসাইটের শীর্ষ স্ট্রিপে প্রদর্শিত তাজা খবরের শিরোনাম নিয়ন্ত্রণ
          </p>
        </div>
      </div>

      {msg && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
            msg.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-200'
              : 'bg-red-950/80 border border-red-800 text-red-200'
          }`}
        >
          {msg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-2 mb-4">
            {editingId ? 'ব্রেকিং হেডলাইন সম্পাদনা' : 'নতুন ব্রেকিং হেডলাইন যোগ'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">ব্রেকিং শিরোনাম *</label>
              <textarea
                required
                rows={3}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="জরুরি খবর বা শিরোনাম লিখুন..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:outline-hidden focus:border-red-600"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-semibold">সংবাদের সাথে লিংক করুন (ঐচ্ছিক)</label>
              <select
                value={articleId || ''}
                onChange={(e) => setArticleId(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-white text-xs focus:outline-hidden focus:border-red-600"
              >
                <option value="">কোনো আর্টিকেলের সাথে যুক্ত নয়</option>
                {articles.map((art) => (
                  <option key={art.id} value={art.id}>
                    {art.title.slice(0, 45)}...
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">অগ্রাধিকার (Priority)</label>
                <input
                  type="number"
                  value={priority}
                  onChange={(e) => setPriority(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-hidden focus:border-red-600 font-sans"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-red-600 focus:ring-0"
                  />
                  <span>সক্রিয় রাখুন</span>
                </label>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                {editingId ? 'হালনাগাদ সংরক্ষণ' : 'হেডলাইন সংরক্ষণ'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs cursor-pointer"
                >
                  বাতিল
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center text-xs text-slate-400">
            <span className="font-semibold text-white">বর্তমান ব্রেকিং তালিকা ({items.length})</span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {items.map((it) => (
              <div key={it.id} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-800/40">
                <div className="min-w-0 flex-1 text-xs">
                  <div className="font-semibold text-white line-clamp-2">{it.title}</div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                    <span className={it.is_active === 1 ? 'text-emerald-400 font-medium' : 'text-slate-500'}>
                      {it.is_active === 1 ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </span>
                    <span>· অগ্রাধিকার: {it.priority}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleEdit(it)}
                    className="p-1 text-slate-400 hover:text-amber-400 rounded"
                    title="সম্পাদনা"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(it.id)}
                    className="p-1 text-slate-400 hover:text-red-400 rounded"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
