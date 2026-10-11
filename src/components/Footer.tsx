import React from 'react';
import { SiteSettings } from '../types/news';
import { MapPin, Phone, Mail, Rss, Globe } from 'lucide-react';

interface FooterProps {
  settings: SiteSettings;
  onNavigatePage: (page: string) => void;
  onNavigateCategory: (slug: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onNavigatePage, onNavigateCategory }) => {
  return (
    <footer className="bg-slate-950 text-slate-300 mt-12 border-t-4 border-red-700">
      {/* Upper Footer: Editorial team & Offices */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 font-bangla">
          {/* Column 1: Brand & Identity */}
          <div>
            <h3 className="text-2xl font-headline font-bold text-white mb-2">
              দৈনিক কুষ্টিয়া দিগন্ত
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              {settings.tagline || 'কুষ্টিয়া, খোকসা ও জাতীয় সংবাদভিত্তিক বাংলা ডিজিটাল সংবাদপত্র। বস্তুনিষ্ঠ ও স্বাধীন সাংবাদিকতায় আমরা অঙ্গীকারবদ্ধ।'}
            </p>
            <div className="text-xs text-slate-400 space-y-1 border-t border-slate-800 pt-3">
              <p>
                <strong className="text-slate-200">সম্পাদক ও প্রকাশক:</strong> {settings.editor_name || 'এম. এ. রহমান'}
              </p>
              <p>
                <strong className="text-slate-200">নির্বাহী সম্পাদক:</strong> {settings.executive_editor || 'কামরুল হাসান'}
              </p>
            </div>
          </div>

          {/* Column 2: Regional Offices */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5 text-red-500">
              <MapPin className="w-4 h-4" /> কার্যালয় ও যোগাযোগ
            </h4>
            <div className="text-xs text-slate-400 space-y-2.5">
              <div>
                <span className="text-slate-200 font-semibold block">কুষ্টিয়া প্রধান কার্যালয়:</span>
                <p>{settings.office_address || 'এনএস রোড, থানা মোড়, কুষ্টিয়া সদর, কুষ্টিয়া - ৭০০০'}</p>
              </div>
              <div>
                <span className="text-slate-200 font-semibold block">খোকসা উপজেলা ব্যুরো:</span>
                <p>{settings.khoksa_office || 'উপজেলা পরিষদ রোড, খোকসা বাজার, খোকসা, কুষ্টিয়া'}</p>
              </div>
              <div className="flex items-center gap-2 text-slate-300 pt-1">
                <Phone className="w-3.5 h-3.5 text-red-400" />
                <span>{settings.contact_phone || '+৮৮০ ১৭১২-৩৪৫৬৭৮'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-red-400" />
                <span>{settings.contact_email || 'news@kushtiadiganta.com'}</span>
              </div>
            </div>
          </div>

          {/* Column 3: Quick Category Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3 text-red-500">
              বিশেষ সংবাদ বিভাগ
            </h4>
            <ul className="text-xs space-y-2 text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateCategory('kushtia')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  কুষ্টিয়া জেলা সংবাদ
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateCategory('khoksa')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  খোকসা উপজেলা ও গড়াই অববাহিকা
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateCategory('national')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  জাতীয় সংবাদ
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateCategory('economy')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  ব্যবসা ও অর্থনীতি
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateCategory('sports')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  খেলাধুলার খবর
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateCategory('features')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  শিলাইদহ ও সাহিত্য-সংস্কৃতি ফিচার
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Newspaper Policies & Institutional */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3 text-red-500">
              নীতিমালা ও সহায়তা
            </h4>
            <ul className="text-xs space-y-2 text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigatePage('about')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  আমাদের সম্পর্কে (About Us)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigatePage('editorial-policy')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  সম্পাদকীয় নীতিমালা (Editorial Policy)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigatePage('correction-policy')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  সংশোধনী নীতিমালা (Correction Policy)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigatePage('privacy-policy')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  গোপনীয়তা নীতিমালা (Privacy Policy)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigatePage('terms')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  ব্যবহারের শর্তাবলী (Terms & Conditions)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigatePage('advertise')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  বিজ্ঞাপন দিন (Advertise With Us)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigatePage('contact')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  যোগাযোগ ও মতামত পাঠান
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* RSS / Sitemap / Feeds bar */}
        <div className="mt-8 pt-6 border-t border-slate-900 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-4">
          <div className="flex items-center gap-4">
            <a
              href="/rss.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-amber-400 transition-colors"
            >
              <Rss className="w-3.5 h-3.5 text-amber-500" />
              <span>আরএসএস ফিড (RSS Feed)</span>
            </a>
            <span className="text-slate-800">·</span>
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-white transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>সাইটম্যাপ (XML Sitemap)</span>
            </a>
          </div>

          <div className="text-[11px] text-slate-400">
            © {new Date().getFullYear()} দৈনিক কুষ্টিয়া দিগন্ত কর্তৃক সর্বস্বত্ব সংরক্ষিত। অনুমতি ছাড়া কোনো সংবাদ বা ছবি পুনরুৎপাদন নিষিদ্ধ।
          </div>
        </div>
      </div>
    </footer>
  );
};
