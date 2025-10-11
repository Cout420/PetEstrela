
"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, getDoc, setDoc, addDoc, deleteDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const imageSchema = z.union([
    z.string().url("URL inválida."),
    z.instanceof(File).refine(
        (file) => file.size > 0 && ACCEPTED_IMAGE_TYPES.includes(file.type),
        "Por favor, selecione um arquivo de imagem válido (JPG, PNG, WEBP)."
    )
]);

const formSchema = z.object({
  name: z.string().min(2, "O nome é obrigatório."),
  memorialCode: z.string().min(1, "O protocolo é obrigatório.").regex(/^#\d{3,}$/, "O protocolo deve seguir o formato #001."),
  tutors: z.string().min(2, "O nome do tutor é obrigatório."),
  animalType: z.string().min(2, "O tipo do animal é obrigatório."),
  sex: z.enum(['Macho', 'Fêmea']),
  breed: z.string().min(2, "A raça é obrigatória."),
  birthDate: z.string().min(1, "A data de nascimento é obrigatória."),
  cremationDate: z.string().min(1, "A data de cremação é obrigatória."),
  tree: z.string().min(2, "A árvore memorial é obrigatória."),
  shortDescription: z.string().min(10, "A descrição curta é obrigatória."),
  fullDescription: z.string().min(20, "A descrição completa é obrigatória."),
  images: z.array(z.object({ value: imageSchema })).min(1, "É necessário pelo menos uma imagem."),
});

type PetFormValues = z.infer<typeof formSchema>;

const EditPetPage = () => {
    const { id } = useParams();
    const { firestore, storage } = useFirebase();
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
    
    const { fields, append, remove, update } = useFieldArray({
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

    const uploadImage = async (file: File): Promise<string> => {
        if (!storage) throw new Error("Firebase Storage não está disponível");
        const storageRef = ref(storage, `pet_images/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        return getDownloadURL(storageRef);
    };

    const onSubmit = async (data: PetFormValues) => {
        if (!firestore) return;
        setIsSaving(true);
        
        try {
            const imageUrls: string[] = [];
            for (const image of data.images) {
                if (typeof image.value === 'string' && image.value.startsWith('http')) {
                    imageUrls.push(image.value);
                } else if (image.value instanceof File) {
                    const newUrl = await uploadImage(image.value);
                    imageUrls.push(newUrl);
                }
            }

            const processedData = {
                ...data,
                birthDate: new Date(data.birthDate),
                cremationDate: new Date(data.cremationDate),
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
                                     <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                            <div className="space-y-4 mt-2">
                                {fields.map((field, index) => {
                                    const currentImage = watchedImages[index]?.value;
                                    const previewUrl = currentImage instanceof File
                                        ? URL.createObjectURL(currentImage)
                                        : (typeof currentImage === 'string' ? currentImage : null);

                                    return (
                                        <FormField
                                            key={field.id}
                                            control={form.control}
                                            name={`images.${index}.value`}
                                            render={({ field: { onChange, ...restField } }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-24 h-24 relative bg-muted rounded-md overflow-hidden flex items-center justify-center">
                                                            {previewUrl ? (
                                                                <Image src={previewUrl} alt={`Preview ${index}`} fill className="object-cover" />
                                                            ) : (
                                                                <Upload className="text-muted-foreground" />
                                                            )}
                                                        </div>
                                                        <div className="flex-grow">
                                                            <FormControl>
                                                                <Input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file) onChange(file);
                                                                    }}
                                                                    className="file:text-primary file:font-semibold"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </div>
                                                        <Button type="button" variant="ghost" size="icon" onClick={() => fields.length > 1 && remove(index)}>
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                    );
                                })}
                            </div>
                            <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ value: "" })}>
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


    