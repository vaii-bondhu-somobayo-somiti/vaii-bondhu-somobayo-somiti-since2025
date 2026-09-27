import React, { useState } from 'react';
import { SocietyData, CurrentUser } from '../types';
import { 
  LogIn, 
  UserCheck, 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Users
} from 'lucide-react';

interface LoginPageProps {
  data: SocietyData;
  onLoginSuccess: (user: CurrentUser) => void;
  onNavigate: (tab: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ data, onLoginSuccess, onNavigate }) => {
  const [activeMode, setActiveMode] = useState<'member' | 'admin'>('member');

  // Member Login Form State
  const [memberId, setMemberId] = useState(data.members[0]?.id || 'VB20250001');
  const [memberPin, setMemberPin] = useState('1234');

  // Admin Login Form State
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('admin123');

  const [errorMsg, setErrorMsg] = useState('');

  const handleMemberLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const bnToEn = (str: string) => str.replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d).toString());
    const cleanId = bnToEn(memberId.trim()).toUpperCase().replace(/\s+/g, '');
    const numNoZeros = cleanId.replace(/^VB/i, '').replace(/^2025/, '').replace(/^0+/, '');
    const pin = memberPin.trim();

    if (pin !== '1234') {
      setErrorMsg('ভুল পিন কোড! ডিফল্ট পিন কোড হলো: 1234');
      return;
    }

    const member = data.members.find(
      (m) => 
        m.id.toUpperCase() === cleanId || 
        m.id.toUpperCase().endsWith(cleanId) ||
        (Boolean(numNoZeros) && String(m.rollNo) === numNoZeros) ||
        (cleanId.startsWith('10000000') && String(m.rollNo) === cleanId.replace(/^10000000+/, ''))
    );

    if (!member) {
      setErrorMsg('সদস্য আইডি পাওয়া যায়নি! সঠিক সদস্য আইডি দিন (যেমন: VB20250001 বা ১-২৪)।');
      return;
    }

    onLoginSuccess({
      role: 'member',
      memberId: member.id,
      name: member.name
    });
    onNavigate('profile');
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (adminUsername.trim() === 'admin' && adminPassword.trim() === 'admin123') {
      onLoginSuccess({
        role: 'admin',
        name: 'সুপার অ্যাডমিন (ম্যানেজার)'
      });
      onNavigate('admin');
    } else {
      setErrorMsg('ভুল অ্যাডমিন ইউজারনেম বা পাসওয়ার্ড! (ইউজার: admin, পাসওয়ার্ড: admin123)');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16 space-y-6">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-900 to-emerald-700 text-amber-300 flex items-center justify-center mx-auto shadow-xl border-2 border-amber-400">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-emerald-950">
          সুরক্ষিত লগইন পোর্টাল
        </h1>
        <p className="text-xs sm:text-sm text-stone-600">
          ভাই-বন্ধু সমবায় সমিতি • সদস্য ও অ্যাডমিন প্রবেশদ্বার
        </p>
      </div>

      {/* Mode Switcher (Member vs Admin) */}
      <div className="bg-stone-200/80 p-1.5 rounded-2xl flex items-center gap-1 border border-stone-300">
        <button
          onClick={() => {
            setActiveMode('member');
            setErrorMsg('');
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeMode === 'member'
              ? 'bg-emerald-800 text-white shadow-md'
              : 'text-stone-700 hover:text-stone-900'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          সদস্য লগইন
        </button>

        <button
          onClick={() => {
            setActiveMode('admin');
            setErrorMsg('');
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeMode === 'admin'
              ? 'bg-amber-600 text-stone-950 shadow-md'
              : 'text-stone-700 hover:text-stone-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          অ্যাডমিন লগইন
        </button>
      </div>

      {/* Error display */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-300 text-red-900 p-3.5 rounded-xl text-xs flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* MEMBER LOGIN FORM */}
      {activeMode === 'member' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-emerald-700/20 shadow-xl space-y-5">
          <div className="space-y-1">
            <h3 className="font-bold text-stone-900 text-lg">সদস্য ড্যাশবোর্ডে প্রবেশ</h3>
            <p className="text-xs text-stone-500">
              আপনার মেম্বার আইডি (যেমন: VB20250001) এবং ডিফল্ট পিন (1234) দিন
            </p>
          </div>

          <form onSubmit={handleMemberLogin} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block font-bold text-stone-800 mb-1">
                সদস্য নির্বাচন করুন বা আইডি টাইপ করুন *
              </label>
              <select
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 bg-white font-medium"
              >
                {data.members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — আইডি: {m.id}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-stone-800 mb-1">
                মেম্বার আইডি ইনপুট
              </label>
              <input
                type="text"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                placeholder="যেমন: VB20250001"
                className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 font-mono"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-stone-800 mb-1">
                পিন কোড (ডিফল্ট: 1234) *
              </label>
              <input
                type="password"
                value={memberPin}
                onChange={(e) => setMemberPin(e.target.value)}
                placeholder="1234"
                className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 font-mono tracking-widest text-center text-lg"
                maxLength={6}
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-amber-300" />
                প্রোফাইলে প্রবেশ করুন
              </button>
            </div>
          </form>

          {/* Helper hint */}
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong>সহায়তা:</strong> যে কোনো সদস্যের আইডি যেমন: <code className="bg-white px-1.5 py-0.5 rounded font-bold text-emerald-900">VB20250001</code> এবং পিন: <code className="bg-white px-1.5 py-0.5 rounded font-bold text-emerald-900">1234</code> দিয়ে লগইন করা যাবে।
            </div>
          </div>
        </div>
      )}

      {/* ADMIN LOGIN FORM */}
      {activeMode === 'admin' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-amber-500 shadow-xl space-y-5">
          <div className="space-y-1">
            <div className="inline-block bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded">
              ম্যানেজার এক্সেস
            </div>
            <h3 className="font-bold text-stone-900 text-lg">অ্যাডমিন ড্যাশবোর্ড প্রবেশ</h3>
            <p className="text-xs text-stone-500">
              ব্যাংক ব্যালেন্স আপডেট, সদস্যদের জমা পরিবর্তন এবং ব্যাকআপ নিয়ন্ত্রণ
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block font-bold text-stone-800 mb-1">
                অ্যাডমিন ইউজারনেম *
              </label>
              <input
                type="text"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                placeholder="admin"
                className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-amber-600 font-mono"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-stone-800 mb-1">
                অ্যাডমিন পাসওয়ার্ড *
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="admin123"
                className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-amber-600 font-mono"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-stone-950 font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                অ্যাডমিন প্যানেল প্রবেশ
              </button>
            </div>
          </form>

          {/* Admin Credentials Hint */}
          <div className="bg-amber-50 p-3 rounded-xl border border-amber-300 text-amber-950 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>অ্যাডমিন তথ্য:</strong> ব্যবহারকারী: <code className="bg-white px-1.5 py-0.5 rounded font-bold border border-amber-300">admin</code> | পাসওয়ার্ড: <code className="bg-white px-1.5 py-0.5 rounded font-bold border border-amber-300">admin123</code>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
