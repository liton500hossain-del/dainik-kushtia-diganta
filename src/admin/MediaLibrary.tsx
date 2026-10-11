import React, { useEffect, useState } from 'react';
import { MediaAsset } from '../types/news';
import { api } from '../services/api';
import { Upload, Image as ImageIcon, Trash2, Copy, Check, AlertCircle } from 'lucide-react';

export const MediaLibrary: React.FC = () => {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadMedia = () => {
    setLoading(true);
    api
      .getMediaAssets()
      .then((res) => {
        setMedia(res || []);
        setLoading(false);
      })
      .catch((err) => {
        setMsg({ type: 'error', text: err.message || 'মিডিয়া লোড করতে ব্যর্থ' });
        setLoading(false);
      });
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('শুধুমাত্র ইমেজ ফাইল আপলোড করা যাবে (JPG, PNG, WEBP)');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert('ফাইলের আকার সর্বোচ্চ ৮ মেগাবাইট হতে পারে');
      return;
    }

    setUploading(true);
    setMsg(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const fileData = reader.result as string;
        await api.uploadMedia({
          fileData,
          fileName: file.name,
          mimeType: file.type,
          altText: file.name,
        });
        setMsg({ type: 'success', text: 'ছবি সফলভাবে আপলোড হয়েছে' });
        loadMedia();
      } catch (err: any) {
        setMsg({ type: 'error', text: err.message || 'আপলোড ব্যর্থ হয়েছে' });
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCopyUrl = (asset: MediaAsset) => {
    navigator.clipboard.writeText(asset.url);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('আপনি কি এই ছবিটি মুছে ফেলতে চান?')) return;
    try {
      await api.deleteMedia(id);
      setMsg({ type: 'success', text: 'ছবি মুছে ফেলা হয়েছে' });
      loadMedia();
    } catch (err: any) {
      alert(err.message || 'মুছতে ব্যর্থ');
    }
  };

  return (
    <div className="space-y-6 font-bangla">
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-red-500" />
            <span>মিডিয়া ও ইমেজ লাইব্রেরি</span>
          </h2>
          <p className="text-xs text-slate-400">
            সংবাদের জন্য ব্যবহৃত ছবি আপলোড ও পাথ কপি করুন
          </p>
        </div>

        <div>
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-sm">
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'আপলোড হচ্ছে...' : 'নতুন ছবি আপলোড'}</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
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
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{msg.text}</span>
        </div>
      )}

      {/* Media Grid */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
        {loading ? (
          <div className="text-center py-12 text-slate-400">
            <div className="inline-block w-6 h-6 border-2 border-red-700 border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-xs">ছবি লোড হচ্ছে...</p>
          </div>
        ) : media.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {media.map((asset) => (
              <div
                key={asset.id}
                className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden group hover:border-slate-700 transition-colors flex flex-col"
              >
                <div className="aspect-16/10 bg-slate-900 overflow-hidden relative">
                  <img
                    src={asset.url}
                    alt={asset.alt_text || asset.original_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-2.5 text-[11px] flex-1 flex flex-col justify-between">
                  <span className="font-medium text-slate-200 truncate block">
                    {asset.original_name}
                  </span>
                  <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(asset)}
                      className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-white"
                      title="লিংক কপি করুন"
                    >
                      {copiedId === asset.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">কপি হয়েছে</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>লিংক কপি</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(asset.id)}
                      className="text-slate-500 hover:text-red-400"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 text-xs">
            এখনও কোনো ছবি আপলোড করা হয়নি। উপরের ‘নতুন ছবি আপলোড’ বাটনে ক্লিক করে ছবি আপলোড করুন।
          </div>
        )}
      </div>
    </div>
  );
};
