'use server';

import { getFirestore, collection, getDocs, doc, getDoc, setDoc, deleteDoc, query, orderBy, limit, writeBatch, QueryDocumentSnapshot, DocumentData, Timestamp } from 'firebase/firestore';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { firebaseConfig } from './firebase-config';

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

const memorialsCollection = collection(db, 'memorials');
const contentCollection = collection(db, 'siteContent');

type PetImage = {
  imageUrl: string;
  description?: string;
  imageHint?: string;
};

// --- Tipos ---
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
}

export type PetMemorialWithDatesAsString = Omit<PetMemorial, 'birthDate' | 'passingDate'> & {
    birthDate: string;
    passingDate: string;
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
    
    const dataToSave = {
        ...pet,
        birthDate: Timestamp.fromDate(new Date(pet.birthDate)),
        passingDate: Timestamp.fromDate(new Date(pet.passingDate)),
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

// Em um arquivo de serviço Firebase (ex: src/lib/firebase-service.ts)

/**
 * Faz o upload de um arquivo para o Firebase Storage.
 * @param file O arquivo a ser enviado.
 * @param path O caminho no Storage onde o arquivo será salvo (ex: 'memorials/').
 * @returns A URL de download do arquivo.
 */
// export async function uploadFile(file: File, path: string): Promise<string> {
//   const storage = getStorage(app);
//   const fileName = `${Date.now()}-${file.name}`;
//   const storageRef = ref(storage, `${path}${fileName}`);

//   const snapshot = await uploadBytes(storageRef, file);
//   const downloadURL = await getDownloadURL(snapshot.ref);
//   return downloadURL;
// }