
'use client';

import React, { ReactNode } from 'react';
import { initializeFirebase, FirebaseProvider as CoreFirebaseProvider } from '@/firebase';

// This component ensures Firebase is initialized once on the client.
export const FirebaseProvider = ({ children }: { children: ReactNode }) => {
  const { firebaseApp, firestore, auth, storage } = initializeFirebase();

  return (
    <CoreFirebaseProvider
      firebaseApp={firebaseApp}
      firestore={firestore}
      auth={auth}
      storage={storage}
    >
      {children}
    </CoreFirebaseProvider>
  );
};
