'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CreditCard, Heart, Star } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { testimonials } from '@/lib/mock-data';

const heroSlides = [
  {
    image: PlaceHolderImages.find((img) => img.id === 'hero-building'),
    title: 'Pet Estrela Crematório',
    subtitle:
      'Instalações modernas e seguras para cuidar do seu companheiro.',
  },
  {
    image: PlaceHolderImages.find((img) => img.id === 'hero-all-pets'),
    title: 'Cuidado para Todos os Amigos',
    subtitle:
      'Atendemos cães, gatos, aves, cavalos e animais exóticos de todos os portes.',
  },
  {
    image: PlaceHolderImages.find((img) => img.id === 'hero-garden'),
    title: 'Despedida com Dignidade e Respeito',
    subtitle: 'Honramos a memória do seu pet com todo carinho que ele merece.',
  },
];

const whyChooseUs = [
  {
    icon: Clock,
    title: 'Agilidade',
    description: 'Processo rápido e respeitoso para sua maior tranquilidade.',
  },
  {
    icon: Clock,
    title: 'Atendimento 24h',
    description: 'Nossa equipe está disponível a qualquer hora do dia.',
  },
  {
    icon: CreditCard,
    title: 'Preço Acessível',
    description: 'Planos que se ajustam às suas necessidades e orçamento.',
  },
  {
    icon: Heart,
    title: 'Cuidado Especial',
    description: 'Tratamos todos os pets, incluindo exóticos, com amor.',
  },
];

const cremationProcess = [
  {
    step: '01',
    title: 'Coleta do Animal',
    description:
      'Realizamos a remoção do seu pet em sua residência ou clínica veterinária com veículos adaptados.',
  },
  {
    step: '02',
    title: 'Preparação',
    description:
      'O corpo do seu amigo é preparado com todo o respeito e cuidado para a cerimônia de despedida.',
  },
  {
    step: '03',
    title: 'Cremação',
    description:
      'O processo de cremação é realizado de forma individual ou coletiva, seguindo sua escolha.',
  },
  {
    step: '04',
    title: 'Entrega das Cinzas',
    description:
      'As cinzas são entregues em uma urna de sua preferência, junto com um certificado.',
  },
];

const allPetsImage = PlaceHolderImages.find(
  (img) => img.id === 'section-all-pets'
);

