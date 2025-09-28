

'use server';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, deleteDoc, query, orderBy, limit, writeBatch, QueryDocumentSnapshot, DocumentData, Timestamp } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from "firebase/storage";


// Sua configuração do Firebase virá do .env.local
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Inicializa o Firebase
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);

const memorialsCollection = collection(db, 'memorials');
const contentCollection = collection(db, 'siteContent');

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
  images: {
      id: string;
      imageUrl: string;
      description?: string;
      imageHint?: string;
  }[];
  qrCodeUrl?: string;
  createdAt: Timestamp;
};


// --- Funções do Serviço ---

/**
 * Uploads a base64 encoded image string to Firebase Storage and returns the public URL.
 * If the string is already a URL, it returns it as is.
 * @param imageString The base64 data URI or an existing HTTPS URL.
 * @param path The path in storage to save the image (e.g., 'memorials', 'site-content').
 * @returns The public downloadable URL of the image.
 */
export async function uploadImageAndGetURL(imageString: string, path: string): Promise<string> {
  // If the string is empty, null, or undefined, return it as is.
  if (!imageString) {
    return imageString;
  }
  
  // If it's a data URI (a new file upload), upload it to Storage.
  if (imageString.startsWith('data:image')) {
    const fileType = imageString.split(';')[0].split('/')[1];
    const storageRef = ref(storage, `${path}/${Date.now()}.${fileType}`);
    
    // We need to strip the 'data:image/jpeg;base64,' part from the string
    const base64Data = imageString.split(',')[1];

    try {
      const snapshot = await uploadString(storageRef, base64Data, 'base64');
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload image.");
    }
  }

  // If it's already an http/https URL, it means the image was not changed, so return the existing URL.
  if (imageString.startsWith('http')) {
    return imageString;
  }
  
  // If it's neither a data URI nor a URL, it's likely invalid data.
  // For robustness, we return it, but you might want to throw an error
  // depending on expected behavior.
  return imageString;
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

// The type used in forms, where dates are strings.
export type PetMemorialWithDatesAsString = Omit<PetMemorial, 'birthDate' | 'passingDate' | 'createdAt'> & {
    birthDate: string;
    passingDate: string;
    createdAt?: Timestamp;
};

/**
 * Salva (cria ou atualiza) um memorial no Firestore.
 */
export async function saveMemorial(pet: PetMemorialWithDatesAsString): Promise<void> {
    const docRef = doc(db, 'memorials', pet.id.toString());

    // Process images: upload new ones and keep existing URLs.
    const processedImages = await Promise.all(
        pet.images.map(async (image) => {
            try {
                const newUrl = await uploadImageAndGetURL(image.imageUrl, `memorials/${pet.id}`);
                return { ...image, imageUrl: newUrl };
            } catch (uploadError) {
                console.error(`Failed to upload image for memorial ${pet.id}.`, uploadError);
                // Decide how to handle a failed upload. Here, we're throwing the error.
                throw new Error(`Image upload failed: ${uploadError instanceof Error ? uploadError.message : String(uploadError)}`);
            }
        })
    );
    
    // Convert string dates from the form back to Timestamps for Firestore
    const dataToSave: PetMemorial = {
        ...pet,
        images: processedImages,
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
 * Salva um documento de conteúdo genérico no Firestore.
 * @param contentId O ID do documento (ex: 'homePageContent', 'generalContent').
 * @param data O objeto de dados a ser salvo.
 */
export async function saveContent<T>(contentId: string, data: T): Promise<void> {
  try {
    const docRef = doc(db, 'siteContent', contentId);
    await setDoc(docRef, { data }, { merge: true });
  } catch (error) {
    console.error(`Erro ao salvar conteúdo com ID ${contentId}:`, error);
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
      return docSnap.data().data as T;
    }
    return null;
  } catch (error) {
    console.error(`Erro ao buscar conteúdo com ID ${contentId}:`, error);
    return null;
  }
}
