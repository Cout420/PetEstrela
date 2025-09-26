'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { memorialPets } from '@/lib/mock-data';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import { LogOut, Users, FileText, Settings, Plus, Edit, Trash2, Save, Upload, X, QrCode } from 'lucide-react';

type PetMemorial = {
  id: number;
  name: string;
  species: string;
  sexo: string;
  age: string;
  family: string;
  birthDate: string;
  passingDate: string;
  arvore: string;
  local: string;
  tutores: string;
  text: string;
  image?: ImagePlaceholder;
  images?: (ImagePlaceholder | undefined)[];
};

export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pets, setPets] = useState<PetMemorial[]>(memorialPets);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<PetMemorial | null>(null);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('petEstrelaAuth') === 'authenticated';
    if (!isLoggedIn) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('petEstrelaAuth');
    toast({ title: 'Logout realizado com sucesso.' });
    router.push('/');
  };

  const handleOpenForm = (pet: PetMemorial | null) => {
    setEditingPet(pet);
    setIsFormOpen(true);
  };
  
  const handleSavePet = (petData: PetMemorial) => {
    // Logic to save pet (create or update)
    if (editingPet) {
      // update
       toast({ title: `Memorial de ${petData.name} atualizado com sucesso.` });
    } else {
      // create
       toast({ title: `Memorial de ${petData.name} criado com sucesso.` });
    }
    setIsFormOpen(false);
    setEditingPet(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Verificando autenticação...</p>
      </div>
    );
  }

  const handleDeletePet = (petId: number) => {
    // Logic to delete a pet
    toast({ title: `Pet ${petId} excluído com sucesso.` });
  };
  
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
                            alt={pet.image.description}
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
                        <Button variant="destructive" size="sm" onClick={() => handleDeletePet(pet.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Excluir
                        </Button>
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
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-3xl text-primary">
              {editingPet ? `Editar Memorial de ${editingPet.name}` : 'Criar Novo Memorial'}
            </DialogTitle>
             <DialogDescription>
              Preencha as informações abaixo para gerenciar o memorial.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 max-h-[70vh] overflow-y-auto pr-4">
             <p className="text-destructive text-sm mb-4">Funcionalidade de formulário em desenvolvimento.</p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Nome do Pet" />
                <Input placeholder="Raça" />
                <Input placeholder="Sexo" />
                <Input placeholder="Idade" />
                <Input type="date" placeholder="Data de Nascimento" />
                <Input type="date" placeholder="Data de Falecimento" />
                <Input placeholder="Árvore" />
                <Input placeholder="Local" />
                <Input placeholder="Tutores" />
             </div>
             <Textarea placeholder="Texto Memorial" className="mt-4" rows={5}/>

             <div className="mt-6">
                <h4 className="font-semibold">Fotos (Mínimo 5)</h4>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="aspect-square bg-muted rounded-md flex items-center justify-center">
                            <Upload className="text-muted-foreground"/>
                        </div>
                    ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">Arraste ou clique para adicionar arquivos.</p>
             </div>
          </div>
          <DialogClose asChild>
            <div className='flex justify-end gap-2 mt-6'>
                <Button variant="outline">Cancelar</Button>
                <Button>Salvar Pet</Button>
            </div>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
}
