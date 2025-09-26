'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { memorialPets as initialPets } from '@/lib/mock-data';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import { LogOut, Users, FileText, Settings, Plus, Edit, Trash2, Save, Upload, X, QrCode, ImagePlus } from 'lucide-react';

const petSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "O nome do pet é obrigatório."),
  species: z.string().min(1, "A raça é obrigatória."),
  sexo: z.string().min(1, "O sexo é obrigatório."),
  age: z.string().min(1, "A idade é obrigatória."),
  family: z.string().min(1, "A família é obrigatória."),
  birthDate: z.string().min(1, "A data de nascimento é obrigatória."),
  passingDate: z.string().min(1, "A data de falecimento é obrigatória."),
  arvore: z.string().min(1, "A árvore é obrigatória."),
  local: z.string().min(1, "O local é obrigatório."),
  tutores: z.string().min(1, "Os tutores são obrigatórios."),
  text: z.string().min(10, "O texto do memorial deve ter pelo menos 10 caracteres."),
  images: z.array(z.object({
      id: z.string(),
      imageUrl: z.string().url("Por favor, insira uma URL de imagem válida."),
      description: z.string().optional(),
      imageHint: z.string().optional()
  })).min(5, "É necessário adicionar pelo menos 5 imagens."),
  image: z.object({
      id: z.string(),
      imageUrl: z.string().url(),
      description: z.string(),
      imageHint: z.string()
  }).optional(),
});

type PetMemorial = z.infer<typeof petSchema>;

