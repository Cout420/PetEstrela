
"use client";

import * as React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Dog, Cat, Calendar, Heart, User, Venus, Mars, TreePine, Hash } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useFirebase, useMemoFirebase } from '@/firebase/provider';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy } from 'firebase/firestore';

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

export default function MemorialPage() {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [animalFilter, setAnimalFilter] = React.useState('all');
    const [sortOrder, setSortOrder] = React.useState('protocol_desc');
    const { firestore } = useFirebase();

    const petProfilesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'pet_profiles'));
    }, [firestore]);

    const { data: pets, isLoading } = useCollection<PetProfile>(petProfilesQuery);

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

    const filteredAndSortedPets = React.useMemo(() => {
        if (!pets) return [];
        return pets
            .filter(pet => {
                if (!pet || !pet.name) return false;

                const searchTermLower = searchTerm.toLowerCase();

                const cremationDate = pet.cremationDate ? formatDate(pet.cremationDate) : '';

                const matchesSearch = 
                    pet.name.toLowerCase().includes(searchTermLower) ||
                    pet.memorialCode.toLowerCase().includes(searchTermLower) ||
                    pet.breed.toLowerCase().includes(searchTermLower) ||
                    pet.tutors.toLowerCase().includes(searchTermLower) ||
                    cremationDate.toLowerCase().includes(searchTermLower);

                const matchesAnimal = animalFilter === 'all' || pet.animalType.toLowerCase() === animalFilter.toLowerCase();
                
                return matchesSearch && matchesAnimal;
            })
            .sort((a, b) => {
                if (sortOrder === 'name_asc') {
                    return a.name.localeCompare(b.name);
                }
                if (sortOrder === 'name_desc') {
                    return b.name.localeCompare(a.name);
                }

                if(sortOrder.includes('protocol')) {
                    const numA = parseInt(a.memorialCode.replace('#', ''));
                    const numB = parseInt(b.memorialCode.replace('#', ''));
                    if(sortOrder === 'protocol_asc') return numA - numB;
                    return numB - numA;
                }
                
                try {
                    const dateA = a.cremationDate ? (typeof a.cremationDate === 'string' ? new Date(a.cremationDate) : a.cremationDate.toDate()).getTime() : 0;
                    const dateB = b.cremationDate ? (typeof b.cremationDate === 'string' ? new Date(b.cremationDate) : b.cremationDate.toDate()).getTime() : 0;
                    
                     if (isNaN(dateA) || isNaN(dateB)) return 0;
                    
                     if (sortOrder === 'cremationDate_asc') {
                        return dateA - dateB;
                    }
                    return dateB - dateA; // Default is 'cremationDate_desc'
                } catch(e) {
                    console.error("Error parsing date for sorting:", e);
                    return 0; 
                }
               
            });
    }, [pets, searchTerm, animalFilter, sortOrder, formatDate]);

    const showNoResults = !isLoading && filteredAndSortedPets.length === 0;

    return (
        <div className="min-h-screen bg-background">
            <section className="relative h-[50vh] min-h-[400px] text-white flex items-center justify-center text-center overflow-hidden">
                <video
                    src="https://i.imgur.com/3V6WYmV.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute top-0 left-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50" />
                <div className="relative container mx-auto max-w-7xl px-4 z-10">
                    <h1 className="font-headline text-4xl md:text-5xl font-bold drop-shadow-md">Memorial Pet Estrela</h1>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl mx-auto drop-shadow-md">
                        O Memorial Pet Estrela foi criado como uma forma carinhosa de eternizar a lembrança dos nossos animais que se tornaram estrelinhas. Aqui, cada vida é celebrada através do plantio de uma árvore, que simboliza amor, renovação e memória eterna.  Além de homenagear nossos companheiros, este memorial também contribui para o reflorestamento, com mudas frutíferas e nativas, fortalecendo a natureza.  As cinzas de cada pet são depositadas junto à muda escolhida e recebem uma identificação única. Por meio do QR Code, é possível consultar essa numeração e acessar as informações sobre o animal e a árvore que guarda sua lembrança.
                    </p>
                </div>
            </section>

            <section className="container mx-auto max-w-7xl px-4 py-12">
                <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-white rounded-lg shadow">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                        <Input
                            placeholder="Buscar por nome, protocolo, raça, tutor ou data..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Select value={animalFilter} onValueChange={setAnimalFilter}>
                            <SelectTrigger className="w-full sm:w-auto md:w-[180px]">
                                <SelectValue placeholder="Filtrar por animal" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os Animais</SelectItem>
                                <SelectItem value="Cão"><Dog className="inline-block mr-2 h-4 w-4" />Cães</SelectItem>
                                <SelectItem value="Gato"><Cat className="inline-block mr-2 h-4 w-4" />Gatos</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={sortOrder} onValueChange={setSortOrder}>
                            <SelectTrigger className="w-full sm:w-auto md:w-[200px]">
                                <SelectValue placeholder="Ordenar por" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="protocol_desc">Protocolo (Mais Recente)</SelectItem>
                                <SelectItem value="protocol_asc">Protocolo (Mais Antigo)</SelectItem>
                                <SelectItem value="cremationDate_desc">Cremação (Mais Recente)</SelectItem>
                                <SelectItem value="cremationDate_asc">Cremação (Mais Antigo)</SelectItem>
                                <SelectItem value="name_asc">Nome (A-Z)</SelectItem>
                                <SelectItem value="name_desc">Nome (Z-A)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {isLoading && (
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                           <Card key={i}>
                                <Skeleton className="aspect-square w-full" />
                                <div className="p-4 space-y-2">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                    <Skeleton className="h-8 w-full" />
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredAndSortedPets.map(pet => {
                        return (
                           <Link key={pet.id} href={`/memorial/${pet.memorialCode.replace('#', '')}`} legacyBehavior>
                                <a className="group block">
                                    <Card className="overflow-hidden cursor-pointer shadow-lg hover:shadow-primary/20 transition-all duration-300 transform hover:-translate-y-1 h-full">
                                        <CardContent className="p-0 flex flex-col h-full">
                                            <div className="relative aspect-square">
                                                <Badge variant="secondary" className="absolute top-3 left-3 z-10 text-base">
                                                    {pet.memorialCode}
                                                </Badge>
                                                {pet.imageUrls?.[0] && (
                                                    <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-110">
                                                        <MediaItem src={pet.imageUrls[0]} alt={pet.name} />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                                                <div className="absolute bottom-0 left-0 p-4 text-white">
                                                    <h3 className="font-headline text-2xl font-bold">{pet.name}</h3>
                                                    <p className="font-body text-sm opacity-80">{pet.breed}</p>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-white flex-grow flex flex-col">
                                                <p className="text-sm italic text-muted-foreground line-clamp-2 flex-grow">"{pet.shortDescription}"</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </a>
                            </Link>
                        )
                    })}
                </div>
                 {showNoResults && (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>Nenhum perfil de memorial encontrado com os filtros atuais.</p>
                    </div>
                )}
            </section>
        </div>
    );
}

