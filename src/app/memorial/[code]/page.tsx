
"use client";

import * as React from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useFirebase, useMemoFirebase } from '@/firebase/provider';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, where } from 'firebase/firestore';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Calendar, Heart, User, Venus, Mars, TreePine, Hash, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type PetProfile = {
  id: string;
  name: string;
  tutors: string;
  animalType: string;
  sex: 'Macho' | 'Fêmea';
  breed: string;
  birthDate: string | { toDate: () => Date };
  cremationDate: string | { toDate: () => Date };
  tree: string;
  shortDescription: string;
  fullDescription: string;
  imageUrls: string[];
  memorialCode: string;
};

const MediaItem = ({ src, alt }: { src: string, alt: string }) => {
    if (!src) return <Skeleton className="w-full h-full" />;
    
    const isVideo = src.endsWith('.mp4');

    if (isVideo) {
        return (
            <video
                src={src}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
            />
        );
    }
    
    return (
         <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
        />
    );
}

const InfoItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
    <div className="flex items-start gap-3 text-sm">
        <div className="text-primary pt-0.5">{icon}</div>
        <div className="flex flex-col">
          <span className="font-semibold">{label}</span>
          <span className="text-muted-foreground">{value || 'Não informado'}</span>
        </div>
    </div>
);

const PetProfilePage = () => {
    const params = useParams();
    const { firestore } = useFirebase();
    
    const memorialCode = params.code ? `#${params.code}` : null;

    const petQuery = useMemoFirebase(() => {
        if (!firestore || !memorialCode) return null;
        return query(collection(firestore, 'pet_profiles'), where('memorialCode', '==', memorialCode));
    }, [firestore, memorialCode]);

    const { data: pets, isLoading } = useCollection<PetProfile>(petQuery);
    const selectedPet = pets?.[0];

    const formatDate = React.useCallback((dateString: string | { toDate: () => Date }) => {
        try {
            const date = typeof dateString === 'string' ? new Date(dateString) : dateString.toDate();
            if (isNaN(date.getTime())) return "Data inválida";

            // Se for string, pode precisar de ajuste de fuso horário
            if (typeof dateString === 'string') {
                const offset = date.getTimezoneOffset();
                date.setMinutes(date.getMinutes() + offset);
            }

            return new Intl.DateTimeFormat('pt-BR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }).format(date);
        } catch(e) {
            console.error("Error formatting date:", e, "Input:", dateString);
            return "Data inválida";
        }
    }, []);

    if (isLoading) {
        return (
             <div className="container mx-auto max-w-5xl my-12 p-4">
                <Skeleton className="h-12 w-1/4 mb-8" />
                <Card className="overflow-hidden shadow-xl">
                    <div className="grid md:grid-cols-2">
                        <Skeleton className="aspect-square w-full" />
                        <div className="p-8 space-y-6">
                            <Skeleton className="h-10 w-3/4" />
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-2/3" />
                            <Separator />
                            <div className="grid grid-cols-2 gap-4">
                                {[...Array(6)].map(i => <Skeleton key={i} className="h-8 w-full" />)}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        )
    }

    if (!selectedPet) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-primary">Memorial não encontrado</h2>
                <p className="text-muted-foreground mt-2">O código do memorial informado não corresponde a nenhum pet.</p>
                 <Button asChild className="mt-8">
                    <Link href="/memorial">Voltar para o Memorial</Link>
                </Button>
            </div>
        )
    }
    
    return (
        <div className='bg-background min-h-screen py-12'>
            <div className="container mx-auto max-w-5xl px-4">
                 <div className="mb-8">
                    <Button asChild variant="outline">
                        <Link href="/memorial">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar para o Memorial
                        </Link>
                    </Button>
                </div>
                 <Card className="overflow-hidden shadow-xl border-t-4 border-primary">
                    <div className="grid md:grid-cols-2">
                        <div className='w-full'>
                             <Carousel className="w-full h-full">
                                <CarouselContent>
                                    {(selectedPet.imageUrls || []).map((url, index) => (
                                        <CarouselItem key={index}>
                                             <div className="relative aspect-square w-full">
                                                <MediaItem src={url} alt={`${selectedPet.name} - foto ${index + 1}`} />
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                 {(selectedPet.imageUrls?.length || 0) > 1 && <>
                                    <CarouselPrevious className="left-4"/>
                                    <CarouselNext className="right-4"/>
                                 </>}
                            </Carousel>
                        </div>
                        <div className="p-8 flex flex-col bg-white">
                            <header className="text-left mb-6">
                                <h1 className="font-headline text-4xl md:text-5xl text-primary mb-2">{selectedPet.name}</h1>
                                <p className='italic text-muted-foreground'>
                                    "{selectedPet.shortDescription}"
                                </p>
                            </header>
                            <div className="space-y-6 flex-grow">
                                <p className="text-base text-foreground leading-relaxed">{selectedPet.fullDescription}</p>

                                <Separator />
                                <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                                  <InfoItem icon={<Hash size={16}/>} label="Protocolo" value={selectedPet.memorialCode} />
                                  <InfoItem icon={<User size={16}/>} label="Tutores" value={selectedPet.tutors} />
                                  <InfoItem icon={selectedPet.sex === 'Macho' ? <Mars size={16}/> : <Venus size={16}/>} label="Sexo" value={selectedPet.sex} />
                                  <InfoItem icon={<Heart size={16}/>} label="Raça" value={selectedPet.breed} />
                                  <InfoItem icon={<TreePine size={16}/>} label="Árvore Memorial" value={selectedPet.tree} />
                                  <InfoItem icon={<Calendar size={16}/>} label="Nascimento" value={formatDate(selectedPet.birthDate)} />
                                  <InfoItem icon={<Calendar size={16}/>} label="Cremação" value={formatDate(selectedPet.cremationDate)} />
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};


export default PetProfilePage;
