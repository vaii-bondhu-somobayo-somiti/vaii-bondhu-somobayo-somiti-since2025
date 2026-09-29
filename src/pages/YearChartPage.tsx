import React, { useState } from 'react';
import { SocietyData, CurrentUser, Member } from '../types';
import { saveStoredData } from '../utils/storage';
import { 
  Calendar, 
  Coins, 
  Landmark, 
  TrendingUp, 
  Plus, 
  Edit3, 
  Check, 
  X, 
  Search, 
  Printer, 
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Layers,
  Save,
  Trash2,
  User
} from 'lucide-react';

interface YearChartPageProps {
  year: 2025 | 2026;
  data: SocietyData;
  currentUser: CurrentUser;
  onDataUpdated: (newData: SocietyData) => void;
  onNavigate: (tab: string) => void;
}

// 12 Months of 2025
export const MONTHS_2025 = [
  { key: '01', name: 'জানুয়ারি', short: 'Jan-25', en: 'January' },
  { key: '02', name: 'ফেব্রুয়ারি', short: 'Feb-25', en: 'February' },
  { key: '03', name: 'মার্চ', short: 'Mar-25', en: 'March' },
  { key: '04', name: 'এপ্রিল', short: 'Apr-25', en: 'April' },
  { key: '05', name: 'মে', short: 'May-25', en: 'May' },
  { key: '06', name: 'জুন', short: 'Jun-25', en: 'June' },
  { key: '07', name: 'জুলাই', short: 'Jul-25', en: 'July' },
  { key: '08', name: 'আগস্ট', short: 'Aug-25', en: 'August', note: 'সমিতি শুরু' },
  { key: '09', name: 'সেপ্টেম্বর', short: 'Sep-25', en: 'September' },
  { key: '10', name: 'অক্টোবর', short: 'Oct-25', en: 'October' },
  { key: '11', name: 'নভেম্বর', short: 'Nov-25', en: 'November' },
  { key: '12', name: 'ডিসেম্বর', short: 'Dec-25', en: 'December' }
];

// All possible Months of 2026
export const ALL_MONTHS_2026 = [
  { key: '01', name: 'জানুয়ারি', short: 'Jan-26', fullName: 'জানুয়ারি ২০২৬' },
  { key: '02', name: 'ফেব্রুয়ারি', short: 'Feb-26', fullName: 'ফেব্রুয়ারি ২০২৬' },
  { key: '03', name: 'মার্চ', short: 'Mar-26', fullName: 'মার্চ ২০২৬' },
  { key: '04', name: 'এপ্রিল', short: 'Apr-26', fullName: 'এপ্রিল ২০২৬' },
  { key: '05', name: 'মে', short: 'May-26', fullName: 'মে ২০২৬' },
  { key: '06', name: 'জুন', short: 'Jun-26', fullName: 'জুন ২০২৬' },
  { key: '07', name: 'জুলাই', short: 'Jul-26', fullName: 'জুলাই ২০২৬' },
  { key: '08', name: 'আগস্ট', short: 'Aug-26', fullName: 'আগস্ট ২০২৬' },
  { key: '09', name: 'সেপ্টেম্বর', short: 'Sep-26', fullName: 'সেপ্টেম্বর ২০২৬' },
  { key: '10', name: 'অক্টোবর', short: 'Oct-26', fullName: 'অক্টোবর ২০২৬' },
  { key: '11', name: 'নভেম্বর', short: 'Nov-26', fullName: 'নভেম্বর ২০২৬' },
  { key: '12', name: 'ডিসেম্বর', short: 'Dec-26', fullName: 'ডিসেম্বর ২০২৬' }
];

