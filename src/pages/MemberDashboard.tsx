import React, { useState, useRef } from 'react';
import { SocietyData, Member } from '../types';
import { formatCurrency, toBengaliNumber, updateMemberPhoto } from '../utils/storage';
import { compressAndReadFile } from '../utils/imageHelper';
import { 
  UserCheck, 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Printer, 
  Phone, 
  ShieldCheck, 
  Calendar, 
  FileText, 
  Coins, 
  LogOut,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Camera,
  Trash2,
  Upload,
  User
} from 'lucide-react';
import { Logo } from '../components/Logo';

interface MemberDashboardProps {
  data: SocietyData;
  memberId: string;
  onLogout: () => void;
  onNavigate: (tab: string) => void;
  onDataUpdated?: (newData: SocietyData) => void;
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({
  data,
  memberId,
  onLogout,
  onNavigate,
  onDataUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'statement'>('overview');
  const [photoToast, setPhotoToast] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const member = data.members.find((m) => m.id === memberId || String(m.rollNo) === memberId) || data.members[0];

  const showToast = (msg: string) => {
    setPhotoToast(msg);
    setTimeout(() => setPhotoToast(null), 3500);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !member) return;

    try {
      setIsUploading(true);
      const dataUrl = await compressAndReadFile(file, 350, 350, 0.85);
      const updated = updateMemberPhoto(member.id, dataUrl);
      if (onDataUpdated) {
        onDataUpdated(updated);
      }
      showToast('আপনার প্রোফাইল ছবি সফলভাবে আপডেট হয়েছে!');
    } catch (err: any) {
      alert(err.message || 'ছবি আপলোড করতে সমস্যা হয়েছে।');
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleRemovePhoto = () => {
    if (!member) return;
    if (!window.confirm('আপনি কি আপনার প্রোফাইল ছবি মুছে ফেলতে চান?')) return;

    const updated = updateMemberPhoto(member.id, null);
    if (onDataUpdated) {
      onDataUpdated(updated);
    }
    showToast('প্রোফাইল ছবি সফলভাবে মুছে ফেলা হয়েছে!');
  };

  if (!member) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <p className="text-stone-600">সদস্য তথ্য লোড করা যায়নি।</p>
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-emerald-800 text-white rounded-lg"
        >
          লগইন পেজে যান
        </button>
      </div>
    );
  }

  const isAugPaid = member.august !== null && member.august > 0;
  const isSepPaid = member.september !== null && member.september > 0;
  const totalDeposit = (member.august || 0) + (member.september || 0) + (member.october || 0) + (member.downPayment || 0);

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Header Card with Profile Picture */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-amber-400 flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          
          {/* Member Profile Picture Box with Upload Option */}
          <div className="relative group/avatar shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-amber-400/90 text-emerald-950 flex items-center justify-center shadow-xl border-4 border-white/50 overflow-hidden relative">
              {member.photoUrl ? (
                <img
                  src={member.photoUrl}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-2">
                  <User className="w-10 h-10 text-emerald-950/70" />
                  <span className="text-xs font-black font-mono text-emerald-950 mt-0.5">
                    রোল: {toBengaliNumber(member.rollNo)}
                  </span>
                </div>
              )}
            </div>

            {/* Camera Edit / Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute -bottom-2 -right-2 p-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 rounded-full shadow-lg border-2 border-white cursor-pointer transition-transform hover:scale-110 active:scale-95 flex items-center justify-center"
              title={member.photoUrl ? "ছবি পরিবর্তন করুন" : "ছবি যোগ করুন"}
            >
              <Camera className="w-4 h-4 text-emerald-950" />
            </button>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="bg-amber-400/20 text-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-400/40 font-mono">
                ID: {member.id}
              </span>
              <span className="bg-emerald-800 text-emerald-200 text-xs font-semibold px-2 py-0.5 rounded-full">
                {member.role || 'সাধারণ সদস্য'}
              </span>
              <span className="bg-white/10 text-white/90 text-xs px-2 py-0.5 rounded-full font-mono">
                রোল: {toBengaliNumber(member.rollNo)}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              {member.name}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200 mt-0.5 font-mono">
              মোবাইল: {member.phone}
            </p>

            {/* Profile Picture Actions */}
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-3 py-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 rounded-lg text-xs font-bold border border-amber-400/40 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                {member.photoUrl ? 'ছবি পরিবর্তন' : 'প্রোফাইল ছবি যোগ করুন'}
              </button>

              {member.photoUrl && (
                <button
                  onClick={handleRemovePhoto}
                  className="px-2 py-1 bg-red-950/60 hover:bg-red-900 text-red-300 rounded-lg text-xs font-bold border border-red-500/30 flex items-center gap-1 transition-colors cursor-pointer"
                  title="ছবি মুছে ফেলুন"
                >
                  <Trash2 className="w-3.5 h-3.5" /> মুছে ফেলুন
                </button>
              )}
            </div>

          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePrintReceipt}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 transition-all flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-amber-300" /> রসিদ প্রিন্ট
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2.5 bg-red-950/80 hover:bg-red-900 text-red-200 rounded-xl text-xs font-bold border border-red-500/40 transition-all flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" /> লগআউট
          </button>
        </div>

