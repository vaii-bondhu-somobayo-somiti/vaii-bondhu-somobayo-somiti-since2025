import { SocietyData, PaymentSubmission, Member } from '../types';

export const BANGLA_MONTHS_MAP: Record<string, string> = {
  'জানুয়ারি': '01',
  'ফেব্রুয়ারি': '02',
  'মার্চ': '03',
  'এপ্রিল': '04',
  'মে': '05',
  'জুন': '06',
  'জুলাই': '07',
  'আগস্ট': '08',
  'সেপ্টেম্বর': '09',
  'অক্টোবর': '10',
  'নভেম্বর': '11',
  'ডিসেম্বর': '12'
};

/**
 * Parses month string to determine year and month key code ('01' to '12')
 */
export function parseMonthString(monthStr: string): { year: number; monthKey: string; isDownPayment: boolean; isFine: boolean } {
  const is2026 = monthStr.includes('২০২৬') || monthStr.includes('2026');
  const isDownPayment = monthStr.includes('ডাউন পেমেন্ট') || monthStr.includes('downpayment');
  const isFine = monthStr.includes('জরিমানা') || monthStr.includes('fine');
  
  let monthKey = '09';
  for (const [name, key] of Object.entries(BANGLA_MONTHS_MAP)) {
    if (monthStr.includes(name)) {
      monthKey = key;
      break;
    }
  }

  return {
    year: is2026 ? 2026 : 2025,
    monthKey,
    isDownPayment,
    isFine
  };
}

/**
 * Approve a pending payment submission and officially credit the member's account & bank balance.
 */
