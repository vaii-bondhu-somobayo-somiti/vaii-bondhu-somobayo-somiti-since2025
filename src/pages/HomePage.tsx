import React, { useState } from 'react';
import { Logo } from '../components/Logo';
import { SocietyData } from '../types';
import { 
  formatCurrency, 
  toBengaliNumber, 
  calculateMemberAllTotal,
  calculateMemberYearTotal,
  MONTHS_NAME_MAP,
  getMemberMonthPayment
} from '../utils/storage';
import { 
  Users, 
  Landmark, 
  TrendingUp, 
  CreditCard, 
  BookOpen, 
  ShieldCheck, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  PiggyBank,
  FileCheck2,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Search,
  Phone,
  RotateCcw,
  CheckCircle,
  XCircle,
  Eye,
  Info
} from 'lucide-react';

interface HomePageProps {
  data: SocietyData;
  onNavigate: (tab: string) => void;
  onOpenDocsModal: (tab?: 'rules' | 'ledger' | 'committee' | 'logo') => void;
}

export const HomePage: React.FC<HomePageProps> = ({ data, onNavigate, onOpenDocsModal }) => {
  // Compute total members and bank balance
  const totalMembers = data.members.length; // 24
  const bankBalance = data.currentBankBalance;

  // -------------------------------------------------------------
  // DYNAMIC AUTO RUNNING MONTH & YEAR CALCULATION
  // Automatically detects current calendar month and year (e.g. September 2026, October 2026, November 2026, etc.)
  // Month-by-month it auto updates without requiring code changes!
  // -------------------------------------------------------------
  const now = new Date();
  const calendarRunningYear = now.getFullYear(); // e.g. 2026
  const calendarRunningMonthKey = String(now.getMonth() + 1).padStart(2, '0'); // e.g. '09' or '10'
  const calendarRunningMonthName = MONTHS_NAME_MAP[calendarRunningMonthKey] || `${calendarRunningMonthKey}তম মাস`;

  // Selected year and month - strictly defaults to the REAL calendar running month
  const [selectedYear, setSelectedYear] = useState<number>(calendarRunningYear);
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(calendarRunningMonthKey);

  // Is currently viewing the real calendar live running month
  const isLiveRunningMonth = selectedYear === calendarRunningYear && selectedMonthKey === calendarRunningMonthKey;
  const activeMonthName = MONTHS_NAME_MAP[selectedMonthKey] || `${selectedMonthKey}তম মাস`;

  // Expected fee per member
  const expectedMonthlyFee = data.monthlyFeeDefault || 2500;
  const targetCollection = totalMembers * expectedMonthlyFee;

  // Filter members who PAID for the active month
  const paidMembers = data.members.filter(m => {
    const amt = getMemberMonthPayment(m, selectedYear, selectedMonthKey);
    return amt !== null && Number(amt) > 0;
  });
  const paidCount = paidMembers.length;

  // Filter members who are DUE for the active month
  const dueMembers = data.members.filter(m => {
    const amt = getMemberMonthPayment(m, selectedYear, selectedMonthKey);
    return amt === null || Number(amt) <= 0;
  });
  const dueCount = dueMembers.length;

  // Total collected money in the active month
  const totalCollection = data.members.reduce((sum, m) => {
    const amt = getMemberMonthPayment(m, selectedYear, selectedMonthKey);
    return sum + (amt && Number(amt) > 0 ? Number(amt) : 0);
  }, 0);

  const totalDueAmount = dueCount * expectedMonthlyFee;
  const collectionPercentage = targetCollection > 0 
    ? Math.round((totalCollection / targetCollection) * 100) 
    : 0;

  // UI state for detailed view under bank balance
  const [detailTab, setDetailTab] = useState<'due' | 'paid' | 'all'>('due');
  const [searchMember, setSearchMember] = useState<string>('');

  // Reset to live running month
  const handleResetToRunningMonth = () => {
    setSelectedYear(calendarRunningYear);
    setSelectedMonthKey(calendarRunningMonthKey);
  };

  // Filtered members for the running month detailed section
  const displayedMembers = (detailTab === 'paid' ? paidMembers : detailTab === 'due' ? dueMembers : data.members)
    .filter(m => {
      const q = searchMember.trim().toLowerCase();
      if (!q) return true;
      const bnToEn = (str: string) => str.replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d).toString());
      const cleanQ = bnToEn(q).replace(/\s+/g, '');
      return (
        m.name.toLowerCase().includes(q) ||
        m.phone.includes(q) ||
        m.id.toLowerCase().includes(cleanQ) ||
        String(m.rollNo) === cleanQ
      );
    });

  return (
    <div className="space-y-10 pb-12">
      
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 text-white py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-b-4 border-amber-500 shadow-xl">
        {/* Background decorative patterns */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-amber-400 blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-emerald-400 blur-3xl"></div>
        </div>

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          
          {/* Circular Emblem with golden glow */}
          <div className="inline-flex p-2 rounded-full bg-white/10 backdrop-blur-md border border-amber-400/40 shadow-2xl animate-in zoom-in duration-300">
            <Logo size={120} />
          </div>

          <div className="space-y-2">
            <div className="inline-block bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full backdrop-blur-xs">
              রেজিস্টার্ড সমবায় সমিতি • চাঁদপুর • ২০২৫
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-md">
              ভাই-বন্ধু সমবায় সমিতি
            </h1>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-amber-300 tracking-wide font-sans">
              "একতা সাথে থাকি, উন্নতির পথে"
            </p>
            <p className="text-sm sm:text-base text-emerald-100 max-w-2xl mx-auto pt-2 font-medium">
              {data?.address ? data.address.replace(' | ২০২৫', '') : 'মধ্য মুক্তির কান্দি, পাঠান বাজার, মতলব উত্তর, চাঁদপুর'}
            </p>
          </div>

          {/* Quick CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => onNavigate('payment')}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 text-sm sm:text-base"
            >
              <CreditCard className="w-5 h-5 text-stone-950" />
              চাঁদা পেমেন্ট করুন
            </button>

            <button
              onClick={() => onNavigate('members')}
              className="px-6 py-3 bg-emerald-800/90 hover:bg-emerald-700 text-white font-semibold rounded-xl border border-emerald-500/40 backdrop-blur-xs flex items-center gap-2 transition-all text-sm sm:text-base cursor-pointer"
            >
              <Users className="w-5 h-5 text-amber-300" />
              সদস্য তালিকা
            </button>

            <button
              onClick={() => onNavigate('rules')}
              className="px-5 py-3 bg-white/10 hover:bg-white/20 text-emerald-100 font-medium rounded-xl border border-white/20 backdrop-blur-xs flex items-center gap-2 transition-all text-sm sm:text-base cursor-pointer"
            >
              <FileCheck2 className="w-5 h-5 text-amber-300" />
              সমিতির নিয়ম নীতিমালা
            </button>
          </div>

          {/* Slogan Pill */}
          <div className="pt-2 text-xs sm:text-sm text-emerald-200 font-medium flex items-center justify-center gap-2">
            <span>সমবায়ে শক্তি সবার জন্য সমৃদ্ধি</span>
            <span>•</span>
            <span className="text-amber-300">সমবায়ে গড়ি, সমৃদ্ধ ভবিষ্যৎ</span>
          </div>

        </div>
      </section>

      {/* 3 Core Highlight Cards requested by user */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: মোট সদস্য */}
          <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-emerald-600/20 hover:border-emerald-600/50 transition-all group flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase font-bold tracking-wider text-emerald-700 mb-1">
                  নিবন্ধিত সদস্য
                </p>
                <h3 className="text-3xl sm:text-4xl font-black text-emerald-950">
                  মোট সদস্য {toBengaliNumber(totalMembers)} জন
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  সমিতির নিবন্ধিত নিয়মিত ২৪ জন অংশীদার
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                <Users className="w-7 h-7" />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> ২৪ জনই সক্রিয়
              </span>
              <button
                onClick={() => onNavigate('members')}
                className="text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1 group-hover:underline"
              >
                সদস্য তালিকা দেখুন <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: মোট ব্যাংক ব্যালেন্স */}
          <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white rounded-2xl p-6 shadow-xl border-2 border-amber-400 hover:border-amber-300 transition-all group flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-start justify-between relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs uppercase font-bold tracking-wider text-amber-300">
                    তহবিল স্থিতি
                  </span>
                  <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-400/30">
                    {data.bankAccount?.bankName || 'জনতা ব্যাংক লিমিটেড'}
                  </span>
                </div>
                <h3 className="text-3xl sm:text-4xl font-black text-white">
                  {formatCurrency(bankBalance)}
                </h3>
                <p className="text-xs text-emerald-200 mt-1">
                  সমিতির মোট রিজার্ভ ব্যাংক ব্যালেন্স
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-amber-500 text-emerald-950 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <Landmark className="w-7 h-7" />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-emerald-800/80 flex items-center justify-between text-xs relative z-10">
              <span className="text-amber-300 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> ব্যাংক ফান্ড সুরক্ষিত
              </span>
              <button
                onClick={() => onNavigate('report')}
                className="text-white hover:text-amber-200 font-bold flex items-center gap-1"
              >
                আর্থিক রিপোর্ট <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 3: চলতি মাসের লাইভ হিসাব */}
          <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-amber-500/40 hover:border-amber-500/80 transition-all group flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    {isLiveRunningMonth ? 'লাইভ রানিং মাস' : 'নির্বাচিত মাস'}
                  </span>
                  <span className="text-xs font-bold text-amber-800">
                    {activeMonthName} {toBengaliNumber(selectedYear)}
                  </span>
                </div>
                <h3 className="text-3xl sm:text-4xl font-black text-emerald-950">
                  {formatCurrency(totalCollection)}
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  এই মাসের মোট আদায়কৃত চাঁদা (লক্ষ্য: {formatCurrency(targetCollection)})
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner shrink-0">
                <TrendingUp className="w-7 h-7" />
              </div>
            </div>

            {/* Progress bar towards target */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-stone-600 mb-1 font-medium">
                <span>আদায়ের অগ্রগতি ({toBengaliNumber(collectionPercentage)}%)</span>
                <span className="font-bold text-emerald-800">
                  {toBengaliNumber(paidCount)} / {toBengaliNumber(totalMembers)} জন
                </span>
              </div>
              <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden border border-stone-200">
                <div
                  className="bg-gradient-to-r from-emerald-500 via-amber-500 to-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(collectionPercentage, 100)}%` }}
                />
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-stone-700 font-medium">
                  পরিশোধ: <strong className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">{toBengaliNumber(paidCount)} জন</strong>
                </span>
                <span className="text-stone-700 font-medium">
                  বাকি: <strong className="text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">{toBengaliNumber(dueCount)} জন</strong>
                </span>
              </div>
              <button
                onClick={() => {
                  const el = document.getElementById('running-month-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1 cursor-pointer hover:underline"
              >
                কে কে দিছে দেখুন <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* RUNNING MONTH LIVE SECTION (Right under Bank Balance on Home) */}
      {/* ============================================================== */}
      <section id="running-month-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-emerald-600/30 overflow-hidden">
          
          {/* Section Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-stone-200">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>
                  {isLiveRunningMonth ? 'চলতি লাইভ রানিং মাস' : 'মাসভিত্তিক হিসাব'}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-emerald-800">
                  স্বয়ংক্রিয় রানিং হিসাব (ক্যালেন্ডার অনুযায়ী প্রতি মাসে নিজে নিজেই আপডেট হয়)
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-emerald-950">
                {activeMonthName} {toBengaliNumber(selectedYear)}-এর চাঁদা আদায় ও বকেয়া খতিয়ান
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                চলতি মাসে কে কে চাঁদা দিয়েছেন এবং কার কার বাকি রয়েছে তার লাইভ তালিকা
              </p>
            </div>

            {/* Quick Month Switcher / Return to Live Running Month */}
            <div className="flex flex-wrap items-center gap-2 self-start lg:self-center bg-stone-50 p-2 rounded-2xl border border-stone-200">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-stone-700 pl-1">বছর:</span>
                <div className="flex rounded-lg bg-stone-200/80 p-0.5">
                  <button
                    onClick={() => setSelectedYear(2025)}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      selectedYear === 2025 ? 'bg-white text-emerald-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    ২০২৫
                  </button>
                  <button
                    onClick={() => setSelectedYear(2026)}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      selectedYear === 2026 ? 'bg-white text-emerald-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    ২০২৬
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-stone-700">মাস:</span>
                <select
                  value={selectedMonthKey}
                  onChange={(e) => setSelectedMonthKey(e.target.value)}
                  className="bg-white border border-stone-300 rounded-lg text-xs font-bold px-2.5 py-1.5 text-stone-800 focus:outline-emerald-600 cursor-pointer shadow-xs"
                >
                  {(selectedYear === 2026 ? [
                    { k: '01', l: 'জানুয়ারি' },
                    { k: '02', l: 'ফেব্রুয়ারি' },
                    { k: '03', l: 'মার্চ' },
                    { k: '04', l: 'এপ্রিল' },
                    { k: '05', l: 'মে' },
                    { k: '06', l: 'জুন' },
                    { k: '07', l: 'জুলাই' },
                    { k: '08', l: 'আগস্ট' },
                    { k: '09', l: 'সেপ্টেম্বর' },
                    { k: '10', l: 'অক্টোবর' },
                    { k: '11', l: 'নভেম্বর' },
                    { k: '12', l: 'ডিসেম্বর' },
                  ] : [
                    { k: '08', l: 'আগস্ট ২০২৫' },
                    { k: '09', l: 'সেপ্টেম্বর ২০২৫' },
                    { k: '10', l: 'অক্টোবর ২০২৫' },
                    { k: '11', l: 'নভেম্বর ২০২৫' },
                    { k: '12', l: 'ডিসেম্বর ২০২৫' },
                  ]).map((item) => (
                    <option key={item.k} value={item.k}>
                      {item.l} {selectedYear === calendarRunningYear && item.k === calendarRunningMonthKey ? '★ (লাইভ রানিং)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {!isLiveRunningMonth && (
                <button
                  onClick={handleResetToRunningMonth}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                  title="চলতি রানিং মাসে ফিরুন"
                >
                  <RotateCcw className="w-3 h-3" />
                  রানিং মাসে ফিরুন
                </button>
              )}
            </div>
          </div>

          {/* 3 Prominent Stat Cards for the running month */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
            
            {/* 1. মোট আদায় */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/60 p-5 rounded-2xl border border-emerald-200 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-800 mb-1">
                <span>মোট আদায়কৃত চাঁদা</span>
                <TrendingUp className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-950">
                {formatCurrency(totalCollection)}
              </div>
              <div className="mt-2 text-xs text-emerald-800/80 font-medium">
                প্রত্যাশিত মোট লক্ষ্য: {formatCurrency(targetCollection)}
              </div>
            </div>

            {/* 2. কত জন দিছে (পরিশোধিত) */}
            <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white p-5 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-200 mb-1">
                <span>পরিশোধ করেছেন</span>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-300">
                {toBengaliNumber(paidCount)} জন সদস্য
              </div>
              <div className="mt-2 text-xs text-emerald-200 font-medium">
                মোট সদস্যের {toBengaliNumber(collectionPercentage)}% পরিশোধ করেছেন
              </div>
            </div>

            {/* 3. কত জন দেয় নাই (বকেয়া) */}
            <div className="bg-gradient-to-br from-red-50 to-rose-100/60 p-5 rounded-2xl border border-red-200 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-red-800 mb-1">
                <span>এখনো বাকি রয়েছে</span>
                <XCircle className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-red-700">
                {toBengaliNumber(dueCount)} জন সদস্য
              </div>
              <div className="mt-2 text-xs text-red-700 font-medium">
                বকেয়া চাঁদার পরিমাণ: {formatCurrency(totalDueAmount)}
              </div>
            </div>

          </div>

          {/* Member Details Controller: Tabs & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 pb-4">
            
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setDetailTab('due')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  detailTab === 'due'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                <XCircle className="w-4 h-4" />
                বকেয়া সদস্যবৃন্দ ({toBengaliNumber(dueCount)})
              </button>

              <button
                onClick={() => setDetailTab('paid')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  detailTab === 'paid'
                    ? 'bg-emerald-800 text-white shadow-md'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                পরিশোধ করেছেন ({toBengaliNumber(paidCount)})
              </button>

              <button
                onClick={() => setDetailTab('all')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  detailTab === 'all'
                    ? 'bg-stone-900 text-white shadow-md'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                <Users className="w-4 h-4" />
                সকল সদস্য ({toBengaliNumber(totalMembers)})
              </button>
            </div>

            {/* Quick search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                placeholder="সদস্য খুঁজুন (নাম/রোল)..."
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-stone-800 focus:outline-emerald-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Members List Table */}
          <div className="overflow-x-auto border border-stone-200 rounded-2xl bg-white shadow-xs">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-stone-100/80 text-stone-700 font-bold border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4 text-center">রোল</th>
                  <th className="py-3 px-4">আইডি</th>
                  <th className="py-3 px-4">সদস্যের নাম</th>
                  <th className="py-3 px-4">পদবী</th>
                  <th className="py-3 px-4">মোবাইল নম্বর</th>
                  <th className="py-3 px-4 text-center">{activeMonthName} চাঁদা</th>
                  <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                  <th className="py-3 px-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {displayedMembers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-stone-500 font-medium">
                      {detailTab === 'due' 
                        ? 'মাশাআল্লাহ! এই মাসে কোনো বকেয়া সদস্য নেই, সবাই পরিশোধ করেছেন।'
                        : 'কোনো সদস্য পাওয়া যায়নি।'}
                    </td>
                  </tr>
                ) : (
                  displayedMembers.map((m) => {
                    const amt = getMemberMonthPayment(m, selectedYear, selectedMonthKey);
                    const isPaid = amt !== null && Number(amt) > 0;

                    return (
                      <tr key={m.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3 px-4 text-center font-bold text-stone-700">
                          {toBengaliNumber(m.rollNo)}
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-emerald-800 text-xs">
                          {m.id}
                        </td>
                        <td className="py-3 px-4 font-bold text-stone-900">
                          {m.name}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                            {m.role || 'সদস্য'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-stone-600">
                          {m.phone ? (
                            <a
                              href={`tel:${m.phone}`}
                              className="inline-flex items-center gap-1 hover:text-emerald-800 hover:underline"
                            >
                              <Phone className="w-3 h-3 text-stone-400" />
                              {m.phone}
                            </a>
                          ) : '—'}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold">
                          {isPaid ? (
                            <span className="text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-md">
                              ৳ {toBengaliNumber(amt)}
                            </span>
                          ) : (
                            <span className="text-red-700 bg-red-100/70 px-2.5 py-1 rounded-md">
                              ৳ {toBengaliNumber(expectedMonthlyFee)} (বাকি)
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300">
                              <CheckCircle className="w-3.5 h-3.5" /> পরিশোধিত
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-bold text-xs border border-red-300">
                              <XCircle className="w-3.5 h-3.5" /> বকেয়া
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {isPaid ? (
                            <button
                              onClick={() => onNavigate('members')}
                              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                            >
                              বিবরণ <Eye className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => onNavigate('payment')}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg text-xs transition-colors inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                            >
                              জমা দিন <CreditCard className="w-3 h-3" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Section Footer Banner */}
          <div className="mt-5 p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                প্রতি মাসের ২০ তারিখের মধ্যে চাঁদা পরিশোধের নিয়ম রয়েছে। চাঁদা ব্যাংকে বা বিকাশে জমা হওয়ার পর ক্যাশিয়ার বা অ্যাডমিন তা অনুমোদন করবেন।
              </span>
            </div>
            <button
              onClick={() => onNavigate('members')}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
            >
              ২৪ জন সদস্যের পূর্ণ খতিয়ান <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* Notice Board & Key Deadlines */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* YEAR + MONTH WISE SYSTEM QUICK LAUNCH */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 rounded-3xl p-6 sm:p-7 text-white shadow-xl border-2 border-emerald-600 flex flex-col lg:flex-row items-center justify-between gap-6 mb-6">
          <div className="space-y-1.5 text-center lg:text-left">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <span className="bg-amber-400 text-stone-950 text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                নতুন ফিচার
              </span>
              <span className="text-emerald-200 text-xs font-semibold">
                বছর ও মাসভিত্তিক স্বয়ংক্রিয় চার্ট সিস্টেম
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              ২০২৫ ও ২০২৬ সালের সম্পূর্ণ মাসভিত্তিক জমার চার্ট
            </h3>
            <p className="text-xs sm:text-sm text-emerald-200/90 max-w-2xl">
              প্রতি মাসের কে কত দিয়েছে তা স্বচ্ছভাবে দেখুন। অ্যাডমিন যেকোনো মাসের টাকা এডিট করতে পারবেন এবং নতুন মাস যোগ করতে পারবেন।
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('year2025')}
              className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-transform hover:scale-105 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-emerald-950" />
              ২০২৫ সালের হিসাব (১২ মাস)
            </button>
            <button
              onClick={() => onNavigate('year2026')}
              className="px-5 py-3 bg-white hover:bg-stone-100 text-emerald-950 font-black rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-transform hover:scale-105 cursor-pointer"
            >
              <TrendingUp className="w-4 h-4 text-emerald-800" />
              ২০২৬ সালের হিসাব (চলমান)
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-50 via-white to-emerald-50 border border-amber-300 rounded-2xl p-5 sm:p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500 text-stone-950 shrink-0 mt-0.5">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  জরুরি নোটিশ
                </span>
                <span className="text-xs text-stone-500">নিয়মাবলী ৩ নং ধারা</span>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-stone-900 mt-1">
                প্রতি মাসের ২০ তারিখের মধ্যে মাসিক চাঁদা পরিশোধের সময়সীমা
              </h4>
              <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                সকল সদস্যকে অনুরোধ করা হচ্ছে বিকাশ অথবা ব্যাংকে চাঁদা জমা দিয়ে ক্যাশিয়ারের নিকট রসিদ নিশ্চিত করুন।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
            <button
              onClick={() => onNavigate('rules')}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
            >
              ১০টি নিয়মাবলী পড়ুন
            </button>
          </div>
        </div>
      </section>

      {/* Feature Highlights: Why Bhai-Bondhu Somobay Samity */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-emerald-950">
            সমিতির মূল স্তম্ভ ও আর্থিক নিয়মাবলী
          </h2>
          <p className="text-sm text-stone-600 mt-2">
            স্বচ্ছ ব্যাংকিং এবং পূর্ণ জবাবদিহিতার মাধ্যমে গঠিত আমাদের ঐতিহ্যবাহী সমবায়
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-stone-900 text-base">৫ বছরের রূপরেখা</h4>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              সমিতির পূর্ণ মেয়াদকাল ৫ বছর (২০২৫-২০৩০)। মেয়াদান্তে লাভ-ক্ষতি সকল সদস্যের মধ্যে সমান হারে বণ্টিত হবে।
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center mb-3">
              <PiggyBank className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-stone-900 text-base">মাসিক চাঁদা ও ডাউনপেমেন্ট</h4>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              মাসিক চাঁদা ২,০০০ টাকা (সঞ্চয়সহ ২,৫০০)। সাথে প্রতি ৬ মাস পর পর সর্বনিম্ন ৫,০০০ টাকা ডাউন পেমেন্ট।
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-800 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-stone-900 text-base">কোনো ব্যক্তিগত ধার নয়</h4>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              সমিতির মূল তহবিল সম্পূর্ণ অক্ষত থাকে। তহবিল থেকে কোনো ব্যক্তিকে ব্যক্তিগত ধার প্রদান কঠোরভাবে নিষিদ্ধ।
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center mb-3">
              <Landmark className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-stone-900 text-base">ব্যাংক ফান্ড ও বিনিয়োগ</h4>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              মাসিক আদায়ের অর্থ সাথে সাথে ব্যাংকে জমা করা হয় এবং নির্দিষ্ট ফান্ড হলে লাভজনক বৈধ খাতে বিনিয়োগ করা হবে।
            </p>
          </div>

        </div>
      </section>

      {/* Overview Table of Recent Status */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-stone-200 shadow-md overflow-hidden">
          
          <div className="bg-stone-50 px-6 py-4 border-b border-stone-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-700" />
                সদস্যদের নিয়মিত চাঁদা ও জমার হালনাগাদ চিত্র ({activeMonthName} {toBengaliNumber(selectedYear)})
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                সদস্য তালিকা ও ব্যাংকিং ডাটাবেজ অনুসারে লাইভ তথ্য
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('members')}
                className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                ২৪ জন সদস্যের পূর্ণ তালিকা <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick List sample */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-stone-100/75 text-stone-700 font-semibold border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4 text-center">নং</th>
                  <th className="py-3 px-4">আইডি</th>
                  <th className="py-3 px-4">সদস্যের নাম</th>
                  <th className="py-3 px-4">পদবী</th>
                  <th className="py-3 px-4 text-center">{activeMonthName} অবস্থা</th>
                  <th className="py-3 px-4 text-center">{toBengaliNumber(selectedYear)} মোট জমা</th>
                  <th className="py-3 px-4 text-right">সর্বমোট জমা</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {data.members.slice(0, 10).map((m) => {
                  const currentMonthAmt = getMemberMonthPayment(m, selectedYear, selectedMonthKey);
                  const isCurrentPaid = currentMonthAmt !== null && Number(currentMonthAmt) > 0;
                  const yearTotal = calculateMemberYearTotal(m, selectedYear);
                  const allTotal = calculateMemberAllTotal(m);

                  return (
                    <tr key={m.id} className="hover:bg-emerald-50/40 transition-colors">
                      <td className="py-3 px-4 text-center font-bold text-stone-500">
                        {toBengaliNumber(m.rollNo)}
                      </td>
                      <td className="py-3 px-4 font-mono text-emerald-800 font-medium">
                        {m.id}
                      </td>
                      <td className="py-3 px-4 font-semibold text-stone-900">
                        {m.name}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                          {m.role || 'সদস্য'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isCurrentPaid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            {toBengaliNumber(currentMonthAmt)} ৳
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-red-100 text-red-700 font-bold text-xs">
                            <XCircle className="w-3 h-3 text-red-500" />
                            বাকি
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-semibold text-stone-800">
                        {formatCurrency(yearTotal)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-950 font-mono">
                        {formatCurrency(allTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="bg-stone-50 p-3 text-center border-t border-stone-200">
            <button
              onClick={() => onNavigate('members')}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1"
            >
              সকল ২৪ জন সদস্যের সম্পূর্ণ তালিকা, মোবাইল ও জমার অবস্থা দেখুন →
            </button>
          </div>

        </div>
      </section>

    </div>
  );
};