export default function Home() {
  const [generalContent, setGeneralContent] = useState({ whatsappLink: 'https://wa.me/5511942405253' });

  useEffect(() => {
    const storedContent = localStorage.getItem('generalContent');
    if (storedContent) {
      setGeneralContent(JSON.parse(storedContent));
    }
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[80vh] w-full">
        <Carousel
          className="h-full w-full"
          opts={{ loop: true }}
          autoplayDelay={5000}
        >
          <CarouselContent>
            {heroSlides.map((slide, index) => (
              <CarouselItem key={index}>
                <div className="relative h-[80vh] w-full">
                  {slide.image && (
                    <Image
                      src={slide.image.imageUrl}
                      alt={slide.image.description}
                      data-ai-hint={slide.image.imageHint}
                      fill
                      className="object-cover"
                      priority={index === 0}
                    />
                  )}
                  <div className="absolute inset-0 bg-black/50" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
                    <div className="container mx-auto px-4">
                      <h1 className="animate-fade-in font-headline text-4xl font-bold md:text-6xl lg:text-7xl">
                        {slide.title}
                      </h1>
                      <p className="animate-fade-in mt-4 max-w-2xl text-lg md:text-xl">
                        {slide.subtitle}
                      </p>
                      <div className="animate-fade-in mt-8 flex flex-wrap justify-center gap-4">
                        <Button asChild size="lg" className="btn-whatsapp">
                          <a href={generalContent.whatsappLink} target="_blank">
                            Entre em Contato
                          </a>
                        </Button>
                        <Button asChild variant="outline" size="lg" className='bg-transparent border-white text-white hover:bg-white hover:text-primary'>
                          <Link href="/planos">Nossos Serviços</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 text-white" />
          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 text-white" />
        </Carousel>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-background py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-headline text-3xl font-bold md:text-4xl">
            Por Que Escolher o Pet Estrela?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground md:text-lg">
            Oferecemos um serviço completo, com a sensibilidade e o respeito que
            este momento delicado exige.
          </p>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {whyChooseUs.map((item, index) => (
              <div key={index} className="animate-slide-up flex flex-col items-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <item.icon className="h-8 w-8" />
                </div>
                <h3 className="font-headline text-xl font-semibold">
                  {item.title}
                </h3>
                <p className="mt-2 text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="font-headline text-3xl font-bold md:text-4xl">
              Nosso Processo de Cremação
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground md:text-lg">
              Conduzimos cada etapa com máxima transparência, cuidado e
              seriedade.
            </p>
          </div>
          <div className="relative mt-12 grid grid-cols-1 gap-12 md:grid-cols-4">
            <div className="absolute left-0 top-8 hidden w-full border-t-2 border-dashed border-primary/30 md:block" />
            {cremationProcess.map((item, index) => (
              <div key={index} className="animate-slide-up relative flex flex-col items-center text-center md:items-start md:text-left">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary bg-background font-headline text-2xl font-bold text-primary">
                  {item.step}
                </div>
                <h3 className="mt-6 font-headline text-xl font-semibold">
                  {item.title}
                </h3>
                <p className="mt-2 text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Pets Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="animate-fade-in">
              <h2 className="font-headline text-3xl font-bold md:text-4xl">
                Acolhemos Todos os Tipos de Pets
              </h2>
              <p className="mt-4 text-muted-foreground md:text-lg">
                Nosso amor e respeito se estendem a todos os animais, não
                importa a espécie ou o porte. Estamos preparados para oferecer
                uma despedida digna a cada um deles.
              </p>
              <ul className="mt-6 grid grid-cols-2 gap-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary" /> Cães
                </li>
                <li className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary" /> Gatos
                </li>
                <li className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary" /> Aves
                </li>
                <li className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary" /> Roedores
                </li>
                <li className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary" /> Répteis
                </li>
                <li className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary" /> Cavalos
                </li>
              </ul>
              <Button asChild size="lg" className="btn-whatsapp mt-8">
                <a href={generalContent.whatsappLink} target="_blank">
                  Saiba Mais
                </a>
              </Button>
            </div>
            <div className="animate-scale-in relative h-80 w-full overflow-hidden rounded-lg lg:h-96">
              {allPetsImage && (
                <Image
                  src={allPetsImage.imageUrl}
                  alt={allPetsImage.description}
                  data-ai-hint={allPetsImage.imageHint}
                  fill
                  className="object-cover"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-headline text-3xl font-bold md:text-4xl">
            O que Nossos Clientes Dizem
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground md:text-lg">
            O carinho e a gratidão de quem confia em nosso trabalho.
          </p>
          <Carousel
            className="mt-12"
            opts={{ align: 'start', loop: true }}
            autoplayDelay={4000}
          >
            <CarouselContent className="-ml-4">
              {testimonials.map((testimonial) => (
                <CarouselItem
                  key={testimonial.id}
                  className="pl-4 md:basis-1/2 lg:basis-1/3"
                >
                  <Card className="luxury-card hover-lift h-full text-left">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="font-headline text-lg">
                          {testimonial.name}
                        </CardTitle>
                        <div className="flex gap-1 text-accent">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-current" />
                          ))}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        "{testimonial.text}"
                      </p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-[-50px] hidden sm:flex" />
            <CarouselNext className="right-[-50px] hidden sm:flex" />
          </Carousel>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="animate-fade-in">
              <h2 className="font-headline text-3xl font-bold md:text-4xl">
                Nossa Localização
              </h2>
              <p className="mt-4 text-muted-foreground md:text-lg">
                Estamos localizados em Arujá-SP, com fácil acesso para toda a
                região. Venha nos visitar ou entre em contato.
              </p>
              <div className="mt-6 space-y-4 text-muted-foreground">
                <p>
                  <strong>Endereço:</strong> {generalContent.address || 'Av. Adília Barbosa Neves, 2740, Centro Industrial, Arujá - SP, CEP: 07432-575'}
                </p>
                <p>
                  <strong>Telefone:</strong> {generalContent.phone || '(11) 4240-5253'}
                </p>
                <p>
                  <strong>WhatsApp:</strong> {generalContent.whatsappNumber || '11942405253'}
                </p>
              </div>
              <Button asChild size="lg" className="btn-whatsapp mt-8">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(generalContent.address || 'Av. Adília Barbosa Neves, 2740, Arujá - SP')}`}
                  target="_blank"
                >
                  Abrir no Maps
                </a>
              </Button>
            </div>
            <div className="animate-scale-in h-80 w-full overflow-hidden rounded-lg lg:h-96">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3661.127539077035!2d-46.34005268449339!3d-23.4194009623838!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce7b1a5a8f4b0f%3A0x8d5c4b1a4f0b3e6c!2sAv.%20Ad%C3%ADlia%20Barbosa%20Neves%2C%202740%20-%20Centro%20Industrial%2C%20Aruj%C3%A1%20-%20SP%2C%2007432-575!5e0!3m2!1spt-BR!2sbr!4v1689182649033!5m2!1spt-BR!2sbr"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização do Pet Estrela Crematório"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

    