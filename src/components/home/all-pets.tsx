
"use client";

import Image from "next/image";
import Link from "next/link";
import { PawPrint, Bird, Turtle, Rabbit, Cat } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card } from "@/components/ui/card";

const HorseIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        {...props}
    >
        <path d="M3.5 21h17" />
        <path d="M5.5 21v-3.5" />
        <path d="M6.5 12.5c0-2 1.5-4 4-4s4 2 4 4" />
        <path d="M18 12.5c0-5-3-8.5-7-8.5-3.5 0-5.5 1.5-7 4" />
        <path d="M14.5 17.5c-1.5 0-2.5-1-2.5-2.5s1-2.5 2.5-2.5" />
        <path d="M19.5 21v-3.5" />
    </svg>
);

const whatsappUrl = "https://wa.me/551142405253?text=Olá!%20Tudo%20bem?%20Gostaria%20de%20ser%20atendido%20e%20saber%20mais";


const petTypes = [
    { name: "Cães", icon: <PawPrint className="w-8 h-8 text-primary" /> },
    { name: "Gatos", icon: <Cat className="w-8 h-8 text-primary" /> },
    { name: "Aves", icon: <Bird className="w-8 h-8 text-primary" /> },
    { name: "Roedores", icon: <Rabbit className="w-8 h-8 text-primary" /> },
    { name: "Répteis", icon: <Turtle className="w-8 h-8 text-primary" /> },
    { name: "Cavalos", icon: <HorseIcon className="w-8 h-8 text-primary" /> },
];

export function AllPets() {
    const image = PlaceHolderImages.find(p => p.id === 'all-pets-image');

    return (
        <section className="py-20 lg:py-28 bg-background">
            <div className="container mx-auto max-w-7xl px-4">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="order-2 md:order-1">
                        <h2 className="font-headline text-4xl font-bold text-primary mb-6">
                            Acolhemos Todos os Tipos de Pets
                        </h2>
                        <p className="text-lg text-foreground/80 mb-8">
                            Nosso amor e respeito se estendem a todos os animais, não importa a espécie ou o porte. Estamos preparados para oferecer uma despedida digna a cada um deles.
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                            {petTypes.map((pet) => (
                                <div key={pet.name} className="perspective group">
                                     <Card className="relative aspect-square flex flex-col items-center justify-center p-4 text-center bg-white shadow-lg rounded-lg transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                                        {/* Front */}
                                        <div className="[backface-visibility:hidden] w-full h-full flex flex-col items-center justify-center">
                                            <div className="bg-primary/10 p-4 rounded-full mb-3 transition-colors">
                                                {pet.icon}
                                            </div>
                                            <span className="font-semibold text-foreground">{pet.name}</span>
                                        </div>
                                        {/* Back */}
                                        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-primary text-primary-foreground rounded-lg p-4 [transform:rotateY(180deg)] [backface-visibility:hidden]">
                                             <p className="text-sm font-semibold">Atendimento especializado para {pet.name.toLowerCase()}</p>
                                        </div>
                                    </Card>
                                </div>
                            ))}
                        </div>
                         <div className="flex justify-end">
                            <Button asChild size="lg" className="mt-8">
                                <Link href={whatsappUrl} target="_blank">
                                    Saiba Mais
                                </Link>
                            </Button>
                        </div>
                    </div>
                    <div className="order-1 md:order-2 perspective group">
                        <Card className="overflow-hidden rounded-lg shadow-2xl transition-transform duration-500 ease-in-out group-hover:[transform:rotateY(10deg)_rotateX(2deg)] [transform-style:preserve-3d]">
                             {image &&
                                <Image
                                    src={image.imageUrl}
                                    alt="Grupo de animais de estimação"
                                    data-ai-hint={image.imageHint}
                                    width={600}
                                    height={600}
                                    className="object-cover w-full h-full aspect-square"
                                />
                             }
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    );
}
    
