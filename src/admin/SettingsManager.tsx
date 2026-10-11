import React, { useEffect, useState } from 'react';
import { SiteSettings } from '../types/news';
import { api } from '../services/api';
import { Sliders, Save, Image as ImageIcon, AlertCircle, CheckCircle2 } from 'lucide-react';

export const SettingsManager: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    api
      .getAdminSettings()
      .then((res) => {
        setSettings(res || {});
        setLoading(false);
      })
      .catch((err) => {
        setMsg({ type: 'error', text: err.message || 'সেটিংস লোড ব্যর্থ' });
        setLoading(false);
      });
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      await api.updateAdminSettings(settings as Record<string, string>);
      setMsg({ type: 'success', text: 'সাধারণ ও মাস্টহেড সেটিংস সফলভাবে সংরক্ষিত হয়েছে' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'সংরক্ষণ ব্যর্থ' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-400 font-bangla">
        <div className="inline-block w-8 h-8 border-3 border-red-700 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p>সেটিংস লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 font-bangla max-w-5xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-red-500" />
            <span>পত্রিকার নাম, লোগো ও সাধারণ সেটিংস</span>
          </h2>
          <p className="text-xs text-slate-400">
            মাস্টহেড লোগো, ফ্যাভিকন, কার্যালয়ের ঠিকানা ও সম্পাদকীয় তথ্য হালনাগাদ করুন
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50 shadow-sm"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'সকল সেটিংস সংরক্ষণ করুন'}</span>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Brand & Masthead */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
          <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-2 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-red-400" />
            <span>মাস্টহেড ব্র্যান্ডিং ও লোগো</span>
          </h3>

          <div>
            <label className="block text-slate-300 mb-1 font-semibold">সংবাদপত্রের বাংলা নাম</label>
            <input
              type="text"
              value={settings.site_name_bn || 'দৈনিক কুষ্টিয়া দিগন্ত'}
              onChange={(e) => handleChange('site_name_bn', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-semibold">ইংরেজি নাম</label>
            <input
              type="text"
              value={settings.site_name_en || 'Dainik Kushtia Diganta'}
              onChange={(e) => handleChange('site_name_en', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-sans"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-semibold">ট্যাগলাইন / স্লোগান</label>
            <input
              type="text"
              value={settings.tagline || ''}
              onChange={(e) => handleChange('tagline', e.target.value)}
              placeholder="বস্তুনিষ্ঠ সংবাদে জনতার কণ্ঠস্বর"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-semibold">কাস্টম লোগো ছবির লিঙ্ক (ঐচ্ছিক)</label>
            <input
              type="text"
              value={settings.logo_url || ''}
              onChange={(e) => handleChange('logo_url', e.target.value)}
              placeholder="খালি থাকলে স্বয়ংক্রিয় ক্যালিগ্রাফি মাস্টহেড প্রদর্শিত হবে"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-sans"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-semibold">ফ্যাভিকন (Favicon) লিঙ্ক</label>
            <input
              type="text"
              value={settings.favicon_url || ''}
              onChange={(e) => handleChange('favicon_url', e.target.value)}
              placeholder="https://.../favicon.ico"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-sans"
            />
          </div>
        </div>

        {/* Editorial Team */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
          <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-2">
            সম্পাদকীয় পরিষদ
          </h3>

          <div>
            <label className="block text-slate-300 mb-1 font-semibold">সম্পাদক ও প্রকাশক</label>
            <input
              type="text"
              value={settings.editor_name || ''}
              onChange={(e) => handleChange('editor_name', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-semibold">নির্বাহী সম্পাদক</label>
            <input
              type="text"
              value={settings.executive_editor || ''}
              onChange={(e) => handleChange('executive_editor', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-semibold">ওয়েদার উইজেট স্ট্যাটাস</label>
            <select
              value={settings.weather_widget_enabled || '1'}
              onChange={(e) => handleChange('weather_widget_enabled', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
            >
              <option value="1">সক্রিয় (কুষ্টিয়া তাপমাত্রা ও আবহাওয়া দেখাবে)</option>
              <option value="0">নিষ্ক্রিয়</option>
            </select>
          </div>
        </div>

        {/* Offices & Contacts */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
          <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-2">
            কার্যালয় ও যোগাযোগ
          </h3>

          <div>
            <label className="block text-slate-300 mb-1 font-semibold">কুষ্টিয়া প্রধান কার্যালয়ের ঠিকানা</label>
            <input
              type="text"
              value={settings.office_address || ''}
              onChange={(e) => handleChange('office_address', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-semibold">খোকসা ব্যুরো অফিসের ঠিকানা</label>
            <input
              type="text"
              value={settings.khoksa_office || ''}
              onChange={(e) => handleChange('khoksa_office', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-semibold">যোগাযোগ ফোন নম্বর</label>
            <input
              type="text"
              value={settings.contact_phone || ''}
              onChange={(e) => handleChange('contact_phone', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-sans"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-semibold">বার্তা বিভাগ ইমেইল</label>
            <input
              type="email"
              value={settings.contact_email || ''}
              onChange={(e) => handleChange('contact_email', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-sans"
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
          <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-2">
            সোশ্যাল মিডিয়া পেজ লিঙ্ক
          </h3>

          <div>
            <label className="block text-slate-300 mb-1 font-semibold">ফেসবুক পেজ লিঙ্ক</label>
            <input
              type="text"
              value={settings.facebook_url || ''}
              onChange={(e) => handleChange('facebook_url', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-sans"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-semibold">ইউটিউব চ্যানেল লিঙ্ক</label>
            <input
              type="text"
              value={settings.youtube_url || ''}
              onChange={(e) => handleChange('youtube_url', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-sans"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-semibold">এক্স (টুইটার) লিঙ্ক</label>
            <input
              type="text"
              value={settings.x_url || ''}
              onChange={(e) => handleChange('x_url', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-sans"
            />
          </div>
        </div>
      </div>
    </form>
  );
};