export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pets, setPets] = useState<PetMemorial[]>(initialPets);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<PetMemorial | null>(null);

  const form = useForm<PetMemorial>({
    resolver: zodResolver(petSchema),
    defaultValues: {
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
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "images"
  });

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('petEstrelaAuth') === 'authenticated';
    if (!isLoggedIn) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  useEffect(() => {
    if (editingPet) {
      form.reset(editingPet);
    } else {
      form.reset({
        name: '', species: '', sexo: '', age: '', family: '', birthDate: '', passingDate: '',
        arvore: '', local: '', tutores: '', text: '', images: [],
      });
    }
  }, [editingPet, form]);

  const handleLogout = () => {
    localStorage.removeItem('petEstrelaAuth');
    toast({ title: 'Logout realizado com sucesso.' });
    router.push('/');
  };

  const handleOpenForm = (pet: PetMemorial | null) => {
    setEditingPet(pet);
    setIsFormOpen(true);
  };
  
  const handleSavePet = (data: PetMemorial) => {
    if (editingPet) {
      // Update
      const updatedPets = pets.map(p => p.id === data.id ? { ...data, image: data.images[0] } : p);
      setPets(updatedPets);
      toast({ title: `Memorial de ${data.name} atualizado com sucesso.` });
    } else {
      // Create
      const newPet = { ...data, id: Date.now(), image: data.images[0] };
      setPets([newPet, ...pets]);
      toast({ title: `Memorial de ${data.name} criado com sucesso.` });
    }
    setIsFormOpen(false);
    setEditingPet(null);
  };

  const handleDeletePet = (petId: number) => {
    const petToDelete = pets.find(p => p.id === petId);
    if(petToDelete){
        setPets(pets.filter(p => p.id !== petId));
        toast({ title: `Memorial de ${petToDelete.name} excluído com sucesso.` });
    }
  };
  
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Verificando autenticação...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 p-4 sm:p-8">
      <div className="container mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-headline text-3xl font-bold text-gradient-luxury">
              Painel Administrativo
            </h1>
            <p className="text-muted-foreground">Pet Estrela Crematório</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </header>

        <Tabs defaultValue="pets" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pets"><Users className="mr-2" /> Gerenciar Pets</TabsTrigger>
            <TabsTrigger value="about"><FileText className="mr-2" /> Sobre Nós</TabsTrigger>
            <TabsTrigger value="general"><Settings className="mr-2" /> Conteúdo Geral</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pets" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Memoriais de Pets</CardTitle>
                <Button onClick={() => handleOpenForm(null)}>
                  <Plus className="mr-2" /> Novo Pet
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {pets.map((pet) => (
                    <Card key={pet.id} className="luxury-card overflow-hidden">
                      {pet.image && (
                        <div className="relative h-52 w-full">
                          <Image
                            src={pet.image.imageUrl}
                            alt={pet.image.description ?? ''}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className="font-headline text-2xl">{pet.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{pet.species} - {pet.age}</p>
                        <p className="text-sm text-muted-foreground">Família {pet.family}</p>
                      </CardHeader>
                      <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenForm(pet)}>
                          <Edit className="mr-2 h-4 w-4" /> Editar
                        </Button>
                         <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="mr-2 h-4 w-4" /> Excluir
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Isso excluirá permanentemente o memorial de {pet.name}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeletePet(pet.id)}>Excluir</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about" className="mt-6">
             <Card>
              <CardHeader>
                <CardTitle>Editar Seção "Sobre Nós"</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Funcionalidade em desenvolvimento.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="general" className="mt-6">
             <Card>
              <CardHeader>
                <CardTitle>Editar Conteúdo Geral</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Funcionalidade em desenvolvimento.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

       <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-3xl text-primary">
              {editingPet ? `Editar Memorial de ${editingPet.name}` : 'Criar Novo Memorial'}
            </DialogTitle>
             <DialogDescription>
              Preencha as informações abaixo para gerenciar o memorial.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSavePet)} className="space-y-6">
                <div className="mt-4 max-h-[70vh] overflow-y-auto pr-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nome</FormLabel><FormControl><Input placeholder="Nome do Pet" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="species" render={({ field }) => (<FormItem><FormLabel>Raça</FormLabel><FormControl><Input placeholder="Ex: Golden Retriever" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="sexo" render={({ field }) => (<FormItem><FormLabel>Sexo</FormLabel><FormControl><Input placeholder="Ex: Macho" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="age" render={({ field }) => (<FormItem><FormLabel>Idade</FormLabel><FormControl><Input placeholder="Ex: 8 anos" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="family" render={({ field }) => (<FormItem><FormLabel>Família</FormLabel><FormControl><Input placeholder="Ex: Família Silva" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="tutores" render={({ field }) => (<FormItem><FormLabel>Tutores</FormLabel><FormControl><Input placeholder="Ex: Maria e João" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="birthDate" render={({ field }) => (<FormItem><FormLabel>Data de Nascimento</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="passingDate" render={({ field }) => (<FormItem><FormLabel>Data de Falecimento</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="arvore" render={({ field }) => (<FormItem><FormLabel>Árvore Plantada</FormLabel><FormControl><Input placeholder="Ex: Ipê Amarelo" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="local" render={({ field }) => (<FormItem><FormLabel>Local</FormLabel><FormControl><Input placeholder="Ex: Jardim da Saudade" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    
                    <FormField control={form.control} name="text" render={({ field }) => (<FormItem><FormLabel>Texto Memorial</FormLabel><FormControl><Textarea placeholder="Escreva uma bela homenagem..." {...field} rows={5} /></FormControl><FormMessage /></FormItem>)} />

                    <div>
                        <Label>Fotos (Mínimo 5)</Label>
                         <p className="text-sm text-muted-foreground">Adicione as URLs das imagens. A primeira será a foto de capa.</p>
                         <div className="mt-2 space-y-2">
                         {fields.map((field, index) => (
                             <div key={field.id} className="flex items-center gap-2">
                                 <FormField
                                     control={form.control}
                                     name={`images.${index}.imageUrl`}
                                     render={({ field }) => (
                                         <FormItem className="flex-1">
                                             <FormControl>
                                                 <Input placeholder={`URL da Imagem ${index + 1}`} {...field} />
                                             </FormControl>
                                             <FormMessage />
                                         </FormItem>
                                     )}
                                 />
                                <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                             </div>
                         ))}
                         </div>
                         <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => append({ id: `img-${Date.now()}`, imageUrl: '' })}
                         >
                            <ImagePlus className="mr-2" /> Adicionar URL de Imagem
                         </Button>
                         <Controller
                            control={form.control}
                            name="images"
                            render={({ fieldState }) => <FormMessage>{fieldState.error?.message}</FormMessage>}
                         />
                    </div>
                </div>
                <DialogFooter className='flex justify-end gap-2 mt-6'>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button type="submit">Salvar Pet</Button>
                </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
    