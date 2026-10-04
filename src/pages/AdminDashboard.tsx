import React, { useState, useRef } from 'react';
import { SocietyData, Member, ExpenseItem, SocietyRule, CommitteeMember, Notice } from '../types';
import { 
  saveStoredData, 
  saveStoredDataAsync,
  exportDataAsJSON, 
  importDataFromJSON, 
  resetToDefaults, 
  formatCurrency, 
  toBengaliNumber,
  getLastSavedTime
} from '../utils/storage';
import { 
  MONTHS_NAME_MAP, 
  getMemberMonthPayment, 
  calculateMemberYearTotal, 
  calculateMemberAllTotal 
} from './MemberList';
import { saveSocietyCloudData, fetchSocietyCloudData } from '../firebase';
import { compressAndReadFile } from '../utils/imageHelper';
import { SOCIETY_RULES, COMMITTEE_MEMBERS } from '../data/initialData';
import { 
  ShieldCheck, 
  Landmark, 
  Users, 
  Download, 
  Upload, 
  RefreshCw, 
  Printer, 
  Edit3, 
  Check, 
  Plus, 
  Trash2, 
  Save, 
  Clock, 
  FileText, 
  AlertTriangle, 
  BookOpen, 
  Phone, 
  Building, 
  CreditCard, 
  Bell, 
  X, 
  Smartphone, 
  Info, 
  Calendar, 
  Layers, 
  TrendingUp,
  Camera,
  User,
  Image as ImageIcon,
  Cloud,
  Lock,
  KeyRound,
  Coins
} from 'lucide-react';

interface AdminDashboardProps {
  data: SocietyData;
  onDataUpdated: (newData: SocietyData) => void;
  onLogout: () => void;
  onNavigate?: (tab: string) => void;
}

