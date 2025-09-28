'use server';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";

// Use server-only environment variables for server-side initialization
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Initialize a specific app for server actions to avoid conflicts with client-side app
const appName = 'firebase-server-app';
const app: FirebaseApp = !getApps().some(app => app.name === appName) ? initializeApp(firebaseConfig, appName) : getApp(appName);
const storage = getStorage(app);


/**
 * Uploads an image if it's a new base64 encoded string.
 * This is a server action and is executed securely on the server.
 * @param imageData - The image data, either a base64 string or an existing URL.
 * @returns The public URL of the uploaded or existing image.
 */
export async function uploadImage(imageData?: string): Promise<string> {
    // If imageData is not a base64 string, it's either an existing URL or empty.
    if (!imageData || !imageData.startsWith('data:image')) {
        return imageData || '';
    }

    try {
        const storageRef = ref(storage, `images/${Date.now()}-${Math.random().toString(36).substring(2)}`);
        const snapshot = await uploadString(storageRef, imageData, 'data_url');
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error("Error uploading image:", error);
        throw new Error("Falha no upload da imagem.");
    }
}
