'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { getMemorials, saveMemorial, deleteMemorial, getNextMemorialId, PetMemorialWithDatesAsString } from '@/lib/firebase-service';
import { Upload, Trash2, Edit, PlusCircle, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import Image from 'next/image';
import { Timestamp } from 'firebase/firestore';

const petImageSchema = z.object({
  imageUrl: z.string().url(),
  description: z.string().optional(),
  imageHint: z.string().optional(),
});

const petMemorialSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Nome é obrigatório'),
  specie: z.string().min(1, 'Espécie é obrigatória'),
  sexo: z.string().optional(),
  age: z.string().optional(),
  family: z.string().optional(),
  birthDate: z.string().optional(),
  passingDate: z.string().optional(),
  arvore: z.string().optional(),
  local: z.string().optional(),
  tutores: z.string().optional(),
  text: z.string().optional(),
  images: z.array(petImageSchema).optional().default([]),
  qrCodeUrl: z.string().url().optional(),
});


const AdminMemorialsPage = () => {
  const [memorials, setMemorials] = useState<PetMemorialWithDatesAsString[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingMemorial, setEditingMemorial] = useState<PetMemorialWithDatesAsString | null>(null);
  const { toast } = useToast();

  const form = useForm<PetMemorialWithDatesAsString>({
    resolver: zodResolver(petMemorialSchema),
    defaultValues: {
      images: [],
    },
  });

  const fetchMemorials = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getMemorials();
      const memorialsWithDatesAsString = data.map(m => ({
        ...m,
        birthDate: timestampToString(m.birthDate),
        passingDate: timestampToString(m.passingDate),
        createdAt: timestampToString(m.createdAt),
      }));
      setMemorials(memorialsWithDatesAsString as any);
    } catch (error) {
      toast({ title: 'Erro ao buscar memoriais', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMemorials();
  }, [fetchMemorials]);
  
  const timestampToString = (ts: Timestamp | undefined) => {
    if (!ts) return '';
    return ts.toDate().toISOString().split('T')[0];
  };

  const handleOpenDialog = async (memorial: PetMemorialWithDatesAsString | null) => {
    if (memorial) {
      setEditingMemorial(memorial);
      form.reset({
        ...memorial,
        birthDate: memorial.birthDate,
        passingDate: memorial.passingDate,
      });
    } else {
      const nextId = await getNextMemorialId();
      const newMemorial = {
        id: nextId,
        name: '',
        specie: '',
        sexo: '',
        age: '',
        family: '',
        birthDate: '',
        passingDate: '',
        arvore: '',
        local: '',
        tutores: '',
        text: '',
        images: [],
        qrCodeUrl: '',
        createdAt: new Date().toISOString(),
      };
      setEditingMemorial(newMemorial);
      form.reset(newMemorial);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingMemorial(null);
    form.reset({ images: [] });
  };

  const onSubmit = async (data: PetMemorialWithDatesAsString) => {
    try {
      await saveMemorial(data);
      toast({ title: 'Sucesso!', description: 'Memorial salvo com sucesso.' });
      handleCloseDialog();
      fetchMemorials();
    } catch (error) {
      toast({ title: 'Erro ao salvar', description: (error as Error).message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMemorial(id);
      toast({ title: 'Sucesso!', description: 'Memorial deletado com sucesso.' });
      fetchMemorials();
    } catch (error) {
      toast({ title: 'Erro ao deletar', description: (error as Error).message, variant: 'destructive' });
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `memorials/${Date.now()}-${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      const currentImages = form.getValues('images') || [];
      form.setValue('images', [...currentImages, { imageUrl: downloadURL, description: '', imageHint: '' }]);
      toast({ title: 'Imagem carregada!' });
    } catch (error) {
      toast({ title: 'Erro no upload', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleRemoveImage = (indexToRemove: number) => {
    const currentImages = form.getValues('images') || [];
    const imageToRemove = currentImages[indexToRemove];
    
    // Optional: Delete from Firebase Storage
    if (imageToRemove.imageUrl.includes('firebasestorage')) {
        const storage = getStorage();
        const imageRef = ref(storage, imageToRemove.imageUrl);
        deleteObject(imageRef).catch(error => {
            console.error("Failed to delete image from storage:", error);
            toast({ title: 'Erro', description: 'Não foi possível remover a imagem do armazenamento.', variant: 'destructive' })
        });
    }

    form.setValue('images', currentImages.filter((_, index) => index !== indexToRemove));
  };


  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-3xl font-bold">Gerenciador de Memoriais</h1>
            <p className="text-muted-foreground">Crie, edite e remova os memoriais dos pets.</p>
        </div>
        <Button onClick={() => handleOpenDialog(null)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Memorial
        </Button>
      </div>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Espécie</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center">Carregando...</TableCell></TableRow>
              ) : memorials.length === 0 ? (
                 <TableRow><TableCell colSpan={4} className="text-center">Nenhum memorial encontrado.</TableCell></TableRow>
              ) : (
                memorials.map((memorial) => (
                  <TableRow key={memorial.id}>
                    <TableCell>#{memorial.id.toString().padStart(3, '0')}</TableCell>
                    <TableCell>{memorial.name}</TableCell>
                    <TableCell>{memorial.specie}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(memorial)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <Button variant="ghost" size="icon" className='text-destructive hover:text-destructive'>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                                  <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                  <AlertDialogDescription>Essa ação não pode ser desfeita. Isso irá deletar permanentemente o memorial de <strong>{memorial.name}</strong>.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(memorial.id)} className='bg-destructive hover:bg-destructive/90'>Deletar</AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMemorial?.id ? 'Editar' : 'Adicionar'} Memorial</DialogTitle>
          </DialogHeader>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField control={form.control} name="name" render={({ field }) => <FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                 <FormField control={form.control} name="specie" render={({ field }) => <FormItem><FormLabel>Espécie</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                 <FormField control={form.control} name="sexo" render={({ field }) => <FormItem><FormLabel>Sexo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                 <FormField control={form.control} name="age" render={({ field }) => <FormItem><FormLabel>Idade</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                 <FormField control={form.control} name="family" render={({ field }) => <FormItem><FormLabel>Família</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                 <FormField control={form.control} name="tutores" render={({ field }) => <FormItem><FormLabel>Tutores</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                 <FormField control={form.control} name="birthDate" render={({ field }) => <FormItem><FormLabel>Data de Nascimento</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>} />
                 <FormField control={form.control} name="passingDate" render={({ field }) => <FormItem><FormLabel>Data de Falecimento</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>} />
                 <FormField control={form.control} name="arvore" render={({ field }) => <FormItem><FormLabel>Árvore Plantada</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                 <FormField control={form.control} name="local" render={({ field }) => <FormItem><FormLabel>Local</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                 <FormField control={form.control} name="qrCodeUrl" render={({ field }) => <FormItem><FormLabel>URL do QR Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
              </div>
               <FormField control={form.control} name="text" render={({ field }) => <FormItem><FormLabel>Texto da Homenagem</FormLabel><FormControl><Textarea {...field} rows={5} /></FormControl><FormMessage /></FormItem>} />

              <div>
                <FormLabel>Imagens</FormLabel>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                    {form.watch('images')?.map((image, index) => (
                        <div key={index} className="relative group">
                            <Image src={image.imageUrl} alt={`preview ${index}`} width={150} height={150} className="rounded-md object-cover w-full aspect-square" />
                            <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => handleRemoveImage(index)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    <label className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {isUploading ? <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /> : <Upload className="h-8 w-8 text-muted-foreground" />}
                            <p className="text-xs text-muted-foreground mt-2">Adicionar Imagem</p>
                        </div>
                        <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" disabled={isUploading} />
                    </label>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancelar</Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                   {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                   Salvar
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMemorialsPage;