type TabType = 'bank' | 'rules' | 'society' | 'committee' | 'balance' | 'members' | 'expenses' | 'notices' | 'backup';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  data,
  onDataUpdated,
  onLogout,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('bank');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  // Cloud Sync Status & Actions
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);

  const handleForceUploadToCloud = async () => {
    setIsSyncingCloud(true);
    try {
      const res = await saveStoredDataAsync(data);
      if (res.success) {
        showNotification('success', 'সমিতির যাবতীয় ডাটা গুগল ফায়ারবেস ক্লাউডে সফলভাবে সংরক্ষিত হয়েছে!');
      } else {
        showNotification('error', `ক্লাউডে সংরক্ষণে সমস্যা হয়েছে: ${res.error || 'Unknown error'}`);
      }
    } finally {
      setIsSyncingCloud(false);
    }
  };

  const handleForceDownloadFromCloud = async () => {
    setIsSyncingCloud(true);
    try {
      const cloudData = await fetchSocietyCloudData();
      if (cloudData) {
        saveStoredData(cloudData);
        onDataUpdated(cloudData);
        showNotification('success', 'গুগল ফায়ারবেস ক্লাউড থেকে সর্বশেষ ডাটা সফলভাবে ডাউনলোড ও আপডেট হয়েছে!');
      } else {
        showNotification('error', 'ক্লাউডে কোনো সংরক্ষিত ডাটা পাওয়া যায়নি!');
      }
    } catch (err: any) {
      showNotification('error', `ক্লাউড ডাটা আনতে সমস্যা হয়েছে: ${err.message || 'Error'}`);
    } finally {
      setIsSyncingCloud(false);
    }
  };

  // Admin Security Password State
  const [securityForm, setSecurityForm] = useState({
    username: data.adminSecurity?.username || 'admin',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    const currentPass = data.adminSecurity?.password || 'vaiibondhu113';
    if (securityForm.currentPassword !== currentPass) {
      showNotification('error', 'বর্তমান পাসওয়ার্ডটি সঠিক নয়!');
      return;
    }
    if (securityForm.newPassword.length < 4) {
      showNotification('error', 'নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে!');
      return;
    }
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      showNotification('error', 'নতুন পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মেলেনি!');
      return;
    }

    const updated: SocietyData = {
      ...data,
      adminSecurity: {
        username: securityForm.username.trim() || 'admin',
        password: securityForm.newPassword.trim()
      }
    };
    saveStoredData(updated);
    onDataUpdated(updated);
    showNotification('success', 'অ্যাডমিন ইউজারনেম ও পাসওয়ার্ড সফলভাবে পরিবর্তিত এবং ফায়ারবেস ক্লাউডে সংরক্ষিত হয়েছে!');
    setShowSecurityModal(false);
    setSecurityForm({
      username: updated.adminSecurity?.username || 'admin',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  // -------------------------------------------------------------
  // 1. BANK & MOBILE BANKING STATE
  // -------------------------------------------------------------
  const [bankForm, setBankForm] = useState({
    bankName: data.bankAccount?.bankName || 'জনতা ব্যাংক লিমিটেড',
    accountName: data.bankAccount?.accountName || 'ভাই-বন্ধু সমবায় সমিতি',
    accountNumber: data.bankAccount?.accountNumber || '3489101089241',
    branch: data.bankAccount?.branch || 'ছেঙ্গারচর বাজার শাখা, মতলব উত্তর, চাঁদপুর',
    routingNumber: data.bankAccount?.routingNumber || '175130452'
  });

  const [bkashList, setBkashList] = useState(data.bkashNumbers || []);
  const [nagadList, setNagadList] = useState(data.nagadNumbers || []);

  const [newBkash, setNewBkash] = useState({ name: '', number: '', role: 'ক্যাশিয়ার', type: 'পার্সোনাল / বিকাশ' });
  const [showAddBkash, setShowAddBkash] = useState(false);

  const [newNagad, setNewNagad] = useState({ name: '', number: '', role: 'ক্যাশিয়ার', type: 'পার্সোনাল / নগদ' });
  const [showAddNagad, setShowAddNagad] = useState(false);

  const handleSaveBankDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SocietyData = {
      ...data,
      bankAccount: { ...bankForm },
      bkashNumbers: bkashList,
      nagadNumbers: nagadList
    };
    saveStoredData(updated);
    onDataUpdated(updated);
    showNotification('success', 'ব্যাংক ও মোবাইল ব্যাংকিং হিসাবের তথ্য সফলভাবে আপডেট হয়েছে!');
  };

  const handleAddBkash = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBkash.name || !newBkash.number) return;
    const updatedList = [...bkashList, { ...newBkash }];
    setBkashList(updatedList);
    const updated: SocietyData = {
      ...data,
      bkashNumbers: updatedList
    };
    saveStoredData(updated);
    onDataUpdated(updated);
    setNewBkash({ name: '', number: '', role: 'ক্যাশিয়ার', type: 'পার্সোনাল / বিকাশ' });
    setShowAddBkash(false);
    showNotification('success', 'নতুন বিকাশ নম্বর যুক্ত হয়েছে!');
  };

  const handleDeleteBkash = (idx: number) => {
    const updatedList = bkashList.filter((_, i) => i !== idx);
    setBkashList(updatedList);
    const updated: SocietyData = {
      ...data,
      bkashNumbers: updatedList
    };
    saveStoredData(updated);
    onDataUpdated(updated);
    showNotification('success', 'বিকাশ নম্বরটি মুছে ফেলা হয়েছে!');
  };

  const handleAddNagad = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNagad.name || !newNagad.number) return;
    const updatedList = [...nagadList, { ...newNagad }];
    setNagadList(updatedList);
    const updated: SocietyData = {
      ...data,
      nagadNumbers: updatedList
    };
    saveStoredData(updated);
    onDataUpdated(updated);
    setNewNagad({ name: '', number: '', role: 'ক্যাশিয়ার', type: 'পার্সোনাল / নগদ' });
    setShowAddNagad(false);
    showNotification('success', 'নতুন নগদ নম্বর যুক্ত হয়েছে!');
  };

  const handleDeleteNagad = (idx: number) => {
    const updatedList = nagadList.filter((_, i) => i !== idx);
    setNagadList(updatedList);
    const updated: SocietyData = {
      ...data,
      nagadNumbers: updatedList
    };
    saveStoredData(updated);
    onDataUpdated(updated);
    showNotification('success', 'নগদ নম্বরটি মুছে ফেলা হয়েছে!');
  };

  // -------------------------------------------------------------
  // 2. SOCIETY PROFILE & INFO STATE
  // -------------------------------------------------------------
  const [societyForm, setSocietyForm] = useState({
    societyName: data.societyName || 'ভাই-বন্ধু সমবায় সমিতি',
    tagline: data.tagline || 'একতা সাথে থাকি, উন্নতির পথে',
    motto: data.motto || 'সমবায়ে শক্তি সবার জন্য সমৃদ্ধি • সমবায়ে গড়ি, সমৃদ্ধ ভবিষ্যৎ',
    establishedYear: data.establishedYear || '২০২৫',
    address: data.address || 'মধ্য মুক্তির কান্দি, পাঠান বাজার, মতলব উত্তর, চাঁদপুর | ২০২৫',
    monthlyFeeDefault: data.monthlyFeeDefault || 2500
  });

  // Sync societyForm if incoming data updates
  React.useEffect(() => {
    setSocietyForm({
      societyName: data.societyName || 'ভাই-বন্ধু সমবায় সমিতি',
      tagline: data.tagline || 'একতা সাথে থাকি, উন্নতির পথে',
      motto: data.motto || 'সমবায়ে শক্তি সবার জন্য সমৃদ্ধি • সমবায়ে গড়ি, সমৃদ্ধ ভবিষ্যৎ',
      establishedYear: data.establishedYear || '২০২৫',
      address: data.address || 'মধ্য মুক্তির কান্দি, পাঠান বাজার, মতলব উত্তর, চাঁদপুর | ২০২৫',
      monthlyFeeDefault: data.monthlyFeeDefault || 2500
    });
  }, [data.societyName, data.tagline, data.motto, data.establishedYear, data.address, data.monthlyFeeDefault]);

  const handleSaveSocietyInfo = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SocietyData = {
      ...data,
      ...societyForm,
      monthlyFeeDefault: Number(societyForm.monthlyFeeDefault)
    };
    saveStoredData(updated);
    onDataUpdated(updated);
    showNotification('success', 'সমিতির নাম ও তথ্য সফলভাবে আপডেট হয়েছে!');
  };

  // -------------------------------------------------------------
  // 3. RULES & POLICIES STATE
  // -------------------------------------------------------------
  const currentRules: SocietyRule[] = data.rules && data.rules.length > 0 ? data.rules : SOCIETY_RULES;
  const [editingRule, setEditingRule] = useState<SocietyRule | null>(null);
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [newRuleForm, setNewRuleForm] = useState<SocietyRule>({
    no: currentRules.length + 1,
    title: '',
    description: '',
    highlight: ''
  });

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;

    const updatedRules = currentRules.map(r => r.no === editingRule.no ? editingRule : r);
    const updated: SocietyData = {
      ...data,
      rules: updatedRules
    };
    saveStoredData(updated);
    onDataUpdated(updated);
    setEditingRule(null);
    showNotification('success', `ধারা নং ${toBengaliNumber(editingRule.no)} সফলভাবে আপডেট হয়েছে!`);
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleForm.title || !newRuleForm.description) return;

    const updatedRules = [...currentRules, { ...newRuleForm }];
    const updated: SocietyData = {
      ...data,
      rules: updatedRules
    };
    saveStoredData(updated);
    onDataUpdated(updated);
    setIsAddingRule(false);
    setNewRuleForm({
      no: updatedRules.length + 1,
      title: '',
      description: '',
      highlight: ''
    });
    showNotification('success', 'নতুন নিয়ম ধারা সফলভাবে যুক্ত হয়েছে!');
  };

  const handleDeleteRule = (ruleNo: number) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে ধারা নং ${toBengaliNumber(ruleNo)} মুছে ফেলতে চান?`)) return;

    const updatedRules = currentRules.filter(r => r.no !== ruleNo);
    const updated: SocietyData = {
      ...data,
      rules: updatedRules
    };
    saveStoredData(updated);
    onDataUpdated(updated);
    showNotification('success', `ধারা নং ${toBengaliNumber(ruleNo)} মুছে ফেলা হয়েছে!`);
  };

  // -------------------------------------------------------------
  // 4. COMMITTEE MANAGEMENT STATE
  // -------------------------------------------------------------
  const currentCommittee: CommitteeMember[] = data.committee && data.committee.length > 0 ? data.committee : COMMITTEE_MEMBERS;
  const [editingCommittee, setEditingCommittee] = useState<CommitteeMember | null>(null);
  const [isAddingCommittee, setIsAddingCommittee] = useState(false);
  const [newCommitteeForm, setNewCommitteeForm] = useState<CommitteeMember>({
    id: `com-${Date.now()}`,
    name: '',
    role: '',
    phone: '',
    badge: 'কমিটি সদস্য',
    type: 'executive'
  });

  const handleSaveCommitteeMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCommittee) return;

    const updatedCommittee = currentCommittee.map(c => c.id === editingCommittee.id ? editingCommittee : c);
    const updated: SocietyData = {
      ...data,
      committee: updatedCommittee
    };
    saveStoredData(updated);
    onDataUpdated(updated);
    setEditingCommittee(null);
    showNotification('success', `${editingCommittee.name} এর পদবী ও তথ্য আপডেট হয়েছে!`);
  };

  const handleCreateCommitteeMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommitteeForm.name || !newCommitteeForm.role) return;

    const updatedCommittee = [...currentCommittee, { ...newCommitteeForm, id: `com-${Date.now()}` }];
    const updated: SocietyData = {
      ...data,
      committee: updatedCommittee
    };
    saveStoredData(updated);
    onDataUpdated(updated);
    setIsAddingCommittee(false);
    setNewCommitteeForm({
      id: `com-${Date.now()}`,
      name: '',
      role: '',
      phone: '',
      badge: 'কমিটি সদস্য',
      type: 'executive'
    });
    showNotification('success', 'নতুন কর্মকর্তা/উপদেষ্টা যুক্ত হয়েছে!');
  };

  const handleDeleteCommitteeMember = (id: string, name: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে ${name} কে কমিটি থেকে অপসারণ করতে চান?`)) return;

    const updatedCommittee = currentCommittee.filter(c => c.id !== id);
    const updated: SocietyData = {
      ...data,
      committee: updatedCommittee
    };
    saveStoredData(updated);
    onDataUpdated(updated);
    showNotification('success', `${name} কে কমিটি থেকে অপসারণ করা হয়েছে!`);
  };

  // -------------------------------------------------------------
  // 5. BANK BALANCE & CASH STATE
  // -------------------------------------------------------------
  const [newBankBalance, setNewBankBalance] = useState<number>(data.currentBankBalance);
  const [newCashInHand, setNewCashInHand] = useState<number>(data.cashInHand || 0);

  const handleUpdateBalance = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SocietyData = {
      ...data,
      currentBankBalance: Number(newBankBalance),
      cashInHand: Number(newCashInHand)
    };
    saveStoredData(updated);
    onDataUpdated(updated);
    showNotification('success', 'ব্যাংক ব্যালেন্স ও ক্যাশ তহবিল সফলভাবে আপডেট হয়েছে!');
  };

  // -------------------------------------------------------------
  // 6. MEMBERS CRUD STATE
  // -------------------------------------------------------------
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberPhoto, setNewMemberPhoto] = useState<string | null>(null);
  const newMemberPhotoInputRef = useRef<HTMLInputElement>(null);
  const editMemberPhotoInputRef = useRef<HTMLInputElement>(null);

  const handleNewMemberPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressAndReadFile(file, 350, 350, 0.85);
      setNewMemberPhoto(dataUrl);
    } catch (err: any) {
      alert(err.message || 'ছবি আপলোড করতে সমস্যা হয়েছে।');
    }
  };

  const handleEditMemberPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingMember) return;
    try {
      const dataUrl = await compressAndReadFile(file, 350, 350, 0.85);
      setEditingMember({ ...editingMember, photoUrl: dataUrl });
    } catch (err: any) {
      alert(err.message || 'ছবি আপলোড করতে সমস্যা হয়েছে।');
    }
  };

  const [newMemberForm, setNewMemberForm] = useState<Partial<Member>>({
    name: '',
    phone: '',
    role: 'সদস্য',
    august: 2500,
    september: 2500,
    october: null,
    fine: 0,
    downPayment: 0,
    notes: ''
  });

  // Auto-detect running calendar month (e.g. '09' for September)
  const currentCalendarMonthKey = String(new Date().getMonth() + 1).padStart(2, '0');
  const defaultBulkTarget = `${currentCalendarMonthKey}_2026`; // e.g. '09_2026' for September 2026

  // Bulk Fast Fee Update State - DEFAULT TO RUNNING 2026 MONTH!
  const [bulkTargetField, setBulkTargetField] = useState<string>(defaultBulkTarget);
  const [bulkCustomInput, setBulkCustomInput] = useState<string>('');

  // Admin Members Table View Year & Month state - DEFAULT TO 2026 RUNNING MONTH!
  const [adminMemberYear, setAdminMemberYear] = useState<2025 | 2026>(2026);
  const [adminMemberMonth, setAdminMemberMonth] = useState<string>(currentCalendarMonthKey);

  const handleQuickUpdateMemberPayment = (memberId: string, yr: number, monthKey: string, amount: number | null) => {
    const updatedMembers = data.members.map((m) => {
      if (m.id !== memberId) return m;

      if (yr === 2026) {
        return {
          ...m,
          payments2026: {
            ...(m.payments2026 || {}),
            [monthKey]: amount
          }
        };
      } else {
        return {
          ...m,
          payments2025: {
            ...(m.payments2025 || {}),
            [monthKey]: amount
          },
          august: monthKey === '08' ? amount : m.august,
          september: monthKey === '09' ? amount : m.september,
          october: monthKey === '10' ? amount : m.october
        };
      }
    });

    const updated: SocietyData = {
      ...data,
      members: updatedMembers,
      lastUpdated: new Date().toISOString()
    };

    saveStoredData(updated);
    onDataUpdated(updated);
    showNotification('success', `সদস্যের হিসাব তাৎক্ষণিক আপডেট করা হয়েছে!`);
  };

  const handleApplyBulkToAll = (amount: number | null, fieldName: string) => {
    const amtStr = amount !== null && amount > 0 ? `${amount} ৳` : '০ ৳ (বাকি)';
    if (!window.confirm(`আপনি কি নিশ্চিত যে সকল ${data.members.length} জন সদস্যের "${fieldName}" হিসেবে ${amtStr} নির্ধারণ করতে চান? এটি ফায়ারবেসে ক্লাউডেও সাথে সাথে সংরক্ষিত হবে।`)) {
      return;
    }

    const updatedMembers = data.members.map((m) => {
      if (bulkTargetField === 'dp1_2025') {
        const val = amount || 0;
        const cur2 = m.downPayment2025_2 || 0;
        return { ...m, downPayment2025_1: val, downPayment: val + cur2 };
      }
      if (bulkTargetField === 'dp2_2025') {
        const cur1 = m.downPayment2025_1 !== undefined ? m.downPayment2025_1 : (m.downPayment || 0);
        const val = amount || 0;
        return { ...m, downPayment2025_2: val, downPayment: cur1 + val };
      }
      if (bulkTargetField === 'fine_2025') {
        return { ...m, fine2025: amount || 0, fine: amount || 0 };
      }
      if (bulkTargetField === 'dp1_2026') {
        return { ...m, downPayment2026_1: amount || 0 };
      }
      if (bulkTargetField === 'dp2_2026') {
        return { ...m, downPayment2026_2: amount || 0 };
      }
      if (bulkTargetField === 'fine_2026') {
        return { ...m, fine2026: amount || 0 };
      }
      if (bulkTargetField.endsWith('_2026')) {
        const monthKey = bulkTargetField.replace('_2026', '');
        return {
          ...m,
          payments2026: {
            ...(m.payments2026 || {}),
            [monthKey]: amount
          }
        };
      }
      // Otherwise 2025 month
      const monthKey = bulkTargetField;
      return {
        ...m,
        payments2025: {
          ...(m.payments2025 || {}),
          [monthKey]: amount
        },
        august: monthKey === '08' ? amount : m.august,
        september: monthKey === '09' ? amount : m.september,
        october: monthKey === '10' ? amount : m.october
      };
    });

    const updated: SocietyData = {
      ...data,
      members: updatedMembers,
      lastUpdated: new Date().toISOString()
    };

    saveStoredData(updated);
    onDataUpdated(updated);
    showNotification('success', `সফল: সকল ${data.members.length} জন সদস্যের "${fieldName}" এক ক্লিকে ${amtStr} সেট করা হয়েছে!`);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    const syncedPayments2025 = {
      ...(editingMember.payments2025 || {}),
      '08': editingMember.august,
      '09': editingMember.september,
      '10': editingMember.october
    };

    const finalMember: Member = {
      ...editingMember,
      payments2025: syncedPayments2025
    };

    const updatedMembers = data.members.map((m) =>
      m.id === finalMember.id ? finalMember : m
    );

    const updated: SocietyData = {
      ...data,
      members: updatedMembers
    };

    saveStoredData(updated);
    onDataUpdated(updated);
    setEditingMember(null);
    showNotification('success', `${editingMember.name} এর হিসাব সফলভাবে সংরক্ষিত হয়েছে!`);
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberForm.name) return;

    const nextRoll = data.members.length + 1;
    const nextId = `VB2025${String(nextRoll).padStart(4, '0')}`;

    const newMember: Member = {
      id: nextId,
      rollNo: nextRoll,
      name: newMemberForm.name || '',
      phone: newMemberForm.phone || '01...',
      role: newMemberForm.role || 'সদস্য',
      august: newMemberForm.august !== undefined ? newMemberForm.august : 2500,
      september: newMemberForm.september !== undefined ? newMemberForm.september : 2500,
      october: newMemberForm.october || null,
      fine: Number(newMemberForm.fine || 0),
      downPayment: Number(newMemberForm.downPayment || 0),
      joinedDate: new Date().toISOString().slice(0, 10),
      notes: newMemberForm.notes || 'সদস্য তালিকায় নতুন নিবন্ধিত',
      photoUrl: newMemberPhoto || undefined
    };

    const updatedMembers = [...data.members, newMember];
    const updated: SocietyData = {
      ...data,
      members: updatedMembers
    };

    saveStoredData(updated);
    onDataUpdated(updated);
    setIsAddingMember(false);
    setNewMemberPhoto(null);
    setNewMemberForm({
      name: '',
      phone: '',
      role: 'সদস্য',
      august: 2500,
      september: 2500,
      october: null,
      fine: 0,
      downPayment: 0,
      notes: ''
    });
    showNotification('success', `নতুন সদস্য ${newMember.name} (আইডি: ${newMember.id}) যুক্ত হয়েছে!`);
  };

  const handleDeleteMember = (memberId: string, memberName: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে সদস্য ${memberName} (আইডি: ${memberId}) কে ডিলিট করতে চান?`)) return;

    const updatedMembers = data.members.filter(m => m.id !== memberId);
    const updated: SocietyData = {
      ...data,
      members: updatedMembers
    };

    saveStoredData(updated);
    onDataUpdated(updated);
    showNotification('success', `সদস্য ${memberName} এর নাম মুছে ফেলা হয়েছে!`);
  };

  // -------------------------------------------------------------
  // 7. EXPENSES STATE
  // -------------------------------------------------------------
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState<number>(0);
  const [expenseCategory, setExpenseCategory] = useState('সাধারণ খরচ');

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle.trim() || expenseAmount <= 0) return;

    const newExpense: ExpenseItem = {
      id: `exp-${Date.now()}`,
      title: expenseTitle.trim(),
      amount: Number(expenseAmount),
      date: new Date().toLocaleDateString('bn-BD'),
      category: expenseCategory,
      recordedBy: 'সুপার অ্যাডমিন'
    };

    const updated: SocietyData = {
      ...data,
      expenses: [newExpense, ...data.expenses],
      currentBankBalance: Math.max(0, data.currentBankBalance - Number(expenseAmount))
    };

    saveStoredData(updated);
    onDataUpdated(updated);
    setExpenseTitle('');
    setExpenseAmount(0);
    showNotification('success', 'নতুন খরচ যুক্ত হয়েছে এবং ব্যালেন্স সমন্বয় করা হয়েছে!');
  };

  const handleDeleteExpense = (id: string, amount: number) => {
    if (!window.confirm('আপনি কি এই খরচের রেকর্ডটি ডিলিট করতে চান?')) return;

    const updated: SocietyData = {
      ...data,
      expenses: data.expenses.filter(e => e.id !== id),
      currentBankBalance: data.currentBankBalance + amount
    };

    saveStoredData(updated);
    onDataUpdated(updated);
    showNotification('success', 'খরচ মুছে ফেলা হয়েছে এবং ব্যালেন্সে ফেরত এসেছে!');
  };

  // -------------------------------------------------------------
  // 8. NOTICES STATE
  // -------------------------------------------------------------
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticePriority, setNoticePriority] = useState<'normal' | 'urgent'>('normal');

  const handleAddNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) return;

    const newNotice: Notice = {
      id: `not-${Date.now()}`,
      title: noticeTitle.trim(),
      content: noticeContent.trim(),
      date: new Date().toISOString().slice(0, 10),
      priority: noticePriority
    };

    const updated: SocietyData = {
      ...data,
      notices: [newNotice, ...(data.notices || [])]
    };

    saveStoredData(updated);
    onDataUpdated(updated);
    setNoticeTitle('');
    setNoticeContent('');
    showNotification('success', 'নতুন নোটিশ সফলভাবে জারি করা হয়েছে!');
  };

  const handleDeleteNotice = (id: string) => {
    const updated: SocietyData = {
      ...data,
      notices: (data.notices || []).filter(n => n.id !== id)
    };
    saveStoredData(updated);
    onDataUpdated(updated);
    showNotification('success', 'নোটিশ মুছে ফেলা হয়েছে!');
  };

  // -------------------------------------------------------------
  // 9. BACKUP / IMPORT / RESET
  // -------------------------------------------------------------
  const handleExportJSON = () => {
    exportDataAsJSON(data);
    showNotification('success', 'সমিতির পূর্ণ ডাটাবেজ ব্যাকআপ JSON ফাইল ডাউনলোড হয়েছে!');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    importDataFromJSON(
      file,
      (importedData) => {
        onDataUpdated(importedData);
        showNotification('success', 'ব্যাকআপ ফাইল থেকে সফলভাবে ডাটা রিস্টোর হয়েছে!');
      },
      (error) => {
        showNotification('error', `ত্রুটি: ${error}`);
      }
    );
  };

  const handleReset = () => {
    if (window.confirm('সতর্কতা: আপনি কি নিশ্চিত যে সমস্ত ডেটা আদি অবস্থায় ফিরিয়ে নিতে চান?')) {
      const resetData = resetToDefaults();
      onDataUpdated(resetData);
      showNotification('success', 'সমস্ত ডেটা সফলভাবে আদি অবস্থায় ফিরিয়ে নেওয়া হয়েছে!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-emerald-950 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-amber-500 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-400/40">
            <ShieldCheck className="w-4 h-4" /> সুপার অ্যাডমিন কন্ট্রোল প্যানেল
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white mt-2">
            সমিতি সেন্ট্রাল ম্যানেজমেন্ট
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 mt-1 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-emerald-300 font-semibold bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> ক্লাউড ডাটাবেস সক্রিয়
            </span>
            <span>•</span>
            <span className="font-mono text-stone-200">সর্বশেষ আপডেট: {getLastSavedTime()}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleForceUploadToCloud}
            disabled={isSyncingCloud}
            className="px-4 py-2.5 bg-sky-700 hover:bg-sky-600 disabled:opacity-60 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer border border-sky-500/40"
            title="সমিতির সমস্ত হিসাব গুগল ক্লাউড ডাটাবেসে সেভ করুন"
          >
            <Cloud className={`w-4 h-4 text-sky-200 ${isSyncingCloud ? 'animate-spin' : ''}`} />
            {isSyncingCloud ? 'ক্লাউড সিঙ্ক হচ্ছে...' : 'ক্লাউডে সেভ'}
          </button>

          <button
            onClick={handleForceDownloadFromCloud}
            disabled={isSyncingCloud}
            className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 disabled:opacity-60 text-stone-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer border border-stone-600"
            title="গুগল ফায়ারবেস ক্লাউড থেকে সর্বশেষ ডাটা ডাউনলোড করুন"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-stone-300 ${isSyncingCloud ? 'animate-spin' : ''}`} />
            ক্লাউড থেকে রিলোড
          </button>

          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-300" /> সম্পূর্ণ অডিট PDF প্রিন্ট
          </button>

          <button
            onClick={handleExportJSON}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" /> JSON ব্যাকআপ
          </button>

          <button
            onClick={() => setShowSecurityModal(true)}
            className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold border border-emerald-600 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Lock className="w-4 h-4 text-amber-300" /> পাসওয়ার্ড পরিবর্তন
          </button>

          <button
            onClick={onLogout}
            className="px-4 py-2.5 bg-red-950 hover:bg-red-900 text-red-200 rounded-xl text-xs font-bold border border-red-500/40 transition-colors cursor-pointer"
          >
            লগআউট
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md animate-in fade-in ${
          notification.type === 'success' 
            ? 'bg-emerald-100 border-2 border-emerald-500 text-emerald-950'
            : 'bg-red-100 border-2 border-red-500 text-red-950'
        }`}>
          {notification.type === 'success' ? <Check className="w-5 h-5 text-emerald-700" /> : <AlertTriangle className="w-5 h-5 text-red-600" />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Modern Scrolling Tabs */}
      <div className="flex border-b border-stone-200 overflow-x-auto gap-1 pb-1">
        
        <button
          onClick={() => setActiveTab('bank')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'bank'
              ? 'bg-emerald-900 text-white shadow-md'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <Landmark className="w-4 h-4 text-amber-400" /> ব্যাংক ও এমএফএস
        </button>

        <button
          onClick={() => setActiveTab('society')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'society'
              ? 'bg-emerald-900 text-white shadow-md'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <Building className="w-4 h-4 text-emerald-300" /> সমিতির তথ্য ও নাম
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'rules'
              ? 'bg-emerald-900 text-white shadow-md'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <BookOpen className="w-4 h-4 text-amber-300" /> সমিতির নিয়ম নীতিমালা ({toBengaliNumber(currentRules.length)})
        </button>

        <button
          onClick={() => setActiveTab('committee')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'committee'
              ? 'bg-emerald-900 text-white shadow-md'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-300" /> কমিটি পরিষদ ({toBengaliNumber(currentCommittee.length)})
        </button>

        <button
          onClick={() => setActiveTab('balance')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'balance'
              ? 'bg-emerald-900 text-white shadow-md'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <CreditCard className="w-4 h-4 text-amber-300" /> তহবিল ও ব্যালেন্স
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'members'
              ? 'bg-emerald-900 text-white shadow-md'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-300" /> সদস্য তালিকা ও খাতা ({toBengaliNumber(data.members.length)})
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'expenses'
              ? 'bg-emerald-900 text-white shadow-md'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <FileText className="w-4 h-4 text-amber-300" /> খরচের খাতা ({toBengaliNumber(data.expenses.length)})
        </button>

        <button
          onClick={() => setActiveTab('notices')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'notices'
              ? 'bg-emerald-900 text-white shadow-md'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <Bell className="w-4 h-4 text-emerald-300" /> নোটিশ বোর্ড
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'backup'
              ? 'bg-emerald-900 text-white shadow-md'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <Download className="w-4 h-4 text-amber-300" /> ব্যাকআপ ও রিস্টোর
        </button>

      </div>

      {/* ======================================================== */}
      {/* TAB 1: BANK & MOBILE BANKING (USER EXPLICITLY REQUESTED) */}
      {/* ======================================================== */}
      {activeTab === 'bank' && (
        <div className="space-y-8">
          
          {/* Main Bank Account Edit Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200 shadow-md space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div>
                <h3 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-emerald-700" />
                  ব্যাংক একাউন্ট তথ্য পরিবর্তন (Bank Account Details)
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  এখানে যা পরিবর্তন করবেন তা সরাসরি পেমেন্ট পেজ, হোম পেজ ও ব্যাংক ভাউচারে দৃশ্যমান হবে
                </p>
              </div>
              <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-3 py-1 rounded-full border border-emerald-300">
                অফিসিয়াল ব্যাংক হিসাব
              </span>
            </div>

            <form onSubmit={handleSaveBankDetails} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    ব্যাংকের পূর্ণ নাম *
                  </label>
                  <input
                    type="text"
                    value={bankForm.bankName}
                    onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                    placeholder="যেমন: জনতা ব্যাংক লিমিটেড"
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 bg-stone-50/50 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    হিসাবের নাম (Account Title) *
                  </label>
                  <input
                    type="text"
                    value={bankForm.accountName}
                    onChange={(e) => setBankForm({ ...bankForm, accountName: e.target.value })}
                    placeholder="যেমন: ভাই-বন্ধু সমবায় সমিতি"
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 bg-stone-50/50 text-sm font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    ব্যাংক একাউন্ট নম্বর (Account Number) *
                  </label>
                  <input
                    type="text"
                    value={bankForm.accountNumber}
                    onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                    placeholder="যেমন: 3489101089241"
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 bg-stone-50/50 font-mono text-sm font-bold text-emerald-950"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    শাখার নাম (Branch Name) *
                  </label>
                  <input
                    type="text"
                    value={bankForm.branch}
                    onChange={(e) => setBankForm({ ...bankForm, branch: e.target.value })}
                    placeholder="যেমন: ছেঙ্গারচর বাজার শাখা, মতলব উত্তর, চাঁদপুর"
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 bg-stone-50/50 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    রাউটিং নম্বর (Routing Number)
                  </label>
                  <input
                    type="text"
                    value={bankForm.routingNumber}
                    onChange={(e) => setBankForm({ ...bankForm, routingNumber: e.target.value })}
                    placeholder="যেমন: 175130452"
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 bg-stone-50/50 font-mono text-sm"
                  />
                </div>

              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  ব্যাংক হিসাবের তথ্য সেভ করুন
                </button>
              </div>
            </form>
          </div>

          {/* Mobile Banking (bKash & Nagad) Management */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* bKash Management */}
            <div className="bg-white rounded-3xl p-6 border-2 border-stone-200 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-pink-700 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" /> বিকাশ (bKash) নাম্বার পরিচালনা
                  </h4>
                  <p className="text-xs text-stone-500">চাঁদা জমার অনুমোদিত বিকাশ নম্বর</p>
                </div>
                <button
                  onClick={() => setShowAddBkash(!showAddBkash)}
                  className="px-3 py-1.5 bg-pink-100 hover:bg-pink-200 text-pink-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> নতুন যোগ করুন
                </button>
              </div>

              {showAddBkash && (
                <form onSubmit={handleAddBkash} className="bg-pink-50/60 p-4 rounded-2xl border border-pink-200 space-y-3">
                  <h5 className="text-xs font-bold text-pink-900">নতুন বিকাশ নম্বর যোগ করুন</h5>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-stone-600 mb-1">নাম *</label>
                      <input
                        type="text"
                        value={newBkash.name}
                        onChange={(e) => setNewBkash({ ...newBkash, name: e.target.value })}
                        placeholder="যেমন: হাছান মাঝি"
                        className="w-full p-2 rounded-lg border border-stone-300 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-stone-600 mb-1">মোবাইল নম্বর *</label>
                      <input
                        type="text"
                        value={newBkash.number}
                        onChange={(e) => setNewBkash({ ...newBkash, number: e.target.value })}
                        placeholder="যেমন: 018..."
                        className="w-full p-2 rounded-lg border border-stone-300 font-mono bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-stone-600 mb-1">পদবী</label>
                      <input
                        type="text"
                        value={newBkash.role}
                        onChange={(e) => setNewBkash({ ...newBkash, role: e.target.value })}
                        className="w-full p-2 rounded-lg border border-stone-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-600 mb-1">ধরণ</label>
                      <input
                        type="text"
                        value={newBkash.type}
                        onChange={(e) => setNewBkash({ ...newBkash, type: e.target.value })}
                        className="w-full p-2 rounded-lg border border-stone-300 bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddBkash(false)}
                      className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-600 text-xs cursor-pointer"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      যুক্ত করুন
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {bkashList.map((b, idx) => (
                  <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-stone-900">{b.name} <span className="text-stone-500 font-normal">({b.role})</span></p>
                      <p className="font-mono text-emerald-800 font-semibold">{b.number}</p>
                      <span className="text-[10px] text-stone-500">{b.type}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteBkash(idx)}
                      className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Nagad Management */}
            <div className="bg-white rounded-3xl p-6 border-2 border-stone-200 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-amber-700 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" /> নগদ (Nagad) নাম্বার পরিচালনা
                  </h4>
                  <p className="text-xs text-stone-500">চাঁদা জমার অনুমোদিত নগদ নম্বর</p>
                </div>
                <button
                  onClick={() => setShowAddNagad(!showAddNagad)}
                  className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> নতুন যোগ করুন
                </button>
              </div>

              {showAddNagad && (
                <form onSubmit={handleAddNagad} className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 space-y-3">
                  <h5 className="text-xs font-bold text-amber-900">নতুন নগদ নম্বর যোগ করুন</h5>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-stone-600 mb-1">নাম *</label>
                      <input
                        type="text"
                        value={newNagad.name}
                        onChange={(e) => setNewNagad({ ...newNagad, name: e.target.value })}
                        placeholder="যেমন: হাছান মাঝি"
                        className="w-full p-2 rounded-lg border border-stone-300 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-stone-600 mb-1">মোবাইল নম্বর *</label>
                      <input
                        type="text"
                        value={newNagad.number}
                        onChange={(e) => setNewNagad({ ...newNagad, number: e.target.value })}
                        placeholder="যেমন: 018..."
                        className="w-full p-2 rounded-lg border border-stone-300 font-mono bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-stone-600 mb-1">পদবী</label>
                      <input
                        type="text"
                        value={newNagad.role}
                        onChange={(e) => setNewNagad({ ...newNagad, role: e.target.value })}
                        className="w-full p-2 rounded-lg border border-stone-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-600 mb-1">ধরণ</label>
                      <input
                        type="text"
                        value={newNagad.type}
                        onChange={(e) => setNewNagad({ ...newNagad, type: e.target.value })}
                        className="w-full p-2 rounded-lg border border-stone-300 bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddNagad(false)}
                      className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-600 text-xs cursor-pointer"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      যুক্ত করুন
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {nagadList.map((n, idx) => (
                  <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-stone-900">{n.name} <span className="text-stone-500 font-normal">({n.role})</span></p>
                      <p className="font-mono text-emerald-800 font-semibold">{n.number}</p>
                      <span className="text-[10px] text-stone-500">{n.type}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteNagad(idx)}
                      className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: SOCIETY INFO & PROFILE (USER EXPLICITLY REQUESTED) */}
      {/* ======================================================== */}
      {activeTab === 'society' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200 shadow-md space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-200">
            <div>
              <h3 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-emerald-700" />
                সমিতির নাম, স্লোগান ও পরিচিতি পরিবর্তন
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                সমিতির অফিশিয়াল নাম, স্লোগান, ঠিকানা ও নির্ধারিত মাসিক ফি এখান থেকে পরিবর্তন করুন
              </p>
            </div>
            <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full border border-amber-300">
              কেন্দ্রীয় প্রোফাইল
            </span>
          </div>

          <form onSubmit={handleSaveSocietyInfo} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  সমিতির নাম (Society Name) *
                </label>
                <input
                  type="text"
                  value={societyForm.societyName}
                  onChange={(e) => setSocietyForm({ ...societyForm, societyName: e.target.value })}
                  placeholder="যেমন: ভাই-বন্ধু সমবায় সমিতি"
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 text-sm font-bold text-emerald-950"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  মূল স্লোগান (Tagline) *
                </label>
                <input
                  type="text"
                  value={societyForm.tagline}
                  onChange={(e) => setSocietyForm({ ...societyForm, tagline: e.target.value })}
                  placeholder="যেমন: একতা সাথে থাকি, উন্নতির পথে"
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 text-sm font-semibold text-stone-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  নীতিবাক্য / মটো (Motto)
                </label>
                <input
                  type="text"
                  value={societyForm.motto}
                  onChange={(e) => setSocietyForm({ ...societyForm, motto: e.target.value })}
                  placeholder="যেমন: সমবায়ে শক্তি সবার জন্য সমৃদ্ধি"
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  স্থাপিত সাল (Established Year)
                </label>
                <input
                  type="text"
                  value={societyForm.establishedYear}
                  onChange={(e) => setSocietyForm({ ...societyForm, establishedYear: e.target.value })}
                  placeholder="যেমন: ২০২৫"
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  সমিতির কার্যালয়ের পূর্ণ ঠিকানা (Office Address) *
                </label>
                <input
                  type="text"
                  value={societyForm.address}
                  onChange={(e) => setSocietyForm({ ...societyForm, address: e.target.value })}
                  placeholder="যেমন: মধ্য মুক্তির কান্দি, পাঠান বাজার, মতলব উত্তর, চাঁদপুর | ২০২৫"
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  ডিফল্ট মাসিক চাঁদা (টাকা)
                </label>
                <input
                  type="number"
                  value={societyForm.monthlyFeeDefault}
                  onChange={(e) => setSocietyForm({ ...societyForm, monthlyFeeDefault: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 text-sm font-mono font-bold text-emerald-950"
                  required
                />
                <span className="text-[11px] text-stone-500">মাসিক চাঁদা ২,০০০ + সঞ্চয় ৫০০ = ২,৫০০ ৳</span>
              </div>

            </div>

            <div className="pt-3 border-t border-stone-100 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 text-sm cursor-pointer"
              >
                <Save className="w-4 h-4 text-amber-300" />
                সমিতির পরিচিতি আপডেট করুন
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: RULES & POLICIES (USER EXPLICITLY REQUESTED)     */}
      {/* ======================================================== */}
      {activeTab === 'rules' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
            <div>
              <h3 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-700" />
                সমিতির নিয়ম নীতিমালা এডিটর ও পরিচালনা
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                সমিতির প্রত্যেকটি নিয়ম ধারা সরাসরি পরিবর্তন, সংশোধন, নতুন নিয়ম যোগ কিংবা মুছে ফেলা যাবে
              </p>
            </div>
            
            <button
              onClick={() => setIsAddingRule(true)}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-300" /> নতুন ধারা যোগ করুন
            </button>
          </div>

          {/* Add New Rule Form */}
          {isAddingRule && (
            <form onSubmit={handleCreateRule} className="bg-emerald-50/70 p-5 rounded-2xl border-2 border-emerald-400 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-700" /> নতুন নিয়ম ধারা প্রস্তুত করুন
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAddingRule(false)}
                  className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">ধারা নম্বর *</label>
                  <input
                    type="number"
                    value={newRuleForm.no}
                    onChange={(e) => setNewRuleForm({ ...newRuleForm, no: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-bold"
                    required
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block font-bold text-stone-700 mb-1">ধারার শিরোনাম (Title) *</label>
                  <input
                    type="text"
                    value={newRuleForm.title}
                    onChange={(e) => setNewRuleForm({ ...newRuleForm, title: e.target.value })}
                    placeholder="যেমন: মাসিক চাঁদা ও ডাউনপেমেন্ট"
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                    required
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="block font-bold text-stone-700 mb-1">বিস্তারিত নিয়ম বিবরণ (Full Description) *</label>
                  <textarea
                    rows={3}
                    value={newRuleForm.description}
                    onChange={(e) => setNewRuleForm({ ...newRuleForm, description: e.target.value })}
                    placeholder="নিয়মটি বিস্তারিত লিখুন..."
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white resize-none text-xs sm:text-sm"
                    required
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="block font-bold text-stone-700 mb-1">হাইলাইট / মূল পয়েন্ট (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={newRuleForm.highlight || ''}
                    onChange={(e) => setNewRuleForm({ ...newRuleForm, highlight: e.target.value })}
                    placeholder="যেমন: প্রতি মাসের ২০ তারিখের মধ্যে জমা বাধ্যতামূলক"
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingRule(false)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          )}

          {/* List of Rules with Inline Edit Modal */}
          <div className="space-y-3">
            {currentRules.map((rule) => (
              <div 
                key={rule.no} 
                className="p-4 bg-stone-50 hover:bg-stone-100/80 rounded-2xl border border-stone-200 transition-all flex flex-col md:flex-row md:items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-400 text-stone-950 font-black flex items-center justify-center text-sm shrink-0 shadow-xs mt-0.5">
                    {toBengaliNumber(rule.no)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-stone-900 text-sm sm:text-base">
                        {rule.title}
                      </h4>
                      {rule.no === 6 && (
                        <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          কঠোর ধারা
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-sans">
                      {rule.description}
                    </p>
                    {rule.highlight && (
                      <p className="text-[11px] font-bold text-emerald-800 flex items-center gap-1 mt-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        মূল পয়েন্ট: {rule.highlight}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-start">
                  <button
                    onClick={() => setEditingRule({ ...rule })}
                    className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> এডিট
                  </button>

                  <button
                    onClick={() => handleDeleteRule(rule.no)}
                    className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    title="ধারা ডিলিট করুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Edit Rule Modal */}
          {editingRule && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="bg-white w-full max-w-xl rounded-3xl p-6 shadow-2xl border-2 border-emerald-600 space-y-4 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <h4 className="text-base font-bold text-emerald-950 flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-emerald-700" />
                    ধারা নং {toBengaliNumber(editingRule.no)} সম্পাদনা
                  </h4>
                  <button
                    onClick={() => setEditingRule(null)}
                    className="p-1 rounded-full text-stone-400 hover:text-stone-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveRule} className="space-y-4 text-xs sm:text-sm">
                  <div>
                    <label className="block font-bold text-stone-800 mb-1">ধারা নম্বর *</label>
                    <input
                      type="number"
                      value={editingRule.no}
                      onChange={(e) => setEditingRule({ ...editingRule, no: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl border border-stone-300 font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-800 mb-1">ধারার শিরোনাম *</label>
                    <input
                      type="text"
                      value={editingRule.title}
                      onChange={(e) => setEditingRule({ ...editingRule, title: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-stone-300 font-semibold text-stone-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-800 mb-1">বিস্তারিত নিয়ম বিবরণ *</label>
                    <textarea
                      rows={4}
                      value={editingRule.description}
                      onChange={(e) => setEditingRule({ ...editingRule, description: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-stone-300 resize-none leading-relaxed"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-800 mb-1">হাইলাইট / মূল পয়েন্ট</label>
                    <input
                      type="text"
                      value={editingRule.highlight || ''}
                      onChange={(e) => setEditingRule({ ...editingRule, highlight: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-stone-300 text-emerald-950 font-medium"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => setEditingRule(null)}
                      className="px-4 py-2 border border-stone-300 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-4 h-4 text-amber-300" />
                      আপডেট সেভ করুন
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: COMMITTEE MANAGEMENT                              */}
      {/* ======================================================== */}
      {activeTab === 'committee' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
            <div>
              <h3 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                কমিটি পরিষদ ও উপদেষ্টা পরিচালনা
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                কমিটির কর্মকর্তা ও উপদেষ্টামণ্ডলীর নাম, পদবী ও ফোন নম্বর যোগ বা পরিবর্তন করুন
              </p>
            </div>
            
            <button
              onClick={() => setIsAddingCommittee(true)}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-300" /> নতুন কর্মকর্তা যোগ করুন
            </button>
          </div>

          {/* Add Committee Member Form */}
          {isAddingCommittee && (
            <form onSubmit={handleCreateCommitteeMember} className="bg-emerald-50/70 p-5 rounded-2xl border-2 border-emerald-400 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-700" /> নতুন কমিটির সদস্য যুক্ত করুন
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAddingCommittee(false)}
                  className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">কর্মকর্তার নাম *</label>
                  <input
                    type="text"
                    value={newCommitteeForm.name}
                    onChange={(e) => setNewCommitteeForm({ ...newCommitteeForm, name: e.target.value })}
                    placeholder="যেমন: রাজন শিকদার"
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">পদবী (Role) *</label>
                  <input
                    type="text"
                    value={newCommitteeForm.role}
                    onChange={(e) => setNewCommitteeForm({ ...newCommitteeForm, role: e.target.value })}
                    placeholder="যেমন: সভাপতি / সহ-সভাপতি"
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">মোবাইল নম্বর</label>
                  <input
                    type="text"
                    value={newCommitteeForm.phone || ''}
                    onChange={(e) => setNewCommitteeForm({ ...newCommitteeForm, phone: e.target.value })}
                    placeholder="যেমন: 01618629527"
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">ক্যাটাগরি</label>
                  <select
                    value={newCommitteeForm.type}
                    onChange={(e) => setNewCommitteeForm({ ...newCommitteeForm, type: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  >
                    <option value="executive">কার্যনির্বাহী (Executive)</option>
                    <option value="joint">যুগ্ম সম্পাদক (Joint)</option>
                    <option value="cashier">ক্যাশিয়ার / অর্থ (Cashier)</option>
                    <option value="advisor">উপদেষ্টামণ্ডলী (Advisor)</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">ব্যাজ / পরিচিতি</label>
                  <input
                    type="text"
                    value={newCommitteeForm.badge || ''}
                    onChange={(e) => setNewCommitteeForm({ ...newCommitteeForm, badge: e.target.value })}
                    placeholder="যেমন: প্রতিষ্ঠাতা সদস্য"
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingCommittee(false)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  কমিটিতে যুক্ত করুন
                </button>
              </div>
            </form>
          )}

          {/* Committee List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {currentCommittee.map((c) => (
              <div key={c.id} className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between text-xs hover:border-emerald-500 transition-colors">
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md inline-block mb-1">
                    {c.role}
                  </span>
                  <p className="font-bold text-stone-900 text-sm">{c.name}</p>
                  <p className="font-mono text-stone-600 text-xs mt-0.5">{c.phone || 'নম্বর নেই'}</p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditingCommittee({ ...c })}
                    className="p-1.5 text-emerald-800 hover:bg-emerald-100 rounded-lg cursor-pointer"
                    title="এডিট করুন"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCommitteeMember(c.id, c.name)}
                    className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Edit Committee Modal */}
          {editingCommittee && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border-2 border-emerald-600 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <h4 className="text-base font-bold text-emerald-950 flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-emerald-700" />
                    {editingCommittee.name} এর তথ্য সম্পাদনা
                  </h4>
                  <button onClick={() => setEditingCommittee(null)} className="p-1 text-stone-400 hover:text-stone-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveCommitteeMember} className="space-y-4 text-xs sm:text-sm">
                  <div>
                    <label className="block font-bold text-stone-800 mb-1">নাম *</label>
                    <input
                      type="text"
                      value={editingCommittee.name}
                      onChange={(e) => setEditingCommittee({ ...editingCommittee, name: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-stone-300 font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-800 mb-1">পদবী *</label>
                    <input
                      type="text"
                      value={editingCommittee.role}
                      onChange={(e) => setEditingCommittee({ ...editingCommittee, role: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-stone-300 font-semibold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-800 mb-1">মোবাইল নম্বর</label>
                    <input
                      type="text"
                      value={editingCommittee.phone || ''}
                      onChange={(e) => setEditingCommittee({ ...editingCommittee, phone: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-stone-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-800 mb-1">ক্যাটাগরি</label>
                    <select
                      value={editingCommittee.type}
                      onChange={(e) => setEditingCommittee({ ...editingCommittee, type: e.target.value as any })}
                      className="w-full p-2.5 rounded-xl border border-stone-300"
                    >
                      <option value="executive">কার্যনির্বাহী (Executive)</option>
                      <option value="joint">যুগ্ম সম্পাদক (Joint)</option>
                      <option value="cashier">ক্যাশিয়ার / অর্থ (Cashier)</option>
                      <option value="advisor">উপদেষ্টামণ্ডলী (Advisor)</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => setEditingCommittee(null)}
                      className="px-4 py-2 border border-stone-300 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      সেভ করুন
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: BANK BALANCE & CASH RESERVES                      */}
      {/* ======================================================== */}
      {activeTab === 'balance' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200 shadow-md space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-emerald-700" />
              ব্যাংক ব্যালেন্স ও ক্যাশ ইন হ্যান্ড আপডেট
            </h3>
            <p className="text-xs text-stone-500">
              {data.bankAccount?.bankName || 'জনতা ব্যাংক লিমিটেড'} অ্যাকাউন্টে বাস্তব জমার স্থিতি অনুসারে সংখ্যাটি আপডেট করুন
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            
            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-200 space-y-3">
              <span className="text-xs font-bold text-emerald-800 uppercase block">বর্তমানে সিস্টেমে সংরক্ষিত ব্যালেন্স</span>
              <p className="text-3xl font-black text-emerald-950">
                {formatCurrency(data.currentBankBalance)}
              </p>
              <div className="pt-2 border-t border-emerald-200/80 text-xs text-emerald-800 space-y-1">
                <p>হিসাব: <strong>{data.bankAccount?.accountName || data.societyName}</strong></p>
                <p>অ্যাকাউন্ট নং: <strong className="font-mono">{data.bankAccount?.accountNumber}</strong></p>
                <p>ক্যাশ ইন হ্যান্ড: <strong>{formatCurrency(data.cashInHand || 0)}</strong></p>
              </div>
            </div>

            <form onSubmit={handleUpdateBalance} className="space-y-4">
              <div>
                <label className="block font-bold text-stone-800 text-xs sm:text-sm mb-1">
                  {data.bankAccount?.bankName || 'জনতা ব্যাংক লিমিটেড'} রিজার্ভ ব্যালেন্স (টাকা) *
                </label>
                <input
                  type="number"
                  value={newBankBalance}
                  onChange={(e) => setNewBankBalance(Number(e.target.value))}
                  className="w-full p-3 rounded-xl border-2 border-stone-300 focus:border-emerald-600 font-mono font-bold text-lg text-emerald-950 bg-stone-50"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-800 text-xs sm:text-sm mb-1">
                  ক্যাশ ইন হ্যান্ড / হাতে নগদ টাকা
                </label>
                <input
                  type="number"
                  value={newCashInHand}
                  onChange={(e) => setNewCashInHand(Number(e.target.value))}
                  className="w-full p-3 rounded-xl border-2 border-stone-300 focus:border-emerald-600 font-mono font-bold text-lg text-stone-900 bg-stone-50"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-5 h-5 text-amber-300" />
                ব্যালেন্স পরিবর্তন সংরক্ষণ করুন
              </button>
            </form>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: MEMBERS MANAGEMENT & LEDGER                       */}
      {/* ======================================================== */}
      {activeTab === 'members' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
            <div>
              <h3 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-700" />
                সদস্য তালিকা ও চাঁদা আদায় খাতা ({toBengaliNumber(data.members.length)} জন)
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                প্রত্যেক সদস্যের নাম, ফোন, পদবী, আগস্ট ও সেপ্টেম্বর চাঁদা এডিট ও নতুন সদস্য যোগ করুন
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {onNavigate && (
                <>
                  <button
                    onClick={() => onNavigate('year2025')}
                    className="px-3.5 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-emerald-300 shadow-2xs"
                  >
                    <Calendar className="w-4 h-4 text-emerald-800" /> ২০২৫ সালের চার্ট (১২ মাস)
                  </button>
                  <button
                    onClick={() => onNavigate('year2026')}
                    className="px-3.5 py-2 bg-sky-100 hover:bg-sky-200 text-sky-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-sky-300 shadow-2xs"
                  >
                    <TrendingUp className="w-4 h-4 text-sky-800" /> ২০২৬ সালের চার্ট (চলমান)
                  </button>
                </>
              )}
              <button
                onClick={() => setIsAddingMember(true)}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-amber-300" /> নতুন সদস্য যোগ করুন
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* BULK MEMBER FEE UPDATE SHORTCUT BAR                     */}
          {/* ======================================================== */}
          <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-stone-900 text-white p-5 rounded-3xl border-2 border-amber-400 shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-800/80 pb-3">
              <div>
                <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-300" />
                  এক সাথে সবাইকে টাকা দেওয়ার শর্টকাট (Bulk Fast Update)
                </h4>
                <p className="text-[11px] text-emerald-200 mt-0.5">
                  নিচের যেকোনো মাস বা ডাউনপেমেন্ট নির্বাচন করে ২০০০, ২৫০০, ৩০০০ বা কাস্টম টাকা এক ক্লিকে সকল সদস্যের জন্য সেট করুন
                </p>
              </div>
              <span className="text-[10px] bg-amber-400 text-stone-950 font-black px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 self-start sm:self-auto">
                অ্যাডমিন স্পেশাল
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
              {/* Target Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-300 font-bold shrink-0">খাত / মাস:</span>
                <select
                  value={bulkTargetField}
                  onChange={(e) => setBulkTargetField(e.target.value)}
                  className="bg-stone-800 border-2 border-emerald-500 text-white rounded-xl px-3 py-2 text-xs font-bold outline-hidden cursor-pointer"
                  id="adminBulkSelectField"
                >
                  <optgroup label="✨ ২০২৬ সালের হিসাব (চলতি বছর)">
                    <option value="09_2026">সেপ্টেম্বর ২০২৬ মাসিক চাঁদা (চলতি মাস)</option>
                    <option value="01_2026">জানুয়ারি ২০২৬ মাসিক চাঁদা</option>
                    <option value="02_2026">ফেব্রুয়ারি ২০২৬ মাসিক চাঁদা</option>
                    <option value="03_2026">মার্চ ২০২৬ মাসিক চাঁদা</option>
                    <option value="04_2026">এপ্রিল ২০২৬ মাসিক চাঁদা</option>
                    <option value="05_2026">মে ২০২৬ মাসিক চাঁদা</option>
                    <option value="06_2026">জুন ২০২৬ মাসিক চাঁদা</option>
                    <option value="07_2026">জুলাই ২০২৬ মাসিক চাঁদা</option>
                    <option value="08_2026">আগস্ট ২০২৬ মাসিক চাঁদা</option>
                    <option value="10_2026">অক্টোবর ২০২৬ মাসিক চাঁদা</option>
                    <option value="11_2026">নভেম্বর ২০২৬ মাসিক চাঁদা</option>
                    <option value="12_2026">ডিসেম্বর ২০২৬ মাসিক চাঁদা</option>
                    <option value="dp1_2026">১ম ৬ মাস ডাউন পেমেন্ট (২০২৬)</option>
                    <option value="dp2_2026">২য় ৬ মাস ডাউন পেমেন্ট (২০২৬)</option>
                    <option value="fine_2026">বিলম্ব জরিমানা (২০২৬)</option>
                  </optgroup>
                  <optgroup label="২০২৫ সালের হিসাব (বিগত বছর)">
                    <option value="08">আগস্ট ২০২৫ মাসিক চাঁদা</option>
                    <option value="09">সেপ্টেম্বর ২০২৫ মাসিক চাঁদা</option>
                    <option value="10">অক্টোবর ২০২৫ মাসিক চাঁদা</option>
                    <option value="11">নভেম্বর ২০২৫ মাসিক চাঁদা</option>
                    <option value="12">ডিসেম্বর ২০২৫ মাসিক চাঁদা</option>
                    <option value="dp1_2025">১ম ৬ মাস ডাউন পেমেন্ট (২০২৫)</option>
                    <option value="dp2_2025">২য় ৬ মাস ডাউন পেমেন্ট (২০২৫)</option>
                    <option value="fine_2025">বিলম্ব জরিমানা (২০২৫)</option>
                  </optgroup>
                </select>
              </div>

              {/* Fast Shortcut Buttons: 2000, 2500, 3000, 0, Custom */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const sel = document.getElementById('adminBulkSelectField') as HTMLSelectElement;
                    const text = sel ? sel.options[sel.selectedIndex]?.text : 'নির্বাচিত খাত';
                    handleApplyBulkToAll(2000, text);
                  }}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold font-mono transition-all cursor-pointer shadow-xs border border-emerald-500"
                >
                  সবাইকে ২০০০ ৳
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const sel = document.getElementById('adminBulkSelectField') as HTMLSelectElement;
                    const text = sel ? sel.options[sel.selectedIndex]?.text : 'নির্বাচিত খাত';
                    handleApplyBulkToAll(2500, text);
                  }}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-black font-mono transition-all cursor-pointer shadow-md border border-amber-300"
                >
                  সবাইকে ২৫০০ ৳
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const sel = document.getElementById('adminBulkSelectField') as HTMLSelectElement;
                    const text = sel ? sel.options[sel.selectedIndex]?.text : 'নির্বাচিত খাত';
                    handleApplyBulkToAll(3000, text);
                  }}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold font-mono transition-all cursor-pointer shadow-xs border border-sky-400"
                >
                  সবাইকে ৩০০০ ৳
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const sel = document.getElementById('adminBulkSelectField') as HTMLSelectElement;
                    const text = sel ? sel.options[sel.selectedIndex]?.text : 'নির্বাচিত খাত';
                    handleApplyBulkToAll(0, text);
                  }}
                  className="px-2.5 py-1.5 bg-red-900/80 hover:bg-red-800 text-red-200 rounded-xl text-xs font-semibold transition-all cursor-pointer border border-red-700"
                >
                  সবাইকে ০ (বাকি)
                </button>

                {/* Custom Amount */}
                <div className="flex items-center gap-1.5 bg-stone-800/90 p-1 rounded-xl border border-stone-600">
                  <input
                    type="number"
                    value={bulkCustomInput}
                    onChange={(e) => setBulkCustomInput(e.target.value)}
                    placeholder="কাস্টম টাকা"
                    className="w-24 px-2 py-1 bg-stone-950 border border-stone-700 rounded-lg text-xs text-white font-mono font-bold outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!bulkCustomInput || isNaN(Number(bulkCustomInput))) {
                        alert('সঠিক টাকার অঙ্ক লিখুন!');
                        return;
                      }
                      const sel = document.getElementById('adminBulkSelectField') as HTMLSelectElement;
                      const text = sel ? sel.options[sel.selectedIndex]?.text : 'নির্বাচিত খাত';
                      handleApplyBulkToAll(Number(bulkCustomInput), text);
                      setBulkCustomInput('');
                    }}
                    className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                  >
                    সেট করুন
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Add New Member Form */}
          {isAddingMember && (
            <form onSubmit={handleCreateMember} className="bg-emerald-50/70 p-5 rounded-2xl border-2 border-emerald-400 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-700" /> নতুন সদস্য নিবন্ধন
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAddingMember(false)}
                  className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">সদস্যের নাম *</label>
                  <input
                    type="text"
                    value={newMemberForm.name}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                    placeholder="সদস্যের নাম লিখুন"
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">মোবাইল নম্বর *</label>
                  <input
                    type="text"
                    value={newMemberForm.phone}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, phone: e.target.value })}
                    placeholder="যেমন: 018..."
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">পদবী</label>
                  <input
                    type="text"
                    value={newMemberForm.role}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, role: e.target.value })}
                    placeholder="যেমন: সদস্য"
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">আগস্ট জমা (৳)</label>
                  <input
                    type="number"
                    value={newMemberForm.august || ''}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, august: e.target.value ? Number(e.target.value) : null })}
                    placeholder="2500"
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-mono"
                  />
                </div>

                {/* Profile Photo Field */}
                <div className="col-span-1 sm:col-span-2 md:col-span-4 flex items-center gap-4 p-3 bg-white rounded-xl border border-stone-200">
                  <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-300 overflow-hidden flex items-center justify-center shrink-0">
                    {newMemberPhoto ? (
                      <img src={newMemberPhoto} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-stone-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block font-bold text-stone-700 text-xs mb-1">
                      মেম্বার এর প্রোফাইল ছবি (ঐচ্ছিক)
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => newMemberPhotoInputRef.current?.click()}
                        className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        {newMemberPhoto ? 'ছবি পরিবর্তন করুন' : 'ছবি নির্বাচন করুন'}
                      </button>
                      {newMemberPhoto && (
                        <button
                          type="button"
                          onClick={() => setNewMemberPhoto(null)}
                          className="px-2 py-1 text-red-600 hover:text-red-800 text-xs font-semibold cursor-pointer"
                        >
                          মুছে ফেলুন
                        </button>
                      )}
                      <input
                        ref={newMemberPhotoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleNewMemberPhotoChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingMember(false)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  সদস্য নিবন্ধন সম্পন্ন করুন
                </button>
              </div>
            </form>
          )}

          {/* Members Table Controls: Year Switcher & Month Selector */}
          <div className="bg-stone-100 p-3 sm:p-4 rounded-2xl border border-stone-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-700">প্রদর্শিত বছর:</span>
              <div className="bg-white p-1 rounded-xl border border-stone-300 flex items-center shadow-2xs">
                <button
                  type="button"
                  onClick={() => {
                    setAdminMemberYear(2026);
                    setAdminMemberMonth(currentCalendarMonthKey);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    adminMemberYear === 2026
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5 text-amber-300" />
                  ২০২৬ (চলতি বছর)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAdminMemberYear(2025);
                    setAdminMemberMonth('09');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    adminMemberYear === 2025
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  ২০২৫ (বিগত)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-700">মাস নির্বাচন:</span>
              <select
                value={adminMemberMonth}
                onChange={(e) => setAdminMemberMonth(e.target.value)}
                className="bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-bold text-stone-900 outline-none cursor-pointer focus:border-emerald-600 shadow-2xs"
              >
                {adminMemberYear === 2026 ? (
                  <>
                    <option value="09">সেপ্টেম্বর ২০২৬ (চলতি মাস)</option>
                    <option value="01">জানুয়ারি ২০২৬</option>
                    <option value="02">ফেব্রুয়ারি ২০২৬</option>
                    <option value="03">মার্চ ২০২৬</option>
                    <option value="04">এপ্রিল ২০২৬</option>
                    <option value="05">মে ২০২৬</option>
                    <option value="06">জুন ২০২৬</option>
                    <option value="07">জুলাই ২০২৬</option>
                    <option value="08">আগস্ট ২০২৬</option>
                    <option value="10">অক্টোবর ২০২৬</option>
                    <option value="11">নভেম্বর ২০২৬</option>
                    <option value="12">ডিসেম্বর ২০২৬</option>
                  </>
                ) : (
                  <>
                    <option value="08">আগস্ট ২০২৫</option>
                    <option value="09">সেপ্টেম্বর ২০২৫</option>
                    <option value="10">অক্টোবর ২০২৫</option>
                    <option value="11">নভেম্বর ২০২৫</option>
                    <option value="12">ডিসেম্বর ২০২৫</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Members Table */}
          <div className="overflow-x-auto border border-stone-200 rounded-2xl">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                <tr>
                  <th className="py-3 px-3 text-center">রোল</th>
                  <th className="py-3 px-3">মেম্বার আইডি</th>
                  <th className="py-3 px-3">নাম</th>
                  <th className="py-3 px-3">মোবাইল</th>
                  <th className="py-3 px-3 text-center">
                    {MONTHS_NAME_MAP[adminMemberMonth] || adminMemberMonth} {toBengaliNumber(adminMemberYear)} স্ট্যাটাস
                  </th>
                  <th className="py-3 px-3 text-center">তাৎক্ষণিক জমা আপডেট</th>
                  <th className="py-3 px-3 text-right">{toBengaliNumber(adminMemberYear)} জমা</th>
                  <th className="py-3 px-3 text-right">সর্বমোট জমা</th>
                  <th className="py-3 px-3 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {data.members.map((m) => {
                  const paymentAmt = getMemberMonthPayment(m, adminMemberYear, adminMemberMonth);
                  const isPaid = paymentAmt !== null && Number(paymentAmt) > 0;
                  const yearTotal = calculateMemberYearTotal(m, adminMemberYear);
                  const allTotal = calculateMemberAllTotal(m);

                  return (
                    <tr key={m.id} className="hover:bg-emerald-50/40 transition-colors">
                      <td className="py-2.5 px-3 text-center font-bold text-stone-500">
                        {toBengaliNumber(m.rollNo)}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium text-emerald-800">
                        {m.id}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-stone-900">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-br from-emerald-800 to-emerald-950 text-white flex items-center justify-center shrink-0 border border-emerald-600/40">
                            {m.photoUrl ? (
                              <img src={m.photoUrl} alt={m.name} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-3.5 h-3.5 text-emerald-200" />
                            )}
                          </div>
                          <div>
                            <span>{m.name}</span>
                            {m.role && m.role !== 'সদস্য' && (
                              <span className="block text-[10px] text-emerald-700 font-normal leading-tight">{m.role}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-stone-600">
                        {m.phone}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {isPaid ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300 inline-flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" />
                            Paid ({toBengaliNumber(paymentAmt)} ৳)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-bold text-xs border border-red-300">
                            Due (বাকি)
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleQuickUpdateMemberPayment(m.id, adminMemberYear, adminMemberMonth, 2500)}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-[11px] font-mono font-bold cursor-pointer transition-all active:scale-95"
                            title="২৫০০ টাকা সেট করুন"
                          >
                            ২৫০০
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickUpdateMemberPayment(m.id, adminMemberYear, adminMemberMonth, 2000)}
                            className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded-lg text-[11px] font-mono font-bold cursor-pointer transition-all active:scale-95"
                            title="২০০০ টাকা সেট করুন"
                          >
                            ২০০০
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickUpdateMemberPayment(m.id, adminMemberYear, adminMemberMonth, null)}
                            className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 rounded-lg text-[11px] font-bold cursor-pointer transition-all active:scale-95"
                            title="বাকি (০) সেট করুন"
                          >
                            বাকি
                          </button>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-950 font-mono">
                        {formatCurrency(yearTotal)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-stone-900 font-mono">
                        {formatCurrency(allTotal)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setEditingMember({ ...m })}
                            className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            title="পূর্ণাঙ্গ হিসাব এডিট করুন"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMember(m.id, m.name)}
                            className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                            title="ডিলিট করুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Member Edit Modal */}
          {editingMember && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-emerald-600 space-y-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                  <div>
                    <h4 className="text-xl font-bold text-emerald-950 flex items-center gap-2">
                      <Edit3 className="w-5 h-5 text-emerald-700" />
                      {editingMember.name} এর হিসাব এডিটর
                    </h4>
                    <p className="text-xs text-stone-500 font-mono">
                      আইডি: {editingMember.id} | ক্রমিক: {toBengaliNumber(editingMember.rollNo)}
                    </p>
                  </div>
                  <button
                    onClick={() => setEditingMember(null)}
                    className="p-1 rounded-full text-stone-400 hover:text-stone-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSaveMember} className="space-y-4 text-xs sm:text-sm">
                  
                  {/* Member Profile Photo Section */}
                  <div className="flex items-center gap-4 p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200">
                    <div className="relative group/modalphoto shrink-0">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-800 to-emerald-950 border-2 border-emerald-600/60 shadow-md flex items-center justify-center text-white">
                        {editingMember.photoUrl ? (
                          <img
                            src={editingMember.photoUrl}
                            alt={editingMember.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            <User className="w-7 h-7 text-emerald-200" />
                            <span className="text-[9px] font-mono font-bold text-amber-300">
                              #{toBengaliNumber(editingMember.rollNo)}
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => editMemberPhotoInputRef.current?.click()}
                        className="absolute -bottom-1 -right-1 p-1 bg-amber-400 hover:bg-amber-300 text-emerald-950 rounded-full shadow-md border-2 border-white cursor-pointer"
                        title="ছবি পরিবর্তন করুন"
                      >
                        <Camera className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex-1">
                      <h5 className="font-bold text-stone-900 text-sm">মেম্বার এর প্রোফাইল ছবি</h5>
                      <p className="text-xs text-stone-500 mb-2">সদস্য তালিকা ও চার্ট সিস্টেমে এই ছবি প্রদর্শিত হবে</p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => editMemberPhotoInputRef.current?.click()}
                          className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Camera className="w-3.5 h-3.5 text-amber-300" />
                          {editingMember.photoUrl ? 'ছবি পরিবর্তন' : 'ছবি যোগ করুন'}
                        </button>
                        {editingMember.photoUrl && (
                          <button
                            type="button"
                            onClick={() => setEditingMember({ ...editingMember, photoUrl: undefined })}
                            className="px-2.5 py-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            ছবি মুছুন
                          </button>
                        )}
                        <input
                          ref={editMemberPhotoInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleEditMemberPhotoChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-stone-800 mb-1">সদস্যের নাম *</label>
                      <input
                        type="text"
                        value={editingMember.name}
                        onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-stone-300 font-bold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-800 mb-1">মোবাইল নম্বর *</label>
                      <input
                        type="text"
                        value={editingMember.phone}
                        onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-stone-300 font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-800 mb-1">পদবী</label>
                      <input
                        type="text"
                        value={editingMember.role || ''}
                        onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-stone-300"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-800 mb-1">ডাউন পেমেন্ট (৳)</label>
                      <input
                        type="number"
                        value={editingMember.downPayment || 0}
                        onChange={(e) => setEditingMember({ ...editingMember, downPayment: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl border border-stone-300 font-mono"
                      />
                    </div>
                  </div>

                  {/* 2026 Collections (Current Year) */}
                  <div className="p-4 bg-emerald-50/70 rounded-2xl border-2 border-emerald-300 space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-black text-emerald-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                        ২০২৬ সালের হিসাব (চলতি বছর)
                      </h5>
                      <span className="text-[10px] font-bold bg-amber-400 text-emerald-950 px-2 py-0.5 rounded-full">
                        রানিং বছর
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {[
                        { key: '09', name: 'সেপ্টেম্বর ২০২৬ (চলতি মাস)', isRunning: true },
                        { key: '01', name: 'জানুয়ারি ২০২৬' },
                        { key: '02', name: 'ফেব্রুয়ারি ২০২৬' },
                        { key: '03', name: 'মার্চ ২০২৬' },
                        { key: '04', name: 'এপ্রিল ২০২৬' },
                        { key: '05', name: 'মে ২০২৬' },
                        { key: '06', name: 'জুন ২০২৬' },
                        { key: '07', name: 'জুলাই ২০২৬' },
                        { key: '08', name: 'আগস্ট ২০২৬' },
                        { key: '10', name: 'অক্টোবর ২০২৬' },
                        { key: '11', name: 'নভেম্বর ২০২৬' },
                        { key: '12', name: 'ডিসেম্বর ২০২৬' }
                      ].map((mo) => {
                        const curVal = editingMember.payments2026?.[mo.key] ?? '';
                        return (
                          <div key={mo.key} className={`p-2.5 rounded-xl border ${mo.isRunning ? 'bg-amber-50/80 border-amber-300 ring-1 ring-amber-400' : 'bg-white border-stone-200'}`}>
                            <label className="block text-stone-700 text-xs mb-1 font-bold">
                              {mo.name}
                            </label>
                            <input
                              type="number"
                              placeholder="বাকি থাকলে খালি"
                              value={curVal}
                              onChange={(e) => {
                                const val = e.target.value ? Number(e.target.value) : null;
                                setEditingMember({
                                  ...editingMember,
                                  payments2026: {
                                    ...(editingMember.payments2026 || {}),
                                    [mo.key]: val
                                  }
                                });
                              }}
                              className="w-full p-2 rounded-lg border border-stone-300 font-mono font-bold text-emerald-900 bg-white"
                            />
                            <div className="flex gap-1 mt-1 text-[10px]">
                              <button
                                type="button"
                                onClick={() => setEditingMember({
                                  ...editingMember,
                                  payments2026: { ...(editingMember.payments2026 || {}), [mo.key]: 2500 }
                                })}
                                className="px-1.5 py-0.5 bg-emerald-100 text-emerald-900 hover:bg-emerald-200 rounded font-mono font-bold cursor-pointer"
                              >
                                ২৫০০
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingMember({
                                  ...editingMember,
                                  payments2026: { ...(editingMember.payments2026 || {}), [mo.key]: 2000 }
                                })}
                                className="px-1.5 py-0.5 bg-stone-100 hover:bg-stone-200 rounded font-mono font-bold cursor-pointer"
                              >
                                ২০০০
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingMember({
                                  ...editingMember,
                                  payments2026: { ...(editingMember.payments2026 || {}), [mo.key]: null }
                                })}
                                className="px-1.5 py-0.5 bg-red-100 text-red-900 hover:bg-red-200 rounded font-bold cursor-pointer"
                              >
                                ০ (বাকি)
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-emerald-200">
                      <div>
                        <label className="block text-stone-700 text-xs mb-1 font-bold">১ম ৬ মাস ডিপি (২০২৬)</label>
                        <input
                          type="number"
                          value={editingMember.downPayment2026_1 || 0}
                          onChange={(e) => setEditingMember({ ...editingMember, downPayment2026_1: Number(e.target.value) })}
                          className="w-full p-2 rounded-lg border border-stone-300 font-mono bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-stone-700 text-xs mb-1 font-bold">২য় ৬ মাস ডিপি (২০২৬)</label>
                        <input
                          type="number"
                          value={editingMember.downPayment2026_2 || 0}
                          onChange={(e) => setEditingMember({ ...editingMember, downPayment2026_2: Number(e.target.value) })}
                          className="w-full p-2 rounded-lg border border-stone-300 font-mono bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-stone-700 text-xs mb-1 font-bold">জরিমানা (২০২৬)</label>
                        <input
                          type="number"
                          value={editingMember.fine2026 || 0}
                          onChange={(e) => setEditingMember({ ...editingMember, fine2026: Number(e.target.value) })}
                          className="w-full p-2 rounded-lg border border-stone-300 font-mono text-red-700 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2025 Collections (Past Year) */}
                  <details className="p-3 bg-stone-50 rounded-2xl border border-stone-200 group">
                    <summary className="font-bold text-stone-700 text-xs uppercase tracking-wider cursor-pointer flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-stone-500" />
                        ২০২৫ সালের হিসাব (বিগত বছর দেখতে বা সংশোধন করতে ক্লিক করুন)
                      </span>
                      <span className="text-[11px] text-emerald-800 group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                      <div>
                        <label className="block text-stone-600 text-xs mb-1 font-bold">আগস্ট ২০২৫</label>
                        <input
                          type="number"
                          placeholder="বাকি থাকলে খালি"
                          value={editingMember.august ?? ''}
                          onChange={(e) => setEditingMember({ ...editingMember, august: e.target.value ? Number(e.target.value) : null })}
                          className="w-full p-2 rounded-lg border border-stone-300 font-mono font-bold text-emerald-900 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-stone-600 text-xs mb-1 font-bold">সেপ্টেম্বর ২০২৫</label>
                        <input
                          type="number"
                          placeholder="বাকি থাকলে খালি"
                          value={editingMember.september ?? ''}
                          onChange={(e) => setEditingMember({ ...editingMember, september: e.target.value ? Number(e.target.value) : null })}
                          className="w-full p-2 rounded-lg border border-stone-300 font-mono font-bold text-emerald-900 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-stone-600 text-xs mb-1 font-bold">জরিমানা (২০২৫)</label>
                        <input
                          type="number"
                          value={editingMember.fine || 0}
                          onChange={(e) => setEditingMember({ ...editingMember, fine: Number(e.target.value), fine2025: Number(e.target.value) })}
                          className="w-full p-2 rounded-lg border border-stone-300 font-mono text-red-700 bg-white"
                        />
                      </div>
                    </div>
                  </details>

                  <div>
                    <label className="block font-bold text-stone-800 mb-1">মন্তব্য / বিশেষ নোট</label>
                    <input
                      type="text"
                      value={editingMember.notes || ''}
                      onChange={(e) => setEditingMember({ ...editingMember, notes: e.target.value })}
                      placeholder="যেমন: নিয়মিত চাঁদা পরিশোধিত"
                      className="w-full p-2.5 rounded-xl border border-stone-300"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
                    <button
                      type="button"
                      onClick={() => setEditingMember(null)}
                      className="px-5 py-2.5 border border-stone-300 rounded-xl text-stone-700 font-bold hover:bg-stone-50 cursor-pointer"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="w-4 h-4 text-amber-300" />
                      সংরক্ষণ করুন
                    </button>
                  </div>

                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 7: EXPENSES                                          */}
      {/* ======================================================== */}
      {activeTab === 'expenses' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Add Expense Form (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200 shadow-md space-y-4">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-700" /> নতুন খরচ এন্ট্রি করুন
            </h3>
            <p className="text-xs text-stone-500">
              সমিতির স্টেশনারি, মিটিং বা অন্যান্য যেকোনো খরচ এন্ট্রি করলে সরাসরি ব্যাংক রিজার্ভ থেকে কমে যাবে
            </p>

            <form onSubmit={handleAddExpense} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-stone-800 mb-1">খরচের বিবরণ *</label>
                <input
                  type="text"
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  placeholder="যেমন: খাতা ও কলম ক্রয়"
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">টাকার পরিমাণ (৳) *</label>
                <input
                  type="number"
                  value={expenseAmount || ''}
                  onChange={(e) => setExpenseAmount(Number(e.target.value))}
                  placeholder="যেমন: 500"
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 font-mono text-sm bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">ক্যাটাগরি</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 bg-white"
                >
                  <option value="স্টেশনারি ও খাতা">স্টেশনারি ও খাতা</option>
                  <option value="প্রচার ও সরঞ্জাম">প্রচার ও সরঞ্জাম</option>
                  <option value="অফিস ও মিটিং">অফিস ও মিটিং</option>
                  <option value="ব্যাংক চার্জ">ব্যাংক চার্জ</option>
                  <option value="অন্যান্য সাধারণ খরচ">অন্যান্য সাধারণ খরচ</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                খরচ যুক্ত করুন
              </button>
            </form>
          </div>

          {/* Expenses List (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200 shadow-md space-y-4">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-700" />
              সাম্প্রতিক খরচের খতিয়ান
            </h3>

            <div className="space-y-3">
              {data.expenses.length === 0 ? (
                <p className="text-xs text-stone-500 py-6 text-center">এখনও কোনো খরচ এন্ট্রি করা হয়নি</p>
              ) : (
                data.expenses.map((exp) => (
                  <div key={exp.id} className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-stone-900 text-sm">{exp.title}</p>
                      <p className="text-stone-500 text-[11px] mt-0.5">
                        {exp.date} • {exp.category} • লিপিবদ্ধকারী: {exp.recordedBy}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-red-700 text-sm">
                        -{formatCurrency(exp.amount)}
                      </span>
                      <button
                        onClick={() => handleDeleteExpense(exp.id, exp.amount)}
                        className="p-1 text-stone-400 hover:text-red-600 rounded-lg cursor-pointer"
                        title="ডিলিট করুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 8: NOTICES BOARD                                     */}
      {/* ======================================================== */}
      {activeTab === 'notices' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200 shadow-md space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-200">
            <div>
              <h3 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-emerald-700" />
                জরুরি নোটিশ বোর্ড পরিচালনা
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                সমিতির হোম পেজ এবং মেম্বার পোর্টালে দৃশ্যমান নোটিশ তৈরি ও নিয়ন্ত্রণ করুন
              </p>
            </div>
          </div>

          <form onSubmit={handleAddNotice} className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-3 text-xs sm:text-sm">
            <h4 className="font-bold text-stone-900">নতুন নোটিশ জারি করুন</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-stone-700 font-bold mb-1">নোটিশের শিরোনাম *</label>
                <input
                  type="text"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="যেমন: সেপ্টেম্বর মাসের চাঁদা জমার শেষ তারিখ ২০ তারিখ"
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-stone-700 font-bold mb-1">গুরুত্ব</label>
                <select
                  value={noticePriority}
                  onChange={(e) => setNoticePriority(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                >
                  <option value="normal">সাধারণ নোটিশ</option>
                  <option value="urgent">জরুরি সতর্কতা (Urgent)</option>
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="block text-stone-700 font-bold mb-1">নোটিশের বিস্তারিত বক্তব্য *</label>
                <textarea
                  rows={3}
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  placeholder="নোটিশের পূর্ণ বিবরণ লিখুন..."
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white resize-none"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Bell className="w-4 h-4 text-amber-300" /> নোটিশ প্রচার করুন
              </button>
            </div>
          </form>

          <div className="space-y-3">
            {(data.notices || []).map((notice) => (
              <div key={notice.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      notice.priority === 'urgent' ? 'bg-red-600 text-white' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {notice.priority === 'urgent' ? 'জরুরি নোটিশ' : 'সাধারণ'}
                    </span>
                    <span className="text-xs text-stone-500 font-mono">{notice.date}</span>
                  </div>
                  <h4 className="font-bold text-stone-900 text-sm sm:text-base">{notice.title}</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">{notice.content}</p>
                </div>
                <button
                  onClick={() => handleDeleteNotice(notice.id)}
                  className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 9: BACKUP & RESTORE                                  */}
      {/* ======================================================== */}
      {activeTab === 'backup' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200 shadow-md space-y-6">
          <div className="space-y-1 pb-4 border-b border-stone-200">
            <h3 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-700" />
              ডাটা ব্যাকআপ, রিস্টোর ও রিসেট ব্যবস্থাপনা
            </h3>
            <p className="text-xs text-stone-500">
              সমিতির সমস্ত মেম্বার, চাঁদা, ব্যাংক একাউন্ট, নিয়মাবলী ও খরচের সম্পূর্ণ ডেটাবেজ এক ক্লিকে ব্যাকআপ ও রিস্টোর করুন
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* 1. Download Backup */}
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-emerald-950 text-base">১. সম্পূর্ণ ব্যাকআপ ডাউনলোড</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  সমিতির সব তথ্য একটি সুরক্ষিত JSON ফাইলে আপনার কম্পিউটার বা মোবাইলে ডাউনলোড করে সংরক্ষণ করুন।
                </p>
              </div>
              <button
                onClick={handleExportJSON}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-300" /> JSON ব্যাকআপ নামিয়ে রাখুন
              </button>
            </div>

            {/* 2. Upload / Restore */}
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-amber-950 text-base">২. ব্যাকআপ থেকে ডাটা ফিরিয়ে আনুন</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  পূর্বে ডাউনলোড করা JSON ফাইল সিলেক্ট করে সমস্ত সদস্য ও হিসাব রিস্টোর করুন।
                </p>
              </div>
              <div>
                <input
                  type="file"
                  accept=".json"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-black rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4" /> ব্যাকআপ ফাইল আপলোড করুন
                </button>
              </div>
            </div>

            {/* 3. Factory Reset */}
            <div className="p-5 rounded-2xl bg-red-50 border border-red-200 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-red-950 text-base">৩. ফ্যাক্টরি ডাটা রিসেট</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  সমস্ত তথ্য মুছে মূল আদি রেকর্ডে ফিরিয়ে নিয়ে যাবে।
                </p>
              </div>
              <button
                onClick={handleReset}
                className="w-full py-2.5 bg-red-800 hover:bg-red-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-amber-300" /> আদি অবস্থায় রিসেট করুন
              </button>
            </div>

            {/* 4. Firebase Cloud Firestore Live Status */}
            <div className="p-5 rounded-2xl bg-sky-50 border border-sky-200 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    সক্রিয় ও লাইভ
                  </span>
                </div>
                <h4 className="font-bold text-sky-950 text-base">৪. ক্লাউড ফায়ারস্টোর ডাটাবেস</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  সকল সদস্যের হিসাব, চাঁদা ও খরচের ডাটা গুগল ক্লাউডে রিয়েল-টাইম সিঙ্ক হচ্ছে।
                </p>
              </div>
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleForceUploadToCloud}
                  disabled={isSyncingCloud}
                  className="w-full py-2.5 bg-sky-800 hover:bg-sky-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <Cloud className={`w-4 h-4 text-amber-300 ${isSyncingCloud ? 'animate-spin' : ''}`} /> 
                  {isSyncingCloud ? 'সিঙ্ক হচ্ছে...' : 'এখনই ক্লাউডে আপলোড/সিঙ্ক করুন'}
                </button>
                <button
                  onClick={handleForceDownloadFromCloud}
                  disabled={isSyncingCloud}
                  className="w-full py-2 bg-white hover:bg-sky-100 text-sky-900 border border-sky-300 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-sky-700 ${isSyncingCloud ? 'animate-spin' : ''}`} /> 
                  ক্লাউড থেকে ডাটা রিফ্রেশ করুন
                </button>
              </div>
            </div>

            {/* 5. Change Admin Password Card */}
            <div className="p-5 rounded-2xl bg-purple-50 border border-purple-200 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-purple-950 text-base">৫. অ্যাডমিন পাসওয়ার্ড পরিবর্তন</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  বর্তমান ইউজার: <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-purple-900">{data.adminSecurity?.username || 'admin'}</code>
                  <br />প্যানেলে প্রবেশের পাসওয়ার্ড এখান থেকে পরিবর্তন করুন।
                </p>
              </div>
              <button
                onClick={() => setShowSecurityModal(true)}
                className="w-full py-2.5 bg-purple-800 hover:bg-purple-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4 text-amber-300" /> নতুন পাসওয়ার্ড সেট করুন
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Admin Password Change Modal */}
      {showSecurityModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-emerald-700/20 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center shadow-xs">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900">অ্যাডমিন পাসওয়ার্ড পরিবর্তন</h3>
                  <p className="text-[11px] text-stone-500">আপনার অ্যাডমিন লগইন তথ্য আপডেট করুন</p>
                </div>
              </div>
              <button
                onClick={() => setShowSecurityModal(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSecurity} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-stone-800 mb-1">অ্যাডমিন ইউজারনেম *</label>
                <input
                  type="text"
                  value={securityForm.username}
                  onChange={(e) => setSecurityForm({ ...securityForm, username: e.target.value })}
                  placeholder="যেমন: admin"
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">বর্তমান পাসওয়ার্ড *</label>
                <input
                  type="password"
                  value={securityForm.currentPassword}
                  onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                  placeholder="বর্তমান পাসওয়ার্ড লিখুন"
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 font-mono"
                  required
                />
                <span className="text-[10px] text-stone-500 mt-0.5 block">ডিফল্ট পাসওয়ার্ড: vaiibondhu113</span>
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">নতুন পাসওয়ার্ড *</label>
                <input
                  type="password"
                  value={securityForm.newPassword}
                  onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                  placeholder="নতুন গোপন পাসওয়ার্ড লিখুন"
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">নতুন পাসওয়ার্ড নিশ্চিত করুন *</label>
                <input
                  type="password"
                  value={securityForm.confirmPassword}
                  onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                  placeholder="পুনরায় নতুন পাসওয়ার্ড লিখুন"
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 font-mono font-bold"
                  required
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowSecurityModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 font-bold text-stone-600 hover:bg-stone-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
                >
                  <Check className="w-4 h-4 text-amber-300" />
                  পাসওয়ার্ড সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
