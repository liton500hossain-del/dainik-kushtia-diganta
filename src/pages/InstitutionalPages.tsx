import React, { useState } from 'react';
import { SiteSettings } from '../types/news';
import { Mail, Phone, MapPin, Send, CheckCircle2, ShieldCheck, Newspaper, Award } from 'lucide-react';

interface InstitutionalPagesProps {
  pageType: 'about' | 'editorial-policy' | 'correction-policy' | 'privacy-policy' | 'terms' | 'advertise' | 'contact';
  settings: SiteSettings;
}

export const InstitutionalPages: React.FC<InstitutionalPagesProps> = ({ pageType, settings }) => {
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setContactName('');
    setContactPhone('');
    setContactMsg('');
  };

  const getPageContent = () => {
    switch (pageType) {
      case 'about':
        return {
          title: 'আমাদের সম্পর্কে (About Us)',
          subtitle: 'দৈনিক কুষ্টিয়া দিগন্তের পরিচিতি ও লক্ষ্য',
          content: (
            <div className="space-y-4 text-slate-700 leading-relaxed font-bangla text-base">
              <p>
                <strong>“দৈনিক কুষ্টিয়া দিগন্ত”</strong> দক্ষিণ-পশ্চিমাঞ্চলের ঐতিহ্যবাহী কুষ্টিয়া জেলা, খোকসা উপজেলা এবং সমগ্র বাংলাদেশের নির্ভরযোগ্য ডিজিটাল সংবাদ প্রকাশনা। সত্যনিষ্ঠ সাংবাদিকতা, জনগণের অধিকারের পক্ষে অবিচল অবস্থান এবং তথ্যভিত্তিক বিশ্লেষণই আমাদের মূল ভিত্তি।
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
                  <ShieldCheck className="w-8 h-8 text-red-700 mx-auto mb-2" />
                  <h4 className="font-bold text-slate-900 mb-1">স্বাধীন সাংবাদিকতা</h4>
                  <p className="text-xs text-slate-600">কোনো রাজনৈতিক বা আর্থিক চাপের কাছে নতি স্বীকার না করে নিরপেক্ষ সংবাদ পরিবেশন।</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
                  <Newspaper className="w-8 h-8 text-red-700 mx-auto mb-2" />
                  <h4 className="font-bold text-slate-900 mb-1">স্থানীয় অধিকারের কণ্ঠ</h4>
                  <p className="text-xs text-slate-600">গড়াই নদী অববাহিকা ও কুষ্টিয়া-খোকসার প্রান্তিক কৃষক, তাঁতি ও মেহনতি মানুষের সমস্যা তুলে ধরা।</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
                  <Award className="w-8 h-8 text-red-700 mx-auto mb-2" />
                  <h4 className="font-bold text-slate-900 mb-1">দায়বদ্ধতা ও মান</h4>
                  <p className="text-xs text-slate-600">পেশাদার সাংবাদিকতা ও তথ্য যাচাইয়ের কঠোর মানদণ্ড অনুসরণ।</p>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-6">সম্পাদকীয় পরিষদ</h3>
              <p>
                <strong>সম্পাদক ও প্রকাশক:</strong> {settings.editor_name || 'এম. এ. রহমান'}<br />
                <strong>নির্বাহী সম্পাদক:</strong> {settings.executive_editor || 'কামরুল হাসান'}
              </p>
            </div>
          ),
        };

      case 'editorial-policy':
        return {
          title: 'সম্পাদকীয় নীতিমালা (Editorial Policy)',
          subtitle: 'সংবাদ সংগ্রহ, যাচাই এবং প্রকাশের নৈতিক নির্দেশিকা',
          content: (
            <div className="space-y-4 text-slate-700 leading-relaxed font-bangla text-base">
              <h3 className="text-lg font-bold text-slate-900">১. সত্যতা ও বস্তুনিষ্ঠতা</h3>
              <p>যেকোনো সংবাদ প্রকাশের পূর্বে একাধিক নির্ভরযোগ্য সূত্র থেকে তথ্য যাচাই করা বাধ্যতামূলক। অনুমান বা অসত্য সংবাদের কোনো স্থান দৈনিক কুষ্টিয়া দিগন্তে নেই।</p>
              
              <h3 className="text-lg font-bold text-slate-900">২. নিরপেক্ষতা ও ভারসাম্য</h3>
              <p>বিতর্কিত কোনো বিষয়ে উভয় পক্ষের বক্তব্য নেওয়ার আন্তরিক চেষ্টা করতে হবে। কারো বিরুদ্ধে অভিযোগ উত্থাপিত হলে তার আত্মপক্ষ সমর্থনের সুযোগ নিশ্চিত করা হয়।</p>

              <h3 className="text-lg font-bold text-slate-900">৩. গোপনীয়তা ও মানবিক মর্যাদা</h3>
              <p>অপরাধের শিকার নারী ও শিশুদের পরিচয় সংবেদনশীলতার সাথে গোপন রাখা হয়। সামাজিক মর্যাদা ক্ষুণ্ণকারী ভিত্তিহীন কোনো খবর প্রকাশ করা হয় না।</p>

              <h3 className="text-lg font-bold text-slate-900">৪. বিজ্ঞাপন ও সংবাদের সুস্পষ্ট পার্থক্য</h3>
              <p>বিজ্ঞাপন ও সংবাদ কখনোই মিশ্রিত হবে না। স্পনসরকৃত বা বিজ্ঞাপনী কনটেন্টে স্পষ্টভাবে ‘বিজ্ঞাপন’ অথবা ‘প্রমোশনাল’ লেবেল যুক্ত থাকবে।</p>
            </div>
          ),
        };

      case 'correction-policy':
        return {
          title: 'সংশোধনী নীতিমালা (Correction Policy)',
          subtitle: 'ভুল স্বীকার এবং দ্রুত সংশোধনের স্বচ্ছতা',
          content: (
            <div className="space-y-4 text-slate-700 leading-relaxed font-bangla text-base">
              <p>দৈনিক কুষ্টিয়া দিগন্ত বিশ্বাস করে ভুলহীন সাংবাদিকতাই কাম্য, তবে অসাবধানতাবশত কোনো তথ্যে ভুল প্রকাশ পেলে তা লুকানোর চেয়ে স্বচ্ছভাবে স্বীকার করাই নৈতিকতা।</p>
              <h3 className="text-lg font-bold text-slate-900">সংশোধনের প্রক্রিয়া:</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>যেকোনো সংবাদের তথ্যগত ভুল চিহ্নিত হওয়ামাত্রই বার্তা সম্পাদক তা যাচাই করবেন।</li>
                <li>সংশোধিত সংবাদের নিচে ‘সম্পাদকের সংশোধনী বিজ্ঞপ্তি’ বক্সে স্পষ্টভাবে উল্লেখ করা হবে পূর্বে কী ভুল ছিল এবং তা কীভাবে সংশোধন করা হয়েছে।</li>
                <li>শিরোনাম বা মূল বিষয়ে বড় ধরনের ভুল হলে সংশোধনীর সময় উল্লেখসহ তা প্রকাশ করা হবে।</li>
              </ul>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded mt-4">
                <strong>ভুল নজরে এলে জানান:</strong> <a href={`mailto:${settings.contact_email || 'news@kushtiadiganta.com'}`} className="text-red-700 underline">{settings.contact_email || 'news@kushtiadiganta.com'}</a>
              </div>
            </div>
          ),
        };

      case 'privacy-policy':
        return {
          title: 'গোপনীয়তা নীতিমালা (Privacy Policy)',
          subtitle: 'পাঠকদের তথ্যের সুরক্ষা সংক্রান্ত অঙ্গীকার',
          content: (
            <div className="space-y-4 text-slate-700 leading-relaxed font-bangla text-base">
              <p>দৈনিক কুষ্টিয়া দিগন্ত পাঠকদের ব্যক্তিগত তথ্যের সর্বোচ্চ সুরক্ষা নিশ্চিতে প্রতিশ্রুতিবদ্ধ।</p>
              <h3 className="text-lg font-bold text-slate-900">তথ্য সংগ্রহ ও ব্যবহার:</h3>
              <p>পাঠক যখন সাইট ভিজিট করেন বা মন্তব্য প্রদান করেন, তখন ব্রাউজারের সাধারণ অ্যানালিটিক্স তথ্য (যেমন ব্রাউজার ধরন, পঠিত সময়) সার্বিক সেবার মানোন্নয়নের জন্য সংরক্ষিত হয়। মন্তব্য প্রদানে ব্যবহৃত নাম ও ইমেইল ঠিকানা কোনো তৃতীয় পক্ষের কাছে বিক্রি বা হস্তান্তর করা হয় না।</p>
              <h3 className="text-lg font-bold text-slate-900">কুকিজ (Cookies):</h3>
              <p>ব্যবহারকারীর পড়ার অভিজ্ঞতা সহজ করতে স্ট্যান্ডার্ড ব্রাউজার কুকিজ ব্যবহৃত হয়। আপনি চাইলে ব্রাউজার সেটিংসে কুকিজ বন্ধ রাখতে পারেন।</p>
            </div>
          ),
        };

      case 'terms':
        return {
          title: 'ব্যবহারের শর্তাবলী (Terms & Conditions)',
          subtitle: 'দৈনিক কুষ্টিয়া দিগন্ত ওয়েবসাইট ব্যবহারের সাধারণ নিয়মাবলী',
          content: (
            <div className="space-y-4 text-slate-700 leading-relaxed font-bangla text-base">
              <p>এই ওয়েবসাইটটি পরিদর্শনের মাধ্যমে আপনি এর ব্যবহারের শর্তাবলী মেনে নিচ্ছেন বলে গণ্য হবে।</p>
              <h3 className="text-lg font-bold text-slate-900">কপিরাইট ও স্বত্বাধিকার:</h3>
              <p>দৈনিক কুষ্টিয়া দিগন্তে প্রকাশিত সকল প্রতিবেদন, ছবি, গ্রাফিক্স ও ভিডিও প্রকাশকের মেধাসম্পদ। লিখিত পূর্বানুমতি ব্যতিরেকে বাণিজ্যিক উদ্দেশ্যে এগুলো কপি বা পুনরুৎপাদন আইনত দণ্ডনীয়।</p>
              <h3 className="text-lg font-bold text-slate-900">পাঠকের মন্তব্য:</h3>
              <p>মন্তব্য বিভাগে কোনো ধরনের অশ্লীল, উসকানিমূলক, সাম্প্রদায়িক বা ব্যক্তি আক্রমণাত্মক বক্তব্য প্রকাশ করা যাবে না। নীতিমালার লঙ্ঘনকারী মন্তব্য প্রকাশ বন্ধের পূর্ণ অধিকার সম্পাদকের রয়েছে।</p>
            </div>
          ),
        };

      case 'advertise':
        return {
          title: 'বিজ্ঞাপন দিন (Advertise With Us)',
          subtitle: 'কুষ্টিয়া, খুলনা ও সারাদেশে আপনার ব্যবসার প্রচার বাড়ান',
          content: (
            <div className="space-y-4 text-slate-700 leading-relaxed font-bangla text-base">
              <p>দৈনিক কুষ্টিয়া দিগন্ত দক্ষিণ-পশ্চিমাঞ্চলের লাখো পাঠকের কাছে পৌঁছানোর আদর্শ ডিজিটাল প্ল্যাটফর্ম।</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded">
                  <h4 className="font-bold text-slate-900 mb-1">ডিসপ্লে ব্যানার</h4>
                  <p className="text-xs text-slate-600">হেডার, হোমপেজ সেকশন, সাইডবার ও সংবাদ আর্টিকেলের ভেতরে প্রিমিয়াম স্লট।</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded">
                  <h4 className="font-bold text-slate-900 mb-1">স্পনসরড কনটেন্ট</h4>
                  <p className="text-xs text-slate-600">আপনার ব্র্যান্ড, প্রতিষ্ঠান বা সেবার বিশেষ প্রচারণামূলক ফিচার প্রতিবেদন।</p>
                </div>
              </div>
              <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-bold text-red-950 mb-2">বিজ্ঞাপন রেট ও বুকিংয়ের জন্য যোগাযোগ:</h4>
                <p className="text-sm text-red-900 mb-1">
                  <strong>মোবাইল / হোয়াটসঅ্যাপ:</strong> {settings.contact_phone || '+৮৮০ ১৭১২-৩৪৫৬৭৮'}
                </p>
                <p className="text-sm text-red-900">
                  <strong>ইমেইল:</strong> ads@kushtiadiganta.com
                </p>
              </div>
            </div>
          ),
        };

      case 'contact':
      default:
        return {
          title: 'যোগাযোগ ও বার্তা বিভাগ',
          subtitle: 'আপনার সংবাদ ও গুরুত্বপূর্ণ মতামত আমাদের কাছে পাঠান',
          content: (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-bangla">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">আমাদের কার্যালয়সমূহ</h3>
                <div className="space-y-4 text-sm text-slate-700">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                    <div>
                      <strong>কুষ্টিয়া প্রধান কার্যালয়:</strong>
                      <p>{settings.office_address || 'এনএস রোড, থানা মোড়, কুষ্টিয়া সদর, কুষ্টিয়া - ৭০০০'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                    <div>
                      <strong>খোকসা ব্যুরো অফিস:</strong>
                      <p>{settings.khoksa_office || 'উপজেলা পরিষদ রোড, খোকসা বাজার, খোকসা, কুষ্টিয়া'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-red-700 shrink-0" />
                    <div>
                      <strong>ফোন:</strong> {settings.contact_phone || '+৮৮০ ১৭১২-৩৪৫৬৭৮'}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-red-700 shrink-0" />
                    <div>
                      <strong>ইমেইল:</strong> {settings.contact_email || 'news@kushtiadiganta.com'}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">সরাসরি বার্তা পাঠান</h3>
                <form onSubmit={handleContactSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">আপনার নাম *</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-sm focus:outline-hidden focus:border-red-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">ফোন বা ইমেইল *</label>
                    <input
                      type="text"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-sm focus:outline-hidden focus:border-red-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">বার্তা বা সংবাদ তথ্য *</label>
                    <textarea
                      required
                      rows={4}
                      value={contactMsg}
                      onChange={(e) => setContactMsg(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded p-3 text-sm focus:outline-hidden focus:border-red-600"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded text-sm font-semibold transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>পাঠিয়ে দিন</span>
                  </button>

                  {submitted && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>আপনার বার্তা আমাদের বার্তা ডেস্কে সফলভাবে পৌঁছেছে। ধন্যবাদ।</span>
                    </div>
                  )}
                </form>
              </div>
            </div>
          ),
        };
    }
  };

  const page = getPageContent();

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 font-bangla">
      <div className="bg-white border border-slate-200 rounded-lg p-6 md:p-10 shadow-xs">
        <h1 className="text-2xl sm:text-3xl font-headline font-bold text-slate-900 border-b-2 border-red-700 pb-3 mb-2">
          {page.title}
        </h1>
        <p className="text-xs text-slate-500 mb-6">{page.subtitle}</p>
        {page.content}
      </div>
    </div>
  );
};
