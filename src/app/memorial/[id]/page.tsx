'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import qrcode from 'qrcode';
import { memorialPets as initialPets } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { QrCode, Heart, ArrowLeft, ExternalLink } from 'lucide-react';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

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
  qrCodeUrl?: string;
};

const MemorialDetailPage = () => {
  const [pet, setPet] = useState<PetMemorial | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const qrCodeCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const petId = Number(params.id);
    if (isNaN(petId)) {
      setLoading(false);
      return;
    }
    const storedPets = localStorage.getItem('memorialPets');
    const pets: PetMemorial[] = storedPets ? JSON.parse(storedPets) : initialPets;
    const foundPet = pets.find((p) => p.id === petId);

    if (foundPet) {
      setPet(foundPet);
    }
    setLoading(false);
  }, [params.id]);
  
  useEffect(() => {
    if (pet?.qrCodeUrl && qrCodeCanvasRef.current) {
        qrcode.toCanvas(qrCodeCanvasRef.current, pet.qrCodeUrl, { width: 200, margin: 2 }, (error) => {
            if (error) console.error("Error generating QR code:", error);
        });
    }
  }, [pet]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Carregando memorial...</p>
      </div>
    );
  }

  if (!pet) {
    return notFound();
  }

  const formatId = (id: number) => `#${id.toString().padStart(3, '0')}`;

  return (
    <div className="bg-background py-12 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-8">
            <Button asChild variant="outline">
                <Link href="/memorial">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para o Memorial
                </Link>
            </Button>
        </div>

        <div className="text-center mb-12">
            <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">
                Em memória de {pet.name}
            </h1>
            <p className="text-lg text-muted-foreground mt-2">{pet.birthDate} - {pet.passingDate}</p>
            <span className="font-mono text-xl text-muted-foreground">{formatId(pet.id)}</span>
        </div>

        <div className="grid gap-12 pt-4 md:grid-cols-2">
            <div className="space-y-4">
                {pet.images?.map((img, index) => img && (
                    <div key={index} className="relative aspect-video w-full overflow-hidden rounded-lg shadow-soft">
                        <Image
                            src={img.imageUrl}
                            alt={img.description || `Foto de ${pet.name} ${index + 1}`}
                            data-ai-hint={img.imageHint}
                            fill
                            className="object-cover"
                        />
                    </div>
                ))}
            </div>
            <div className='sticky top-24 self-start space-y-8'>
                <div className="space-y-3 text-base text-foreground bg-muted/30 p-6 rounded-lg border shadow-soft">
                    <p><strong>Raça:</strong> {pet.species}</p>
                    <p><strong>Sexo:</strong> {pet.sexo}</p>
                    <p><strong>Idade:</strong> {pet.age}</p>
                    <p><strong>Família:</strong> {pet.family}</p>
                    <p><strong>Tutores:</strong> {pet.tutores}</p>
                    <p><strong>Árvore Plantada:</strong> {pet.arvore}</p>
                    <p><strong>Local:</strong> {pet.local}</p>
                </div>
                <p className="whitespace-pre-wrap text-base leading-relaxed md:text-lg">
                    {pet.text}
                </p>
                <div className="flex items-center justify-center gap-2 text-lg font-semibold text-primary">
                    <Heart className="h-5 w-5" />
                    <p>Sempre em nossos corações</p>
                </div>
                {pet.qrCodeUrl && (
                  <div className="space-y-4">
                    <div className="flex flex-col items-center gap-4 rounded-lg border bg-muted/50 p-6 shadow-soft">
                        <h4 className="font-semibold text-center">Acesse esta homenagem a qualquer momento</h4>
                        <canvas ref={qrCodeCanvasRef} />
                        <p className="text-sm text-muted-foreground text-center">Aponte a câmera do seu celular para este QR Code.</p>
                    </div>

                    <Card className="shadow-soft">
                        <CardContent className="p-4 flex flex-col items-center text-center">
                           <p className='text-sm text-muted-foreground mb-4'>Ou use o link direto para compartilhar esta homenagem.</p>
                            <Button asChild className="w-full">
                                <a href={pet.qrCodeUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Abrir Memorial
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                  </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default MemorialDetailPage;
