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
import firebaseConfig from '../firebase-applet-config.json';
import { SocietyData } from './types';
import { INITIAL_SOCIETY_DATA } from './data/initialData';

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
            paymentSubmissions: Array.isArray(rawCloud.paymentSubmissions) ? rawCloud.paymentSubmissions : INITIAL_SOCIETY_DATA.paymentSubmissions
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
 * Saves Society Data to Cloud Firestore for global persistence across all devices.
 */
export async function saveSocietyCloudData(data: SocietyData): Promise<void> {
  const path = `${SOCIETY_DOC_PATH}/${MAIN_DOC_ID}`;
  try {
    const docRef = doc(db, SOCIETY_DOC_PATH, MAIN_DOC_ID);
    await setDoc(docRef, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
