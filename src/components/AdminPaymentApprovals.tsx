import React, { useState } from 'react';
import { SocietyData, PaymentSubmission, Member } from '../types';
import { formatCurrency, toBengaliNumber, saveStoredData } from '../utils/storage';
import { 
  approvePaymentSubmission, 
  rejectPaymentSubmission, 
  revertPaymentSubmission, 
  deletePaymentSubmission 
} from '../utils/paymentApproval';
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Copy, 
  Check, 
  Search, 
  Filter, 
  Trash2, 
  RotateCcw, 
  Plus, 
  Send, 
  Smartphone, 
  Landmark, 
  CreditCard, 
  Coins, 
  User, 
  Calendar, 
  ShieldCheck,
  Phone,
  FileText,
  X
} from 'lucide-react';

interface AdminPaymentApprovalsProps {
  data: SocietyData;
  onDataUpdated: (newData: SocietyData) => void;
  showNotification: (type: 'success' | 'error', text: string) => void;
}

export const AdminPaymentApprovals: React.FC<AdminPaymentApprovalsProps> = ({
  data,
  onDataUpdated,
  showNotification
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Reject Modal state
  const [rejectingSubmission, setRejectingSubmission] = useState<PaymentSubmission | null>(null);
  const [rejectReason, setRejectReason] = useState('টাকা পাওয়া যায়নি বা TrxID ভুল');

  // Manual Add Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [manualForm, setManualForm] = useState({
    memberId: data.members[0]?.id || '',
    month: 'জানুয়ারি ২০২৬',
    paymentType: 'monthly' as 'monthly' | 'downpayment' | 'fine',
    amount: 2500,
    method: 'cash' as 'bkash' | 'nagad' | 'bank' | 'cash',
    trxId: '',
    senderPhone: '',
    note: 'ক্যাশিয়ারের কাছে সরাসরি জমা',
    autoApprove: true
  });

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const submissions = data.paymentSubmissions || [];

  // Statistics
  const pendingCount = submissions.filter(s => s.status === 'pending').length;
  const approvedCount = submissions.filter(s => s.status === 'approved').length;
  const rejectedCount = submissions.filter(s => s.status === 'rejected').length;

  const pendingAmount = submissions
    .filter(s => s.status === 'pending')
    .reduce((sum, s) => sum + (Number(s.amount) || 0), 0);

  const approvedAmount = submissions
    .filter(s => s.status === 'approved')
    .reduce((sum, s) => sum + (Number(s.amount) || 0), 0);

  // Filtered List
  const filteredSubmissions = submissions.filter(s => {
    if (filterStatus !== 'all' && s.status !== filterStatus) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = s.memberName?.toLowerCase().includes(q);
      const matchId = s.memberId?.toLowerCase().includes(q);
      const matchTrx = s.trxId?.toLowerCase().includes(q);
      const matchPhone = s.senderPhone?.toLowerCase().includes(q);
      const matchMonth = s.month?.toLowerCase().includes(q);
      return matchName || matchId || matchTrx || matchPhone || matchMonth;
    }
    return true;
  });

  // Approve action
  const handleApprove = (submission: PaymentSubmission) => {
    const updated = approvePaymentSubmission(submission.id, data, 'অ্যাডমিন');
    saveStoredData(updated);
    onDataUpdated(updated);
    showNotification(
      'success',
      `সদস্য ${submission.memberName} এর ${formatCurrency(submission.amount)} সফলভাবে অনুমোদন করা হয়েছে! ওয়েবসাইটে হিসাব আপডেট হয়েছে।`
    );
  };

  // Open Reject Modal
  const handleOpenReject = (submission: PaymentSubmission) => {
    setRejectingSubmission(submission);
    setRejectReason('টাকা পাওয়া যায়নি বা TrxID অমিল');
  };

  // Confirm Reject
  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingSubmission) return;

    const updated = rejectPaymentSubmission(rejectingSubmission.id, rejectReason, data);
    saveStoredData(updated);
    onDataUpdated(updated);
    showNotification('error', `পেমেন্ট আবেদনটি বাতিল করা হয়েছে (কারণ: ${rejectReason})`);
    setRejectingSubmission(null);
  };

  // Revert action (unapprove)
  const handleRevert = (submission: PaymentSubmission) => {
    if (!window.confirm(`আপনি কি ${submission.memberName} এর অনুমোদিত পেমেন্টটি বাতিল করে পুনরায় অপেক্ষমানে পাঠাতে চান? (ওয়েবসাইট থেকে টাকা বিয়োগ হবে)`)) {
      return;
    }
    const updated = revertPaymentSubmission(submission.id, data);
    saveStoredData(updated);
    onDataUpdated(updated);
    showNotification('success', `পেমেন্ট অনুমোদনটি বাতিল করে পুনরায় অপেক্ষমান তালিকায় পাঠানো হয়েছে।`);
  };

  // Delete action
  const handleDelete = (submission: PaymentSubmission) => {
    if (!window.confirm(`আপনি কি এই আবেদন রেকর্ডটি স্থায়ীভাবে মুছে ফেলতে চান?`)) {
      return;
    }
    const updated = deletePaymentSubmission(submission.id, data);
    saveStoredData(updated);
    onDataUpdated(updated);
    showNotification('success', 'পেমেন্ট আবেদন রেকর্ডটি মুছে ফেলা হয়েছে।');
  };

  // Manual Add Form Submit
  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    const mem = data.members.find(m => m.id === manualForm.memberId);
    const memberName = mem ? mem.name : 'সদস্য';

    const newSub: PaymentSubmission = {
      id: `pay-${Date.now()}`,
      memberId: manualForm.memberId,
      memberName,
      month: manualForm.month,
      paymentType: manualForm.paymentType,
      amount: Number(manualForm.amount),
      method: manualForm.method,
      trxId: manualForm.trxId.trim() || `MANUAL-${Date.now().toString().slice(-6)}`,
      senderPhone: manualForm.senderPhone.trim() || (mem?.phone || ''),
      date: new Date().toLocaleDateString('bn-BD'),
      status: 'pending',
      appliedAt: new Date().toISOString(),
      note: manualForm.note.trim()
    };

    let updated: SocietyData = {
      ...data,
      paymentSubmissions: [newSub, ...(data.paymentSubmissions || [])]
    };

    if (manualForm.autoApprove) {
      updated = approvePaymentSubmission(newSub.id, updated, 'অ্যাডমিন');
      showNotification('success', `${memberName} এর পেমেন্ট সরাসরি যুক্ত ও অনুমোদন করা হয়েছে!`);
    } else {
      showNotification('success', `${memberName} এর পেমেন্ট আবেদন যুক্ত হয়েছে (অপেক্ষমান)।`);
    }

    saveStoredData(updated);
    onDataUpdated(updated);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-emerald-600/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-400 text-emerald-950 px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase mb-2">
              <ShieldCheck className="w-4 h-4" /> ভেরিফিকেশন ও অনুমোদন সিস্টেম
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              পেমেন্ট আবেদন ও অনুমোদন প্যানেল
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200 mt-1 max-w-2xl leading-relaxed">
              সদস্যরা বিকাশ, নগদ বা ব্যাংকে টাকা পাঠিয়ে আবেদন করলে এখানে জমা হয়। আপনি যাচাই করে <strong>"অনুমোদন (Approve)"</strong> করলেই সাথে সাথে সদস্যের হিসাবে ও ওয়েবসাইটে টাকা যুক্ত হবে।
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black rounded-2xl text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>ম্যানুয়াল পেমেন্ট যুক্ত করুন</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Pending Card */}
        <div 
          onClick={() => setFilterStatus('pending')}
          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
            filterStatus === 'pending'
              ? 'bg-amber-500/10 border-amber-500 shadow-md ring-2 ring-amber-400/20'
              : 'bg-white border-stone-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800">অপেক্ষমান আবেদন</span>
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-950 font-mono">
              {toBengaliNumber(pendingCount)}
            </span>
            <span className="text-xs text-stone-500">টি</span>
          </div>
          <p className="text-[11px] font-bold text-amber-700 mt-1">
            মোট: {formatCurrency(pendingAmount)}
          </p>
        </div>

        {/* Approved Card */}
        <div 
          onClick={() => setFilterStatus('approved')}
          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
            filterStatus === 'approved'
              ? 'bg-emerald-500/10 border-emerald-500 shadow-md ring-2 ring-emerald-400/20'
              : 'bg-white border-stone-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800">অনুমোদিত আবেদন</span>
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-950 font-mono">
              {toBengaliNumber(approvedCount)}
            </span>
            <span className="text-xs text-stone-500">টি</span>
          </div>
          <p className="text-[11px] font-bold text-emerald-700 mt-1">
            জমা: {formatCurrency(approvedAmount)}
          </p>
        </div>

        {/* Rejected Card */}
        <div 
          onClick={() => setFilterStatus('rejected')}
          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
            filterStatus === 'rejected'
              ? 'bg-red-500/10 border-red-500 shadow-md ring-2 ring-red-400/20'
              : 'bg-white border-stone-200 hover:border-red-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-800">বাতিলকৃত আবেদন</span>
            <span className="p-1.5 rounded-lg bg-red-100 text-red-800">
              <XCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-red-950 font-mono">
              {toBengaliNumber(rejectedCount)}
            </span>
            <span className="text-xs text-stone-500">টি</span>
          </div>
          <p className="text-[11px] font-bold text-red-700 mt-1">
            বাতিলকৃত তথ্য
          </p>
        </div>

        {/* Total Card */}
        <div 
          onClick={() => setFilterStatus('all')}
          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
            filterStatus === 'all'
              ? 'bg-stone-200 border-stone-600 shadow-md ring-2 ring-stone-400/20'
              : 'bg-white border-stone-200 hover:border-stone-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-700">সর্বমোট আবেদন</span>
            <span className="p-1.5 rounded-lg bg-stone-100 text-stone-700">
              <Coins className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-stone-900 font-mono">
              {toBengaliNumber(submissions.length)}
            </span>
            <span className="text-xs text-stone-500">টি</span>
          </div>
          <p className="text-[11px] font-bold text-stone-600 mt-1">
            সর্বমোট রেকর্ড
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'pending', label: '⏳ অপেক্ষমান', count: pendingCount, color: 'amber' },
            { id: 'approved', label: '✅ অনুমোদিত', count: approvedCount, color: 'emerald' },
            { id: 'rejected', label: '❌ বাতিলকৃত', count: rejectedCount, color: 'red' },
            { id: 'all', label: '📋 সকল আবেদন', count: submissions.length, color: 'stone' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-emerald-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                filterStatus === tab.id
                  ? 'bg-white/20 text-white'
                  : 'bg-stone-200 text-stone-800'
              }`}>
                {toBengaliNumber(tab.count)}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নাম, রোল, TrxID বা মোবাইল দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:border-emerald-600 focus:bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-stone-300 space-y-3">
          <div className="w-12 h-12 bg-stone-100 text-stone-400 rounded-2xl flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-stone-800">
            {filterStatus === 'pending' 
              ? 'বর্তমানে কোনো অপেক্ষমান পেমেন্ট আবেদন নেই!' 
              : 'কোনো আবেদন পাওয়া যায়নি।'}
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            {filterStatus === 'pending'
              ? 'কোনো সদস্য পেমেন্ট ফর্ম পূরণ করে আবেদন করলে সাথে সাথে এখানে দেখা যাবে।'
              : 'অন্য ফিল্টারে ক্লিক করে বা সার্চ ফিল্টার পরিষ্কার করে দেখুন।'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSubmissions.map((sub) => {
            const mem = data.members.find(m => m.id === sub.memberId);
            const isPending = sub.status === 'pending';
            const isApproved = sub.status === 'approved';
            const isRejected = sub.status === 'rejected';

            const methodLabel: Record<string, { label: string; bg: string }> = {
              bkash: { label: 'বিকাশ', bg: 'bg-pink-100 text-pink-800 border-pink-200' },
              nagad: { label: 'নগদ', bg: 'bg-orange-100 text-orange-800 border-orange-200' },
              bank: { label: 'ব্যাংক', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
              cash: { label: 'ক্যাশ', bg: 'bg-stone-100 text-stone-800 border-stone-200' },
            };

            const typeLabel: Record<string, string> = {
              monthly: 'মাসিক চাঁদা',
              downpayment: 'ডাউন পেমেন্ট',
              fine: 'বিলম্ব জরিমানা'
            };

            return (
              <div
                key={sub.id}
                className={`bg-white rounded-2xl p-5 border-2 transition-all shadow-xs ${
                  isPending 
                    ? 'border-amber-300 hover:border-amber-400 bg-gradient-to-r from-amber-50/40 via-white to-white' 
                    : isApproved
                    ? 'border-emerald-200 hover:border-emerald-300'
                    : 'border-stone-200 opacity-80'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left: Member & Submission details */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Status Badge */}
                      {isPending && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                          <Clock className="w-3.5 h-3.5 text-amber-700" />
                          <span>অনুমোদন অপেক্ষা</span>
                        </span>
                      )}
                      {isApproved && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>অনুমোদিত ও যুক্ত</span>
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-red-100 text-red-900 border border-red-300">
                          <XCircle className="w-3.5 h-3.5 text-red-700" />
                          <span>বাতিলকৃত</span>
                        </span>
                      )}

                      {/* Method Badge */}
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${methodLabel[sub.method]?.bg || 'bg-stone-100 text-stone-700 border-stone-200'}`}>
                        {methodLabel[sub.method]?.label || sub.method}
                      </span>

                      {/* Payment Type */}
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-stone-100 text-stone-700 border border-stone-200">
                        {typeLabel[sub.paymentType] || sub.paymentType}
                      </span>

                      {/* Date */}
                      <span className="text-[11px] text-stone-500 font-mono">
                        {sub.date}
                      </span>
                    </div>

                    {/* Member Info */}
                    <div className="flex flex-wrap items-baseline gap-2">
                      <h4 className="text-base font-extrabold text-stone-900">
                        {sub.memberName}
                      </h4>
                      {mem && (
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          রোল: {toBengaliNumber(mem.rollNo)} | আইডি: {mem.id}
                        </span>
                      )}
                      <span className="text-xs font-semibold text-stone-600">
                        • {sub.month}
                      </span>
                    </div>

                    {/* Transaction & Sender Phone Details */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600 pt-1">
                      <div className="flex items-center gap-1.5 bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200">
                        <span className="text-stone-500 font-semibold">TrxID / স্লিপ:</span>
                        <strong className="font-mono text-stone-900">{sub.trxId}</strong>
                        <button
                          onClick={() => handleCopy(sub.trxId, `trx_${sub.id}`)}
                          className="ml-1 text-emerald-700 hover:text-emerald-900 p-0.5"
                          title="TrxID কপি করুন"
                        >
                          {copiedKey === `trx_${sub.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {sub.senderPhone && (
                        <div className="flex items-center gap-1.5 bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200">
                          <Phone className="w-3.5 h-3.5 text-stone-400" />
                          <span className="text-stone-500 font-semibold">প্রেরক:</span>
                          <strong className="font-mono text-stone-900">{sub.senderPhone}</strong>
                        </div>
                      )}

                      {sub.note && (
                        <div className="flex items-center gap-1 text-amber-900 text-xs italic">
                          <FileText className="w-3.5 h-3.5 text-amber-600" />
                          <span>"{sub.note}"</span>
                        </div>
                      )}
                    </div>

                    {/* Rejection reason if rejected */}
                    {isRejected && sub.rejectionReason && (
                      <p className="text-xs text-red-700 bg-red-50 p-2 rounded-lg border border-red-200 font-medium">
                        <strong>বাতিলের কারণ:</strong> {sub.rejectionReason}
                      </p>
                    )}

                    {/* Approved by info */}
                    {isApproved && (
                      <p className="text-[11px] text-emerald-700 flex items-center gap-1 font-semibold">
                        <Check className="w-3.5 h-3.5" />
                        <span>অনুমোদন সম্পন্ন হয়েছে এবং সদস্যের খাতায় টাকা ক্রেডিট করা হয়েছে।</span>
                      </p>
                    )}
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col sm:items-center lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-stone-100">
                    
                    <div className="text-left sm:text-right">
                      <span className="text-[11px] text-stone-500 font-bold block">জমার পরিমাণ:</span>
                      <strong className="text-xl sm:text-2xl font-black text-emerald-900 font-mono">
                        {formatCurrency(sub.amount)}
                      </strong>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {isPending && (
                        <>
                          <button
                            onClick={() => handleApprove(sub)}
                            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                            title="অনুমোদন করুন এবং সদস্যের অ্যাকাউন্টে টাকা যুক্ত করুন"
                          >
                            <Check className="w-4 h-4 text-amber-300" />
                            <span>অনুমোদন করুন (Approve)</span>
                          </button>

                          <button
                            onClick={() => handleOpenReject(sub)}
                            className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                            title="আবেদনটি বাতিল করুন"
                          >
                            <X className="w-4 h-4" />
                            <span>বাতিল</span>
                          </button>
                        </>
                      )}

                      {isApproved && (
                        <button
                          onClick={() => handleRevert(sub)}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                          title="ভুল হলে অনুমোদন বাতিল করে পুনরায় অপেক্ষমানে ফেরত পাঠান"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                          <span>অনুমোদন প্রত্যাহার</span>
                        </button>
                      )}

                      {/* Permanent Delete */}
                      <button
                        onClick={() => handleDelete(sub)}
                        className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                        title="রেকর্ডটি মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {rejectingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-red-500 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2 text-red-700 font-black">
                <AlertCircle className="w-5 h-5" />
                <span>পেমেন্ট আবেদন বাতিল করুন</span>
              </div>
              <button
                onClick={() => setRejectingSubmission(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600">
              সদস্য <strong>{rejectingSubmission.memberName}</strong> এর {formatCurrency(rejectingSubmission.amount)} আবেদনটি কি কারণে বাতিল করতে চান লিখুন:
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  বাতিলের কারণ:
                </label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-xs mb-2 bg-white"
                >
                  <option value="টাকা পাওয়া যায়নি বা TrxID অমিল">টাকা পাওয়া যায়নি বা TrxID অমিল</option>
                  <option value="সঠিক নম্বরে বা হিসাবে টাকা পাঠানো হয়নি">সঠিক নম্বরে বা হিসাবে টাকা পাঠানো হয়নি</option>
                  <option value="ভুল পরিমাণ টাকার আবেদন করা হয়েছে">ভুল পরিমাণ টাকার আবেদন করা হয়েছে</option>
                  <option value="সদস্যের নাম বা আইডিতে গরমিল রয়েছে">সদস্যের নাম বা আইডিতে গরমিল রয়েছে</option>
                  <option value="ডুপ্লিকেট বা পূর্বেই জমা করা আবেদন">ডুপ্লিকেট বা পূর্বেই জমা করা আবেদন</option>
                </select>

                <input
                  type="text"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="অন্য কারণ লিখুন..."
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-xs"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingSubmission(null)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl text-xs font-bold hover:bg-stone-200"
                >
                  ফিরে যান
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold"
                >
                  হ্যাঁ, বাতিল নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Add Payment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-2 border-emerald-600 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2 text-emerald-950 font-black text-lg">
                <Plus className="w-5 h-5 text-emerald-700" />
                <span>ম্যানুয়াল পেমেন্ট রেকর্ড যুক্ত করুন</span>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddManual} className="space-y-3.5 text-xs">
              
              {/* Member Selection */}
              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  সদস্য নির্বাচন করুন *
                </label>
                <select
                  value={manualForm.memberId}
                  onChange={(e) => setManualForm({ ...manualForm, memberId: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300 font-medium bg-white"
                  required
                >
                  {data.members.map(m => (
                    <option key={m.id} value={m.id}>
                      [{toBengaliNumber(m.rollNo)}] {m.name} — আইডি: {m.id} ({m.phone})
                    </option>
                  ))}
                </select>
              </div>

              {/* Month & Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    কোন মাসের জন্য? *
                  </label>
                  <select
                    value={manualForm.month}
                    onChange={(e) => setManualForm({ ...manualForm, month: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  >
                    <optgroup label="২০২৬ সাল">
                      <option value="জানুয়ারি ২০২৬">জানুয়ারি ২০২৬</option>
                      <option value="ফেব্রুয়ারি ২০২৬">ফেব্রুয়ারি ২০২৬</option>
                      <option value="মার্চ ২০২৬">মার্চ ২০২৬</option>
                      <option value="এপ্রিল ২০২৬">এপ্রিল ২০২৬</option>
                      <option value="মে ২০২৬">মে ২০২৬</option>
                      <option value="জুন ২০২৬">জুন ২০২৬</option>
                      <option value="জুলাই ২০২৬">জুলাই ২০২৬</option>
                      <option value="আগস্ট ২০২৬">আগস্ট ২০২৬</option>
                      <option value="সেপ্টেম্বর ২০২৬">সেপ্টেম্বর ২০২৬</option>
                      <option value="অক্টোবর ২০২৬">অক্টোবর ২০২৬</option>
                      <option value="নভেম্বর ২০২৬">নভেম্বর ২০২৬</option>
                      <option value="ডিসেম্বর ২০২৬">ডিসেম্বর ২০২৬</option>
                      <option value="১ম ৬ মাস ডাউন পেমেন্ট ২০২৬">১ম ৬ মাস ডাউন পেমেন্ট ২০২৬</option>
                      <option value="২য় ৬ মাস ডাউন পেমেন্ট ২০২৬">২য় ৬ মাস ডাউন পেমেন্ট ২০২৬</option>
                    </optgroup>
                    <optgroup label="২০২৫ সাল">
                      <option value="আগস্ট ২০২৫">আগস্ট ২০২৫</option>
                      <option value="সেপ্টেম্বর ২০২৫">সেপ্টেম্বর ২০২৫</option>
                      <option value="অক্টোবর ২০২৫">অক্টোবর ২০২৫</option>
                      <option value="১ম ৬ মাস ডাউন পেমেন্ট ২০২৫">১ম ৬ মাস ডাউন পেমেন্ট ২০২৫</option>
                      <option value="২য় ৬ মাস ডাউন পেমেন্ট ২০২৫">২য় ৬ মাস ডাউন পেমেন্ট ২০২৫</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    জমার ধরণ *
                  </label>
                  <select
                    value={manualForm.paymentType}
                    onChange={(e) => {
                      const type = e.target.value as any;
                      setManualForm({
                        ...manualForm,
                        paymentType: type,
                        amount: type === 'downpayment' ? 5000 : type === 'fine' ? 100 : 2500
                      });
                    }}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  >
                    <option value="monthly">মাসিক চাঁদা</option>
                    <option value="downpayment">ডাউন পেমেন্ট</option>
                    <option value="fine">বিলম্ব জরিমানা</option>
                  </select>
                </div>
              </div>

              {/* Amount & Method */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    পরিমাণ (টাকা) *
                  </label>
                  <input
                    type="number"
                    value={manualForm.amount}
                    onChange={(e) => setManualForm({ ...manualForm, amount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 font-bold font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    মাধ্যম *
                  </label>
                  <select
                    value={manualForm.method}
                    onChange={(e) => setManualForm({ ...manualForm, method: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  >
                    <option value="cash">নগদ / ক্যাশ</option>
                    <option value="bkash">বিকাশ</option>
                    <option value="nagad">নগদ (এমএফএস)</option>
                    <option value="bank">ব্যাংক জমা</option>
                  </select>
                </div>
              </div>

              {/* TrxID / Note */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    রসিদ নং / TrxID
                  </label>
                  <input
                    type="text"
                    value={manualForm.trxId}
                    onChange={(e) => setManualForm({ ...manualForm, trxId: e.target.value })}
                    placeholder="যেমন: CASH-001"
                    className="w-full p-2.5 rounded-xl border border-stone-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    মন্তব্য
                  </label>
                  <input
                    type="text"
                    value={manualForm.note}
                    onChange={(e) => setManualForm({ ...manualForm, note: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300"
                  />
                </div>
              </div>

              {/* Auto Approve Checkbox */}
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-300 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoApproveCheck"
                  checked={manualForm.autoApprove}
                  onChange={(e) => setManualForm({ ...manualForm, autoApprove: e.target.checked })}
                  className="w-4 h-4 text-emerald-700 rounded cursor-pointer"
                />
                <label htmlFor="autoApproveCheck" className="text-xs font-bold text-emerald-950 cursor-pointer">
                  সাথে সাথে অনুমোদন করে ওয়েবসাইটে টাকা যুক্ত করুন (Approve Immediately)
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl text-xs font-bold hover:bg-stone-200"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-black shadow-md"
                >
                  পেমেন্ট সংরক্ষণ করুন
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
