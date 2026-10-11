import React, { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';

interface ShareButtonsProps {
  url: string;
  title: string;
  summary?: string;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({ url, title, summary }) => {
  const [copied, setCopied] = useState(false);

  const fullUrl = typeof window !== 'undefined' ? window.location.origin + url : url;
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (_) {}
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: summary || title,
          url: fullUrl,
        });
      } catch (_) {}
    } else {
      handleCopy();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 social-share-strip py-3 border-y border-slate-200">
      <span className="text-xs font-semibold text-slate-700 mr-1 flex items-center gap-1.5">
        <Share2 className="w-3.5 h-3.5 text-slate-500" /> শেয়ার করুন:
      </span>

      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#1877F2] hover:bg-[#166fe5] rounded transition-colors"
        title="ফেসবুকে শেয়ার করুন"
      >
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        <span>ফেসবুক</span>
      </a>

      {/* WhatsApp */}
      <a
        href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#25D366] hover:bg-[#20ba59] rounded transition-colors"
        title="হোয়াটসঅ্যাপে শেয়ার করুন"
      >
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
        </svg>
        <span>হোয়াটসঅ্যাপ</span>
      </a>

      {/* Telegram */}
      <a
        href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#229ED9] hover:bg-[#1f8fc4] rounded transition-colors"
        title="টেলিগ্রামে শেয়ার করুন"
      >
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
        <span>টেলিগ্রাম</span>
      </a>

      {/* X / Twitter */}
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-black rounded transition-colors"
        title="এক্স (টুইটার)-এ শেয়ার করুন"
      >
        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        <span>এক্স</span>
      </a>

      {/* Copy link */}
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors ml-auto cursor-pointer"
        title="লিংক কপি করুন"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-700">কপি হয়েছে!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-slate-600" />
            <span>লিংক কপি</span>
          </>
        )}
      </button>

      {/* Native Web Share for Mobile */}
      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <button
          type="button"
          onClick={handleNativeShare}
          className="md:hidden inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>শেয়ার</span>
        </button>
      )}
    </div>
  );
};
