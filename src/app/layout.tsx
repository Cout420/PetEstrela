import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import WhatsAppButton from '@/components/whatsapp-button';

export const metadata: Metadata = {
  title: 'Pet Estrela Crematório - Despedida Digna para seu Amigo',
  description:
    'Honramos a memória do seu pet com dignidade, respeito e carinho. Conheça nossos planos de cremação e memoriais.',
  keywords: 'crematório de pets, cremação de animais, memorial pet, despedida pet',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased'
        )}
      >
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
        <Toaster />
      </body>
    </html>
  );
}
