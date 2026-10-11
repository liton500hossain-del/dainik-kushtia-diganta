import React, { useEffect, useState } from 'react';
import { Article, AdPlacement } from '../types/news';
import { api } from '../services/api';
import { formatBengaliDateTime, toBengaliNumber } from '../utils/bengali';
import { ShareButtons } from '../components/ShareButtons';
import { AdSlot } from '../components/AdSlot';
import { NewsCard } from '../components/NewsCard';
import { Printer, Calendar, User, Eye, AlertCircle, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

interface ArticleDetailProps {
  slug: string;
  inContentAd?: AdPlacement;
  bottomAd?: AdPlacement;
  sidebarAd?: AdPlacement;
  onNavigateCategory: (slug: string) => void;
  onNavigateArticle: (slug: string) => void;
}

export const ArticleDetail: React.FC<ArticleDetailProps> = ({
  slug,
  inContentAd,
  bottomAd,
  sidebarAd,
  onNavigateCategory,
  onNavigateArticle,
}) => {
  const [data, setData] = useState<{
    article: Article;
    related: Article[];
    comments: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Comment Form state
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentStatus, setCommentStatus] = useState<string | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    api
      .getArticleBySlug(slug)
      .then((res) => {
        if (!isMounted) return;
        setData(res);
        setLoading(false);
        // Track view
        if (res.article?.id) {
          api.trackView(res.article.id).catch(() => {});
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'সংবাদটি লোড করা সম্ভব হয়নি');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handlePrint = () => {
    window.print();
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.article?.id || !commentName.trim() || !commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await api.postComment(data.article.id, {
        author_name: commentName.trim(),
        author_email: commentEmail.trim(),
        comment_text: commentText.trim(),
      });
      setCommentStatus(res.message);
      setCommentName('');
      setCommentEmail('');
      setCommentText('');
    } catch (err: any) {
      setCommentStatus(err.message || 'মন্তব্য জমা দিতে ব্যর্থ হয়েছে');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center font-bangla">
        <div className="inline-block w-8 h-8 border-3 border-red-700 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-slate-600">সংবাদ লোড হচ্ছে...</p>
      </div>
    );
  }

  if (error || !data?.article) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center font-bangla">
        <div className="p-6 bg-white border border-red-200 rounded-lg shadow-xs">
          <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">সংবাদটি পাওয়া যায়নি</h2>
          <p className="text-sm text-slate-600 mb-4">{error || 'সংবাদটি সরানো হয়েছে অথবা লিঙ্কটি সঠিক নয়।'}</p>
          <a
            href="#/"
            className="inline-block px-4 py-2 bg-slate-900 text-white rounded text-sm hover:bg-slate-800 transition-colors"
          >
            প্রচ্ছদে ফিরে যান
          </a>
        </div>
      </div>
    );
  }

  const { article, related, comments } = data;

  return (
    <article className="max-w-7xl mx-auto px-4 md:px-8 py-6">
      {/* Category breadcrumb & Print bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4 text-xs font-bangla">
        <div className="flex items-center gap-2">
          <a href="#/" className="text-slate-500 hover:text-slate-800">
            প্রচ্ছদ
          </a>
          <span className="text-slate-400">/</span>
          {article.category_slug && (
            <button
              type="button"
              onClick={() => onNavigateCategory(article.category_slug!)}
              className="text-red-700 font-semibold hover:underline cursor-pointer"
            >
              {article.category_name_bn}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="no-print inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>প্রিন্ট করুন</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Article Content Column */}
        <div className="lg:col-span-8">
          {/* Main Headline */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-headline font-bold text-slate-950 leading-snug balance mb-3">
            {article.title}
          </h1>

          {/* Subheadline if exists */}
          {article.sub_title && (
            <p className="text-base sm:text-lg text-slate-700 font-bangla font-medium leading-relaxed mb-4 border-l-2 border-red-700 pl-3">
              {article.sub_title}
            </p>
          )}

          {/* Bylines, Date & Views */}
          <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-y border-slate-200 text-xs text-slate-600 font-bangla mb-5">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-red-700" />
              <span className="font-semibold text-slate-800">{article.reporter_name}</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>প্রকাশ: {formatBengaliDateTime(article.published_at || article.created_at)}</span>
              </div>
              {article.views_count > 0 && (
                <div className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>পঠিত: {toBengaliNumber(article.views_count)} বার</span>
                </div>
              )}
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="no-print mb-6">
            <ShareButtons
              url={`/article/${article.slug}`}
              title={article.title}
              summary={article.excerpt}
            />
          </div>

          {/* Featured Image */}
          {article.featured_image && (
            <figure className="mb-6 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
              <img
                src={article.featured_image}
                alt={article.title}
                className="w-full max-h-[500px] object-cover"
                referrerPolicy="no-referrer"
              />
              {(article.image_caption || article.image_credit) && (
                <figcaption className="p-2.5 bg-slate-100 text-xs text-slate-600 font-bangla flex flex-col sm:flex-row justify-between gap-1 border-t border-slate-200">
                  {article.image_caption && <span>{article.image_caption}</span>}
                  {article.image_credit && (
                    <span className="text-slate-500 font-medium sm:text-right shrink-0">
                      ছবি: {article.image_credit}
                    </span>
                  )}
                </figcaption>
              )}
            </figure>
          )}

          {/* Correction Notice (if article was corrected by editor) */}
          {article.correction_notice && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-900 text-xs font-bangla">
              <div className="flex items-center gap-2 font-bold text-amber-800 mb-1">
                <AlertCircle className="w-4 h-4" />
                <span>সম্পাদকের সংশোধনী বিজ্ঞপ্তি</span>
              </div>
              <p>{article.correction_notice}</p>
            </div>
          )}

          {/* Article Body Prose */}
          <div className="article-body font-body-bn text-base sm:text-lg text-slate-800 leading-relaxed space-y-4">
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          </div>

          {/* In-content Advertisement Slot */}
          {inContentAd && inContentAd.is_active && (
            <div className="no-print my-6">
              <AdSlot slotKey="article_in_content" ad={inContentAd} />
            </div>
          )}

          {/* Tags */}
          {article.tags && (
            <div className="mt-8 pt-4 border-t border-slate-200">
              <span className="text-xs font-semibold text-slate-700 mr-2 font-bangla">বিষয়/ট্যাগ:</span>
              <div className="inline-flex flex-wrap gap-2 text-xs text-slate-600 font-bangla">
                {article.tags.split(',').map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded cursor-pointer"
                  >
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Second Social Share Strip */}
          <div className="no-print mt-6">
            <ShareButtons
              url={`/article/${article.slug}`}
              title={article.title}
              summary={article.excerpt}
            />
          </div>

          {/* Bottom Ad Slot */}
          {bottomAd && bottomAd.is_active && (
            <div className="no-print my-6">
              <AdSlot slotKey="article_bottom" ad={bottomAd} />
            </div>
          )}

          {/* Comments Section */}
          <section className="no-print mt-10 pt-6 border-t-2 border-slate-200 font-bangla">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-red-700" />
              <span>মন্তব্যসমূহ ({toBengaliNumber(comments.length)})</span>
            </h3>

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
              <h4 className="text-sm font-semibold text-slate-800 mb-3">আপনার মতামত জানান:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  required
                  placeholder="আপনার নাম *"
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  className="bg-white border border-slate-300 rounded px-3 py-2 text-sm focus:outline-hidden focus:border-red-600"
                />
                <input
                  type="email"
                  placeholder="ইমেইল (ঐচ্ছিক, প্রকাশ হবে না)"
                  value={commentEmail}
                  onChange={(e) => setCommentEmail(e.target.value)}
                  className="bg-white border border-slate-300 rounded px-3 py-2 text-sm focus:outline-hidden focus:border-red-600"
                />
              </div>
              <textarea
                required
                rows={3}
                placeholder="সংবাদের ওপর আপনার গঠনমূলক মন্তব্য লিখুন... *"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded p-3 text-sm focus:outline-hidden focus:border-red-600 mb-3"
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  * প্রকাশের পূর্বে সম্পাদকীয় নীতিমালা অনুযায়ী মন্তব্য যাচাই করা হতে পারে।
                </span>
                <button
                  type="submit"
                  disabled={submittingComment}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>মন্তব্য পাঠান</span>
                </button>
              </div>

              {commentStatus && (
                <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{commentStatus}</span>
                </div>
              )}
            </form>

            {/* Comments List */}
            {comments.length > 0 ? (
              <div className="space-y-3">
                {comments.map((c) => (
                  <div key={c.id} className="p-3 bg-white border border-slate-200 rounded text-xs">
                    <div className="flex items-center justify-between font-semibold text-slate-800 mb-1">
                      <span>{c.author_name}</span>
                      <span className="text-[11px] text-slate-400 font-normal">
                        {formatBengaliDateTime(c.created_at)}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{c.comment_text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">এখনও কোনো মন্তব্য করা হয়নি। আপনার মতামত জানান প্রথম!</p>
            )}
          </section>
        </div>

        {/* Sidebar Column */}
        <aside className="no-print lg:col-span-4 space-y-6 font-bangla">
          {/* Sidebar Ad Placement */}
          {sidebarAd && sidebarAd.is_active && (
            <AdSlot slotKey="sidebar_top" ad={sidebarAd} className="my-0" />
          )}

          {/* Related Articles in Same Category */}
          {related.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 border-b border-red-700 pb-2 mb-3 flex items-center justify-between">
                <span>এই বিভাগের অন্যান্য সংবাদ</span>
                {article.category_slug && (
                  <button
                    type="button"
                    onClick={() => onNavigateCategory(article.category_slug!)}
                    className="text-xs font-normal text-red-700 hover:underline"
                  >
                    সব দেখুন →
                  </button>
                )}
              </h3>
              <div className="space-y-1">
                {related.map((relArt) => (
                  <NewsCard
                    key={relArt.id}
                    article={relArt}
                    variant="compact"
                    showCategory={false}
                    onNavigate={onNavigateArticle}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Newspaper Editorial Note */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-600">
            <h4 className="font-bold text-slate-900 mb-1">পাঠকের দৃষ্টি আকর্ষণ:</h4>
            <p className="leading-relaxed">
              দৈনিক কুষ্টিয়া দিগন্ত কোনো খবর যাচাই ছাড়া প্রকাশ করে না। কোনো খবরের সত্যতা নিয়ে আপনার কোনো তথ্য থাকলে আমাদের বার্তা ডেস্কে যোগাযোগ করুন: <a href="mailto:news@kushtiadiganta.com" className="text-red-700 font-medium">news@kushtiadiganta.com</a>
            </p>
          </div>
        </aside>
      </div>
    </article>
  );
};
