import { SocietyData, Member } from '../types';
import { INITIAL_SOCIETY_DATA } from '../data/initialData';
import { saveSocietyCloudData } from '../firebase';

const STORAGE_KEY = 'bhai_bondhu_somobay_data_v3';
const LAST_SAVED_KEY = 'bhai_bondhu_last_saved_time';

export function calculateMemberYearTotal(m: Member | any, targetYear: number): number {
  if (targetYear === 2025) {
    const dp1 = m.downPayment2025_1 !== undefined ? m.downPayment2025_1 : (m.downPayment || 0);
    const dp2 = m.downPayment2025_2 || 0;
    const fine = m.fine2025 !== undefined ? m.fine2025 : (m.fine || 0);
    let months = 0;
    const monthKeys = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    monthKeys.forEach((k) => {
      let val = m.payments2025?.[k];
      if (val === undefined || val === null) {
        if (k === '08') val = m.august;
        else if (k === '09') val = m.september;
        else if (k === '10') val = m.october;
      }
      if (val && Number(val) > 0) {
        months += Number(val);
      }
    });
    return Number(dp1) + Number(dp2) + Number(fine) + months;
  } else {
    const dp1 = m.downPayment2026_1 || 0;
    const dp2 = m.downPayment2026_2 || 0;
    const fine = m.fine2026 || 0;
    let months = 0;
    if (m.payments2026) {
      Object.values(m.payments2026).forEach((val: any) => {
        if (val && Number(val) > 0) months += Number(val);
      });
    }
    return Number(dp1) + Number(dp2) + Number(fine) + months;
  }
}

export const MONTHS_NAME_MAP: Record<string, string> = {
  '01': 'জানুয়ারি',
  '02': 'ফেব্রুয়ারি',
  '03': 'মার্চ',
  '04': 'এপ্রিল',
  '05': 'মে',
  '06': 'জুন',
  '07': 'জুলাই',
  '08': 'আগস্ট',
  '09': 'সেপ্টেম্বর',
  '10': 'অক্টোবর',
  '11': 'নভেম্বর',
  '12': 'ডিসেম্বর'
};

export function getMemberMonthPayment(m: Member | any, yr: number, moKey: string): number | null {
  if (!m) return null;
  if (yr === 2025) {
    if (m.payments2025 && m.payments2025[moKey] !== undefined && m.payments2025[moKey] !== null) {
      return Number(m.payments2025[moKey]);
    }
    if (moKey === '08') return m.august !== undefined && m.august !== null ? Number(m.august) : null;
    if (moKey === '09') return m.september !== undefined && m.september !== null ? Number(m.september) : null;
    if (moKey === '10') return m.october !== undefined && m.october !== null ? Number(m.october) : null;
    return null;
  } else {
    if (m.payments2026 && m.payments2026[moKey] !== undefined && m.payments2026[moKey] !== null) {
      return Number(m.payments2026[moKey]);
    }
    return null;
  }
}

export function calculateMemberAllTotal(m: Member | any): number {
  return calculateMemberYearTotal(m, 2025) + calculateMemberYearTotal(m, 2026);
}

export function getStoredData(): SocietyData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return INITIAL_SOCIETY_DATA;
    }
    const parsed = JSON.parse(raw);
    // Ensure all critical properties exist and merge with default schema
    if (!parsed.members || !Array.isArray(parsed.members) || parsed.members.length === 0) {
      return INITIAL_SOCIETY_DATA;
    }
    // Ensure member IDs follow the VB format (e.g. VB20250001) and initialize payments2025 & payments2026
    const cleanedMembers = (parsed.members || INITIAL_SOCIETY_DATA.members).map((m: any, idx: number) => {
      const roll = m.rollNo || idx + 1;
      let cleanId = m.id;
      // If id is not in VB format, format it as VB20250001 (VB followed by 8 numbers)
      if (!cleanId || typeof cleanId !== 'string' || !cleanId.startsWith('VB')) {
        cleanId = `VB2025${String(roll).padStart(4, '0')}`;
      }

      // Initialize payments2025 with default 12 months
      const payments2025: Record<string, number | null> = {
        '01': null, '02': null, '03': null, '04': null,
        '05': null, '06': null, '07': null,
        '08': m.august !== undefined ? m.august : null,
        '09': m.september !== undefined ? m.september : null,
        '10': m.october !== undefined ? m.october : null,
        '11': null, '12': null,
        ...(m.payments2025 || {})
      };

      // Keep august and september synced with payments2025
      const augVal = payments2025['08'] !== undefined ? payments2025['08'] : m.august;
      const sepVal = payments2025['09'] !== undefined ? payments2025['09'] : m.september;
      const octVal = payments2025['10'] !== undefined ? payments2025['10'] : m.october;

      // Initialize payments2026 with all 12 months
      const payments2026: Record<string, number | null> = {
        '01': null, '02': null, '03': null, '04': null,
        '05': null, '06': null, '07': null, '08': null,
        '09': null, '10': null, '11': null, '12': null,
        ...(m.payments2026 || {})
      };

      return {
        ...m,
        id: cleanId,
        rollNo: roll,
        august: augVal,
        september: sepVal,
        october: octVal,
        payments2025,
        payments2026,
        photoUrl: m.photoUrl || undefined
      };
    });

    const merged: SocietyData = {
      ...INITIAL_SOCIETY_DATA,
      ...parsed,
      bankAccount: {
        ...INITIAL_SOCIETY_DATA.bankAccount,
        ...(parsed.bankAccount || {})
      },
      bkashNumbers: Array.isArray(parsed.bkashNumbers) && parsed.bkashNumbers.length > 0 
        ? parsed.bkashNumbers 
        : INITIAL_SOCIETY_DATA.bkashNumbers,
      nagadNumbers: Array.isArray(parsed.nagadNumbers) && parsed.nagadNumbers.length > 0 
        ? parsed.nagadNumbers 
        : INITIAL_SOCIETY_DATA.nagadNumbers,
      rules: (Array.isArray(parsed.rules) && parsed.rules.length > 0 
        ? parsed.rules 
        : INITIAL_SOCIETY_DATA.rules).map((r: any) => ({
          ...r,
          description: (r.description || '').replace(/১৫\s*তারিখ/g, '২০ তারিখ'),
          highlight: (r.highlight || '').replace(/১৫\s*তারিখ/g, '২০ তারিখ')
        })),
      committee: Array.isArray(parsed.committee) && parsed.committee.length > 0 
        ? parsed.committee 
        : INITIAL_SOCIETY_DATA.committee,
      members: cleanedMembers,
      months2026: Array.isArray(parsed.months2026) && parsed.months2026.length > 0
        ? parsed.months2026
        : ['01', '02', '03'],
      expenses: Array.isArray(parsed.expenses) ? parsed.expenses : INITIAL_SOCIETY_DATA.expenses,
      paymentSubmissions: Array.isArray(parsed.paymentSubmissions) ? parsed.paymentSubmissions : [],
      notices: (Array.isArray(parsed.notices) && parsed.notices.length > 0 
        ? parsed.notices 
        : INITIAL_SOCIETY_DATA.notices).map((n: any) => ({
          ...n,
          title: (n.title || '').replace(/১৫\s*তারিখ/g, '২০ তারিখ'),
          content: (n.content || '').replace(/১৫\s*তারিখ/g, '২০ তারিখ')
        })),
      adminSecurity: parsed.adminSecurity || INITIAL_SOCIETY_DATA.adminSecurity
    };
    return merged;
  } catch (err) {
    console.error('Error loading stored data:', err);
    return INITIAL_SOCIETY_DATA;
  }
}