      </div>

      {/* Hidden File Input for Member Photo Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoUpload}
      />

      {/* Photo Toast Notification */}
      {photoToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-2xl border-2 border-amber-400 flex items-center gap-2.5 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-amber-300 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{photoToast}</span>
        </div>
      )}

      {/* 4 Quick Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* মোট জমা */}
        <div className="bg-white p-5 rounded-2xl border-2 border-emerald-600/30 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 font-bold block uppercase">মোট জমাকৃত অর্থ</span>
            <h3 className="text-2xl font-black text-emerald-950 mt-1">
              {formatCurrency(totalDeposit)}
            </h3>
            <span className="text-[10px] text-emerald-700 font-semibold">সমিতি ফান্ডে সংরক্ষিত</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Coins className="w-6 h-6" />
          </div>
        </div>

        {/* চলতি মাস (সেপ্টেম্বর) দিছে কিনা */}
        <div className={`p-5 rounded-2xl border-2 shadow-md flex items-center justify-between ${
          isSepPaid 
            ? 'bg-emerald-50/80 border-emerald-500 text-emerald-950'
            : 'bg-red-50/80 border-red-400 text-red-950'
        }`}>
          <div>
            <span className="text-xs font-bold block uppercase text-stone-600">
              চলতি মাস (সেপ্টেম্বর)
            </span>
            <h3 className="text-xl font-black mt-1 flex items-center gap-1.5">
              {isSepPaid ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>পরিশোধিত (Paid)</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span>বকেয়া (Due)</span>
                </>
              )}
            </h3>
            <span className="text-[10px] text-stone-500 font-medium">
              {isSepPaid ? `${toBengaliNumber(member.september)} টাকা জমা হয়েছে` : 'এখনই জমা দিন'}
            </span>
          </div>
          {!isSepPaid && (
            <button
              onClick={() => onNavigate('payment')}
              className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-xs"
            >
              জমা দিন
            </button>
          )}
        </div>

        {/* জরিমানা */}
        <div className="bg-white p-5 rounded-2xl border-2 border-stone-200 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 font-bold block uppercase">জরিমানা স্থিতি</span>
            <h3 className="text-2xl font-black text-stone-900 mt-1">
              {member.fine ? formatCurrency(member.fine) : '০ টাকা'}
            </h3>
            <span className="text-[10px] text-emerald-700 font-semibold">
              {member.fine ? 'বিলম্বে জমা জরিমানা' : 'কোনো জরিমানা নাই'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-lg">
            ৳
          </div>
        </div>

        {/* ডাউন পেমেন্ট */}
        <div className="bg-white p-5 rounded-2xl border-2 border-stone-200 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 font-bold block uppercase">৬ মাসের ডাউন পেমেন্ট</span>
            <h3 className="text-2xl font-black text-stone-900 mt-1">
              {member.downPayment ? formatCurrency(member.downPayment) : '০ টাকা'}
            </h3>
            <span className="text-[10px] text-stone-500 font-medium">
              নির্ধারিত: ৫,০০০ টাকা
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Quick Jump to 2025 and 2026 Year Charts */}
      <div className="bg-stone-100 border border-stone-300 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-center sm:text-left">
          <h4 className="text-sm font-bold text-stone-900 flex items-center justify-center sm:justify-start gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-800" /> সমিতির পূর্ণাঙ্গ চাঁদা চার্ট দেখুন
          </h4>
          <p className="text-xs text-stone-600 mt-0.5">
            ২০২৫ সালের ১২ মাস এবং ২০২৬ সালের চলমান মাসের হিসাব দেখতে ক্লিক করুন
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('year2025')}
            className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-300" /> ২০২৫ চার্ট (১২ মাস)
          </button>
          <button
            onClick={() => onNavigate('year2026')}
            className="px-3.5 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <TrendingUp className="w-3.5 h-3.5 text-amber-300" /> ২০২৬ চার্ট (চলমান)
          </button>
        </div>
      </div>

      {/* Official Money Receipt Print Voucher */}
      <div className="bg-white rounded-3xl border-2 border-stone-300 p-6 sm:p-8 shadow-xl space-y-6 print:border-black">
        
        {/* Voucher Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b-2 border-stone-200 gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <Logo size={64} />
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-emerald-950">
                ভাই-বন্ধু সমবায় সমিতি
              </h2>
              <p className="text-xs text-stone-600">
                মধ্য মুজির কান্দি, পাঠান বাজার, মতলব উত্তর, চাঁদপুর | স্থাপিত: ২০২৫
              </p>
              <span className="inline-block mt-1 bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded">
                সদস্য ব্যক্তিগত সঞ্চয় ও চাঁদা বিবরণী
              </span>
            </div>
          </div>

          <div className="text-right text-xs space-y-1 font-mono">
            <div>তারিখ: <strong>{new Date().toLocaleDateString('bn-BD')}</strong></div>
            <div>হিসাব বছর: <strong>২০২৫-২০২৬</strong></div>
            <div>রসিদ ক্রমিক: <strong>VOUCHER-{member.rollNo}</strong></div>
          </div>
        </div>

        {/* Member Info Block */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs">
          <div>
            <span className="text-stone-500 block">সদস্যের নাম:</span>
            <strong className="text-stone-900 text-sm">{member.name}</strong>
          </div>
          <div>
            <span className="text-stone-500 block">মেম্বার আইডি:</span>
            <strong className="font-mono text-emerald-800 text-sm">{member.id}</strong>
          </div>
          <div>
            <span className="text-stone-500 block">ক্রমিক নং:</span>
            <strong className="text-sm">{toBengaliNumber(member.rollNo)}</strong>
          </div>
          <div>
            <span className="text-stone-500 block">মোবাইল:</span>
            <strong className="font-mono text-sm">{member.phone}</strong>
          </div>
        </div>

        {/* Breakdown Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-emerald-950 text-white">
                <th className="p-3">বিবরণ / মাস</th>
                <th className="p-3 text-center">নির্ধারিত হার</th>
                <th className="p-3 text-center">পরিশোধিত টাকা</th>
                <th className="p-3 text-center">স্ট্যাটাস</th>
                <th className="p-3 text-right">ব্যালেন্স</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 border-b border-stone-200">
              <tr>
                <td className="p-3 font-medium">আগস্ট ২০২৫ মাসিক চাঁদা</td>
                <td className="p-3 text-center font-mono">২,৫০০ ৳</td>
                <td className="p-3 text-center font-mono font-bold text-emerald-800">
                  {member.august ? `${member.august} ৳` : '—'}
                </td>
                <td className="p-3 text-center">
                  {isAugPaid ? (
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-xs font-bold">পরিশোধিত</span>
                  ) : (
                    <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold">বকেয়া</span>
                  )}
                </td>
                <td className="p-3 text-right font-mono font-bold">
                  {formatCurrency(member.august || 0)}
                </td>
              </tr>

              <tr>
                <td className="p-3 font-medium">সেপ্টেম্বর ২০২৫ মাসিক চাঁদা</td>
                <td className="p-3 text-center font-mono">২,৫০০ ৳</td>
                <td className="p-3 text-center font-mono font-bold text-emerald-800">
                  {member.september ? `${member.september} ৳` : '—'}
                </td>
                <td className="p-3 text-center">
                  {isSepPaid ? (
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-xs font-bold">পরিশোধিত</span>
                  ) : (
                    <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold">বকেয়া</span>
                  )}
                </td>
                <td className="p-3 text-right font-mono font-bold">
                  {formatCurrency(member.september || 0)}
                </td>
              </tr>

              <tr>
                <td className="p-3 font-medium">অর্ধবার্ষিক ডাউন পেমেন্ট</td>
                <td className="p-3 text-center font-mono">৫,০০০ ৳</td>
                <td className="p-3 text-center font-mono">
                  {member.downPayment ? `${member.downPayment} ৳` : '—'}
                </td>
                <td className="p-3 text-center text-stone-500">আসন্ন কিস্তি</td>
                <td className="p-3 text-right font-mono font-bold">
                  {formatCurrency(member.downPayment || 0)}
                </td>
              </tr>

              <tr>
                <td className="p-3 font-medium">বিলম্ব জরিমানা</td>
                <td className="p-3 text-center font-mono">—</td>
                <td className="p-3 text-center font-mono">
                  {member.fine ? `${member.fine} ৳` : '—'}
                </td>
                <td className="p-3 text-center text-emerald-700 font-semibold">পরিশোধিত</td>
                <td className="p-3 text-right font-mono font-bold">
                  {formatCurrency(member.fine || 0)}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="bg-stone-50 text-stone-900 font-bold">
                <td colSpan={4} className="p-3 text-right text-sm">সর্বমোট জমাকৃত স্থিতি:</td>
                <td className="p-3 text-right text-base text-emerald-950 font-black font-mono">
                  {formatCurrency(totalDeposit)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Signatures Block for Print */}
        <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs text-stone-600">
          <div className="border-t border-stone-400 pt-2 max-w-xs mx-auto">
            <p className="font-bold text-stone-900">সদস্যের স্বাক্ষর</p>
            <p className="text-[10px] text-stone-500">{member.name}</p>
          </div>
          <div className="border-t border-stone-400 pt-2 max-w-xs mx-auto">
            <p className="font-bold text-stone-900">ক্যাশিয়ার / সাধারণ সম্পাদক স্বাক্ষর</p>
            <p className="text-[10px] text-stone-500">ভাই-বন্ধু সমবায় সমিতি</p>
          </div>
        </div>

      </div>

    </div>
  );
};
