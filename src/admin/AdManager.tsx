import React, { useEffect, useState } from 'react';
import { AdPlacement } from '../types/news';
import { api } from '../services/api';
import { DollarSign, Save, ShieldAlert, CheckCircle2, HelpCircle, Eye } from 'lucide-react';

export const AdManager: React.FC = () => {
  const [ads, setAds] = useState<AdPlacement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<string>('header_banner');
  const [currentAd, setCurrentAd] = useState<AdPlacement | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'slots' | 'guide'>('slots');

  const loadAds = () => {
    setLoading(true);
    api
      .getAdminAds()
      .then((res) => {
        setAds(res || []);
        const current = res.find((a) => a.slot_key === selectedSlot) || res[0];
        if (current) {
          setSelectedSlot(current.slot_key);
          setCurrentAd({ ...current });
        }
        setLoading(false);
      })
      .catch((err) => {
        setMsg({ type: 'error', text: err.message || 'বিজ্ঞাপন তালিকা লোড ব্যর্থ' });
        setLoading(false);
      });
  };

  useEffect(() => {
    loadAds();
  }, []);

  const handleSelectSlot = (key: string) => {
    setSelectedSlot(key);
    const found = ads.find((a) => a.slot_key === key);
    if (found) setCurrentAd({ ...found });
    setMsg(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAd) return;

    setSaving(true);
    setMsg(null);

    try {
      await api.updateAdSlot(currentAd.slot_key, currentAd);
      setMsg({ type: 'success', text: 'বিজ্ঞাপন স্লট সফলভাবে সংরক্ষিত হয়েছে' });
      // Update local array
      setAds(ads.map((a) => (a.slot_key === currentAd.slot_key ? { ...currentAd } : a)));
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'সংরক্ষণ ব্যর্থ হয়েছে' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-bangla">
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span>বিজ্ঞাপন ও অ্যাডস্টেরা (Adsterra) নেটওয়ার্ক কনফিগারেশন</span>
          </h2>
          <p className="text-xs text-slate-400">
            ব্যানার বিজ্ঞাপন ও অ্যাডস্টেরা কোড স্নিপেট সুরক্ষিতভাবে নিয়ন্ত্রণ করুন
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('slots')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'slots'
                ? 'bg-red-700 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            বিজ্ঞাপন স্লটসমূহ
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
              activeTab === 'guide'
                ? 'bg-red-700 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>অ্যাডস্টেরা সেটআপ গাইড</span>
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
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{msg.text}</span>
        </div>
      )}

      {activeTab === 'guide' ? (
        /* ADSTERRA INTEGRATION GUIDE & CHECKLIST */
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-6 text-xs text-slate-300">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white mb-1">
              অ্যাডস্টেরা (Adsterra) বিজ্ঞাপন যুক্ত করার নির্দেশিকা ও চেকলিস্ট
            </h3>
            <p className="text-slate-400">
              নিচে বর্ণিত নিয়মাবলী অনুসরণ করে আপনার নিজস্ব Adsterra একাউন্টের সঠিক কোড সংযুক্ত করুন:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
              <h4 className="font-bold text-white mb-2 text-sm text-red-400">১. ডিসপ্লে ব্যানার (Display Banner)</h4>
              <p className="text-slate-400 leading-relaxed mb-3">
                728x90 (হেডার/ফুটার), 300x250 (সাইডবার) অথবা 468x60 ব্যানারের জন্য Adsterra ড্যাশবোর্ড থেকে প্রাপ্ত কোডটি স্লটে পেস্ট করুন।
              </p>
              <span className="text-[10px] text-slate-500 font-sans block">প্রস্তাবিত স্লট: Header, Sidebar Top, Content Mid</span>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
              <h4 className="font-bold text-white mb-2 text-sm text-amber-400">২. সোশ্যাল বার (Social Bar)</h4>
              <p className="text-slate-400 leading-relaxed mb-3">
                Adsterra-র সর্বাধিক কার্যকরী ফরম্যাট। এটি নন-ইনট্রুসিভ পুশ নোটিফিকেশন বার হিসেবে লোড হয়। ‘adsterra_social_bar’ স্লটে কোড বসিয়ে ‘সক্রিয়’ করুন।
              </p>
              <span className="text-[10px] text-slate-500 font-sans block">প্রস্তাবিত স্লট: Adsterra Social Bar</span>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
              <h4 className="font-bold text-white mb-2 text-sm text-blue-400">৩. পপআন্ডার (Popunder)</h4>
              <p className="text-slate-400 leading-relaxed mb-3">
                ক্লিক-ভিত্তিক আন্ডারল্যাগ বিজ্ঞাপন। নীতিমালার সাথে সংগতি রেখে ‘adsterra_popunder’ স্লটে স্ক্রিপ্ট পেস্ট করুন এবং চাইলে এক ক্লিকে নিষ্ক্রিয় করতে পারবেন।
              </p>
              <span className="text-[10px] text-slate-500 font-sans block">প্রস্তাবিত স্লট: Adsterra Popunder</span>
            </div>
          </div>

          <div className="p-4 bg-slate-950/80 border border-amber-900/60 rounded-lg text-amber-200">
            <h4 className="font-bold mb-1 flex items-center gap-1.5 text-amber-300">
              <ShieldAlert className="w-4 h-4" />
              <span>নিরাপত্তা ও কনফিগারেশন সতর্কবার্তা</span>
            </h4>
            <p className="leading-relaxed">
              * কোনো ভুয়া বা ফেক পাবলিশার আইডি সিস্টেম তৈরি করে না। সর্বদা আপনার ভেরিফাইড Adsterra একাউন্ট থেকে জেনারেট করা কোড ব্যবহার করুন।<br />
              * সাধারণ রিপোর্টারদের বিজ্ঞাপন পরিবর্তনের কোনো অনুমতি নেই—শুধুমাত্র বিশ্বস্ত প্রধান প্রশাসকই (Super Admin) বিজ্ঞাপন কোড সংরক্ষণ করতে পারবেন।
            </p>
          </div>
        </div>
      ) : (
        /* AD SLOTS MANAGEMENT */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Slot Selector List (4 cols) */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 px-3 py-1.5 block uppercase tracking-wider">
              উপলব্ধ বিজ্ঞাপন স্লটসমূহ
            </span>

            {ads.map((ad) => (
              <button
                key={ad.slot_key}
                type="button"
                onClick={() => handleSelectSlot(ad.slot_key)}
                className={`w-full text-left p-3 rounded-lg transition-colors flex items-center justify-between text-xs cursor-pointer ${
                  selectedSlot === ad.slot_key
                    ? 'bg-red-700 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/70'
                }`}
              >
                <div>
                  <div className="truncate font-bangla">{ad.name}</div>
                  <div className={`text-[10px] font-sans ${selectedSlot === ad.slot_key ? 'text-red-200' : 'text-slate-500'}`}>
                    {ad.slot_key}
                  </div>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-sans font-medium ${
                    ad.is_active === 1
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-slate-950 text-slate-500'
                  }`}
                >
                  {ad.is_active === 1 ? 'সক্রিয়' : 'বন্ধ'}
                </span>
              </button>
            ))}
          </div>

          {/* Slot Config Form (8 cols) */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5">
            {currentAd ? (
              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">{currentAd.name}</h3>
                    <span className="text-[11px] text-slate-500 font-sans">
                      স্লট আইডেন্টিফায়ার: {currentAd.slot_key}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                      <input
                        type="checkbox"
                        checked={currentAd.is_active === 1}
                        onChange={(e) =>
                          setCurrentAd({ ...currentAd, is_active: e.target.checked ? 1 : 0 })
                        }
                        className="rounded text-red-600 focus:ring-0"
                      />
                      <span className="font-semibold">স্লট চালু রাখুন</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">বিজ্ঞাপনের ধরন (Ad Type)</label>
                    <select
                      value={currentAd.ad_type}
                      onChange={(e: any) =>
                        setCurrentAd({ ...currentAd, ad_type: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-hidden focus:border-red-600"
                    >
                      <option value="custom_code">কাস্টম স্ক্রিপ্ট / Adsterra কোড</option>
                      <option value="banner">ইমেজ ব্যানার ও লিঙ্ক (Direct Banner)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">ডিভাইস টার্গেটিং</label>
                    <select
                      value={currentAd.device_target}
                      onChange={(e: any) =>
                        setCurrentAd({ ...currentAd, device_target: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-hidden focus:border-red-600 font-sans"
                    >
                      <option value="all">সকল ডিভাইস (Desktop & Mobile)</option>
                      <option value="desktop">শুধুমাত্র ডেস্কটপ (Desktop Only)</option>
                      <option value="mobile">শুধুমাত্র মোবাইল (Mobile Only)</option>
                    </select>
                  </div>
                </div>

                {currentAd.ad_type === 'banner' ? (
                  <div className="space-y-3 p-4 bg-slate-950/60 border border-slate-800 rounded-lg">
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">ব্যানার ছবির URL</label>
                      <input
                        type="text"
                        value={currentAd.banner_image || ''}
                        onChange={(e) =>
                          setCurrentAd({ ...currentAd, banner_image: e.target.value })
                        }
                        placeholder="https://... অথবা /api/uploads/..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs font-sans focus:outline-hidden focus:border-red-600"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">ক্লিক গন্তব্য লিঙ্ক (Target URL)</label>
                      <input
                        type="text"
                        value={currentAd.target_url || ''}
                        onChange={(e) =>
                          setCurrentAd({ ...currentAd, target_url: e.target.value })
                        }
                        placeholder="https://client-website.com"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs font-sans focus:outline-hidden focus:border-red-600"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block text-slate-300 font-semibold">
                      Adsterra বা বিজ্ঞাপন নেটওয়ার্কের কোড স্নিপেট:
                    </label>
                    <textarea
                      rows={6}
                      value={currentAd.custom_code || ''}
                      onChange={(e) =>
                        setCurrentAd({ ...currentAd, custom_code: e.target.value })
                      }
                      placeholder="<!-- Adsterra Script / Banner Code paste here -->"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-xs font-mono focus:outline-hidden focus:border-red-600"
                    />
                    <p className="text-[11px] text-slate-500">
                      * এখানে Adsterra বা অন্যান্য অনুমোদিত বিজ্ঞাপন নেটওয়ার্কের প্রাপ্ত জাভাস্ক্রিপ্ট/HTML কোড নির্ভুলভাবে পেস্ট করুন।
                    </p>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'বিজ্ঞাপন স্লট হালনাগাদ করুন'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                স্লট নির্বাচন করুন
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
