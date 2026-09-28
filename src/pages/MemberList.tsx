import React, { useState, useRef } from 'react';
import { Member, CurrentUser, SocietyData } from '../types';
import { formatCurrency, toBengaliNumber, updateMemberPhoto } from '../utils/storage';
import { compressAndReadFile } from '../utils/imageHelper';
import { 
  Users, 
  Search, 
  Phone, 
  Copy, 
  Check, 
  MessageSquare, 
  FileText, 
  Filter, 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  LayoutGrid, 
  List, 
  ArrowUpDown,
  FileCheck2,
  Edit3,
  Calendar,
  TrendingUp,
  X,
  RotateCcw,
  User,
  Hash,
  SlidersHorizontal,
  Sparkles,
  Camera,
  Trash2
} from 'lucide-react';

interface MemberListProps {
  members: Member[];
  currentUser: CurrentUser;
  onSelectMemberForProfile?: (memberId: string) => void;
  onEditMember?: (member: Member) => void;
  onOpenDocsModal: (tab?: 'rules' | 'ledger' | 'committee' | 'logo') => void;
  onNavigate: (tab: string) => void;
  onDataUpdated?: (newData: SocietyData) => void;
}

export const calculateMemberAllTotal = (m: Member): number => {
  const dp2025_1 = m.downPayment2025_1 !== undefined ? m.downPayment2025_1 : (m.downPayment || 0);
  const dp2025_2 = m.downPayment2025_2 || 0;
  const dp2026_1 = m.downPayment2026_1 || 0;
  const dp2026_2 = m.downPayment2026_2 || 0;
  const fine2025 = m.fine2025 !== undefined ? m.fine2025 : (m.fine || 0);
  const fine2026 = m.fine2026 || 0;

  let total = dp2025_1 + dp2025_2 + dp2026_1 + dp2026_2 + fine2025 + fine2026;

  if (m.payments2025) {
    Object.values(m.payments2025).forEach((val) => {
      if (val && val > 0) total += val;
    });
  } else {
    total += (m.august || 0) + (m.september || 0) + (m.october || 0);
  }
  if (m.payments2026) {
    Object.values(m.payments2026).forEach((val) => {
      if (val && val > 0) total += val;
    });
  }
  return total;
};

