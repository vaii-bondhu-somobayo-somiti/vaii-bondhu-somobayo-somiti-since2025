import React, { useState } from 'react';
import { SocietyData, PaymentSubmission } from '../types';
import { saveStoredData, toBengaliNumber, formatCurrency } from '../utils/storage';
import { 
  CreditCard, 
  Landmark, 
  Copy, 
  Check, 
  Smartphone, 
  Send, 
  CheckCircle2, 
  Clock, 
  FileText, 
  HelpCircle,
  AlertCircle
} from 'lucide-react';

interface PaymentPageProps {
  data: SocietyData;
  onPaymentSubmitted: (updatedData: SocietyData) => void;
}

export const PaymentPage: React.FC<PaymentPageProps> = ({ data, onPaymentSubmitted }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Form states
  const [selectedMemberId, setSelectedMemberId] = useState(data.members[0]?.id || '');
  const [month, setMonth] = useState('সেপ্টেম্বর ২০২৫');
  const [paymentType, setPaymentType] = useState<'monthly' | 'downpayment' | 'fine'>('monthly');
  const [amount, setAmount] = useState<number>(2500);
  const [method, setMethod] = useState<'bkash' | 'nagad' | 'bank' | 'cash'>('bkash');
  const [trxId, setTrxId] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [note, setNote] = useState('');
  const [submittedReceipt, setSubmittedReceipt] = useState<PaymentSubmission | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleMemberChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const memId = e.target.value;
    setSelectedMemberId(memId);
    const mem = data.members.find(m => m.id === memId);
    if (mem && mem.phone) {
      setSenderPhone(mem.phone);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const mem = data.members.find(m => m.id === selectedMemberId);
    const memberName = mem ? mem.name : 'অজ্ঞাত সদস্য';

    const newSubmission: PaymentSubmission = {
      id: `pay-${Date.now()}`,
      memberId: selectedMemberId,
      memberName,
      month,
      paymentType,
      amount: Number(amount),
      method,
      trxId: trxId.trim() || `CASH-${Date.now().toString().slice(-6)}`,
      senderPhone: senderPhone.trim(),
      date: new Date().toLocaleDateString('bn-BD'),
      status: 'approved', // Auto-approved in cooperative record
      note: note.trim()
    };

    // Update member's record in state
    const updatedMembers = data.members.map((m) => {
      if (m.id === selectedMemberId) {
        if (month.includes('সেপ্টেম্বর')) {
          return { ...m, september: Number(amount) };
        } else if (month.includes('আগস্ট')) {
          return { ...m, august: Number(amount) };
        } else if (month.includes('অক্টোবর')) {
          return { ...m, october: Number(amount) };
        } else if (paymentType === 'downpayment') {
          return { ...m, downPayment: (m.downPayment || 0) + Number(amount) };
        } else if (paymentType === 'fine') {
          return { ...m, fine: (m.fine || 0) + Number(amount) };
        }
      }
      return m;
    });

    const updatedData: SocietyData = {
      ...data,
      members: updatedMembers,
      currentBankBalance: data.currentBankBalance + Number(amount),
      paymentSubmissions: [newSubmission, ...(data.paymentSubmissions || [])]
    };

    saveStoredData(updatedData);
    onPaymentSubmitted(updatedData);
    setSubmittedReceipt(newSubmission);
    setIsSubmitting(false);
    setSuccessMsg(true);
    setTrxId('');
    setNote('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Page Title */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          <CreditCard className="w-4 h-4 text-emerald-700" /> অফিশিয়াল পেমেন্ট পোর্টাল
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-950 tracking-tight">
          চাঁদা পরিশোধ ও ব্যাংক হিসাব
        </h1>
        <p className="text-sm text-stone-600">
          বিকাশ বা ব্যাংকে চাঁদা জমা দিয়ে নিচে "পেমেন্ট করেছি" ফর্মটি পূরণ করে সাথে সাথে ডিজিটাল রসিদ সংগ্রহ করুন।
        </p>
      </div>

      {/* 2-Column Section: Left is Payment Channels, Right is "পেমেন্ট করেছি" Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Bank & Mobile Banking Info (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Bank Account Card */}
          <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 text-white rounded-3xl p-6 shadow-xl border-2 border-amber-400 relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-emerald-700/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{data.bankAccount.bankName}</h3>
                  <p className="text-xs text-amber-200 font-semibold">{data.bankAccount.branch}</p>
                </div>
              </div>
              <span className="bg-amber-400/20 text-amber-300 text-[11px] font-bold px-2 py-0.5 rounded border border-amber-400/40">
                অফিসিয়াল
              </span>
            </div>

            <div className="mt-4 space-y-3 text-xs sm:text-sm">
              <div>
                <span className="text-emerald-300 text-xs block">হিসাবের নাম (Account Name):</span>
                <strong className="text-white font-bold text-base">{data.bankAccount.accountName}</strong>
              </div>

              <div className="bg-emerald-950/60 p-3 rounded-xl border border-emerald-700/60 flex items-center justify-between">
                <div>
                  <span className="text-amber-300 text-[11px] block font-semibold">হিসাব নম্বর (A/C No):</span>
                  <span className="font-mono text-lg font-black tracking-wider text-white">
                    {data.bankAccount.accountNumber}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(data.bankAccount.accountNumber, 'bank_acc')}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-emerald-950 font-bold rounded-lg text-xs flex items-center gap-1 transition-colors shadow-xs"
                >
                  {copiedKey === 'bank_acc' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === 'bank_acc' ? 'কপি হয়েছে' : 'কপি'}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-emerald-200 pt-1">
                <span>রাউটিং নম্বর: <strong>{data.bankAccount.routingNumber}</strong></span>
                <button
                  onClick={() => handleCopy(data.bankAccount.routingNumber, 'routing')}
                  className="text-amber-300 hover:underline flex items-center gap-1"
                >
                  {copiedKey === 'routing' ? 'কপি হয়েছে' : 'রাউটিং কপি'}
                </button>
              </div>
            </div>
          </div>

          {/* bKash & Nagad Numbers */}
          <div className="bg-white rounded-3xl p-6 border-2 border-stone-200 shadow-md space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
              <Smartphone className="w-5 h-5 text-pink-600" />
              <h3 className="font-bold text-stone-900 text-base">
                বিকাশ ও নগদ পার্সোনাল নম্বর (ক্যাশিয়ারের কাছে)
              </h3>
            </div>

            <div className="space-y-3">
              {data.bkashNumbers.map((bk, i) => (
                <div
                  key={i}
                  className="bg-stone-50 hover:bg-stone-100 p-3.5 rounded-2xl border border-stone-200 flex items-center justify-between transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-pink-100 text-pink-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        bKash পার্সোনাল
                      </span>
                      <span className="text-xs text-stone-500 font-semibold">{bk.role} ({bk.name})</span>
                    </div>
                    <p className="font-mono text-base font-extrabold text-stone-900 mt-1">
                      {bk.number}
                    </p>
                  </div>

                  <button
                    onClick={() => handleCopy(bk.number, `bkash_${i}`)}
                    className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shadow-xs"
                  >
                    {copiedKey === `bkash_${i}` ? <Check className="w-3.5 h-3.5 text-amber-300" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === `bkash_${i}` ? 'কপি হয়েছে' : 'কপি করুন'}
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p>
                <strong>পেমেন্ট নিয়ম:</strong> বিকাশ বা নগদে সেন্ড মানি বা ব্যাংকে জমা দেওয়ার পর নিচে ফর্মটিতে TrxID বা মোবাইল নম্বর দিয়ে সাবমিট করুন।
              </p>
            </div>
          </div>

        </div>

        {/* Right Column: "পেমেন্ট করেছি" Form (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-600/30 shadow-xl space-y-6">
            
            <div className="border-b border-stone-200 pb-4">
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
                <Send className="w-4 h-4" /> দ্রুত রসিদ গ্রহণ
              </div>
              <h2 className="text-2xl font-extrabold text-stone-900">
                "পেমেন্ট করেছি" ফরম
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                টাকা পাঠিয়ে নিচের তথ্যগুলো দিয়ে সাবমিট করুন, সাথে সাথে সিস্টেমে হালনাগাদ হবে।
              </p>
            </div>

            {successMsg && (
              <div className="bg-emerald-50 border-2 border-emerald-500 p-4 rounded-2xl text-emerald-950 flex items-start justify-between gap-3 animate-in fade-in">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold text-sm">পেমেন্ট সফলভাবে রেজিস্ট্রি হয়েছে!</strong>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      ধন্যবাদ! আপনার জমার তথ্য স্থানীয় লেজার ও ব্যাংক হিসাবে যুক্ত করা হয়েছে।
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSuccessMsg(false)}
                  className="text-emerald-700 text-xs font-bold hover:underline"
                >
                  ঠিক আছে
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              
              {/* Member Selection */}
              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  সদস্য নির্বাচন করুন (নাম ও আইডি) *
                </label>
                <select
                  value={selectedMemberId}
                  onChange={handleMemberChange}
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 bg-white font-medium"
                  required
                >
                  {data.members.map((m) => (
                    <option key={m.id} value={m.id}>
                      [{toBengaliNumber(m.rollNo)}] {m.name} — আইডি: {m.id} ({m.phone})
                    </option>
                  ))}
                </select>
              </div>

              {/* Grid: Month & Payment Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    কোন মাসের চাঁদা? *
                  </label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 bg-white"
                  >
                    <option value="সেপ্টেম্বর ২০২৫">সেপ্টেম্বর ২০২৫</option>
                    <option value="আগস্ট ২০২৫">আগস্ট ২০২৫</option>
                    <option value="অক্টোবর ২০২৫">অক্টোবর ২০২৫</option>
                    <option value="ডাউন পেমেন্ট ২০২৫">৬ মাসের ডাউন পেমেন্ট</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    জমার ধরণ *
                  </label>
                  <select
                    value={paymentType}
                    onChange={(e) => {
                      const type = e.target.value as any;
                      setPaymentType(type);
                      if (type === 'downpayment') setAmount(5000);
                      else if (type === 'fine') setAmount(100);
                      else setAmount(2500);
                    }}
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 bg-white"
                  >
                    <option value="monthly">মাসিক চাঁদা ও সঞ্চয়</option>
                    <option value="downpayment">অর্ধবার্ষিক ডাউন পেমেন্ট (৫,০০০)</option>
                    <option value="fine">বিলম্ব জরিমানা</option>
                  </select>
                </div>
              </div>

              {/* Grid: Amount & Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    টাকার পরিমাণ (টাকা) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      min="100"
                      step="50"
                      className="w-full p-2.5 pl-8 rounded-xl border border-stone-300 focus:border-emerald-600 font-bold text-stone-900"
                      required
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-stone-500">৳</span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    পেমেন্টের মাধ্যম *
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'bkash', label: 'বিকাশ' },
                      { id: 'nagad', label: 'নগদ' },
                      { id: 'bank', label: 'ব্যাংক' },
                      { id: 'cash', label: 'ক্যাশ' },
                    ].map((m) => (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => setMethod(m.id as any)}
                        className={`py-2 text-center rounded-lg font-bold text-xs border transition-all ${
                          method === m.id
                            ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* TrxID & Sender Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    ট্রানজেকশন আইডি (TrxID) / স্লিপ নং
                  </label>
                  <input
                    type="text"
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    placeholder="যেমন: BL98A72Z বা স্লিপ নং"
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    যে নম্বর থেকে পাঠানো হয়েছে (প্রেরক)
                  </label>
                  <input
                    type="text"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder="যেমন: 017..."
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 font-mono"
                  />
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  অতিরিক্ত তথ্য বা মন্তব্য (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="যেমন: হাছান মাঝির বিকাশে পাঠিয়েছি..."
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-emerald-600"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-800 to-emerald-900 hover:from-emerald-900 hover:to-emerald-950 text-white font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-5 h-5 text-amber-300" />
                  {isSubmitting ? 'প্রসেসিং হচ্ছে...' : 'পেমেন্ট জমা নিশ্চিত করুন'}
                </button>
              </div>

            </form>

            {/* Printable Receipt Card if submitted */}
            {submittedReceipt && (
              <div className="mt-6 p-5 bg-stone-50 border-2 border-emerald-600 rounded-2xl space-y-3 print:border-black">
                <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                  <div>
                    <h4 className="font-bold text-emerald-950 text-sm">ভাই-বন্ধু সমবায় সমিতি</h4>
                    <span className="text-[10px] text-stone-500">অনলাইন পেমেন্ট জমা স্বীকৃতিপত্র</span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-2 py-0.5 rounded">
                    স্বীকৃত (Approved)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>সদস্য: <strong>{submittedReceipt.memberName}</strong></div>
                  <div>আইডি: <strong className="font-mono">{submittedReceipt.memberId}</strong></div>
                  <div>মাস: <strong>{submittedReceipt.month}</strong></div>
                  <div>পরিমাণ: <strong className="text-emerald-800 font-bold">{formatCurrency(submittedReceipt.amount)}</strong></div>
                  <div>মাধ্যম: <strong className="uppercase">{submittedReceipt.method}</strong></div>
                  <div>TrxID: <strong className="font-mono">{submittedReceipt.trxId}</strong></div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => window.print()}
                    className="text-xs text-emerald-800 hover:underline font-bold flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" /> রসিদ প্রিন্ট করুন
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};
