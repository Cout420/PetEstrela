
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, HandHeart, Wind, Box } from 'lucide-react';
import { ReactElement } from "react";

const steps: { number: string; title: string; description: string; icon: ReactElement }[] = [
    {
        number: "01",
        title: "Coleta do Animal",
        description: "Realizamos a remoção do seu pet em sua residência ou clínica veterinária com veículos adaptados.",
        icon: <Truck className="w-10 h-10 text-primary" />
    },
    {
        number: "02",
        title: "Preparação",
        description: "O corpo do seu amigo é preparado com todo o respeito e cuidado para a cerimônia de despedida.",
        icon: <HandHeart className="w-10 h-10 text-primary" />
    },
    {
        number: "03",
        title: "Cremação",
        description: "O processo de cremação é realizado de forma individual ou coletiva, seguindo sua escolha.",
        icon: <Wind className="w-10 h-10 text-primary" />
    },
    {
        number: "04",
        title: "Entrega das Cinzas",
        description: "As cinzas são entregues em uma urna de sua preferência, junto com um certificado.",
        icon: <Box className="w-10 h-10 text-primary" />
    }
];

export function ProcessSteps() {
    return (
        <section className="py-20 lg:py-28 bg-white">
            <div className="container mx-auto max-w-7xl px-4">
                <div className="text-center mb-16">
                    <h2 className="font-headline text-4xl font-bold text-primary">Nosso Processo de Cremação</h2>
                    <p className="mt-4 text-lg text-foreground/80 max-w-3xl mx-auto">
                        Conduzimos cada etapa com máxima transparência, cuidado e seriedade.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <Card 
                            key={index} 
                            className="group relative text-center border-2 border-transparent hover:border-primary/20 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-in-out"
                        >
                            <CardHeader className="items-center">
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white px-4">
                                     <div className="bg-primary/10 p-5 rounded-full transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                                        {step.icon}
                                    </div>
                                </div>
                                <CardTitle className="font-headline text-2xl text-primary pt-10">{step.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-base min-h-[70px]">
                                    {step.description}
                                </CardDescription>
                            </CardContent>
                             <div className="absolute -bottom-4 -right-4 font-headline text-6xl font-bold text-primary/10 transition-transform duration-300 group-hover:scale-125">
                                {step.number}
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
    
