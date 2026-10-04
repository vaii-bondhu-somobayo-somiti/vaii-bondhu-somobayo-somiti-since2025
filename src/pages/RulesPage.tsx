import React, { useState } from 'react';
import { SocietyRule, SocietyData } from '../types';
import { SOCIETY_RULES } from '../data/initialData';
import { toBengaliNumber } from '../utils/storage';
import { 
  BookOpen, 
  CheckCircle2, 
  Printer, 
  Copy, 
  Check, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  Banknote, 
  Ban, 
  ShieldCheck, 
  Share2,
  FileCheck2,
  ArrowLeft
} from 'lucide-react';

interface RulesPageProps {
  rules?: SocietyRule[];
  data?: SocietyData;
  onNavigate?: (tab: string) => void;
  onOpenDocsModal: (tab?: 'rules' | 'ledger' | 'committee' | 'logo') => void;
}

export const RulesPage: React.FC<RulesPageProps> = ({ rules, data, onNavigate, onOpenDocsModal }) => {
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedRuleId, setCopiedRuleId] = useState<number | null>(null);

  const activeRules = rules && rules.length > 0 ? rules : (data?.rules && data.rules.length > 0 ? data.rules : SOCIETY_RULES);

  const handleCopyRule = (rule: SocietyRule) => {
    navigator.clipboard.writeText(`${rule.no}/ ${rule.description}`);
    setCopiedRuleId(rule.no);
    setTimeout(() => setCopiedRuleId(null), 2000);
  };

  const handleCopyAll = () => {
    const allText = `${data?.societyName || 'ভাই-বন্ধু সমবায় সমিতি'}\nসমিতির নিয়ম নীতিমালা:\n\n` +
      activeRules.map(r => `${r.no}/ ${r.description}`).join('\n\n') +
      `\n\n— ${data?.motto || 'সমবায়ে গড়ি, সমৃদ্ধ ভবিষ্যৎ'} —\n${data?.address || 'মধ্য মুক্তির কান্দি, পাঠান বাজার, মতলব উত্তর, চাঁদপুর | ২০২৫'}`;
    navigator.clipboard.writeText(allText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-10">
      
      {/* Mobile Back / Quick Breadcrumb Button */}
      <div className="flex items-center justify-between lg:hidden pb-1 -mt-2">
        <button
          onClick={() => {
            if (window.history.length > 1) {
              window.history.back();
            } else if (onNavigate) {
              onNavigate('home');
            }
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 hover:text-emerald-800 text-xs font-bold shadow-2xs active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-700" />
          <span>হোমে ফিরে যান</span>
        </button>
        <span className="text-[11px] font-bold text-stone-500">হোম / নিয়ম নীতিমালা</span>
      </div>

      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          <BookOpen className="w-4 h-4 text-emerald-700" /> অফিশিয়াল সংবিধান ও গঠনতন্ত্র
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-emerald-950 tracking-tight">
          সমিতির নিয়ম নীতিমালা
        </h1>
        <p className="text-sm sm:text-base text-stone-600 max-w-2xl mx-auto">
          {data?.societyName || 'ভাই-বন্ধু সমবায় সমিতি'}র মূল গঠনতন্ত্র অনুযায়ী প্রণীত {toBengaliNumber(activeRules.length)}টি অবশ্য পালনীয় নিয়মাবলী।
        </p>

        {/* Copy All & Print Action */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={handleCopyAll}
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {copiedAll ? (
              <>
                <Check className="w-4 h-4 text-emerald-700" /> সম্পূর্ণ নিয়মাবলী কপি হয়েছে!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-emerald-700" /> সম্পূর্ণ নিয়ম কপি করুন
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" /> প্রিন্ট / সেভ করুন
          </button>

          <button
            onClick={() => onOpenDocsModal('rules')}
            className="px-4 py-2 bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 text-xs sm:text-sm font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileCheck2 className="w-4 h-4 text-amber-700" /> মূল কপি দেখুন
          </button>
        </div>
      </div>

      {/* 4 Quick Rule Badges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center">
          <Banknote className="w-6 h-6 text-emerald-700 mx-auto mb-1" />
          <span className="text-xs text-stone-500 font-semibold block">মাসিক চাঁদা</span>
          <p className="text-base sm:text-lg font-bold text-emerald-950">২,০০০ টাকা</p>
          <span className="text-[10px] text-emerald-700 font-medium">(সঞ্চয়সহ ২,৫০০)</span>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-center">
          <Calendar className="w-6 h-6 text-amber-700 mx-auto mb-1" />
          <span className="text-xs text-stone-500 font-semibold block">জমার তারিখ</span>
          <p className="text-base sm:text-lg font-bold text-amber-950">২০ তারিখ</p>
          <span className="text-[10px] text-amber-700 font-medium">প্রতি মাসের মধ্যে</span>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl text-center">
          <Clock className="w-6 h-6 text-blue-700 mx-auto mb-1" />
          <span className="text-xs text-stone-500 font-semibold block">ডাউন পেমেন্ট</span>
          <p className="text-base sm:text-lg font-bold text-blue-950">৫,০০০ টাকা</p>
          <span className="text-[10px] text-blue-700 font-medium">প্রতি ৬ মাস পর পর</span>
        </div>

        <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl text-center">
          <ShieldCheck className="w-6 h-6 text-purple-700 mx-auto mb-1" />
          <span className="text-xs text-stone-500 font-semibold block">সমিতির মেয়াদ</span>
          <p className="text-base sm:text-lg font-bold text-purple-950">৫ বছর</p>
          <span className="text-[10px] text-purple-700 font-medium">২০২৫ হতে ২০৩০</span>
        </div>
      </div>

      {/* Main Green Card directly replicating the green sheet from image */}
      <div className="bg-[#1b5e39] text-white rounded-3xl p-6 sm:p-10 shadow-2xl border-4 border-amber-400 relative overflow-hidden">
        
        {/* Banner inside green sheet */}
        <div className="text-center pb-6 border-b border-emerald-700/80 mb-6 space-y-1">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-sans">
            ভাই-বন্ধু সমবায় সমিতি
          </h2>
          <h3 className="text-xl sm:text-2xl font-bold text-amber-300 pt-1">
            সমিতির নিয়ম নীতিমালা :
          </h3>
        </div>

        {/* Rules List */}
        <div className="space-y-4">
          {activeRules.map((rule) => {
            const isFineOrBan = rule.no === 6;
            return (
              <div
                key={rule.no}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start justify-between gap-3 ${
                  isFineOrBan 
                    ? 'bg-red-950/40 border-red-400/60'
                    : 'bg-emerald-900/50 hover:bg-emerald-900/80 border-emerald-700/60'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-400 text-emerald-950 font-black flex items-center justify-center text-sm shrink-0 shadow-sm mt-0.5">
                    {toBengaliNumber(rule.no)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="font-bold text-amber-200 text-sm sm:text-base">
                        {rule.title}
                      </h4>
                      {rule.no === 6 && (
                        <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          কঠোর নিষেধাজ্ঞা
                        </span>
                      )}
                    </div>
                    <p className="text-sm sm:text-base text-emerald-50 leading-relaxed font-sans">
                      {rule.description}
                    </p>
                  </div>
                </div>

                <div className="self-end sm:self-start shrink-0">
                  <button
                    onClick={() => handleCopyRule(rule)}
                    className="p-1.5 text-emerald-300 hover:text-white hover:bg-emerald-700/50 rounded-lg transition-colors text-xs flex items-center gap-1"
                    title="এই নিয়মটি কপি করুন"
                  >
                    {copiedRuleId === rule.no ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-amber-300" />
                        <span className="text-[11px] text-amber-300">কপি হয়েছে</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[11px]">কপি</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note inside Green Card */}
        <div className="mt-8 pt-6 border-t border-emerald-700/80 text-center space-y-1">
          <p className="text-xs sm:text-sm text-amber-200 font-semibold">
            উক্ত নীতিমালা সকল সদস্যের পূর্ণ সম্মতিক্রমে ও উপস্থিতিতে স্বাক্ষরিত ও কার্যকর।
          </p>
          <p className="text-[11px] text-emerald-300">
            স্থান: {data?.address ? data.address.replace(' | ২০২৫', '') : 'মধ্য মুক্তির কান্দি, পাঠান বাজার, মতলব উত্তর, চাঁদপুর'} | প্রকাশকাল: ২০২৫
          </p>
        </div>

      </div>

      {/* Frequently Asked Questions on Rules */}
      <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          নিয়মাবলী সম্পর্কিত সচরাচর জিজ্ঞাসা (FAQ)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
            <strong className="text-stone-900 block font-bold">
              ১. ২০ তারিখের পর চাঁদা দিলে কী ব্যবস্থা নেওয়া হবে?
            </strong>
            <p className="text-stone-600 leading-relaxed">
              ধারা ৩ অনুযায়ী, ২০ তারিখের মধ্যে চাঁদা জমা দিতে ব্যর্থ হলে কমিটি সার্বিক পরিস্থিতি বিবেচনা করে যে কোনো সিদ্ধান্ত (জরিমানা বা পরবর্তী তারিখ) গ্রহণের অধিকার সংরক্ষণ করে।
            </p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
            <strong className="text-stone-900 block font-bold">
              ২. কোনো সদস্য সমিতি থেকে আগে চলে যেতে চাইলে?
            </strong>
            <p className="text-stone-600 leading-relaxed">
              ধারা ৪ অনুযায়ী, ৫ বছর পূর্ণ হওয়ার আগে কেউ সমিতি প্রত্যাহার করতে চাইলে বছর শেষে তাকে শুধুমাত্র তার জমাকৃত মূল টাকা কোনো মুনাফা বা প্রফিট ছাড়াই ফেরত দেওয়া হবে।
            </p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
            <strong className="text-stone-900 block font-bold">
              ৩. জরুরি প্রয়োজনে সমিতি থেকে ধার নেওয়া যাবে কি?
            </strong>
            <p className="text-stone-600 leading-relaxed">
              ধারা ৬ অত্যন্ত কঠোর ও স্পষ্ট: সমিতির মূল তহবিল থেকে কখনই কাউকে কোনো প্রকার ধার বা ঋণ হিসেবে টাকা দেওয়া হবে না।
            </p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
            <strong className="text-stone-900 block font-bold">
              ৪. হিসাবের স্বচ্ছতা কীভাবে বজায় থাকবে?
            </strong>
            <p className="text-stone-600 leading-relaxed">
              ধারা ৭ ও ৮ অনুযায়ী, সংগৃহীত অর্থ একই মাসের মধ্যে ব্যাংকে জমা দিয়ে রসিদ গ্রুপে দেখাতে হবে এবং দায়িত্বপ্রাপ্ত কর্মকর্তারা যেকোনো সদস্যকে হিসাব দিতে বাধ্য থাকবেন।
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
