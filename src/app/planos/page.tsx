'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { plans as initialPlansData } from '@/lib/mock-data';

type Plan = {
  name: string;
  price: string;
  description: string;
  features: string[];
  pricingDetails?: string[];
  optional?: string;
  isMostChosen: boolean;
};

type PlansPageContent = {
  plans: Plan[];
};

export default function PlansPage() {
    const [content, setContent] = useState<PlansPageContent>({ plans: initialPlansData });
    const [whatsappLink, setWhatsappLink] = useState('');
    const [specialistWhatsappLink, setSpecialistWhatsappLink] = useState('');


    useEffect(() => {
        const storedPlansContent = localStorage.getItem('plansPageContent');
        if (storedPlansContent) {
            setContent(JSON.parse(storedPlansContent));
        }

        const storedGeneralContent = localStorage.getItem('generalContent');
        if (storedGeneralContent) {
            const general = JSON.parse(storedGeneralContent);
            setWhatsappLink(`${general.whatsappLink}?text=${encodeURIComponent('Olá! Gostaria de mais informações sobre os planos de cremação.')}`);
            setSpecialistWhatsappLink(`${general.whatsappLink}?text=${encodeURIComponent('Olá! Gostaria de falar com um especialista sobre os planos.')}`);
        } else {
            const defaultLink = 'https://wa.me/551142405253';
            setWhatsappLink(`${defaultLink}?text=${encodeURIComponent('Olá! Gostaria de mais informações sobre os planos de cremação.')}`);
            setSpecialistWhatsappLink(`${defaultLink}?text=${encodeURIComponent('Olá! Gostaria de falar com um especialista sobre os planos.')}`);
        }
    }, []);

  return (
    <div className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="animate-fade-in text-center">
          <h1 className="font-headline text-4xl font-bold text-primary md:text-5xl">
            Nossos Planos
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Encontre a opção que melhor se adapta às suas necessidades e
            desejos para uma despedida memorável.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:items-stretch">
          {content.plans.map((plan, index) => (
            <Card
              key={index}
              className={`luxury-card hover-lift animate-slide-up flex flex-col ${plan.isMostChosen ? 'border-2 border-accent shadow-luxury' : ''}`}
            >
                {plan.isMostChosen && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground">Mais Escolhido</Badge>
                )}
              <CardHeader className="text-center">
                <CardTitle className="font-headline text-3xl">{plan.name}</CardTitle>
                <CardDescription className="pt-2">{plan.description}</CardDescription>
                <p className="pt-4 text-4xl font-bold text-primary">{plan.price}</p>
                 {plan.pricingDetails && (
                    <div className="pt-2 text-sm text-muted-foreground">
                        {plan.pricingDetails.map((detail, i) => (
                            <p key={i}>{detail}</p>
                        ))}
                    </div>
                )}
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-green-500" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                {plan.optional && (
                    <p className="mt-4 text-center text-sm text-muted-foreground">{plan.optional}</p>
                )}
              </CardContent>
              <CardFooter>
                <Button asChild className="btn-whatsapp w-full">
                  <a href={whatsappLink} target='_blank'>Contratar Plano</a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-24 text-center">
            <h2 className="font-headline text-3xl font-bold">Ainda com dúvidas?</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground md:text-lg">Nossa equipe de especialistas está pronta para te ajudar a escolher o melhor plano e a personalizar a despedida do seu amigo.</p>
            <Button asChild size="lg" className="btn-whatsapp mt-8">
                <a href={specialistWhatsappLink} target='_blank'>Contate um Especialista</a>
            </Button>
        </div>

      </div>
    </div>
  );
}
