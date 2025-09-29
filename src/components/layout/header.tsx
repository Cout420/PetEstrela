
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/logo';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { getContent } from '@/lib/firebase-service';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/memorial', label: 'Memorial' },
  { href: '/sobre', label: 'Sobre Nós' },
  { href: '/nosso-espaco', label: 'Nosso Espaço' },
  { href: '/planos', label: 'Planos' },
];

const Header = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState('https://wa.me/551142405253');

  useEffect(() => {
    const fetchContent = async () => {
      const content = await getContent<{whatsappLink: string}>('generalContent');
       if (content?.whatsappLink) {
        setWhatsappLink(content.whatsappLink);
      }
    }
    fetchContent();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Logo />

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
                pathname === link.href && 'font-semibold text-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild className="btn-whatsapp">
            <a href={whatsappLink} target="_blank">
              Contato
            </a>
          </Button>
           <Button asChild variant="outline" size="icon">
              <Link href="/login" aria-label="Painel do Administrador">
                <LogIn className="h-4 w-4" />
              </Link>
            </Button>
        </div>

        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80%]">
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b pb-4">
                  <Logo />
                </div>
                <nav className="mt-8 flex flex-col gap-6">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'text-lg font-medium text-muted-foreground transition-colors hover:text-foreground',
                        pathname === link.href && 'font-semibold text-foreground'
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                   <Link
                      href="/login"
                      className='text-lg font-medium text-muted-foreground transition-colors hover:text-foreground'
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Admin
                    </Link>
                </nav>
                <div className="mt-auto">
                   <Button asChild className="btn-whatsapp w-full">
                    <a href={whatsappLink} target="_blank">
                      Fale Conosco
                    </a>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;

    