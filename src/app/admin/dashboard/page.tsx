
"use client";

import React from 'react';
import { collection, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirebase, useMemoFirebase } from '@/firebase/provider';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { PlusCircle, LogOut } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import AuthGuard from '@/app/admin/AuthGuard';
import { useToast } from '@/hooks/use-toast';

type PetProfile = {
  id: string;
  name: string;
  memorialCode: string;
  imageUrls: string[];
  cremationDate: string | { toDate: () => Date };
};

const PetCard = ({ pet, onDelete }: { pet: PetProfile, onDelete: (id: string) => void }) => {
    const formatDate = (dateValue: string | { toDate: () => Date }) => {
        if (!dateValue) return 'Data não informada';
        const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue.toDate();
         if (typeof dateValue === 'string') {
            const offset = date.getTimezoneOffset();
            date.setMinutes(date.getMinutes() + offset);
        }
        return date.toLocaleDateString('pt-BR');
    };

    return (
        <Card className="overflow-hidden">
            <CardContent className="p-0">
                <div className="relative aspect-square">
                    {pet.imageUrls?.[0] ? (
                        <Image src={pet.imageUrls[0]} alt={pet.name} fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                            <span className='text-sm text-muted-foreground'>Sem foto</span>
                        </div>
                    )}
                    <Badge className="absolute top-2 left-2">{pet.memorialCode}</Badge>
                </div>
                <div className="p-4">
                    <h3 className="font-bold text-lg">{pet.name}</h3>
                    <p className="text-sm text-muted-foreground">
                        Cremação: {formatDate(pet.cremationDate)}
                    </p>
                    <div className="flex gap-2 mt-4">
                        <Button asChild variant="outline" size="sm">
                            <Link href={`/admin/edit/${pet.id}`}>Editar</Link>
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => onDelete(pet.id)}>
                            Excluir
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};


const DashboardPage = () => {
    const { firestore, auth } = useFirebase();
    const router = useRouter();
    const { toast } = useToast();

    const petProfilesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        // Ordena por código do memorial em ordem decrescente para mostrar os mais novos primeiro.
        return query(collection(firestore, 'pet_profiles'), orderBy('memorialCode', 'desc'));
    }, [firestore]);

    const { data: pets, isLoading } = useCollection<PetProfile>(petProfilesQuery);

    const handleLogout = async () => {
        if (auth) {
            await auth.signOut();
            router.push('/admin/login');
        }
    };

    const handleDelete = async (id: string) => {
        if (!firestore) return;
        if (confirm('Tem certeza que deseja excluir este memorial? Esta ação não pode ser desfeita.')) {
            try {
                await deleteDoc(doc(firestore, 'pet_profiles', id));
                toast({ title: "Sucesso!", description: "Memorial excluído com sucesso." });
            } catch (error) {
                console.error("Erro ao excluir o memorial:", error);
                toast({ variant: "destructive", title: "Erro", description: "Não foi possível excluir o memorial." });
            }
        }
    };
    
    return (
        <div className="min-h-screen bg-background">
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="container mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
                    <h1 className="font-headline text-2xl text-primary">Painel de Controle</h1>
                    <Button variant="ghost" onClick={handleLogout} size="sm">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair
                    </Button>
                </div>
            </header>

            <main className="container mx-auto max-w-7xl px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-semibold">Memoriais Cadastrados</h2>
                    <Button asChild>
                        <Link href="/admin/edit/new">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Novo Memorial
                        </Link>
                    </Button>
                </div>

                {isLoading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <Card key={i}>
                                <Skeleton className="aspect-square w-full" />
                                <div className="p-4 space-y-2">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
                
                {pets && pets.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {pets.map(pet => (
                            <PetCard key={pet.id} pet={pet} onDelete={handleDelete} />
                        ))}
                    </div>
                )}

                {!isLoading && (!pets || pets.length === 0) && (
                    <div className="text-center py-16 border-dashed border-2 rounded-lg">
                        <p className="text-muted-foreground">Nenhum memorial encontrado.</p>
                        <p className="text-muted-foreground text-sm">Comece adicionando um novo memorial.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default function GuardedDashboard() {
    return (
        <AuthGuard>
            <DashboardPage />
        </AuthGuard>
    );
}
