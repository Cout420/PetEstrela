
'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search } from 'lucide-react';
import { getMemorials, PetMemorial } from '@/lib/firebase-service';
import { memorialPets as initialPets } from '@/lib/mock-data'; // Fallback

const MemorialPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [memorialPets, setMemorialPets] = useState<PetMemorial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generalContent, setGeneralContent] = useState({ whatsappLink: 'https://wa.me/551142405253?text=${encodeURIComponent(\'Olá! Gostaria de informações sobre como criar um memorial digital para o meu pet.\')}' });

  useEffect(() => {
    async function fetchPets() {
      try {
        const petsFromDb = await getMemorials();
        setMemorialPets(petsFromDb);
      } catch (error) {
        console.error("Failed to fetch memorials from Firestore, using fallback data.", error);
        // Em caso de erro (ex: config do Firebase faltando), usa os dados locais
        setMemorialPets(initialPets as any);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPets();

    const storedGeneralContent = localStorage.getItem('generalContent');
    if (storedGeneralContent) {
        const content = JSON.parse(storedGeneralContent);
        setGeneralContent({
            whatsappLink: `${content.whatsappLink}?text=${encodeURIComponent('Olá! Gostaria de informações sobre como criar um memorial digital para o meu pet.')}`
        });
    }
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

  return (
    <>
      <section className="relative flex h-[70vh] items-center justify-center text-center text-white">
        <Image
          src="https://images.unsplash.com/photo-1426604966848-d7adac402bff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxncmVlbiUyMG5hdHVyZXxlbnwwfHx8fDE3NTkyMTg4ODh8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Floresta verde e harmoniosa representando o memorial e a natureza"
          fill
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-black/50 z-10"></div>
        <div className="container mx-auto px-4 z-20 animate-fade-in">
            <h1 className="font-headline text-4xl font-bold md:text-6xl">
            Memorial Pet Estrela
            </h1>
            <div className="mt-4 max-w-3xl mx-auto space-y-4 text-base text-gray-200">
                <p>O Memorial Pet Estrela foi criado como uma forma carinhosa de eternizar a lembrança dos nossos animais que se tornaram estrelinhas. Aqui, cada vida é celebrada através do plantio de uma árvore, que simboliza amor, renovação e memória eterna.</p>
                <p>Além de homenagear nossos companheiros, este memorial também contribui para o reflorestamento, com mudas frutíferas e nativas, fortalecendo a natureza.</p>
            </div>
        </div>
      </section>

      <div className="bg-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">
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
            
          {isLoading ? (
             <div className="text-center mt-12">Carregando memoriais...</div>
          ) : (
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <a href={generalContent.whatsappLink} target="_blank" rel="noopener noreferrer" className='animate-scale-in'>
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
                <Link key={pet.id} href={`/memorial/${pet.id}`} className="block animate-scale-in">
                    <Card
                        className="luxury-card hover-lift cursor-pointer overflow-hidden text-center h-full"
                    >
                        {pet.image && (
                        <div className="relative h-56 w-full">
                            <Image
                            src={pet.image.imageUrl}
                            alt={pet.image.description ?? ''}
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
                </Link>
                ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MemorialPage;
