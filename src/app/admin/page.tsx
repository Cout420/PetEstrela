
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { Loader2, PlusCircle, Trash2, X, Upload, LogOut, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';


import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { app } from '@/lib/firebase-config';

import { 
  getMemorials, 
  saveMemorial, 
  deleteMemorial, 
  getNextMemorialId,
  PetMemorial,
  PetMemorialWithDatesAsString
} from '@/lib/firebase-service';
import { shortenLink } from '@/ai/flows/shorten-link-flow';

// --- Zod Schema for Validation ---
const petImageSchema = z.object({
  imageUrl: z.string().min(1, 'URL da imagem é obrigatória.'),
  description: z.string().optional(),
  imageHint: z.string().optional(),
});

const petMemorialSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Nome é obrigatório.'),
  species: z.string().min(1, 'Espécie é obrigatória.'),
  sexo: z.string().min(1, 'Sexo é obrigatória.'),
  age: z.string().min(1, 'Idade é obrigatória.'),
  family: z.string().min(1, 'Família é obrigatória.'),
  birthDate: z.string().min(1, 'Data de nascimento é obrigatória.'),
  passingDate: z.string().min(1, 'Data de falecimento é obrigatória.'),
  arvore: z.string().min(1, 'Árvore é obrigatória.'),
  local: z.string().min(1, 'Local é obrigatória.'),
  tutores: z.string().min(1, 'Tutores são obrigatórios.'),
  text: z.string().min(1, 'Texto da homenagem é obrigatório.'),
  images: z.array(petImageSchema).min(1, 'É necessário pelo menos uma imagem.'),
  qrCodeUrl: z.string().url().optional().or(z.literal('')),
});

const storage = getStorage(app);

// Helper para converter Timestamp para string 'yyyy-MM-dd'
const timestampToString = (ts: any): string => {
  if (!ts) return '';
  try {
    return format(ts.toDate(), 'yyyy-MM-dd');
  } catch (e) {
    // Se já for uma string (durante a edição), apenas retorne
    if (typeof ts === 'string') return ts;
    return '';
  }
};


