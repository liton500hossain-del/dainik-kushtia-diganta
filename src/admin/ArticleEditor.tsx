import React, { useEffect, useState } from 'react';
import { Article, Category, RevisionItem } from '../types/news';
import { api } from '../services/api';
import { formatBengaliDateTime } from '../utils/bengali';
import { Save, ArrowLeft, Image as ImageIcon, History, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ArticleEditorProps {
  articleId?: number | null;
  categories: Category[];
  userRole: string;
  userFullName: string;
  onBack: () => void;
  onSaved: () => void;
}

export const ArticleEditor: React.FC<ArticleEditorProps> = ({
  articleId,
  categories,
  userRole,
  userFullName,
  onBack,
  onSaved,
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [subTitle, setSubTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [imageCredit, setImageCredit] = useState('');
  const [categoryId, setCategoryId] = useState<number>(categories[0]?.id || 1);
  const [tags, setTags] = useState('');
  const [reporterName, setReporterName] = useState(userFullName);
  const [status, setStatus] = useState<'draft' | 'pending_review' | 'scheduled' | 'published' | 'archived'>('published');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBreaking, setIsBreaking] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [correctionNotice, setCorrectionNotice] = useState('');
  const [revisionNote, setRevisionNote] = useState('');

  // Revisions
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [showRevisions, setShowRevisions] = useState(false);

  useEffect(() => {
    if (!articleId) {
      if (userRole === 'reporter') setStatus('pending_review');
      return;
    }

    setLoading(true);
    api
      .getAdminArticleById(articleId)
      .then((res) => {
        const art = res.article;
        setTitle(art.title || '');
        setSubTitle(art.sub_title || '');
        setSlug(art.slug || '');
        setExcerpt(art.excerpt || '');
        setContent(art.content || '');
        setFeaturedImage(art.featured_image || '');
        setImageCaption(art.image_caption || '');
        setImageCredit(art.image_credit || '');
        setCategoryId(art.category_id || categories[0]?.id || 1);
        setTags(art.tags || '');
        setReporterName(art.reporter_name || userFullName);
        setStatus(art.status);
        setIsFeatured(art.is_featured === 1);
        setIsBreaking(art.is_breaking === 1);
        setIsPinned(art.is_pinned === 1);
        setSeoTitle(art.seo_title || '');
        setSeoDescription(art.seo_description || '');
        setCorrectionNotice(art.correction_notice || '');
        setRevisions(res.revisions || []);
        setLoading(false);
      })
      .catch((err) => {
        setMsg({ type: 'error', text: err.message || 'সংবাদ লোড করতে সমস্যা হয়েছে' });
        setLoading(false);
      });
  }, [articleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setMsg({ type: 'error', text: 'শিরোনাম এবং মূল সংবাদ অংশ পূরণ করা বাধ্যতামূলক' });
      return;
    }

    setSaving(true);
    setMsg(null);

    const payload: Partial<Article> & { revision_note?: string } = {
      title: title.trim(),
      sub_title: subTitle.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      featured_image: featuredImage.trim(),
      image_caption: imageCaption.trim(),
      image_credit: imageCredit.trim(),
      category_id: categoryId,
      tags: tags.trim(),
      reporter_name: reporterName.trim(),
      status,
      is_featured: isFeatured ? 1 : 0,
      is_breaking: isBreaking ? 1 : 0,
      is_pinned: isPinned ? 1 : 0,
      seo_title: seoTitle.trim() || title.trim(),
      seo_description: seoDescription.trim() || excerpt.trim(),
      correction_notice: correctionNotice.trim(),
      revision_note: revisionNote.trim(),
    };

    try {
      if (articleId) {
        await api.updateArticle(articleId, payload);
        setMsg({ type: 'success', text: 'সংবাদ সফলভাবে হালনাগাদ ও সংরক্ষিত হয়েছে' });
      } else {
        await api.createArticle(payload);
        setMsg({ type: 'success', text: 'নতুন সংবাদ সফলভাবে তৈরি হয়েছে' });
      }
      setTimeout(() => {
        onSaved();
      }, 1000);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'সংবাদ সংরক্ষণ করতে ব্যর্থ হয়েছে' });
    } finally {
      setSaving(false);
    }
  };

  const handleRestoreRevision = async (revId: number) => {
    if (!articleId) return;
    if (!confirm('আপনি কি এই সংস্করণটি ফিরিয়ে আনতে চান?')) return;
    try {
      await api.restoreRevision(articleId, revId);
      setMsg({ type: 'success', text: 'পূর্বের সংস্করণ পুনরুদ্ধার হয়েছে' });
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'পুনরুদ্ধার ব্যর্থ হয়েছে');
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-400 font-bangla">
        <div className="inline-block w-8 h-8 border-3 border-red-700 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p>সংবাদ লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-bangla max-w-5xl mx-auto">
      {/* Editor Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-white">
              {articleId ? 'সংবাদ সম্পাদনা' : 'নতুন সংবাদ রচনা'}
            </h2>
            <p className="text-xs text-slate-400">
              {articleId ? `আইডি: #${articleId}` : 'কুষ্টিয়া, খোকসা ও জাতীয় নিউজডেস্ক'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {articleId && revisions.length > 0 && (
            <button
              type="button"
              onClick={() => setShowRevisions(!showRevisions)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium cursor-pointer"
            >
              <History className="w-3.5 h-3.5" />
              <span>পূর্বের সংস্করণ ({revisions.length})</span>
            </button>
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {saving ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{status === 'published' ? 'সংরক্ষণ ও প্রকাশ' : 'খসড়া সংরক্ষণ'}</span>
          </button>
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

      {/* Revision Drawer / Popover */}
      {showRevisions && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs space-y-2">
          <h3 className="font-bold text-white mb-2 flex items-center gap-1.5">
            <History className="w-4 h-4 text-amber-400" />
            <span>সংবাদের পূর্ববর্তী সংস্করণের ইতিহাস</span>
          </h3>
          <div className="divide-y divide-slate-800 max-h-48 overflow-y-auto">
            {revisions.map((rev) => (
              <div key={rev.id} className="py-2 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200">{rev.title}</span>
                  <div className="text-[10px] text-slate-500 font-sans">
                    সম্পাদনায়: {rev.editor_name} · {formatBengaliDateTime(rev.created_at)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRestoreRevision(rev.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3 text-amber-400" />
                  <span>ফিরিয়ে আনুন</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content Fields (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Title */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                সংবাদের মূল শিরোনাম *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="স্পষ্ট ও আকর্ষণীয় শিরোনাম লিখুন..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-base font-headline font-semibold text-white focus:outline-hidden focus:border-red-600"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                উপ-শিরোনাম (Sub-headline)
              </label>
              <input
                type="text"
                value={subTitle}
                onChange={(e) => setSubTitle(e.target.value)}
                placeholder="শিরোনামের সহায়ক সংক্ষিপ্ত বাক্য (ঐচ্ছিক)..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-red-600"
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                সংক্ষিপ্ত সারসংক্ষেপ (Excerpt)
              </label>
              <textarea
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="হোমপেজ ও সামাজিক মাধ্যমে প্রদর্শনের জন্য ১-২ বাক্যের সারসংক্ষেপ..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-hidden focus:border-red-600"
              />
            </div>
          </div>

          {/* Full Body Content */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300">
                মূল সংবাদ কনটেন্ট (HTML বা সাধারণ টেক্সট) *
              </label>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <button
                  type="button"
                  onClick={() => setContent(content + '\n<p>নতুন অনুচ্ছেদ...</p>\n')}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded cursor-pointer"
                >
                  + অনুচ্ছেদ
                </button>
                <button
                  type="button"
                  onClick={() => setContent(content + '\n<h3 class="text-xl font-bold mt-4 mb-2">উপ-শিরোনাম</h3>\n')}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded cursor-pointer"
                >
                  + সাবহেডিং
                </button>
              </div>
            </div>

            <textarea
              required
              rows={14}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="এখানে বিস্তারিত সংবাদ লিখুন..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white font-body-bn focus:outline-hidden focus:border-red-600 font-mono leading-relaxed"
            />
          </div>

          {/* Correction Notice Field */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <label className="block text-xs font-semibold text-amber-400 mb-1">
              সম্পাদকের সংশোধনী বিজ্ঞপ্তি (Correction Notice)
            </label>
            <p className="text-[11px] text-slate-400 mb-2">
              পূর্বে প্রকাশিত সংবাদে কোনো ভুল তথ্য সংশোধন করা হলে পাঠকদের জ্ঞাতার্থে তা এখানে স্পষ্টভাবে উল্লেখ করুন।
            </p>
            <textarea
              rows={2}
              value={correctionNotice}
              onChange={(e) => setCorrectionNotice(e.target.value)}
              placeholder="উদাহরণ: এই সংবাদের পূর্ববর্তী সংস্করণে ভুলবশত... উল্লেখ করা হয়েছিল। সঠিক তথ্য হচ্ছে..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-hidden focus:border-amber-600"
            />
          </div>
        </div>

        {/* Sidebar Settings (4 cols) */}
        <div className="lg:col-span-4 space-y-4 text-xs">
          {/* Publishing Controls */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
            <h3 className="font-bold text-white text-xs border-b border-slate-800 pb-2">
              প্রকাশনা স্থিতি ও বিভাগ
            </h3>

            <div>
              <label className="block text-slate-300 mb-1 font-semibold">সংবাদ বিভাগ</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(parseInt(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-white text-xs focus:outline-hidden focus:border-red-600"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_bn} ({c.name_en})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-semibold">অবস্থা (Status)</label>
              <select
                value={status}
                disabled={userRole === 'reporter'}
                onChange={(e: any) => setStatus(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-white text-xs focus:outline-hidden focus:border-red-600 disabled:opacity-50"
              >
                <option value="published">প্রকাশিত (Published)</option>
                <option value="pending_review">পর্যালোচনার অপেক্ষায় (Pending Review)</option>
                <option value="draft">খসড়া (Draft)</option>
                <option value="archived">আর্কাইভ (Archived)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-semibold">প্রতিবেদক নাম (Byline)</label>
              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-white text-xs focus:outline-hidden focus:border-red-600"
              />
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-2">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded text-red-600 focus:ring-0"
                />
                <span>হোমপেজ বিশেষ সংবাদ (Featured Story)</span>
              </label>

              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBreaking}
                  onChange={(e) => setIsBreaking(e.target.checked)}
                  className="rounded text-red-600 focus:ring-0"
                />
                <span>ব্রেকিং নিউজ স্ট্রিপে যুক্ত করুন</span>
              </label>

              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded text-red-600 focus:ring-0"
                />
                <span>বিভাগের শীর্ষে পিন করুন</span>
              </label>
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
            <h3 className="font-bold text-white text-xs border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-red-500" />
              <span>মূল ফিচার ছবি</span>
            </h3>

            <div>
              <label className="block text-slate-300 mb-1">ছবির লিঙ্ক / পাথ</label>
              <input
                type="text"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                placeholder="/src/assets/images/... অথবা আপলোড লিঙ্ক"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-white text-xs focus:outline-hidden focus:border-red-600 font-sans"
              />
            </div>

            {featuredImage && (
              <div className="aspect-16/10 rounded overflow-hidden border border-slate-800 bg-slate-950">
                <img
                  src={featuredImage}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            <div>
              <label className="block text-slate-300 mb-1">ছবির ক্যাপশন</label>
              <input
                type="text"
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
                placeholder="ছবির বর্ণনা..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-hidden focus:border-red-600"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">ছবির কৃতজ্ঞতা / ক্রেডিট</label>
              <input
                type="text"
                value={imageCredit}
                onChange={(e) => setImageCredit(e.target.value)}
                placeholder="দৈনিক কুষ্টিয়া দিগন্ত / নিজস্ব চিত্রগ্রাহক"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-hidden focus:border-red-600"
              />
            </div>
          </div>

          {/* Tags & SEO */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
            <h3 className="font-bold text-white text-xs border-b border-slate-800 pb-2">
              ট্যাগ ও সার্চ ইঞ্জিন অপ্টিমাইজেশন
            </h3>

            <div>
              <label className="block text-slate-300 mb-1">ট্যাগসমূহ (কমা দিয়ে আলাদা করুন)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="কুষ্টিয়া, গড়াই নদী, খোকসা, রাজনীতি"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-white text-xs focus:outline-hidden focus:border-red-600"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">ইউআরএল স্লাগ (URL Slug)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="স্বয়ংক্রিয়ভাবে তৈরি হবে যদি খালি থাকে"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-white text-xs font-sans focus:outline-hidden focus:border-red-600"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
