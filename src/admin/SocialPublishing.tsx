import React, { useEffect, useState } from 'react';
import { SocialShare, SiteSettings } from '../types/news';
import { api } from '../services/api';
import { formatBengaliDateTime } from '../utils/bengali';
import { Share2, Save, Send, AlertCircle, CheckCircle2, RotateCcw, Info } from 'lucide-react';

export const SocialPublishing: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [shares, setShares] = useState<SocialShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testPublishing, setTestPublishing] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form
  const [pageId, setPageId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [appId, setAppId] = useState('');
  const [appSecret, setAppSecret] = useState('');
  const [autoPublish, setAutoPublish] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([api.getAdminSettings(), api.getSocialShares()])
      .then(([settingsRes, sharesRes]) => {
        setSettings(settingsRes);
        setPageId(settingsRes.facebook_page_id || '');
        setAccessToken(settingsRes.facebook_access_token || '');
        setAppId(settingsRes.meta_app_id || '');
        setAppSecret(settingsRes.meta_app_secret || '');
        setAutoPublish(settingsRes.auto_facebook_publish === '1');
        setShares(sharesRes || []);
        setLoading(false);
      })
      .catch((err) => {
        setMsg({ type: 'error', text: err.message || 'ডাটা লোড করতে ব্যর্থ' });
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      await api.updateAdminSettings({
        facebook_page_id: pageId.trim(),
        facebook_access_token: accessToken.trim(),
        meta_app_id: appId.trim(),
        meta_app_secret: appSecret.trim(),
        auto_facebook_publish: autoPublish ? '1' : '0',
      });
      setMsg({ type: 'success', text: 'মেটা ও ফেসবুক পাবলিশিং সেটিংস সংরক্ষিত হয়েছে' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'সংরক্ষণ ব্যর্থ' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestPublish = async () => {
    if (!pageId || !accessToken) {
      alert('পরীক্ষামূলক পাবলিশের পূর্বে ফেসবুক পেজ আইডি এবং অ্যাক্সেস টোকেন সংরক্ষণ করুন।');
      return;
    }

    setTestPublishing(true);
    setMsg(null);

    try {
      // Find latest published article to test
      const articles = await api.getAdminArticles('published');
      if (!articles || articles.length === 0) {
        alert('পরীক্ষার জন্য অন্তত একটি প্রকাশিত সংবাদ প্রয়োজন');
        return;
      }
      const testArt = articles[0];
      const res = await api.publishFacebook(testArt.id);
      if (res.share.status === 'published') {
        setMsg({ type: 'success', text: `ফেসবুকে সফলভাবে শেয়ার হয়েছে! পোস্ট আইডি: ${res.share.post_id}` });
      } else {
        setMsg({ type: 'error', text: `পাবলিশ ব্যর্থ হয়েছে: ${res.share.error_message || 'অজানা ত্রুটি'}` });
      }
      loadData();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'টেস্ট পাবলিশ ব্যর্থ' });
    } finally {
      setTestPublishing(false);
    }
  };

  return (
    <div className="space-y-6 font-bangla">
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-400" />
            <span>ফেসবুক ও সোশ্যাল মিডিয়া অটো-পাবলিশিং কনফিগারেশন</span>
          </h2>
          <p className="text-xs text-slate-400">
            অফিসিয়াল Meta Graph API ইন্টিগ্রেশন ও ফেসবুক পেজে স্বয়ংক্রিয় সংবাদ প্রকাশ
          </p>
        </div>

        <button
          type="button"
          onClick={handleTestPublish}
          disabled={testPublishing}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{testPublishing ? 'শেয়ার হচ্ছে...' : 'টেস্ট পোস্ট পাঠান'}</span>
        </button>
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
        {/* Settings Form (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4 text-xs">
          <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-2">
            মেটা গ্রাফ এপিআই (Meta Graph API) ক্রিডেনশিয়াল
          </h3>

          <form onSubmit={handleSaveSettings} className="space-y-3">
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">ফেসবুক পেজ আইডি (Page ID)</label>
              <input
                type="text"
                value={pageId}
                onChange={(e) => setPageId(e.target.value)}
                placeholder="যেমন: 104859239485..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-sans focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-semibold">
                পেজ অ্যাক্সেস টোকেন (Page Access Token)
              </label>
              <textarea
                rows={3}
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="EAABw..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono text-[11px] focus:outline-hidden focus:border-blue-500"
              />
              <span className="text-[10px] text-slate-500 block mt-0.5">
                * পেজ ম্যানেজ ও পোস্ট পাবলিশের জন্য দীর্ঘস্থায়ী (Never Expire) টোকেন ব্যবহার করুন।
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Meta App ID (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  placeholder="App ID"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-sans focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Meta App Secret (ঐচ্ছিক)</label>
                <input
                  type="password"
                  value={appSecret}
                  onChange={(e) => setAppSecret(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-sans focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer bg-slate-950 p-3 rounded-lg border border-slate-800">
                <input
                  type="checkbox"
                  checked={autoPublish}
                  onChange={(e) => setAutoPublish(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <div>
                  <span className="font-semibold block text-white">সংবাদ প্রকাশের সাথে সাথে স্বয়ংক্রিয় ফেসবুক শেয়ার</span>
                  <span className="text-[11px] text-slate-400">
                    চেক করা থাকলে নতুন কোনো সংবাদ ‘Published’ স্ট্যাটাসে সংরক্ষণ করলেই তা স্বয়ংক্রিয়ভাবে ফেসবুক পেজে পোস্ট হবে।
                  </span>
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'ফেসবুক সেটিংস সংরক্ষণ করুন'}</span>
            </button>
          </form>
        </div>

        {/* Setup Instructions & Status (6 cols) */}
        <div className="lg:col-span-6 space-y-4 text-xs">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl text-slate-300 space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5 text-blue-400">
              <Info className="w-4 h-4" />
              <span>মেটা (Meta) এপিআই সেটআপ চেকলিস্ট</span>
            </h3>
            <ol className="list-decimal pl-4 space-y-2 text-slate-400 leading-relaxed">
              <li>
                <strong className="text-slate-200">Meta for Developers</strong> (developers.facebook.com)-এ একটি Business App তৈরি করুন।
              </li>
              <li>
                <strong className="text-slate-200">Permissions:</strong> আপনার অ্যাপে <code className="text-amber-400">pages_manage_posts</code> এবং <code className="text-amber-400">pages_read_engagement</code> পারমিশন অনুমোদন করুন।
              </li>
              <li>
                <strong className="text-slate-200">Page Access Token:</strong> Graph API Explorer থেকে আপনার পেজের জন্য পার্মানেন্ট Page Token জেনারেট করে বাম পাশের ফিল্ডে পেস্ট করুন।
              </li>
              <li>
                টোকেন না থাকলে পাঠকদের জন্য সরাসরি সুবিধাজনক ম্যানুয়াল শেয়ার বাটন সর্বদা কার্যকর থাকে।
              </li>
            </ol>
          </div>

          {/* Social shares history */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-2 mb-3">
              সাম্প্রতিক শেয়ার লগ ({shares.length})
            </h3>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {shares.length > 0 ? (
                shares.map((sh) => (
                  <div
                    key={sh.id}
                    className="p-2.5 bg-slate-950 border border-slate-800/80 rounded flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-slate-200 truncate block">
                        {sh.article_title}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {formatBengaliDateTime(sh.created_at)}
                      </div>
                    </div>
                    <div className="shrink-0 ml-2">
                      {sh.status === 'published' ? (
                        <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                          সফল
                        </span>
                      ) : (
                        <span
                          className="text-[10px] text-red-400 bg-red-950 px-2 py-0.5 rounded border border-red-800 cursor-help"
                          title={sh.error_message}
                        >
                          ব্যর্থ
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs">
                  এখনও কোনো ফেসবুক পোস্টের লগ নেই।
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
