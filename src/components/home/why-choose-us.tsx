
"use client";

import { Clock, ShieldCheck, Heart, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
    {
        icon: <Clock className="w-8 h-8 text-primary" />,
        title: "Agilidade",
        description: "Processo rápido e respeitoso para sua maior tranquilidade.",
    },
    {
        icon: <ShieldCheck className="w-8 h-8 text-primary" />,
        title: "Atendimento 24h",
        description: "Nossa equipe está disponível a qualquer hora do dia.",
    },
    {
        icon: <Heart className="w-8 h-8 text-primary" />,
        title: "Preço Acessível",
        description: "Planos que se ajustam às suas necessidades e orçamento.",
    },
    {
        icon: <Users className="w-8 h-8 text-primary" />,
        title: "Cuidado Especial",
        description: "Tratamos todos os pets com amor.",
    }
];

export function WhyChooseUs() {
    return (
        <section className="py-20 lg:py-28 bg-white">
            <div className="container mx-auto max-w-7xl px-4">
                <div className="text-center mb-12">
                    <h2 className="font-headline text-4xl font-bold text-primary">Por Que Escolher o Pet Estrela?</h2>
                    <p className="mt-4 text-lg text-foreground/80 max-w-2xl mx-auto">
                        Oferecemos um serviço completo, com a sensibilidade e o respeito que este momento delicado exige.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <Card key={index} className="text-center shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-background/50">
                            <CardHeader className="items-center">
                                <div className="bg-primary/10 p-4 rounded-full">
                                    {feature.icon}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardTitle className="font-headline text-xl mb-2">{feature.title}</CardTitle>
                                <p className="text-muted-foreground text-sm">{feature.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
    
