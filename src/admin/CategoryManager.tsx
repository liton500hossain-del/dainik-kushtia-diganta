import React, { useEffect, useState } from 'react';
import { Category } from '../types/news';
import { api } from '../services/api';
import { toBengaliNumber } from '../utils/bengali';
import { Plus, Edit2, Trash2, Folder, AlertCircle, CheckCircle2 } from 'lucide-react';

export const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form fields
  const [nameBn, setNameBn] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState(1);
  const [inNavbar, setInNavbar] = useState(true);

  // Message & Reassign modal
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [reassignModal, setReassignModal] = useState<{ catId: number; count: number } | null>(null);
  const [reassignTo, setReassignTo] = useState<number>(1);

  const loadCategories = () => {
    setLoading(true);
    api
      .getAdminCategories()
      .then((res) => {
        setCategories(res || []);
        setLoading(false);
      })
      .catch((err) => {
        setMsg({ type: 'error', text: err.message || 'বিভাগ লোড ব্যর্থ' });
        setLoading(false);
      });
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setNameBn('');
    setNameEn('');
    setSlug('');
    setDescription('');
    setSortOrder(categories.length + 1);
    setInNavbar(true);
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setNameBn(cat.name_bn);
    setNameEn(cat.name_en);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setSortOrder(cat.sort_order);
    setInNavbar(cat.in_navbar === 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameBn.trim() || !nameEn.trim() || !slug.trim()) {
      setMsg({ type: 'error', text: 'বাংলা নাম, ইংরেজি নাম এবং স্লাগ আবশ্যক' });
      return;
    }

    setMsg(null);
    try {
      if (editingId) {
        await api.updateCategory(editingId, {
          name_bn: nameBn.trim(),
          name_en: nameEn.trim(),
          slug: slug.trim().toLowerCase(),
          description: description.trim(),
          sort_order: sortOrder,
          in_navbar: inNavbar ? 1 : 0,
        });
        setMsg({ type: 'success', text: 'বিভাগ সফলভাবে হালনাগাদ হয়েছে' });
      } else {
        await api.createCategory({
          name_bn: nameBn.trim(),
          name_en: nameEn.trim(),
          slug: slug.trim().toLowerCase(),
          description: description.trim(),
          sort_order: sortOrder,
          in_navbar: inNavbar ? 1 : 0,
        });
        setMsg({ type: 'success', text: 'নতুন বিভাগ যুক্ত হয়েছে' });
      }
      resetForm();
      loadCategories();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'সংরক্ষণ ব্যর্থ হয়েছে' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('আপনি কি এই বিভাগটি মুছে ফেলতে চান?')) return;
    try {
      await api.deleteCategory(id);
      setMsg({ type: 'success', text: 'বিভাগ মুছে ফেলা হয়েছে' });
      loadCategories();
    } catch (err: any) {
      if (err.message.includes('স্থানান্তর')) {
        // Requires reassign
        const cat = categories.find((c) => c.id === id);
        setReassignModal({ catId: id, count: cat?.article_count || 1 });
      } else {
        setMsg({ type: 'error', text: err.message || 'বিভাগ মুছতে সমস্যা হয়েছে' });
      }
    }
  };

  const handleReassignAndDelete = async () => {
    if (!reassignModal) return;
    try {
      await api.deleteCategory(reassignModal.catId, reassignTo);
      setMsg({ type: 'success', text: 'সংবাদ স্থানান্তর করে বিভাগ মুছে ফেলা হয়েছে' });
      setReassignModal(null);
      loadCategories();
    } catch (err: any) {
      alert(err.message || 'স্থানান্তর ব্যর্থ');
    }
  };

  return (
    <div className="space-y-6 font-bangla">
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Folder className="w-5 h-5 text-red-500" />
            <span>সংবাদ বিভাগ ব্যবস্থাপনা</span>
          </h2>
          <p className="text-xs text-slate-400">
            ওয়েবসাইটের প্রধান ও বিশেষ সংবাদ ক্যাটাগরি সাজান ও নিয়ন্ত্রণ করুন
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
        {/* Category Form (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-2 mb-4">
            {editingId ? 'বিভাগ সম্পাদনা করুন' : 'নতুন বিভাগ যুক্ত করুন'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">বাংলা নাম *</label>
              <input
                type="text"
                required
                value={nameBn}
                onChange={(e) => {
                  setNameBn(e.target.value);
                  if (!editingId && !slug) {
                    setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                  }
                }}
                placeholder="যেমন: কুষ্টিয়া, খোকসা, রাজনীতি..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-hidden focus:border-red-600"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-semibold">ইংরেজি নাম *</label>
              <input
                type="text"
                required
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="যেমন: Kushtia, Politics..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-hidden focus:border-red-600"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-semibold">ইউআরএল স্লাগ (Slug) *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="kushtia, khoksa..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs font-sans focus:outline-hidden focus:border-red-600"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">বিভাগের বিবরণ (ঐচ্ছিক)</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="বিভাগের সংক্ষিপ্ত পরিচয়..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs focus:outline-hidden focus:border-red-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">ক্রম (Order)</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-hidden focus:border-red-600 font-sans"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inNavbar}
                    onChange={(e) => setInNavbar(e.target.checked)}
                    className="rounded text-red-600 focus:ring-0"
                  />
                  <span>নেভিবারে দেখাবে</span>
                </label>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                {editingId ? 'হালনাগাদ সংরক্ষণ' : 'বিভাগ তৈরি করুন'}
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

        {/* Category List (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center text-xs text-slate-400">
            <span className="font-semibold text-white">বিদ্যমান বিভাগসমূহ ({categories.length})</span>
            <span>ক্রমানুসারে সাজানো</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-[11px]">
                <tr>
                  <th className="p-3">ক্রম</th>
                  <th className="p-3">বাংলা ও ইংরেজি নাম</th>
                  <th className="p-3">স্লাগ</th>
                  <th className="p-3">সংবাদ সংখ্যা</th>
                  <th className="p-3 text-right">পদক্ষেপ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-sans tabular-nums text-slate-500">{c.sort_order}</td>
                    <td className="p-3 font-semibold text-white">
                      <div>{c.name_bn}</div>
                      <div className="text-[10px] text-slate-500 font-sans font-normal">{c.name_en}</div>
                    </td>
                    <td className="p-3 font-sans text-slate-400 text-[11px]">{c.slug}</td>
                    <td className="p-3 font-sans tabular-nums text-slate-400">
                      {toBengaliNumber(c.article_count || 0)} টি
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleEdit(c)}
                        className="p-1 text-slate-400 hover:text-amber-400 rounded mr-1"
                        title="সম্পাদনা"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id)}
                        className="p-1 text-slate-400 hover:text-red-400 rounded"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Orphan Protection / Reassignment Modal */}
      {reassignModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-2xl text-xs">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <span>বিদ্যমান সংবাদ স্থানান্তর পরিকল্পনা</span>
            </h3>
            <p className="text-slate-300 mb-4 leading-relaxed">
              এই বিভাগে বর্তমানে <strong className="text-amber-400">{toBengaliNumber(reassignModal.count)}</strong> টি সংবাদ সংরক্ষিত রয়েছে। বিভাগটি মুছতে হলে সংবাদগুলোকে অন্য কোন বিভাগে স্থানান্তর করতে চান তা নির্বাচন করুন:
            </p>

            <div className="mb-4">
              <label className="block text-slate-300 mb-1 font-semibold">নতুন গন্তব্য বিভাগ নির্বাচন করুন:</label>
              <select
                value={reassignTo}
                onChange={(e) => setReassignTo(parseInt(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:outline-hidden focus:border-red-600"
              >
                {categories
                  .filter((c) => c.id !== reassignModal.catId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name_bn} ({c.name_en})
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setReassignModal(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleReassignAndDelete}
                className="px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white font-semibold rounded"
              >
                স্থানান্তর ও ডিলিট নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
