'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

const plans = [
  {
    name: 'Essência',
    price: 'A partir de R$280',
    description: 'A despedida essencial, com dignidade e respeito.',
    features: [
      'Cremação coletiva',
      'Certificado de cremação digital',
      'Atendimento 24 horas',
      'Remoção do animal',
    ],
    pricingDetails: [
        '🐱 Gatos – R$ 280,00',
        '🐶 Cães – R$ 450,00',
    ],
    optional: 'Opcional: Plantio de árvore em memorial (+R$ 98,00)',
    isMostChosen: false,
  },
  {
    name: 'Harmonia',
    price: 'R$ 960,00',
    description: 'A homenagem mais completa, com lembranças especiais.',
    features: [
      'Cremação coletiva em compartimento separado',
      'Porta-retrato com a foto do pet',
      'Quadro com a impressão da patinha',
      'Plantio de árvore com QR Code do memorial',
      'Urna padrão para cinzas',
      'Certificado de cremação impresso',
    ],
    isMostChosen: true,
  },
  {
    name: 'Eternus',
    price: 'R$ 1.190,00',
    description: 'A celebração da vida, com cerimônia e homenagens.',
    features: [
      'Todos os itens do Plano Harmonia',
      'Urna biodegradável ou plantio',
      'Cartinha de despedida personalizada',
      'Preparação especial para velório (opcional)',
      'Acesso a sala de velório',
    ],
    isMostChosen: false,
  },
];

export default function PlansPage() {
    const [whatsappLink, setWhatsappLink] = useState('https://wa.me/5511942405253?text=${encodeURIComponent(\'Olá! Gostaria de mais informações sobre os planos de cremação.\')}');
     const [specialistWhatsappLink, setSpecialistWhatsappLink] = useState('https://wa.me/5511942405253?text=${encodeURIComponent(\'Olá! Gostaria de falar com um especialista sobre os planos.\')}');


    useEffect(() => {
        const storedContent = localStorage.getItem('generalContent');
        if (storedContent) {
            const content = JSON.parse(storedContent);
            setWhatsappLink(`${content.whatsappLink}?text=${encodeURIComponent('Olá! Gostaria de mais informações sobre os planos de cremação.')}`);
            setSpecialistWhatsappLink(`${content.whatsappLink}?text=${encodeURIComponent('Olá! Gostaria de falar com um especialista sobre os planos.')}`);
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

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3 lg:items-start">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`luxury-card hover-lift animate-slide-up flex flex-col ${plan.isMostChosen ? 'border-2 border-accent shadow-luxury' : ''} ${index === 1 ? 'lg:-translate-y-4' : ''}`}
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

    