export const YearChartPage: React.FC<YearChartPageProps> = ({
  year,
  data,
  currentUser,
  onDataUpdated,
  onNavigate
}) => {
  const isAdmin = currentUser.role === 'admin';
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDueOnly, setFilterDueOnly] = useState(false);

  // Cell editing state
  const [editingCell, setEditingCell] = useState<{
    memberId: string;
    memberName: string;
    monthKey: string;
    monthName: string;
    currentAmount: number | null;
  } | null>(null);
  const [cellInputAmount, setCellInputAmount] = useState<string>('');

  // Bulk month edit modal state
  const [bulkMonthModal, setBulkMonthModal] = useState<{
    year: number;
    monthKey: string;
    monthName: string;
  } | null>(null);
  const [bulkAmounts, setBulkAmounts] = useState<Record<string, number | null>>({});

  // Add new month modal for 2026
  const [isAddMonthModalOpen, setIsAddMonthModalOpen] = useState(false);
  const [selectedNewMonthKey, setSelectedNewMonthKey] = useState<string>('');

  // Notification state
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  // Convert numbers to Bengali
  const toBn = (num: number | string | null | undefined): string => {
    if (num === null || num === undefined) return '০';
    return String(num).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);
  };

  const formatTaka = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined) return '৳ ০';
    return `৳ ${toBn(amount.toLocaleString('en-IN'))}`;
  };

  // Helper to get payment amount for member in given year and month
  const getMemberPayment = (m: Member, targetYear: number, monthKey: string): number | null => {
    if (targetYear === 2025) {
      if (m.payments2025 && m.payments2025[monthKey] !== undefined) {
        return m.payments2025[monthKey];
      }
      if (monthKey === '08') return m.august;
      if (monthKey === '09') return m.september;
      if (monthKey === '10') return m.october;
      return null;
    } else {
      if (m.payments2026 && m.payments2026[monthKey] !== undefined) {
        return m.payments2026[monthKey];
      }
      return null;
    }
  };

  // Helper for Down Payment 1 (১ম ৬ মাস)
  const getMemberDownPayment1 = (m: Member, targetYear: number): number => {
    if (targetYear === 2025) {
      if (m.downPayment2025_1 !== undefined) return m.downPayment2025_1;
      return m.downPayment || 0;
    } else {
      return m.downPayment2026_1 || 0;
    }
  };

  // Helper for Down Payment 2 (২য় ৬ মাস)
  const getMemberDownPayment2 = (m: Member, targetYear: number): number => {
    if (targetYear === 2025) {
      return m.downPayment2025_2 || 0;
    } else {
      return m.downPayment2026_2 || 0;
    }
  };

  // Helper for Total Down Payment for a given year
  const getMemberDownPaymentTotal = (m: Member, targetYear: number): number => {
    return getMemberDownPayment1(m, targetYear) + getMemberDownPayment2(m, targetYear);
  };

  // Helper for Fine for a given year
  const getMemberFine = (m: Member, targetYear: number): number => {
    if (targetYear === 2025) {
      if (m.fine2025 !== undefined) return m.fine2025;
      return m.fine || 0;
    } else {
      return m.fine2026 || 0;
    }
  };

  // Total Down Payments & Fines across all members for current active year
  const totalDownPayment1 = data.members.reduce((sum, m) => sum + getMemberDownPayment1(m, year), 0);
  const totalDownPayment2 = data.members.reduce((sum, m) => sum + getMemberDownPayment2(m, year), 0);
  const totalDownPaymentYear = totalDownPayment1 + totalDownPayment2;
  const totalFineYear = data.members.reduce((sum, m) => sum + getMemberFine(m, year), 0);

  // Helper to calculate total for a single member in target year
  const getMemberYearTotal = (m: Member, targetYear: number): number => {
    if (targetYear === 2025) {
      const monthsTotal = MONTHS_2025.reduce((sum, mo) => {
        const val = getMemberPayment(m, 2025, mo.key);
        return sum + (val || 0);
      }, 0);
      return monthsTotal + getMemberDownPaymentTotal(m, 2025) + getMemberFine(m, 2025);
    } else {
      const monthsTotal = activeMonths2026Keys.reduce((sum, key) => {
        const val = getMemberPayment(m, 2026, key);
        return sum + (val || 0);
      }, 0);
      return monthsTotal + getMemberDownPaymentTotal(m, 2026) + getMemberFine(m, 2026);
    }
  };

  // 1. Calculate 2025 Total Deposit (Auto)
  const totalDeposit2025 = data.members.reduce((sum, m) => {
    return sum + getMemberYearTotal(m, 2025);
  }, 0);

  // Active months for 2026
  const activeMonths2026Keys = (data.months2026 && data.months2026.length > 0) 
    ? data.months2026 
    : ['01', '02', '03'];

  const activeMonths2026 = ALL_MONTHS_2026.filter(m => activeMonths2026Keys.includes(m.key));

  // 2. Calculate 2026 Total Deposit (Auto)
  const totalDeposit2026 = data.members.reduce((sum, m) => {
    return sum + getMemberYearTotal(m, 2026);
  }, 0);

  // 3. Total Expenses
  const totalExpenses = (data.expenses || []).reduce((sum, exp) => sum + (exp.amount || 0), 0);

  // 4. Total Society Balance = 2025 Total + 2026 Total - Total Expenses
  const totalSocietyBalance = (totalDeposit2025 + totalDeposit2026) - totalExpenses;

  // Active months for current page
  const currentMonths = year === 2025 
    ? MONTHS_2025 
    : activeMonths2026;

  // Monthly totals across all members
  const getMonthTotal = (monthKey: string): number => {
    return data.members.reduce((sum, m) => {
      const val = getMemberPayment(m, year, monthKey);
      return sum + (val || 0);
    }, 0);
  };

  // Monthly paid members count
  const getMonthPaidCount = (monthKey: string): number => {
    return data.members.filter(m => {
      const val = getMemberPayment(m, year, monthKey);
      return val !== null && val > 0;
    }).length;
  };

  // Filter members by search term
  const filteredMembers = data.members.filter((m) => {
    const raw = searchTerm.trim().toLowerCase();
    const bnToEn = (str: string) => str.replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d).toString());
    const clean = bnToEn(raw).replace(/\s+/g, '');
    const numNoZeros = clean.replace(/^vb/i, '').replace(/^2025/, '').replace(/^0+/, '');

    const matchesSearch = !raw || 
      m.name.toLowerCase().includes(raw) ||
      m.id.toLowerCase().includes(clean) ||
      (Boolean(numNoZeros) && String(m.rollNo) === numNoZeros) ||
      m.phone.includes(raw);

    if (!matchesSearch) return false;

    if (filterDueOnly) {
      // Show members who have at least one due month in this year
      const hasDue = currentMonths.some(mo => {
        const val = getMemberPayment(m, year, mo.key);
        return val === null || val === 0;
      });
      return hasDue;
    }

    return true;
  });

  // Handle single cell edit
  const handleOpenCellEdit = (m: Member, monthKey: string, monthName: string) => {
    if (!isAdmin) return;
    let currentAmt: number | null = null;
    if (monthKey === 'downpayment_1') {
      currentAmt = getMemberDownPayment1(m, year);
    } else if (monthKey === 'downpayment_2') {
      currentAmt = getMemberDownPayment2(m, year);
    } else if (monthKey === 'fine') {
      currentAmt = getMemberFine(m, year);
    } else {
      currentAmt = getMemberPayment(m, year, monthKey);
    }

    setEditingCell({
      memberId: m.id,
      memberName: m.name,
      monthKey,
      monthName,
      currentAmount: currentAmt
    });
    setCellInputAmount(currentAmt !== null ? String(currentAmt) : '');
  };

  const handleSaveCellEdit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingCell) return;

    const parsedAmt = cellInputAmount.trim() === '' ? null : Number(cellInputAmount.replace(/,/g, ''));
    if (parsedAmt !== null && (isNaN(parsedAmt) || parsedAmt < 0)) {
      alert('সঠিক টাকার অঙ্ক লিখুন!');
      return;
    }

    const updatedMembers = data.members.map((m) => {
      if (m.id !== editingCell.memberId) return m;

      if (editingCell.monthKey === 'downpayment_1') {
        const val = parsedAmt || 0;
        if (year === 2025) {
          const cur2 = m.downPayment2025_2 || 0;
          return {
            ...m,
            downPayment2025_1: val,
            downPayment: val + cur2
          };
        } else {
          return {
            ...m,
            downPayment2026_1: val
          };
        }
      }

      if (editingCell.monthKey === 'downpayment_2') {
        const val = parsedAmt || 0;
        if (year === 2025) {
          const cur1 = m.downPayment2025_1 !== undefined ? m.downPayment2025_1 : (m.downPayment || 0);
          return {
            ...m,
            downPayment2025_2: val,
            downPayment: cur1 + val
          };
        } else {
          return {
            ...m,
            downPayment2026_2: val
          };
        }
      }

      if (editingCell.monthKey === 'fine') {
        const val = parsedAmt || 0;
        if (year === 2025) {
          return {
            ...m,
            fine2025: val,
            fine: val
          };
        } else {
          return {
            ...m,
            fine2026: val
          };
        }
      }

      if (year === 2025) {
        const newPayments2025 = {
          ...(m.payments2025 || {}),
          [editingCell.monthKey]: parsedAmt
        };
        return {
          ...m,
          payments2025: newPayments2025,
          // Sync august/september/october
          august: editingCell.monthKey === '08' ? parsedAmt : m.august,
          september: editingCell.monthKey === '09' ? parsedAmt : m.september,
          october: editingCell.monthKey === '10' ? parsedAmt : m.october
        };
      } else {
        const newPayments2026 = {
          ...(m.payments2026 || {}),
          [editingCell.monthKey]: parsedAmt
        };
        return {
          ...m,
          payments2026: newPayments2026
        };
      }
    });

    const updatedData: SocietyData = {
      ...data,
      members: updatedMembers,
      lastUpdated: new Date().toISOString()
    };

    onDataUpdated(updatedData);
    saveStoredData(updatedData);
    showNotification('success', `${editingCell.memberName} এর ${editingCell.monthName} সফলভাবে সংরক্ষিত হয়েছে!`);
    setEditingCell(null);
  };

  // Handle bulk special edit (down payment 1 / 2 / fine)
  const handleOpenBulkSpecialEdit = (specialKey: 'downpayment_1' | 'downpayment_2' | 'fine', title: string) => {
    if (!isAdmin) return;
    const initialMap: Record<string, number | null> = {};
    data.members.forEach((m) => {
      if (specialKey === 'downpayment_1') initialMap[m.id] = getMemberDownPayment1(m, year);
      else if (specialKey === 'downpayment_2') initialMap[m.id] = getMemberDownPayment2(m, year);
      else initialMap[m.id] = getMemberFine(m, year);
    });
    setBulkAmounts(initialMap);
    setBulkMonthModal({
      year,
      monthKey: specialKey,
      monthName: title
    });
  };

  // Handle bulk month edit
  const handleOpenBulkMonthEdit = (monthKey: string, monthName: string) => {
    if (!isAdmin) return;
    const initialMap: Record<string, number | null> = {};
    data.members.forEach((m) => {
      initialMap[m.id] = getMemberPayment(m, year, monthKey);
    });
    setBulkAmounts(initialMap);
    setBulkMonthModal({
      year,
      monthKey,
      monthName
    });
  };

  const handleSaveBulkMonth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkMonthModal) return;

    const updatedMembers = data.members.map((m) => {
      const amt = bulkAmounts[m.id];
      if (bulkMonthModal.monthKey === 'downpayment_1') {
        const val = amt || 0;
        if (bulkMonthModal.year === 2025) {
          const cur2 = m.downPayment2025_2 || 0;
          return {
            ...m,
            downPayment2025_1: val,
            downPayment: val + cur2
          };
        } else {
          return {
            ...m,
            downPayment2026_1: val
          };
        }
      }

      if (bulkMonthModal.monthKey === 'downpayment_2') {
        const val = amt || 0;
        if (bulkMonthModal.year === 2025) {
          const cur1 = m.downPayment2025_1 !== undefined ? m.downPayment2025_1 : (m.downPayment || 0);
          return {
            ...m,
            downPayment2025_2: val,
            downPayment: cur1 + val
          };
        } else {
          return {
            ...m,
            downPayment2026_2: val
          };
        }
      }

      if (bulkMonthModal.monthKey === 'fine') {
        const val = amt || 0;
        if (bulkMonthModal.year === 2025) {
          return {
            ...m,
            fine2025: val,
            fine: val
          };
        } else {
          return {
            ...m,
            fine2026: val
          };
        }
      }
      if (bulkMonthModal.year === 2025) {
        const newPayments2025 = {
          ...(m.payments2025 || {}),
          [bulkMonthModal.monthKey]: amt
        };
        return {
          ...m,
          payments2025: newPayments2025,
          august: bulkMonthModal.monthKey === '08' ? amt : m.august,
          september: bulkMonthModal.monthKey === '09' ? amt : m.september,
          october: bulkMonthModal.monthKey === '10' ? amt : m.october
        };
      } else {
        const newPayments2026 = {
          ...(m.payments2026 || {}),
          [bulkMonthModal.monthKey]: amt
        };
        return {
          ...m,
          payments2026: newPayments2026
        };
      }
    });

    const updatedData: SocietyData = {
      ...data,
      members: updatedMembers,
      lastUpdated: new Date().toISOString()
    };

    onDataUpdated(updatedData);
    saveStoredData(updatedData);
    showNotification('success', `${bulkMonthModal.monthName} এর সকল সদস্যের হিসাব সংরক্ষিত হয়েছে!`);
    setBulkMonthModal(null);
  };

  // Add new month to 2026
  const handleAddNewMonth = () => {
    if (!isAdmin) return;
    const currentKeys = data.months2026 || ['01', '02', '03'];
    // Find next unadded month
    const nextMonth = ALL_MONTHS_2026.find(m => !currentKeys.includes(m.key));
    if (!nextMonth) {
      alert('২০২৬ সালের সকল ১২টি মাস ইতোমধ্যেই যুক্ত করা হয়েছে!');
      return;
    }
    setSelectedNewMonthKey(nextMonth.key);
    setIsAddMonthModalOpen(true);
  };

  const handleConfirmAddMonth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNewMonthKey) return;

    const currentKeys = data.months2026 || ['01', '02', '03'];
    if (currentKeys.includes(selectedNewMonthKey)) {
      alert('এই মাসটি ইতোমধ্যে বিদ্যমান আছে!');
      return;
    }

    const updatedKeys = [...currentKeys, selectedNewMonthKey].sort();
    const targetMonth = ALL_MONTHS_2026.find(m => m.key === selectedNewMonthKey);

    const updatedData: SocietyData = {
      ...data,
      months2026: updatedKeys,
      lastUpdated: new Date().toISOString()
    };

    onDataUpdated(updatedData);
    setIsAddMonthModalOpen(false);
    showNotification('success', `নতুন মাস "${targetMonth?.fullName || selectedNewMonthKey}" সফলভাবে তালিকায় যোগ করা হয়েছে!`);
  };

  // Remove month from 2026
  const handleRemoveMonth = (monthKey: string, monthName: string) => {
    if (!isAdmin) return;
    if (!window.confirm(`আপনি কি নিশ্চিত যে "${monthName}" এর কলামটি ২০২৬ সালের চার্ট থেকে মুছে ফেলতে চান?`)) return;

    const currentKeys = data.months2026 || ['01', '02', '03'];
    const updatedKeys = currentKeys.filter(k => k !== monthKey);

    const updatedData: SocietyData = {
      ...data,
      months2026: updatedKeys,
      lastUpdated: new Date().toISOString()
    };

    onDataUpdated(updatedData);
    showNotification('success', `"${monthName}" কলামটি মুছে ফেলা হয়েছে।`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border text-sm font-bold ${
            notification.type === 'success' 
              ? 'bg-emerald-900 text-white border-emerald-400' 
              : 'bg-red-900 text-white border-red-400'
          }`}>
            <Check className="w-5 h-5 text-amber-300" />
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Top Breadcrumb & Year Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
              মাসভিত্তিক চাঁদা চার্ট
            </span>
            <span className="text-xs text-stone-500 font-medium">
              {year === 2025 ? '১২ মাসের পূর্ণাঙ্গ লেজার' : 'চলমান বছরের লাইভ হিসাব'}
            </span>
            {isAdmin ? (
              <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700" /> অ্যাডমিন এডিট সক্রিয়
              </span>
            ) : (
              <span className="bg-stone-100 text-stone-700 text-xs font-medium px-2 py-0.5 rounded-full">
                সদস্য ভিউ (প্রদর্শন মোড)
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-emerald-950 mt-1">
            {year === 2025 ? '২০২৫ সালের হিসাব' : '২০২৬ সালের হিসাব'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            {year === 2025 
              ? 'জানুয়ারি ২০২৫ থেকে ডিসেম্বর ২০২৫ পর্যন্ত সমিতির ২৪ জন সম্মানিত সদস্যের মাসিক চাঁদার হিসাব চার্ট।'
              : 'জানুয়ারি ২০২৬ থেকে বর্তমান চলমান মাস পর্যন্ত মাসিক চাঁদার ডায়নামিক হিসাব চার্ট।'}
          </p>
        </div>

        {/* Year Switcher Buttons */}
        <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-2xl border border-stone-200 self-start md:self-auto">
          <button
            onClick={() => onNavigate('year2025')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              year === 2025
                ? 'bg-emerald-800 text-white shadow-md'
                : 'text-stone-700 hover:text-emerald-900 hover:bg-stone-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            ২০২৫ সালের চার্ট (১২ মাস)
          </button>

          <button
            onClick={() => onNavigate('year2026')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              year === 2026
                ? 'bg-emerald-800 text-white shadow-md'
                : 'text-stone-700 hover:text-emerald-900 hover:bg-stone-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            ২০২৬ সালের চার্ট (চলমান)
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* C. TOTAL SUMMARY: 3 PROMINENT AUTO BOXES                  */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* BOX 1: 2025 মোট জমা (Auto) */}
        <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 text-white rounded-3xl p-6 shadow-xl border-2 border-emerald-700 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Coins className="w-24 h-24 text-amber-300" />
          </div>
          <div className="relative z-10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-200 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-600/40">
                ১. ২০২৫ মোট জমা (Auto)
              </span>
              <span className="text-[11px] bg-amber-400 text-stone-950 font-black px-2 py-0.5 rounded-md">
                অটো সামারি
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white pt-1">
              {formatTaka(totalDeposit2025)}
            </div>
            <p className="text-xs text-emerald-100/90 leading-relaxed font-sans pt-1">
              ২০২৫ সালের জানুয়ারি থেকে ডিসেম্বর পর্যন্ত সকল সদস্যের জমা ও ডাউনপেমেন্টের মোট অর্থ।
            </p>
          </div>
        </div>

        {/* BOX 2: 2026 মোট জমা (Auto) */}
        <div className="bg-gradient-to-br from-sky-900 via-sky-800 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border-2 border-sky-700 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-24 h-24 text-sky-200" />
          </div>
          <div className="relative z-10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-200 bg-sky-950/60 px-2.5 py-1 rounded-full border border-sky-600/40">
                ২. ২০২৬ মোট জমা (Auto)
              </span>
              <span className="text-[11px] bg-sky-300 text-stone-950 font-black px-2 py-0.5 rounded-md">
                অটো সামারি
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white pt-1">
              {formatTaka(totalDeposit2026)}
            </div>
            <p className="text-xs text-sky-100/90 leading-relaxed font-sans pt-1">
              ২০২৬ সালের চলমান সকল যুক্তকৃত মাসের সদস্য চাঁদার স্বয়ংক্রিয় সর্বমোট হিসাব।
            </p>
          </div>
        </div>

        {/* BOX 3: সমিতির মোট ব্যালেন্স = 2025 + 2026 - খরচ */}
        <div className="bg-gradient-to-br from-amber-600 via-amber-700 to-emerald-950 text-white rounded-3xl p-6 shadow-xl border-2 border-amber-400 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-15 group-hover:opacity-25 transition-opacity">
            <Landmark className="w-24 h-24 text-amber-200" />
          </div>
          <div className="relative z-10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-100 bg-black/40 px-2.5 py-1 rounded-full border border-amber-300/40">
                ৩. সমিতির মোট ব্যালেন্স
              </span>
              <span className="text-[11px] bg-emerald-400 text-stone-950 font-black px-2 py-0.5 rounded-md">
                নিট স্থিতি
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-amber-200 pt-1">
              {formatTaka(totalSocietyBalance)}
            </div>
            <div className="text-xs text-amber-100 font-mono bg-black/30 p-2 rounded-xl border border-white/10 space-y-0.5">
              <div>সূত্র: ২০২৫ ({toBn(totalDeposit2025)}) + ২০২৬ ({toBn(totalDeposit2026)})</div>
              <div className="text-red-200">বিয়োগ মোট খরচ: - {toBn(totalExpenses)} টাকা</div>
            </div>
          </div>
        </div>

      </div>

      {/* Control & Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="নাম, মোবাইল বা মেম্বার আইডি (যেমন: VB20250001 বা 1) দিয়ে খুঁজুন..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-xs sm:text-sm outline-hidden transition-all bg-white"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700"
            >
              মুছুন
            </button>
          )}
        </div>

        {/* Filter & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setFilterDueOnly(!filterDueOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
              filterDueOnly
                ? 'bg-red-50 text-red-900 border-red-300 shadow-xs'
                : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            {filterDueOnly ? 'সকল সদস্য দেখান' : 'শুধুমাত্র যাদের বাকি আছে'}
          </button>

          {/* B. 2026 "নতুন মাস যোগ করুন" বাটন */}
          {year === 2026 && isAdmin && (
            <button
              onClick={handleAddNewMonth}
              className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              নতুন মাস যোগ করুন
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-stone-300 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-stone-600" /> প্রিন্ট / PDF
          </button>
        </div>
      </div>

      {/* Admin Quick Guide Banner */}
      {isAdmin ? (
        <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-950">
          <HelpCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <strong>অ্যাডমিন নির্দেশিকা:</strong> চার্টের যে কোনো মাসের টাকার ঘরে সরাসরি ক্লিক করে একক সদস্যের চাঁদা পরিবর্তন করতে পারবেন। এছাড়া কলামের হেডার নামের পাশে <strong>'এডিট'</strong> বাটনে চাপ দিয়ে পুরো মাসের সব সদস্যের চাঁদা একবারে সংরক্ষণ করতে পারবেন। পুরান কোনো মাস লক থাকবে না, যেকোনো সময় আপডেট করা যাবে।
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-300 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-amber-950">
          <HelpCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong>সম্মানিত সদস্যবৃন্দ:</strong> এটি সমিতির অফিসিয়াল মাসিক চাঁদা চার্ট। এখানে আপনারা নিজেদের এবং অন্য সকল সদস্যের মাসিক জমা স্বয়ংক্রিয়ভাবে লাইভ দেখতে পারবেন। এডিট সুবিধা শুধুমাত্র অ্যাডমিন ও ক্যাশিয়ার মহোদয়ের জন্য সংরক্ষিত।
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MAIN CHART TABLE: YEAR & MONTH WISE                       */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl border-2 border-stone-200 shadow-xl overflow-hidden">
        
        {/* Table Title Bar */}
        <div className="bg-stone-100/90 px-6 py-4 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-800" />
            <h2 className="font-extrabold text-stone-900 text-base sm:text-lg">
              {year === 2025 ? '২০২৫ সালের ১২ মাসের চার্ট লেজার' : '২০২৬ সালের চলমান চাঁদা চার্ট'}
            </h2>
            <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
              {toBn(filteredMembers.length)} জন প্রদর্শিত
            </span>
          </div>

          <div className="text-xs text-stone-600 font-medium flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
              পরিশোধিত
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
              বাকি / অনিষ্পন্ন
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-300 inline-block"></span>
              অনাগত মাস
            </span>
          </div>
        </div>

        {/* Scrollable Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            
            {/* Table Header */}
            <thead className="bg-stone-800 text-white font-bold select-none text-[11px] sm:text-xs">
              <tr>
                <th className="py-3 px-2 text-center border-r border-stone-700 w-12 sticky left-0 z-20 bg-stone-800">
                  নং
                </th>
                <th className="py-3 px-3 border-r border-stone-700 min-w-[180px] sticky left-12 z-20 bg-stone-800 shadow-md">
                  সদস্যের নাম ও আইডি
                </th>

                {/* Down Payment 1 Column (1st 6 Months) */}
                <th className="py-2.5 px-2 border-r border-stone-700 min-w-[110px] text-center bg-emerald-950/80 hover:bg-emerald-900 transition-colors">
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-extrabold text-amber-300 text-xs">
                      ১ম ৬ মাস ডিপি
                    </span>
                  </div>
                  <div className="text-[10px] text-emerald-200 font-mono mt-0.5">
                    মোট: {toBn(totalDownPayment1)} ৳
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => handleOpenBulkSpecialEdit('downpayment_1', `১ম ৬ মাস ডাউন পেমেন্ট (${toBn(year)})`)}
                      className="mt-1 px-1.5 py-0.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[10px] font-semibold flex items-center gap-0.5 mx-auto transition-colors cursor-pointer"
                      title="সকল সদস্যের ১ম ৬ মাসের ডাউন পেমেন্ট একবারে এডিট করুন"
                    >
                      <Edit3 className="w-2.5 h-2.5" /> এডিট
                    </button>
                  )}
                </th>

                {/* Down Payment 2 Column (2nd 6 Months) */}
                <th className="py-2.5 px-2 border-r border-stone-700 min-w-[110px] text-center bg-emerald-950/80 hover:bg-emerald-900 transition-colors">
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-extrabold text-amber-300 text-xs">
                      ২য় ৬ মাস ডিপি
                    </span>
                  </div>
                  <div className="text-[10px] text-emerald-200 font-mono mt-0.5">
                    মোট: {toBn(totalDownPayment2)} ৳
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => handleOpenBulkSpecialEdit('downpayment_2', `২য় ৬ মাস ডাউন পেমেন্ট (${toBn(year)})`)}
                      className="mt-1 px-1.5 py-0.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[10px] font-semibold flex items-center gap-0.5 mx-auto transition-colors cursor-pointer"
                      title="সকল সদস্যের ২য় ৬ মাসের ডাউন পেমেন্ট একবারে এডিট করুন"
                    >
                      <Edit3 className="w-2.5 h-2.5" /> এডিট
                    </button>
                  )}
                </th>

                {/* Month Columns */}
                {currentMonths.map((mo) => {
                  const mTotal = getMonthTotal(mo.key);
                  const paidCount = getMonthPaidCount(mo.key);

                  return (
                    <th 
                      key={mo.key} 
                      className="py-2.5 px-2 border-r border-stone-700 min-w-[105px] text-center group relative hover:bg-stone-750 transition-colors"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span className="font-extrabold text-amber-300 text-xs">
                          {mo.name}
                        </span>
                        {/* Remove Month button in 2026 */}
                        {year === 2026 && isAdmin && currentMonths.length > 1 && (
                          <button
                            onClick={() => handleRemoveMonth(mo.key, mo.name)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-stone-400 hover:text-red-400 transition-opacity cursor-pointer"
                            title="কলাম মুছুন"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <div className="text-[10px] text-stone-300 font-mono mt-0.5">
                        {toBn(paidCount)}/{toBn(data.members.length)} জন
                      </div>
                      
                      {/* Admin Bulk Edit Month Trigger */}
                      {isAdmin && (
                        <button
                          onClick={() => handleOpenBulkMonthEdit(mo.key, mo.name)}
                          className="mt-1 px-1.5 py-0.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[10px] font-semibold flex items-center gap-0.5 mx-auto transition-colors cursor-pointer"
                          title={`${mo.name} এর সবার হিসাব একবারে এডিট করুন`}
                        >
                          <Edit3 className="w-2.5 h-2.5" /> এডিট
                        </button>
                      )}
                    </th>
                  );
                })}

                {/* Fine / Penalty Column */}
                <th className="py-2.5 px-2 border-r border-stone-700 min-w-[95px] text-center bg-red-950/70 hover:bg-red-900 transition-colors">
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-extrabold text-red-300 text-xs">
                      জরিমানা
                    </span>
                  </div>
                  <div className="text-[10px] text-red-200 font-mono mt-0.5">
                    মোট: {toBn(totalFineYear)} ৳
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => handleOpenBulkSpecialEdit('fine', `জরিমানা (${toBn(year)})`)}
                      className="mt-1 px-1.5 py-0.5 bg-red-800 hover:bg-red-700 text-white rounded text-[10px] font-semibold flex items-center gap-0.5 mx-auto transition-colors cursor-pointer"
                      title="সকল সদস্যের জরিমানা একবারে এডিট করুন"
                    >
                      <Edit3 className="w-2.5 h-2.5" /> এডিট
                    </button>
                  )}
                </th>

                {/* Total Column */}
                <th className="py-3 px-3 text-right border-l border-stone-700 min-w-[130px] bg-stone-900 sticky right-0 z-20 text-amber-300 shadow-md">
                  সর্বমোট জমা
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-stone-200">
              {filteredMembers.map((m, index) => {
                const memberYearTotal = getMemberYearTotal(m, year);
                const dp1 = getMemberDownPayment1(m, year);
                const dp2 = getMemberDownPayment2(m, year);
                const mFine = getMemberFine(m, year);

                return (
                  <tr 
                    key={m.id} 
                    className="hover:bg-emerald-50/60 transition-colors group"
                  >
                    {/* Roll No */}
                    <td className="py-2 px-2 text-center font-bold text-stone-500 border-r border-stone-200 sticky left-0 z-10 bg-white group-hover:bg-emerald-50/60">
                      {toBn(m.rollNo)}
                    </td>

                    {/* Member Details */}
                    <td className="py-2 px-3 border-r border-stone-200 sticky left-12 z-10 bg-white group-hover:bg-emerald-50/60 shadow-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-br from-emerald-800 to-emerald-950 text-white flex items-center justify-center shrink-0 border border-emerald-600/40">
                          {m.photoUrl ? (
                            <img src={m.photoUrl} alt={m.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-3.5 h-3.5 text-emerald-200" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-stone-900 group-hover:text-emerald-950 transition-colors truncate">
                              {m.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] mt-0.5">
                            <span className="font-mono text-emerald-800 bg-emerald-100/70 px-1.5 py-0.2 rounded font-bold">
                              {m.id}
                            </span>
                            {m.role && m.role !== 'সদস্য' && (
                              <span className="text-amber-800 font-semibold bg-amber-50 px-1 rounded truncate max-w-[80px]">
                                {m.role}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Down Payment 1 Cell (1st 6 Months) */}
                    <td 
                      onClick={() => isAdmin && handleOpenCellEdit(m, 'downpayment_1', `১ম ৬ মাস ডাউন পেমেন্ট (${toBn(year)})`)}
                      className={`py-2 px-2 text-center border-r border-stone-200 transition-all ${
                        isAdmin ? 'cursor-pointer hover:bg-emerald-100/80' : ''
                      }`}
                      title={isAdmin ? `ক্লিক করে ${m.name} এর ১ম ৬ মাসের ডাউন পেমেন্ট এডিট করুন` : ''}
                    >
                      {dp1 > 0 ? (
                        <span className="inline-block px-2 py-1 rounded-md bg-emerald-100 text-emerald-950 font-bold font-mono text-[11px] sm:text-xs border border-emerald-300 shadow-2xs">
                          {toBn(dp1)}
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-md bg-stone-100 text-stone-500 font-mono text-[11px]">
                          ৳ ০
                        </span>
                      )}
                    </td>

                    {/* Down Payment 2 Cell (2nd 6 Months) */}
                    <td 
                      onClick={() => isAdmin && handleOpenCellEdit(m, 'downpayment_2', `২য় ৬ মাস ডাউন পেমেন্ট (${toBn(year)})`)}
                      className={`py-2 px-2 text-center border-r border-stone-200 transition-all ${
                        isAdmin ? 'cursor-pointer hover:bg-emerald-100/80' : ''
                      }`}
                      title={isAdmin ? `ক্লিক করে ${m.name} এর ২য় ৬ মাসের ডাউন পেমেন্ট এডিট করুন` : ''}
                    >
                      {dp2 > 0 ? (
                        <span className="inline-block px-2 py-1 rounded-md bg-emerald-100 text-emerald-950 font-bold font-mono text-[11px] sm:text-xs border border-emerald-300 shadow-2xs">
                          {toBn(dp2)}
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-md bg-stone-100 text-stone-500 font-mono text-[11px]">
                          ৳ ০
                        </span>
                      )}
                    </td>

                    {/* Month Cells */}
                    {currentMonths.map((mo) => {
                      const amount = getMemberPayment(m, year, mo.key);
                      const isPaid = amount !== null && amount > 0;

                      return (
                        <td 
                          key={mo.key}
                          onClick={() => isAdmin && handleOpenCellEdit(m, mo.key, mo.name)}
                          className={`py-2 px-2 text-center border-r border-stone-200 transition-all ${
                            isAdmin ? 'cursor-pointer hover:bg-emerald-100/80' : ''
                          }`}
                          title={isAdmin ? `ক্লিক করে ${m.name} এর ${mo.name} মাসের চাঁদা এডিট করুন` : ''}
                        >
                          {isPaid ? (
                            <span className="inline-block px-2 py-1 rounded-md bg-emerald-100 text-emerald-950 font-bold font-mono text-[11px] sm:text-xs border border-emerald-300 shadow-2xs">
                              {toBn(amount)}
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded-md bg-red-100 text-red-700 font-semibold text-[11px] border border-red-200">
                              বাকি
                            </span>
                          )}
                        </td>
                      );
                    })}

                    {/* Fine Cell */}
                    <td 
                      onClick={() => isAdmin && handleOpenCellEdit(m, 'fine', `জরিমানা (${toBn(year)})`)}
                      className={`py-2 px-2 text-center border-r border-stone-200 transition-all ${
                        isAdmin ? 'cursor-pointer hover:bg-red-100/80' : ''
                      }`}
                      title={isAdmin ? `ক্লিক করে ${m.name} এর জরিমানা এডিট করুন` : ''}
                    >
                      {mFine && mFine > 0 ? (
                        <span className="inline-block px-2 py-1 rounded-md bg-red-100 text-red-950 font-bold font-mono text-[11px] sm:text-xs border border-red-300 shadow-2xs">
                          {toBn(mFine)}
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-md bg-stone-100 text-stone-400 font-mono text-[11px]">
                          ৳ ০
                        </span>
                      )}
                    </td>

                    {/* Member Total */}
                    <td className="py-2 px-3 text-right font-mono font-black text-emerald-950 border-l border-stone-200 sticky right-0 z-10 bg-white group-hover:bg-emerald-50/60 shadow-xs">
                      {formatTaka(memberYearTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Table Footer: Column Totals */}
            <tfoot className="bg-stone-900 text-white font-bold text-xs select-none">
              <tr>
                <td colSpan={2} className="py-3 px-4 text-left border-r border-stone-700 sticky left-0 z-20 bg-stone-900">
                  <div className="font-extrabold text-amber-300">
                    সর্বমোট আদায় (মাসভিত্তিক ও অন্যান্য)
                  </div>
                </td>

                {/* Down Payment 1 Total */}
                <td className="py-3 px-2 text-center border-r border-stone-700 font-mono text-emerald-300 font-black">
                  {toBn(totalDownPayment1)}
                </td>

                {/* Down Payment 2 Total */}
                <td className="py-3 px-2 text-center border-r border-stone-700 font-mono text-emerald-300 font-black">
                  {toBn(totalDownPayment2)}
                </td>

                {/* Totals per month */}
                {currentMonths.map((mo) => {
                  const mTotal = getMonthTotal(mo.key);
                  return (
                    <td key={mo.key} className="py-3 px-2 text-center border-r border-stone-700 font-mono text-emerald-300 font-black">
                      {toBn(mTotal)}
                    </td>
                  );
                })}

                {/* Fine Total */}
                <td className="py-3 px-2 text-center border-r border-stone-700 font-mono text-red-300 font-black">
                  {toBn(totalFineYear)}
                </td>

                {/* Grand Total */}
                <td className="py-3 px-3 text-right font-mono font-black text-amber-300 text-sm border-l border-stone-700 sticky right-0 z-20 bg-stone-950">
                  {formatTaka(year === 2025 ? totalDeposit2025 : totalDeposit2026)}
                </td>
              </tr>
            </tfoot>

          </table>
        </div>

      </div>

      {/* ======================================================== */}
      {/* MODAL 1: SINGLE CELL PAYMENT EDITOR                       */}
      {/* ======================================================== */}
      {editingCell && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-emerald-600 animate-in fade-in zoom-in duration-150 space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-stone-900 text-lg">
                  {editingCell.monthKey.startsWith('downpayment')
                    ? `${editingCell.monthName} সম্পাদনা` 
                    : editingCell.monthKey === 'fine' 
                    ? 'জরিমানা সম্পাদনা' 
                    : 'চাঁদা জমা সম্পাদনা'}
                </h3>
              </div>
              <button
                onClick={() => setEditingCell(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Member Details */}
            <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-stone-600">সদস্যের নাম:</span>
                <span className="font-bold text-stone-900 text-sm">{editingCell.memberName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">মেম্বার আইডি:</span>
                <span className="font-mono font-bold text-emerald-800">{editingCell.memberId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">খাত / বিবরণ:</span>
                <span className="font-bold text-emerald-950">
                  {editingCell.monthKey.startsWith('downpayment') || editingCell.monthKey === 'fine'
                    ? editingCell.monthName
                    : `${editingCell.monthName} ${toBn(year)}`}
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveCellEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  টাকার পরিমাণ (৳)
                </label>
                <input
                  type="number"
                  value={cellInputAmount}
                  onChange={(e) => setCellInputAmount(e.target.value)}
                  placeholder={
                    editingCell.monthKey.startsWith('downpayment')
                      ? 'যেমন: 1000, 2000 বা 3000'
                      : editingCell.monthKey === 'fine'
                      ? 'যেমন: 50 বা 100'
                      : 'যেমন: 2500 বা বাকি থাকলে 0 রাখুন'
                  }
                  className="w-full p-3 rounded-xl border-2 border-stone-300 focus:border-emerald-600 text-lg font-mono font-bold outline-hidden transition-all bg-stone-50 focus:bg-white"
                  autoFocus
                />
              </div>

              {/* Quick Amount Presets */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-stone-500">দ্রুত নির্বাচন করুন:</label>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {editingCell.monthKey.startsWith('downpayment') ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setCellInputAmount('1000')}
                        className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl font-bold font-mono transition-colors cursor-pointer"
                      >
                        ১০০০
                      </button>
                      <button
                        type="button"
                        onClick={() => setCellInputAmount('2000')}
                        className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl font-bold font-mono transition-colors cursor-pointer"
                      >
                        ২০০০
                      </button>
                      <button
                        type="button"
                        onClick={() => setCellInputAmount('3000')}
                        className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl font-bold font-mono transition-colors cursor-pointer"
                      >
                        ৩০০০
                      </button>
                      <button
                        type="button"
                        onClick={() => setCellInputAmount('0')}
                        className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-xl font-bold transition-colors cursor-pointer"
                      >
                        ০
                      </button>
                    </>
                  ) : editingCell.monthKey === 'fine' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setCellInputAmount('50')}
                        className="p-2 bg-red-100 hover:bg-red-200 text-red-900 rounded-xl font-bold font-mono transition-colors cursor-pointer"
                      >
                        ৫০
                      </button>
                      <button
                        type="button"
                        onClick={() => setCellInputAmount('100')}
                        className="p-2 bg-red-100 hover:bg-red-200 text-red-900 rounded-xl font-bold font-mono transition-colors cursor-pointer"
                      >
                        ১০০
                      </button>
                      <button
                        type="button"
                        onClick={() => setCellInputAmount('200')}
                        className="p-2 bg-red-100 hover:bg-red-200 text-red-900 rounded-xl font-bold font-mono transition-colors cursor-pointer"
                      >
                        ২০০
                      </button>
                      <button
                        type="button"
                        onClick={() => setCellInputAmount('0')}
                        className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-xl font-bold transition-colors cursor-pointer"
                      >
                        ০ (মাফ)
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setCellInputAmount('2000')}
                        className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl font-bold font-mono transition-colors cursor-pointer"
                      >
                        ২০০০
                      </button>
                      <button
                        type="button"
                        onClick={() => setCellInputAmount('2500')}
                        className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl font-bold font-mono transition-colors cursor-pointer"
                      >
                        ২৫০০
                      </button>
                      <button
                        type="button"
                        onClick={() => setCellInputAmount('3000')}
                        className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl font-bold font-mono transition-colors cursor-pointer"
                      >
                        ৩০০০
                      </button>
                      <button
                        type="button"
                        onClick={() => setCellInputAmount('0')}
                        className="p-2 bg-red-100 hover:bg-red-200 text-red-900 rounded-xl font-bold transition-colors cursor-pointer"
                      >
                        ০ (বাকি)
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCell(null)}
                  className="w-1/2 py-2.5 border border-stone-300 text-stone-700 rounded-xl text-xs font-bold hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: BULK MONTH-WISE EDITOR                           */}
      {/* ======================================================== */}
      {bulkMonthModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border-2 border-emerald-600 animate-in fade-in zoom-in duration-150">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-700" />
                  {bulkMonthModal.monthKey.startsWith('downpayment') || bulkMonthModal.monthKey === 'fine'
                    ? `${bulkMonthModal.monthName}: সকল সদস্যের হিসাব একবারে এডিট`
                    : `${bulkMonthModal.monthName} ${toBn(bulkMonthModal.year)}: সবার চাঁদা একবারে এডিট`}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  সকল সদস্যের টাকার পরিমাণ পরিবর্তন করে এক ক্লিকে সেভ করুন
                </p>
              </div>

              <button
                onClick={() => setBulkMonthModal(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Header */}
            <div className="bg-emerald-50 px-6 py-2.5 border-b border-emerald-200 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-emerald-900">
                দ্রুত সেট করুন:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {bulkMonthModal.monthKey.startsWith('downpayment') ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const updated: Record<string, number | null> = {};
                        data.members.forEach(m => updated[m.id] = 1000);
                        setBulkAmounts(updated);
                      }}
                      className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      সবাইকে ১০০০ করুন
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const updated: Record<string, number | null> = {};
                        data.members.forEach(m => updated[m.id] = 2000);
                        setBulkAmounts(updated);
                      }}
                      className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      সবাইকে ২০০০ করুন
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const updated: Record<string, number | null> = {};
                        data.members.forEach(m => updated[m.id] = 3000);
                        setBulkAmounts(updated);
                      }}
                      className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      সবাইকে ৩০০০ করুন
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const updated: Record<string, number | null> = {};
                        data.members.forEach(m => updated[m.id] = 0);
                        setBulkAmounts(updated);
                      }}
                      className="px-2.5 py-1 bg-stone-200 hover:bg-stone-300 text-stone-900 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      সবাইকে ০ করুন
                    </button>
                  </>
                ) : bulkMonthModal.monthKey === 'fine' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const updated: Record<string, number | null> = {};
                        data.members.forEach(m => updated[m.id] = 50);
                        setBulkAmounts(updated);
                      }}
                      className="px-2.5 py-1 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      সবাইকে ৫০ করুন
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const updated: Record<string, number | null> = {};
                        data.members.forEach(m => updated[m.id] = 100);
                        setBulkAmounts(updated);
                      }}
                      className="px-2.5 py-1 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      সবাইকে ১০০ করুন
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const updated: Record<string, number | null> = {};
                        data.members.forEach(m => updated[m.id] = 0);
                        setBulkAmounts(updated);
                      }}
                      className="px-2.5 py-1 bg-stone-200 hover:bg-stone-300 text-stone-900 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      সবাইকে ০ (মাফ) করুন
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const updated: Record<string, number | null> = {};
                        data.members.forEach(m => updated[m.id] = 2000);
                        setBulkAmounts(updated);
                      }}
                      className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      সবাইকে ২০০০ করুন
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const updated: Record<string, number | null> = {};
                        data.members.forEach(m => updated[m.id] = 2500);
                        setBulkAmounts(updated);
                      }}
                      className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      সবাইকে ২৫০০ করুন
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const updated: Record<string, number | null> = {};
                        data.members.forEach(m => updated[m.id] = 3000);
                        setBulkAmounts(updated);
                      }}
                      className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      সবাইকে ৩০০০ করুন
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const updated: Record<string, number | null> = {};
                        data.members.forEach(m => updated[m.id] = 0);
                        setBulkAmounts(updated);
                      }}
                      className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-900 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      সবাইকে বাকি (০) করুন
                    </button>
                    {/* কাস্টম টাকা সবাইকে দিন */}
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        placeholder="কাস্টম টাকা"
                        id="customBulkFeeInput"
                        className="w-24 px-2 py-1 text-xs border border-emerald-300 rounded-lg bg-white font-mono font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('customBulkFeeInput') as HTMLInputElement;
                          const val = input?.value ? Number(input.value) : 0;
                          const updated: Record<string, number | null> = {};
                          data.members.forEach(m => updated[m.id] = val);
                          setBulkAmounts(updated);
                        }}
                        className="px-2.5 py-1 bg-stone-800 hover:bg-stone-900 text-amber-300 rounded-lg text-xs font-bold cursor-pointer"
                      >
                        সবাইকে দিন
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Scrollable Members List */}
            <form onSubmit={handleSaveBulkMonth} className="flex-1 overflow-y-auto p-6 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {data.members.map((m) => (
                  <div 
                    key={m.id} 
                    className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-bold text-stone-900">
                        {toBn(m.rollNo)}. {m.name}
                      </div>
                      <div className="font-mono text-[10px] text-emerald-800">
                        {m.id}
                      </div>
                    </div>

                    <div className="w-32">
                      <input
                        type="number"
                        value={bulkAmounts[m.id] !== null && bulkAmounts[m.id] !== undefined ? bulkAmounts[m.id]! : ''}
                        onChange={(e) => {
                          const val = e.target.value.trim() === '' ? null : Number(e.target.value);
                          setBulkAmounts({ ...bulkAmounts, [m.id]: val });
                        }}
                        placeholder="বাকি"
                        className="w-full p-2 text-right rounded-xl border border-stone-300 font-mono font-bold focus:border-emerald-600 focus:bg-white text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-stone-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setBulkMonthModal(null)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded-xl text-xs font-bold hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  সকল সদস্যের হিসাব সংরক্ষণ করুন
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: ADD NEW MONTH TO 2026                            */}
      {/* ======================================================== */}
      {isAddMonthModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-sky-600 animate-in fade-in zoom-in duration-150 space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-sky-700" />
                <h3 className="font-bold text-stone-900 text-lg">
                  ২০২৬ সালে নতুন মাস যোগ করুন
                </h3>
              </div>
              <button
                onClick={() => setIsAddMonthModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              নতুন মাস নির্বাচন করুন। এর ফলে চার্ট টেবিলে একটি নতুন কলাম উন্মুক্ত হবে এবং সকল সদস্যের চাঁদা এডিট ও সেভ করা যাবে।
            </p>

            <form onSubmit={handleConfirmAddMonth} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  কোন মাস যোগ করতে চান? *
                </label>
                <select
                  value={selectedNewMonthKey}
                  onChange={(e) => setSelectedNewMonthKey(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-300 font-medium focus:border-sky-600 bg-white text-sm"
                  required
                >
                  {ALL_MONTHS_2026.map((mo) => {
                    const isAlreadyAdded = (data.months2026 || []).includes(mo.key);
                    return (
                      <option 
                        key={mo.key} 
                        value={mo.key}
                        disabled={isAlreadyAdded}
                      >
                        {mo.fullName} {isAlreadyAdded ? '— (ইতোমধ্যে যুক্ত)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddMonthModalOpen(false)}
                  className="w-1/2 py-2.5 border border-stone-300 text-stone-700 rounded-xl text-xs font-bold hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-amber-300" />
                  কলাম তৈরি করুন
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
