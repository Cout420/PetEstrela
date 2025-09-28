

'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import qrcode from 'qrcode';
import { Button } from '@/components/ui/button';
import { QrCode, Heart, ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { getMemorialById, PetMemorial } from '@/lib/firebase-service';
import { Timestamp } from 'firebase/firestore';

// Helper para converter Timestamp do Firebase para string de data 'YYYY-MM-DD'
const formatDate = (dateValue: Timestamp | Date | string | undefined): string => {
  if (!dateValue) return 'Data desconhecida';

  let date: Date;

  if (dateValue instanceof Timestamp) {
    date = dateValue.toDate();
  } else if (dateValue instanceof Date) {
    date = dateValue;
  } else if (typeof dateValue === 'string') {
    date = new Date(dateValue);
    // Para strings que já estão em UTC YYYY-MM-DD, a conversão pode adicionar um dia.
    // Adicionamos o fuso horário para interpretar corretamente.
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
       date = new Date(dateValue + 'T00:00:00');
    }
  } else {
    return 'Data inválida';
  }

  if (isNaN(date.getTime())) {
    return 'Data inválida';
  }

  return date.toISOString().split('T')[0];
};


const MemorialDetailPage = () => {
  const [pet, setPet] = useState<PetMemorial | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const qrCodeCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fetchPet = async () => {
      const petId = Number(params.id);
      if (isNaN(petId)) {
        setLoading(false);
        return;
      }
      
      try {
        const foundPet = await getMemorialById(petId);
        setPet(foundPet);
      } catch (error) {
        console.error("Erro ao buscar memorial:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
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
      <div className="flex min-h-screen items-center justify-center memorial-bg">
        <p className='text-white text-lg'>Carregando memorial...</p>
      </div>
    );
  }

  if (!pet) {
    return notFound();
  }

  const formatId = (id: number) => `#${id.toString().padStart(3, '0')}`;

  return (
    <div className="bg-background py-12 md:py-24 memorial-bg">
      <div className="container mx-auto px-4">
        <div className="mb-8">
            <Button asChild variant="outline" className="bg-white/20 border-white text-white hover:bg-white hover:text-primary">
                <Link href="/memorial">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para o Memorial
                </Link>
            </Button>
        </div>

        <div className="text-center mb-12">
            <h1 className="font-headline text-4xl md:text-5xl font-bold text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
                Em memória de {pet.name}
            </h1>
            <p className="text-lg text-gray-200 mt-2 [text-shadow:0_1px_3px_rgba(0,0,0,0.4)]">{formatDate(pet.birthDate)} - {formatDate(pet.passingDate)}</p>
            <span className="font-mono text-xl text-gray-300 [text-shadow:0_1px_3px_rgba(0,0,0,0.4)]">{formatId(pet.id)}</span>
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
                <div className="space-y-3 text-base text-foreground bg-white/20 backdrop-blur-md p-6 rounded-lg border border-white/20 shadow-soft">
                    <p><strong>Raça:</strong> {pet.species}</p>
                    <p><strong>Sexo:</strong> {pet.sexo}</p>
                    <p><strong>Idade:</strong> {pet.age}</p>
                    <p><strong>Família:</strong> {pet.family}</p>
                    <p><strong>Tutores:</strong> {pet.tutores}</p>
                    <p><strong>Árvore Plantada:</strong> {pet.arvore}</p>
                    <p><strong>Local:</strong> {pet.local}</p>
                </div>
                
                <Card className="bg-white/20 backdrop-blur-md border border-white/20 shadow-soft">
                  <CardContent className="p-6">
                    <p className="whitespace-pre-wrap text-base leading-relaxed md:text-lg">
                        {pet.text}
                    </p>
                    <div className="flex items-center justify-center gap-2 text-lg font-semibold text-primary mt-6">
                        <Heart className="h-5 w-5" />
                        <p>Sempre em nossos corações</p>
                    </div>
                  </CardContent>
                </Card>

                {pet.qrCodeUrl && (
                  <div className="space-y-4">
                    <div className="flex flex-col items-center gap-4 rounded-lg border border-white/20 bg-white/20 backdrop-blur-md p-6 shadow-soft">
                        <h4 className="font-semibold text-center">Acesse esta homenagem a qualquer momento</h4>
                        <canvas ref={qrCodeCanvasRef} />
                        <p className="text-sm text-muted-foreground text-center">Aponte a câmera do seu celular para este QR Code.</p>
                    </div>

                    <Card className="shadow-soft bg-white/20 backdrop-blur-md border border-white/20">
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
