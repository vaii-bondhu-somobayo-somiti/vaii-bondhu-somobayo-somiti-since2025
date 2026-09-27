import React, { useState } from 'react';
import { FileText, Shield, Users, BookOpen, X, CheckCircle2 } from 'lucide-react';
import { SOCIETY_RULES } from '../data/initialData';
import { toBengaliNumber } from '../utils/storage';

interface OriginalDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'logo' | 'rules' | 'ledger' | 'committee';
}

export const OriginalDocsModal: React.FC<OriginalDocsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'rules'
}) => {
  const [activeTab, setActiveTab] = useState<'logo' | 'rules' | 'ledger' | 'committee'>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-emerald-800/20 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 text-white px-5 py-4 flex items-center justify-between border-b border-amber-500/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">সমিতির মূল দলিল ও নথিপত্র</h3>
              <p className="text-xs text-emerald-200">ভাই-বন্ধু সমবায় সমিতি • অফিসিয়াল রেকর্ড আর্কাইভ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-emerald-700/50 text-emerald-200 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 bg-stone-50 overflow-x-auto text-sm font-medium">
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-5 py-3 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'rules'
                ? 'border-emerald-700 text-emerald-800 bg-white font-bold'
                : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            সমিতির নিয়ম নীতিমালা
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-5 py-3 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'ledger'
                ? 'border-emerald-700 text-emerald-800 bg-white font-bold'
                : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-700" />
            সদস্য তালিকা
          </button>

          <button
            onClick={() => setActiveTab('committee')}
            className={`px-5 py-3 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'committee'
                ? 'border-emerald-700 text-emerald-800 bg-white font-bold'
                : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Users className="w-4 h-4 text-amber-600" />
            কমিটি ব্যানার
          </button>

          <button
            onClick={() => setActiveTab('logo')}
            className={`px-5 py-3 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'logo'
                ? 'border-emerald-700 text-emerald-800 bg-white font-bold'
                : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Shield className="w-4 h-4 text-emerald-600" />
            অফিসিয়াল গোল লোগো
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'rules' && (
            <div className="space-y-4">
              <div className="bg-emerald-900 text-emerald-50 p-5 rounded-xl border-2 border-amber-500 shadow-md">
                <div className="text-center pb-4 border-b border-emerald-700 mb-4">
                  <h2 className="text-2xl font-bold text-amber-300">ভাই-বন্ধু সমবায় সমিতি</h2>
                  <p className="text-base text-emerald-200 mt-1">সমিতির নিয়ম নীতিমালা :</p>
                </div>

                <div className="space-y-3 text-sm md:text-base leading-relaxed">
                  {SOCIETY_RULES.map((rule) => (
                    <div key={rule.no} className="flex gap-3 items-start bg-emerald-800/40 p-3 rounded-lg">
                      <span className="bg-amber-400 text-emerald-950 font-bold px-2.5 py-0.5 rounded-md text-sm shrink-0 mt-0.5">
                        {toBengaliNumber(rule.no)}
                      </span>
                      <div>
                        <p className="font-semibold text-white">{rule.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ledger' && (
            <div className="space-y-4">
              <div className="bg-red-950/10 border-2 border-red-300 p-4 rounded-xl text-stone-800">
                <div className="text-center pb-3 border-b border-red-200 mb-4">
                  <p className="text-xs text-red-700 font-semibold tracking-wide">বিসমিল্লাহির রাহমানির রাহিম</p>
                  <h3 className="text-lg font-bold text-red-950 mt-1">
                    ভাই বন্ধু সমবায় সমিতি • খাতা রেজিস্ট্রেশন লেজার (২০২৫-২০২৬)
                  </h3>
                  <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-stone-700 mt-2">
                    <span className="bg-white px-2 py-1 rounded shadow-xs border">মাসিক চাঁদা: ২,৫০০ টাকা</span>
                    <span className="bg-white px-2 py-1 rounded shadow-xs border">আগস্ট মোট সংগ্রহ: ৫৫,৫০০ টাকা</span>
                    <span className="bg-white px-2 py-1 rounded shadow-xs border">সেপ্টেম্বর মোট সংগ্রহ: ৫০,০০০ টাকা</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse bg-white rounded-lg shadow-xs overflow-hidden">
                    <thead>
                      <tr className="bg-red-800 text-white font-semibold">
                        <th className="p-2.5 border border-red-700 text-center">নং</th>
                        <th className="p-2.5 border border-red-700">সদস্যের নাম</th>
                        <th className="p-2.5 border border-red-700 text-center">আগস্ট</th>
                        <th className="p-2.5 border border-red-700 text-center">সেপ্টেম্বর</th>
                        <th className="p-2.5 border border-red-700 text-center">স্ট্যাটাস</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-stone-50"><td className="p-2 text-center">১</td><td className="p-2 font-medium">রাজন শিকদার</td><td className="p-2 text-center text-emerald-700 font-bold">২৫০০</td><td className="p-2 text-center text-emerald-700 font-bold">২৫০০</td><td className="p-2 text-center"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-xs">পরিশোধিত</span></td></tr>
                      <tr className="border-b bg-stone-50/50 hover:bg-stone-100"><td className="p-2 text-center">২</td><td className="p-2 font-medium">মো: রনি ইসলাম</td><td className="p-2 text-center text-red-600 font-bold">—</td><td className="p-2 text-center text-red-600 font-bold">—</td><td className="p-2 text-center"><span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs">বকেয়া</span></td></tr>
                      <tr className="border-b hover:bg-stone-50"><td className="p-2 text-center">৩</td><td className="p-2 font-medium">রিয়াদ হোসেন</td><td className="p-2 text-center text-emerald-700 font-bold">২৫০০</td><td className="p-2 text-center text-emerald-700 font-bold">২৫০০</td><td className="p-2 text-center"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-xs">পরিশোধিত</span></td></tr>
                      <tr className="border-b bg-stone-50/50 hover:bg-stone-100"><td className="p-2 text-center">৪</td><td className="p-2 font-medium">মমিন মাঝি</td><td className="p-2 text-center text-red-600 font-bold">—</td><td className="p-2 text-center text-emerald-700 font-bold">২৫০০</td><td className="p-2 text-center"><span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs">আংশিক</span></td></tr>
                      <tr className="border-b hover:bg-stone-50"><td className="p-2 text-center">৫</td><td className="p-2 font-medium">হাসান মাঝি</td><td className="p-2 text-center text-emerald-700 font-bold">২৫০০</td><td className="p-2 text-center text-red-600 font-bold">—</td><td className="p-2 text-center"><span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs">আংশিক</span></td></tr>
                      <tr className="border-b bg-stone-50/50 hover:bg-stone-100"><td className="p-2 text-center">৬</td><td className="p-2 font-medium">সজল শিকদার</td><td className="p-2 text-center text-emerald-700 font-bold">২৫০০</td><td className="p-2 text-center text-red-600 font-bold">—</td><td className="p-2 text-center"><span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs">আংশিক</span></td></tr>
                      <tr className="border-b hover:bg-stone-50"><td className="p-2 text-center">৭-২৪</td><td className="p-2 font-medium">অন্যান্য সদস্যবৃন্দ (১৮ জন)</td><td className="p-2 text-center text-emerald-700 font-bold">২৫০০/৩০০০</td><td className="p-2 text-center text-emerald-700 font-bold">২৫০০</td><td className="p-2 text-center"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-xs">হিসাবভুক্ত</span></td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'committee' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-b from-sky-50 via-white to-emerald-50 border-2 border-emerald-600 rounded-xl p-6 text-center shadow-lg">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-900 tracking-tight">
                  ভাই বন্ধু সমবায় সমিতির
                </h2>
                <div className="inline-block bg-red-600 text-white font-bold text-xl sm:text-2xl px-8 py-2 rounded-full my-3 shadow-md border-2 border-amber-400">
                  কমিটি
                </div>
                <div className="flex justify-between items-center max-w-md mx-auto text-xs sm:text-sm font-semibold text-emerald-900 border-y border-emerald-300 py-1.5 my-2">
                  <span>একতা সাথে থাকি • উন্নতির পথে</span>
                  <span>সমবায়ে শক্তি সবার জন্য সমৃদ্ধি</span>
                </div>

                {/* President */}
                <div className="max-w-md mx-auto my-4 bg-red-700 text-white p-3.5 rounded-xl border-2 border-amber-400 shadow-md">
                  <span className="text-xs font-medium uppercase tracking-wider block text-amber-200">সভাপতি</span>
                  <p className="text-xl font-bold mt-0.5">রাজন শিকদার</p>
                </div>

                {/* Vice President & Gen Sec */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto my-3 text-left">
                  <div className="bg-emerald-800 text-white p-3 rounded-lg border border-emerald-600">
                    <span className="text-xs text-amber-300 font-semibold block">সহ-সভাপতি</span>
                    <p className="font-bold text-base">মোঃ রাকিব, মোঃ সজল শিকদার</p>
                  </div>
                  <div className="bg-blue-900 text-white p-3 rounded-lg border border-blue-700">
                    <span className="text-xs text-amber-300 font-semibold block">সাধারণ সম্পাদক</span>
                    <p className="font-bold text-base">উজ্জ্বল হোসেন</p>
                  </div>
                </div>

                {/* Joint Gen Sec */}
                <div className="max-w-xl mx-auto my-3 bg-purple-900 text-white p-3 rounded-lg border border-purple-700 text-left">
                  <span className="text-xs text-amber-300 font-semibold block">যুগ্ম সাধারণ সম্পাদক</span>
                  <p className="font-bold text-base">মোঃ রনি মাঝি | শান্ত শিকদার</p>
                </div>

                {/* Cashiers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto my-3 text-left">
                  <div className="bg-amber-700 text-white p-3 rounded-lg border border-amber-600">
                    <span className="text-xs text-amber-200 font-semibold block">ক্যাশিয়ার</span>
                    <p className="font-bold text-base">হাছান মাঝি</p>
                  </div>
                  <div className="bg-teal-800 text-white p-3 rounded-lg border border-teal-700">
                    <span className="text-xs text-amber-200 font-semibold block">সহকারী ক্যাশিয়ার</span>
                    <p className="font-bold text-base">মোঃ রিয়াদ</p>
                  </div>
                </div>

                {/* Advisors */}
                <div className="max-w-xl mx-auto mt-4 bg-emerald-900 text-white p-4 rounded-xl border-2 border-emerald-500 text-left">
                  <span className="text-xs text-amber-300 font-bold block mb-2 border-b border-emerald-700 pb-1">
                    সম্মানিত উপদেষ্টা মন্ডলী:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" /> হাছান শিকদার</div>
                    <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" /> মোঃ ইলিয়াস</div>
                    <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" /> মমিন মাঝি</div>
                    <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" /> মোঃ হৃদয় (ভাগিনা)</div>
                    <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" /> মোঃ সবুজ (ভাগিনা)</div>
                    <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" /> মোঃ খবির</div>
                    <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" /> মোঃ পারভেজ</div>
                  </div>
                </div>

                <div className="mt-4 text-emerald-800 text-xs font-bold tracking-wide">
                  — সমবায়ে গড়ি, সমৃদ্ধ ভবিষ্যৎ —
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logo' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-48 h-48 mx-auto bg-stone-100 p-2 rounded-full border-4 border-amber-400 shadow-xl flex items-center justify-center">
                <svg viewBox="0 0 400 400" className="w-full h-full">
                  <circle cx="200" cy="200" r="196" fill="#14532d" stroke="#052e16" strokeWidth="4" />
                  <circle cx="200" cy="200" r="148" fill="#ffffff" stroke="#166534" strokeWidth="3" />
                  <path d="M 52,200 A 148,148 0 0,1 348,200 Z" fill="#166534" />
                  <path d="M 52,200 A 148,148 0 0,0 348,200 Z" fill="#fcfbf7" />
                  <rect x="180" y="115" width="40" height="170" rx="6" fill="#a16207" />
                  <circle cx="200" cy="200" r="14" fill="#b45309" />
                  <rect x="154" y="294" width="92" height="30" rx="15" fill="#064e3b" stroke="#fbbf24" strokeWidth="2" />
                  <text x="200" y="315" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="bold">২০২৫</text>
                  <text fill="#ffffff" fontSize="23" fontWeight="bold">
                    <textPath href="#top-arc-text2" startOffset="50%" textAnchor="middle">ভাই বন্ধু সমবায় সমিতি</textPath>
                  </text>
                  <path id="top-arc-text2" d="M 60,200 A 140,140 0 0,1 340,200" fill="none" />
                  <path id="bottom-arc-text2" d="M 342,200 A 142,142 0 0,1 58,200" fill="none" />
                  <text fill="#ffffff" fontSize="13.5" fontWeight="600">
                    <textPath href="#bottom-arc-text2" startOffset="50%" textAnchor="middle">মধ্য মুজির কান্দি, পাঠান বাজার, মতলব উত্তর,চাঁদপুর।</textPath>
                  </text>
                </svg>
              </div>

              <div>
                <h4 className="text-xl font-bold text-emerald-950">ভাই বন্ধু সমবায় সমিতি</h4>
                <p className="text-sm text-stone-600 mt-1">মধ্য মুজির কান্দি, পাঠান বাজার, মতলব উত্তর, চাঁদপুর | ২০২৫</p>
                <span className="inline-block mt-3 bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full text-xs font-semibold">
                  একতা ও সংহতির প্রতীক
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-100 px-5 py-3 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
};