export async function saveStoredDataAsync(data: SocietyData): Promise<{ success: boolean; error?: string }> {
  try {
    const updated = {
      ...data,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem(LAST_SAVED_KEY, new Date().toLocaleTimeString('bn-BD'));
    window.dispatchEvent(new CustomEvent('society_data_updated', { detail: updated }));

    const res = await saveSocietyCloudData(updated);
    return res;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Error saving data:', msg);
    return { success: false, error: msg };
  }
}

export function saveStoredData(data: SocietyData): void {
  saveStoredDataAsync(data).catch((err) => {
    console.warn('saveStoredData async error notice:', err);
  });
}

export function getLastSavedTime(): string {
  return localStorage.getItem(LAST_SAVED_KEY) || 'এখনই';
}

export function exportDataAsJSON(data: SocietyData): void {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(data, null, 2)
  )}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadAnchor.setAttribute(
    'download',
    `Bhai_Bondhu_Somobay_Backup_${dateStr}.json`
  );
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importDataFromJSON(
  file: File,
  onSuccess: (data: SocietyData) => void,
  onError: (errorMsg: string) => void
): void {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      const parsed = JSON.parse(content) as SocietyData;
      if (!parsed.members || !Array.isArray(parsed.members)) {
        throw new Error('ফাইলের ফরম্যাট সঠিক নয়। বৈধ ব্যাকআপ ফাইল আপলোড করুন।');
      }
      saveStoredData(parsed);
      onSuccess(parsed);
    } catch (err: any) {
      onError(err.message || 'ফাইল রিড করতে ব্যর্থ হয়েছে');
    }
  };
  reader.onerror = () => {
    onError('ফাইল পড়তে ত্রুটি হয়েছে।');
  };
  reader.readAsText(file);
}

export function resetToDefaults(): SocietyData {
  saveStoredData(INITIAL_SOCIETY_DATA);
  return INITIAL_SOCIETY_DATA;
}

// Convert English numbers to Bengali numerals
export function toBengaliNumber(num: number | string | null | undefined): string {
  if (num === null || num === undefined) return '—';
  const banglaDigits: { [key: string]: string } = {
    '0': '০',
    '1': '১',
    '2': '২',
    '3': '৩',
    '4': '৪',
    '5': '৫',
    '6': '৬',
    '7': '৭',
    '8': '৮',
    '9': '৯'
  };
  return num
    .toString()
    .replace(/[0-9]/g, (digit) => banglaDigits[digit] || digit);
}

// Currency format helper
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '—';
  const formatted = amount.toLocaleString('en-IN');
  return `৳ ${toBengaliNumber(formatted)}`;
}

// Update a member's profile picture
export function updateMemberPhoto(memberId: string, photoUrl: string | null): SocietyData {
  const currentData = getStoredData();
  const updatedMembers = currentData.members.map((m) => {
    if (m.id === memberId || String(m.rollNo) === memberId) {
      return {
        ...m,
        photoUrl: photoUrl || undefined
      };
    }
    return m;
  });

  const updatedData: SocietyData = {
    ...currentData,
    members: updatedMembers
  };

  saveStoredData(updatedData);
  return updatedData;
}

