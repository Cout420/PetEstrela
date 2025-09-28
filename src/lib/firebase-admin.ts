import * as admin from 'firebase-admin';

// This ensures we don't try to re-initialize the app on hot reloads.
const getAdminApp = () => {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  // The service account key is read from an environment variable.
  // This is a secure way to handle credentials on the server.
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountString) {
    throw new Error('The FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountString);

    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } catch (e: any) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Make sure it is a valid JSON string.', e);
    throw new Error('Firebase Admin initialization failed.');
  }
};

export { getAdminApp };
