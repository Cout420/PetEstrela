'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Logo from '../logo';
import { Button } from '../ui/button';
import { Instagram } from 'lucide-react';

type GeneralContent = {
  whatsappNumber: string;
  whatsappLink: string;
  phone: string;
  address: string;
  instagramLink: string;
};

const Footer = () => {
  const [content, setContent] = useState<GeneralContent | null>(null);

  useEffect(() => {
    const storedContent = localStorage.getItem('generalContent');
    if (storedContent) {
      setContent(JSON.parse(storedContent));
    } else {
      setContent({
        whatsappNumber: '11942405253',
        whatsappLink: 'https://wa.me/5511942405253',
        phone: '(11) 4240-5253',
        address: 'Av. Adília Barbosa Neves, 2740, Centro Industrial, Arujá - SP, CEP: 07432-575',
        instagramLink: 'https://www.instagram.com/petestrelacrematorio/',
      });
    }
  }, []);

  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground">
              Despedidas dignas, memórias eternas. Cuidando do seu melhor amigo
              até o fim.
            </p>
          </div>

          <div>
            <h3 className="font-headline text-lg font-semibold">Navegação</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/" className="text-muted-foreground hover:text-foreground">Home</Link></li>
              <li><Link href="/memorial" className="text-muted-foreground hover:text-foreground">Memorial</Link></li>
              <li><Link href="/sobre" className="text-muted-foreground hover:text-foreground">Sobre Nós</Link></li>
              <li><Link href="/nosso-espaco" className="text-muted-foreground hover:text-foreground">Nosso Espaço</Link></li>
              <li><Link href="/planos" className="text-muted-foreground hover:text-foreground">Planos</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-headline text-lg font-semibold">Serviços</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/planos" className="text-muted-foreground hover:text-foreground">Plano Essência</Link></li>
              <li><Link href="/planos" className="text-muted-foreground hover:text-foreground">Plano Harmonia</Link></li>
              <li><Link href="/planos" className="text-muted-foreground hover:text-foreground">Plano Eternus</Link></li>
              <li><Link href="/memorial" className="text-muted-foreground hover:text-foreground">Memorial Digital</Link></li>
            </ul>
          </div>

          {content && (
            <div>
              <h3 className="font-headline text-lg font-semibold">Contato</h3>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <p>{content.address}</p>
                <p>Telefone: {content.phone}</p>
                <p>WhatsApp: {content.whatsappNumber}</p>
              </div>
              <div className="mt-4 flex items-center gap-4">
               <Button asChild className="btn-whatsapp">
                  <a href={content.whatsappLink} target="_blank">
                      Fale Conosco
                  </a>
              </Button>
               <a href={content.instagramLink} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <Instagram className="h-6 w-6 text-muted-foreground transition-colors hover:text-primary" />
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Pet Estrela Crematório. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
