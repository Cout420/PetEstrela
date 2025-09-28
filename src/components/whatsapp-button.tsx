'use client';

import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { getContent } from '@/lib/firebase-service';

const WhatsAppButton = () => {
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
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50"
      aria-label="Fale conosco pelo WhatsApp"
    >
      <Button
        size="icon"
        className="h-14 w-14 rounded-full bg-green-500 shadow-lg transition-transform duration-300 hover:bg-green-600 hover:scale-110"
      >
        <MessageCircle className="h-7 w-7 text-white" />
      </Button>
    </a>
  );
};

export default WhatsAppButton;
