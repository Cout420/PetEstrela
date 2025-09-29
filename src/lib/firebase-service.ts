
'use server';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, deleteDoc, query, orderBy, limit, writeBatch, QueryDocumentSnapshot, DocumentData, Timestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from './firebase-config'; // Import configured app

const db = getFirestore(app);
const storage = getStorage(app);

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
 * Uploads an image to Firebase Storage and returns its public URL.
 * @param file The image file to upload.
 * @param path The path in storage to upload the file to (e.g., 'memorials/images').
 * @returns The public URL of the uploaded image.
 */
export async function uploadImage(file: File, path: string): Promise<string> {
  if (!file) {
    throw new Error('No file provided for upload.');
  }
  
  // Create a unique file name to prevent overwrites
  const fileName = `${path}/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, fileName);

  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error(`Error uploading image to ${path}:`, error);
    throw new Error('Failed to upload image.');
  }
}

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
    // Returns current Timestamp if the string is invalid or empty.
    const toTimestamp = (dateString: string | undefined): Timestamp => {
        if (dateString) {
           try {
            // Handles both YYYY-MM-DD and full ISO strings
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                return Timestamp.fromDate(date);
            }
           } catch (e) {
             // Ignore parsing errors and fall through to default
           }
        }
        // Return a default value for invalid or missing dates to prevent crashes.
        return Timestamp.now();
    };

    // Convert date strings back to Timestamps before saving
    const dataToSave: PetMemorial = {
        ...pet,
        images: pet.images.map(({ imageUrl, description, imageHint }) => ({
            imageUrl: imageUrl || '',
            description: description || '',
            imageHint: imageHint || ''
        })),
        birthDate: toTimestamp(pet.birthDate),
        passingDate: toTimestamp(pet.passingDate),
        // If createdAt exists (it's an edit), keep it. Otherwise (it's new), create it.
        createdAt: pet.createdAt instanceof Timestamp ? pet.createdAt : Timestamp.now(),
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
