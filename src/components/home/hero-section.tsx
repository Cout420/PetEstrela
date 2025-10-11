
"use client";

import Image from "next/image";
import Link from "next/link";
import * as React from 'react';

import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const staticSlides = [
    {
        imageUrl: "https://i.imgur.com/Ltdo1Ig.jpeg",
        alt: "Paisagem memorial com árvores e um lago",
        title: "Homenagens que eternizam o amor",
        subtitle: "Cuidado, respeito e carinho na despedida do seu melhor amigo."
    },
    {
        imageUrl: "https://i.imgur.com/7znGZLG.jpeg",
        alt: "Mulher abraçando um cão",
        title: "O amor que fica em cada lembrança",
        subtitle: "Celebre a vida e a jornada do seu companheiro fiel."
    },
    {
        imageUrl: "https://i.imgur.com/myUehDy.png",
        alt: "Mão plantando uma pequena árvore",
        title: "Transformando a saudade em vida",
        subtitle: "Plante uma árvore e crie um memorial vivo para o seu pet."
    }
];

const whatsappUrl = "https://wa.me/551142405253?text=Olá!%20Tudo%20bem?%20Gostaria%20de%20ser%20atendido%20e%20saber%20mais";


export function HeroSection() {
     const plugin = React.useRef(
        Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })
    );

    return (
        <section className="relative h-[calc(100vh-80px)] min-h-[600px] w-full text-white">
            <Carousel 
                plugins={[plugin.current]}
                className="w-full h-full"
                onMouseEnter={plugin.current.stop}
                onMouseLeave={plugin.current.reset}
            >
                <CarouselContent>
                    {staticSlides.map((slide, index) => (
                        <CarouselItem key={index}>
                             <div className="relative w-full h-[calc(100vh-80px)] min-h-[600px]">
                                <Image
                                    src={slide.imageUrl}
                                    alt={slide.alt}
                                    fill
                                    className="object-cover"
                                    priority={index === 0}
                                />
                                <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-center p-4">
                                    <div className="max-w-4xl animate-fade-up">
                                        <h1 className="font-headline text-4xl md:text-7xl font-bold drop-shadow-md">
                                            {slide.title}
                                        </h1>
                                        <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto drop-shadow-sm">
                                            {slide.subtitle}
                                        </p>
                                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                                            <Button asChild size="lg">
                                                <Link href="/planos">Nossos Planos</Link>
                                            </Button>
                                            <Button asChild size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary">
                                                <Link href={whatsappUrl} target="_blank">
                                                    Fale Conosco
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 border-white/50 h-10 w-10" />
                <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 border-white/50 h-10 w-10" />
            </Carousel>
        </section>
    );
}
