'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Clock, Heart, Shield } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { teamMembers } from '@/lib/mock-data';

const values = [
  {
    icon: Heart,
    title: 'Compaixão',
    description: 'Tratamos cada pet e família com a máxima empatia e carinho.',
  },
  {
    icon: Shield,
    title: 'Respeito',
    description: 'Honramos a memória de cada animal com dignidade e respeito.',
  },
  {
    icon: Clock,
    title: 'Disponibilidade',
    description: 'Estamos ao seu lado 24/7 para oferecer suporte completo.',
  },
  {
    icon: Award,
    title: 'Excelência',
    description: 'Buscamos a perfeição em cada detalhe dos nossos serviços.',
  },
];

type AboutPageContent = {
  headerTitle: string;
  headerDescription: string;
  missionTitle: string;
  missionDescription: string;
  missionImageUrl: string;
  historyTitle: string;
  historyDescription: string;
  historyImageUrl: string;
};

type GeneralContent = {
    whatsappLink: string;
}

export default function AboutPage() {
  const [content, setContent] = useState<AboutPageContent | null>(null);
  const [generalContent, setGeneralContent] = useState<GeneralContent | null>(null);

  useEffect(() => {
    const storedContent = localStorage.getItem('aboutPageContent');
    if (storedContent) {
      setContent(JSON.parse(storedContent));
    } else {
        setContent({
            headerTitle: "Sobre o Pet Estrela",
            headerDescription: "Há mais de 10 anos, nossa missão é proporcionar uma despedida digna e respeitosa, transformando a dor da perda em uma celebração do amor e da amizade.",
            missionTitle: "Nossa Missão",
            missionDescription: "Nossa missão é oferecer um serviço de cremação pet que transcenda o procedimento técnico. Buscamos acolher as famílias em um dos momentos mais delicados, garantindo que a memória de seus companheiros seja honrada com a máxima dignidade. Acreditamos que cada vida, não importa o quão pequena, merece uma despedida grandiosa.",
            missionImageUrl: PlaceHolderImages.find((img) => img.id === 'about-mission')?.imageUrl ?? '',
            historyTitle: "Nossa História",
            historyDescription: "Fundada em 2014 com o sonho de oferecer um serviço funerário pet diferenciado, a Pet Estrela nasceu da paixão e do respeito pelos animais. Ao longo dos anos, crescemos e nos modernizamos, mas nunca perdemos a essência do nosso trabalho: o acolhimento.",
            historyImageUrl: PlaceHolderImages.find((img) => img.id === 'about-history')?.imageUrl ?? '',
        });
    }

    const storedGeneralContent = localStorage.getItem('generalContent');
    if (storedGeneralContent) {
      setGeneralContent(JSON.parse(storedGeneralContent));
    } else {
        setGeneralContent({
            whatsappLink: 'https://wa.me/5511942405253'
        });
    }

  }, []);

  if (!content || !generalContent) {
    return (
        <div className="flex h-screen items-center justify-center">
            <p>Carregando conteúdo...</p>
        </div>
    );
  }

  return (
    <>
      {/* Header Section */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="animate-fade-in font-headline text-4xl font-bold text-gradient-luxury md:text-6xl">
            {content.headerTitle}
          </h1>
          <p className="animate-fade-in mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
            {content.headerDescription}
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="animate-fade-in order-2 lg:order-1">
              <h2 className="font-headline text-3xl font-bold md:text-4xl">
                {content.missionTitle}
              </h2>
              <p className="mt-4 text-muted-foreground md:text-lg">
                {content.missionDescription}
              </p>
              <Button asChild size="lg" className="btn-whatsapp mt-8">
                <a href={generalContent.whatsappLink} target="_blank">Fale Conosco</a>
              </Button>
            </div>
            <div className="animate-scale-in relative order-1 h-80 w-full overflow-hidden rounded-lg lg:order-2 lg:h-96">
              <Image
                src={content.missionImageUrl}
                alt="Imagem da missão"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-headline text-3xl font-bold md:text-4xl">
            Nossos Valores
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <Card key={index} className="animate-slide-up luxury-card text-center hover-lift">
                <CardHeader>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <value.icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="pt-4 font-headline text-xl">
                    {value.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
             <div className="animate-scale-in relative h-80 w-full overflow-hidden rounded-lg lg:h-96">
                <Image
                  src={content.historyImageUrl}
                  alt="Imagem da história"
                  fill
                  className="object-cover"
                />
            </div>
            <div className="animate-fade-in">
              <h2 className="font-headline text-3xl font-bold md:text-4xl">
                {content.historyTitle}
              </h2>
              <p className="mt-4 text-muted-foreground md:text-lg">
                {content.historyDescription}
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-primary/10 p-4 text-center">
                    <p className="font-headline text-4xl font-bold text-primary">10+</p>
                    <p className="text-sm font-medium text-muted-foreground">Anos de Experiência</p>
                </div>
                 <div className="rounded-lg bg-primary/10 p-4 text-center">
                    <p className="font-headline text-4xl font-bold text-primary">5000+</p>
                    <p className="text-sm font-medium text-muted-foreground">Famílias Atendidas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-headline text-3xl font-bold md:text-4xl">
            Nossa Equipe
          </h2>
           <p className="mx-auto mt-4 max-w-2xl text-muted-foreground md:text-lg">
            Profissionais dedicados e apaixonados por animais, prontos para oferecer o melhor atendimento.
          </p>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member, index) => (
              <Card key={index} className="animate-slide-up luxury-card overflow-hidden text-center hover-lift">
                 {member.image && (
                  <div className="relative h-64 w-full">
                    <Image
                      src={member.image.imageUrl}
                      alt={member.image.description}
                      data-ai-hint={member.image.imageHint}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="font-headline text-xl">{member.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-primary">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
            <h2 className="font-headline text-3xl font-bold md:text-4xl">
                Certificações e Licenças
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground md:text-lg">
                Operamos com total transparência e em conformidade com todas as normas ambientais e sanitárias.
            </p>
            <div className="mt-12 flex flex-wrap justify-center gap-8">
                <div className="flex items-center gap-3">
                    <Award className="h-8 w-8 text-accent" />
                    <span className="font-semibold">Licença Sanitária</span>
                </div>
                 <div className="flex items-center gap-3">
                    <Award className="h-8 w-8 text-accent" />
                    <span className="font-semibold">Certificação Ambiental</span>
                </div>
                 <div className="flex items-center gap-3">
                    <Award className="h-8 w-8 text-accent" />
                    <span className="font-semibold">Equipe Certificada</span>
                </div>
            </div>
        </div>
      </section>
    </>
  );
}

    