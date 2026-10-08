import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot, 
  getDocFromServer 
} from 'firebase/firestore';
import rawConfig from '../firebase-applet-config.json';
import { SocietyData } from './types';
import { INITIAL_SOCIETY_DATA } from './data/initialData';

// Securely load Firebase configuration using Vite's import.meta.env
// Secrets and keys are kept in .env and ignored by Git
const firebaseConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY as string) || rawConfig.apiKey || 'YOUR_GOOGLE_API_KEY',
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) || rawConfig.authDomain,
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID as string) || rawConfig.projectId,
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) || rawConfig.storageBucket,
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || rawConfig.messagingSenderId,
  appId: (import.meta.env.VITE_FIREBASE_APP_ID as string) || rawConfig.appId,
  firestoreDatabaseId: (import.meta.env.VITE_FIREBASE_DATABASE_ID as string) || rawConfig.firestoreDatabaseId || 'ai-studio-a9d1724b-2b75-49ba-9939-b9ec96e31f54'
};

// 1. Initialize Firebase App & Firestore Database instance
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);

// 2. Validate Connection to Firestore on startup
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'society_data', 'connection_test'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firebase client is currently offline or connecting...");
    }
  }
}
testConnection();

// 3. Error Handling Framework
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const SOCIETY_DOC_PATH = 'society_data';
const MAIN_DOC_ID = 'main';

/**
 * Real-time listener for Society Data from Cloud Firestore.
 * Automatically synchronizes whenever another device or user makes changes.
 */
export function subscribeToSocietyCloudData(
  onDataLoaded: (data: SocietyData) => void,
  onError?: (err: any) => void,
  initialFallbackData?: SocietyData
) {
  const docRef = doc(db, SOCIETY_DOC_PATH, MAIN_DOC_ID);

  const unsubscribe = onSnapshot(
    docRef,
    async (snapshot) => {
      try {
        if (snapshot.exists()) {
          const rawCloud = snapshot.data() as Partial<SocietyData>;
          const sanitized: SocietyData = {
            ...INITIAL_SOCIETY_DATA,
            ...rawCloud,
            bankAccount: {
              ...INITIAL_SOCIETY_DATA.bankAccount,
              ...(rawCloud.bankAccount || {})
            },
            members: Array.isArray(rawCloud.members) && rawCloud.members.length > 0
              ? rawCloud.members
              : (initialFallbackData?.members || INITIAL_SOCIETY_DATA.members),
            expenses: Array.isArray(rawCloud.expenses) ? rawCloud.expenses : INITIAL_SOCIETY_DATA.expenses,
            rules: Array.isArray(rawCloud.rules) && rawCloud.rules.length > 0 ? rawCloud.rules : INITIAL_SOCIETY_DATA.rules,
            committee: Array.isArray(rawCloud.committee) && rawCloud.committee.length > 0 ? rawCloud.committee : INITIAL_SOCIETY_DATA.committee,
            notices: Array.isArray(rawCloud.notices) ? rawCloud.notices : INITIAL_SOCIETY_DATA.notices,
            paymentSubmissions: Array.isArray(rawCloud.paymentSubmissions) ? rawCloud.paymentSubmissions : INITIAL_SOCIETY_DATA.paymentSubmissions,
            adminSecurity: rawCloud.adminSecurity || INITIAL_SOCIETY_DATA.adminSecurity
          };
          onDataLoaded(sanitized);
        } else {
          // If Cloud document does not exist yet, seed it with the initial/local data
          if (initialFallbackData) {
            try {
              await setDoc(docRef, initialFallbackData);
              onDataLoaded(initialFallbackData);
            } catch (writeErr) {
              console.warn("Could not seed initial cloud document:", writeErr);
            }
          }
        }
      } catch (err) {
        console.error("Error processing cloud snapshot data:", err);
      }
    },
    (error) => {
      console.warn("Firestore snapshot sync warning (will fallback to local cache):", error.message);
      if (onError) onError(error);
    }
  );

  return unsubscribe;
}

/**
 * Safely strips any `undefined` values from an object or array so Firestore setDoc never throws.
 */
export function sanitizeForFirestore<T>(val: T): T {
  return JSON.parse(JSON.stringify(val, (_, value) => {
    return value === undefined ? null : value;
  }));
}

/**
 * Saves Society Data to Cloud Firestore for global persistence across all devices.
 */
export async function saveSocietyCloudData(data: SocietyData): Promise<{ success: boolean; error?: string }> {
  const path = `${SOCIETY_DOC_PATH}/${MAIN_DOC_ID}`;
  try {
    const docRef = doc(db, SOCIETY_DOC_PATH, MAIN_DOC_ID);
    const cleaned = sanitizeForFirestore(data);
    await setDoc(docRef, cleaned);
    console.log("Firestore cloud updated successfully at:", cleaned.lastUpdated);
    return { success: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Firestore write failed:", msg);
    handleFirestoreError(error, OperationType.WRITE, path);
    return { success: false, error: msg };
  }
}

/**
 * Manually fetches the latest Society Data directly from Cloud Firestore.
 */
export async function fetchSocietyCloudData(): Promise<SocietyData | null> {
  const path = `${SOCIETY_DOC_PATH}/${MAIN_DOC_ID}`;
  try {
    const docRef = doc(db, SOCIETY_DOC_PATH, MAIN_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const rawCloud = snap.data() as Partial<SocietyData>;
      const sanitized: SocietyData = {
        ...INITIAL_SOCIETY_DATA,
        ...rawCloud,
        bankAccount: {
          ...INITIAL_SOCIETY_DATA.bankAccount,
          ...(rawCloud.bankAccount || {})
        },
        members: Array.isArray(rawCloud.members) && rawCloud.members.length > 0
          ? rawCloud.members
          : INITIAL_SOCIETY_DATA.members,
        expenses: Array.isArray(rawCloud.expenses) ? rawCloud.expenses : INITIAL_SOCIETY_DATA.expenses,
        rules: Array.isArray(rawCloud.rules) && rawCloud.rules.length > 0 ? rawCloud.rules : INITIAL_SOCIETY_DATA.rules,
        committee: Array.isArray(rawCloud.committee) && rawCloud.committee.length > 0 ? rawCloud.committee : INITIAL_SOCIETY_DATA.committee,
        notices: Array.isArray(rawCloud.notices) ? rawCloud.notices : INITIAL_SOCIETY_DATA.notices,
        paymentSubmissions: Array.isArray(rawCloud.paymentSubmissions) ? rawCloud.paymentSubmissions : INITIAL_SOCIETY_DATA.paymentSubmissions,
        adminSecurity: rawCloud.adminSecurity || INITIAL_SOCIETY_DATA.adminSecurity
      };
      return sanitized;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}
