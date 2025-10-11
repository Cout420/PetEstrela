"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Esta página redireciona /admin para /admin/login
export default function AdminPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/admin/login');
    }, [router]);

    // Renderiza um estado de carregamento para evitar um flash de página em branco
    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Redirecionando para o painel...</p>
        </div>
    );
}