export function approvePaymentSubmission(
  submissionId: string,
  data: SocietyData,
  adminName: string = 'অ্যাডমিন'
): SocietyData {
  const submission = (data.paymentSubmissions || []).find(s => s.id === submissionId);
  if (!submission || submission.status === 'approved') {
    return data;
  }

  const amount = Number(submission.amount) || 0;
  const targetMemberId = submission.memberId;
  const month = submission.month || '';
  const paymentType = submission.paymentType;
  const parsed = parseMonthString(month);

  const updatedMembers = data.members.map((m): Member => {
    if (m.id !== targetMemberId) return m;

    const copy: Member = { ...m };

    if (parsed.year === 2026) {
      if (paymentType === 'downpayment' || parsed.isDownPayment) {
        if (month.includes('২য়')) {
          copy.downPayment2026_2 = (copy.downPayment2026_2 || 0) + amount;
        } else {
          copy.downPayment2026_1 = (copy.downPayment2026_1 || 0) + amount;
        }
      } else if (paymentType === 'fine' || parsed.isFine) {
        copy.fine2026 = (copy.fine2026 || 0) + amount;
      } else {
        // Monthly 2026
        const curr = copy.payments2026?.[parsed.monthKey] || 0;
        copy.payments2026 = {
          ...(copy.payments2026 || {}),
          [parsed.monthKey]: curr + amount
        };
      }
    } else {
      // 2025
      if (paymentType === 'downpayment' || parsed.isDownPayment) {
        if (month.includes('২য়')) {
          copy.downPayment2025_2 = (copy.downPayment2025_2 || 0) + amount;
        } else {
          copy.downPayment2025_1 = (copy.downPayment2025_1 || 0) + amount;
          copy.downPayment = (copy.downPayment || 0) + amount;
        }
      } else if (paymentType === 'fine' || parsed.isFine) {
        copy.fine2025 = (copy.fine2025 || 0) + amount;
        copy.fine = (copy.fine || 0) + amount;
      } else {
        // Monthly 2025
        if (month.includes('আগস্ট')) {
          copy.august = (copy.august || 0) + amount;
          copy.payments2025 = {
            ...(copy.payments2025 || {}),
            '08': (copy.payments2025?.['08'] || 0) + amount
          };
        } else if (month.includes('সেপ্টেম্বর')) {
          copy.september = (copy.september || 0) + amount;
          copy.payments2025 = {
            ...(copy.payments2025 || {}),
            '09': (copy.payments2025?.['09'] || 0) + amount
          };
        } else if (month.includes('অক্টোবর')) {
          copy.october = (copy.october || 0) + amount;
          copy.payments2025 = {
            ...(copy.payments2025 || {}),
            '10': (copy.payments2025?.['10'] || 0) + amount
          };
        } else {
          const curr = copy.payments2025?.[parsed.monthKey] || 0;
          copy.payments2025 = {
            ...(copy.payments2025 || {}),
            [parsed.monthKey]: curr + amount
          };
        }
      }
    }

    return copy;
  });

  const updatedSubmissions = (data.paymentSubmissions || []).map(s => {
    if (s.id === submissionId) {
      return {
        ...s,
        status: 'approved' as const,
        approvedAt: new Date().toISOString(),
        approvedBy: adminName,
        rejectionReason: undefined
      };
    }
    return s;
  });

  return {
    ...data,
    members: updatedMembers,
    currentBankBalance: (data.currentBankBalance || 0) + amount,
    paymentSubmissions: updatedSubmissions,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Revert an approved payment submission back to pending (deducts credited amount).
 */
export function revertPaymentSubmission(
  submissionId: string,
  data: SocietyData
): SocietyData {
  const submission = (data.paymentSubmissions || []).find(s => s.id === submissionId);
  if (!submission || submission.status !== 'approved') {
    return data;
  }

  const amount = Number(submission.amount) || 0;
  const targetMemberId = submission.memberId;
  const month = submission.month || '';
  const paymentType = submission.paymentType;
  const parsed = parseMonthString(month);

  const updatedMembers = data.members.map((m): Member => {
    if (m.id !== targetMemberId) return m;

    const copy: Member = { ...m };

    if (parsed.year === 2026) {
      if (paymentType === 'downpayment' || parsed.isDownPayment) {
        if (month.includes('২য়')) {
          copy.downPayment2026_2 = Math.max(0, (copy.downPayment2026_2 || 0) - amount);
        } else {
          copy.downPayment2026_1 = Math.max(0, (copy.downPayment2026_1 || 0) - amount);
        }
      } else if (paymentType === 'fine' || parsed.isFine) {
        copy.fine2026 = Math.max(0, (copy.fine2026 || 0) - amount);
      } else {
        const curr = copy.payments2026?.[parsed.monthKey] || 0;
        const newAmt = Math.max(0, curr - amount);
        copy.payments2026 = {
          ...(copy.payments2026 || {}),
          [parsed.monthKey]: newAmt > 0 ? newAmt : null
        };
      }
    } else {
      if (paymentType === 'downpayment' || parsed.isDownPayment) {
        if (month.includes('২য়')) {
          copy.downPayment2025_2 = Math.max(0, (copy.downPayment2025_2 || 0) - amount);
        } else {
          copy.downPayment2025_1 = Math.max(0, (copy.downPayment2025_1 || 0) - amount);
          copy.downPayment = Math.max(0, (copy.downPayment || 0) - amount);
        }
      } else if (paymentType === 'fine' || parsed.isFine) {
        copy.fine2025 = Math.max(0, (copy.fine2025 || 0) - amount);
        copy.fine = Math.max(0, (copy.fine || 0) - amount);
      } else {
        if (month.includes('আগস্ট')) {
          copy.august = Math.max(0, (copy.august || 0) - amount) || null;
          copy.payments2025 = {
            ...(copy.payments2025 || {}),
            '08': copy.august
          };
        } else if (month.includes('সেপ্টেম্বর')) {
          copy.september = Math.max(0, (copy.september || 0) - amount) || null;
          copy.payments2025 = {
            ...(copy.payments2025 || {}),
            '09': copy.september
          };
        } else if (month.includes('অক্টোবর')) {
          copy.october = Math.max(0, (copy.october || 0) - amount) || null;
          copy.payments2025 = {
            ...(copy.payments2025 || {}),
            '10': copy.october
          };
        } else {
          const curr = copy.payments2025?.[parsed.monthKey] || 0;
          const newAmt = Math.max(0, curr - amount);
          copy.payments2025 = {
            ...(copy.payments2025 || {}),
            [parsed.monthKey]: newAmt > 0 ? newAmt : null
          };
        }
      }
    }

    return copy;
  });

  const updatedSubmissions = (data.paymentSubmissions || []).map(s => {
    if (s.id === submissionId) {
      return {
        ...s,
        status: 'pending' as const,
        approvedAt: undefined,
        approvedBy: undefined
      };
    }
    return s;
  });

  return {
    ...data,
    members: updatedMembers,
    currentBankBalance: Math.max(0, (data.currentBankBalance || 0) - amount),
    paymentSubmissions: updatedSubmissions,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Reject a payment submission. If previously approved, safely reverts credits first.
 */
export function rejectPaymentSubmission(
  submissionId: string,
  reason: string,
  data: SocietyData
): SocietyData {
  const submission = (data.paymentSubmissions || []).find(s => s.id === submissionId);
  if (!submission) return data;

  let currentData = data;
  if (submission.status === 'approved') {
    currentData = revertPaymentSubmission(submissionId, data);
  }

  const updatedSubmissions = (currentData.paymentSubmissions || []).map(s => {
    if (s.id === submissionId) {
      return {
        ...s,
        status: 'rejected' as const,
        rejectionReason: reason || 'অ্যাডমিন কর্তৃক বাতিল করা হয়েছে',
        rejectedAt: new Date().toISOString()
      };
    }
    return s;
  });

  return {
    ...currentData,
    paymentSubmissions: updatedSubmissions,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Delete a payment submission entirely from history. If approved, reverts credits first.
 */
export function deletePaymentSubmission(
  submissionId: string,
  data: SocietyData
): SocietyData {
  const submission = (data.paymentSubmissions || []).find(s => s.id === submissionId);
  if (!submission) return data;

  let currentData = data;
  if (submission.status === 'approved') {
    currentData = revertPaymentSubmission(submissionId, data);
  }

  return {
    ...currentData,
    paymentSubmissions: (currentData.paymentSubmissions || []).filter(s => s.id !== submissionId),
    lastUpdated: new Date().toISOString()
  };
}
