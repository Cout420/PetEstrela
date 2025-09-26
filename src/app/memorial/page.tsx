'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { memorialPets as initialPets } from '@/lib/mock-data';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { PlusCircle, QrCode, Search, Heart } from 'lucide-react';
import type { ImagePlaceholder } from '@/lib/placeholder-images';

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

const MemorialPage = () => {
  const [selectedPet, setSelectedPet] = useState<PetMemorial | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [memorialPets, setMemorialPets] = useState<PetMemorial[]>([]);

  useEffect(() => {
    const storedPets = localStorage.getItem('memorialPets');
    setMemorialPets(storedPets ? JSON.parse(storedPets) : initialPets);
  }, []);

  const formatId = (id: number) => `#${id.toString().padStart(3, '0')}`;

  const filteredPets = useMemo(() => {
    if (!searchQuery) {
      return memorialPets;
    }
    return memorialPets.filter(
      (pet) =>
        pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        formatId(pet.id).includes(searchQuery)
    );
  }, [searchQuery, memorialPets]);

  const whatsappLink = `https://wa.me/5511942405253?text=${encodeURIComponent(
    'Olá! Gostaria de informações sobre como criar um memorial digital para o meu pet.'
  )}`;

  return (
    <>
      <div className="bg-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="animate-fade-in text-center">
            <h1 className="font-headline text-4xl font-bold text-primary md:text-5xl">
              Memorial Pet Estrela
            </h1>
            <div className="mx-auto mt-4 max-w-3xl text-muted-foreground space-y-4 text-base">
              <p>O Memorial Pet Estrela foi criado como uma forma carinhosa de eternizar a lembrança dos nossos animais que se tornaram estrelinhas. Aqui, cada vida é celebrada através do plantio de uma árvore, que simboliza amor, renovação e memória eterna.</p>
              <p>Além de homenagear nossos companheiros, este memorial também contribui para o reflorestamento, com mudas frutíferas e nativas, fortalecendo a natureza.</p>
              <p>As cinzas de cada pet são depositadas junto à muda escolhida e recebem uma identificação única. Por meio do QR Code, é possível consultar essa numeração e acessar as informações sobre o animal e a árvore que guarda sua lembrança.</p>
            </div>
          </div>
          
          <div className="mt-12 mb-8 max-w-lg mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Pesquisar por nome ou número (ex: #001)"
                className="w-full pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className='animate-scale-in'>
              <Card className="luxury-card hover-lift flex h-full min-h-[380px] flex-col items-center justify-center text-center">
                <CardHeader>
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                    <PlusCircle className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle className="pt-4 font-headline text-2xl">
                    Criar um Memorial
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Clique aqui para eternizar a memória do seu amigo.
                  </p>
                </CardContent>
              </Card>
            </a>

            {filteredPets.map((pet) => (
              <Card
                key={pet.id}
                className="luxury-card hover-lift animate-scale-in cursor-pointer overflow-hidden text-center"
                onClick={() => setSelectedPet(pet)}
              >
                {pet.image && (
                  <div className="relative h-56 w-full">
                    <Image
                      src={pet.image.imageUrl}
                      alt={pet.image.description}
                      data-ai-hint={pet.image.imageHint}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-background/80 text-primary font-bold text-sm px-2 py-1 rounded-full">
                        {formatId(pet.id)}
                    </div>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="font-headline text-2xl">
                    {pet.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{pet.species}</p>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button variant="link">Ver Homenagem</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={!!selectedPet} onOpenChange={() => setSelectedPet(null)}>
        <DialogContent className="max-w-4xl">
          {selectedPet && (
            <>
              <DialogHeader>
                <DialogTitle className="font-headline text-3xl text-primary">
                  Em memória de {selectedPet.name} <span className="font-mono text-xl text-muted-foreground">{formatId(selectedPet.id)}</span>
                </DialogTitle>
                <DialogDescription>
                  {selectedPet.birthDate} - {selectedPet.passingDate}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-8 pt-4 md:grid-cols-2 max-h-[70vh] overflow-y-auto pr-4">
                <div className="space-y-4">
                   {selectedPet.images?.map((img, index) => img && (
                     <div key={index} className="relative aspect-video w-full overflow-hidden rounded-lg">
                       <Image
                        src={img.imageUrl}
                        alt={img.description}
                        data-ai-hint={img.imageHint}
                        fill
                        className="object-cover"
                      />
                    </div>
                   ))}
                </div>
                <div>
                   <div className="space-y-2 text-sm text-foreground bg-muted/30 p-4 rounded-lg border">
                      <p><strong>Raça:</strong> {selectedPet.species}</p>
                      <p><strong>Sexo:</strong> {selectedPet.sexo}</p>
                      <p><strong>Idade:</strong> {selectedPet.age}</p>
                      <p><strong>Tutores:</strong> {selectedPet.tutores}</p>
                      <p><strong>Árvore Plantada:</strong> {selectedPet.arvore}</p>
                      <p><strong>Local:</strong> {selectedPet.local}</p>
                  </div>
                  <p className="mt-6 whitespace-pre-wrap text-base leading-relaxed">
                    {selectedPet.text}
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-2 text-lg font-semibold text-primary">
                      <Heart className="h-5 w-5" />
                      <p>Sempre em nossos corações</p>
                  </div>
                  <div className="mt-6 flex items-center gap-4 rounded-lg border bg-muted/50 p-4">
                    <QrCode className="h-16 w-16 text-muted-foreground" />
                    <div>
                      <h4 className="font-semibold">QR Code Memorial</h4>
                      <p className="text-sm text-muted-foreground">Aponte a câmera e acesse esta homenagem a qualquer momento.</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MemorialPage;

    