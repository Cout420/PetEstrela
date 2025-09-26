'use client';

import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from './ui/button';

const WhatsAppButton = () => {
    const [whatsappLink, setWhatsappLink] = useState('https://wa.me/5511942405253');

    useEffect(() => {
        const storedContent = localStorage.getItem('generalContent');
        if (storedContent) {
            const content = JSON.parse(storedContent);
            setWhatsappLink(content.whatsappLink || 'https://wa.me/5511942405253');
        }
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

    