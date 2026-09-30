import React from 'react';
import { CommitteeMember, SocietyData } from '../types';
import { COMMITTEE_MEMBERS } from '../data/initialData';
import { 
  Crown, 
  Award, 
  Briefcase, 
  Wallet, 
  Sparkles, 
  Phone, 
  MessageSquare, 
  Copy, 
  Check, 
  ShieldCheck, 
  FileCheck2,
  Users,
  ArrowLeft
} from 'lucide-react';

interface CommitteePageProps {
  committee?: CommitteeMember[];
  data?: SocietyData;
  onNavigate?: (tab: string) => void;
  onOpenDocsModal: (tab?: 'rules' | 'ledger' | 'committee' | 'logo') => void;
}

export const CommitteePage: React.FC<CommitteePageProps> = ({ committee, data, onNavigate, onOpenDocsModal }) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const activeCommittee = committee && committee.length > 0 ? committee : (data?.committee && data.committee.length > 0 ? data.committee : COMMITTEE_MEMBERS);

  const handleCopyPhone = (phone: string, id: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const president = activeCommittee.find(m => m.role.includes('সভাপতি') && !m.role.includes('সহ'));
  const vicePresidents = activeCommittee.filter(m => m.role.includes('সহ-সভাপতি') || m.role.includes('সহ সভাপতি'));
  const genSec = activeCommittee.find(m => m.role.includes('সাধারণ সম্পাদক') && !m.role.includes('যুগ্ম'));
  const jointSecs = activeCommittee.filter(m => m.role.includes('যুগ্ম') || m.type === 'joint');
  const cashiers = activeCommittee.filter(m => m.type === 'cashier' || m.role.includes('ক্যাশিয়ার'));
  const advisors = activeCommittee.filter(m => m.type === 'advisor' || m.role.includes('উপদেষ্টা'));
  const others = activeCommittee.filter(m => 
    m !== president && 
    !vicePresidents.includes(m) && 
    m !== genSec && 
    !jointSecs.includes(m) && 
    !cashiers.includes(m) && 
    !advisors.includes(m)
  );

  const getMemberPhoto = (name: string, phone?: string): string | undefined => {
    const found = data?.members.find(
      (m) => m.name.trim() === name.trim() || (phone && m.phone.trim() === phone.trim())
    );
    return found?.photoUrl;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-10">
      
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
        <span className="text-[11px] font-bold text-stone-500">হোম / কমিটি তালিকা</span>
      </div>

      {/* Banner matching the Committee poster */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 text-white p-8 sm:p-12 rounded-3xl shadow-2xl border-4 border-amber-400 text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs sm:text-sm font-bold px-4 py-1 rounded-full uppercase tracking-wider">
          <Award className="w-4 h-4 text-amber-300" /> কার্যনির্বাহী ও উপদেষ্টা পরিষদ
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          ভাই বন্ধু সমবায় সমিতির কমিটি
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-8 text-sm sm:text-base font-bold text-emerald-100 max-w-xl mx-auto py-2 border-y border-emerald-700/60">
          <span className="text-amber-300">একতা সাথে থাকি • উন্নতির পথে</span>
          <span className="hidden sm:inline">|</span>
          <span className="text-amber-300">সমবায়ে শক্তি সবার জন্য সমৃদ্ধি</span>
        </div>

        <p className="text-xs sm:text-sm text-emerald-200">
          মধ্য মুক্তির কান্দি, পাঠান বাজার, মতলব উত্তর, চাঁদপুর | স্থাপিত: ২০২৫
        </p>

        <div className="pt-2">
          <button
            onClick={() => onOpenDocsModal('committee')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-amber-300 rounded-lg text-xs font-semibold border border-amber-400/30 transition-all"
          >
            <FileCheck2 className="w-4 h-4" /> মূল কমিটি ব্যানার পোস্টার দেখুন
          </button>
        </div>
      </div>

      {/* 1. PRESIDENT (সভাপতি) */}
      {president && (
        <section className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
            <Crown className="w-4 h-4 text-amber-600" /> সমিতি প্রধান
          </div>

          <div className="max-w-xl mx-auto bg-gradient-to-br from-red-700 via-red-800 to-red-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-400 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/20 rounded-full blur-xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center text-center space-y-3">
              <div className="w-20 h-20 rounded-full bg-white/15 border-2 border-amber-300 flex items-center justify-center shadow-inner text-amber-300 overflow-hidden">
                {getMemberPhoto(president.name, president.phone) ? (
                  <img
                    src={getMemberPhoto(president.name, president.phone)}
                    alt={president.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Crown className="w-10 h-10" />
                )}
              </div>

              <div>
                <span className="bg-amber-400 text-red-950 text-xs font-black uppercase px-3 py-1 rounded-full shadow-xs">
                  সভাপতি
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">
                  {president.name}
                </h2>
                <p className="text-xs text-red-200 mt-1">
                  ভাই-বন্ধু সমবায় সমিতি, চাঁদপুর
                </p>
              </div>

              {president.phone && (
                <div className="pt-3 flex flex-wrap items-center justify-center gap-2">
                  <a
                    href={`tel:${president.phone}`}
                    className="px-4 py-2 bg-white text-red-900 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md hover:bg-stone-100 transition-all"
                  >
                    <Phone className="w-4 h-4 text-emerald-700" /> {president.phone}
                  </a>

                  <a
                    href={`https://wa.me/${president.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md transition-colors"
                    title="হোয়াটসঅ্যাপে মেসেজ করুন"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => handleCopyPhone(president.phone!, president.id)}
                    className="p-2 bg-red-950/60 hover:bg-red-950 text-amber-300 rounded-xl border border-amber-400/40 shadow-xs transition-colors"
                    title="কপি করুন"
                  >
                    {copiedId === president.id ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 2. VICE-PRESIDENTS & GENERAL SECRETARY */}
      <section className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-bold text-emerald-950 flex items-center justify-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-700" />
            সহ-সভাপতি ও সাধারণ সম্পাদক
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Vice Presidents */}
          {vicePresidents.map((vp) => (
            <div
              key={vp.id}
              className="bg-white rounded-2xl p-6 border-2 border-emerald-600/30 hover:border-emerald-600 shadow-lg flex flex-col justify-between"
            >
              <div>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {vp.role}
                </span>
                <div className="flex items-center gap-3 mt-2">
                  {getMemberPhoto(vp.name, vp.phone) && (
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-emerald-100 border border-emerald-300 shrink-0">
                      <img src={getMemberPhoto(vp.name, vp.phone)} alt={vp.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-xl font-bold text-stone-900">
                      {vp.name}
                    </h4>
                    <p className="text-xs text-stone-500 mt-0.5">কার্যনির্বাহী সহ-প্রধান</p>
                  </div>
                </div>
              </div>

              {vp.phone && (
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <a
                    href={`tel:${vp.phone}`}
                    className="font-mono font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" /> {vp.phone}
                  </a>
                  <button
                    onClick={() => handleCopyPhone(vp.phone!, vp.id)}
                    className="text-stone-400 hover:text-stone-700 p-1"
                  >
                    {copiedId === vp.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* General Secretary */}
          {genSec && (
            <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-2xl p-6 border-2 border-blue-400 shadow-xl flex flex-col justify-between">
              <div>
                <span className="bg-amber-400 text-blue-950 text-xs font-black px-2.5 py-0.5 rounded-full shadow-xs">
                  {genSec.role}
                </span>
                <div className="flex items-center gap-3 mt-2">
                  {getMemberPhoto(genSec.name, genSec.phone) && (
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-blue-800 border border-blue-300 shrink-0">
                      <img src={getMemberPhoto(genSec.name, genSec.phone)} alt={genSec.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-xl font-bold text-white">
                      {genSec.name}
                    </h4>
                    <p className="text-xs text-blue-200 mt-0.5">প্রশাসনিক প্রধান ও সচিবালয়</p>
                  </div>
                </div>
              </div>

              {genSec.phone && (
                <div className="mt-4 pt-3 border-t border-blue-800 flex items-center justify-between text-xs">
                  <a
                    href={`tel:${genSec.phone}`}
                    className="font-mono font-bold text-amber-300 hover:text-white flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5" /> {genSec.phone}
                  </a>
                  <button
                    onClick={() => handleCopyPhone(genSec.phone!, genSec.id)}
                    className="text-blue-300 hover:text-white p-1"
                  >
                    {copiedId === genSec.id ? <Check className="w-3.5 h-3.5 text-amber-300" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 3. JOINT GENERAL SECRETARIES */}
      <section className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-bold text-emerald-950">যুগ্ম সাধারণ সম্পাদকবৃন্দ</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {jointSecs.map((js) => (
            <div
              key={js.id}
              className="bg-purple-950 text-white rounded-2xl p-5 border-2 border-purple-400 shadow-md flex items-center justify-between"
            >
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-200 bg-purple-900/80 px-2 py-0.5 rounded">
                  যুগ্ম সাধারণ সম্পাদক
                </span>
                <h4 className="text-lg font-bold text-white mt-1">{js.name}</h4>
                {js.phone && (
                  <p className="text-xs text-purple-200 font-mono mt-1">মোবাইল: {js.phone}</p>
                )}
              </div>
              {js.phone && (
                <a
                  href={`tel:${js.phone}`}
                  className="p-2.5 bg-purple-800 hover:bg-purple-700 text-purple-100 rounded-xl transition-colors"
                >
                  <Phone className="w-4 h-4" />
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 4. CASHIERS (অর্থ বিভাগ) */}
      <section className="space-y-4">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
            <Wallet className="w-4 h-4 text-amber-700" /> অর্থ ও হিসাব বিভাগ (টাকা জমা নেওয়ার দায়িত্বপ্রাপ্ত)
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {cashiers.map((cashier) => (
            <div
              key={cashier.id}
              className="bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 text-white rounded-2xl p-6 border-2 border-amber-300 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="bg-stone-900/80 text-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-400/40">
                    {cashier.role}
                  </span>
                  <Wallet className="w-5 h-5 text-amber-200" />
                </div>
                <h4 className="text-2xl font-black text-white mt-3">
                  {cashier.name}
                </h4>
                <p className="text-xs text-amber-100 mt-1">
                  চাঁদা ও পেমেন্ট রসিদ সংগ্রহের মূল দায়িত্বপ্রাপ্ত
                </p>
              </div>

              {cashier.phone && (
                <div className="mt-5 pt-3 border-t border-amber-500/60 flex items-center justify-between">
                  <a
                    href={`tel:${cashier.phone}`}
                    className="font-mono font-bold text-white hover:text-amber-200 text-sm flex items-center gap-1.5"
                  >
                    <Phone className="w-4 h-4 text-amber-300" /> {cashier.phone}
                  </a>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={`https://wa.me/${cashier.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs"
                      title="হোয়াটসঅ্যাপ"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => handleCopyPhone(cashier.phone!, cashier.id)}
                      className="p-2 bg-amber-900/60 hover:bg-amber-900 text-white rounded-lg text-xs"
                      title="কপি করুন"
                    >
                      {copiedId === cashier.id ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 5. ADVISORY BOARD (সম্মানিত উপদেষ্টা মন্ডলী) */}
      <section className="bg-stone-50 border-2 border-emerald-700/20 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-emerald-800 text-white text-xs font-bold px-3 py-1 rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> নীতি ও দিকনির্দেশনা
          </div>
          <h3 className="text-2xl font-extrabold text-emerald-950">
            সম্মানিত উপদেষ্টা মন্ডলী
          </h3>
          <p className="text-xs text-stone-600 mt-1">
            সমিতির দীর্ঘমেয়াদী নীতিমালা প্রণয়ন ও পরিচালনায় অভিজ্ঞ উপদেষ্টা পরিষদ
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {advisors.map((advisor, idx) => (
            <div
              key={advisor.id}
              className="bg-white p-4 rounded-xl border border-stone-200 hover:border-emerald-600 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  উপদেষ্টা নং {idx + 1}
                </span>
                <h4 className="font-bold text-stone-900 text-base mt-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  {advisor.name}
                </h4>
              </div>

              {advisor.phone && (
                <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                  <a
                    href={`tel:${advisor.phone}`}
                    className="font-mono text-stone-600 hover:text-emerald-700 font-semibold"
                  >
                    {advisor.phone}
                  </a>
                  <button
                    onClick={() => handleCopyPhone(advisor.phone!, advisor.id)}
                    className="text-stone-400 hover:text-stone-700"
                  >
                    {copiedId === advisor.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Official Slogan Box matching the bottom of the poster */}
      <div className="text-center py-6 border-t-2 border-emerald-800/10">
        <h4 className="text-xl sm:text-2xl font-black text-emerald-900 tracking-wider font-sans">
          — সমবায়ে গড়ি, সমৃদ্ধ ভবিষ্যৎ —
        </h4>
        <p className="text-xs text-stone-500 mt-1">
          ভাই-বন্ধু সমবায় সমিতি • মধ্য মুক্তির কান্দি, পাঠান বাজার, মতলব উত্তর, চাঁদপুর
        </p>
      </div>

    </div>
  );
};
