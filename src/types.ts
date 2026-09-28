export interface Member {
  id: string; // Member ID with prefix, e.g. "VB20250001"
  rollNo: number; // 1 to 24
  name: string;
  phone: string;
  role?: string;
  august: number | null; // 2500 or null if due
  september: number | null; // 2500 or null if due
  october: number | null;
  fine: number;
  fine2025?: number;
  fine2026?: number;
  downPayment: number;
  downPayment2025_1?: number; // 2025 ১ম ৬ মাস ডাউন পেমেন্ট
  downPayment2025_2?: number; // 2025 ২য় ৬ মাস ডাউন পেমেন্ট
  downPayment2026_1?: number; // 2026 ১ম ৬ মাস ডাউন পেমেন্ট
  downPayment2026_2?: number; // 2026 ২য় ৬ মাস ডাউন পেমেন্ট
  joinedDate: string;
  notes?: string;
  payments2025?: Record<string, number | null>; // key: '01' to '12' -> monthly amount or null
  payments2026?: Record<string, number | null>; // key: '01', '02', ... -> monthly amount or null
  photoUrl?: string; // Profile picture URL or Data URL
}

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  recordedBy: string;
}

export interface PaymentSubmission {
  id: string;
  memberId: string;
  memberName: string;
  month: string;
  paymentType: 'monthly' | 'downpayment' | 'fine';
  amount: number;
  method: 'bkash' | 'nagad' | 'bank' | 'cash';
  trxId: string;
  senderPhone: string;
  date: string;
  status: 'approved' | 'pending' | 'rejected';
  note?: string;
}

export interface CommitteeMember {
  id: string;
  role: string;
  name: string;
  phone?: string;
  badge?: string;
  type: 'executive' | 'joint' | 'cashier' | 'advisor';
  photoUrl?: string;
}

export interface SocietyRule {
  no: number;
  title: string;
  description: string;
  highlight?: string;
}

export interface Notice {
  id: string;
  title: string;
  date: string;
  content: string;
  priority: 'normal' | 'urgent';
}

export interface SocietyData {
  societyName: string;
  tagline: string;
  motto: string;
  establishedYear: string;
  address: string;
  bankAccount: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    branch: string;
    routingNumber: string;
  };
  bkashNumbers: { name: string; number: string; type: string; role: string }[];
  nagadNumbers: { name: string; number: string; type: string; role: string }[];
  currentBankBalance: number;
  cashInHand: number;
  monthlyFeeDefault: number;
  lastUpdated: string;
  members: Member[];
  expenses: ExpenseItem[];
  paymentSubmissions: PaymentSubmission[];
  notices: Notice[];
  rules: SocietyRule[];
  committee: CommitteeMember[];
  months2026?: string[]; // month keys active in 2026, e.g. ['01', '02', '03']
  adminSecurity?: {
    username: string;
    password: string;
  };
}

export type AuthRole = 'guest' | 'member' | 'admin';

export interface CurrentUser {
  role: AuthRole;
  memberId?: string;
  name: string;
}
