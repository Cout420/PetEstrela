
'use server';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, deleteDoc, query, orderBy, limit, writeBatch, QueryDocumentSnapshot, DocumentData, Timestamp } from 'firebase/firestore';


// Sua configuração do Firebase virá do .env.local
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Inicializa o Firebase para uso no lado do cliente/servidor quando o admin SDK não é necessário.
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

const memorialsCollection = collection(db, 'memorials');
const contentCollection = collection(db, 'siteContent');

type PetImage = {
  imageUrl: string;
  description?: string;
  imageHint?: string;
};


// --- Tipos ---
// The representation in Firestore
export interface PetMemorial {
  id: number;
  name: string;
  species: string;
  sexo: string;
  age: string;
  family: string;
  birthDate: Timestamp;
  passingDate: Timestamp;
  arvore: string;
  local: string;
  tutores: string;
  text: string;
  images: PetImage[];
  qrCodeUrl: string;
  createdAt: Timestamp;
};


// The type used in forms, where dates are strings.
export type PetMemorialWithDatesAsString = Omit<PetMemorial, 'birthDate' | 'passingDate' | 'createdAt'> & {
    birthDate: string;
    passingDate: string;
    createdAt?: Timestamp;
};


// --- Funções do Serviço ---

/**
 * Busca todos os memoriais do Firestore, ordenados por data de criação.
 */
export async function getMemorials(): Promise<PetMemorial[]> {
  try {
    const q = query(memorialsCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as PetMemorial);
  } catch (error) {
    console.error("Erro ao buscar memoriais:", error);
    return [];
  }
}

/**
 * Busca um memorial específico pelo seu ID.
 */
export async function getMemorialById(id: number): Promise<PetMemorial | null> {
  try {
    const docRef = doc(db, 'memorials', id.toString());
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as PetMemorial;
    }
    return null;
  } catch (error) {
    console.error(`Erro ao buscar memorial com ID ${id}:`, error);
    return null;
  }
}


/**
 * Salva (cria ou atualiza) um memorial no Firestore.
 */
export async function saveMemorial(pet: PetMemorialWithDatesAsString): Promise<void> {
    const docRef = doc(db, 'memorials', pet.id.toString());
    
    // Helper function to safely convert a string to a Firestore Timestamp.
    const toTimestamp = (dateString: string | undefined): Timestamp => {
        if (!dateString) {
            // If the string is empty or undefined, return current time as a fallback.
            return Timestamp.now();
        }
        // The HTML date input format is YYYY-MM-DD.
        // new Date() can parse this, but it's safer to use UTC to avoid timezone issues.
        const date = new Date(`${dateString}T00:00:00Z`);
        if (isNaN(date.getTime())) {
            // If the date is invalid, return current time.
            return Timestamp.now();
        }
        return Timestamp.fromDate(date);
    };

    // Convert date strings back to Timestamps before saving
    const dataToSave: PetMemorial = {
        ...pet,
        birthDate: toTimestamp(pet.birthDate),
        passingDate: toTimestamp(pet.passingDate),
        createdAt: pet.createdAt || Timestamp.now(),
    };

    await setDoc(docRef, dataToSave, { merge: true });
}


/**
 * Deleta um memorial do Firestore.
 */
export async function deleteMemorial(id: number): Promise<void> {
  try {
    const docRef = doc(db, 'memorials', id.toString());
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Erro ao deletar memorial com ID ${id}:`, error);
    throw error;
  }
}

/**
 * Busca o maior ID existente para gerar o próximo.
 */
export async function getNextMemorialId(): Promise<number> {
    try {
        const q = query(memorialsCollection, orderBy('id', 'desc'), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const lastPet = querySnapshot.docs[0].data() as PetMemorial;
            return lastPet.id + 1;
        }
        return 1; // Se não houver nenhum, começa com 1
    } catch (error) {
        console.error("Erro ao buscar o próximo ID:", error);
        return 1; // Fallback em caso de erro
    }
}


/**
 * Saves a generic content document to Firestore.
 * @param contentId The ID of the document (e.g., 'homePageContent', 'generalContent').
 * @param data The data object to be saved.
 */
export async function saveContent<T extends object>(contentId: string, data: T): Promise<void> {
    try {
        const docRef = doc(db, 'siteContent', contentId);
        await setDoc(docRef, data, { merge: true });
    } catch (error) {
        console.error(`Error saving content with ID ${contentId}:`, error);
        throw error;
    }
}

/**
 * Busca um documento de conteúdo genérico do Firestore.
 * @param contentId O ID do documento a ser buscado.
 * @returns Os dados do conteúdo ou null se não encontrado.
 */
export async function getContent<T>(contentId: string): Promise<T | null> {
  try {
    const docRef = doc(db, 'siteContent', contentId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as T;
    }
    return null;
  } catch (error) {
    console.error(`Erro ao buscar conteúdo com ID ${contentId}:`, error);
    return null;
  }
}
