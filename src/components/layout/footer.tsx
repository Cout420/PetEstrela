
import Link from 'next/link';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from './logo';

const whatsappUrl = "https://wa.me/551142405253?text=Olá!%20Tudo%20bem?%20Gostaria%20de%20ser%20atendido%20e%20saber%20mais";

export function Footer() {
  const instagramUrl = "https://www.instagram.com/petestrelacrematorio/";
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto max-w-7xl px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo and Description */}
          <div className="md:col-span-1 flex flex-col items-start gap-4">
            <Logo />
            <p className="text-sm text-muted-foreground">
              Uma despedida digna e cheia de amor para quem te deu tudo.
            </p>
          </div>

          {/* Navigation */}
          <div className="md:col-span-1">
            <h3 className="font-semibold text-foreground mb-4">Navegação</h3>
            <nav className="flex flex-col gap-3 text-sm">
              <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link>
              <Link href="/memorial" className="text-muted-foreground hover:text-primary transition-colors">Memorial</Link>
              <Link href="/sobre" className="text-muted-foreground hover:text-primary transition-colors">Sobre Nós</Link>
              <Link href="/espaco" className="text-muted-foreground hover:text-primary transition-colors">Nosso Espaço</Link>
              <Link href="/planos" className="text-muted-foreground hover:text-primary transition-colors">Planos</Link>
              <Link href="/contato" className="text-muted-foreground hover:text-primary transition-colors">Contato</Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="md:col-span-1">
            <h3 className="font-semibold text-foreground mb-4">Contato</h3>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <p>Telefone: (11) 4240-5253</p>
              <p>Email: crematorioestrela@gmail.com</p>
              <p>Endereço: Av. Adília Barbosa Neves, 2740 - Centro Industrial, Arujá - SP, 07432-575</p>
            </div>
          </div>
          
          {/* Social Media */}
          <div className="md:col-span-1">
             <h3 className="font-semibold text-foreground mb-4">Redes Sociais</h3>
             <div className="flex items-center gap-4">
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Facebook size={20} /></a>
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Instagram size={20} /></a>
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Twitter size={20} /></a>
            </div>
          </div>
        </div>
        
        <div className="mt-16 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Pet Estrela Crematório. Todos os direitos reservados.</p>
        </div>
      </div>

       <Button asChild className="fixed bottom-5 right-5 z-50 rounded-full w-16 h-16 bg-green-500 hover:bg-green-600 shadow-lg">
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Fale conosco no WhatsApp">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.57 6.57 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.1-.836-.414-1.15-.484s-.544-.1-.781.1-.53.53-.65.65-.24.15-.443.05a4.842 4.842 0 0 1-1.475-.919 5.02 5.02 0 0 1-1.017-1.256s-.398-.523-.34-1.017c.057-.494.34-1.18.435-1.428.095-.248.047-.463-.05-.563-.098-.1-.24-.15-.338-.15s-.24.023-.36.148c-.12.125-.463.538-.59.687-.128.15-.256.168-.384.117-.128-.05-.544-.21-.996-.65-.452-.44-.75-.98-.865-1.14-.115-.16-.24-.267-.112-.51.125-.24.28-.412.425-.54.145-.128.192-.21.288-.354.095-.143.047-.28-.005-.38C8.58 3.29 8.337 2.8 8.187 2.55c-.15-.25-.3-.267-.446-.275h-.187c-.15 0-.398.047-.6.292-.202.245-.78.765-.78 1.845s.8 2.135.914 2.28c.115.148.24.168.312.267.1.124.36.463.805.836.446.373.716.53.88.625.164.096.3.15.412.192.112.043.24.015.345-.047.116-.067.463-.24.53-.465.065-.225.047-.414-.025-.465s-.167-.175-.24-.225c-.072-.05-.14-.05-.21-.023-.07.028-.15.075-.225.125-.075.05-.15.075-.225.024s-.225-.268-.3-.34c-.075-.072-.15-.168-.15-.24 0-.072.024-.144.072-.192s.12-.072.167-.047c.048.023.1.07.15.118s.072.07.12.023c.048-.047.072-.095.12-.143s.095-.118.167-.072c.072.047.168.168.192.218.024.05.048.21.072.338s.024.267.048.29c.024.025.048.025.072.025s.267-.023.36-.07c.1-.048.17-.118.267-.218s.167-.168.217-.267c.05-.1.075-.19.125-.24.05-.05.1-.075.15-.075s.125.023.175.047c.05.023.075.047.1.094s.05.118.025.192c-.024.072-.05.12-.1.168-.05.048-.1.072-.1.12s.024.07.07.12c.048.05.095.05.143.023s.217-.095.267-.12c" />
            </svg>
        </a>
      </Button>
    </footer>
  );
}

    