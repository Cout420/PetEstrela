
"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, getDoc, setDoc, addDoc, deleteDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useFirebase } from '@/firebase/provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Trash, Upload } from 'lucide-react';
import AuthGuard from '@/app/admin/AuthGuard';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

const formSchema = z.object({
  name: z.string().optional(),
  memorialCode: z.string().optional(),
  tutors: z.string().optional(),
  animalType: z.string().optional(),
  sex: z.enum(['Macho', 'Fêmea']).optional(),
  breed: z.string().optional(),
  birthDate: z.string().optional(),
  cremationDate: z.string().optional(),
  tree: z.string().optional(),
  shortDescription: z.string().optional(),
  fullDescription: z.string().optional(),
  images: z.array(z.object({ value: z.any() })).optional(),
});

type PetFormValues = z.infer<typeof formSchema>;

const EditPetPage = () => {
    const { id } = useParams();
    const { firestore } = useFirebase();
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const isNew = id === 'new';

    const form = useForm<PetFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            memorialCode: '',
            tutors: '',
            animalType: 'Cão',
            sex: 'Macho',
            breed: '',
            birthDate: '',
            cremationDate: '',
            tree: '',
            shortDescription: '',
            fullDescription: '',
            images: [{ value: '' }],
        },
    });
    
    const { fields, append, remove } = useFieldArray({
        name: "images",
        control: form.control,
    });

    const watchedImages = form.watch("images");

    useEffect(() => {
        if (!firestore || isNew) {
            setIsLoading(false);
            return;
        }

        const fetchPet = async () => {
            try {
                const docRef = doc(firestore, 'pet_profiles', id as string);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const birthDate = data.birthDate?.toDate ? data.birthDate.toDate().toISOString().split('T')[0] : data.birthDate || '';
                    const cremationDate = data.cremationDate?.toDate ? data.cremationDate.toDate().toISOString().split('T')[0] : data.cremationDate || '';
                    
                    form.reset({
                        ...data,
                        birthDate,
                        cremationDate,
                        images: data.imageUrls?.map((url: string) => ({ value: url })) || [{value: ''}]
                    });
                } else {
                    toast({ variant: 'destructive', title: 'Erro', description: 'Memorial não encontrado.' });
                    router.push('/admin/dashboard');
                }
            } catch (error) {
                 toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar os dados do memorial.' });
            } finally {
                setIsLoading(false);
            }
        };

        fetchPet();
    }, [id, firestore, form, router, toast, isNew]);

    const onSubmit = async (data: PetFormValues) => {
        if (!firestore) return;
        setIsSaving(true);
        
        try {
            // Use a placeholder image if no image is provided
            const imageUrls = (data.images && data.images.some(img => typeof img.value === 'string' && img.value.startsWith('http')))
                ? data.images.map(img => img.value).filter(v => typeof v === 'string' && v.startsWith('http'))
                : [`https://picsum.photos/seed/${Date.now()}/600/600`];


            const processedData = {
                ...data,
                birthDate: data.birthDate ? new Date(data.birthDate) : null,
                cremationDate: data.cremationDate ? new Date(data.cremationDate) : null,
                imageUrls,
                images: undefined, // Remove 'images' para não ser salvo no Firestore
                updatedAt: serverTimestamp(),
            };

            if (isNew) {
                const newData = { ...processedData, createdAt: serverTimestamp() };
                await addDoc(collection(firestore, 'pet_profiles'), newData);
                toast({ title: 'Sucesso!', description: 'Novo memorial criado.' });
            } else {
                const docRef = doc(firestore, 'pet_profiles', id as string);
                await setDoc(docRef, processedData, { merge: true });
                toast({ title: 'Sucesso!', description: 'Memorial atualizado.' });
            }
            router.push('/admin/dashboard');
            router.refresh(); 
        } catch (error) {
            console.error("Erro ao salvar:", error);
            const errorMessage = error instanceof Error ? error.message : 'Não foi possível salvar o memorial.';
            toast({ variant: 'destructive', title: 'Erro', description: errorMessage });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleDelete = async () => {
        if (!firestore || isNew) return;

        if (confirm('Tem certeza que deseja excluir este memorial? Esta ação é irreversível.')) {
            try {
                await deleteDoc(doc(firestore, 'pet_profiles', id as string));
                toast({ title: 'Sucesso!', description: 'Memorial excluído.' });
                router.push('/admin/dashboard');
                router.refresh();
            } catch (error) {
                toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir o memorial.' });
            }
        }
    };

    if (isLoading) {
        return (
             <div className="min-h-screen bg-background p-8">
                <header className="container mx-auto max-w-4xl px-4 h-16 flex items-center mb-8">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <Skeleton className="h-8 w-48 ml-4" />
                </header>
                <main className="container mx-auto max-w-4xl px-4 space-y-8">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
                        <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
                        <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
                        <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
                    </div>
                     <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-20 w-full" /></div>
                     <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-40 w-full" /></div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
             <header className="bg-white border-b sticky top-0 z-10">
                <div className="container mx-auto max-w-4xl px-4 h-16 flex items-center">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/admin/dashboard')}>
                        <ArrowLeft />
                    </Button>
                    <h1 className="font-headline text-2xl text-primary ml-4">
                        {isNew ? 'Novo Memorial' : 'Editar Memorial'}
                    </h1>
                </div>
            </header>
            <main className="container mx-auto max-w-4xl px-4 py-8">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome do Pet</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="memorialCode" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Protocolo</FormLabel>
                                    <FormControl><Input placeholder="#001" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="tutors" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tutores</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                           <FormField control={form.control} name="animalType" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de Animal</FormLabel>
                                    <FormControl><Input placeholder="Cão, Gato..." {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={form.control} name="sex" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sexo</FormLabel>
                                     <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Macho">Macho</SelectItem>
                                            <SelectItem value="Fêmea">Fêmea</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={form.control} name="breed" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Raça</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={form.control} name="birthDate" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Data de Nascimento</FormLabel>
                                    <FormControl><Input type="date" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={form.control} name="cremationDate" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Data de Cremação</FormLabel>
                                    <FormControl><Input type="date" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                         <FormField control={form.control} name="tree" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Árvore Memorial</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="shortDescription" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Descrição Curta</FormLabel>
                                <FormControl><Textarea {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="fullDescription" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Descrição Completa / Homenagem</FormLabel>
                                <FormControl><Textarea className="min-h-[150px]" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <div>
                            <Label>Imagens</Label>
                            <p className="text-sm text-muted-foreground mb-4">
                                O upload de imagens está desativado para evitar custos. Uma imagem de placeholder será usada no lugar.
                            </p>
                            <div className="space-y-4 mt-2 opacity-50 cursor-not-allowed">
                                {fields.map((field, index) => {
                                    const currentImage = watchedImages?.[index]?.value;
                                    const previewUrl = currentImage instanceof File
                                        ? URL.createObjectURL(currentImage)
                                        : (typeof currentImage === 'string' ? currentImage : null);

                                    return (
                                        <div key={field.id} className="flex items-center gap-4">
                                            <div className="w-24 h-24 relative bg-muted rounded-md overflow-hidden flex items-center justify-center">
                                                {previewUrl ? (
                                                    <Image src={previewUrl} alt={`Preview ${index}`} fill className="object-cover" />
                                                ) : (
                                                    <Upload className="text-muted-foreground" />
                                                )}
                                            </div>
                                            <div className="flex-grow">
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    disabled
                                                    className="file:text-primary file:font-semibold"
                                                />
                                            </div>
                                            <Button type="button" variant="ghost" size="icon" disabled>
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                            <Button type="button" variant="outline" size="sm" className="mt-4" disabled>
                                Adicionar Imagem
                            </Button>
                        </div>


                        <div className="flex justify-between items-center pt-8">
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? 'Salvando...' : 'Salvar Memorial'}
                            </Button>
                            {!isNew && (
                                <Button type="button" variant="destructive" onClick={handleDelete} disabled={isSaving}>
                                    Excluir Memorial
                                </Button>
                            )}
                        </div>
                    </form>
                </Form>
            </main>
        </div>
    );
};

export default function GuardedEditPetPage() {
    return (
        <AuthGuard>
            <EditPetPage />
        </AuthGuard>
    );
}
