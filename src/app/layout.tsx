
import type {Metadata} from 'next';
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import './globals.css';
import { FirebaseProvider } from '@/firebase/client-provider';


export const metadata: Metadata = {
  title: 'Pet Estrela Crematório',
  description: 'Instalações modernas e seguras para cuidar do seu companheiro.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
          <FirebaseProvider>
            <Header />
            <main>
              {children}
            </main>
            <Footer />
            <Toaster />
          </FirebaseProvider>
      </body>
    </html>
  );
}
