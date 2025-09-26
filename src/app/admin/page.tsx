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
import { memorialPets as initialPets, teamMembers as initialTeamMembers } from '@/lib/mock-data';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import { LogOut, Users, FileText, Settings, Plus, Edit, Trash2, Save, Upload, X, QrCode, ImagePlus } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

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

const aboutPageSchema = z.object({
  headerTitle: z.string().min(1, "Título é obrigatório."),
  headerDescription: z.string().min(1, "Descrição do cabeçalho é obrigatória."),
  missionTitle: z.string().min(1, "Título da missão é obrigatório."),
  missionDescription: z.string().min(1, "Descrição da missão é obrigatória."),
  missionImageUrl: z.string().url("URL da imagem da missão é obrigatória."),
  historyTitle: z.string().min(1, "Título da história é obrigatório."),
  historyDescription: z.string().min(1, "Descrição da história é obrigatória."),
  historyImageUrl: z.string().url("URL da imagem da história é obrigatória."),
});

type AboutPageContent = z.infer<typeof aboutPageSchema>;

const generalContentSchema = z.object({
  whatsappNumber: z.string().min(10, "Número do WhatsApp é obrigatório."),
  whatsappLink: z.string().url("Link do WhatsApp é obrigatório."),
  phone: z.string().min(10, "Número de telefone é obrigatório."),
  address: z.string().min(10, "Endereço é obrigatório."),
  instagramLink: z.string().url("Link do Instagram é obrigatório."),
});

type GeneralContent = z.infer<typeof generalContentSchema>;

