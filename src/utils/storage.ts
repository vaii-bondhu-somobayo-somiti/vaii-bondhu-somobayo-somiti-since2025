import { SocietyData } from '../types';
import { INITIAL_SOCIETY_DATA } from '../data/initialData';
import { saveSocietyCloudData } from '../firebase';

const STORAGE_KEY = 'bhai_bondhu_somobay_data_v1';
const LAST_SAVED_KEY = 'bhai_bondhu_last_saved_time';

export function getStoredData(): SocietyData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveStoredData(INITIAL_SOCIETY_DATA);
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

      // Initialize payments2026
      const payments2026: Record<string, number | null> = {
        '01': null, '02': null, '03': null,
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
      rules: Array.isArray(parsed.rules) && parsed.rules.length > 0 
        ? parsed.rules 
        : INITIAL_SOCIETY_DATA.rules,
      committee: Array.isArray(parsed.committee) && parsed.committee.length > 0 
        ? parsed.committee 
        : INITIAL_SOCIETY_DATA.committee,
      members: cleanedMembers,
      months2026: Array.isArray(parsed.months2026) && parsed.months2026.length > 0
        ? parsed.months2026
        : ['01', '02', '03'],
      expenses: Array.isArray(parsed.expenses) ? parsed.expenses : INITIAL_SOCIETY_DATA.expenses,
      paymentSubmissions: Array.isArray(parsed.paymentSubmissions) ? parsed.paymentSubmissions : [],
      notices: Array.isArray(parsed.notices) ? parsed.notices : INITIAL_SOCIETY_DATA.notices
    };
    return merged;
  } catch (err) {
    console.error('Error loading stored data:', err);
    return INITIAL_SOCIETY_DATA;
  }
}

export function saveStoredData(data: SocietyData): void {
  try {
    const updated = {
      ...data,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem(LAST_SAVED_KEY, new Date().toLocaleTimeString('bn-BD'));
    // Dispatch a custom window event so all open views sync seamlessly
    window.dispatchEvent(new CustomEvent('society_data_updated', { detail: updated }));

    // Real-time Cloud Firestore synchronization across devices
    saveSocietyCloudData(updated).catch((cloudErr) => {
      console.warn('Firebase Cloud save notice:', cloudErr);
    });
  } catch (err) {
    console.error('Error saving data to localStorage:', err);
  }
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