export const MemberList: React.FC<MemberListProps> = ({
  members,
  currentUser,
  onSelectMemberForProfile,
  onEditMember,
  onOpenDocsModal,
  onNavigate,
  onDataUpdated
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMode, setSearchMode] = useState<'all' | 'id' | 'name' | 'phone'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid_sep' | 'baki_sep' | 'baki_aug' | 'any_baki'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'roll_asc' | 'id_asc' | 'name_asc' | 'deposit_desc' | 'deposit_asc'>('roll_asc');
  const [selectedQuickId, setSelectedQuickId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Profile picture upload states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [targetMemberForUpload, setTargetMemberForUpload] = useState<string | null>(null);
  const [uploadingMemberId, setUploadingMemberId] = useState<string | null>(null);
  const [photoToast, setPhotoToast] = useState<string | null>(null);

  const showPhotoToast = (msg: string) => {
    setPhotoToast(msg);
    setTimeout(() => setPhotoToast(null), 3500);
  };

  const triggerUpload = (memberId: string) => {
    setTargetMemberForUpload(memberId);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetMemberForUpload) return;
    try {
      setUploadingMemberId(targetMemberForUpload);
      const dataUrl = await compressAndReadFile(file, 350, 350, 0.85);
      const updated = updateMemberPhoto(targetMemberForUpload, dataUrl);
      if (onDataUpdated) onDataUpdated(updated);

      if (selectedMember && selectedMember.id === targetMemberForUpload) {
        setSelectedMember(prev => prev ? { ...prev, photoUrl: dataUrl } : null);
      }
      showPhotoToast('মেম্বার এর প্রোফাইল ছবি সফলভাবে আপডেট হয়েছে!');
    } catch (err: any) {
      alert(err.message || 'ছবি আপলোড করতে সমস্যা হয়েছে।');
    } finally {
      setUploadingMemberId(null);
      setTargetMemberForUpload(null);
      if (e.target) e.target.value = '';
    }
  };

  const handleRemovePhoto = (memberId: string) => {
    if (!window.confirm('আপনি কি এই প্রোফাইল ছবি মুছে ফেলতে চান?')) return;
    const updated = updateMemberPhoto(memberId, null);
    if (onDataUpdated) onDataUpdated(updated);
    if (selectedMember && selectedMember.id === memberId) {
      setSelectedMember(prev => prev ? { ...prev, photoUrl: undefined } : null);
    }
    showPhotoToast('প্রোফাইল ছবি সফলভাবে মুছে ফেলা হয়েছে!');
  };

  const handleCopyPhone = (phone: string, id: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSearchMode('all');
    setStatusFilter('all');
    setRoleFilter('all');
    setSortBy('roll_asc');
    setSelectedQuickId(null);
  };

  // Get unique roles for filter dropdown
  const uniqueRoles = Array.from(new Set(members.map(m => m.role || 'সদস্য')));

  // Filter members
  const filteredMembers = members.filter((m) => {
    // If quick ID is selected
    if (selectedQuickId && m.id !== selectedQuickId) {
      return false;
    }

    // Role filter
    if (roleFilter !== 'all') {
      const mRole = m.role || 'সদস্য';
      if (mRole !== roleFilter) return false;
    }

    // Status filter
    if (statusFilter === 'paid_sep') {
      if (!m.september || m.september <= 0) return false;
    } else if (statusFilter === 'baki_sep') {
      if (m.september !== null && m.september > 0) return false;
    } else if (statusFilter === 'baki_aug') {
      if (m.august !== null && m.august > 0) return false;
    } else if (statusFilter === 'any_baki') {
      const hasDue = (!m.august || m.august <= 0) || (!m.september || m.september <= 0);
      if (!hasDue) return false;
    }

    // Search term filter
    const rawTerm = searchTerm.trim().toLowerCase();
    if (!rawTerm) return true;

    const bnToEn = (str: string) => str.replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d).toString());
    const cleanTerm = bnToEn(rawTerm).replace(/\s+/g, '');
    const numNoZeros = cleanTerm.replace(/^vb/i, '').replace(/^2025/, '').replace(/^0+/, '');

    if (searchMode === 'id') {
      return (
        m.id.toLowerCase().includes(cleanTerm) ||
        (Boolean(numNoZeros) && String(m.rollNo) === numNoZeros) ||
        (Boolean(cleanTerm) && m.id.toLowerCase().endsWith(cleanTerm))
      );
    }

    if (searchMode === 'name') {
      return m.name.toLowerCase().includes(rawTerm);
    }

    if (searchMode === 'phone') {
      return m.phone.includes(rawTerm) || cleanTerm.length > 2 && m.phone.includes(cleanTerm);
    }

    // 'all' mode: search across ID, name, phone, roll, and role
    return (
      m.name.toLowerCase().includes(rawTerm) ||
      m.id.toLowerCase().includes(cleanTerm) ||
      (Boolean(numNoZeros) && String(m.rollNo) === numNoZeros) ||
      (Boolean(cleanTerm) && m.id.toLowerCase().endsWith(cleanTerm)) ||
      m.phone.includes(rawTerm) ||
      (m.role && m.role.toLowerCase().includes(rawTerm))
    );
  }).sort((a, b) => {
    const totalA = calculateMemberAllTotal(a);
    const totalB = calculateMemberAllTotal(b);

    if (sortBy === 'roll_asc') return a.rollNo - b.rollNo;
    if (sortBy === 'id_asc') return a.id.localeCompare(b.id);
    if (sortBy === 'name_asc') return a.name.localeCompare(b.name, 'bn');
    if (sortBy === 'deposit_desc') return totalB - totalA;
    if (sortBy === 'deposit_asc') return totalA - totalB;
    return a.rollNo - b.rollNo;
  });

  // Calculate summary counts
  const totalCount = members.length;
  const septPaidCount = members.filter(m => m.september && m.september > 0).length;
  const septBakiCount = totalCount - septPaidCount;
  const augBakiCount = members.filter(m => !m.august || m.august === 0).length;
  const anyBakiCount = members.filter(m => (!m.august || m.august <= 0) || (!m.september || m.september <= 0)).length;

  const hasActiveFilters = Boolean(
    searchTerm || 
    statusFilter !== 'all' || 
    roleFilter !== 'all' || 
    selectedQuickId !== null ||
    sortBy !== 'roll_asc'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-850 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
              সদস্য তালিকা
            </span>
            <span className="text-xs text-stone-500 font-medium">সদস্য আইডি (যেমন: VB20250001)</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-emerald-950 mt-1">
            সমিতির ২৪ জন সদস্য তালিকা
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            প্রত্যেক সদস্যের নাম, ফোন নম্বর, আগস্ট ও সেপ্টেম্বর মাসের জমার লাইভ স্ট্যাটাস
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('year2025')}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-700" />
            ২০২৫ চার্ট
          </button>

          <button
            onClick={() => onNavigate('year2026')}
            className="px-3 py-2 bg-sky-50 hover:bg-sky-100 border border-sky-300 text-sky-900 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <TrendingUp className="w-3.5 h-3.5 text-sky-700" />
            ২০২৬ চার্ট
          </button>

          <button
            onClick={() => onOpenDocsModal('ledger')}
            className="px-3.5 py-2 bg-red-50 hover:bg-red-100 border border-red-300 text-red-900 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
          >
            <FileCheck2 className="w-4 h-4 text-red-600" />
            আসল লাল খাতা দেখুন
          </button>

          <div className="bg-stone-100 p-1 rounded-xl flex items-center border border-stone-200">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'cards' ? 'bg-white text-emerald-900 shadow-xs' : 'text-stone-600'
              }`}
              title="কার্ড ভিউ"
            >
              <LayoutGrid className="w-4 h-4" /> কার্ড
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'table' ? 'bg-white text-emerald-900 shadow-xs' : 'text-stone-600'
              }`}
              title="টেবিল ভিউ"
            >
              <List className="w-4 h-4" /> টেবিল
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SEARCH BAR & FILTER OPTIONS                               */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl border-2 border-stone-200 shadow-md p-5 sm:p-6 space-y-5">
        
        {/* Search Mode Toggles & Search Input */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-emerald-700" />
              সদস্য অনুসন্ধান ও দ্রুত সার্চ:
            </label>

            {/* Search Type Selector Tabs */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs">
              <button
                type="button"
                onClick={() => setSearchMode('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  searchMode === 'all'
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                সব ফিল্ড
              </button>
              <button
                type="button"
                onClick={() => setSearchMode('id')}
                className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  searchMode === 'id'
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Hash className="w-3 h-3 text-amber-300" /> আইডি দিয়ে
              </button>
              <button
                type="button"
                onClick={() => setSearchMode('name')}
                className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  searchMode === 'name'
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <User className="w-3 h-3 text-amber-300" /> নাম দিয়ে
              </button>
              <button
                type="button"
                onClick={() => setSearchMode('phone')}
                className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  searchMode === 'phone'
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Phone className="w-3 h-3 text-amber-300" /> মোবাইল
              </button>
            </div>
          </div>

          {/* Search Box Input */}
          <div className="relative">
            <Search className="w-5 h-5 text-emerald-800 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (selectedQuickId) setSelectedQuickId(null);
              }}
              placeholder={
                searchMode === 'id' 
                  ? 'মেম্বার আইডি লিখুন (যেমন: VB20250001, 1, ০১, 0001)...' 
                  : searchMode === 'name'
                  ? 'সদস্যের নাম লিখুন (যেমন: রাজন, রনি, শিকদার, হক, মাঝি)...'
                  : searchMode === 'phone'
                  ? 'মোবাইল নম্বর লিখুন (যেমন: 01880980716)...'
                  : 'মেম্বার আইডি (VB20250001 বা 1) অথবা সদস্যের নাম ও মোবাইল দিয়ে খুঁজুন...'
              }
              className="w-full pl-12 pr-10 py-3.5 rounded-2xl border-2 border-stone-200 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/15 text-sm sm:text-base font-medium outline-hidden transition-all bg-stone-50 focus:bg-white shadow-inner"
              autoFocus
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition-colors cursor-pointer"
                title="মুছুন"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Member ID Jump Chips */}
        <div className="space-y-1.5 pt-1 border-t border-stone-100">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-bold flex items-center gap-1 text-emerald-950">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> দ্রুত আইডি নির্বাচন (১ ক্লিকে মেম্বার পেজ):
            </span>
            {selectedQuickId && (
              <button
                onClick={() => setSelectedQuickId(null)}
                className="text-xs text-emerald-800 font-bold hover:underline cursor-pointer"
              >
                সকল সদস্য দেখান
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin">
            {members.map((m) => {
              const isSelected = selectedQuickId === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedQuickId(null);
                    } else {
                      setSelectedQuickId(m.id);
                      setSearchTerm('');
                    }
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-800 text-white border-emerald-900 shadow-md ring-2 ring-emerald-500/40'
                      : 'bg-stone-50 hover:bg-emerald-50 text-stone-700 border-stone-200 hover:border-emerald-300'
                  }`}
                  title={`${toBengaliNumber(m.rollNo)}. ${m.name} (${m.phone})`}
                >
                  <span className="text-[10px] text-stone-400 mr-1">{toBengaliNumber(m.rollNo)}.</span>
                  {m.id}
                  <span className="font-sans font-normal text-[11px] ml-1.5 text-stone-500">
                    {m.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Controls Row: Status, Role & Sort */}
        <div className="pt-2 border-t border-stone-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Status Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-stone-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-stone-400" /> ফিল্টার:
            </span>

            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-emerald-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              সকল ({toBengaliNumber(totalCount)})
            </button>

            <button
              onClick={() => setStatusFilter('paid_sep')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 border ${
                statusFilter === 'paid_sep'
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" /> সেপ্টেম্বর পরিশোধিত ({toBengaliNumber(septPaidCount)})
            </button>

            <button
              onClick={() => setStatusFilter('baki_sep')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 border ${
                statusFilter === 'baki_sep'
                  ? 'bg-red-700 text-white border-red-800 shadow-xs'
                  : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
              }`}
            >
              <XCircle className="w-3 h-3" /> সেপ্টেম্বর বাকি ({toBengaliNumber(septBakiCount)})
            </button>

            <button
              onClick={() => setStatusFilter('baki_aug')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 border ${
                statusFilter === 'baki_aug'
                  ? 'bg-amber-700 text-white border-amber-800 shadow-xs'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
            >
              আগস্ট বাকি ({toBengaliNumber(augBakiCount)})
            </button>

            <button
              onClick={() => setStatusFilter('any_baki')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 border ${
                statusFilter === 'any_baki'
                  ? 'bg-stone-800 text-white border-stone-900 shadow-xs'
                  : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
              }`}
            >
              যেকোনো বকেয়া ({toBengaliNumber(anyBakiCount)})
            </button>
          </div>

          {/* Role Filter & Sort By Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Role Dropdown */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-stone-500 font-bold">পদবী:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="text-xs font-semibold py-1.5 px-2.5 rounded-xl border border-stone-300 bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden"
              >
                <option value="all">সকল পদবী</option>
                {uniqueRoles.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-stone-500 font-bold">সাজান:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs font-semibold py-1.5 px-2.5 rounded-xl border border-stone-300 bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden"
              >
                <option value="roll_asc">ক্রমিক (১ - ২৪)</option>
                <option value="id_asc">আইডি (VB...)</option>
                <option value="name_asc">নাম (ক - য়)</option>
                <option value="deposit_desc">মোট জমা (সর্বোচ্চ আগে)</option>
                <option value="deposit_asc">মোট জমা (কম আগে)</option>
              </select>
            </div>

          </div>

        </div>

        {/* Active Filter Tags & Reset Bar */}
        {hasActiveFilters && (
          <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-stone-500 font-bold">সক্রিয় ফিল্টার:</span>

              {searchTerm && (
                <span className="bg-emerald-100 text-emerald-950 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border border-emerald-300">
                  {searchMode === 'id' ? 'আইডি' : searchMode === 'name' ? 'নাম' : searchMode === 'phone' ? 'মোবাইল' : 'অনুসন্ধান'}: "{searchTerm}"
                  <button onClick={() => setSearchTerm('')} className="hover:text-red-700 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedQuickId && (
                <span className="bg-emerald-800 text-white font-mono font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                  আইডি: {selectedQuickId}
                  <button onClick={() => setSelectedQuickId(null)} className="hover:text-amber-300 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {statusFilter !== 'all' && (
                <span className="bg-stone-200 text-stone-800 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                  স্ট্যাটাস: {statusFilter === 'paid_sep' ? 'সেপ্টেম্বর পরিশোধিত' : statusFilter === 'baki_sep' ? 'সেপ্টেম্বর বাকি' : statusFilter === 'baki_aug' ? 'আগস্ট বাকি' : 'যেকোনো বকেয়া'}
                  <button onClick={() => setStatusFilter('all')} className="hover:text-red-700 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {roleFilter !== 'all' && (
                <span className="bg-stone-200 text-stone-800 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                  পদবী: {roleFilter}
                  <button onClick={() => setRoleFilter('all')} className="hover:text-red-700 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            <button
              onClick={handleResetFilters}
              className="text-red-600 hover:text-red-800 font-bold flex items-center gap-1 hover:underline cursor-pointer ml-auto"
            >
              <RotateCcw className="w-3 h-3" /> সকল ফিল্টার মুছুন
            </button>
          </div>
        )}

      </div>

      {/* Results Count & Summary */}
      <div className="flex items-center justify-between text-xs text-stone-600 px-1">
        <span>
          প্রদর্শিত হচ্ছে: <strong className="text-emerald-950 font-bold text-sm">{toBengaliNumber(filteredMembers.length)} জন</strong> সদস্য
          {filteredMembers.length < members.length && ` (মোট ${toBengaliNumber(members.length)} জনের মধ্যে)`}
        </span>
        {searchTerm && <span>অনুসন্ধান মিল: <strong className="text-emerald-900 font-mono">"{searchTerm}"</strong></span>}
      </div>

      {/* If No Results Found */}
      {filteredMembers.length === 0 && (
        <div className="bg-white rounded-3xl p-10 text-center border-2 border-dashed border-stone-300 space-y-4">
          <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-800">
              কোনো সদস্যের তথ্য পাওয়া যায়নি!
            </h3>
            <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
              আপনার অনুসন্ধান "{searchTerm}" অথবা নির্বাচিত ফিল্টারের সাথে কোনো সদস্যের আইডি বা নামের মিল নেই।
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs inline-flex items-center gap-2 shadow-md transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-amber-300" />
            ফিল্টার রিসেট করে সব সদস্য দেখুন
          </button>
        </div>
      )}

      {/* VIEW MODE: CARDS (Requested explicitly by user: "প্রত্যেকের Card: Member ID, নাম, মোবাইল, মোট জমা, আগস্ট, সেপ্টেম্বর Status: Paid/Baki") */}
      {filteredMembers.length > 0 && (viewMode === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredMembers.map((member) => {
            const isAugPaid = member.august !== null && member.august > 0;
            const isSepPaid = member.september !== null && member.september > 0;
            const totalDeposit = calculateMemberAllTotal(member);

            return (
              <div
                key={member.id}
                className="bg-white rounded-2xl border-2 border-stone-200 hover:border-emerald-600 shadow-md hover:shadow-xl transition-all p-5 flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Top decorative stripe */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                  isSepPaid ? 'bg-emerald-600' : 'bg-red-500'
                }`} />

                {/* Card Header: Member ID & Roll */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                      ID: {member.id}
                    </span>
                    <span className="text-xs font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                      ক্রমিক: {toBengaliNumber(member.rollNo)}
                    </span>
                  </div>

                  {/* Member Name & Role with Profile Picture */}
                  <div className="flex items-center gap-3 pt-1">
                    <div className="relative group/avatar shrink-0">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-800 to-emerald-950 border-2 border-emerald-600/50 shadow-xs flex items-center justify-center text-white">
                        {member.photoUrl ? (
                          <img
                            src={member.photoUrl}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center w-full h-full text-center">
                            <User className="w-6 h-6 text-emerald-200" />
                            <span className="text-[10px] font-black text-amber-300 font-mono leading-none mt-0.5">
                              #{toBengaliNumber(member.rollNo)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Quick Upload / Change Photo Overlay Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerUpload(member.id);
                        }}
                        disabled={uploadingMemberId === member.id}
                        title={member.photoUrl ? "ছবি পরিবর্তন করুন" : "ছবি যোগ করুন"}
                        className="absolute -bottom-1 -right-1 p-1 bg-amber-400 hover:bg-amber-300 text-emerald-950 rounded-full shadow-md border-2 border-white cursor-pointer transition-transform hover:scale-110 active:scale-95"
                      >
                        <Camera className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-stone-900 group-hover:text-emerald-900 transition-colors truncate">
                        {member.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="text-[11px] font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                          {member.role || 'সদস্য'}
                        </span>
                        {member.notes && (
                          <span className="text-[10px] text-stone-400 truncate max-w-[120px]" title={member.notes}>
                            {member.notes}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mobile Number with Copy & Actions */}
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span className="font-mono text-xs font-bold text-stone-800">
                        {member.phone}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <a
                        href={`tel:${member.phone}`}
                        className="p-1 text-stone-500 hover:text-emerald-700"
                        title="কল করুন"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={`https://wa.me/${member.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 text-stone-500 hover:text-emerald-600"
                        title="হোয়াটসঅ্যাপ"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleCopyPhone(member.phone, member.id)}
                        className="p-1 text-stone-500 hover:text-emerald-700"
                        title="নম্বর কপি করুন"
                      >
                        {copiedId === member.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Monthly Status Grid: August & September */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    
                    {/* August Status */}
                    <div className={`p-2 rounded-xl border text-center ${
                      isAugPaid 
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
                        : 'bg-red-50/70 border-red-200 text-red-950'
                    }`}>
                      <span className="text-[10px] uppercase font-bold block text-stone-500">
                        আগস্ট
                      </span>
                      <div className="flex items-center justify-center gap-1 mt-0.5">
                        {isAugPaid ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="text-xs font-black text-emerald-700">Paid ({toBengaliNumber(member.august)})</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-red-600 shrink-0" />
                            <span className="text-xs font-black text-red-600">Baki</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* September Status */}
                    <div className={`p-2 rounded-xl border text-center ${
                      isSepPaid 
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
                        : 'bg-red-50/70 border-red-200 text-red-950'
                    }`}>
                      <span className="text-[10px] uppercase font-bold block text-stone-500">
                        সেপ্টেম্বর
                      </span>
                      <div className="flex items-center justify-center gap-1 mt-0.5">
                        {isSepPaid ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="text-xs font-black text-emerald-700">Paid ({toBengaliNumber(member.september)})</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-red-600 shrink-0" />
                            <span className="text-xs font-black text-red-600">Baki</span>
                          </>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Card Footer: Total Deposit */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-stone-500 block font-semibold">মোট জমা</span>
                    <span className="text-base font-black text-emerald-900">
                      {formatCurrency(totalDeposit)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {currentUser.role === 'admin' && onEditMember && (
                      <button
                        onClick={() => onEditMember(member)}
                        className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs"
                        title="হিসাব এডিট করুন"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => setSelectedMember(member)}
                      className="px-2.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3" /> বিবরণী
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* VIEW MODE: TABLE */
        <div className="bg-white rounded-2xl border border-stone-200 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-stone-100 font-bold text-stone-700 border-b border-stone-200">
                <tr>
                  <th className="py-3 px-3 text-center">নং</th>
                  <th className="py-3 px-3">মেম্বার আইডি</th>
                  <th className="py-3 px-3">সদস্যের নাম</th>
                  <th className="py-3 px-3">পদবী</th>
                  <th className="py-3 px-3">মোবাইল নম্বর</th>
                  <th className="py-3 px-3 text-center">আগস্ট Status</th>
                  <th className="py-3 px-3 text-center">সেপ্টেম্বর Status</th>
                  <th className="py-3 px-3 text-right">মোট জমা</th>
                  <th className="py-3 px-3 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredMembers.map((m) => {
                  const totalDeposit = calculateMemberAllTotal(m);
                  const isAugPaid = m.august !== null && m.august > 0;
                  const isSepPaid = m.september !== null && m.september > 0;

                  return (
                    <tr key={m.id} className="hover:bg-emerald-50/40 transition-colors">
                      <td className="py-3 px-3 text-center font-bold text-stone-500">
                        {toBengaliNumber(m.rollNo)}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-800 text-xs">
                        {m.id}
                      </td>
                      <td className="py-3 px-3 font-bold text-stone-900">
                        <div className="flex items-center gap-2.5">
                          <div className="relative group/tbl shrink-0">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-emerald-800 to-emerald-950 text-white flex items-center justify-center border border-emerald-600/40 shadow-2xs">
                              {m.photoUrl ? (
                                <img src={m.photoUrl} alt={m.name} className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-4 h-4 text-emerald-200" />
                              )}
                            </div>
                            <button
                              onClick={() => triggerUpload(m.id)}
                              title={m.photoUrl ? "ছবি পরিবর্তন" : "ছবি যোগ করুন"}
                              className="absolute -bottom-1 -right-1 p-0.5 bg-amber-400 text-emerald-950 rounded-full shadow-xs opacity-0 group-hover/tbl:opacity-100 transition-opacity cursor-pointer"
                            >
                              <Camera className="w-2.5 h-2.5" />
                            </button>
                          </div>
                          <span>{m.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                          {m.role || 'সদস্য'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-medium text-stone-700">
                        {m.phone}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {isAugPaid ? (
                          <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-bold">
                            Paid ({toBengaliNumber(m.august)})
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-bold">
                            Baki
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {isSepPaid ? (
                          <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-bold">
                            Paid ({toBengaliNumber(m.september)})
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-bold">
                            Baki
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-black text-emerald-950">
                        {formatCurrency(totalDeposit)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => setSelectedMember(m)}
                          className="px-2.5 py-1 bg-stone-100 hover:bg-emerald-800 hover:text-white rounded-md text-xs font-semibold transition-colors"
                        >
                          রসিদ দেখুন
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Individual Member Voucher / Receipt Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border-2 border-emerald-800/30 animate-in zoom-in-95 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-3.5">
                <div className="relative group/modalavatar shrink-0">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-800 to-emerald-950 border-2 border-emerald-600/60 shadow-md flex items-center justify-center text-white">
                    {selectedMember.photoUrl ? (
                      <img
                        src={selectedMember.photoUrl}
                        alt={selectedMember.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <User className="w-7 h-7 text-emerald-200" />
                        <span className="text-[9px] font-mono font-bold text-amber-300">
                          #{toBengaliNumber(selectedMember.rollNo)}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => triggerUpload(selectedMember.id)}
                    className="absolute -bottom-1 -right-1 p-1 bg-amber-400 hover:bg-amber-300 text-emerald-950 rounded-full shadow-md border-2 border-white cursor-pointer transition-transform hover:scale-110 active:scale-95"
                    title={selectedMember.photoUrl ? "ছবি পরিবর্তন করুন" : "ছবি যোগ করুন"}
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                </div>
                <div>
                  <h3 className="font-extrabold text-stone-900 text-lg flex items-center gap-2">
                    {selectedMember.name}
                    {selectedMember.photoUrl && (
                      <button
                        onClick={() => handleRemovePhoto(selectedMember.id)}
                        className="text-stone-400 hover:text-red-600 p-0.5 rounded cursor-pointer"
                        title="ছবি মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </h3>
                  <p className="text-xs font-mono text-emerald-700">আইডি: {selectedMember.id} | রোল: {toBengaliNumber(selectedMember.rollNo)}</p>
                  <button
                    onClick={() => triggerUpload(selectedMember.id)}
                    className="mt-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 transition-colors"
                  >
                    <Camera className="w-3 h-3 text-amber-600" /> {selectedMember.photoUrl ? 'ছবি পরিবর্তন করুন' : 'প্রোফাইল ছবি যোগ করুন'}
                  </button>
                </div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-2 bg-stone-50 p-3 rounded-xl">
                <div>
                  <span className="text-stone-500 text-[11px] block">পদবী:</span>
                  <strong>{selectedMember.role || 'সাধারণ সদস্য'}</strong>
                </div>
                <div>
                  <span className="text-stone-500 text-[11px] block">মোবাইল:</span>
                  <strong className="font-mono">{selectedMember.phone}</strong>
                </div>
                <div>
                  <span className="text-stone-500 text-[11px] block">যোগদানের তারিখ:</span>
                  <span>{selectedMember.joinedDate}</span>
                </div>
                <div>
                  <span className="text-stone-500 text-[11px] block">মোট জমা:</span>
                  <strong className="text-emerald-800 font-bold text-base">
                    {formatCurrency(calculateMemberAllTotal(selectedMember))}
                  </strong>
                </div>
              </div>

              {/* Breakdown */}
              <div className="border border-stone-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100 font-semibold text-stone-700">
                    <tr>
                      <th className="p-2">মাস / খাত</th>
                      <th className="p-2 text-center">নির্ধারিত</th>
                      <th className="p-2 text-center">জমা</th>
                      <th className="p-2 text-center">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    <tr>
                      <td className="p-2 font-medium">আগস্ট ২০২৫</td>
                      <td className="p-2 text-center font-mono">২,৫০০ ৳</td>
                      <td className="p-2 text-center font-mono font-bold text-emerald-800">{selectedMember.august ? `${selectedMember.august} ৳` : '০ ৳'}</td>
                      <td className="p-2 text-center">{selectedMember.august ? <span className="text-emerald-700 font-bold">পরিশোধিত</span> : <span className="text-red-600 font-bold">বকেয়া</span>}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">সেপ্টেম্বর ২০২৫</td>
                      <td className="p-2 text-center font-mono">২,৫০০ ৳</td>
                      <td className="p-2 text-center font-mono font-bold text-emerald-800">{selectedMember.september ? `${selectedMember.september} ৳` : '০ ৳'}</td>
                      <td className="p-2 text-center">{selectedMember.september ? <span className="text-emerald-700 font-bold">পরিশোধিত</span> : <span className="text-red-600 font-bold">বকেয়া</span>}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">ডাউন-পেমেন্ট</td>
                      <td className="p-2 text-center font-mono">৫,০০০ ৳</td>
                      <td className="p-2 text-center font-mono">{selectedMember.downPayment || 0} ৳</td>
                      <td className="p-2 text-center"><span className="text-stone-500">আসন্ন</span></td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">জরিমানা</td>
                      <td className="p-2 text-center font-mono">—</td>
                      <td className="p-2 text-center font-mono">{selectedMember.fine || 0} ৳</td>
                      <td className="p-2 text-center"><span className="text-emerald-700">নাই</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {selectedMember.notes && (
                <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-amber-900 text-xs">
                  <strong>মন্তব্য:</strong> {selectedMember.notes}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-stone-200 flex justify-between gap-3">
              <button
                onClick={() => {
                  setSelectedMember(null);
                  onNavigate('payment');
                }}
                className="px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-bold hover:bg-emerald-900 flex items-center gap-1"
              >
                <CreditCard className="w-3.5 h-3.5" /> এনার জন্য পেমেন্ট করুন
              </button>

              <button
                onClick={() => setSelectedMember(null)}
                className="px-4 py-2 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-lg text-xs font-semibold"
              >
                বন্ধ করুন
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Hidden File Input for uploading Member Profile Pictures */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Profile Picture Toast Notification */}
      {photoToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-2xl border-2 border-amber-400 flex items-center gap-2.5 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-amber-300 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{photoToast}</span>
        </div>
      )}

    </div>
  );
};