export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pets, setPets] = useState<PetMemorial[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<PetMemorial | null>(null);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('petEstrelaAuth') === 'authenticated';
    if (!isLoggedIn) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
      const storedPets = localStorage.getItem('memorialPets');
      setPets(storedPets ? JSON.parse(storedPets) : initialPets);
    }
  }, [router]);
  
  const petForm = useForm<PetMemorial>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      name: '', species: '', sexo: '', age: '', family: '', birthDate: '', passingDate: '',
      arvore: '', local: '', tutores: '', text: '', images: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: petForm.control,
    name: "images"
  });

  const aboutForm = useForm<AboutPageContent>({
    resolver: zodResolver(aboutPageSchema),
    defaultValues: {
        headerTitle: "Sobre o Pet Estrela",
        headerDescription: "Há mais de 10 anos, nossa missão é proporcionar uma despedida digna e respeitosa, transformando a dor da perda em uma celebração do amor e da amizade.",
        missionTitle: "Nossa Missão",
        missionDescription: "Nossa missão é oferecer um serviço de cremação pet que transcenda o procedimento técnico. Buscamos acolher as famílias em um dos momentos mais delicados, garantindo que a memória de seus companheiros seja honrada com a máxima dignidade. Acreditamos que cada vida, não importa o quão pequena, merece uma despedida grandiosa.",
        missionImageUrl: PlaceHolderImages.find((img) => img.id === 'about-mission')?.imageUrl ?? '',
        historyTitle: "Nossa História",
        historyDescription: "Fundada em 2014 com o sonho de oferecer um serviço funerário pet diferenciado, a Pet Estrela nasceu da paixão e do respeito pelos animais. Ao longo dos anos, crescemos e nos modernizamos, mas nunca perdemos a essência do nosso trabalho: o acolhimento.",
        historyImageUrl: PlaceHolderImages.find((img) => img.id === 'about-history')?.imageUrl ?? '',
    }
  });
  
    const generalForm = useForm<GeneralContent>({
    resolver: zodResolver(generalContentSchema),
    defaultValues: {
      whatsappNumber: '11942405253',
      whatsappLink: 'https://wa.me/5511942405253',
      phone: '(11) 4240-5253',
      address: 'Av. Adília Barbosa Neves, 2740, Centro Industrial, Arujá - SP, CEP: 07432-575',
      instagramLink: 'https://www.instagram.com/petestrelacrematorio/',
    }
  });

  useEffect(() => {
    const storedAboutContent = localStorage.getItem('aboutPageContent');
    if (storedAboutContent) {
        aboutForm.reset(JSON.parse(storedAboutContent));
    }
     const storedGeneralContent = localStorage.getItem('generalContent');
    if (storedGeneralContent) {
        generalForm.reset(JSON.parse(storedGeneralContent));
    }
  }, [aboutForm, generalForm]);

  useEffect(() => {
    if (editingPet) {
      petForm.reset(editingPet);
    } else {
      petForm.reset({
        name: '', species: '', sexo: '', age: '', family: '', birthDate: '', passingDate: '',
        arvore: '', local: '', tutores: '', text: '', images: [],
      });
    }
  }, [editingPet, petForm]);

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
    let updatedPets;
    if (editingPet) {
      updatedPets = pets.map(p => p.id === data.id ? { ...data, image: data.images[0] } : p);
      toast({ title: `Memorial de ${data.name} atualizado com sucesso.` });
    } else {
      const newPet = { ...data, id: Date.now(), image: data.images[0] };
      updatedPets = [newPet, ...pets];
      toast({ title: `Memorial de ${data.name} criado com sucesso.` });
    }
    setPets(updatedPets);
    localStorage.setItem('memorialPets', JSON.stringify(updatedPets));
    setIsFormOpen(false);
    setEditingPet(null);
  };

  const handleDeletePet = (petId: number) => {
    const petToDelete = pets.find(p => p.id === petId);
    if(petToDelete){
        const updatedPets = pets.filter(p => p.id !== petId);
        setPets(updatedPets);
        localStorage.setItem('memorialPets', JSON.stringify(updatedPets));
        toast({ title: `Memorial de ${petToDelete.name} excluído com sucesso.` });
    }
  };

  const handleSaveAboutContent = (data: AboutPageContent) => {
    localStorage.setItem('aboutPageContent', JSON.stringify(data));
    toast({ title: 'Conteúdo da página "Sobre Nós" atualizado com sucesso.' });
  };

  const handleSaveGeneralContent = (data: GeneralContent) => {
    localStorage.setItem('generalContent', JSON.stringify(data));
    toast({ title: 'Conteúdo geral do site atualizado com sucesso.' });
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
                    <CardTitle>Editar Página "Sobre Nós"</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...aboutForm}>
                        <form onSubmit={aboutForm.handleSubmit(handleSaveAboutContent)} className="space-y-6">
                            <h3 className="text-lg font-semibold text-primary">Seção do Cabeçalho</h3>
                            <FormField control={aboutForm.control} name="headerTitle" render={({ field }) => (<FormItem><FormLabel>Título Principal</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={aboutForm.control} name="headerDescription" render={({ field }) => (<FormItem><FormLabel>Descrição do Cabeçalho</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>)} />
                            
                            <h3 className="text-lg font-semibold text-primary mt-6">Seção Missão</h3>
                            <FormField control={aboutForm.control} name="missionTitle" render={({ field }) => (<FormItem><FormLabel>Título da Missão</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={aboutForm.control} name="missionDescription" render={({ field }) => (<FormItem><FormLabel>Descrição da Missão</FormLabel><FormControl><Textarea {...field} rows={5} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={aboutForm.control} name="missionImageUrl" render={({ field }) => (<FormItem><FormLabel>URL da Imagem da Missão</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />

                            <h3 className="text-lg font-semibold text-primary mt-6">Seção História</h3>
                             <FormField control={aboutForm.control} name="historyTitle" render={({ field }) => (<FormItem><FormLabel>Título da História</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={aboutForm.control} name="historyDescription" render={({ field }) => (<FormItem><FormLabel>Descrição da História</FormLabel><FormControl><Textarea {...field} rows={4} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={aboutForm.control} name="historyImageUrl" render={({ field }) => (<FormItem><FormLabel>URL da Imagem da História</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />

                            <Button type="submit"><Save className="mr-2" /> Salvar Alterações</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="general" className="mt-6">
             <Card>
              <CardHeader>
                <CardTitle>Editar Conteúdo Geral</CardTitle>
                 <DialogDescription>Altere as informações de contato e links que aparecem em todo o site.</DialogDescription>
              </CardHeader>
              <CardContent>
                <Form {...generalForm}>
                  <form onSubmit={generalForm.handleSubmit(handleSaveGeneralContent)} className="space-y-6">
                    <FormField control={generalForm.control} name="whatsappNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número do WhatsApp (somente números)</FormLabel>
                        <FormControl><Input placeholder="5511942405253" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                     <FormField control={generalForm.control} name="whatsappLink" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link do WhatsApp (completo)</FormLabel>
                        <FormControl><Input placeholder="https://wa.me/5511942405253" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={generalForm.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone para Contato</FormLabel>
                        <FormControl><Input placeholder="(11) 4240-5253" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={generalForm.control} name="address" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço Completo</FormLabel>
                        <FormControl><Textarea rows={3} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={generalForm.control} name="instagramLink" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Link do Instagram</FormLabel>
                            <FormControl><Input placeholder="https://instagram.com/seu-usuario" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <Button type="submit"><Save className="mr-2" /> Salvar Conteúdo Geral</Button>
                  </form>
                </Form>
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
          <Form {...petForm}>
            <form onSubmit={petForm.handleSubmit(handleSavePet)} className="space-y-6">
                <div className="mt-4 max-h-[70vh] overflow-y-auto pr-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={petForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nome</FormLabel><FormControl><Input placeholder="Nome do Pet" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={petForm.control} name="species" render={({ field }) => (<FormItem><FormLabel>Raça</FormLabel><FormControl><Input placeholder="Ex: Golden Retriever" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={petForm.control} name="sexo" render={({ field }) => (<FormItem><FormLabel>Sexo</FormLabel><FormControl><Input placeholder="Ex: Macho" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={petForm.control} name="age" render={({ field }) => (<FormItem><FormLabel>Idade</FormLabel><FormControl><Input placeholder="Ex: 8 anos" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={petForm.control} name="family" render={({ field }) => (<FormItem><FormLabel>Família</FormLabel><FormControl><Input placeholder="Ex: Família Silva" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={petForm.control} name="tutores" render={({ field }) => (<FormItem><FormLabel>Tutores</FormLabel><FormControl><Input placeholder="Ex: Maria e João" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={petForm.control} name="birthDate" render={({ field }) => (<FormItem><FormLabel>Data de Nascimento</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={petForm.control} name="passingDate" render={({ field }) => (<FormItem><FormLabel>Data de Falecimento</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={petForm.control} name="arvore" render={({ field }) => (<FormItem><FormLabel>Árvore Plantada</FormLabel><FormControl><Input placeholder="Ex: Ipê Amarelo" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={petForm.control} name="local" render={({ field }) => (<FormItem><FormLabel>Local</FormLabel><FormControl><Input placeholder="Ex: Jardim da Saudade" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    
                    <FormField control={petForm.control} name="text" render={({ field }) => (<FormItem><FormLabel>Texto Memorial</FormLabel><FormControl><Textarea placeholder="Escreva uma bela homenagem..." {...field} rows={5} /></FormControl><FormMessage /></FormItem>)} />

                    <div>
                        <Label>Fotos (Mínimo 5)</Label>
                         <p className="text-sm text-muted-foreground">Adicione as URLs das imagens. A primeira será a foto de capa.</p>
                         <div className="mt-2 space-y-2">
                         {fields.map((field, index) => (
                             <div key={field.id} className="flex items-center gap-2">
                                 <FormField
                                     control={petForm.control}
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
                            control={petForm.control}
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
    

    

    
