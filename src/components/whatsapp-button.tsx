import { MessageCircle } from 'lucide-react';
import { Button } from './ui/button';

const WhatsAppButton = () => {
    const whatsappLink = `https://wa.me/5511942405253?text=${encodeURIComponent(
        'Olá! Gostaria de mais informações sobre os serviços do Pet Estrela Crematório.'
    )}`;

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
