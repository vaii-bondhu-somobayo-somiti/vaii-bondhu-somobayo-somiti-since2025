import React from 'react';
import { Logo } from '../components/Logo';
import { SocietyData } from '../types';
import { formatCurrency, toBengaliNumber } from '../utils/storage';
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
  Clock
} from 'lucide-react';

interface HomePageProps {
  data: SocietyData;
  onNavigate: (tab: string) => void;
  onOpenDocsModal: (tab?: 'rules' | 'ledger' | 'committee' | 'logo') => void;
}

export const HomePage: React.FC<HomePageProps> = ({ data, onNavigate, onOpenDocsModal }) => {
  // Compute key stats
  const totalMembers = data.members.length; // 24
  const bankBalance = data.currentBankBalance; // 105,500
  
  // Current month (September) collection calculation
  const septPaidCount = data.members.filter(m => m.september && m.september > 0).length;
  const septTotalCollection = data.members.reduce((sum, m) => sum + (m.september || 0), 0);
  const septDueCount = totalMembers - septPaidCount;

  // August stats
  const augTotalCollection = data.members.reduce((sum, m) => sum + (m.august || 0), 0);

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
              মধ্য মুজির কান্দি, পাঠান বাজার, মতলব উত্তর, চাঁদপুর
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
                    পূবালী ব্যাংক
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

          {/* Card 3: এই মাসের কালেকশন */}
          <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-amber-500/30 hover:border-amber-500/70 transition-all group flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase font-bold tracking-wider text-amber-700 mb-1">
                  চলতি মাসের হিসাব (সেপ্টেম্বর)
                </p>
                <h3 className="text-3xl sm:text-4xl font-black text-emerald-950">
                  {formatCurrency(septTotalCollection)}
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  এই মাসের মোট আদায়কৃত চাঁদা
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                <TrendingUp className="w-7 h-7" />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="text-stone-600 font-medium">
                পরিশোধ: <strong className="text-emerald-700">{toBengaliNumber(septPaidCount)} জন</strong> • বাকি: <strong className="text-red-600">{toBengaliNumber(septDueCount)} জন</strong>
              </span>
              <button
                onClick={() => onNavigate('payment')}
                className="text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1 group-hover:underline"
              >
                পেমেন্ট করুন <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
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
                প্রতি মাসের ১৫ তারিখের মধ্যে মাসিক চাঁদা পরিশোধের সময়সীমা
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
                সদস্যদের সাম্প্রতিক চাঁদা আদায় চিত্র (আগস্ট ও সেপ্টেম্বর)
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                সদস্য তালিকা অনুসারে হালনাগাদকৃত তথ্য
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
                  <th className="py-3 px-4 text-center">আগস্ট</th>
                  <th className="py-3 px-4 text-center">সেপ্টেম্বর</th>
                  <th className="py-3 px-4 text-right">মোট জমা</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {data.members.slice(0, 8).map((m) => {
                  const totalDeposit = (m.august || 0) + (m.september || 0) + (m.october || 0) + (m.downPayment || 0);
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
                        {m.august ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs">
                            {toBengaliNumber(m.august)} ৳
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-100 text-red-700 font-bold text-xs">
                            বাকি
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {m.september ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs">
                            {toBengaliNumber(m.september)} ৳
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-100 text-red-700 font-bold text-xs">
                            বাকি
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-950">
                        {formatCurrency(totalDeposit)}
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