const AdminMemorialsPage = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [memorials, setMemorials] = useState<PetMemorial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMemorial, setEditingMemorial] = useState<PetMemorialWithDatesAsString | null>(null);

  const form = useForm<PetMemorialWithDatesAsString>({
    resolver: zodResolver(petMemorialSchema),
    mode: 'onChange',
  });

  const { control, handleSubmit, reset, setValue } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "images" });

  const loadMemorials = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getMemorials();
      setMemorials(data);
    } catch (error) {
      toast({
        title: 'Erro ao carregar memoriais',
        description: 'Não foi possível buscar os dados. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadMemorials();
  }, [loadMemorials]);

  const handleSignOut = () => {
    toast({ title: 'Você saiu da sua conta.' });
    router.push('/login');
  };

  const handleOpenDialog = async (memorial: PetMemorial | null) => {
    if (memorial) {
      // Editando
      const memorialWithStringDates = {
        ...memorial,
        birthDate: timestampToString(memorial.birthDate),
        passingDate: timestampToString(memorial.passingDate),
        qrCodeUrl: memorial.qrCodeUrl || '',
      };
      setEditingMemorial(memorialWithStringDates);
      reset(memorialWithStringDates);
    } else {
      // Criando
      const nextId = await getNextMemorialId();
      const newMemorial: PetMemorialWithDatesAsString = {
        id: nextId,
        name: '',
        species: '',
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
      };
      setEditingMemorial(newMemorial);
      reset(newMemorial);
    }
    setIsDialogOpen(true);
  };
  
  const handleDelete = async (id: number) => {
    try {
      await deleteMemorial(id);
      toast({
        title: 'Sucesso!',
        description: `Memorial #${id} deletado com sucesso.`,
      });
      loadMemorials(); // Recarrega a lista
    } catch (error) {
      toast({
        title: 'Erro ao deletar',
        description: 'Não foi possível remover o memorial. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    setIsUploading(true);
    try {
       const fileName = `memorials/${Date.now()}-${file.name}`;
       const storageRef = ref(storage, fileName);
       const snapshot = await uploadBytes(storageRef, file);
       const downloadURL = await getDownloadURL(snapshot.ref);

      append({ imageUrl: downloadURL, description: '', imageHint: '' });
      toast({
        title: 'Upload Concluído',
        description: 'A imagem foi carregada com sucesso.',
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: 'Falha no Upload',
        description: 'Não foi possível carregar a imagem. Verifique o console.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: PetMemorialWithDatesAsString) => {
    setIsSubmitting(true);
    try {
      // Gera o shortlink/QR code URL se não existir
      let finalData = { ...data };
      if (!finalData.qrCodeUrl) {
          const { shortUrl } = await shortenLink({ memorialId: data.id });
          finalData.qrCodeUrl = shortUrl;
      }
      
      await saveMemorial(finalData);
      
      toast({
        title: 'Sucesso!',
        description: `Memorial para ${data.name} foi salvo com sucesso.`,
      });
      
      setIsDialogOpen(false);
      setEditingMemorial(null);
      loadMemorials();

    } catch (error) {
      console.error("Failed to save memorial:", error);
      toast({
        title: 'Erro ao Salvar',
        description: 'Não foi possível salvar o memorial. Verifique o console para detalhes.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && memorials.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40 p-4 sm:p-8">
      <div className="container mx-auto">
        <header className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gerenciador de Memoriais</h1>
            <p className="text-muted-foreground">Adicione, edite ou remova os memoriais dos pets.</p>
          </div>
          <div className='flex items-center gap-4'>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                 <Button onClick={() => handleOpenDialog(null)}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Memorial
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingMemorial?.id ? `Editando Memorial #${editingMemorial.id}` : 'Criar Novo Memorial'}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Campos do formulário */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField name="name" control={control} render={({ field }) => (
                        <FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField name="species" control={control} render={({ field }) => (
                        <FormItem><FormLabel>Espécie/Raça</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField name="sexo" control={control} render={({ field }) => (
                        <FormItem><FormLabel>Sexo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                       <FormField name="age" control={control} render={({ field }) => (
                        <FormItem><FormLabel>Idade</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField name="family" control={control} render={({ field }) => (
                        <FormItem><FormLabel>Família</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                       <FormField name="tutores" control={control} render={({ field }) => (
                        <FormItem><FormLabel>Tutores</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField name="birthDate" control={control} render={({ field }) => (
                        <FormItem><FormLabel>Data de Nascimento</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField name="passingDate" control={control} render={({ field }) => (
                        <FormItem><FormLabel>Data de Falecimento</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                       <FormField name="arvore" control={control} render={({ field }) => (
                        <FormItem><FormLabel>Árvore Plantada</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField name="local" control={control} render={({ field }) => (
                        <FormItem><FormLabel>Local</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <FormField name="text" control={control} render={({ field }) => (
                      <FormItem><FormLabel>Texto da Homenagem</FormLabel><FormControl><Textarea rows={5} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />

                    {/* Gerenciamento de Imagens */}
                    <div className="space-y-4">
                      <FormLabel>Imagens</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {fields.map((item, index) => (
                           <div key={item.id} className="relative group">
                            <Image src={item.imageUrl} alt={`Imagem ${index+1}`} width={150} height={150} className="rounded-md object-cover aspect-square w-full" />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => remove(index)}
                              disabled={isSubmitting || isUploading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                           </div>
                        ))}
                         <label className="flex flex-col items-center justify-center w-full h-full aspect-square rounded-md border-2 border-dashed border-muted-foreground/50 cursor-pointer hover:bg-muted">
                           {isUploading ? (
                              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                           ) : (
                              <Upload className="h-8 w-8 text-muted-foreground" />
                           )}
                           <span className="text-sm text-muted-foreground mt-2 text-center">
                             {isUploading ? 'Enviando...' : 'Adicionar Imagem'}
                           </span>
                           <input type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])} disabled={isSubmitting || isUploading} />
                         </label>
                      </div>
                      <FormMessage>{form.formState.errors.images?.message || form.formState.errors.images?.root?.message}</FormMessage>
                    </div>

                    <DialogFooter>
                      <DialogClose asChild><Button type="button" variant="outline" disabled={isSubmitting}>Cancelar</Button></DialogClose>
                      <Button type="submit" disabled={isSubmitting || isUploading}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Salvar
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            <Button onClick={handleSignOut} variant="outline">
              <LogOut className="mr-2 h-4 w-4" /> Sair
            </Button>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Memoriais Cadastrados</CardTitle>
            <CardDescription>Lista de todos os memoriais de pets no sistema.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Espécie</TableHead>
                  <TableHead>Família</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && memorials.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center h-24">Carregando memoriais...</TableCell></TableRow>
                ) : memorials.length === 0 ? (
                   <TableRow><TableCell colSpan={5} className="text-center h-24">Nenhum memorial encontrado.</TableCell></TableRow>
                ) : (
                  memorials.map((memorial) => (
                    <TableRow key={memorial.id}>
                      <TableCell className="font-mono">#{String(memorial.id).padStart(3, '0')}</TableCell>
                      <TableCell className="font-medium">{memorial.name}</TableCell>
                      <TableCell>{memorial.species}</TableCell>
                      <TableCell>{memorial.family}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(memorial)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita. Isso irá deletar permanentemente o memorial de <strong>{memorial.name}</strong>.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(memorial.id)}>Deletar</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminMemorialsPage;

    