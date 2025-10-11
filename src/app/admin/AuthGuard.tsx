"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/provider';

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    // Pode mostrar um spinner de carregamento aqui
    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Carregando...</p>
        </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
