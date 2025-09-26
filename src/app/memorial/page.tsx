'use client';

import { useState } from 'react';
import Image from 'next/image';
import { memorialPets } from '@/lib/mock-data';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { PlusCircle, QrCode, X } from 'lucide-react';
import type { ImagePlaceholder } from '@/lib/placeholder-images';

type PetMemorial = {
    id: number;
    name: string;
    species: string;
    age: string;
    family: string;
    birthDate: string;
    passingDate: string;
    text: string;
    image?: ImagePlaceholder;
}

const MemorialPage = () => {
  const [selectedPet, setSelectedPet] = useState<PetMemorial | null>(null);

  const whatsappLink = `https://wa.me/5511942405253?text=${encodeURIComponent(
    'Olá! Gostaria de informações sobre como criar um memorial digital para o meu pet.'
  )}`;

  return (
    <>
      <div className="bg-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="animate-fade-in text-center">
            <h1 className="font-headline text-4xl font-bold text-primary md:text-5xl">
              Memorial Digital
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Um espaço para celebrar o amor e a saudade dos nossos eternos
              companheiros.
            </p>
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

            {memorialPets.map((pet) => (
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
        <DialogContent className="max-w-3xl">
          {selectedPet && (
            <>
              <DialogHeader>
                <DialogTitle className="font-headline text-3xl text-primary">
                  Em memória de {selectedPet.name}
                </DialogTitle>
                <DialogDescription>
                  {selectedPet.birthDate} - {selectedPet.passingDate}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-8 pt-4 md:grid-cols-2">
                <div>
                  {selectedPet.image && (
                    <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-lg">
                       <Image
                        src={selectedPet.image.imageUrl}
                        alt={selectedPet.image.description}
                        data-ai-hint={selectedPet.image.imageHint}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="space-y-1 text-sm text-muted-foreground">
                      <p><strong>Raça:</strong> {selectedPet.species}</p>
                      <p><strong>Idade:</strong> {selectedPet.age}</p>
                      <p><strong>Família:</strong> {selectedPet.family}</p>
                  </div>
                </div>
                <div>
                   <p className="whitespace-pre-wrap text-base leading-relaxed">
                    {selectedPet.text}
                  </p>
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
