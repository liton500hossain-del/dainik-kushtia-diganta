import React, { useState } from 'react';
import { api } from '../services/api';
import { User } from '../types/news';
import { Lock, Mail, AlertCircle, Shield, CheckCircle2 } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (user: User) => void;
  onBackToSite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToSite }) => {
  const [email, setEmail] = useState('superadmin@kushtiadiganta.com');
  const [password, setPassword] = useState('Kushtia@Diganta2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.login(email.trim(), password);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'লগইন করতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const setDemoRole = (role: 'superadmin' | 'editor' | 'reporter') => {
    if (role === 'superadmin') {
      setEmail('superadmin@kushtiadiganta.com');
      setPassword('Kushtia@Diganta2026');
    } else if (role === 'editor') {
      setEmail('editor@kushtiadiganta.com');
      setPassword('Editor@Diganta2026');
    } else {
      setEmail('reporter@kushtiadiganta.com');
      setPassword('Reporter@Diganta2026');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-bangla text-slate-100">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-red-700 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-headline font-bold text-white">দৈনিক কুষ্টিয়া দিগন্ত</h1>
          <p className="text-xs text-slate-400 mt-1">নিউজডেস্ক ও প্রশাসন পোর্টাল (Newsroom Admin)</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/80 border border-red-800 rounded text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">ইমেইল ঠিকানা</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="editor@kushtiadiganta.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-hidden focus:border-red-600"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">পাসওয়ার্ড</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-hidden focus:border-red-600"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-red-700 hover:bg-red-800 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>নিউজরুমে প্রবেশ করুন</span>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials Switcher for Evaluation */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-2 font-sans font-medium text-center">
            যাচাইয়ের জন্য ডেমো অ্যাকাউন্ট নির্বাচন করুন:
          </span>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <button
              type="button"
              onClick={() => setDemoRole('superadmin')}
              className={`p-2 rounded border cursor-pointer transition-colors ${
                email.includes('superadmin')
                  ? 'bg-red-950/60 border-red-700 text-red-200'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="font-semibold text-[11px]">প্রধান সম্পাদক</div>
              <div className="text-[9px] text-slate-500">Super Admin</div>
            </button>
            <button
              type="button"
              onClick={() => setDemoRole('editor')}
              className={`p-2 rounded border cursor-pointer transition-colors ${
                email.includes('editor')
                  ? 'bg-red-950/60 border-red-700 text-red-200'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="font-semibold text-[11px]">বার্তা সম্পাদক</div>
              <div className="text-[9px] text-slate-500">Editor</div>
            </button>
            <button
              type="button"
              onClick={() => setDemoRole('reporter')}
              className={`p-2 rounded border cursor-pointer transition-colors ${
                email.includes('reporter')
                  ? 'bg-red-950/60 border-red-700 text-red-200'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="font-semibold text-[11px]">প্রতিনিধি</div>
              <div className="text-[9px] text-slate-500">Reporter</div>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onBackToSite}
            className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            ← মূল ওয়েবসাইটে ফিরে যান
          </button>
        </div>
      </div>
    </div>
  );
};
